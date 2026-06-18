"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Sidebar, ExternalLink } from "lucide-react"
import { getMessagesForTrace, buildFallbackSlackMessage } from "@/lib/data/slack-cards"
import { getTraceById } from "@/lib/data/traces"
import { SlackCardRenderer } from "@/components/slack/SlackCardRenderer"
import { LifecycleStepper } from "@/components/slack/LifecycleStepper"

interface SlackDetailProps {
  traceId: string
}

export function SlackDetail({ traceId }: SlackDetailProps) {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(() => {
    const msgs = getMessagesForTrace(traceId)
    return msgs[0]?.id ?? null
  })
  const [showContext, setShowContext] = useState(true)

  const messages = useMemo(() => {
    const direct = getMessagesForTrace(traceId)
    if (direct.length > 0) return direct
    const fallback = buildFallbackSlackMessage(traceId)
    return fallback ? [fallback] : []
  }, [traceId])

  const activeTrace = useMemo(() => getTraceById(traceId), [traceId])

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? messages[0] ?? null,
    [messages, activeMessageId]
  )

  const statusColor =
    activeTrace?.status === "success"
      ? "var(--status-success)"
      : activeTrace?.status === "error"
        ? "var(--status-error)"
        : "var(--status-running)"

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: "var(--surface-1)" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] font-mono" style={{ color: "var(--text-tertiary)" }}>
            {traceId}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
            No alerts found for this trace
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "var(--surface-1)" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-4 border-b pl-4 pr-4 md:px-6 h-13"
        style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
      >
        <Link
          href="/slack"
          className="flex items-center gap-1.5 py-4 text-[11px] transition-colors hover:opacity-80 text-[var(--text-secondary)]"
          title="Back to alerts list"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={12} className="shrink-0" />
          <span>Alerts</span>
        </Link>

        <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />

        <Link
          href={`/traces/${traceId}`}
          className="flex items-center gap-1.5 py-4 text-[11px] transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <span style={{ fontFamily: "var(--font-paper)" }}>{traceId}</span>
        </Link>

        <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />

        <span className="text-[10px] font-medium text-[--text-tertiary] font-mono select-none">
          Incident Alert Details
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Open in traces */}
          <Link
            href={`/traces/${traceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3]"
            style={{ width: 28, height: 28, color: "var(--text-tertiary)" }}
            aria-label="Open trace in new tab"
          >
            <ExternalLink size={12} />
          </Link>

          {/* Toggle Context */}
          <button
            onClick={() => setShowContext(!showContext)}
            className={`flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
              showContext
                ? "bg-[var(--surface-3)] text-[var(--accent)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
            }`}
            style={{ width: 28, height: 28 }}
            title={showContext ? "Hide Incident Context" : "Show Incident Context"}
          >
            <Sidebar size={14} />
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Center: message cards */}
        <div className="flex-1 relative flex flex-col lg:overflow-hidden w-full shrink-0 lg:shrink">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-36 md:pb-28 flex flex-col items-center w-full">
            {activeMessage ? (
              <div className="w-full max-w-[680px]">
                <SlackCardRenderer message={activeMessage} traceId={traceId} />
              </div>
            ) : (
              <div
                className="flex h-48 items-center justify-center text-xs font-mono"
                style={{ color: "var(--text-tertiary)" }}
              >
                Select a lifecycle stage
              </div>
            )}
          </div>

          <div className="fixed lg:absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <LifecycleStepper
              messages={messages}
              activeId={activeMessageId}
              onSelect={setActiveMessageId}
            />
          </div>
        </div>

        {/* Right: context sidebar */}
        {showContext && (
          <div
            className="hidden lg:flex flex-col border-l overflow-y-auto w-[320px] shrink-0"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--surface-1)",
            }}
          >
            <div className="p-5 md:p-6 shrink-0 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex flex-col gap-1.5 border-b pb-3 select-none" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[--text-tertiary] font-bold">
                  Incident Context
                </span>
                <h3 className="text-xs font-semibold text-[--text-primary] font-mono break-all leading-snug">
                  {traceId}
                </h3>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-5 select-none">
                <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Cost</span>
                  <span className="font-mono font-semibold text-xs text-[--text-primary]">
                    {activeTrace ? `$${activeTrace.totalCostUsd.toFixed(6)}` : "—"}
                  </span>
                </div>
                <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Tokens</span>
                  <span className="font-mono font-semibold text-xs text-[--text-primary]">
                    {activeTrace ? activeTrace.totalTokens.toLocaleString() : "—"}
                  </span>
                </div>
                <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Status</span>
                  <span className="font-mono font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ color: statusColor }}>
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: statusColor }} />
                    {activeTrace?.status ?? "—"}
                  </span>
                </div>
                <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Environment</span>
                  <span className="font-mono font-semibold text-[10px] text-[--text-secondary] capitalize truncate">
                    {activeTrace?.metadata.environment ?? "production"}
                  </span>
                </div>
              </div>

              {/* Error */}
              {activeTrace && activeTrace.spans.some((s) => s.error) && (
                <div className="bg-[color-mix(in_oklch,var(--status-error)_6%,var(--surface-3))] p-4 rounded-2xl flex flex-col gap-2 mt-5 border border-transparent">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--status-error)] flex items-center gap-1.5 select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)] shrink-0" />
                    Root Exception
                  </span>
                  <p className="font-mono text-[10px] leading-relaxed text-[var(--status-error)] break-words">
                    {activeTrace.spans.find((s) => s.error)?.error}
                  </p>
                </div>
              )}

              {/* Explore button */}
              <Link
                href={`/traces/${traceId}`}
                className="h-9 px-4 rounded-xl font-medium text-xs inline-flex items-center justify-center gap-2 text-white bg-[var(--accent)] hover:opacity-90 active:scale-95 transition-all duration-150 no-underline shrink-0 mt-5 w-full dark:bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] dark:text-[var(--accent)] dark:border dark:border-[var(--accent)] dark:hover:bg-[color-mix(in_oklch,var(--accent)_20%,transparent)]"
              >
                <span>Explore Trace Spans</span>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={13} className="rotate-180 shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
