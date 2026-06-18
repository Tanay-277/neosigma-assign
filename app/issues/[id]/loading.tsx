function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

export default function IssueDetailLoading() {
  return (
    <div className="flex h-full flex-col rounded-2xl overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-4 w-10 rounded" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="flex flex-col gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-20 w-full rounded-md mb-6" />
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}
