"use client"

import React, { useState } from "react"
import Link from "next/link"
import type { Issue, IssuePriority, IssueStatus } from "@/lib/types"
import { updateIssueStatus } from "@/lib/data/issues"
import { cn } from "@/lib/utils"

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "var(--status-error)", bg: "color-mix(in oklch, var(--status-error) 14%, transparent)" },
  high:   { label: "High",   color: "var(--status-warning)", bg: "color-mix(in oklch, var(--status-warning) 14%, transparent)" },
  medium: { label: "Medium", color: "var(--accent)", bg: "var(--accent-muted)" },
  low:    { label: "Low",    color: "var(--text-tertiary)", bg: "var(--surface-3)" },
}

const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "var(--accent)" },
  in_progress: { label: "In Progress", color: "var(--status-warning)" },
  resolved:    { label: "Resolved",    color: "var(--status-success)" },
}

const STATUSES: IssueStatus[] = ["open", "in_progress", "resolved"]

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
  onStatusChange?: (id: string, status: IssueStatus) => void
}

export function IssueCard({ issue, onStatusChange }: IssueCardProps) {
  const [selectOpen, setSelectOpen] = useState(false)
  const pc = PRIORITY_CONFIG[issue.priority]
  const sc = STATUS_CONFIG[issue.status]

  function handleStatusChange(status: IssueStatus) {
    updateIssueStatus(issue.id, status)
    onStatusChange?.(issue.id, status)
    setSelectOpen(false)
  }

  return (
    <div className="group relative">
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

      {/* Status dots — show on hover */}
      <div
        className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.preventDefault()}
      >
        {STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          const isActive = s === issue.status
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className="rounded-full transition-all duration-150"
              style={{
                width: isActive ? 10 : 8,
                height: isActive ? 10 : 8,
                background: isActive ? cfg.color : "var(--surface-4)",
              }}
              title={cfg.label}
            />
          )
        })}
      </div>
    </div>
  )
}
