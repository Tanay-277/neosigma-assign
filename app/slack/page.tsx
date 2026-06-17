import { Suspense } from "react"
import type { Metadata } from "next"
import { getAllIncidentGroups } from "@/lib/data/slack-cards"
import { SlackView } from "@/components/slack/SlackView"

export const metadata: Metadata = {
  title: "Alerts",
  description: "View LLM alert lifecycle — from incident detection to triage and resolution via Slack Block Kit cards.",
}

interface Props {
  searchParams: Promise<{ traceId?: string }>
}

export default async function SlackPage({ searchParams }: Props) {
  const { traceId } = await searchParams
  const groups = getAllIncidentGroups()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense>
        <SlackView groups={groups} initialTraceId={traceId} />
      </Suspense>
    </div>
  )
}
