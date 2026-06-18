import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { getTraceById } = await import("@/lib/data/traces")
  const trace = getTraceById(id)
  return {
    title: trace ? `${trace.name} — Trace` : "Trace not found",
  }
}

export default async function TraceDetailPage({ params }: Props) {
  const { id } = await params
  const { getTraceById, allTraces } = await import("@/lib/data/traces")
  const { TraceExplorer } = await import("@/components/traces/TraceExplorer")

  const trace = getTraceById(id)
  if (!trace) notFound()

  return (
    <div className="flex h-full flex-col overflow-hidden ">
      <TraceExplorer traces={allTraces} initialId={id} />
    </div>
  )
}
