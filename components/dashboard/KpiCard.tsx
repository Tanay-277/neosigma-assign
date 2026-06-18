"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIncreaseIcon, ChartDecreaseIcon, TrendingUpDownIcon } from "@hugeicons/core-free-icons"
import { Sparkline } from "@/components/ui/sparkline"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KpiTab {
  id: string
  label: string
  value: string
  subtext?: string
  change?: string
  trend?: "up" | "down" | "neutral"
  sparklineData?: number[]
}

interface KpiCardProps {
  label: string
  value?: string
  subtext?: string
  trend?: "up" | "down" | "neutral"
  change?: string
  accentColor?: string
  sparklineData?: number[]
  id?: string
  tabs?: KpiTab[]
  className?: string
}

const TREND_COLORS = {
  up: {
    text: "#16a34a",
    bg: "color-mix(in oklch, #16a34a 15%, transparent)",
  },
  down: {
    text: "#dc2626",
    bg: "color-mix(in oklch, #dc2626 15%, transparent)",
  },
  neutral: {
    text: "#6b7280",
    bg: "color-mix(in oklch, #6b7280 12%, transparent)",
  },
}

export function KpiCard({
  label,
  value: staticValue,
  subtext: staticSubtext,
  trend: staticTrend,
  change: staticChange,
  accentColor = "#6b7280",
  sparklineData: staticData,
  id,
  tabs,
  className,
}: KpiCardProps) {
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [switching, setSwitching] = React.useState(false)
  const [contentVersion, setContentVersion] = React.useState(0)
  const switchingRef = React.useRef(false)

  const hasTabs = !!tabs && tabs.length > 0
  const activeTab = hasTabs ? tabs[activeIdx] : null

  const value = activeTab?.value ?? staticValue ?? ""
  const subtext = activeTab?.subtext ?? staticSubtext
  const trend = activeTab?.trend ?? staticTrend
  const change = activeTab?.change ?? staticChange
  const sparklineData = activeTab?.sparklineData ?? staticData

  const colors = trend ? TREND_COLORS[trend] : null
  const sparkColor = trend === "up"
    ? "#16a34a"
    : trend === "down"
      ? "#dc2626"
      : accentColor

  function handleTabChange(value: string) {
    const i = tabs ? tabs.findIndex(t => t.id === value) : -1
    if (i < 0 || i === activeIdx || switchingRef.current) return
    switchingRef.current = true
    setSwitching(true)
    setTimeout(() => {
      setActiveIdx(i)
      setContentVersion(v => v + 1)
      setSwitching(false)
      switchingRef.current = false
    }, 280)
  }

  const blurTransition = "filter 280ms cubic-bezier(0.4,0,0.2,1), opacity 280ms cubic-bezier(0.4,0,0.2,1)"

  const trendPill = (trend || change) && colors ? (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1 overflow-hidden shrink-0"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      {trend && (
        <HugeiconsIcon
          icon={trend === "up" ? ChartIncreaseIcon : trend === "down" ? ChartDecreaseIcon : TrendingUpDownIcon}
          size={13}
          className="shrink-0"
        />
      )}
      {change && (
        <span
          className={`text-[11px] font-semibold font-mono leading-none whitespace-nowrap animate-pill-text ${switching ? "blur-[4px] opacity-20" : ""}`}
          style={{ transition: blurTransition }}
        >
          {change}
        </span>
      )}
    </div>
  ) : null

  return (
    <div
      id={id}
      className={`relative flex flex-col gap-0 overflow-hidden p-4 md:p-5 ${className ?? ""}`}
      style={{ background: "var(--surface-2)", minWidth: 260 }}
    >
      {/* Label row — trend pill at top right for all cards */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <p className="text-[10px] font-semibold uppercase font-mono tracking-widest text-black/40 dark:text-white/40">
          {label}
        </p>
        {trendPill}
      </div>

      {/* Tabbed mode — only value, subtext, and trend % text blur */}
      {hasTabs ? (
        <>
          <div className="flex items-baseline gap-3 mb-4">
            <span
              className={`font-mono text-[26px] font-semibold leading-none tracking-tight text-black dark:text-white ${switching ? "blur-[5px] opacity-30" : ""}`}
              style={{ transition: blurTransition }}
            >
              {value}
            </span>
          </div>

          {sparklineData && sparklineData.length > 1 && (
            <div className="-ml-4 md:-ml-5 my-4">
              <Sparkline key={contentVersion} data={sparklineData} color={sparkColor} fullWidth direction={trend} />
            </div>
          )}

          <div className="flex items-center justify-between w-full mt-3">
            {subtext && (
              <p
                className={`text-[11px] text-black/40 dark:text-white/40 ${switching ? "blur-[4px] opacity-30" : ""}`}
                style={{ transition: blurTransition }}
              >
                {subtext}
              </p>
            )}
            <Tabs value={tabs[activeIdx]?.id} onValueChange={handleTabChange}>
              <TabsList className="rounded-full bg-black/6 dark:bg-white/6 h-auto! gap-0.5">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="text-[10px] font-semibold font-mono px-2 py-1 rounded-full! h-auto! data-active:bg-white! data-active:text-black! dark:data-active:bg-white/10! dark:data-active:text-white! text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-[26px] font-semibold leading-none tracking-tight text-black dark:text-white">
              {value}
            </span>
          </div>

          {sparklineData && sparklineData.length > 1 && (
            <div className="-ml-4 md:-ml-5 my-4">
              <Sparkline data={sparklineData} color={sparkColor} fullWidth direction={trend} />
            </div>
          )}
          {subtext && (
            <p className="text-[11px] text-black/40 dark:text-white/40 mt-3">
              {subtext}
            </p>
          )}
        </>
      )}

    </div>
  )
}
