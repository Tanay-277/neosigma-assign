"use client"

import React, { useRef, useEffect } from "react"
import * as d3 from "d3"
import type { ErrorRatePoint } from "@/lib/types"

interface ErrorRateChartProps {
  data: ErrorRatePoint[]
}

const MARGIN = { top: 16, right: 24, bottom: 44, left: 48 }

export function ErrorRateChart({ data }: ErrorRateChartProps) {
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

    const hasData = data.length > 0 && data.some((d) => d.total > 0)

    if (!hasData) {
      root
        .append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 12)
        .text("No error data in this window")
      return
    }

    const dates = data.map((d) => new Date(d.bucket))
    const maxRate = Math.max(d3.max(data, (d) => d.errorRate) ?? 10, 10)

    const xScale = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, innerW])
    const yScale = d3.scaleLinear().domain([0, maxRate]).nice().range([innerH, 0])

    // Grid lines
    root
      .append("g")
      .selectAll("line")
      .data(yScale.ticks(4))
      .join("line")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", (d) => yScale(d)).attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-dasharray", "2,4")

    // Area
    const area = d3
      .area<ErrorRatePoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0(innerH)
      .y1((d) => yScale(d.errorRate))
      .curve(d3.curveMonotoneX)

    root
      .append("path")
      .datum(data)
      .attr("fill", "var(--status-error)")
      .attr("fill-opacity", 0.12)
      .attr("d", area)

    // Line
    const line = d3
      .line<ErrorRatePoint>()
      .x((d) => xScale(new Date(d.bucket)))
      .y((d) => yScale(d.errorRate))
      .curve(d3.curveMonotoneX)

    root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--status-error)")
      .attr("stroke-width", 1.75)
      .attr("stroke-opacity", 0.8)
      .attr("d", line)
      .attr("stroke-dashoffset", 1000)
      .attr("stroke-dasharray", 1000)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)

    // Baseline
    root
      .append("line")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", innerH).attr("y2", innerH)
      .attr("stroke", "var(--border)").attr("stroke-width", 1)

    // X axis
    root
      .append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => d3.timeFormat("%b %d")(d as Date)))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll("text")
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", 10)
          .attr("font-family", "var(--font-paper)")
          .attr("dy", "1em")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // Y axis
    root
      .append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d}%`))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll("text")
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", 10)
          .attr("font-family", "var(--font-paper)")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

  }, [data])

  return (
    <div ref={wrapperRef} className="w-full">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />
    </div>
  )
}
