"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, ListTree, Info } from "lucide-react"
import type { Trace } from "@/lib/types"
import { hasSlackMessages } from "@/lib/data/slack-cards"
import { SpanTree } from "@/components/traces/SpanTree"
import { cn, formatTime, formatInt } from "@/lib/utils"

function formatDuration(ms?: number): string {
  if (ms === undefined) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(4)}`
}

interface TraceDetailProps {
  trace: Trace
}

const TABS = [
  { key: "spans",    label: "Span Tree", icon: ListTree },
  { key: "metadata", label: "Metadata",   icon: Info },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function TraceDetail({ trace }: TraceDetailProps) {
  const [idCopied, setIdCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("spans")
  const hasAlerts = hasSlackMessages(trace.id)

  function copyId() {
    navigator.clipboard.writeText(trace.id)
    setIdCopied(true)
    setTimeout(() => setIdCopied(false), 1500)
  }

  const statusColor =
    trace.status === "success"
      ? "var(--status-success)"
      : trace.status === "error"
      ? "var(--status-error)"
      : "var(--status-running)"

  return (
    <div
      className="animate-slide-right flex h-full flex-col overflow-hidden"
      style={{ background: "var(--surface-1)" }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 border-b p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Trace name + status */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              className="truncate text-base font-semibold leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {trace.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* Status badge */}
            <span
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: `color-mix(in oklch, ${statusColor} 14%, transparent)`,
                border: `1px solid color-mix(in oklch, ${statusColor} 14%, transparent)`,
                color: statusColor,
              }}
            >
              <span
                className={cn(
                  "status-dot",
                  trace.status === "running" && "animate-running"
                )}
                style={{ background: statusColor }}
              />
              {trace.status}
            </span>

            {/* Slack alert button */}
            {hasAlerts && (
              <Link
                href={`/slack?traceId=${trace.id}`}
                className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors hover:opacity-80"
                style={{
                  background: "color-mix(in oklch, var(--status-warning) 14%, transparent)",
                  color: "var(--status-warning)",
                  border: "1px solid color-mix(in oklch, var(--status-warning) 30%, transparent)",
                }}
              >
                <ExternalLink size={11} />
                View Alert
              </Link>
            )}
          </div>
        </div>

        {/* ID */}
        <button
          onClick={copyId}
          className="mb-3 flex items-center gap-1.5 rounded px-0 py-0.5 transition-colors hover:bg-[--surface-3]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span
            className="text-[11px]"
            style={{ fontFamily: "var(--font-paper)" }}
          >
            {trace.id}
          </span>
          {idCopied ? <Check size={11} style={{ color: "var(--status-success)" }} /> : <Copy size={11} />}
        </button>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6">
          <Stat label="Cost" value={formatCost(trace.totalCostUsd)} />
          <Stat label="Tokens" value={formatInt(trace.totalTokens)} />
          <Stat label="Latency" value={formatDuration(trace.latencyMs)} />
          <Stat
            label="Started"
            value={formatTime(trace.startTime)}
          />
          {trace.metadata.environment && (
            <Stat label="Env" value={trace.metadata.environment} />
          )}
        </div>

        {/* Feedback row */}
        {trace.feedback && (
          <div
            className="mt-2 flex items-center gap-2 rounded px-2.5 py-1.5"
            style={{ background: "var(--surface-3)" }}
          >
            {trace.feedback.rating === "up" ? (
              <ThumbsUp size={12} style={{ color: "var(--status-success)" }} />
            ) : (
              <ThumbsDown size={12} style={{ color: "var(--status-error)" }} />
            )}
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Score: <span style={{ fontFamily: "var(--font-paper)" }}>{trace.feedback.score.toFixed(2)}</span>
            </span>
            {trace.feedback.comment && (
              <>
                <span style={{ color: "var(--text-disabled)" }}>·</span>
                <span className="text-[11px] italic font-mono" style={{ color: "var(--text-tertiary)" }}>
                  {trace.feedback.comment}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Custom Tabs ── */}
      <div
        className=" mt-2 flex shrink-0 items-center gap-0 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors duration-75"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-disabled)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
                fontFamily: "var(--font-paper)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "spans" && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SpanTree trace={trace} />
        </div>
      )}

      {activeTab === "metadata" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {/* Tags */}
            <section>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-disabled)" }}
              >
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {trace.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded px-2 py-1 text-[11px]"
                    style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Metadata */}
            <section>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-disabled)" }}
              >
                Metadata
              </p>
              <div
                className="overflow-hidden rounded-xl"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                {Object.entries(trace.metadata).map(([k, v], i) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-4 px-3 py-2"
                    style={{
                      background: i % 2 === 0 ? "var(--surface-2)" : "var(--surface-1)",
                    }}
                  >
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {k}
                    </span>
                    <span
                      className="text-right text-[11px] font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
        {label}
      </span>
      <span className="text-[12px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-paper)" }}>
        {value}
      </span>
    </div>
  )
}
