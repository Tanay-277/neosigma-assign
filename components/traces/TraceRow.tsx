"use client"

import React from "react"
import type { Trace } from "@/lib/types"
import { cn } from "@/lib/utils"

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

function getModel(trace: Trace): string | null {
  const llmSpan = trace.spans.find((s) => s.type === "llm" && s.model)
  return llmSpan?.model ?? null
}

interface TraceRowProps {
  trace: Trace
  selected: boolean
  onSelect: (id: string) => void
}

export function TraceRow({ trace, selected, onSelect }: TraceRowProps) {
  const model = getModel(trace)
  const env = trace.metadata.environment

  const rowClass = cn(
    "trace-row group flex cursor-pointer items-center gap-3 px-3 py-0 select-none",
    selected && "selected",
    !selected && trace.status === "error" && "error-row",
    !selected && trace.status === "running" && "running-row"
  )

  return (
    <div
      className={rowClass}
      style={{ height: 48, minHeight: 48 }}
      onClick={() => onSelect(trace.id)}
      role="row"
      aria-selected={selected}
    >
      {/* Status dot */}
      <span
        className={cn(
          "status-dot shrink-0",
          trace.status === "success" && "status-dot-success",
          trace.status === "error" && "status-dot-error",
          trace.status === "running" && "status-dot-running animate-running"
        )}
      />

      {/* Name + tags */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="truncate text-[13px] font-medium leading-none"
          style={{ color: "var(--text-primary)" }}
        >
          {trace.name}
        </span>
        <div className="flex items-center gap-1.5">
          {env && (
            <span
              className="rounded px-1 py-px text-[10px] font-medium leading-none"
              style={{
                background: "var(--surface-3)",
                color: "var(--text-tertiary)",
              }}
            >
              {env}
            </span>
          )}
          {trace.tags.slice(0, 1).map((tag) =>
            tag !== env ? (
              <span
                key={tag}
                className="rounded px-1 py-px text-[10px] leading-none"
                style={{
                  background: "var(--surface-3)",
                  color: "var(--text-tertiary)",
                }}
              >
                {tag}
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Model */}
      {model && (
        <span
          className="shrink-0 text-[10px] leading-none hidden xs:inline"
          style={{
            fontFamily: "var(--font-paper)",
            color: "var(--text-disabled)",
          }}
        >
          {model}
        </span>
      )}

      {/* Latency */}
      <span
        className="w-14 shrink-0 text-right text-[11px] leading-none"
        style={{
          fontFamily: "var(--font-paper)",
          color: trace.status === "running" ? "var(--status-running)" : "var(--text-secondary)",
        }}
      >
        {trace.status === "running" ? "live" : formatLatency(trace.latencyMs)}
      </span>

      {/* Cost */}
      <span
        className="w-14 shrink-0 text-right text-[11px] leading-none hidden sm:inline"
        style={{
          fontFamily: "var(--font-paper)",
          color: "var(--text-tertiary)",
        }}
      >
        {formatCost(trace.totalCostUsd)}
      </span>

      {/* Timestamp */}
      <span
        className="w-12 shrink-0 text-right text-[10px] leading-none"
        style={{
          fontFamily: "var(--font-paper)",
          color: "var(--text-disabled)",
        }}
      >
        {relativeTime(trace.startTime)}
      </span>
    </div>
  )
}
