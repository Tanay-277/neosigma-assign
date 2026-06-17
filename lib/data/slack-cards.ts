import type { SlackMessage, Lifecycle } from "@/lib/types"
import rawData from "@/doc/slack-cards.json"

const data = rawData as { messages: SlackMessage[] }

/** All slack messages */
export const allMessages: SlackMessage[] = data.messages

/** Group messages by traceId */
export const messagesByTraceId: Map<string, SlackMessage[]> = new Map()
for (const msg of allMessages) {
  const existing = messagesByTraceId.get(msg.traceId) ?? []
  existing.push(msg)
  messagesByTraceId.set(msg.traceId, existing)
}

/** Get messages for a given trace, ordered by lifecycle stage */
const LIFECYCLE_ORDER: Lifecycle[] = [
  "alert",
  "investigating",
  "triage",
  "resolved",
]

export function getMessagesForTrace(traceId: string): SlackMessage[] {
  const msgs = messagesByTraceId.get(traceId) ?? []
  return msgs.sort(
    (a, b) =>
      LIFECYCLE_ORDER.indexOf(a.lifecycle) -
      LIFECYCLE_ORDER.indexOf(b.lifecycle)
  )
}

/** Get all unique traceIds that have slack messages */
export const tracesWithMessages: string[] = Array.from(
  messagesByTraceId.keys()
)

/** Check if a trace has any associated slack messages */
export function hasSlackMessages(traceId: string): boolean {
  return messagesByTraceId.has(traceId)
}

/** Get messages for a specific lifecycle stage */
export function getMessagesByLifecycle(lifecycle: Lifecycle): SlackMessage[] {
  return allMessages.filter((m) => m.lifecycle === lifecycle)
}

/** Get all incident groups — each group is a traceId with its lifecycle progression */
export interface IncidentGroup {
  traceId: string
  channel: string
  messages: SlackMessage[]
  latestLifecycle: Lifecycle
}

export function getAllIncidentGroups(): IncidentGroup[] {
  return Array.from(messagesByTraceId.entries()).map(([traceId, msgs]) => {
    const sorted = msgs.sort(
      (a, b) =>
        LIFECYCLE_ORDER.indexOf(a.lifecycle) -
        LIFECYCLE_ORDER.indexOf(b.lifecycle)
    )
    return {
      traceId,
      channel: sorted[0].channel,
      messages: sorted,
      latestLifecycle: sorted[sorted.length - 1].lifecycle,
    }
  })
}
