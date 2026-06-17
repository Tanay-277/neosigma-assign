"use client"

import { useState, useMemo, useEffect } from "react"
import type { CostByModel } from "@/lib/types"
import type { SortingState, RowSelectionState } from "@tanstack/react-table"
import { columns, MODEL_COLORS } from "./columns"
import { DataTable } from "./data-table"
import { DonutChart } from "./donut-chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Activity01Icon, DollarSignIcon, ChartAverageIcon } from "@hugeicons/core-free-icons"

const METRICS = [
  { value: "traces", label: "Traces", icon: Activity01Icon },
  { value: "cost", label: "Total cost", icon: DollarSignIcon },
  { value: "tokens", label: "Avg tokens", icon: ChartAverageIcon },
] as const

const MAX_DONUT_SEGMENTS = 9
const OTHER_COLOR = "var(--surface-4)"
const LABELS = { traces: "traces", cost: "total cost", tokens: "avg tokens" } as const

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
    const source = selected.length > 0
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
    <div className="flex flex-col animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none"
                style={{ color: "var(--text-tertiary)" }}
              />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Filter models..."
                className="h-7 pl-8 pr-7 text-[11px] rounded-3xl w-full"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors"
                >
                  <X className="size-3" style={{ color: "var(--text-tertiary)" }} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {selectedCount > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="text-[10px] font-mono hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Clear ({selectedCount})
                </button>
              )}
              <span
                className="text-[10px] font-mono shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              >
                {filteredData.length}/{data.length}
              </span>
            </div>
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

        <div className="w-full lg:w-[380px] shrink-0 flex flex-col items-center gap-4 animate-slide-up">
          <Tabs
            value={donutMetric}
            onValueChange={(v) => setDonutMetric(v as "traces" | "cost" | "tokens")}
          >
            <TabsList className="h-auto! gap-0.5">
              {METRICS.map((m) => (
                <TabsTrigger key={m.value} value={m.value} className="px-3 py-1 text-xs font-semibold uppercase font-mono tracking-widest gap-1.5">
                  <HugeiconsIcon icon={m.icon} size={14} className="shrink-0" />
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-row items-center gap-4 w-full lg:flex-col lg:items-center">
            <div className="flex-1 flex justify-center min-w-0">
              <DonutChart
                data={donutData}
                total={donutTotal}
                metricLabel={metricLabel}
                onSegmentClick={handleSegmentClick}
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:hidden min-w-0 max-w-48">
              {donutData.map((seg) => (
                <div
                  key={seg.label}
                  className="flex items-center gap-1.5 min-w-0"
                  style={{ opacity: seg.opacity }}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: seg.color }}
                  />
                  <span
                    className="text-[10px] font-mono truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {seg.label}
                  </span>
                  <span
                    className="text-[10px] font-mono tabular-nums shrink-0 ml-auto"
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
    </div>
  )
}
