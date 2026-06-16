import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTraceById, allTraces } from "@/lib/data/traces"
import { TraceExplorer } from "@/components/traces/TraceExplorer"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return allTraces.map((t) => ({ id: t.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const trace = getTraceById(id)
  return {
    title: trace ? `${trace.name} — Trace` : "Trace not found",
  }
}

export default async function TraceDetailPage({ params }: Props) {
  const { id } = await params
  const trace = getTraceById(id)
  if (!trace) notFound()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense>
        <TraceExplorer traces={allTraces} initialId={id} />
      </Suspense>
    </div>
  )
}
