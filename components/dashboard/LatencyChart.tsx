"use client"

import { useRef, useEffect, useState, useId } from "react"
import * as d3 from "d3"
import type { LatencyPoint } from "@/lib/types"

interface LatencyChartProps {
  data: LatencyPoint[]
}

// Asymmetric margins: left=56 for "Xms" labels, right=32 breathing room,
// bottom=44 for rotated date labels, top=20 so the highest point isn't clipped.
const MARGIN = { top: 20, right: 32, bottom: 44, left: 56 }

export function LatencyChart({ data }: LatencyChartProps) {
  const svgRef     = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const uid        = useId()
  const [hovered,    setHovered]    = useState<LatencyPoint | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, isRightAlign: false })

  const [dimensions, setDimensions] = useState({ width: 0, height: 220 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        const height = wrapper.clientHeight || 220
        setDimensions({ width, height })
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

    // ── Gradient defs — vertical top-to-bottom fade, very subtle ──────────
    // p50 uses chart-1 (accent blue), p95 uses chart-3 (warm amber).
    // Opacity ceiling 0.14 → 0.02: present enough to aid reading,
    // invisible enough to not fight the lines.
    const defs = d3.select(svg).append("defs")
    ;(["p50", "p95"] as const).forEach((key) => {
      const color = key === "p50" ? "var(--chart-1)" : "var(--chart-3)"
      const grad  = defs
        .append("linearGradient")
        .attr("id",  `latency-area-${uid}-${key}`)
        .attr("x1", "0").attr("y1", "0")
        .attr("x2", "0").attr("y2", "1")
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.14)
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.02)
    })

    const root = d3
      .select(svg)
      .attr("width",  width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

    // Legend is now a React div overlay (see JSX return below).
    // Removed from D3 entirely — React/CSS flex handles responsive layout
    // far better than fixed SVG pixel coords do.

    // ── Empty state ────────────────────────────────────────────────────────
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

    // ── Scales ────────────────────────────────────────────────────────────
    const dates = data.map((d) => new Date(d.bucket))
    const maxMs = d3.max(data, (d) => Math.max(d.p50, d.p95)) ?? 100

    const xScale = d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, innerW])

    // * 1.1 headroom so the highest point never clips the top margin.
    // .nice() snaps domain to round numbers — cleaner Y axis labels.
    const yScale = d3.scaleLinear()
      .domain([0, maxMs * 1.1])
      .nice()
      .range([innerH, 0])

    // ── Grid lines ────────────────────────────────────────────────────────
    // "2,4" dasharray: short dash, long gap. Readable but recessive.
    // stroke-opacity 0.5 — present, not dominant.
    root.append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .join("line")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", (d) => yScale(d)).attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,4")

    // ── X axis ────────────────────────────────────────────────────────────
    // "%b %d %H:%M" gives contextual dates (month+day) with time.
    // domain removed — the grid lines serve as the visual base.
    // tick lines transparent — only grid serves that purpose, no redundant marks.
    root.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat((d) => d3.timeFormat("%b %d")(d as Date))
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
        .attr("dy", "1em")
      )
      // Tick lines: transparent (not var(--border-subtle)).
      // Only the horizontal grid lines should guide the eye, not vertical ticks.
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // ── Y axis ────────────────────────────────────────────────────────────
    root.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}ms`))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text")
        .attr("fill", "var(--text-tertiary)")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-paper)")
      )
      .call((g) => g.selectAll(".tick line").attr("stroke", "transparent"))

    // ── Area fills ────────────────────────────────────────────────────────
    // p95 area rendered FIRST (behind p50) since p95 ≥ p50 always.
    // curveMonotoneX: no overshooting, respects monotonicity of time data.
    const makeArea = (yAccessor: (d: LatencyPoint) => number) =>
      d3.area<LatencyPoint>()
        .x((d) => xScale(new Date(d.bucket)))
        .y0(innerH)
        .y1((d) => yAccessor(d))
        .curve(d3.curveMonotoneX)

    root.append("path").datum(data)
      .attr("fill", `url(#latency-area-${uid}-p95)`)
      .attr("d", makeArea((d) => yScale(d.p95)))
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)

    root.append("path").datum(data)
      .attr("fill", `url(#latency-area-${uid}-p50)`)
      .attr("d", makeArea((d) => yScale(d.p50)))
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)

    // ── Lines with stroke-dashoffset draw animation ────────────────────────
    // Both lines animate from left to right in 600ms with easeCubicOut.
    // p95 gains its "5,3" dasharray AFTER the draw ends via .on("end") —
    // so during animation it appears as a clean solid line that then
    // "becomes dashed" at completion. An intentional two-phase reveal.
    const makeLine = (yAccessor: (d: LatencyPoint) => number) =>
      d3.line<LatencyPoint>()
        .x((d) => xScale(new Date(d.bucket)))
        .y((d) => yAccessor(d))
        .curve(d3.curveMonotoneX)

    function animateLine(
      path: d3.Selection<SVGPathElement, unknown, null, undefined>,
      onEnd?: (this: SVGPathElement) => void
    ) {
      const node = path.node()
      if (!node) return
      const len = node.getTotalLength()
      const t = path
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
      
      if (onEnd) {
        t.on("end", onEnd)
      }
    }

    const pathP50 = root.append("path").datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-1)")
      .attr("stroke-width", 1.75)
      .attr("d", makeLine((d) => yScale(d.p50))) as d3.Selection<SVGPathElement, unknown, null, undefined>

    animateLine(pathP50)

    const pathP95 = root.append("path").datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-3)")
      .attr("stroke-width", 1.75)
      .attr("d", makeLine((d) => yScale(d.p95))) as d3.Selection<SVGPathElement, unknown, null, undefined>

    animateLine(pathP95, function (this: SVGPathElement) {
      d3.select(this).attr("stroke-dasharray", "5,3")
    })

    // ── Data dots — fade in after lines complete ───────────────────────────
    // r=2 (subtle markers at each data point). Delay 400ms so they appear
    // just before the line draw finishes — dots "pop" as the line reaches them.
    // p50: opacity 0.45, p95: opacity 0.35 (slightly recessed vs p50).
    const addDots = (
      cls:   string,
      yAcc:  (d: LatencyPoint) => number,
      color: string,
      finalOpacity: number
    ) =>
      root.selectAll(`.${cls}`)
        .data(data)
        .join("circle")
        .attr("class", cls)
        .attr("cx", (d) => xScale(new Date(d.bucket)))
        .attr("cy", (d) => yAcc(d))
        .attr("r",  2)
        .attr("fill", color)
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(300)
        .attr("opacity", finalOpacity)

    addDots("dot-p50", (d) => yScale(d.p50), "var(--chart-1)", 0.45)
    addDots("dot-p95", (d) => yScale(d.p95), "var(--chart-3)", 0.35)

    // ── Guide line ────────────────────────────────────────────────────────
    // Vertical dashed line that snaps to the nearest data point.
    // "display: none" → "display: null" (removes the attribute, making it visible).
    const guideLine = root.append("line")
      .attr("stroke", "var(--border-subtle)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0).attr("y2", innerH)
      .style("display", "none")

    // ── Focus dots ────────────────────────────────────────────────────────
    // r=5 (larger than data dots, clearly communicates "active").
    // Stroke matches var(--surface-2) — the chart card's background.
    // NOT var(--surface-1): charts live on surface-2 cards, not surface-1 panels.
    // This creates the "punched-out" ring effect against the correct surface.
    const makeFocus = (color: string) =>
      root.append("circle")
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "var(--surface-2)")
        .attr("stroke-width", 1.5)
        .style("display", "none")

    const p50Focus = makeFocus("var(--chart-1)")
    const p95Focus = makeFocus("var(--chart-3)")

    // ── Mouse overlay ─────────────────────────────────────────────────────
    // Transparent rect covering the full plot area. D3 bisector snaps to
    // the nearest data point in time. d3.pointer gives coords relative to
    // the rect, not the page — no scroll offset issues.
    root.append("rect")
      .attr("width",  innerW)
      .attr("height", innerH)
      .attr("fill",   "transparent")
      .style("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx]    = d3.pointer(event)
        const xDate   = xScale.invert(mx)
        const bisect  = d3.bisector((d: LatencyPoint) => new Date(d.bucket)).left
        const idx     = bisect(data, xDate, 1)
        const d0      = data[idx - 1]
        const d1      = data[idx]
        const closest = (d0 && d1)
          ? (xDate.getTime() - new Date(d0.bucket).getTime() >
             new Date(d1.bucket).getTime() - xDate.getTime() ? d1 : d0)
          : (d0 ?? d1)

        if (closest) {
          const cx = xScale(new Date(closest.bucket))
          guideLine.attr("x1", cx).attr("x2", cx).style("display", null)
          p50Focus.attr("cx", cx).attr("cy", yScale(closest.p50)).style("display", null)
          p95Focus.attr("cx", cx).attr("cy", yScale(closest.p95)).style("display", null)

          setHovered(closest)
          const tx = cx + MARGIN.left
          setTooltipPos({
            x: tx,
            y: Math.min(yScale(closest.p50), yScale(closest.p95)) + MARGIN.top,
            isRightAlign: tx > width * 0.6,
          })
        }
      })
      .on("mouseleave", function () {
        guideLine.style("display", "none")
        p50Focus.style("display", "none")
        p95Focus.style("display", "none")
        setHovered(null)
      })
  }, [data, dimensions])

  return (
    // wrapperRef wraps both the SVG and the React legend overlay.
    // The legend is absolutely positioned over the SVG's top margin area.
    <div ref={wrapperRef} className="relative w-full h-[200px] sm:h-[220px]">
      <svg ref={svgRef} style={{ overflow: "visible", width: "100%", display: "block" }} />

      {/* ── Legend overlay ───────────────────────────────────────────────── */}
      {/* Absolutely positioned at top:6px (within MARGIN.top=20px headroom)
          and left:MARGIN.left so it aligns to the chart plot area's left edge.
          React flex handles responsive layout — items never squash. */}
     

      {hovered && (
        // Tooltip: solid var(--surface-2) background.
        // NO border, NO backdrop-blur — both cause chart line colors to bleed through.
        // shadow-xl alone provides sufficient elevation against the chart surface.
        <div
          className="absolute z-50 pointer-events-none rounded-lg p-2.5 shadow-xl text-[11px] flex flex-col gap-1.5 transition-all duration-75 ease-out"
          style={{
            left: tooltipPos.isRightAlign
              ? tooltipPos.x - 170
              : tooltipPos.x + 12,
            top:       tooltipPos.y - 32,
            transform: "translateY(-50%)",
            background: "var(--surface-2)",
          }}
        >
          <span
            className="font-semibold text-[--text-secondary]"
            style={{ fontFamily: "var(--font-paper)" }}
          >
            {new Date(hovered.bucket).toLocaleDateString()}{" "}
            {new Date(hovered.bucket).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[--text-tertiary]">
                <span className="h-1.5 w-1.5 rounded-full bg-[--chart-1]" />
                p50
              </span>
              <span className="font-mono font-medium tabular-nums text-[--text-primary]">
                {hovered.p50.toFixed(0)}ms
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[--text-tertiary]">
                <span className="h-1.5 w-1.5 rounded-full bg-[--chart-3]" />
                p95
              </span>
              <span className="font-mono font-medium tabular-nums text-[--text-primary]">
                {hovered.p95.toFixed(0)}ms
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-0.5 border-t border-[--border-subtle] mt-0.5">
              <span className="text-[--text-tertiary] pl-3">Δ spread</span>
              <span className="font-mono font-medium tabular-nums text-[--text-secondary]">
                {(hovered.p95 - hovered.p50).toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
