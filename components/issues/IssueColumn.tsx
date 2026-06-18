"use client"

import React, { useState } from "react"
import type { Issue, IssueStatus } from "@/lib/types"
import { updateIssueStatus } from "@/lib/data/issues"
import { IssueCard } from "@/components/issues/IssueCard"

const COLUMN_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  open:        { label: "Open",       color: "var(--accent)" },
  in_progress: { label: "In Progress", color: "var(--status-warning)" },
  resolved:    { label: "Resolved",   color: "var(--status-success)" },
}

interface IssueColumnProps {
  status: IssueStatus
  issues: Issue[]
  onStatusChange?: (id: string, status: IssueStatus) => void
}

export function IssueColumn({ status, issues, onStatusChange }: IssueColumnProps) {
  const cfg = COLUMN_CONFIG[status]
  const [dragOver, setDragOver] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    updateIssueStatus(id, status)
    onStatusChange?.(id, status)
  }

  return (
    <div
      className="flex w-72 shrink-0 flex-col overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        outline: dragOver ? "2px dashed var(--accent)" : "none",
        outlineOffset: -2,
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pb-3">
        <span className="size-2 rounded-full shrink-0" style={{ background: cfg.color }} />
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          {cfg.label}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-mono"
          style={{ background: "var(--surface-3)", color: "var(--text-tertiary)" }}
        >
          {issues.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {issues.length === 0 && (
          <div className="flex items-center justify-center py-8 text-[11px]" style={{ color: "var(--text-disabled)" }}>
            No issues
          </div>
        )}
      </div>
    </div>
  )
}
