"use client"

import React from "react"
import type { DashboardMetrics } from "@/lib/types"
import { KpiCard } from "./KpiCard"
import { LatencyChart } from "./LatencyChart"
import { CostByModelChart } from "./CostByModelChart"
import { ErrorRateChart } from "./ErrorRateChart"
import { TokenUsageChart } from "./TokenUsageChart"

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
  subtitle?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <div
      id={id}
      className="flex flex-col gap-3 rounded-md p-4"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-[13px] font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {subtitle}
          </span>
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
        className="flex shrink-0 items-center justify-between border-b px-6 py-4"
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex max-w-[1200px] flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard
              id="kpi-total-traces"
              label="Total Traces"
              value={metrics.totalTraces.toLocaleString()}
              subtext="in the last 14 days"
              accentColor="var(--accent)"
            />
            <KpiCard
              id="kpi-error-rate"
              label="Error Rate"
              value={`${metrics.errorRate.toFixed(1)}%`}
              subtext={`${Math.round((metrics.errorRate / 100) * metrics.totalTraces)} failed traces`}
              accentColor={metrics.errorRate > 10 ? "var(--status-error)" : "var(--status-success)"}
              trend={metrics.errorRate > 10 ? "up" : "neutral"}
            />
            <KpiCard
              id="kpi-p50-latency"
              label="p50 Latency"
              value={`${metrics.p50LatencyMs}ms`}
              subtext={`p95: ${metrics.p95LatencyMs}ms`}
              accentColor="var(--chart-1)"
            />
            <KpiCard
              id="kpi-total-cost"
              label="Total Cost"
              value={`$${metrics.totalCostUsd.toFixed(3)}`}
              subtext="across all models"
              accentColor="var(--status-warning)"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <ChartCard
              id="chart-latency"
              title="Latency over time"
              subtitle="p50 (solid) · p95 (dashed)"
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
          <div className="grid grid-cols-2 gap-4">
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
              subtitle="Prompt + completion"
            >
              <TokenUsageChart data={metrics.tokenUsageOverTime} />
            </ChartCard>
          </div>

          {/* Model breakdown table */}
          {metrics.costByModel.length > 0 && (
            <div
              className="rounded-md overflow-hidden"
              style={{ border: "1px solid var(--border-subtle)" }}
              id="model-breakdown-table"
            >
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)" }}
              >
                <h3 className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  Model breakdown
                </h3>
              </div>
              <div>
                {/* Header */}
                <div
                  className="grid border-b px-4 py-2"
                  style={{
                    gridTemplateColumns: "1fr 100px 100px 100px",
                    borderColor: "var(--border-subtle)",
                    background: "var(--surface-1)",
                  }}
                >
                  {["Model", "Traces", "Total cost", "Avg tokens"].map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {metrics.costByModel.map((row, i) => (
                  <div
                    key={row.model}
                    className="grid px-4 py-2.5"
                    style={{
                      gridTemplateColumns: "1fr 100px 100px 100px",
                      background: i % 2 === 0 ? "var(--surface-2)" : "var(--surface-1)",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: "var(--font-paper)", color: "var(--text-primary)" }}
                    >
                      {row.model}
                    </span>
                    <span className="text-[12px]" style={{ fontFamily: "var(--font-paper)", color: "var(--text-secondary)" }}>
                      {row.traceCount}
                    </span>
                    <span className="text-[12px]" style={{ fontFamily: "var(--font-paper)", color: "var(--text-secondary)" }}>
                      ${row.totalCost.toFixed(4)}
                    </span>
                    <span className="text-[12px]" style={{ fontFamily: "var(--font-paper)", color: "var(--text-secondary)" }}>
                      {row.traceCount > 0 ? Math.round(row.totalTokens / row.traceCount).toLocaleString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
