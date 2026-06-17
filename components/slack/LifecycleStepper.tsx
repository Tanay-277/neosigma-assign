"use client"

import React from "react"
import type { SlackMessage, Lifecycle } from "@/lib/types"
import { Check, AlertCircle, Eye, Search, CheckCircle2 } from "lucide-react"

const LIFECYCLE_STEPS: {
  key: Lifecycle
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
}[] = [
  { key: "alert",         label: "Alert",         icon: AlertCircle },
  { key: "investigating", label: "Investigating",  icon: Eye },
  { key: "triage",        label: "Triage",         icon: Search },
  { key: "resolved",      label: "Resolved",       icon: CheckCircle2 },
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

  return (
    <div className="flex items-start gap-0 px-4 py-3">
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
          ? "var(--text-tertiary)"
          : "var(--border)"

        const circleBg = isCurrent
          ? `color-mix(in oklch, ${LIFECYCLE_COLOR[step.key]} 18%, transparent)`
          : "transparent"

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => msg && onSelect(msg.id)}
                disabled={!exists}
                className="flex flex-col items-center gap-1 disabled:cursor-not-allowed"
                title={exists ? `View ${step.label} message` : `No ${step.label} message yet`}
              >
                {/* Circle */}
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    border: `2px solid ${circleColor}`,
                    background: circleBg,
                  }}
                >
                  {isPast ? (
                    <Check size={12} style={{ color: "var(--status-success)" }} />
                  ) : (
                    <step.icon
                      size={13}
                      style={{
                        color: isCurrent ? LIFECYCLE_COLOR[step.key] : "var(--text-tertiary)",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-center text-[10px] leading-tight"
                  style={{
                    color: isCurrent
                      ? LIFECYCLE_COLOR[step.key]
                      : exists
                      ? "var(--text-secondary)"
                      : "var(--text-disabled)",
                    fontWeight: isCurrent ? 600 : 400,
                    maxWidth: 56,
                  }}
                >
                  {step.label}
                </span>
              </button>
            </div>

            {/* Connector line */}
            {i < LIFECYCLE_STEPS.length - 1 && (
              <div
                className="mt-3.5 flex-1"
                style={{
                  height: 2,
                  background: isPast ? "var(--status-success)" : "var(--border-subtle)",
                  minWidth: 16,
                  transition: "background 200ms ease",
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
