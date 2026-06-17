"use client"

import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import type { ErrorRatePoint } from "@/lib/types"

interface ErrorRateChartProps {
  data: ErrorRatePoint[]
}

const MARGIN = { top: 16, right: 24, bottom: 44, left: 48 }

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const uid = React.useId()
  const [hovered, setHovered] = useState<ErrorRatePoint | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

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

    // Gradient def
    const defs = d3.select(svg).append("defs")
    const grad = defs.append("linearGradient").attr("id", `error-area-${uid}`).attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1")
    grad.append("stop").attr("offset", "0%").attr("stop-color", "var(--status-error)").attr("stop-opacity", 0.15)
    grad.append("stop").attr("offset", "100%").attr("stop-color", "var(--status-error)").attr("stop-opacity", 0.02)

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
      .attr("fill", `url(#error-area-${uid})`)
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
    // Guide Line
    const guideLine = root
      .append("line")
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", innerH)
      .style("display", "none")

    const focusDot = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--status-error)")
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
        const bisect = d3.bisector((d: ErrorRatePoint) => new Date(d.bucket)).left
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
          focusDot.attr("cx", cx).attr("cy", yScale(closest.errorRate)).style("display", null)

          setHovered(closest)
          setTooltipPos({
            x: cx + MARGIN.left,
            y: yScale(closest.errorRate) + MARGIN.top,
          })
        }
      })
      .on("mouseleave", function () {
        guideLine.style("display", "none")
        focusDot.style("display", "none")
        setHovered(null)
      })
  }, [data])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />
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
                <span className="h-1.5 w-1.5 rounded-full bg-[--status-error]" />
                Error rate
              </span>
              <span className="font-mono font-medium text-[--status-error]">{hovered.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[--text-tertiary]">Failed / Total</span>
              <span className="font-mono font-medium text-[--text-primary]">{hovered.errors} / {hovered.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
