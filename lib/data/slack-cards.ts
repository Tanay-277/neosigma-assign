import type { SlackMessage, Lifecycle } from "@/lib/types"
import { getTraceById } from "@/lib/data/traces"
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

/** Build a simple fallback alert card from trace data when no pre-defined card exists */
export function buildFallbackSlackMessage(traceId: string): SlackMessage | null {
  const trace = getTraceById(traceId)
  if (!trace || trace.status !== "error") return null

  const errSpan = trace.spans.find((s) => s.error)
  const errMsg = errSpan?.error ?? "Unknown error"
  const model = trace.spans.find((s) => s.model)?.model ?? "unknown"

  return {
    id: `fallback_${traceId}`,
    scenario: "Auto-generated alert for failed trace without pre-defined card",
    channel: "#llm-ops",
    postedAt: new Date().toISOString(),
    traceId,
    lifecycle: "alert",
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `:rotating_light: Trace failed — ${trace.name}`, emoji: true },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: "*Status:* Needs attention" },
          { type: "mrkdwn", text: `Posted ${new Date().toLocaleString()}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: errSpan
            ? `The \`${errSpan.type}\` step *"${errSpan.name}"* failed in environment *${trace.metadata.environment ?? "unknown"}*.\n\`\`\`\n${errMsg}\n\`\`\``
            : `Trace failed with no specific error span.\n\`\`\`\n${errMsg}\n\`\`\``,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Cost:*\n$${trace.totalCostUsd.toFixed(6)}` },
          { type: "mrkdwn", text: `*Model:*\n${model}` },
          { type: "mrkdwn", text: `*Environment:*\n${trace.metadata.environment ?? "production"}` },
          { type: "mrkdwn", text: `*Tokens:*\n${trace.totalTokens.toLocaleString()}` },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Trace", emoji: true },
            action_id: "view_trace",
            url: `/traces/${traceId}`,
          },
        ],
      },
    ],
  }
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
