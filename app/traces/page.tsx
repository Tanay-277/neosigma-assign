import { Suspense } from "react"
import type { Metadata } from "next"
import { allTraces } from "@/lib/data/traces"
import { TraceExplorer } from "@/components/traces/TraceExplorer"

export const metadata: Metadata = {
  title: "Traces",
  description: "Explore and debug LLM traces with span trees, waterfall views, and linked alerts.",
}

export default function TracesPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense
        fallback={
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Loading traces…
          </div>
        }
      >
        <TraceExplorer traces={allTraces} />
      </Suspense>
    </div>
  )
}
