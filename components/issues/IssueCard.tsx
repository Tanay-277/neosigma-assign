"use client"

import React from "react"
import Link from "next/link"
import type { Issue, IssuePriority } from "@/lib/types"

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "var(--status-error)", bg: "color-mix(in oklch, var(--status-error) 14%, transparent)" },
  high:   { label: "High",   color: "var(--status-warning)", bg: "color-mix(in oklch, var(--status-warning) 14%, transparent)" },
  medium: { label: "Medium", color: "var(--accent)", bg: "var(--accent-muted)" },
  low:    { label: "Low",    color: "var(--text-tertiary)", bg: "var(--surface-3)" },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const pc = PRIORITY_CONFIG[issue.priority]

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", issue.id)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <Link
        href={`/issues/${issue.id}`}
        className="flex flex-col gap-2 rounded-xl border p-3 transition-all duration-150 hover:shadow-xs"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Top row: priority badge + ID */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider leading-none"
            style={{ background: pc.bg, color: pc.color }}
          >
            {pc.label}
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-disabled)" }}
          >
            {issue.id}
          </span>
        </div>

        {/* Title */}
        <span
          className="text-[13px] font-medium leading-snug line-clamp-2"
          style={{ color: "var(--text-primary)" }}
        >
          {issue.title}
        </span>

        {/* Bottom row: assignee + time */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span
            className="truncate text-[10px]"
            style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}
          >
            {issue.assignee}
          </span>
          <span
            className="shrink-0 text-[10px]"
            style={{ color: "var(--text-disabled)", fontFamily: "var(--font-paper)" }}
          >
            {relativeTime(issue.createdAt)}
          </span>
        </div>

        {/* Error preview */}
        {issue.error && (
          <span
            className="rounded-md px-2 py-1 text-[10px] leading-relaxed line-clamp-2 font-mono"
            style={{
              background: "color-mix(in oklch, var(--status-error) 8%, transparent)",
              color: "var(--status-error)",
            }}
          >
            {issue.error}
          </span>
        )}
      </Link>
    </div>
  )
}
