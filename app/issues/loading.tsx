function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

export default function IssuesLoading() {
  return (
    <div className="flex h-full flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-6 rounded" />
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex h-full gap-4">
          {["Open", "In Progress", "Resolved"].map((col) => (
            <div key={col} className="flex w-72 shrink-0 flex-col gap-2">
              <div className="flex items-center gap-2 px-1 pb-3">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-6 rounded" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border p-3"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
