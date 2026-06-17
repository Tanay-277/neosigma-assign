function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

export default function SlackLoading() {
  return (
    <div className="flex h-full overflow-hidden rounded-3xl">
      {/* Left sidebar — incident groups */}
      <div
        className="flex w-[320px] shrink-0 flex-col"
        style={{ borderRight: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-[13px] w-24" />
        </div>
        <div className="flex-1 overflow-hidden p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-md px-3 py-2.5 mb-2"
              style={{ background: "var(--surface-2)" }}
            >
              <Skeleton className="h-[11px] w-32" />
              <Skeleton className="h-[10px] w-48" />
              <div className="flex gap-2 mt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right pane — message detail */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-[13px] w-40" />
            <Skeleton className="h-[10px] w-24" />
          </div>
        </div>

        {/* Message content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Slack card skeleton */}
          <div
            className="flex flex-col gap-3 rounded-md p-4 mb-4"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-[11px] w-28" />
                <Skeleton className="h-[10px] w-16" />
              </div>
            </div>
            <Skeleton className="h-[10px] w-full" />
            <Skeleton className="h-[10px] w-3/4" />
            <Skeleton className="h-[10px] w-5/6" />
            <Skeleton className="h-[60px] w-full rounded-sm" />
          </div>

          {/* Lifecycle stepper skeleton */}
          <div
            className="flex flex-col gap-3 rounded-md p-4"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
          >
            <Skeleton className="h-[13px] w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <Skeleton className="h-[11px] w-32" />
                  <Skeleton className="h-[10px] w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
