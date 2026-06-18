"use client"

import React from "react"
import type { SlackMessage, Lifecycle } from "@/lib/types"
import { Check, AlertCircle, Eye, Search, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

const LIFECYCLE_STEPS: {
  key: Lifecycle
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>
  desc: string
}[] = [
  { key: "alert",         label: "Alert",         icon: AlertCircle,   desc: "Incident triggered" },
  { key: "investigating", label: "Investigating",  icon: Eye,           desc: "Under investigation" },
  { key: "triage",        label: "Triage",         icon: Search,        desc: "Triaging root cause" },
  { key: "resolved",      label: "Resolved",       icon: CheckCircle2,  desc: "Incident resolved" },
]

const LIFECYCLE_COLOR: Record<Lifecycle, string> = {
  alert:         "var(--status-error)",
  investigating: "var(--status-warning)",
  triage:        "var(--accent)",
  resolved:      "var(--status-success)",
}

interface LifecycleStepperProps {
  messages: SlackMessage[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function LifecycleStepper({
  messages,
  activeId,
  onSelect,
}: LifecycleStepperProps) {
  const messageByLifecycle = new Map(messages.map((m) => [m.lifecycle, m]))
  const activeMsg = messages.find((m) => m.id === activeId)
  const activeLifecycle = activeMsg?.lifecycle

  const activeIdx = activeLifecycle
    ? LIFECYCLE_STEPS.findIndex((s) => s.key === activeLifecycle)
    : -1

  const currentIdx = activeMsg ? messages.indexOf(activeMsg) : -1

  const handlePrev = () => {
    if (currentIdx > 0) {
      onSelect(messages[currentIdx - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIdx < messages.length - 1) {
      onSelect(messages[currentIdx + 1].id)
    }
  }

  return (
    <div className="flex items-center gap-1 xs:gap-1.5 bg-[var(--surface-2)]/90 backdrop-blur-md border border-[var(--border-subtle)] px-2 xs:px-4 py-2 xs:py-2.5 rounded-full shadow-2xl select-none">
      {/* Previous chevron */}
      <button
        onClick={handlePrev}
        disabled={currentIdx <= 0}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-90"
        title="Previous stage"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-[var(--border-subtle)] mx-2" />

      {/* Steps List */}
      <div className="flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const msg = messageByLifecycle.get(step.key)
          const exists = !!msg
          const isCurrent = step.key === activeLifecycle
          const isPast = activeIdx > -1 && i < activeIdx

          const circleColor = isCurrent
            ? LIFECYCLE_COLOR[step.key]
            : isPast
            ? "var(--status-success)"
            : exists
            ? "var(--text-secondary)"
            : "var(--border-subtle)"

          const circleBg = isCurrent
            ? `color-mix(in oklch, ${LIFECYCLE_COLOR[step.key]} 15%, transparent)`
            : exists
            ? "var(--surface-3)"
            : "transparent"

          return (
            <React.Fragment key={step.key}>
              <div className="relative group flex items-center">
                {/* Tooltip floating above step */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 px-3 py-1.5 text-[10px] bg-[var(--surface-3)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap flex flex-col items-center gap-0.5 z-50">
                  <span className="font-bold uppercase tracking-wider text-[9px] font-mono" style={{ color: circleColor }}>
                    {step.label}
                  </span>
                  <span className="text-[9px] text-[--text-secondary]">
                    {exists ? (isCurrent ? "Active Stage" : "Click to view message") : "Stage not reached yet"}
                  </span>
                </div>

                <button
                  onClick={() => msg && onSelect(msg.id)}
                  disabled={!exists}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-hidden ${
                    exists
                      ? "cursor-pointer active:scale-90"
                      : "cursor-not-allowed opacity-25"
                  }`}
                  style={{
                    border: isCurrent ? `2.5px solid ${circleColor}` : `2px solid ${circleColor}`,
                    background: circleBg,
                    boxShadow: isCurrent ? `0 0 12px color-mix(in oklch, ${LIFECYCLE_COLOR[step.key]} 25%, transparent)` : "none",
                  }}
                >
                  {isPast ? (
                    <Check size={14} strokeWidth={3} style={{ color: "var(--status-success)" }} />
                  ) : (
                    <step.icon
                      size={14}
                      strokeWidth={2.4}
                      style={{
                        color: isCurrent
                          ? LIFECYCLE_COLOR[step.key]
                          : exists
                          ? "var(--text-primary)"
                          : "var(--text-disabled)",
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Connector line */}
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div
                  className="h-0.5 w-2.5 xs:w-6 rounded-full mx-0.5 xs:mx-1.5 shrink-0"
                  style={{
                    background: isPast
                      ? "var(--status-success)"
                      : isCurrent
                      ? "color-mix(in oklch, var(--accent) 35%, var(--border-subtle))"
                      : "var(--border-subtle)",
                    transition: "all 300ms ease",
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-[var(--border-subtle)] mx-2" />

      {/* Next chevron */}
      <button
        onClick={handleNext}
        disabled={currentIdx >= messages.length - 1}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-90"
        title="Next stage"
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
