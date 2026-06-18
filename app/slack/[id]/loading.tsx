function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)" }}
    />
  )
}

export default function SlackAlertLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden md:rounded-2xl bg-(--surface-1)">
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-4 border-b px-4 md:px-6 h-13"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Skeleton className="h-3.5 w-28" />
        <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
        <Skeleton className="h-3 w-24" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 relative flex flex-col items-center">
          <div className="w-full max-w-[680px] flex flex-col gap-0">
            {/* Card metadata */}
            <div className="mb-4 flex items-center gap-2 px-1">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-4 w-16 rounded-full ml-1" />
              <Skeleton className="h-6 w-20 rounded-xl ml-auto" />
            </div>

            {/* Blocks */}
            <div className="flex min-w-0 flex-1 flex-col gap-6 py-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
              <div className="h-px w-full my-2 bg-[var(--border-subtle)]" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex gap-2.5 mt-4">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="fixed lg:absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1.5 bg-[var(--surface-2)]/90 backdrop-blur-md border border-[var(--border-subtle)] px-4 py-2.5 rounded-full shadow-2xl h-[54px] w-[276px] justify-between">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="h-6 w-px bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <Skeleton className="h-0.5 w-6 rounded-full shrink-0" />
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <Skeleton className="h-0.5 w-6 rounded-full shrink-0" />
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <Skeleton className="h-0.5 w-6 rounded-full shrink-0" />
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              </div>
              <div className="h-6 w-px bg-[var(--border-subtle)]" />
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            </div>
          </div>
        </div>

        {/* Right context sidebar */}
        <div
          className="hidden lg:flex flex-col border-l w-[320px] shrink-0 p-5 md:p-6 gap-5"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-2 border-b pb-3" style={{ borderColor: "var(--border-subtle)" }}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-9 w-full rounded-xl mt-auto" />
        </div>
      </div>
    </div>
  )
}
