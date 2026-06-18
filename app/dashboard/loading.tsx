import { Sparkline } from "@/components/ui/sparkline"

const skeletonSparkData = Array.from({ length: 20 }, (_, i) =>
  50 + Math.sin(i * 0.5) * 25 + (i % 5) * 3
)

function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--surface-3)", ...style }}
    />
  )
}

function KpiCardSkeleton() {
  return (
    <div
      className="relative flex flex-col gap-0 overflow-hidden p-4 md:p-5"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-[10px] w-20" />
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: "var(--surface-3)", opacity: 0.2 }}>
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-[11px] w-12" />
        </div>
      </div>
      <Skeleton className="h-[26px] w-28 mb-4" />
      <div className="-ml-4 md:-ml-5 my-4">
        <Sparkline data={skeletonSparkData} color="var(--surface-4)" fullWidth animated={false} />
      </div>
      <Skeleton className="h-[11px] w-36 mt-3" />
    </div>
  )
}

function LineChartSkeleton({ height = 180 }: { height?: number }) {
  return (
    <svg
      className="w-full rounded-sm"
      viewBox={`0 0 300 ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id="sk-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface-4)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--surface-4)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M0,140 C30,130 60,90 90,55 C120,20 150,60 180,70 C210,80 240,35 270,45 C285,50 300,40 300,40 L300,180 L0,180 Z"
        fill="url(#sk-line)"
      />
      <path
        d="M0,140 C30,130 60,90 90,55 C120,20 150,60 180,70 C210,80 240,35 270,45 C285,50 300,40 300,40"
        fill="none"
        stroke="var(--surface-4)"
        strokeWidth="2"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

function BarChartSkeleton({ height = 180 }: { height?: number }) {
  const bars = [85, 45, 25, 10, 5]
  return (
    <div className="flex flex-col gap-4 py-2" style={{ height }}>
      {bars.map((w, i) => (
        <div key={i} className="flex items-center gap-4">
          {/* Label skeleton */}
          <Skeleton className="h-3.5 w-24 shrink-0 rounded-md" />
          {/* Bar track skeleton */}
          <div className="flex-1 h-3 rounded-md overflow-hidden relative" style={{ background: "var(--surface-3)", opacity: 0.4 }}>
            <Skeleton className="h-full rounded-md" style={{ width: `${w}%` }} />
          </div>
          {/* Metric skeleton */}
          <Skeleton className="h-3.5 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  )
}

function LatencyChartSkeleton() {
  return (
    <ChartCardSkeleton title="Latency over time" subtitle="p50 (solid) · p95 (dashed)">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-0.5 w-5" />
          <Skeleton className="h-[11px] w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-0.5 w-5" />
          <Skeleton className="h-[11px] w-4" />
        </div>
      </div>
      <LineChartSkeleton />
    </ChartCardSkeleton>
  )
}

function CostByModelChartSkeleton() {
  return (
    <ChartCardSkeleton title="Cost by model" subtitle="Total USD">
      <BarChartSkeleton />
    </ChartCardSkeleton>
  )
}

function ErrorRateChartSkeleton() {
  return (
    <ChartCardSkeleton title="Error rate over time" subtitle="%">
      <LineChartSkeleton />
    </ChartCardSkeleton>
  )
}

function TokenUsageChartSkeleton() {
  return (
    <ChartCardSkeleton title="Token usage over time" subtitle="Prompt + completion">
      <div className="flex items-center gap-4 mb-3">
        <Skeleton className="h-2 w-2 rounded-sm" />
        <Skeleton className="h-[11px] w-8" />
        <Skeleton className="h-2 w-2 rounded-sm" />
        <Skeleton className="h-[11px] w-10" />
      </div>
      <LineChartSkeleton />
    </ChartCardSkeleton>
  )
}

function ChartCardSkeleton({
  title,
  subtitle,
  children,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-3xl p-4 md:p-5"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex items-center justify-between">
        {title ? <Skeleton className="h-[13px] w-32" /> : <div />}
        {subtitle ? <Skeleton className="h-[11px] w-20" /> : <div />}
      </div>
      {children}
    </div>
  )
}

function ModelBreakdownPanelSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-3xl p-4 md:p-5"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-[13px] w-32" />
        <Skeleton className="h-[11px] w-10" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-full max-w-xs rounded-3xl" />
          <Skeleton className="h-[11px] w-16 ml-auto" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-2 min-w-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[34px] w-full rounded-md" />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 w-full lg:w-[380px]">
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-md" />
              ))}
            </div>
            <Skeleton className="size-56 rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col gap-0 overflow-hidden rounded-3xl">
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 md:px-6 py-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Last 14 days
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex w-full flex-col gap-6">
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 rounded-3xl overflow-hidden gap-px" style={{ background: "var(--border-subtle)" }}>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LatencyChartSkeleton />
            <CostByModelChartSkeleton />
          </div>
          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ErrorRateChartSkeleton />
            <TokenUsageChartSkeleton />
          </div>

          {/* Model breakdown */}
          <ModelBreakdownPanelSkeleton />
        </div>
      </div>
    </div>
  )
}
