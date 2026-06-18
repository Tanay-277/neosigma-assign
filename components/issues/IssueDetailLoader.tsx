"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Bug } from "lucide-react"
import { getIssueById } from "@/lib/data/issues"
import { getTraceById } from "@/lib/data/traces"
import { IssueDetail } from "@/components/issues/IssueDetail"

export function IssueDetailLoader({ id }: { id: string }) {
  const issue = getIssueById(id)

  if (!issue) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3" style={{ background: "var(--surface-1)" }}>
        <Bug size={32} strokeWidth={1.2} style={{ color: "var(--text-disabled)" }} />
        <p className="text-[13px] font-mono" style={{ color: "var(--text-tertiary)" }}>
          {id}
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
          Issue not found
        </p>
        <Link
          href="/issues"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-colors hover:opacity-80"
          style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={12} />
          Back to issues
        </Link>
      </div>
    )
  }

  const trace = getTraceById(issue.traceId)
  return <IssueDetail issue={issue} trace={trace ?? null} />
}
