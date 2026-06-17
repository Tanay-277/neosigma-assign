"use client"

import React from "react"
import type { IncidentGroup } from "@/lib/data/slack-cards"
import type { Lifecycle } from "@/lib/types"
import { cn } from "@/lib/utils"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const LIFECYCLE_COLOR: Record<Lifecycle, { text: string; bg: string }> = {
  alert:         { text: "var(--status-error)",   bg: "color-mix(in oklch, var(--status-error) 14%, transparent)" },
  investigating: { text: "var(--status-warning)",  bg: "color-mix(in oklch, var(--status-warning) 14%, transparent)" },
  triage:        { text: "var(--accent)",          bg: "var(--accent-muted)" },
  resolved:      { text: "var(--status-success)",  bg: "color-mix(in oklch, var(--status-success) 14%, transparent)" },
}

const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  alert:         "Alert",
  investigating: "Investigating",
  triage:        "Triage",
  resolved:      "Resolved",
}

interface IncidentSidebarProps {
  groups: IncidentGroup[]
  activeTraceId: string | null
  onSelect: (traceId: string) => void
}

export function IncidentSidebar({
  groups,
  activeTraceId,
  onSelect,
}: IncidentSidebarProps) {
  if (groups.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        No incidents
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {groups.map((group) => {
        const isActive = group.traceId === activeTraceId
        const lc = group.latestLifecycle
        const colors = LIFECYCLE_COLOR[lc]
        const latestMsg = group.messages[group.messages.length - 1]

        return (
          <button
            key={group.traceId}
            onClick={() => onSelect(group.traceId)}
            className={cn(
              "flex flex-col gap-1.5 border-b px-4 py-3 text-left transition-colors duration-75",
              isActive ? "bg-[--accent-muted]" : "hover:bg-[--surface-3]"
            )}
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {/* Top row: traceId + channel */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="truncate text-[11px]"
                style={{
                  fontFamily: "var(--font-paper)",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {group.traceId}
              </span>
              <span
                className="shrink-0 text-[10px]"
                style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}
              >
                {group.channel}
              </span>
            </div>

            {/* Bottom row: lifecycle badge + time */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{ background: colors.bg, color: colors.text }}
              >
                {LIFECYCLE_LABEL[lc]}
              </span>
              {latestMsg && (
                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}
                >
                  {relativeTime(latestMsg.postedAt)}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
