import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Traces",
  description: "Explore and debug LLM traces with span trees, waterfall views, and linked alerts.",
}

export const dynamic = "force-dynamic"

export default async function TracesPage() {
  const { allTraces } = await import("@/lib/data/traces")
  const { TraceExplorer } = await import("@/components/traces/TraceExplorer")

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl">
      <TraceExplorer traces={allTraces} />
    </div>
  )
}
