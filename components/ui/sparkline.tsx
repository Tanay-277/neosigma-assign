"use client";
import React from "react"

interface SparklineProps {
  data: number[]
  color: string
  fullWidth?: boolean
  direction?: string
  animated?: boolean
  height?: number
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ""
  const d: string[] = []
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (i === 0) {
      d.push(`M${p.x},${p.y}`)
      continue
    }
    const prev = pts[i - 1]
    const next = pts[i + 1] ?? pts[i]
    const pprev = pts[i - 2] ?? prev
    const cp1x = prev.x + (p.x - pprev.x) / 6
    const cp1y = prev.y + (p.y - pprev.y) / 6
    const cp2x = p.x - (next.x - prev.x) / 6
    const cp2y = p.y - (next.y - prev.y) / 6
    d.push(
      `C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p.x},${p.y}`
    )
  }
  return d.join("")
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export function Sparkline({
  data,
  color,
  fullWidth,
  direction,
  animated = true,
  height: H = 36,
}: SparklineProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(fullWidth ? 240 : 96)

  React.useEffect(() => {
    if (!fullWidth || !containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [fullWidth])

  const W = width
  const id = React.useId()
  const clipRectRef = React.useRef<SVGRectElement>(null)

  const plotData = direction === "down" ? [...data].reverse() : data
  const min = Math.min(...plotData)
  const max = Math.max(...plotData)
  const range = max - min || 1

  const px = (i: number) => (i / (data.length - 1)) * W
  const py = (v: number) => H - ((v - min) / range) * (H - 6) - 3

  const pts = plotData.map((v, i) => ({ x: px(i), y: py(v) }))
  const lineD = smoothPath(pts)

  const areaD =
    `M${pts[0].x},${H}L${pts[0].x},${pts[0].y}` +
    lineD.slice(lineD.indexOf(" ")) +
    `L${pts[pts.length - 1].x},${H}Z`

  const last = pts[pts.length - 1]

  React.useEffect(() => {
    if (!animated || !clipRectRef.current || data.length < 2) return
    const rect = clipRectRef.current
    const start = performance.now()
    const duration = 900

    rect.setAttribute("width", "0")

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = smoothstep(t)
      rect.setAttribute("width", String(eased * W))
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [data, animated, W])

  return (
    <div ref={containerRef} className={fullWidth ? "w-full overflow-visible" : "shrink-0 overflow-visible"}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible w-full h-full block"
        aria-hidden="true"
      >
      <defs>
        {/* Accent gradient */}
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.28 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>

        {/* Muted gradient for undrawn area */}
        <linearGradient id={`${id}-muted-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`${id}-glow`} x="0%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
        </filter>

        {/* Reveal clip — animated via requestAnimationFrame */}
        <clipPath id={`${id}-reveal`}>
          <rect ref={clipRectRef} x={0} y={0} width={animated ? 0 : W} height={H} />
        </clipPath>
      </defs>

      {/* ── Undrawn (muted) layer — always fully visible ── */}
      <path d={areaD} fill={`url(#${id}-muted-grad)`} />
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.2}
      />

      {/* ── Drawn (accent) layer — revealed by clipPath ── */}
      <g clipPath={`url(#${id}-reveal)`}>
        <path d={areaD} fill={`url(#${id}-grad)`} />
        <path
          d={lineD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-glow)`}
          opacity={0.5}
        />
        <path
          d={lineD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Terminal dot */}
      <circle cx={last.x} cy={last.y} r={5} fill={color} opacity={0.18} />
      <circle cx={last.x} cy={last.y} r={3} fill="white" stroke={color} strokeWidth={1.5} />
      <circle cx={last.x} cy={last.y} r={1.2} fill={color} />
      </svg>
    </div>
  )
}
