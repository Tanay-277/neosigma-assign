import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Alerts",
  description: "View LLM alert lifecycle — from incident detection to triage and resolution via Slack Block Kit cards.",
}

interface Props {
  searchParams: Promise<{ traceId?: string }>
}

export const dynamic = "force-dynamic"

export default async function SlackPage({ searchParams }: Props) {
  const { traceId } = await searchParams
  const { getAllIncidentGroups } = await import("@/lib/data/slack-cards")
  const { SlackView } = await import("@/components/slack/SlackView")

  const groups = getAllIncidentGroups()

  return (
    <div className="flex h-full flex-col overflow-hidden md:rounded-2xl bg-(--surface-1)">
      <SlackView groups={groups} initialTraceId={traceId} />
    </div>
  )
}
