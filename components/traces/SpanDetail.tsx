"use client"

import React, { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import type { SpanNode } from "@/lib/types"
import { cn } from "@/lib/utils"

function formatJson(obj: unknown): React.ReactNode {
  const text = JSON.stringify(obj, null, 2)
  // Simple syntax coloring via spans
  const lines = text.split("\n").map((line, i) => {
    // Keys
    const colored = line.replace(
      /"([^"]+)"(\s*:)/g,
      '<span class="json-key">"$1"</span>$2'
    ).replace(
      /: ("([^"]*)")/g,
      ': <span class="json-string">$1</span>'
    ).replace(
      /: (true|false|null)/g,
      ': <span class="json-keyword">$1</span>'
    ).replace(
      /: (-?\d+\.?\d*)/g,
      ': <span class="json-number">$1</span>'
    )
    return (
      <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />
    )
  })
  return <>{lines}</>
}

function JsonViewer({ data, label }: { data: unknown; label: string }) {
  const isEmpty = data === null || data === undefined
  const isEmptyObj = typeof data === "object" && data !== null && Object.keys(data as object).length === 0

  return (
    <div>
      <p
        className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-disabled)" }}
      >
        {label}
      </p>
      {isEmpty ? (
        <p className="text-[11px] italic" style={{ color: "var(--text-tertiary)" }}>
          {data === null ? "null" : "undefined"}
        </p>
      ) : (
        <pre
          className="overflow-x-auto rounded-md p-3 text-[11px] leading-relaxed"
          style={{
            background: "var(--surface-3)",
            fontFamily: "var(--font-paper)",
            color: "var(--text-secondary)",
          }}
        >
          <style>{`
            .json-key { color: var(--text-primary); }
            .json-string { color: var(--status-success); }
            .json-keyword { color: var(--status-warning); }
            .json-number { color: var(--status-running); }
          `}</style>
          {isEmptyObj ? <span style={{ color: "var(--text-tertiary)" }}>{"{}"}</span> : formatJson(data)}
        </pre>
      )}
    </div>
  )
}

interface SpanDetailProps {
  span: SpanNode | null
  onClose: () => void
}

export function SpanDetail({ span, onClose }: SpanDetailProps) {
  const [copied, setCopied] = useState(false)

  if (!span) return null

  function copyId() {
    navigator.clipboard.writeText(span!.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const TYPE_COLORS: Record<string, string> = {
    llm: "var(--type-llm)",
    tool: "var(--type-tool)",
    chain: "var(--type-chain)",
    retriever: "var(--type-retriever)",
    parser: "var(--type-parser)",
  }

  return (
    <div
      className="animate-slide-up flex flex-col overflow-hidden border-t"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--surface-1)",
        height: 320,
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-2.5 border-b px-4 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          style={{
            background: `color-mix(in oklch, ${TYPE_COLORS[span.type] ?? "var(--text-tertiary)"} 15%, transparent)`,
            color: TYPE_COLORS[span.type] ?? "var(--text-tertiary)",
          }}
        >
          {span.type}
        </span>
        <span
          className="text-[13px] font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {span.name}
        </span>
        <span
          className={cn(
            "ml-1 text-[11px]",
            span.status === "success" && "text-[var(--status-success)]",
            span.status === "error" && "text-[var(--status-error)]",
            span.status === "running" && "text-[var(--status-running)]"
          )}
        >
          {span.status}
        </span>

        {/* ID copy */}
        <button
          onClick={copyId}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-[--surface-3]"
          style={{ fontFamily: "var(--font-paper)", color: "var(--text-tertiary)", fontSize: 10 }}
        >
          {span.id}
          {copied ? <Check size={10} /> : <Copy size={10} />}
        </button>

        <button
          onClick={onClose}
          className="ml-auto rounded p-1 transition-colors hover:bg-[--surface-3]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content — scrollable */}
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        {/* Metadata */}
        <div
          className="flex w-52 shrink-0 flex-col gap-3 overflow-y-auto border-r p-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Row label="Latency" value={span.latencyMs !== undefined ? `${span.latencyMs}ms` : span.status === "running" ? "in progress" : "—"} mono />
          {span.startTime && <Row label="Started" value={new Date(span.startTime).toLocaleTimeString()} />}
          {span.endTime && <Row label="Ended" value={new Date(span.endTime).toLocaleTimeString()} />}
          {span.model && <Row label="Model" value={span.model} mono />}
          {span.promptTokens !== undefined && <Row label="Prompt tk" value={span.promptTokens.toLocaleString()} mono />}
          {span.completionTokens !== undefined && <Row label="Compl. tk" value={span.completionTokens.toLocaleString()} mono />}
          {span.costUsd !== undefined && <Row label="Cost" value={`$${span.costUsd.toFixed(5)}`} mono />}

          {span.error && (
            <div
              className="rounded-md p-2.5 text-[11px]"
              style={{
                background: "var(--status-error-muted)",
                color: "var(--status-error)",
                fontFamily: "var(--font-paper)",
                lineHeight: 1.5,
              }}
            >
              {span.error}
            </div>
          )}
        </div>

        {/* Input / Output */}
        <div className="flex min-w-0 flex-1 gap-px overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
            <JsonViewer data={span.input} label="Input" />
          </div>
          <div
            className="w-px shrink-0"
            style={{ background: "var(--border-subtle)" }}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
            <JsonViewer
              data={span.output}
              label={span.status === "running" ? "Output (streaming…)" : "Output"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-disabled)" }}
      >
        {label}
      </span>
      <span
        className="text-[11px]"
        style={{
          color: "var(--text-secondary)",
          fontFamily: mono ? "var(--font-paper)" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )
}
