"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HelpCircle, Sidebar, PanelLeft, ExternalLink } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import type { IncidentGroup } from "@/lib/data/slack-cards"
import type { SlackMessage } from "@/lib/types"
import { getMessagesForTrace } from "@/lib/data/slack-cards"
import { getTraceById } from "@/lib/data/traces"
import { IncidentSidebar } from "@/components/slack/IncidentSidebar"
import { LifecycleStepper } from "@/components/slack/LifecycleStepper"
import { SlackCardRenderer } from "@/components/slack/SlackCardRenderer"
import { IncidentTutorial } from "@/components/slack/IncidentTutorial"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface SlackViewProps {
  groups: IncidentGroup[]
  initialTraceId?: string
}

export function SlackView({ groups, initialTraceId }: SlackViewProps) {
  const { setOpenMobile } = useSidebar()

  // If no trace ID was explicitly passed via URL params, set to null so the tutorial loads by default
  const defaultTraceId = initialTraceId ?? null

  const [activeTraceId, setActiveTraceId] = useState<string | null>(defaultTraceId)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(() => {
    const msgs = defaultTraceId ? getMessagesForTrace(defaultTraceId) : []
    return msgs[0]?.id ?? null
  })

  const [showContext, setShowContext] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        const mobile = window.innerWidth < 1024
        setIsMobile(mobile)
        if (mobile) {
          setShowContext(false)
        }
      }
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Get messages for active trace
  const messages: SlackMessage[] = useMemo(
    () => (activeTraceId ? getMessagesForTrace(activeTraceId) : []),
    [activeTraceId]
  )

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? messages[0] ?? null,
    [messages, activeMessageId]
  )

  const activeTrace = useMemo(
    () => (activeTraceId ? getTraceById(activeTraceId) : undefined),
    [activeTraceId]
  )

  function handleTraceSelect(traceId: string) {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.open(`/traces/${traceId}`, "_self")
      return
    }
    setActiveTraceId(traceId)
    setActiveMessageId(getMessagesForTrace(traceId)[0]?.id ?? null)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("traceId", traceId)
      window.history.pushState({}, "", url.toString())
    }
  }

  const sidebarContent = useMemo(() => {
    if (!activeTraceId) return null
    return (
      <div className="flex flex-col gap-5 h-full">
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b pb-3 select-none" style={{ borderColor: "var(--border-subtle)" }}>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[--text-tertiary] font-bold">
            Incident Context
          </span>
          <h3 className="text-xs font-semibold text-[--text-primary] font-mono break-all leading-snug">
            {activeTraceId}
          </h3>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 select-none">
          <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Cost</span>
            <span className="font-mono font-semibold text-xs text-[--text-primary]">
              {activeTrace ? `$${activeTrace.totalCostUsd.toFixed(6)}` : "—"}
            </span>
          </div>
          <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Tokens</span>
            <span className="font-mono font-semibold text-xs text-[--text-primary]">
              {activeTrace ? activeTrace.totalTokens.toLocaleString() : "—"}
            </span>
          </div>
          <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Status</span>
            <span className="font-mono font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ color: activeTrace?.status === "error" ? "var(--status-error)" : "var(--status-success)" }}>
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: activeTrace?.status === "error" ? "var(--status-error)" : "var(--status-success)" }} />
              {activeTrace?.status ?? "—"}
            </span>
          </div>
          <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[9px] text-[--text-tertiary] font-mono uppercase font-semibold">Environment</span>
            <span className="font-mono font-semibold text-[10px] text-[--text-secondary] capitalize truncate">
              {activeTrace?.metadata.environment ?? "production"}
            </span>
          </div>
        </div>

        {/* Trace Metadata/Error */}
        {activeTrace && activeTrace.spans.some((s) => s.error) && (
          <div className="bg-[color-mix(in_oklch,var(--status-error)_6%,var(--surface-3))] p-4 rounded-2xl flex flex-col gap-2 border border-transparent">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--status-error)] flex items-center gap-1.5 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)] shrink-0" />
              Root Exception
            </span>
            <p className="font-mono text-[10px] leading-relaxed text-[var(--status-error)] break-words">
              {activeTrace.spans.find((s) => s.error)?.error}
            </p>
          </div>
        )}

        {/* Action Button to hop directly to Trace Tree */}
        <Link
          href={`/traces/${activeTraceId}`}
          className="h-9 px-4 rounded-xl font-medium text-xs inline-flex items-center justify-center gap-2 text-white bg-[var(--accent)] hover:opacity-90 active:scale-95 transition-all duration-150 no-underline shrink-0 mt-auto dark:bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] dark:text-[var(--accent)] dark:border dark:border-[var(--accent)] dark:hover:bg-[color-mix(in_oklch,var(--accent)_20%,transparent)]"
        >
          <span>Explore Trace Spans</span>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} className="rotate-180 shrink-0" />
        </Link>
      </div>
    )
  }, [activeTraceId, activeTrace])

  return (
    <div className="flex h-full overflow-hidden w-full">
      {/* ── Left sidebar ── */}
      <div
        className={`w-full lg:w-[300px] shrink-0 flex flex-col lg:border-r ${
          activeTraceId ? "hidden lg:flex" : "flex"
        }`}
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 border-b px-4 py-3 shrink-0 h-13"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setOpenMobile(true)}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] lg:hidden shrink-0"
            style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
            aria-label="Open sidebar"
          >
            <PanelLeft size={16} />
          </button>
          <HugeiconsIcon icon={Message01Icon} size={15} className="text-[--text-tertiary] shrink-0" />
          <h1 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Alerts
          </h1>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold shrink-0"
            style={{
              background: "var(--surface-3)",
              color: "var(--text-secondary)",
            }}
          >
            {groups.length}
          </span>

          {/* Help toggle button */}
          <button
            onClick={() => {
              setActiveTraceId(null)
              setActiveMessageId(null)
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href)
                url.searchParams.delete("traceId")
                window.history.pushState({}, "", url.toString())
              }
            }}
            className="ml-auto p-1.5 rounded-lg text-[--text-tertiary] hover:bg-[--surface-3] hover:text-[--text-primary] transition-all duration-150 cursor-pointer"
            title="Show help & lifecycle tutorial"
          >
            <HelpCircle size={14} />
          </button>
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
        className={`min-w-0 flex-1 flex-col overflow-hidden ${
          activeTraceId ? "flex" : "hidden lg:flex"
        }`}
        style={{ background: "var(--surface-1)" }}
      >
        {activeTraceId && messages.length > 0 ? (
          <>
            {/* Header row */}
            <div
              className="flex shrink-0 items-center gap-4 border-b pl-4 pr-4 md:px-6 h-13 lg:pl-6"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
            >
              {/* Back to list on mobile */}
              <button
                onClick={() => {
                  setActiveTraceId(null)
                  setActiveMessageId(null)
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href)
                    url.searchParams.delete("traceId")
                    window.history.pushState({}, "", url.toString())
                  }
                }}
                className="lg:hidden flex items-center gap-1.5 py-4 text-[11px] transition-colors hover:opacity-80 text-[var(--text-secondary)]"
                title="Back to alerts list"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} className="shrink-0" />
                <span>Alerts</span>
              </button>

              <div
                className="h-4 w-px lg:hidden"
                style={{ background: "var(--border-subtle)" }}
              />

              {/* Back to trace link */}
              <Link
          href={`/traces/${activeTraceId}`}
                className="flex items-center gap-1.5 py-4 text-[11px] transition-colors hover:opacity-80"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="hidden lg:inline text-[var(--text-tertiary)] mr-1">Trace:</span>
                <span style={{ fontFamily: "var(--font-paper)" }}>{activeTraceId}</span>
              </Link>

              <div
                className="h-4 w-px"
                style={{ background: "var(--border-subtle)" }}
              />

              <span className="text-[10px] font-medium text-[--text-tertiary] font-mono select-none">
                Incident Alert Details
              </span>

              <div className="ml-auto flex items-center gap-1">
                {/* Open in new tab */}
                <Link
                  href={`/slack/${activeTraceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3]"
                  style={{ width: 28, height: 28, color: "var(--text-tertiary)" }}
                  aria-label="Open full alert view in new tab"
                >
                  <ExternalLink size={12} />
                </Link>

                {/* Toggle Sidebar Button */}
              <button
                onClick={() => setShowContext(!showContext)}
                className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  showContext
                    ? "bg-[var(--surface-3)] text-[var(--accent)]"
                    : "text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
                title={showContext ? "Hide Incident Context" : "Show Incident Context"}
              >
                <Sidebar size={14} />
              </button>
            </div>
          </div>

          {/* Split layout: Center Column (Slack details) + Right Sidebar (Incident Context) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden h-full">
            {/* Center Column Wrapper (non-scrollable on desktop, scrollable on mobile) */}
              <div className="flex-1 relative flex flex-col lg:overflow-hidden w-full shrink-0 lg:shrink">
                {/* Scrollable Slack message block flow */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-36 md:pb-28 flex flex-col items-center w-full">
                  {activeMessage ? (
                    <div className="w-full max-w-[680px]">
                      <SlackCardRenderer message={activeMessage} traceId={activeTraceId} />
                    </div>
                  ) : (
                    <div
                      className="flex h-48 items-center justify-center text-xs font-mono"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Select a lifecycle stage
                    </div>
                  )}
                </div>

                {/* Floating Bottom Navigation (LifecycleStepper) */}
                <div className="fixed lg:absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                  <LifecycleStepper
                    messages={messages}
                    activeId={activeMessageId}
                    onSelect={setActiveMessageId}
                  />
                </div>
              </div>

              {/* Right Column: Incident Context Panel (Desktop Inline with smooth transition) */}
              <div
                className={`hidden lg:flex flex-col border-l overflow-y-auto transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
                  showContext ? "w-[320px] opacity-100" : "w-0 opacity-0 pointer-events-none border-l-0!"
                }`}
                style={{
                  borderColor: "var(--border-subtle)",
                  background: "var(--surface-1)",
                }}
              >
                <div className="w-[320px] p-5 md:p-6 shrink-0 h-full overflow-y-auto">
                  {sidebarContent}
                </div>
              </div>

              {/* Mobile/Tablet Overlay Sheet */}
              <Sheet open={isMobile && showContext} onOpenChange={setShowContext}>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-[320px] max-w-[320px] p-0 border-l border-[var(--border-subtle)] bg-[var(--surface-1)]"
                >
                  <div className="p-5 md:p-6 h-full overflow-y-auto">
                    {sidebarContent}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[var(--surface-1)]">
            <IncidentTutorial />
          </div>
        )}
      </div>
    </div>
  )
}
