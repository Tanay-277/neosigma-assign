"use client"

import React from "react"
import { AlertCircle, Eye, Search, CheckCircle2, HelpCircle, ArrowRight, PlayCircle } from "lucide-react"

const TUTORIAL_STAGES = [
  {
    key: "alert",
    label: "1. Alert Dispatched",
    icon: AlertCircle,
    color: "var(--status-error)",
    bg: "color-mix(in oklch, var(--status-error) 8%, var(--surface-3))",
    desc: "An anomaly (latency spike, error-rate threshold breach, or execution failure) is detected. Neosigma immediately fires an automated alert block to Slack.",
  },
  {
    key: "investigating",
    label: "2. Under Investigation",
    icon: Eye,
    color: "var(--status-warning)",
    bg: "color-mix(in oklch, var(--status-warning) 8%, var(--surface-3))",
    desc: "An engineer acknowledges the page. The alert status updates in Slack, informing the team that the issue is actively being investigated.",
  },
  {
    key: "triage",
    label: "3. Issue Triaged",
    icon: Search,
    color: "var(--accent)",
    bg: "color-mix(in oklch, var(--accent) 8%, var(--surface-3))",
    desc: "The root cause is identified (e.g. LLM provider rate-limiting, prompt parser errors, or timeout bounds) and documented inside the incident notes.",
  },
  {
    key: "resolved",
    label: "4. Incident Resolved",
    icon: CheckCircle2,
    color: "var(--status-success)",
    bg: "color-mix(in oklch, var(--status-success) 8%, var(--surface-3))",
    desc: "The engineer deploys a hotfix or the upstream LLM API recovers. The Slack card turns green to indicate the incident has been successfully closed.",
  },
]

export function IncidentTutorial() {
  return (
    <div className="mx-auto max-w-[620px] py-6 px-4 md:py-10 animate-fade-in flex flex-col gap-8">
      {/* Intro */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[--accent] font-mono text-xs uppercase tracking-widest font-semibold">
          <HelpCircle size={14} className="shrink-0" />
          <span>Interactive Guide</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-[--text-primary]">
          Understanding LLM Alert Lifecycles
        </h2>
        <p className="text-xs leading-relaxed text-[--text-secondary]">
          Neosigma maps and logs the live Slack notifications dispatched during LLM application incidents. This view acts as an incident control center, displaying Slack Block Kit notifications as they happen.
        </p>
      </div>

      {/* Tutorial Stages */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-[--text-tertiary] font-semibold mb-1">
          The 4 Lifecycle Stages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {TUTORIAL_STAGES.map((stage) => {
            const Icon = stage.icon
            return (
              <div
                key={stage.key}
                className="flex flex-col gap-2.5 p-4 rounded-2xl select-none transition-all duration-200"
                style={{ background: stage.bg }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
                    style={{
                      border: `1.5px solid ${stage.color}`,
                      background: "var(--surface-2)",
                    }}
                  >
                    <Icon size={11} style={{ color: stage.color }} />
                  </span>
                  <span className="text-xs font-semibold text-[--text-primary]" style={{ fontFamily: "var(--font-paper)" }}>
                    {stage.label}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[--text-secondary]">
                  {stage.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* How to use */}
      <div
        className="flex flex-col gap-4 p-5 rounded-2xl"
        style={{ background: "var(--surface-2)" }}
      >
        <div className="flex items-center gap-2 text-[--text-primary] font-semibold text-xs uppercase font-mono tracking-wider">
          <PlayCircle size={14} className="text-[--accent]" />
          <span>How to Navigate This Section</span>
        </div>
        
        <div className="flex flex-col gap-3 text-[11px] leading-relaxed text-[--text-secondary]">
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[--surface-3] flex items-center justify-center font-mono font-semibold shrink-0 text-[10px] text-[--text-primary]">
              1
            </span>
            <p className="mt-0.5">
              Select an incident from the <strong>Alerts</strong> sidebar list on the left.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[--surface-3] flex items-center justify-center font-mono font-semibold shrink-0 text-[10px] text-[--text-primary]">
              2
            </span>
            <p className="mt-0.5">
              Click the step nodes (Alert, Investigating, Triage, Resolved) in the top bar timeline to view the Slack Block Kit payload posted at that point in time.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[--surface-3] flex items-center justify-center font-mono font-semibold shrink-0 text-[10px] text-[--text-primary]">
              3
            </span>
            <p className="mt-0.5">
              Use the <strong>JSON / Card</strong> toggle button in the card header to inspect raw block kit schemas versus their visual Slack render.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[--surface-3] flex items-center justify-center font-mono font-semibold shrink-0 text-[10px] text-[--text-primary]">
              4
            </span>
            <p className="mt-0.5">
              Click the trace ID link (e.g. <code>trace_g0116</code>) in the breadcrumb to hop directly to its span execution tree inside the Trace Explorer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
