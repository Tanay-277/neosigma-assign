"use client"

import { useState, useMemo, useEffect } from "react"
import type { CostByModel } from "@/lib/types"
import type { SortingState, RowSelectionState } from "@tanstack/react-table"
import { columns, MODEL_COLORS } from "./columns"
import { DataTable } from "./data-table"
import { DonutChart } from "./donut-chart"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  DollarSignIcon,
  ChartAverageIcon,
} from "@hugeicons/core-free-icons"

const METRICS = [
  { value: "traces", label: "Traces", icon: Activity01Icon },
  { value: "tokens", label: "Avg tokens", icon: ChartAverageIcon },
  { value: "cost", label: "Total cost", icon: DollarSignIcon },
] as const

const MAX_DONUT_SEGMENTS = 9
const OTHER_COLOR = "var(--surface-4)"
const LABELS = {
  traces: "traces",
  cost: "total cost",
  tokens: "avg tokens",
} as const

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface ModelBreakdownPanelProps {
  data: CostByModel[]
}

export function ModelBreakdownPanel({ data }: ModelBreakdownPanelProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const debouncedFilter = useDebounce(globalFilter, 300)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "traceCount", desc: true },
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [donutMetric, setDonutMetric] = useState<"traces" | "cost" | "tokens">(
    "traces"
  )

  const instantFilteredData = useMemo(() => {
    const f = globalFilter.toLowerCase().trim()
    if (!f) return data
    return data.filter((row) => row.model.toLowerCase().includes(f))
  }, [data, globalFilter])

  const filteredData = useMemo(() => {
    const f = debouncedFilter.toLowerCase().trim()
    if (!f) return data
    return data.filter((row) => row.model.toLowerCase().includes(f))
  }, [data, debouncedFilter])

  const donutData = useMemo(() => {
    const selected = Object.keys(rowSelection)
    const source =
      selected.length > 0
        ? filteredData.filter((row) => selected.includes(row.model))
        : filteredData

    let segments = source.map((row, i) => {
      let value = 0
      if (donutMetric === "traces") value = row.traceCount
      else if (donutMetric === "cost") value = row.totalCost
      else if (donutMetric === "tokens" && row.traceCount > 0)
        value = Math.round(row.totalTokens / row.traceCount)

      return {
        label: row.model,
        value,
        color: MODEL_COLORS[i % MODEL_COLORS.length],
        opacity: 1,
      }
    })

    segments = segments.filter((d) => d.value > 0)
    segments.sort((a, b) => b.value - a.value)

    if (segments.length > MAX_DONUT_SEGMENTS) {
      const top = segments.slice(0, MAX_DONUT_SEGMENTS - 1)
      const rest = segments.slice(MAX_DONUT_SEGMENTS - 1)
      const otherTotal = rest.reduce((s, d) => s + d.value, 0)
      if (otherTotal > 0) {
        top.push({
          label: `Other (${rest.length})`,
          value: otherTotal,
          color: OTHER_COLOR,
          opacity: 1,
        })
      }
      segments = top
    }

    return segments
  }, [filteredData, donutMetric, rowSelection])

  const donutTotal = useMemo(
    () => donutData.reduce((s, d) => s + d.value, 0),
    [donutData]
  )

  const metricLabel = LABELS[donutMetric]
  const selectedCount = Object.keys(rowSelection).length

  function handleSegmentClick(label: string) {
    const model = label.startsWith("Other") ? null : label
    if (!model) return
    setRowSelection((prev) => {
      const next = { ...prev }
      if (next[model]) delete next[model]
      else next[model] = true
      return next
    })
  }

  function handleClearSelection() {
    setRowSelection({})
  }

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 rounded-3xl animate-fade-in"
      style={{
        background: "var(--surface-2)",
      }}
    >
      <div className="flex flex-col flex-1 min-w-0 gap-4 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase font-mono tracking-widest" style={{ color: "var(--text-tertiary)" }}>
            Model breakdown
          </h3>
          <span className="font-mono text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {filteredData.length}/{data.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Filter models..."
              className="h-7 w-full rounded-3xl pr-7 pl-8 text-[11px]"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute top-1/2 right-1.5 flex size-4 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
              >
                <X className="size-3" style={{ color: "var(--text-tertiary)" }} />
              </button>
            )}
          </div>
          {selectedCount > 0 && (
            <button
              onClick={handleClearSelection}
              className="font-mono text-[10px] transition-opacity hover:opacity-80 shrink-0"
              style={{ color: "var(--text-tertiary)" }}
            >
              Clear ({selectedCount})
            </button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={instantFilteredData}
          sorting={sorting}
          onSortingChange={setSorting}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
      <div className="shrink-0 flex flex-col animate-slide-up bg-border/50 rounded-2xl m-2 overflow-hidden">
        <div className="grid grid-cols-1 xs:grid-cols-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {METRICS.map((m) => {
            const active = donutMetric === m.value
            return (
              <button
                key={m.value}
                onClick={() => setDonutMetric(m.value as "traces" | "cost" | "tokens")}
                className="flex items-center justify-center gap-1.5 px-3 py-3 font-mono text-xs font-semibold tracking-widest uppercase transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                  background: active ? "var(--surface-4)" : "transparent",
                }}
              >
                <HugeiconsIcon icon={m.icon} size={14} className="shrink-0" />
                <span className="whitespace-nowrap">{m.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex w-full flex-col xs:flex-row items-center gap-4 lg:flex-col lg:items-center p-4 md:p-5 pt-3">
          <div className="flex min-w-0 flex-1 justify-center">
            <DonutChart
              data={donutData}
              total={donutTotal}
              metricLabel={metricLabel}
              onSegmentClick={handleSegmentClick}
            />
          </div>
          <div className="flex max-w-48 min-w-0 flex-col gap-1.5 lg:hidden">
            {donutData.map((seg) => (
              <div
                key={seg.label}
                className="flex min-w-0 items-center gap-1.5"
                style={{ opacity: seg.opacity }}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: seg.color }}
                />
                <span
                  className="truncate font-mono text-[10px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {seg.label}
                </span>
                <span
                  className="ml-auto shrink-0 font-mono text-[10px] tabular-nums"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {donutTotal > 0
                    ? `${((seg.value / donutTotal) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
