"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"

export interface DonutSegment {
  label: string
  value: number
  color: string
  opacity: number
}

interface DonutChartProps {
  data: DonutSegment[]
  total: number
  metricLabel: string
  onSegmentClick?: (label: string) => void
}

const WIDTH = 260
const HEIGHT = 250
const CENTER_X = WIDTH / 2
const CENTER_Y = 140
const INNER_R = 64
const OUTER_R = 88

function formatValue(v: number, metric: string): string {
  if (metric === "cost" || metric === "total cost") {
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
    const s = v.toFixed(6)
    return `$${s.replace(/\.?0+$/, "")}`
  }
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return v.toFixed(0)
}

export function DonutChart({
  data,
  total,
  metricLabel,
  onSegmentClick,
}: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    label: string
    value: number
    pct: string
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    d3.select(svg).selectAll("*").remove()
    d3.select(svg).attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)

    const g = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${CENTER_X},${CENTER_Y})`)

    // Background track
    const trackArc = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(INNER_R)
      .outerRadius(OUTER_R)
      .cornerRadius(3)

    g.append("path")
      .attr("d", trackArc({ startAngle: 0, endAngle: 2 * Math.PI }))
      .attr("fill", "var(--surface-3)")

    // Data arcs
    const positive = data.filter((d) => d.value > 0)
    if (positive.length === 0) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -12)
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 11)
        .attr("font-family", "var(--font-paper)")
        .text("No data")
      return
    }

    const pieGen = d3
      .pie<DonutSegment>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(0)
      .endAngle(2 * Math.PI)

    const arcs = pieGen(positive)
    const arcGen = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(INNER_R)
      .outerRadius(OUTER_R)
      .cornerRadius(3)
      .padAngle(0.015)

    const arcGenHover = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(INNER_R)
      .outerRadius(OUTER_R + 4)
      .cornerRadius(3)
      .padAngle(0.015)

    g.selectAll(".arc")
      .data(arcs)
      .join("path")
      .attr("class", "arc")
      .attr("d", (d) => arcGen(d))
      .attr("fill", (d) => d.data.color)
      .attr("opacity", (d) => d.data.opacity)
      .attr("stroke", "none")
      .on("mouseenter", function (event, d) {
        if (d.data.opacity < 0.3) return
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", arcGenHover(d))
          .attr("stroke", "var(--surface-2)")
          .attr("stroke-width", "1.5")

        const rect = svg.getBoundingClientRect()
        const pct = ((d.data.value / total) * 100).toFixed(1)
        setTooltip({
          label: d.data.label,
          value: d.data.value,
          pct,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 8,
        })
      })
      .on("mousemove", function (event) {
        const rect = svg.getBoundingClientRect()
        if (tooltipRef.current) {
          setTooltip((prev) =>
            prev
              ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top - 8 }
              : null
          )
        }
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", (d) => arcGen(d as d3.PieArcDatum<DonutSegment>))
          .attr("stroke", "none")
        setTooltip(null)
      })
      .on("click", function (event, d) {
        onSegmentClick?.(d.data.label)
      })

    // Center label — total
    const labelText = formatValue(total, metricLabel)
    const fontSize = labelText.length > 12 ? "14px" : labelText.length > 8 ? "18px" : "22px"
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -12)
      .attr("fill", "var(--text-primary)")
      .attr("font-size", fontSize)
      .attr("font-family", "var(--font-paper)")
      .text(labelText)

    // Center label — metric name
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 6)
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "9px")
      .attr("font-family", "var(--font-paper)")
      .attr("letter-spacing", "1px")
      .text(metricLabel.toUpperCase())
  }, [data, total, metricLabel, onSegmentClick])

  return (
    <div className="relative flex justify-center">
      <svg
        ref={svgRef}
        className="w-full h-auto"
        style={{ maxWidth: WIDTH + 40, maxHeight: HEIGHT + 20 }}
      />
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-10 rounded-md px-2.5 py-1.5 text-[11px] shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: "var(--surface-3)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
          }}
        >
          <span className="font-medium">{tooltip.label}</span>
          <span className="ml-2 font-mono tabular-nums" style={{ color: "var(--text-tertiary)" }}>
            {formatValue(tooltip.value, metricLabel)} ({tooltip.pct}%)
          </span>
        </div>
      )}
    </div>
  )
}
