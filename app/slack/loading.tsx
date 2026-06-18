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
    <div className="flex h-full overflow-hidden w-full">
      {/* ── Left sidebar skeleton ── */}
      <div
        className="w-full lg:w-[300px] shrink-0 flex flex-col lg:border-r hidden lg:flex"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 border-b pl-14 pr-4 py-3 shrink-0 h-13 lg:px-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>

        {/* Incident List Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[var(--surface-2)]/40 border border-transparent">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right workspace skeleton ── */}
      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={{ background: "var(--surface-1)" }}
      >
        {/* Header row skeleton */}
        <div
          className="flex shrink-0 items-center gap-4 border-b pl-14 pr-4 md:px-6 h-13 lg:pl-6"
          style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
        >
          <div className="flex items-center gap-1.5 py-4">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div
            className="h-4 w-px"
            style={{ background: "var(--border-subtle)" }}
          />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* 3-column Split layout Skeletons */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden h-full">
          {/* Middle Column: Slack details skeleton */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 relative flex flex-col items-center w-full shrink-0 lg:shrink">
            <div className="w-full max-w-[680px] flex flex-col gap-0">
              {/* Card metadata skeleton */}
              <div className="mb-4 flex items-center gap-2 px-1">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-3.5 w-12" />
                <Skeleton className="h-3.5 w-12" />
                <Skeleton className="h-4 w-16 rounded-full ml-1" />
                <Skeleton className="h-6 w-20 rounded-xl ml-auto" />
              </div>

              {/* Flat blocks container skeleton */}
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

            {/* Pinned Floating Stepper Skeleton */}
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

          {/* Right Column: Incident Context sidebar skeleton */}
          <div
            className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l overflow-y-auto flex flex-col gap-5 p-5 md:p-6"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--surface-1)",
            }}
          >
            {/* Header skeleton */}
            <div className="flex flex-col gap-2 border-b pb-3 select-none" style={{ borderColor: "var(--border-subtle)" }}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Metrics Grid skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-2 h-16 justify-center">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-2 h-16 justify-center">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-2 h-16 justify-center">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="bg-[var(--surface-3)] p-3 rounded-2xl flex flex-col gap-2 h-16 justify-center">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            </div>

            {/* Exception skeleton */}
            <div className="bg-[var(--surface-3)] p-4 rounded-2xl flex flex-col gap-2 border border-transparent">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>

            {/* Explore button skeleton */}
            <Skeleton className="h-9 w-full rounded-xl mt-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
