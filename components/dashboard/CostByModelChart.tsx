"use client"

import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import type { CostByModel } from "@/lib/types"

interface CostByModelChartProps {
  data: CostByModel[]
}

const MARGIN = { top: 12, right: 90, bottom: 32, left: 160 }

export function CostByModelChart({ data }: CostByModelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<CostByModel | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const svg = svgRef.current
    if (!svg || !wrapper) return

    const width = wrapper.clientWidth || 480
    const rowH = 44
    const height = data.length * rowH + MARGIN.top + MARGIN.bottom
    const innerW = width - MARGIN.left - MARGIN.right
    const innerH = data.length * rowH

    d3.select(svg).selectAll("*").remove()
    d3.select(svg).attr("width", width).attr("height", height)

    const root = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

    if (data.length === 0) {
      root
        .append("text")
        .attr("x", innerW / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 12)
        .text("No model cost data")
      return
    }

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalCost) ?? 1])
      .range([0, innerW])
      .nice()

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.model))
      .range([0, innerH])
      .padding(0.3)

    // Background track
    root
      .selectAll(".track")
      .data(data)
      .join("rect")
      .attr("class", "track")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.model) ?? 0)
      .attr("width", innerW)
      .attr("height", yScale.bandwidth())
      .attr("fill", "var(--surface-3)")
      .attr("rx", 3)

    // Bars
    root
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.model) ?? 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", "var(--chart-1)")
      .attr("rx", 3)
      .attr("opacity", 0.82)
      .attr("width", 0)
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(120)
          .attr("opacity", 1.0)
          .attr("fill", "var(--accent)")

        // Dim non-hovered bars
        root
          .selectAll(".bar")
          .filter((barData) => barData !== d)
          .transition()
          .duration(120)
          .attr("opacity", 0.35)

        setHovered(d as CostByModel)
        setTooltipPos({
          x: xScale((d as CostByModel).totalCost) + MARGIN.left,
          y: (yScale((d as CostByModel).model) ?? 0) + yScale.bandwidth() / 2 + MARGIN.top,
        })
      })
      .on("mouseleave", function () {
        // Reset all bars
        root
          .selectAll(".bar")
          .transition()
          .duration(120)
          .attr("opacity", 0.82)
          .attr("fill", "var(--chart-1)")

        setHovered(null)
      })
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => xScale(d.totalCost))

    // Cost labels
    root
      .selectAll(".cost-label")
      .data(data)
      .join("text")
      .attr("class", "cost-label")
      .attr("x", (d) => xScale(d.totalCost) + 6)
      .attr("y", (d) => (yScale(d.model) ?? 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", 11)
      .attr("font-family", "var(--font-paper)")
      .text((d) => `$${d.totalCost.toFixed(4)}`)

    // Trace count
    root
      .selectAll(".count-label")
      .data(data)
      .join("text")
      .attr("class", "count-label")
      .attr("x", (d) => xScale(d.totalCost) + 6)
      .attr("y", (d) => (yScale(d.model) ?? 0) + yScale.bandwidth() / 2 + 16)
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", 9)
      .attr("font-family", "var(--font-paper)")
      .text((d) => `${d.traceCount} traces`)

    // Y axis (model names)
    root
      .append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll("text")
          .attr("fill", "var(--text-secondary)")
          .attr("font-size", 11)
          .attr("font-family", "var(--font-paper)")
          .attr("text-anchor", "end")
          .attr("dx", -8)
      )

    // X axis
    root
      .append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(4)
          .tickFormat((d) => `$${(d as number).toFixed(3)}`)
      )
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
    <div ref={wrapperRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />
      {hovered && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg border border-[--border-subtle] p-2.5 shadow-xl backdrop-blur-md text-[11px] flex flex-col gap-1.5 transition-all duration-75 ease-out"
          style={{
            left: tooltipPos.x > (wrapperRef.current?.clientWidth ?? 480) * 0.65 ? tooltipPos.x - 175 : tooltipPos.x + 12,
            top: tooltipPos.y,
            transform: "translateY(-50%)",
            background: "color-mix(in oklch, var(--surface-2) 90%, transparent)",
            minWidth: "150px"
          }}
        >
          <span className="font-semibold text-[--text-primary]" style={{ fontFamily: "var(--font-paper)" }}>
            {hovered.model}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[--text-tertiary]">Total cost</span>
              <span className="font-mono font-medium text-[--accent]">${hovered.totalCost.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[--text-tertiary]">Total traces</span>
              <span className="font-mono font-medium text-[--text-secondary]">{hovered.traceCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[--text-tertiary]">Avg tokens</span>
              <span className="font-mono font-medium text-[--text-secondary]">
                {hovered.traceCount > 0 ? Math.round(hovered.totalTokens / hovered.traceCount).toLocaleString() : "0"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
