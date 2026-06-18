"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import type { CostByModel } from "@/lib/types"

interface CostByModelChartProps {
  data: CostByModel[]
}

const MODEL_COLORS = [
  "var(--type-llm)",
  "var(--type-tool)",
  "var(--type-chain)",
  "var(--type-retriever)",
  "var(--type-parser)",
  "var(--chart-5)",
  "var(--chart-3)",
]


// Magnitude-aware cost formatter — trailing zeros are noise, not data.
function formatCost(v: number): string {
  if (v === 0)   return "$0"
  if (v >= 10)   return `$${v.toFixed(2)}`
  if (v >= 1)    return `$${v.toFixed(3)}`
  if (v >= 0.01) return `$${v.toFixed(4)}`
  return `$${v.toFixed(6)}`
}

// SVG has no CSS text-overflow. Truncate long model names manually.
// 160px left margin at 11px mono ≈ 7px/char → ~22 chars max. Use 19 safe limit.
function truncateModel(name: string, maxChars = 19): string {
  return name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name
}

export function CostByModelChart({ data }: CostByModelChartProps) {
  const svgRef     = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hovered,    setHovered]    = useState<CostByModel | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  // tooltipPos stores SVG-space coords; we offset to screen-space in JSX
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    isNearTop: false,
    isNearBottom: false,
    isNearRight: false,
  })

  const [chartWidth, setChartWidth] = useState(0)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(wrapper)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const svg     = svgRef.current
    if (!svg || !wrapper || chartWidth === 0) return

    const width  = chartWidth
    const rowH   = 44
    const isMobile = width < 450
    const margin = {
      top: 12,
      right: isMobile ? 16 : 96,
      bottom: 32,
      left: isMobile ? 110 : 160,
    }
    const height = data.length * rowH + margin.top + margin.bottom
    const innerW = width  - margin.left - margin.right
    const innerH = data.length * rowH

    d3.select(svg).selectAll("*").remove()
    d3.select(svg).attr("width", width).attr("height", height)

    const root = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    if (data.length === 0) {
      root.append("text")
        .attr("x", innerW / 2).attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 12)
        .attr("font-family", "var(--font-paper)")
        .text("No model cost data")
      return
    }

    // ── Scales ───────────────────────────────────────────────────────────
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalCost) ?? 1])
      .range([0, innerW])
      .nice()

    const yScale = d3.scaleBand()
      .domain(data.map((d) => d.model))
      .range([0, innerH])
      .padding(0.3)

    // ── Segmented progress bars ──────────────────────────────────────────
    const maxCost = d3.max(data, (d) => d.totalCost) ?? 1
    const segW = 2.5
    const gap = 1.75
    const rx = 1.25
    const N = Math.floor((innerW + gap) / (segW + gap))

    const segmentData = data.flatMap((d, i) => {
      const pct = d.totalCost / maxCost
      const numActive = d.totalCost > 0 ? Math.max(1, Math.round(pct * N)) : 0
      const activeColor = MODEL_COLORS[i % MODEL_COLORS.length]
      
      return Array.from({ length: N }, (_, j) => ({
        model: d.model,
        modelIndex: i,
        segmentIndex: j,
        isActive: j < numActive,
        activeColor,
        y: yScale(d.model) ?? 0,
        height: yScale.bandwidth(),
      }))
    })

    const segments = root.selectAll<SVGRectElement, typeof segmentData[0]>(".segment")
      .data(segmentData)
      .join("rect")
      .attr("class", "segment")
      .attr("x", (d) => d.segmentIndex * (segW + gap))
      .attr("y", (d) => d.y)
      .attr("width", segW)
      .attr("height", (d) => d.height)
      .attr("rx", rx)
      .attr("ry", rx)
      .attr("fill", "var(--surface-3)")
      .attr("opacity", (d) => d.isActive ? 0.85 : 0.3)

    // Sequential light up animation
    segments.filter((d) => d.isActive)
      .transition()
      .delay((d) => d.segmentIndex * 12)
      .duration(200)
      .ease(d3.easeCubicOut)
      .attr("fill", (d) => d.activeColor)

    // ── Right data column: cost + trace count ─────────────────────────────────
    // ONLY drawn on desktop width (width >= 450)
    if (isMobile) {
      root.selectAll(".cost-label").remove()
      root.selectAll(".count-label").remove()
    } else {
      const COL_X = innerW + 10

      root.selectAll(".cost-label")
        .data(data)
        .join("text")
        .attr("class", "cost-label")
        .attr("x", COL_X)
        .attr("y", (d) => (yScale(d.model) ?? 0) + yScale.bandwidth() / 2 + 4)
        .attr("text-anchor", "start")
        .attr("fill", "var(--text-secondary)")
        .attr("font-size", 11)
        .attr("font-family", "var(--font-paper)")
        .text((d) => formatCost(d.totalCost))

      root.selectAll(".count-label")
        .data(data)
        .join("text")
        .attr("class", "count-label")
        .attr("x", COL_X)
        .attr("y", (d) => (yScale(d.model) ?? 0) + yScale.bandwidth() / 2 + 16)
        .attr("text-anchor", "start")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
        .text((d) => `${d.traceCount.toLocaleString()} traces`)
    }

    // ── Y axis ───────────────────────────────────────────────────────────
    root.append("g")
      .call(d3.axisLeft(yScale).tickSize(0).tickFormat((d) => truncateModel(d, isMobile ? 12 : 19)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-secondary)")
        .attr("font-size", 11)
        .attr("font-family", "var(--font-paper)")
        .attr("text-anchor", "end")
        .attr("dx", -8)
      )

    // ── X axis ───────────────────────────────────────────────────────────
    root.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(isMobile ? 2 : 4).tickFormat((d) => formatCost(d as number)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // ── Vertical grid lines ───────────────────────────────────────────────
    root.append("g")
      .selectAll("line")
      .data(xScale.ticks(isMobile ? 2 : 4))
      .join("line")
      .attr("x1", (d) => xScale(d)).attr("x2", (d) => xScale(d))
      .attr("y1", 0).attr("y2", innerH)
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-dasharray", "2,4")

    // ── Full-row hit areas — LAST in DOM so they sit on top of everything ─
    root.selectAll<SVGRectElement, CostByModel>(".rowarea")
      .data(data)
      .join("rect")
      .attr("class", "rowarea")
      .attr("x", -margin.left)
      .attr("y",      (d) => (yScale(d.model) ?? 0) - 4)
      .attr("width",  width)
      .attr("height", yScale.bandwidth() + 8)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", function (_, d) {
        const idx = data.indexOf(d)

        // Brighten active segments of the hovered model
        segments.filter((s) => s.modelIndex === idx && s.isActive)
          .transition().duration(100).attr("opacity", 1.0)

        // Dim active segments of other models
        segments.filter((s) => s.modelIndex !== idx && s.isActive)
          .transition().duration(100).attr("opacity", 0.22)

        // Dim all inactive segments
        segments.filter((s) => !s.isActive)
          .transition().duration(100).attr("opacity", 0.12)

        const tx = xScale(d.totalCost) + margin.left
        const ty = (yScale(d.model) ?? 0) + yScale.bandwidth() / 2 + margin.top

        setHovered(d)
        setHoveredIdx(idx)
        setTooltipPos({
          x: tx,
          y: ty,
          isNearTop: ty < 60,
          isNearBottom: ty > height - 60,
          isNearRight: tx > width * 0.65,
        })
      })
      .on("mouseleave", function () {
        segments.filter((s) => s.isActive)
          .transition().duration(100).attr("opacity", 0.85)
        segments.filter((s) => !s.isActive)
          .transition().duration(100).attr("opacity", 0.3)
        setHovered(null)
        setHoveredIdx(-1)
      })

  }, [data, chartWidth])

  const tooltipLeft   = tooltipPos.isNearRight  ? tooltipPos.x - 180 : tooltipPos.x + 12
  const tooltipTop    = tooltipPos.isNearTop    ? tooltipPos.y + 16   // open below row
                      : tooltipPos.isNearBottom ? tooltipPos.y        // transform will open it upward
                      : tooltipPos.y                       // center on row
  const tooltipTransY = tooltipPos.isNearTop    ? "none"              // top of tooltip at row center+16
                      : tooltipPos.isNearBottom ? "translateY(-100%)" // bottom of tooltip at row center
                      : "translateY(-50%)"                 // centered on row

  return (
    <div ref={wrapperRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />

      {hovered && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg text-[11px] flex flex-col gap-1.5 transition-[left,top] duration-75 ease-out"
          style={{
            left:      tooltipLeft,
            top:       tooltipTop,
            transform: tooltipTransY,
            background: "var(--surface-2)",
            boxShadow:  "0 4px 24px oklch(0 0 0 / 0.16), 0 1px 6px oklch(0 0 0 / 0.10)",
            minWidth:   "164px",
          }}
        >
          <div className="flex flex-col gap-1.5 px-2.5 py-2.5">
            {/* Model name header — no accent bar, no border */}
            <span
              className="flex items-center gap-1.5 font-semibold text-[--text-primary] leading-none"
              style={{ fontFamily: "var(--font-paper)" }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: MODEL_COLORS[hoveredIdx % MODEL_COLORS.length] }}
              />
              {hovered.model}
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[--text-tertiary]">Total cost</span>
                <span className="font-mono font-medium tabular-nums text-[--text-primary]">
                  {`$${hovered.totalCost.toFixed(6)}`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[--text-tertiary]">Traces</span>
                <span className="font-mono font-medium tabular-nums text-[--text-primary]">
                  {hovered.traceCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[--text-tertiary]">Avg tokens</span>
                <span className="font-mono font-medium tabular-nums text-[--text-primary]">
                  {hovered.traceCount > 0
                    ? Math.round(hovered.totalTokens / hovered.traceCount).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 ">
                <span className="text-[--text-tertiary]">Cost / trace</span>
                <span className="font-mono font-medium tabular-nums text-[--text-secondary]">
                  {hovered.traceCount > 0
                    ? formatCost(hovered.totalCost / hovered.traceCount)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
