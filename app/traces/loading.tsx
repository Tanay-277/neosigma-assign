function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

function TraceRowSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <Skeleton className="h-5 w-5 rounded-full" />
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Skeleton className="h-[11px] w-40 shrink-0" />
        <Skeleton className="h-[11px] w-16 shrink-0" />
        <Skeleton className="h-[11px] w-12 shrink-0" />
      </div>
      <Skeleton className="h-[10px] w-14 shrink-0" />
      <Skeleton className="h-[10px] w-12 shrink-0" />
    </div>
  )
}

export default function TracesLoading() {
  return (
    <div className="flex h-full overflow-hidden rounded-3xl">
      {/* Left panel — list */}
      <div className="flex w-[420px] shrink-0 flex-col" style={{ borderRight: "1px solid var(--border-subtle)" }}>
        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>

        {/* Trace rows */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <TraceRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Right panel — detail */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-[18px] w-48" />
        <div className="flex flex-col gap-3 pl-4" style={{ borderLeft: "2px solid var(--border-subtle)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-3 w-3 mt-1 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-[11px] w-36" />
                <Skeleton className="h-[10px] w-56" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
