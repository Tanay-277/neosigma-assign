import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "LLM observability metrics — p50/p95 latency, cost by model, error rate, and token usage over time.",
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { allTraces } = await import("@/lib/data/traces")
  const { computeMetrics } = await import("@/lib/data/metrics")
  const { DashboardView } = await import("@/components/dashboard/DashboardView")

  const metrics = computeMetrics(allTraces, 14)

  return (
    <div className="flex h-full flex-col overflow-hidden md:rounded-2xl bg-(--surface-1)">
      <DashboardView metrics={metrics} />
    </div>
  )
}
