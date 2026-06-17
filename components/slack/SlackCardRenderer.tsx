"use client"

import React, { useState } from "react"
import type { SlackMessage, Lifecycle } from "@/lib/types"
import { renderBlock } from "@/components/slack/blocks/registry"
import { Code } from "lucide-react"

const LIFECYCLE_LEFT_BORDER: Record<Lifecycle, string> = {
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
  const borderColor = LIFECYCLE_LEFT_BORDER[message.lifecycle]

  return (
    <div className="flex max-w-[560px] flex-col gap-0">
      {/* Card metadata (above card, like Slack channel header) */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--surface-3)",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-paper)",
          }}
        >
          {message.channel}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}>
          {relativeTime(message.postedAt)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>·</span>
        <span
          className="text-[10px]"
          style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}
        >
          {message.id}
        </span>

        {/* Raw JSON toggle */}
        <button
          onClick={() => setShowRaw((p) => !p)}
          className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors hover:bg-[--surface-3]"
          style={{ color: showRaw ? "var(--accent)" : "var(--text-tertiary)" }}
          title="Toggle raw JSON"
        >
          <Code size={11} />
          {showRaw ? "Card" : "JSON"}
        </button>
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-md"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
        }}
      >
        {/* Left color bar */}
        <div
          style={{
            width: 4,
            flexShrink: 0,
            background: borderColor,
          }}
        />

        {/* Blocks */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          {showRaw ? (
            <pre
              className="overflow-x-auto text-[11px] leading-relaxed"
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
    </div>
  )
}
