import type { Trace, Span, SpanNode } from "@/lib/types"
import rawData from "@/doc/traces.json"

const data = rawData as { traces: Trace[] }

/** All traces, sorted newest first */
export const allTraces: Trace[] = data.traces.sort(
  (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
)

/** Look up a single trace by ID */
export function getTraceById(id: string): Trace | undefined {
  return allTraces.find((t) => t.id === id)
}

/**
 * Build a recursive SpanNode tree from a flat span array.
 * Handles arbitrary nesting depth.
 */
export function buildSpanTree(spans: Span[]): SpanNode[] {
  const map = new Map<string, SpanNode>()
  const roots: SpanNode[] = []

  // First pass: create all nodes
  for (const span of spans) {
    map.set(span.id, { ...span, children: [], depth: 0 })
  }

  // Second pass: wire parent→child
  for (const node of map.values()) {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  }

  // Third pass: set depth
  function setDepth(node: SpanNode, depth: number) {
    node.depth = depth
    for (const child of node.children) {
      setDepth(child, depth + 1)
    }
  }
  for (const root of roots) setDepth(root, 0)

  return roots
}

/** Flatten a span tree back to a pre-order list (for waterfall rendering) */
export function flattenSpanTree(
  nodes: SpanNode[],
  collapsed: Set<string>
): SpanNode[] {
  const result: SpanNode[] = []
  function walk(node: SpanNode) {
    result.push(node)
    if (!collapsed.has(node.id)) {
      for (const child of node.children) walk(child)
    }
  }
  for (const node of nodes) walk(node)
  return result
}

/** Get all unique models across all traces */
export function getAllModels(): string[] {
  const models = new Set<string>()
  for (const trace of allTraces) {
    for (const span of trace.spans) {
      if (span.model) models.add(span.model)
    }
  }
  return Array.from(models).sort()
}

/** Get all unique environments */
export function getAllEnvironments(): string[] {
  const envs = new Set<string>()
  for (const trace of allTraces) {
    if (trace.metadata.environment) envs.add(trace.metadata.environment)
  }
  return Array.from(envs).sort()
}

/** Filter traces by status, search query, and environment */
export function filterTraces(
  traces: Trace[],
  {
    status,
    query,
    environment,
  }: { status?: string; query?: string; environment?: string }
): Trace[] {
  return traces.filter((t) => {
    if (status && status !== "all" && t.status !== status) return false
    if (environment && environment !== "all" && t.metadata.environment !== environment) return false
    if (query) {
      const q = query.toLowerCase()
      if (
        !t.id.toLowerCase().includes(q) &&
        !t.name.toLowerCase().includes(q) &&
        !t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
        return false
    }
    return true
  })
}
