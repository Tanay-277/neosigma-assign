"use client"

import React, { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import type { SpanNode } from "@/lib/types"
import { cn, formatTime, formatInt } from "@/lib/utils"

function highlightLine(line: string): React.ReactNode {
  // Match key: value rows
  const keyMatch = line.match(/^(\s*)("([^"]+)"\s*:\s*)(.*)$/)
  if (keyMatch) {
    const [, indent, , keyName, valuePart] = keyMatch
    let renderedValue: React.ReactNode = valuePart

    const stringMatch = valuePart.match(/^(".*")([,\]}]*)$/)
    if (stringMatch) {
      const [, str, rest] = stringMatch
      renderedValue = (
        <>
          <span className="json-string">{str}</span>
          {rest}
        </>
      )
    } else {
      const numberMatch = valuePart.match(/^([-\d.]+)([,\]}]*)$/)
      if (numberMatch) {
        const [, num, rest] = numberMatch
        renderedValue = (
          <>
            <span className="json-number">{num}</span>
            {rest}
          </>
        )
      } else {
        const kwMatch = valuePart.match(/^(true|false|null)([,\]}]*)$/)
        if (kwMatch) {
          const [, kw, rest] = kwMatch
          renderedValue = (
            <>
              <span className="json-keyword">{kw}</span>
              {rest}
            </>
          )
        }
      }
    }

    return (
      <>
        {indent}
        <span className="json-key">{keyName}</span>: {renderedValue}
      </>
    )
  }

  // Match standalone strings in arrays
  const arrayStringMatch = line.match(/^(\s*)(".*")([,\]}]*)$/)
  if (arrayStringMatch) {
    const [, indent, str, rest] = arrayStringMatch
    return (
      <>
        {indent}
        <span className="json-string">{str}</span>
        {rest}
      </>
    )
  }

  // Match standalone numbers in arrays
  const arrayNumMatch = line.match(/^(\s*)([-\d.]+)([,\]}]*)$/)
  if (arrayNumMatch) {
    const [, indent, num, rest] = arrayNumMatch
    return (
      <>
        {indent}
        <span className="json-number">{num}</span>
        {rest}
      </>
    )
  }

  // Match standalone keywords in arrays
  const arrayKwMatch = line.match(/^(\s*)(true|false|null)([,\]}]*)$/)
  if (arrayKwMatch) {
    const [, indent, kw, rest] = arrayKwMatch
    return (
      <>
        {indent}
        <span className="json-keyword">{kw}</span>
        {rest}
      </>
    )
  }

  return line
}

function formatJson(obj: unknown): React.ReactNode {
  const text = JSON.stringify(obj, null, 2)
  const lines = text.split("\n").map((line, i) => (
    <div key={i}>{highlightLine(line)}</div>
  ))
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
  const [ioTab, setIoTab] = useState<"input" | "output">("input")

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

  const ioLabel =
    span.status === "running" && ioTab === "output"
      ? "Output (streaming…)"
      : ioTab === "input"
        ? "Input"
        : "Output"

  return (
    <div
      className="animate-slide-up flex flex-col overflow-hidden border-t"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--surface-1)",
        height: 320,
      }}
    >
      {/* Header — 2 rows on mobile */}
      <div
        className="flex shrink-0 flex-col gap-1.5 border-b px-4 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Row 1: type badge, name, close */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              background: `color-mix(in oklch, ${TYPE_COLORS[span.type] ?? "var(--text-tertiary)"} 15%, transparent)`,
              color: TYPE_COLORS[span.type] ?? "var(--text-tertiary)",
            }}
          >
            {span.type}
          </span>
          <span
            className="min-w-0 truncate text-[13px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {span.name}
          </span>
          <button
            onClick={onClose}
            className="ml-auto shrink-0 rounded p-1 transition-colors hover:bg-[--surface-3]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <X size={14} />
          </button>
        </div>
        {/* Row 2: status + ID copy */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px]",
              span.status === "success" && "text-[var(--status-success)]",
              span.status === "error" && "text-[var(--status-error)]",
              span.status === "running" && "text-[var(--status-running)]"
            )}
          >
            {span.status}
          </span>
          <span style={{ color: "var(--text-disabled)" }}>·</span>
          <button
            onClick={copyId}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-[--surface-3] min-w-0"
            style={{ fontFamily: "var(--font-paper)", color: "var(--text-tertiary)", fontSize: 10 }}
          >
            <span className="truncate">{span.id}</span>
            {copied ? <Check size={10} className="shrink-0" /> : <Copy size={10} className="shrink-0" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Vertical tab strip — desktop only (left side) */}
        <div
          className="hidden lg:flex shrink-0 flex-col border-r w-8"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setIoTab("input")}
            className="flex flex-col items-center justify-center text-[10px] font-semibold uppercase tracking-widest transition-colors duration-75"
            style={{
              height: "50%",
              color: ioTab === "input" ? "var(--accent)" : "var(--text-disabled)",
              background: ioTab === "input" ? "var(--accent-muted)" : "transparent",
              borderLeft: ioTab === "input" ? "2px solid var(--accent)" : "2px solid transparent",
              fontFamily: "var(--font-paper)",
            }}
          >
            {"Input".split("").map((ch, i) => <span key={i}>{ch}</span>)}
          </button>
          <div style={{ height: 1, background: "var(--border-subtle)" }} />
          <button
            onClick={() => setIoTab("output")}
            className="flex flex-col items-center justify-center text-[10px] font-semibold uppercase tracking-widest transition-colors duration-75"
            style={{
              height: "50%",
              color: ioTab === "output" ? "var(--accent)" : "var(--text-disabled)",
              background: ioTab === "output" ? "var(--accent-muted)" : "transparent",
              borderLeft: ioTab === "output" ? "2px solid var(--accent)" : "2px solid transparent",
              fontFamily: "var(--font-paper)",
            }}
          >
            {"Output".split("").map((ch, i) => <span key={i}>{ch}</span>)}
          </button>
        </div>

        {/* I/O area */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          {/* JSON content */}
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
            {/* Mobile horizontal tabs */}
            <div className="flex shrink-0 border-b mb-3 lg:hidden" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                onClick={() => setIoTab("input")}
                className="flex-1 pb-2 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-75"
                style={{
                  color: ioTab === "input" ? "var(--accent)" : "var(--text-disabled)",
                  borderBottom: ioTab === "input" ? "2px solid var(--accent)" : "2px solid transparent",
                  fontFamily: "var(--font-paper)",
                  marginBottom: -1,
                }}
              >
                Input
              </button>
              <button
                onClick={() => setIoTab("output")}
                className="flex-1 pb-2 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-75"
                style={{
                  color: ioTab === "output" ? "var(--accent)" : "var(--text-disabled)",
                  borderBottom: ioTab === "output" ? "2px solid var(--accent)" : "2px solid transparent",
                  fontFamily: "var(--font-paper)",
                  marginBottom: -1,
                }}
              >
                Output
              </button>
            </div>

            <JsonViewer
              data={ioTab === "input" ? span.input : span.output}
              label={ioLabel}
            />

            {/* Metadata inline on mobile */}
            <div className="mt-6 flex flex-col gap-3 lg:hidden">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
                Details
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Row label="Latency" value={span.latencyMs !== undefined ? `${span.latencyMs}ms` : span.status === "running" ? "in progress" : "—"} mono />
                {span.startTime && <Row label="Started" value={formatTime(span.startTime)} />}
                {span.endTime && <Row label="Ended" value={formatTime(span.endTime)} />}
                {span.model && <Row label="Model" value={span.model} mono />}
                {span.promptTokens !== undefined && <Row label="Prompt tk" value={formatInt(span.promptTokens)} mono />}
                {span.completionTokens !== undefined && <Row label="Compl. tk" value={formatInt(span.completionTokens)} mono />}
                {span.costUsd !== undefined && <Row label="Cost" value={`$${span.costUsd.toFixed(5)}`} mono />}
              </div>
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
          </div>
        </div>

        {/* Metadata sidebar — desktop only */}
        <div
          className="hidden lg:flex shrink-0 flex-col gap-3 overflow-y-auto border-l p-4 w-52"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Row label="Latency" value={span.latencyMs !== undefined ? `${span.latencyMs}ms` : span.status === "running" ? "in progress" : "—"} mono />
          {span.startTime && <Row label="Started" value={formatTime(span.startTime)} />}
          {span.endTime && <Row label="Ended" value={formatTime(span.endTime)} />}
          {span.model && <Row label="Model" value={span.model} mono />}
          {span.promptTokens !== undefined && <Row label="Prompt tk" value={formatInt(span.promptTokens)} mono />}
          {span.completionTokens !== undefined && <Row label="Compl. tk" value={formatInt(span.completionTokens)} mono />}
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
