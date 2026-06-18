"use client"

import React, { useState, useMemo } from "react"
import { ChevronRight } from "lucide-react"
import type { Trace, SpanNode } from "@/lib/types"
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

  // Derive waterfall bounds from the actual span data.
  // Anchor start to the root span (depth 0) so the first bar always begins at 0%.
  // Anchor end to the latest span end across all spans so the last bar reaches 100%.
  const { traceStartMs, traceDurationMs } = useMemo(() => {
    if (flatSpans.length === 0) return { traceStartMs: 0, traceDurationMs: 0 }

    const root = flatSpans.find((n) => n.depth === 0)
    const minStart = root
      ? new Date(root.startTime).getTime()
      : Math.min(...flatSpans.map((n) => new Date(n.startTime).getTime()))

    const maxEnd = Math.max(
      ...flatSpans.map((n) => new Date(n.startTime).getTime() + (n.latencyMs ?? 0))
    )

    return {
      traceStartMs: minStart,
      traceDurationMs: Math.max(maxEnd - minStart, 1),
    }
  }, [flatSpans])

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

  const nodesWithChildren = useMemo(() => {
    const s = new Set<string>()
    for (const span of flatSpans) {
      if (span.children.length > 0) s.add(span.id)
    }
    return s
  }, [flatSpans])

  return (
    <div className="flex flex-col overflow-hidden flex-1">
      {/* Column headers */}
      <div
        className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <span
          className="flex-1 text-[10px] font-semibold uppercase tracking-widest font-mono"
          style={{ color: "var(--text-disabled)", paddingLeft: 4 }}
        >
          Span
        </span>
        <span
          className="w-12 text-right text-[10px] font-semibold uppercase tracking-widest font-mono"
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
      {selectedSpan ? (
        <SpanDetail span={selectedSpan} onClose={() => setSelectedSpanId(null)} />
      ) : (
        <div
          className="flex shrink-0 items-center justify-center gap-3 border-t"
          style={{
            height: 64,
            borderColor: "var(--border-subtle)",
            color: "var(--text-tertiary)",
            background: "var(--surface-2)",
          }}
        >
          <ChevronRight size={18} style={{ color: "var(--text-disabled)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-tertiary)"}}>
            Click any span to view its details
          </span>
        </div>
      )}
    </div>
  )
}