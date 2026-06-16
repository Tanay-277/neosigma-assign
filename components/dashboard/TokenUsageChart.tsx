"use client"

import React, { useRef, useEffect } from "react"
import * as d3 from "d3"
import type { TokenPoint } from "@/lib/types"

interface TokenUsageChartProps {
  data: TokenPoint[]
}

const MARGIN = { top: 16, right: 24, bottom: 44, left: 60 }

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const svg = svgRef.current
    if (!svg || !wrapper) return

    const width = wrapper.clientWidth || 480
    const height = 220
    const innerW = width - MARGIN.left - MARGIN.right
    const innerH = height - MARGIN.top - MARGIN.bottom

    d3.select(svg).selectAll("*").remove()
    d3.select(svg).attr("width", width).attr("height", height)

    const root = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

    if (data.length === 0) {
      root
        .append("text")
        .attr("x", innerW / 2).attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)").attr("font-size", 12)
        .text("No token data in this window")
      return
    }

    const stacked = data.map((d) => ({
      ...d,
      total: d.promptTokens + d.completionTokens,
    }))

    const maxTotal = d3.max(stacked, (d) => d.total) ?? 1000
    const dates = data.map((d) => new Date(d.bucket))

    const xScale = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, innerW])
    const yScale = d3.scaleLinear().domain([0, maxTotal]).nice().range([innerH, 0])

    // Grid
    root.append("g").selectAll("line").data(yScale.ticks(4)).join("line")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", (d) => yScale(d)).attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-subtle)").attr("stroke-opacity", 0.4)
      .attr("stroke-dasharray", "2,4")

    // Stacked area — prompt
    const areaPrompt = d3.area<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0(innerH).y1((d) => yScale(d.total)).curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", "var(--chart-1)").attr("fill-opacity", 0.18)
      .attr("d", areaPrompt)

    // Stacked area — completion
    const areaCompl = d3.area<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0((d) => yScale(d.total))
      .y1((d) => yScale(d.promptTokens)).curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", "var(--chart-2)").attr("fill-opacity", 0.25)
      .attr("d", areaCompl)

    // Lines
    const lineTotal = d3.line<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket))).y((d) => yScale(d.total))
      .curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", "none").attr("stroke", "var(--chart-1)")
      .attr("stroke-width", 1.5).attr("d", lineTotal)
      .attr("opacity", 0).transition().duration(500).ease(d3.easeCubicOut).attr("opacity", 0.9)

    const linePrompt = d3.line<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket))).y((d) => yScale(d.promptTokens))
      .curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", "none").attr("stroke", "var(--chart-2)")
      .attr("stroke-width", 1.25).attr("stroke-dasharray", "4,3").attr("d", linePrompt)
      .attr("opacity", 0).transition().duration(500).ease(d3.easeCubicOut).attr("opacity", 0.7)

    // Axes
    root.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => d3.timeFormat("%b %d")(d as Date)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text").attr("fill", "var(--text-tertiary)").attr("font-size", 10).attr("font-family", "var(--font-paper)").attr("dy", "1em"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    root.append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat((d) => formatTokens(d as number)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text").attr("fill", "var(--text-tertiary)").attr("font-size", 10).attr("font-family", "var(--font-paper)"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

  }, [data])

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-1)", opacity: 0.9 }} />
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}>Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-2)", opacity: 0.9 }} />
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}>Prompt</span>
        </div>
      </div>
      <div ref={wrapperRef} className="w-full">
        <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />
      </div>
    </div>
  )
}
