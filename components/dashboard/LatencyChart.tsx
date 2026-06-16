"use client"

import React, { useRef, useEffect } from "react"
import * as d3 from "d3"
import type { LatencyPoint } from "@/lib/types"

interface LatencyChartProps {
  data: LatencyPoint[]
}

const MARGIN = { top: 20, right: 32, bottom: 44, left: 56 }

export function LatencyChart({ data }: LatencyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const svg = svgRef.current
    if (!svg || !wrapper) return

    const width = wrapper.clientWidth || 560
    const height = 220
    const innerW = width - MARGIN.left - MARGIN.right
    const innerH = height - MARGIN.top - MARGIN.bottom

    d3.select(svg).selectAll("*").remove()

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

    // Dots p50
    root
      .selectAll(".dot-p50")
      .data(data)
      .join("circle")
      .attr("class", "dot-p50")
      .attr("cx", (d) => xScale(new Date(d.bucket)))
      .attr("cy", (d) => yScale(d.p50))
      .attr("r", 3)
      .attr("fill", "var(--chart-1)")
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)

    // Dots p95
    root
      .selectAll(".dot-p95")
      .data(data)
      .join("circle")
      .attr("class", "dot-p95")
      .attr("cx", (d) => xScale(new Date(d.bucket)))
      .attr("cy", (d) => yScale(d.p95))
      .attr("r", 3)
      .attr("fill", "var(--chart-3)")
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)

  }, [data])

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded" style={{ background: "var(--chart-1)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}>p50</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width={20} height={2}>
            <line x1={0} y1={1} x2={20} y2={1} stroke="var(--chart-3)" strokeWidth={1.5} strokeDasharray="4,3" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}>p95</span>
        </div>
      </div>
      <div ref={wrapperRef} className="w-full">
        <svg ref={svgRef} style={{ overflow: "visible", width: "100%" }} />
      </div>
    </div>
  )
}
