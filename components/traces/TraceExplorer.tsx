"use client"

import React, { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, GitBranch, ArrowUpDown, ArrowUp, ArrowDown, LayoutList, LayoutGrid, ArrowLeft, PanelLeft } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import type { Trace } from "@/lib/types"
import { filterTraces } from "@/lib/data/traces"
import { cn } from "@/lib/utils"
import { TraceRow } from "@/components/traces/TraceRow"
import { TraceDetail } from "@/components/traces/TraceDetail"

type SortField = "name" | "latency" | "cost" | "time"
type SortDir = "asc" | "desc"

function SortIcon({ field, sort }: { field: SortField; sort: SortState }) {
  if (sort.field !== field) return <ArrowUpDown size={10} />
  return sort.dir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
}

interface SortState {
  field: SortField
  dir: SortDir
}

const STATUS_FILTERS = [
  { key: "all",     label: "All" },
  { key: "success", label: "Success" },
  { key: "error",   label: "Error" },
  { key: "running", label: "Running" },
] as const

const COLUMNS: { key: SortField; label: string; className: string }[] = [
  { key: "name",    label: "Name",    className: "flex-1" },
  { key: "latency", label: "Latency", className: "w-fit justify-end" },
  { key: "cost",    label: "Cost",    className: "w-fit justify-end hidden sm:flex" },
  { key: "time",    label: "Time",    className: "w-fit justify-end" },
]

interface TraceExplorerProps {
  traces: Trace[]
  initialId?: string
}

export function TraceExplorer({ traces, initialId }: TraceExplorerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOpenMobile } = useSidebar()

  const selectedId = searchParams.get("id") ?? initialId ?? null

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortState>({ field: "time", dir: "desc" })
  const [variant, setVariant] = useState<"compact" | "spacious">("compact")

  const filtered = useMemo(
    () => filterTraces(traces, { status: statusFilter, query }),
    [traces, statusFilter, query]
  )

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let cmp = 0
      switch (sort.field) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "latency":
          cmp = (a.latencyMs ?? 0) - (b.latencyMs ?? 0)
          break
        case "cost":
          cmp = a.totalCostUsd - b.totalCostUsd
          break
        case "time":
          cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          break
      }
      return sort.dir === "asc" ? cmp : -cmp
    })
    return copy
  }, [filtered, sort])

  const selectedTrace = useMemo(
    () => traces.find((t) => t.id === selectedId) ?? null,
    [traces, selectedId]
  )

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get("id") === id) {
      params.delete("id")
    } else {
      params.set("id", id)
    }
    router.replace(`/traces?${params.toString()}`, { scroll: false })
  }

  function handleSort(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, dir: prev.dir === "asc" ? "desc" : "asc" }
      }
      return { field, dir: "desc" }
    })
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: traces.length }
    for (const t of traces) {
      counts[t.status] = (counts[t.status] ?? 0) + 1
    }
    return counts
  }, [traces])

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel: list ── */}
      <div
        className={cn(
          "flex shrink-0 flex-col border-r overflow-hidden w-full bg-(--surface-1)",
          selectedId ? "hidden lg:flex" : "flex",
          "lg:w-[420px] xl:w-[480px]"
        )}
        style={{
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Search + filter bar */}
        <div
          className="shrink-0 border-b p-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Page title + variant toggle */}
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenMobile(true)}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] lg:hidden shrink-0"
                style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
                aria-label="Open sidebar"
              >
                <PanelLeft size={16} />
              </button>
              <GitBranch size={14} style={{ color: "var(--text-tertiary)" }} />
              <h1 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                Traces
              </h1>
              <span
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{ background: "var(--surface-3)", color: "var(--text-tertiary)", fontFamily: "var(--font-paper)" }}
              >
                {sorted.length}
              </span>
            </div>
            {/* Variant toggle */}
            <div
              className="flex items-center gap-0 rounded-full p-1"
              style={{ background: "var(--surface-3)" }}
            >
              <button
                onClick={() => setVariant("compact")}
                className="flex items-center justify-center rounded-full px-2 py-1 transition-all duration-75"
                style={{
                  background: variant === "compact" ? "var(--surface-5)" : "transparent",
                  color: variant === "compact" ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
              >
                <LayoutList size={13} />
              </button>
              <button
                onClick={() => setVariant("spacious")}
                className="flex items-center justify-center rounded-full px-2 py-1 transition-all duration-75"
                style={{
                  background: variant === "spacious" ? "var(--surface-5)" : "transparent",
                  color: variant === "spacious" ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
              >
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>

          {/* Search input */}
          <div className="relative mb-2">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="Search traces, IDs, tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full py-1.5 pl-7 pr-7 text-[12px] outline-none"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
              }}
              id="trace-search"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map(({ key, label }) => {
              const isActive = statusFilter === key
              const count = statusCounts[key] ?? 0
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-75"
                  style={{
                    background: isActive ? "var(--surface-3)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  {label}
                  <span
                    className="rounded-full px-1 text-[9px]"
                    style={{
                      background: isActive ? "var(--surface-5)" : "var(--surface-3)",
                      color: isActive ? "var(--text-secondary)" : "var(--text-disabled)",
                      fontFamily: "var(--font-paper)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Column headers (sortable) */}
        <div
          className="flex shrink-0 items-center gap-5 border-b px-3 py-1.5"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-1)",
          }}
        >
          {COLUMNS.map(({ key, label, className }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-75 ${className}`}
              style={{
                color: sort.field === key ? "var(--text-secondary)" : "var(--text-disabled)",
                fontFamily: "var(--font-paper)",
              }}
            >
              {label}
              <SortIcon field={key} sort={sort} />
            </button>
          ))}
        </div>

        {/* Trace list */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No traces match your filters
              </p>
              <button
                onClick={() => {
                  setQuery("")
                  setStatusFilter("all")
                }}
                className="rounded-lg px-3 py-1.5 text-[12px] transition-colors hover:opacity-80"
                style={{
                  background: "var(--surface-3)",
                  color: "var(--text-secondary)",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            sorted.map((trace) => (
              <TraceRow
                key={trace.id}
                trace={trace}
                selected={selectedId === trace.id}
                onSelect={handleSelect}
                variant={variant}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: detail ── */}
      <div
        className={cn(
          "flex-col overflow-hidden flex-1",
          selectedId ? "flex" : "hidden lg:flex"
        )}
      >
        {selectedTrace ? (
          <>
            {/* Mobile header bar with back button (left) and sidebar toggle (right) */}
            <div className="lg:hidden flex shrink-0 items-center border-b gap-2 px-3" style={{
              height: 48,
              borderColor: "var(--border-subtle)",
              background: "var(--surface-1)",
            }}>
              <button
                onClick={() => handleSelect(selectedId!)}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] shrink-0"
                style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
                aria-label="Back to trace list"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="truncate text-[13px] font-semibold flex-1" style={{ color: "var(--text-primary)" }}>
                {selectedTrace.name}
              </span>
              <button
                onClick={() => setOpenMobile(true)}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-[--surface-3] shrink-0"
                style={{ width: 32, height: 32, color: "var(--text-tertiary)" }}
                aria-label="Open sidebar"
              >
                <PanelLeft size={16} />
              </button>
            </div>
            <TraceDetail trace={selectedTrace} />
          </>
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3"
            style={{ background: "var(--surface-1)" }}
          >
            <GitBranch size={32} style={{ color: "var(--text-disabled)" }} strokeWidth={1.2} />
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Select a trace to inspect
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
              Click any trace in the list to view its span tree, metadata, and linked alerts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
