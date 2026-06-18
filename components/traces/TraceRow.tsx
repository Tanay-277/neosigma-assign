"use client"

import React from "react"
import type { Trace } from "@/lib/types"
import { cn, formatInt } from "@/lib/utils"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatCost(usd: number): string {
  if (usd === 0) return "$0"
  if (usd < 0.001) return `$${(usd * 1000).toFixed(3)}m`
  return `$${usd.toFixed(4)}`
}

function formatLatency(ms?: number): string {
  if (ms === undefined) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const ENV_COLORS: Record<string, { bg: string; text: string }> = {
  production:  { bg: "color-mix(in oklch, var(--status-success) 18%, transparent)", text: "var(--status-success)" },
  staging:     { bg: "color-mix(in oklch, var(--status-warning) 18%, transparent)", text: "var(--status-warning)" },
  development: { bg: "color-mix(in oklch, var(--type-llm) 18%, transparent)",       text: "var(--type-llm)" },
}

function getEnvColor(env: string) {
  return ENV_COLORS[env] ?? { bg: "var(--surface-3)", text: "var(--text-tertiary)" }
}

function getModel(trace: Trace): string | null {
  const llmSpan = trace.spans.find((s) => s.type === "llm" && s.model)
  return llmSpan?.model ?? null
}

interface TraceRowProps {
  trace: Trace
  selected: boolean
  onSelect: (id: string) => void
  variant?: "compact" | "spacious"
}

export const TraceRow = React.memo(function TraceRow({ trace, selected, onSelect, variant = "compact" }: TraceRowProps) {
  const model = getModel(trace)
  const env = trace.metadata.environment

  const rowClass = cn(
    "trace-row group flex cursor-pointer items-center gap-3 px-3 py-0 select-none",
    selected && "selected",
    !selected && trace.status === "error" && "error-row",
    !selected && trace.status === "running" && "running-row"
  )

  if (variant === "spacious") {
    return (
      <div
        className={rowClass}
        style={{ height: 68, minHeight: 68 }}
        onClick={() => onSelect(trace.id)}
        role="row"
        aria-selected={selected}
      >
        <span
          className={cn(
            "status-dot shrink-0 self-center mt-1",
            trace.status === "success" && "status-dot-success",
            trace.status === "error" && "status-dot-error",
            trace.status === "running" && "status-dot-running animate-running"
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
              {trace.name}
            </span>
            {env && (
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none" style={{ background: getEnvColor(env).bg, color: getEnvColor(env).text }}>
                {env}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {model && (
              <>
                <span className="truncate max-w-[120px]">{model}</span>
                <span style={{ color: "var(--text-disabled)" }}>·</span>
              </>
            )}
            <span>{formatInt(trace.totalTokens)} tokens</span>
          </div>
        </div>

        <span className="w-14 shrink-0 text-right text-[11px] leading-none font-mono tabular-nums" style={{ color: trace.status === "running" ? "var(--status-running)" : "var(--text-secondary)" }}>
          {trace.status === "running" ? "live" : formatLatency(trace.latencyMs)}
        </span>

        <span className="w-14 shrink-0 text-right text-[11px] leading-none font-mono tabular-nums hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>
          {formatCost(trace.totalCostUsd)}
        </span>

        <span className="w-12 shrink-0 text-right text-[10px] leading-none font-mono tabular-nums" style={{ color: "var(--text-disabled)" }}>
          {relativeTime(trace.startTime)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={rowClass}
      style={{ height: 48, minHeight: 48 }}
      onClick={() => onSelect(trace.id)}
      role="row"
      aria-selected={selected}
    >
      <span
        className={cn(
          "status-dot shrink-0",
          trace.status === "success" && "status-dot-success",
          trace.status === "error" && "status-dot-error",
          trace.status === "running" && "status-dot-running animate-running"
        )}
      />

      <span className="truncate min-w-0 flex-1 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
        {trace.name}
      </span>

      <span className="w-14 shrink-0 text-right text-[11px] leading-none font-mono tabular-nums" style={{ color: trace.status === "running" ? "var(--status-running)" : "var(--text-secondary)" }}>
        {trace.status === "running" ? "live" : formatLatency(trace.latencyMs)}
      </span>

      <span className="w-14 shrink-0 text-right text-[11px] leading-none font-mono tabular-nums hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>
        {formatCost(trace.totalCostUsd)}
      </span>

      <span className="w-12 shrink-0 text-right text-[10px] leading-none font-mono tabular-nums" style={{ color: "var(--text-disabled)" }}>
        {relativeTime(trace.startTime)}
      </span>
    </div>
  )
})
