function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)", ...style }}
    />
  )
}

function TraceRowSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-3 py-0"
      style={{ borderBottom: "1px solid var(--border-subtle)", height: 48 }}
    >
      <Skeleton className="size-1.5 rounded-full shrink-0" />
      <Skeleton className="h-3 w-40 flex-1" />
      <Skeleton className="h-3 w-10 shrink-0" />
      <Skeleton className="h-3 w-10 shrink-0 hidden sm:block" />
      <Skeleton className="h-3 w-8 shrink-0" />
    </div>
  )
}

export default function TracesLoading() {
  return (
    <div className="flex h-full overflow-hidden sm:rounded-2xl">
      {/* Left panel — list */}
      <div
        className="flex w-full shrink-0 flex-col border-r lg:w-[420px] xl:w-[480px]"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bg)",
        }}
      >
        {/* Search + filter bar */}
        <div className="shrink-0 border-b p-3" style={{ borderColor: "var(--border-subtle)" }}>
          {/* Page title */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-3.5 rounded" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3.5 w-6 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded-lg mb-3" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div
          className="flex shrink-0 items-center gap-3 border-b px-3 py-1"
          style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
        >
          <Skeleton className="h-2.5 w-8 flex-1" />
          <Skeleton className="h-2.5 w-8 shrink-0" />
          <Skeleton className="h-2.5 w-8 shrink-0 hidden sm:block" />
          <Skeleton className="h-2.5 w-6 shrink-0" />
        </div>

        {/* Trace rows */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <TraceRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Right panel — detail */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0" style={{ background: "var(--surface-1)" }}>
        {/* Detail header */}
        <div className="shrink-0 border-b p-4" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-3 w-64 mb-3" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <Skeleton className="h-2 w-10" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-4 border-b px-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Skeleton className="h-5 w-20" style={{ borderBottom: "2px solid var(--surface-3)" }} />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Span tree */}
        <div className="flex flex-col gap-3 p-4" style={{ borderLeft: "2px solid var(--border-subtle)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-3 mt-0.5 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-2.5 w-56" />
                <div className="h-1 w-full max-w-[300px] rounded-sm" style={{ background: "var(--surface-3)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
