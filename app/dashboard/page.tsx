import type { Metadata } from "next"
import { allTraces } from "@/lib/data/traces"
import { computeMetrics } from "@/lib/data/metrics"
import { DashboardView } from "@/components/dashboard/DashboardView"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "LLM observability metrics — p50/p95 latency, cost by model, error rate, and token usage over time.",
}

export default function DashboardPage() {
  // 14-day window covers the full mock dataset (2026-06-07 to 2026-06-14)
  const metrics = computeMetrics(allTraces, 14)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DashboardView metrics={metrics} />
    </div>
  )
}
