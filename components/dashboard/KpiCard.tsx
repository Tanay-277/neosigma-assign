import React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string
  subtext?: string
  trend?: "up" | "down" | "neutral"
  accentColor?: string
  id?: string
}

export function KpiCard({
  label,
  value,
  subtext,
  trend,
  accentColor,
  id,
}: KpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <div
      id={id}
      className="relative flex flex-col gap-2 overflow-hidden rounded p-4"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
        borderLeft: accentColor
          ? `3px solid ${accentColor}`
          : "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-disabled)" }}
      >
        {label}
      </p>

      <div className="flex items-end justify-between gap-2">
        <span
          className="text-2xl font-semibold leading-none"
          style={{
            fontFamily: "var(--font-paper)",
            color: "var(--text-primary)",
          }}
        >
          {value}
        </span>

        {trend && (
          <TrendIcon
            size={16}
            style={{
              color:
                trend === "up"
                  ? "var(--status-success)"
                  : trend === "down"
                  ? "var(--status-error)"
                  : "var(--text-tertiary)",
              marginBottom: 2,
            }}
          />
        )}
      </div>

      {subtext && (
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {subtext}
        </p>
      )}
    </div>
  )
}
