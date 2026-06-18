"use client"

import React, { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, GitBranch } from "lucide-react"
import type { Trace } from "@/lib/types"
import { filterTraces } from "@/lib/data/traces"
import { TraceRow } from "@/components/traces/TraceRow"
import { TraceDetail } from "@/components/traces/TraceDetail"

const STATUS_FILTERS = [
  { key: "all",     label: "All" },
  { key: "success", label: "Success" },
  { key: "error",   label: "Error" },
  { key: "running", label: "Running" },
] as const

interface TraceExplorerProps {
  traces: Trace[]
  initialId?: string
}

export function TraceExplorer({ traces, initialId }: TraceExplorerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedId = searchParams.get("id") ?? initialId ?? null

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(
    () => filterTraces(traces, { status: statusFilter, query }),
    [traces, statusFilter, query]
  )

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
        className={`w-full md:w-[380px] shrink-0 flex flex-col border-r ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bg)",
        }}
      >
        {/* Search + filter bar */}
        <div
          className="shrink-0 border-b p-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Page title */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={14} style={{ color: "var(--text-tertiary)" }} />
              <h1 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Traces
              </h1>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-mono"
                style={{ background: "var(--surface-3)", color: "var(--text-tertiary)" }}
              >
                {filtered.length}
              </span>
            </div>
          </div>

          {/* Search input */}
          <div className="relative mb-3">
            <Search
              size={12}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="Search traces, IDs, tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-lg pl-7 pr-7 text-[12px] outline-none"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
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
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={{
                    background: isActive ? "var(--surface-4)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  {label}
                  <span
                    className="rounded px-1 text-[9px] font-mono"
                    style={{
                      background: isActive ? "var(--surface-3)" : "var(--surface-3)",
                      color: isActive ? "var(--text-secondary)" : "var(--text-disabled)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Column headers */}
        <div
          className="flex shrink-0 items-center gap-3 border-b px-3 py-1"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-1)",
          }}
        >
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
            Name
          </span>
          <span className="w-14 text-right text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
            Latency
          </span>
          <span className="w-14 text-right text-[10px] font-semibold uppercase tracking-widest hidden sm:inline" style={{ color: "var(--text-disabled)" }}>
            Cost
          </span>
          <span className="w-12 text-right text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
            Time
          </span>
        </div>

        {/* Trace list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No traces match your filters
              </p>
              <button
                onClick={() => {
                  setQuery("")
                  setStatusFilter("all")
                }}
                className="rounded-lg px-3 py-1.5 text-[11px] font-mono transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((trace) => (
              <TraceRow
                key={trace.id}
                trace={trace}
                selected={selectedId === trace.id}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: detail ── */}
      <div
        className={`min-w-0 flex-1 flex-col overflow-hidden ${
          selectedId ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedTrace ? (
          <TraceDetail trace={selectedTrace} />
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-4 px-6"
            style={{ background: "var(--surface-1)" }}
          >
            <GitBranch size={28} style={{ color: "var(--text-disabled)" }} strokeWidth={1.2} />
            <div className="text-center">
              <p className="text-[13px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                Select a trace to inspect
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--text-disabled)" }}>
                Click any trace from the list
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
