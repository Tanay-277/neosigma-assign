import type {
  Trace,
  DashboardMetrics,
  LatencyPoint,
  CostByModel,
  ErrorRatePoint,
  TokenPoint,
} from "@/lib/types"

/** Compute the p-th percentile from a sorted numeric array */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  const frac = idx - lo
  return sorted[lo] * (1 - frac) + sorted[hi] * frac
}

/** Round a timestamp down to the nearest N-hour bucket */
function toBucket(iso: string, hoursBucket: number): string {
  const d = new Date(iso)
  d.setMinutes(0, 0, 0)
  const bucketIndex = Math.floor(d.getUTCHours() / hoursBucket)
  d.setUTCHours(bucketIndex * hoursBucket)
  return d.toISOString()
}

export function computeMetrics(
  traces: Trace[],
  windowDays = 7
): DashboardMetrics {
  const now = Date.now()
  const windowMs = windowDays * 24 * 60 * 60 * 1000

  const inWindow = traces.filter(
    (t) => now - new Date(t.startTime).getTime() < windowMs
  )

  // ── Global KPIs ─────────────────────────────────────────────────────────────
  const completedTraces = inWindow.filter((t) => t.status !== "running")
  const errorTraces = inWindow.filter((t) => t.status === "error")
  const latencies = completedTraces
    .filter((t) => t.latencyMs !== undefined)
    .map((t) => t.latencyMs!)
    .sort((a, b) => a - b)

  const totalCostUsd = inWindow.reduce((s, t) => s + (t.totalCostUsd ?? 0), 0)

  // ── Latency over time (6h buckets) ──────────────────────────────────────────
  const latencyByBucket = new Map<string, number[]>()
  for (const t of completedTraces) {
    if (t.latencyMs === undefined) continue
    const bucket = toBucket(t.startTime, 6)
    const arr = latencyByBucket.get(bucket) ?? []
    arr.push(t.latencyMs)
    latencyByBucket.set(bucket, arr)
  }

  const latencyOverTime: LatencyPoint[] = Array.from(latencyByBucket.entries())
    .map(([bucket, vals]) => {
      const sorted = [...vals].sort((a, b) => a - b)
      return {
        bucket,
        p50: Math.round(percentile(sorted, 50)),
        p95: Math.round(percentile(sorted, 95)),
        count: vals.length,
      }
    })
    .sort((a, b) => a.bucket.localeCompare(b.bucket))

  // ── Cost by model ────────────────────────────────────────────────────────────
  const costMap = new Map<string, CostByModel>()
  for (const trace of inWindow) {
    for (const span of trace.spans) {
      if (!span.model || span.costUsd === undefined) continue
      const existing = costMap.get(span.model) ?? {
        model: span.model,
        totalCost: 0,
        traceCount: 0,
        totalTokens: 0,
      }
      existing.totalCost += span.costUsd
      existing.totalTokens += span.totalTokens ?? 0
      costMap.set(span.model, existing)
    }
  }
  // Count unique traces per model
  for (const trace of inWindow) {
    const modelsInTrace = new Set(
      trace.spans.filter((s) => s.model).map((s) => s.model!)
    )
    for (const model of modelsInTrace) {
      const entry = costMap.get(model)
      if (entry) entry.traceCount++
    }
  }
  const costByModel: CostByModel[] = Array.from(costMap.values()).sort(
    (a, b) => b.totalCost - a.totalCost
  )

  // ── Error rate over time (6h buckets) ────────────────────────────────────────
  const errorByBucket = new Map<string, { total: number; errors: number }>()
  for (const t of inWindow.filter((t) => t.status !== "running")) {
    const bucket = toBucket(t.startTime, 6)
    const entry = errorByBucket.get(bucket) ?? { total: 0, errors: 0 }
    entry.total++
    if (t.status === "error") entry.errors++
    errorByBucket.set(bucket, entry)
  }
  const errorRateOverTime: ErrorRatePoint[] = Array.from(
    errorByBucket.entries()
  )
    .map(([bucket, { total, errors }]) => ({
      bucket,
      total,
      errors,
      errorRate: total > 0 ? (errors / total) * 100 : 0,
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))

  // ── Token usage over time ────────────────────────────────────────────────────
  const tokenByBucket = new Map<
    string,
    { promptTokens: number; completionTokens: number }
  >()
  for (const trace of inWindow) {
    const bucket = toBucket(trace.startTime, 6)
    const entry = tokenByBucket.get(bucket) ?? {
      promptTokens: 0,
      completionTokens: 0,
    }
    for (const span of trace.spans) {
      entry.promptTokens += span.promptTokens ?? 0
      entry.completionTokens += span.completionTokens ?? 0
    }
    tokenByBucket.set(bucket, entry)
  }
  const tokenUsageOverTime: TokenPoint[] = Array.from(tokenByBucket.entries())
    .map(([bucket, { promptTokens, completionTokens }]) => ({
      bucket,
      promptTokens,
      completionTokens,
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))

  return {
    totalTraces: inWindow.length,
    errorRate:
      completedTraces.length > 0
        ? (errorTraces.length / completedTraces.length) * 100
        : 0,
    avgLatencyMs:
      latencies.length > 0
        ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
        : 0,
    p50LatencyMs: Math.round(percentile(latencies, 50)),
    p95LatencyMs: Math.round(percentile(latencies, 95)),
    totalCostUsd,
    latencyOverTime,
    costByModel,
    errorRateOverTime,
    tokenUsageOverTime,
  }
}
