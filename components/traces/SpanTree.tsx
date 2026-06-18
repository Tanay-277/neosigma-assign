"use client"

import React, { useState, useMemo } from "react"
import type { Trace } from "@/lib/types"
import { buildSpanTree, flattenSpanTree } from "@/lib/data/traces"
import { SpanNodeRow } from "@/components/traces/SpanNode"
import { SpanDetail } from "@/components/traces/SpanDetail"

interface SpanTreeProps {
  trace: Trace
}

export function SpanTree({ trace }: SpanTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null)

  const tree = useMemo(() => buildSpanTree(trace.spans), [trace.spans])
  const flatSpans = useMemo(() => flattenSpanTree(tree, collapsed), [tree, collapsed])

  // Compute waterfall bounds
  const traceStartMs = useMemo(() => new Date(trace.startTime).getTime(), [trace.startTime])
  const traceDurationMs = useMemo(() => {
    if (trace.latencyMs) return trace.latencyMs
    const allEndTimes = trace.spans
      .filter((s) => s.endTime)
      .map((s) => new Date(s.endTime!).getTime())
    if (allEndTimes.length === 0) return 5000
    return Math.max(...allEndTimes) - traceStartMs
  }, [trace, traceStartMs])

  const selectedSpan = useMemo(
    () => flatSpans.find((s) => s.id === selectedSpanId) ?? null,
    [flatSpans, selectedSpanId]
  )

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Find nodes with children in the flat list
  const nodesWithChildren = useMemo(() => {
    const s = new Set<string>()
    for (const span of flatSpans) {
      if (span.children.length > 0) s.add(span.id)
    }
    return s
  }, [flatSpans])

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      {/* Column headers */}
      <div
        className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <span
          className="flex-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-disabled)", paddingLeft: 4 }}
        >
          Span
        </span>
        <span
          className="w-12 text-right text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-disabled)" }}
        >
          Latency
        </span>
      </div>

      {/* Span rows */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {flatSpans.length === 0 ? (
          <div
            className="flex h-32 items-center justify-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            No spans recorded
          </div>
        ) : (
          flatSpans.map((node) => (
            <SpanNodeRow
              key={node.id}
              node={node}
              isSelected={selectedSpanId === node.id}
              isCollapsed={collapsed.has(node.id)}
              hasChildren={nodesWithChildren.has(node.id)}
              onToggle={() => toggleCollapse(node.id)}
              onSelect={() =>
                setSelectedSpanId(selectedSpanId === node.id ? null : node.id)
              }
              traceStartMs={traceStartMs}
              traceDurationMs={traceDurationMs}
            />
          ))
        )}
      </div>

      {/* Span detail panel */}
      {selectedSpan && (
        <SpanDetail span={selectedSpan} onClose={() => setSelectedSpanId(null)} />
      )}
    </div>
  )
}
