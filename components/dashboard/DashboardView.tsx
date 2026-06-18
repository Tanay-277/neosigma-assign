"use client"

import React from "react"
import type { DashboardMetrics } from "@/lib/types"
import { KpiCard } from "./KpiCard"
import { LatencyChart } from "./LatencyChart"
import { CostByModelChart } from "./CostByModelChart"
import { ErrorRateChart } from "./ErrorRateChart"
import { TokenUsageChart } from "./TokenUsageChart"
import { ModelBreakdownPanel } from "./model-breakdown/panel"

interface DashboardViewProps {
  metrics: DashboardMetrics
}

function ChartCard({
  title,
  subtitle,
  children,
  id,
}: {
  title: string
  subtitle?: string | React.ReactNode
  children: React.ReactNode
  id?: string
}) {
  return (
    <div
      id={id}
      className="flex flex-col gap-3 rounded-3xl p-4 md:p-5"
      style={{
        background: "var(--surface-2)",
      }}
    >
      {/* min-w-0 + gap-2 on the row: title gets min-w-0 so it can truncate
          rather than pushing the subtitle off-screen at narrow card widths.
          subtitle gets shrink-0 so it always shows at its natural size. */}
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold uppercase font-mono tracking-widest" style={{ color: "var(--text-tertiary)" }}>
          {title}
        </h3>
        {subtitle && (
          <div className="shrink-0 text-[10px] font-mono text-[--text-tertiary]">
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export function DashboardView({ metrics }: DashboardViewProps) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between border-b pl-14 pr-4 sm:px-6 py-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Last 14 days · {metrics.totalTraces} traces
          </p>
        </div>
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 xl:p-6">
        <div className="flex w-full flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 rounded-3xl overflow-hidden gap-px" style={{ background: "var(--border-subtle)" }}>
            <KpiCard
              id="kpi-total-traces"
              label="Total Traces"
              value={metrics.totalTraces.toLocaleString()}
              subtext="in the last 14 days"
              accentColor="var(--accent)"
              change="+8.3%"
              trend="up"
              sparklineData={metrics.errorRateOverTime.map(d => d.total)}
            />
            <KpiCard
              id="kpi-error-rate"
              label="Error Rate"
              value={`${metrics.errorRate.toFixed(1)}%`}
              subtext={`${Math.round((metrics.errorRate / 100) * metrics.totalTraces)} failed`}
              accentColor={metrics.errorRate > 10 ? "var(--status-error)" : "var(--status-success)"}
              trend={metrics.errorRate > 10 ? "up" : "down"}
              change={`${metrics.errorRate > 10 ? "+" : "-"}${Math.abs(metrics.errorRate * 0.15).toFixed(1)}pp`}
              sparklineData={metrics.errorRateOverTime.map(d => d.errorRate)}
            />
            <KpiCard
              id="kpi-p50-latency"
              label="Latency"
              accentColor="var(--chart-1)"
              tabs={[
                {
                  id: "p50",
                  label: "p50",
                  value: `${metrics.p50LatencyMs}ms`,
                  subtext: `p95: ${metrics.p95LatencyMs}ms`,
                  change: "-3.5%",
                  trend: "down",
                  sparklineData: metrics.latencyOverTime.map(d => d.p50),
                },
                {
                  id: "p95",
                  label: "p95",
                  value: `${metrics.p95LatencyMs}ms`,
                  subtext: "99th percentile latency",
                  change: "-1.2%",
                  trend: "down",
                  sparklineData: metrics.latencyOverTime.map(d => d.p95),
                },
              ]}
            />
            <KpiCard
              id="kpi-total-cost"
              label="Total Cost"
              value={`$${metrics.totalCostUsd.toFixed(3)}`}
              subtext="across all models"
              accentColor="var(--status-warning)"
              change="2%"
              trend="neutral"
              sparklineData={metrics.costOverTime.map(d => d.cost)}
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              id="chart-latency"
              title="Latency over time"
              subtitle={
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--chart-1)" }} />
                    <span>p50</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width={14} height={2} aria-hidden className="shrink-0">
                      <line x1={0} y1={1} x2={14} y2={1}
                        stroke="var(--chart-3)" strokeWidth={1.5} strokeDasharray="4,3" />
                    </svg>
                    <span>p95</span>
                  </span>
                </div>
              }
            >
              <LatencyChart data={metrics.latencyOverTime} />
            </ChartCard>

            <ChartCard
              id="chart-cost-model"
              title="Cost by model"
              subtitle="Total USD"
            >
              <CostByModelChart data={metrics.costByModel} />
            </ChartCard>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              id="chart-error-rate"
              title="Error rate over time"
              subtitle="%"
            >
              <ErrorRateChart data={metrics.errorRateOverTime} />
            </ChartCard>

            <ChartCard
              id="chart-tokens"
              title="Token usage over time"
              subtitle={
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--chart-1)" }} />
                    <span>Total</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width={14} height={2} aria-hidden className="shrink-0">
                      <line x1={0} y1={1} x2={14} y2={1}
                        stroke="var(--chart-2)" strokeWidth={1.25} strokeDasharray="4,3" />
                    </svg>
                    <span>Prompt</span>
                  </span>
                </div>
              }
            >
              <TokenUsageChart data={metrics.tokenUsageOverTime} />
            </ChartCard>
          </div>

          {/* Model breakdown */}
          {metrics.costByModel.length > 0 && <ModelBreakdownPanel data={metrics.costByModel} />}
        </div>
      </div>
    </div>
  )
}
