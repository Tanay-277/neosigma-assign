// ─────────────────────────────────────────────────────────────────────────────
// Traces
// ─────────────────────────────────────────────────────────────────────────────

export type SpanStatus = "success" | "error" | "running"
export type SpanType =
  | "chain"
  | "llm"
  | "tool"
  | "retriever"
  | "parser"
  | "agent"
  | string

export interface Feedback {
  rating: "up" | "down"
  score: number
  comment: string | null
}

export interface Span {
  id: string
  parentId: string | null
  name: string
  type: SpanType
  status: SpanStatus
  startTime: string
  endTime?: string
  latencyMs?: number
  input?: Record<string, unknown>
  output?: Record<string, unknown> | null
  error?: string
  // LLM-only
  model?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  costUsd?: number
}

export interface Trace {
  id: string
  name: string
  status: SpanStatus
  startTime: string
  endTime?: string
  latencyMs?: number
  tags: string[]
  metadata: {
    userId?: string
    sessionId?: string
    environment?: string
    appVersion?: string
    [key: string]: unknown
  }
  totalTokens: number
  totalCostUsd: number
  spans: Span[]
  feedback?: Feedback
}

/** A span enriched with its children, for tree rendering */
export interface SpanNode extends Span {
  children: SpanNode[]
  depth: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Slack Block Kit
// ─────────────────────────────────────────────────────────────────────────────

export type Lifecycle = "alert" | "investigating" | "triage" | "resolved"

export type PlainText = { type: "plain_text"; text: string; emoji?: boolean }
export type Mrkdwn = { type: "mrkdwn"; text: string }
export type TextObject = PlainText | Mrkdwn

export type ImageElement = {
  type: "image"
  image_url: string
  alt_text: string
}

export type ButtonElement = {
  type: "button"
  text: PlainText
  action_id: string
  url?: string
  style?: "primary" | "danger"
  value?: string
}

export type SelectOption = {
  text: PlainText
  value: string
}

export type StaticSelectElement = {
  type: "static_select"
  placeholder: PlainText
  action_id: string
  options: SelectOption[]
  initial_option?: SelectOption
}

export type ActionElement = ButtonElement | StaticSelectElement

export type HeaderBlock = {
  type: "header"
  text: PlainText
}

export type SectionBlock = {
  type: "section"
  text?: Mrkdwn
  fields?: Mrkdwn[]
  accessory?: ActionElement | ImageElement
}

export type ContextBlock = {
  type: "context"
  elements: (Mrkdwn | ImageElement)[]
}

export type DividerBlock = {
  type: "divider"
}

export type ActionsBlock = {
  type: "actions"
  elements: ActionElement[]
}

export type Block =
  | HeaderBlock
  | SectionBlock
  | ContextBlock
  | DividerBlock
  | ActionsBlock

export interface SlackMessage {
  id: string
  scenario: string
  channel: string
  postedAt: string
  traceId: string
  lifecycle: Lifecycle
  blocks: Block[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Metrics
// ─────────────────────────────────────────────────────────────────────────────

export interface LatencyPoint {
  bucket: string // ISO timestamp bucket
  p50: number
  p95: number
  count: number
}

export interface CostByModel {
  model: string
  totalCost: number
  traceCount: number
  totalTokens: number
}

export interface ErrorRatePoint {
  bucket: string
  errorRate: number
  total: number
  errors: number
}

export interface TokenPoint {
  bucket: string
  promptTokens: number
  completionTokens: number
}

export interface DashboardMetrics {
  totalTraces: number
  errorRate: number
  avgLatencyMs: number
  p50LatencyMs: number
  p95LatencyMs: number
  totalCostUsd: number
  latencyOverTime: LatencyPoint[]
  costByModel: CostByModel[]
  errorRateOverTime: ErrorRatePoint[]
  tokenUsageOverTime: TokenPoint[]
}
