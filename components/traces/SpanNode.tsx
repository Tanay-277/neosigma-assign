"use client"

import React from "react"
import type { SpanNode } from "@/lib/types"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  llm:       { label: "llm",       color: "var(--type-llm)",       bg: "color-mix(in oklch, var(--type-llm) 14%, transparent)" },
  tool:      { label: "tool",      color: "var(--type-tool)",      bg: "color-mix(in oklch, var(--type-tool) 14%, transparent)" },
  chain:     { label: "chain",     color: "var(--type-chain)",     bg: "color-mix(in oklch, var(--type-chain) 14%, transparent)" },
  retriever: { label: "retriever", color: "var(--type-retriever)", bg: "color-mix(in oklch, var(--type-retriever) 14%, transparent)" },
  parser:    { label: "parser",    color: "var(--type-parser)",    bg: "color-mix(in oklch, var(--type-parser) 14%, transparent)" },
  agent:     { label: "agent",     color: "var(--accent)",         bg: "var(--accent-muted)" },
}

function getTypeCfg(type: string) {
  return TYPE_CONFIG[type] ?? { label: type, color: "var(--text-tertiary)", bg: "var(--surface-3)" }
}

function formatLatency(ms?: number): string {
  if (ms === undefined) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

interface SpanNodeProps {
  node: SpanNode
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  traceStartMs: number
  traceDurationMs: number
}

export const SpanNodeRow = React.memo(function SpanNodeRow({
  node,
  isSelected,
  isCollapsed,
  hasChildren,
  onToggle,
  onSelect,
  traceStartMs,
  traceDurationMs,
}: SpanNodeProps) {
  const typeCfg = getTypeCfg(node.type)
  const paddingLeft = 12 + node.depth * 18

  const spanStartMs = new Date(node.startTime).getTime()

  const barLeft =
    traceDurationMs > 0
      ? ((spanStartMs - traceStartMs) / traceDurationMs) * 100
      : 0

  const barWidth =
    traceDurationMs > 0 && node.latencyMs !== undefined
      ? Math.max((node.latencyMs / traceDurationMs) * 100, 0.5)
      : node.status === "running"
        ? 100 - barLeft
        : 0.5

  // Clamp so bar never overflows the right edge
  const clampedWidth = Math.min(barWidth, 100 - barLeft)
  const clampedLeft = Math.max(barLeft, 0)

  const barColor =
    node.status === "error"   ? "var(--status-error)"   :
    node.status === "running" ? "var(--status-running)" :
    node.type === "llm"       ? "var(--type-llm)"       :
    node.type === "tool"      ? "var(--type-tool)"      :
    node.type === "retriever" ? "var(--type-retriever)" :
    "var(--border)"

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 transition-colors duration-75",
        isSelected ? "bg-[--accent-muted]" : "hover:bg-[--surface-3]"
      )}
      style={{
        paddingLeft,
        paddingRight: 12,
        height: 36,
        borderBottom: "1px solid var(--border-subtle)",
        borderLeft: isSelected
          ? "2px solid var(--accent)"
          : node.depth > 0
            ? "1px solid var(--border-subtle)"
            : "none",
      }}
      onClick={() => onSelect(node.id)}
    >
      {/* Collapse toggle */}
      <button
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all",
          hasChildren ? "opacity-60 hover:opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(node.id)
        }}
        style={{ color: "var(--text-tertiary)" }}
      >
        {hasChildren && (isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />)}
      </button>

      {/* Type badge */}
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
        style={{ background: typeCfg.bg, color: typeCfg.color }}
      >
        {typeCfg.label}
      </span>

      {/* Status dot */}
      <span
        className={cn(
          "status-dot shrink-0",
          node.status === "success" && "status-dot-success",
          node.status === "error"   && "status-dot-error",
          node.status === "running" && "status-dot-running animate-running"
        )}
      />

      {/* Name */}
      <span
        className="min-w-0 flex-1 truncate text-[12px]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-paper)" }}
      >
        {node.name}
      </span>

      {/* Model (LLM only) */}
      {node.model && (
        <span
          className="shrink-0 text-[10px]"
          style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}
        >
          {node.model}
        </span>
      )}

      {/* Latency */}
      <span
        className="w-12 shrink-0 text-right text-[11px]"
        style={{
          fontFamily: "var(--font-paper)",
          color: node.status === "running" ? "var(--status-running)" : "var(--text-tertiary)",
        }}
      >
        {node.status === "running" ? "live" : formatLatency(node.latencyMs)}
      </span>

      {/* Hover chevron */}
      <span
        className="shrink-0 opacity-0 transition-opacity duration-75 group-hover:opacity-40"
        style={{ color: "var(--text-disabled)" }}
      >
        <ChevronRight size={12} />
      </span>

      {/* Waterfall bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--surface-3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${clampedLeft}%`,
            width: `${clampedWidth}%`,
            height: "100%",
            background: barColor,
            borderRadius: 1,
            opacity: 0.7,
            transition: "width 300ms ease, left 300ms ease",
          }}
        />
      </div>
    </div>
  )
})