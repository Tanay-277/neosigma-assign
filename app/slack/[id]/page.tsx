import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Alert — ${id}`,
  }
}

export default async function SlackAlertPage({ params }: Props) {
  const { id } = await params
  const { getTraceById } = await import("@/lib/data/traces")
  const { getMessagesForTrace } = await import("@/lib/data/slack-cards")

  const trace = getTraceById(id)
  const messages = getMessagesForTrace(id)

  if (!trace && messages.length === 0) notFound()

  const { SlackDetail } = await import("@/components/slack/SlackDetail")

  return (
    <div className="flex h-full flex-col overflow-hidden md:rounded-2xl bg-(--surface-1)">
      <SlackDetail traceId={id} />
    </div>
  )
}
