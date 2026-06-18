"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"

const MARGIN = { top: 20, right: 32, bottom: 44, left: 56 }

interface HistogramBucket {
  lower: number
  upper: number
  count: number
}

interface LatencyHistogramProps {
  data: HistogramBucket[]
  p50: number
  p95: number
}

export function LatencyHistogram({ data, p50, p95 }: LatencyHistogramProps) {
  const svgRef     = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 })
  const [hovered, setHovered] = useState<HistogramBucket | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, isRightAlign: false })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({ width, height: wrapper.clientHeight || 300 })
      }
    })
    resizeObserver.observe(wrapper)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || dimensions.width === 0) return

    const { width, height } = dimensions
    const innerW = width  - MARGIN.left - MARGIN.right
    const innerH = height - MARGIN.top  - MARGIN.bottom

    d3.select(svg).selectAll("*").interrupt().remove()

    const root = d3
      .select(svg)
      .attr("width",  width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

    if (data.length === 0) {
      root.append("text")
        .attr("x", innerW / 2).attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 12)
        .attr("font-family", "var(--font-paper)")
        .text("No latency data in this window")
      return
    }

    const maxCount = d3.max(data, (d) => d.count) ?? 1

    const xScale = d3.scaleLinear()
      .domain([data[0].lower, data[data.length - 1].upper])
      .range([0, innerW])

    const yScale = d3.scaleLinear()
      .domain([0, maxCount * 1.15])
      .nice()
      .range([innerH, 0])

    // ── Grid lines ────────────────────────────────────────────────────────
    root.append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .join("line")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", (d) => yScale(d)).attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,4")

    // ── Bars (per-bar width from xScale) ──────────────────────────────────
    root.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.lower))
      .attr("y", innerH)
      .attr("width", (d) => Math.max(1, xScale(d.upper) - xScale(d.lower) - 1))
      .attr("height", 0)
      .attr("fill", "var(--chart-1)")
      .attr("fill-opacity", 0.55)
      .attr("rx", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d: HistogramBucket) {
        d3.select(this).attr("fill-opacity", 0.85)
        const cx = xScale(d.lower) + (xScale(d.upper) - xScale(d.lower)) / 2
        setHovered(d)
        const tx = cx + MARGIN.left
        setTooltipPos({
          x: tx,
          y: yScale(d.count) + MARGIN.top,
          isRightAlign: tx > width * 0.6,
        })
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill-opacity", 0.55)
        setHovered(null)
      })
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yScale(d.count))
      .attr("height", (d) => innerH - yScale(d.count))

    // ── X axis ────────────────────────────────────────────────────────────
    root.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => `${d}ms`)
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
        .attr("dy", "1em")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // ── Y axis ────────────────────────────────────────────────────────────
    root.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // ── p50 / p95 reference lines + labels ────────────────────────────────
    const p50Clamped = Math.max(data[0].lower, Math.min(data[data.length - 1].upper, p50))
    const p95Clamped = Math.max(data[0].lower, Math.min(data[data.length - 1].upper, p95))

    const p50X = xScale(p50Clamped)
    const p95X = xScale(p95Clamped)

    const makeRefLine = (x: number, color: string) => {
      root.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", 0).attr("y2", innerH)
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4")
        .attr("opacity", 0)
        .transition().duration(600).delay(400).attr("opacity", 0.8)
    }

    makeRefLine(p50X, "var(--chart-1)")
    makeRefLine(p95X, "var(--chart-3)")

    const addLabel = (x: number, text: string, color: string) => {
      const labelY = 8
      const g = root.append("g").attr("opacity", 0)
      const label = g.append("text")
        .attr("x", x)
        .attr("y", labelY)
        .attr("dy", "0.75em")
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", 9)
        .attr("font-family", "var(--font-paper)")
        .attr("font-weight", 700)
        .text(text)
      const bbox = (label.node() as SVGTextElement | null)?.getBBox()
      if (bbox) {
        g.insert("rect", ":first-child")
          .attr("x", bbox.x - 6)
          .attr("y", bbox.y - 2)
          .attr("width", bbox.width + 12)
          .attr("height", bbox.height + 4)
          .attr("rx", 4)
          .attr("fill", "var(--surface-2)")
          .attr("fill-opacity", 0.85)
      }
      g.transition().duration(600).delay(600).attr("opacity", 1)
    }

    addLabel(p50X, `p50  ${p50Clamped}ms`, "var(--chart-1)")
    addLabel(p95X, `p95  ${p95Clamped}ms`, "var(--chart-3)")

  }, [data, p50, p95, dimensions])

  return (
    <div ref={wrapperRef} className="relative w-full h-[260px] sm:h-[300px]">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />

      {hovered && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg p-2.5 shadow-xl text-[11px] flex flex-col gap-1.5 transition-all duration-75 ease-out"
          style={{
            left: tooltipPos.isRightAlign
              ? tooltipPos.x - 160
              : tooltipPos.x + 12,
            top: tooltipPos.y - 4,
            transform: "translateY(-100%)",
            background: "var(--surface-2)",
          }}
        >
          <span
            className="font-semibold text-[--text-secondary]"
            style={{ fontFamily: "var(--font-paper)" }}
          >
            {hovered.lower}ms – {hovered.upper}ms
          </span>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[--text-tertiary]">Traces</span>
            <span className="font-mono font-medium tabular-nums text-[--text-primary]">
              {hovered.count}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
