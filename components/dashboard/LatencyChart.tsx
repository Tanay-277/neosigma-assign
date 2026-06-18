"use client"

import { useRef, useEffect, useState, useId } from "react"
import * as d3 from "d3"
import type { LatencyPoint } from "@/lib/types"

interface LatencyChartProps {
  data: LatencyPoint[]
}

const MARGIN = { top: 20, right: 32, bottom: 44, left: 56 }

export function LatencyChart({ data }: LatencyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  const [hovered, setHovered] = useState<LatencyPoint | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const svg = svgRef.current
    if (!svg || !wrapper) return

    const width = wrapper.clientWidth || 560
    const height = 220
    const innerW = width - MARGIN.left - MARGIN.right
    const innerH = height - MARGIN.top - MARGIN.bottom

    d3.select(svg).selectAll("*").remove()

    const defs = d3.select(svg).append("defs")
    ;["p50", "p95"].forEach((key) => {
      const grad = defs.append("linearGradient").attr("id", `latency-area-${uid}-${key}`).attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1")
      grad.append("stop").attr("offset", "0%").attr("stop-color", `var(--chart-${key === "p50" ? 1 : 3})`).attr("stop-opacity", 0.12)
      grad.append("stop").attr("offset", "100%").attr("stop-color", `var(--chart-${key === "p50" ? 1 : 3})`).attr("stop-opacity", 0.02)
    })

    const root = d3
      .select(svg)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

    if (data.length === 0) {
      root
        .append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 12)
        .attr("font-family", "var(--font-paper)")
        .text("No latency data in this window")
      return
    }

    const dates = data.map((d) => new Date(d.bucket))
    const maxMs = d3.max(data, (d) => Math.max(d.p50, d.p95)) ?? 100

    const xScale = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, innerW])
    const yScale = d3.scaleLinear().domain([0, maxMs * 1.1]).nice().range([innerH, 0])

    // Grid lines
    root
      .append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .join("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,4")

    // X axis
    root
      .append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat((d) => d3.timeFormat("%b %d %H:%M")(d as Date))
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll("text")
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", 10)
          .attr("font-family", "var(--font-paper)")
          .attr("dy", "1em")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "var(--border-subtle)"))

    // Y axis
    root
      .append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => `${d}ms`)
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll("text")
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", 10)
          .attr("font-family", "var(--font-paper)")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // Area generators
    const areaP50 = d3.area<LatencyPoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0(innerH)
      .y1((d) => yScale(d.p50))
      .curve(d3.curveMonotoneX)

    const areaP95 = d3.area<LatencyPoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0(innerH)
      .y1((d) => yScale(d.p95))
      .curve(d3.curveMonotoneX)

    root.append("path").datum(data).attr("fill", `url(#latency-area-${uid}-p50)`).attr("d", areaP50)
    root.append("path").datum(data).attr("fill", `url(#latency-area-${uid}-p95)`).attr("d", areaP95)

    const lineP50 = d3
      .line<LatencyPoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y((d) => yScale(d.p50))
      .curve(d3.curveMonotoneX)

    const lineP95 = d3
      .line<LatencyPoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y((d) => yScale(d.p95))
      .curve(d3.curveMonotoneX)

    // p50 — solid with draw animation
    const pathP50 = root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-1)")
      .attr("stroke-width", 1.75)
      .attr("d", lineP50)

    const p50Node = pathP50.node() as SVGPathElement | null
    if (p50Node) {
      const len = p50Node.getTotalLength()
      pathP50
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
    }

    // p95 — dashed with draw animation
    const pathP95 = root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-3)")
      .attr("stroke-width", 1.75)
      .attr("d", lineP95)

    const p95Node = pathP95.node() as SVGPathElement | null
    if (p95Node) {
      const len = p95Node.getTotalLength()
      pathP95
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
        .on("end", function () {
          d3.select(this).attr("stroke-dasharray", "5,3")
        })
    }

    // Data dots — subtle, fade in after lines
    root
      .selectAll(".dot-p50")
      .data(data)
      .join("circle")
      .attr("class", "dot-p50")
      .attr("cx", (d) => xScale(new Date(d.bucket)))
      .attr("cy", (d) => yScale(d.p50))
      .attr("r", 2)
      .attr("fill", "var(--chart-1)")
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(300)
      .attr("opacity", 0.45)

    root
      .selectAll(".dot-p95")
      .data(data)
      .join("circle")
      .attr("class", "dot-p95")
      .attr("cx", (d) => xScale(new Date(d.bucket)))
      .attr("cy", (d) => yScale(d.p95))
      .attr("r", 2)
      .attr("fill", "var(--chart-3)")
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(300)
      .attr("opacity", 0.35)

    // Guide line and focus dots
    const guideLine = root
      .append("line")
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", innerH)
      .style("display", "none")

    const p50Focus = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--chart-1)")
      .attr("stroke", "var(--surface-1)")
      .attr("stroke-width", 1.5)
      .style("display", "none")

    const p95Focus = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--chart-3)")
      .attr("stroke", "var(--surface-1)")
      .attr("stroke-width", 1.5)
      .style("display", "none")

    // Invisible overlay for mouse tracking
    root
      .append("rect")
      .attr("width", innerW)
      .attr("height", innerH)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event)
        const xDate = xScale.invert(mx)
        const bisect = d3.bisector((d: LatencyPoint) => new Date(d.bucket)).left
        const idx = bisect(data, xDate, 1)
        const d0 = data[idx - 1]
        const d1 = data[idx]
        let closest = d0
        if (d0 && d1) {
          closest =
            xDate.getTime() - new Date(d0.bucket).getTime() >
            new Date(d1.bucket).getTime() - xDate.getTime()
              ? d1
              : d0
        }
        if (closest) {
          const cx = xScale(new Date(closest.bucket))
          guideLine.attr("x1", cx).attr("x2", cx).style("display", null)
          p50Focus.attr("cx", cx).attr("cy", yScale(closest.p50)).style("display", null)
          p95Focus.attr("cx", cx).attr("cy", yScale(closest.p95)).style("display", null)

          setHovered(closest)
          setTooltipPos({
            x: cx + MARGIN.left,
            y: Math.min(yScale(closest.p50), yScale(closest.p95)) + MARGIN.top,
          })
        }
      })
      .on("mouseleave", function () {
        guideLine.style("display", "none")
        p50Focus.style("display", "none")
        p95Focus.style("display", "none")
        setHovered(null)
      })
  }, [data])

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: "var(--chart-1)" }} />
          <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>p50</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width={16} height={2}>
            <line x1={0} y1={1} x2={16} y2={1} stroke="var(--chart-3)" strokeWidth={1.5} strokeDasharray="4,3" />
          </svg>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>p95</span>
        </div>
      </div>
      <div ref={wrapperRef} className="relative w-full">
        <svg ref={svgRef} style={{ overflow: "visible", width: "100%" }} />
        {hovered && (
          <div
            className="absolute z-50 pointer-events-none rounded-md px-2.5 py-1.5 text-[11px] shadow-md"
            style={{
              left: tooltipPos.x > (wrapperRef.current?.clientWidth ?? 480) * 0.6 ? tooltipPos.x - 170 : tooltipPos.x + 12,
              top: tooltipPos.y - 32,
              transform: "translateY(-50%)",
              background: "var(--surface-3)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              {new Date(hovered.bucket).toLocaleDateString()} {new Date(hovered.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                <span className="size-1.5 rounded-full" style={{ background: "var(--chart-1)" }} />
                p50
              </span>
              <span className="font-mono font-medium tabular-nums">{hovered.p50.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                <span className="size-1.5 rounded-full" style={{ background: "var(--chart-3)" }} />
                p95
              </span>
              <span className="font-mono font-medium tabular-nums">{hovered.p95.toFixed(0)}ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
