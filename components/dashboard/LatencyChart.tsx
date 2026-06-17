"use client"

import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import type { LatencyPoint } from "@/lib/types"

interface LatencyChartProps {
  data: LatencyPoint[]
}

const MARGIN = { top: 20, right: 32, bottom: 44, left: 56 }

export function LatencyChart({ data }: LatencyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const uid = React.useId()
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

    // Gradient defs
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

    // Area fills
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

    // p50 — solid
    root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-1)")
      .attr("stroke-width", 1.75)
      .attr("d", lineP50)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)

    // p95 — dashed
    root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-3)")
      .attr("stroke-width", 1.75)
      .attr("stroke-dasharray", "5,3")
      .attr("d", lineP95)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)

    // Data dots — subtle, semi-transparent
    root
      .selectAll(".dot-p50")
      .data(data)
      .join("circle")
      .attr("class", "dot-p50")
      .attr("cx", (d) => xScale(new Date(d.bucket)))
      .attr("cy", (d) => yScale(d.p50))
      .attr("r", 2)
      .attr("fill", "var(--chart-1)")
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
      .attr("opacity", 0.35)

    // Guide Line
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
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .style("display", "none")

    const p95Focus = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--chart-3)")
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .style("display", "none")

    // Invisible mouse event listener overlay
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
      {/* Legend */}
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded" style={{ background: "var(--chart-1)" }} />
          <span className="text-[11px] text-black/40 dark:text-white/40">p50</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width={20} height={2}>
            <line x1={0} y1={1} x2={20} y2={1} stroke="var(--chart-3)" strokeWidth={1.5} strokeDasharray="4,3" />
          </svg>
          <span className="text-[11px] text-black/40 dark:text-white/40">p95</span>
        </div>
      </div>
      <div ref={wrapperRef} className="relative w-full">
        <svg ref={svgRef} style={{ overflow: "visible", width: "100%" }} />
        {hovered && (
          <div
            className="absolute z-50 pointer-events-none rounded-lg border border-[--border-subtle] p-2.5 shadow-xl backdrop-blur-md text-[11px] flex flex-col gap-1.5 transition-all duration-75 ease-out"
            style={{
              left: tooltipPos.x > (wrapperRef.current?.clientWidth ?? 480) * 0.6 ? tooltipPos.x - 170 : tooltipPos.x + 12,
              top: tooltipPos.y - 32,
              transform: "translateY(-50%)",
              background: "color-mix(in oklch, var(--surface-2) 90%, transparent)",
            }}
          >
            <span className="font-semibold text-[--text-secondary]" style={{ fontFamily: "var(--font-paper)" }}>
              {new Date(hovered.bucket).toLocaleDateString()} {new Date(hovered.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[--text-tertiary]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[--chart-1]" />
                  p50
                </span>
                <span className="font-mono font-medium text-[--text-primary]">{hovered.p50.toFixed(0)}ms</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[--text-tertiary]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[--chart-3]" />
                  p95
                </span>
                <span className="font-mono font-medium text-[--text-primary]">{hovered.p95.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
