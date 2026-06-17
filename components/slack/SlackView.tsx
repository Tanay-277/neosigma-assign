"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"
import type { IncidentGroup } from "@/lib/data/slack-cards"
import type { SlackMessage } from "@/lib/types"
import { getMessagesForTrace } from "@/lib/data/slack-cards"
import { IncidentSidebar } from "@/components/slack/IncidentSidebar"
import { LifecycleStepper } from "@/components/slack/LifecycleStepper"
import { SlackCardRenderer } from "@/components/slack/SlackCardRenderer"

interface SlackViewProps {
  groups: IncidentGroup[]
  initialTraceId?: string
}

export function SlackView({ groups, initialTraceId }: SlackViewProps) {
  const defaultTraceId = initialTraceId ?? groups[0]?.traceId ?? null

  const [activeTraceId, setActiveTraceId] = useState<string | null>(defaultTraceId)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(() => {
    const msgs = defaultTraceId ? getMessagesForTrace(defaultTraceId) : []
    return msgs[0]?.id ?? null
  })

  // Get messages for active trace
  const messages: SlackMessage[] = useMemo(
    () => (activeTraceId ? getMessagesForTrace(activeTraceId) : []),
    [activeTraceId]
  )

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? messages[0] ?? null,
    [messages, activeMessageId]
  )

  function handleTraceSelect(traceId: string) {
    setActiveTraceId(traceId)
    setActiveMessageId(getMessagesForTrace(traceId)[0]?.id ?? null)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left sidebar ── */}
      <div
        className="flex w-[300px] shrink-0 flex-col border-r"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <MessageSquare size={14} style={{ color: "var(--text-tertiary)" }} />
          <h1 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Alerts
          </h1>
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              background: "var(--surface-3)",
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-paper)",
            }}
          >
            {groups.length}
          </span>
        </div>

        {/* Incident list */}
        <div className="flex-1 overflow-y-auto">
          <IncidentSidebar
            groups={groups}
            activeTraceId={activeTraceId}
            onSelect={handleTraceSelect}
          />
        </div>
      </div>

      {/* ── Right: lifecycle + card ── */}
      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {activeTraceId && messages.length > 0 ? (
          <>
            {/* Lifecycle stepper + back link row */}
            <div
              className="flex shrink-0 items-center gap-4 border-b px-6"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
            >
              {/* Back to trace link */}
              <Link
                href={`/traces?id=${activeTraceId}`}
                className="flex items-center gap-1.5 py-3 text-[11px] transition-colors hover:opacity-80"
                style={{ color: "var(--text-tertiary)" }}
              >
                <ArrowLeft size={11} />
                <span style={{ fontFamily: "var(--font-paper)" }}>{activeTraceId}</span>
              </Link>

              <div
                className="h-4 w-px"
                style={{ background: "var(--border-subtle)" }}
              />

              {/* Lifecycle stepper */}
              <div className="flex-1">
                <LifecycleStepper
                  messages={messages}
                  activeId={activeMessageId}
                  onSelect={setActiveMessageId}
                />
              </div>
            </div>

            {/* Card display area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeMessage ? (
                <SlackCardRenderer message={activeMessage} />
              ) : (
                <div
                  className="flex h-48 items-center justify-center text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Select a lifecycle stage
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            <MessageSquare size={32} strokeWidth={1.2} style={{ color: "var(--text-disabled)" }} />
            <p className="text-[13px]">Select an incident to view its Slack cards</p>
          </div>
        )}
      </div>
    </div>
  )
}
