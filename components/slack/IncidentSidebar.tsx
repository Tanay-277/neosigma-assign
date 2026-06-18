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
        style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}
      >
        No incidents
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 p-3">
      {groups.map((group) => {
        const isActive = group.traceId === activeTraceId
        const lc = group.latestLifecycle
        const colors = LIFECYCLE_COLOR[lc]
        const latestMsg = group.messages[group.messages.length - 1]
        const formattedChannel = group.channel.startsWith("#") ? group.channel : `#${group.channel}`

        return (
          <button
            key={group.traceId}
            onClick={() => onSelect(group.traceId)}
            className={cn(
              "relative flex flex-col gap-2 rounded-2xl p-4 text-left transition-all duration-150 ease-out select-none cursor-pointer focus:outline-hidden border border-transparent",
              isActive
                ? "bg-[var(--surface-3)] shadow-xs"
                : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]/60"
            )}
          >
            {/* Top row: traceId + channel */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="truncate text-[11px] font-semibold"
                style={{
                  fontFamily: "var(--font-paper)",
                  color: "var(--text-primary)",
                }}
              >
                {group.traceId}
              </span>
              <span
                className="shrink-0 text-[10px] font-mono opacity-80"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}
              >
                {formattedChannel}
              </span>
            </div>

            {/* Bottom row: status pill + time */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                style={{ background: colors.bg, color: colors.text }}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: colors.text }} />
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
