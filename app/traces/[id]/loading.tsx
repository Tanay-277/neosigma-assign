function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

export default function TraceDetailLoading() {
  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden bg-(--surface-1) rounded-2xl">
      {/* Trace header */}
      <Skeleton className="h-[18px] w-48" />
      <Skeleton className="h-[11px] w-64" />

      {/* Tabs skeleton */}
      <div className="flex gap-4 mt-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Waterfall / span tree */}
      <div className="mt-4 flex flex-col gap-3 pl-4" style={{ borderLeft: "2px solid var(--border-subtle)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-3 w-3 mt-1 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-[11px] w-36" />
              <Skeleton className="h-[10px] w-56" />
              <div className="h-[6px] w-full max-w-[300px] rounded-sm animate-pulse" style={{ background: "var(--surface-4)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
