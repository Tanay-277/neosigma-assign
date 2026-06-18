"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Bug, Check } from "lucide-react"
import type { Issue, IssuePriority, IssueStatus, Trace } from "@/lib/types"
import { updateIssueStatus } from "@/lib/data/issues"
import { cn } from "@/lib/utils"

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "var(--status-error)", bg: "color-mix(in oklch, var(--status-error) 14%, transparent)" },
  high:   { label: "High",   color: "var(--status-warning)", bg: "color-mix(in oklch, var(--status-warning) 14%, transparent)" },
  medium: { label: "Medium", color: "var(--accent)", bg: "var(--accent-muted)" },
  low:    { label: "Low",    color: "var(--text-tertiary)", bg: "var(--surface-3)" },
}

const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "var(--accent)", bg: "var(--accent-muted)" },
  in_progress: { label: "In Progress", color: "var(--status-warning)", bg: "color-mix(in oklch, var(--status-warning) 14%, transparent)" },
  resolved:    { label: "Resolved",    color: "var(--status-success)", bg: "color-mix(in oklch, var(--status-success) 14%, transparent)" },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

interface RowProps {
  label: string
  value: React.ReactNode
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </span>
      <span className="text-[11px] text-right" style={{ color: "var(--text-secondary)" }}>
        {value}
      </span>
    </div>
  )
}

interface IssueDetailProps {
  issue: Issue
  trace: Trace | null
}

const STATUSES: IssueStatus[] = ["open", "in_progress", "resolved"]

export function IssueDetail({ issue, trace }: IssueDetailProps) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<IssueStatus>(issue.status)

  const pc = PRIORITY_CONFIG[issue.priority]
  const sc = STATUS_CONFIG[currentStatus]

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as IssueStatus
    updateIssueStatus(issue.id, newStatus)
    setCurrentStatus(newStatus)
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link
          href="/issues"
          className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] shrink-0"
          style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <span
          className="text-[11px] font-mono"
          style={{ color: "var(--text-disabled)" }}
        >
          {issue.id}
        </span>
        <div className="relative">
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="appearance-none cursor-pointer rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider leading-none outline-none"
            style={{ background: sc.bg, color: sc.color, border: "none" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider leading-none"
          style={{ background: pc.bg, color: pc.color }}
        >
          {pc.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6">
          {/* Title */}
          <h1 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
            {issue.title}
          </h1>

          {/* Details grid */}
          <div className="flex flex-col gap-1 mb-6">
            <Row label="Status" value={
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: sc.color }} />
                <select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  className="appearance-none cursor-pointer bg-transparent outline-none text-[11px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </span>
            } />
            <Row label="Priority" value={
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: pc.color }} />
                {pc.label}
              </span>
            } />
            <Row label="Assignee" value={issue.assignee} />
            <Row label="Created" value={formatDate(issue.createdAt)} />
            <Row label="Issue ID" value={
              <span style={{ fontFamily: "var(--font-paper)" }}>{issue.id}</span>
            } />
            <Row label="Trace" value={
              trace ? (
                <Link
                  href={`/traces/${issue.traceId}`}
                  className="flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-paper)" }}
                >
                  {issue.traceId}
                  <ExternalLink size={11} />
                </Link>
              ) : (
                <span className="font-mono" style={{ color: "var(--text-disabled)" }}>
                  {issue.traceId} (deleted)
                </span>
              )
            } />
          </div>

          {/* Error description */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-disabled)" }}>
              Error
            </p>
            <div
              className="rounded-md p-3 text-[12px] leading-relaxed font-mono"
              style={{
                background: "color-mix(in oklch, var(--status-error) 8%, transparent)",
                color: "var(--status-error)",
                border: "1px solid color-mix(in oklch, var(--status-error) 14%, transparent)",
              }}
            >
              {issue.error}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-disabled)" }}>
              Description
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {issue.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
