"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PanelLeft, Bug } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import type { Issue, IssueStatus } from "@/lib/types"
import { getAllIssues } from "@/lib/data/issues"
import { IssueColumn } from "@/components/issues/IssueColumn"

const STATUSES: IssueStatus[] = ["open", "in_progress", "resolved"]

export function IssueBoard() {
  const { setOpenMobile } = useSidebar()
  const [issues, setIssues] = useState<Issue[]>(() => getAllIssues())

  const grouped = useMemo(() => {
    const map: Record<IssueStatus, Issue[]> = { open: [], in_progress: [], resolved: [] }
    for (const issue of issues) {
      map[issue.status].push(issue)
    }
    return map
  }, [issues])

  // Refresh when navigating back
  React.useEffect(() => {
    setIssues(getAllIssues())
  }, [])

  const handleStatusChange = useCallback((id: string, status: IssueStatus) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <button
          onClick={() => setOpenMobile(true)}
          className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] sm:hidden shrink-0"
          style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
          aria-label="Open sidebar"
        >
          <PanelLeft size={16} />
        </button>
        <Bug size={15} style={{ color: "var(--text-tertiary)" }} />
        <h1 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Issues
        </h1>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-mono"
          style={{ background: "var(--surface-3)", color: "var(--text-tertiary)" }}
        >
          {issues.length}
        </span>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        {issues.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}>
            <Bug size={28} strokeWidth={1.2} style={{ color: "var(--text-disabled)" }} />
            <p className="text-[13px]">No issues yet</p>
            <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
              Create one from a failed trace's Slack alert
            </p>
          </div>
        ) : (
          <div className="flex h-full gap-4">
            {STATUSES.map((status) => (
              <IssueColumn key={status} status={status} issues={grouped[status]} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
