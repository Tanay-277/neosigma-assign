"use client"

import React, { useRef, useEffect, useState } from "react"
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
  const uid = React.useId()
  const [hovered, setHovered] = useState<TokenPoint | null>(null)
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

    // Gradient defs
    const defs = d3.select(svg).append("defs")
    ;["total", "prompt"].forEach((key) => {
      const g = defs.append("linearGradient").attr("id", `token-area-${uid}-${key}`).attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1")
      g.append("stop").attr("offset", "0%").attr("stop-color", `var(--chart-${key === "total" ? 1 : 2})`).attr("stop-opacity", 0.2)
      g.append("stop").attr("offset", "100%").attr("stop-color", `var(--chart-${key === "total" ? 1 : 2})`).attr("stop-opacity", 0.03)
    })

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

    // Total area (prompt + completion)
    const areaTotal = d3.area<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0(innerH).y1((d) => yScale(d.total)).curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", `url(#token-area-${uid}-total)`)
      .attr("d", areaTotal)

    // Prompt area
    const areaPrompt = d3.area<typeof stacked[0]>()
      .x((d) => xScale(new Date(d.bucket)))
      .y0((d) => yScale(d.total))
      .y1((d) => yScale(d.promptTokens)).curve(d3.curveMonotoneX)

    root.append("path").datum(stacked)
      .attr("fill", `url(#token-area-${uid}-prompt)`)
      .attr("d", areaPrompt)

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
    // Guide Line
    const guideLine = root
      .append("line")
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", innerH)
      .style("display", "none")

    const totalFocus = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--chart-1)")
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .style("display", "none")

    const promptFocus = root
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--chart-2)")
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
        const bisect = d3.bisector((d: TokenPoint) => new Date(d.bucket)).left
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
          const totalVal = closest.promptTokens + closest.completionTokens

          guideLine.attr("x1", cx).attr("x2", cx).style("display", null)
          totalFocus.attr("cx", cx).attr("cy", yScale(totalVal)).style("display", null)
          promptFocus.attr("cx", cx).attr("cy", yScale(closest.promptTokens)).style("display", null)

          setHovered(closest)
          setTooltipPos({
            x: cx + MARGIN.left,
            y: Math.min(yScale(totalVal), yScale(closest.promptTokens)) + MARGIN.top,
          })
        }
      })
      .on("mouseleave", function () {
        guideLine.style("display", "none")
        totalFocus.style("display", "none")
        promptFocus.style("display", "none")
        setHovered(null)
      })
  }, [data])

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-1)", opacity: 0.9 }} />
          <span className="text-[11px] text-black/40 dark:text-white/40">Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-2)", opacity: 0.9 }} />
          <span className="text-[11px] text-black/40 dark:text-white/40">Prompt</span>
        </div>
      </div>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-[--chart-1]" />
                  Total tokens
                </span>
                <span className="font-mono font-medium text-[--text-primary]">
                  {(hovered.promptTokens + hovered.completionTokens).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[--text-tertiary]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[--chart-2]" />
                  Prompt
                </span>
                <span className="font-mono font-medium text-[--text-secondary]">
                  {hovered.promptTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[--text-tertiary] pl-3">Completion</span>
                <span className="font-mono font-medium text-[--text-secondary]">
                  {hovered.completionTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
