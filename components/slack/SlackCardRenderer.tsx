"use client"

import React, { useState } from "react"
import type { SlackMessage, Lifecycle } from "@/lib/types"
import { renderBlock } from "@/components/slack/blocks/registry"
import { Code, LayoutGrid } from "lucide-react"

const LIFECYCLE_TEXT_COLOR: Record<Lifecycle, string> = {
  alert:         "var(--status-error)",
  investigating: "var(--status-warning)",
  triage:        "var(--accent)",
  resolved:      "var(--status-success)",
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 2) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface SlackCardRendererProps {
  message: SlackMessage
}

export function SlackCardRenderer({ message }: SlackCardRendererProps) {
  const [showRaw, setShowRaw] = useState(false)
  const labelColor = LIFECYCLE_TEXT_COLOR[message.lifecycle]

  return (
    <div className="flex w-full max-w-[680px] flex-col gap-0 select-none animate-fade-in mx-auto">
      {/* Card metadata (above content) */}
      <div className="mb-4 flex flex-wrap items-center gap-2 px-1">
        <span
          className="hidden sm:inline-block rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold"
          style={{
            background: "var(--surface-3)",
            color: "var(--text-secondary)",
          }}
        >
          {message.channel.startsWith("#") ? message.channel : `#${message.channel}`}
        </span>
        <span className="hidden sm:inline text-[10px]" style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}>
          {relativeTime(message.postedAt)}
        </span>
        <span className="hidden sm:inline text-[10px]" style={{ color: "var(--text-disabled)" }}>·</span>
        <span
          className="text-[10px]"
          style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}
        >
          {message.id}
        </span>

        {/* Dynamic status badge next to trace ID */}
        <span
          className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ml-1"
          style={{
            background: `color-mix(in oklch, ${labelColor} 12%, transparent)`,
            color: labelColor,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse" style={{ background: labelColor }} />
          {message.lifecycle}
        </span>

        {/* Card/JSON segmented tabs */}
        <div className="ml-auto bg-[var(--surface-3)] p-0.5 rounded-full border border-[var(--border-subtle)] flex items-center gap-0.5 shadow-xs select-none">
          <button
            onClick={() => setShowRaw(false)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
              !showRaw
                ? "bg-white text-[var(--text-primary)] dark:text-[var(--bg)] shadow-xs border border-[var(--border-subtle)]/50"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-transparent"
            }`}
            title="Show alert block layout (Card)"
          >
            <LayoutGrid size={12} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setShowRaw(true)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
              showRaw
                ? "bg-white text-[var(--text-primary)] dark:text-[var(--bg)] shadow-xs border border-[var(--border-subtle)]/50"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-transparent"
            }`}
            title="Show raw Block Kit JSON"
          >
            <Code size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Flat Blocks Container - Border-free, shadowless, flowing directly */}
      <div className="flex min-w-0 flex-1 flex-col gap-6 py-2">
        {showRaw ? (
          <pre
            className="overflow-x-auto text-[11px] leading-relaxed p-2"
            style={{
              fontFamily: "var(--font-paper)",
              color: "var(--text-secondary)",
            }}
          >
            {JSON.stringify(message.blocks, null, 2)}
          </pre>
        ) : (
          message.blocks.map((block, i) => renderBlock(block, i))
        )}
      </div>
    </div>
  )
}
