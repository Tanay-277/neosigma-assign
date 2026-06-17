"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GitBranchIcon,
  Message01Icon,
  DashboardCircleIcon,
  PanelLeftCloseIcon,
  SunIcon,
  Moon01Icon,
  ActivityCircleIcon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/traces",
    label: "Traces",
    icon: GitBranchIcon,
    description: "Explorer",
  },
  {
    href: "/slack",
    label: "Alerts",
    icon: Message01Icon,
    description: "Slack cards",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: DashboardCircleIcon,
    description: "Metrics",
  },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored !== null) {
      setIsCollapsed(stored === "true")
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="relative flex flex-col border-r h-screen shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: isCollapsed ? 68 : 240,
          background: "var(--bg)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        {!isCollapsed ? (
          <div
            className="flex h-12 items-center gap-2.5 border-b px-4"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              <HugeiconsIcon icon={ActivityCircleIcon} size={13} strokeWidth={2.5} />
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Sigma
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider"
              style={{
                background: "var(--surface-3)",
                color: "var(--text-tertiary)",
              }}
            >
              BETA
            </span>
            <button
              onClick={toggleSidebar}
              className="ml-auto rounded p-1 text-[--text-tertiary] hover:bg-[--surface-3] transition-colors flex items-center justify-center"
              title="Collapse Sidebar"
            >
              <HugeiconsIcon icon={PanelLeftCloseIcon} size={15} />
            </button>
          </div>
        ) : (
          <div
            className="flex h-12 items-center justify-center border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              onClick={toggleSidebar}
              className="rounded p-1.5 text-[--text-tertiary] hover:bg-[--surface-3] transition-colors flex items-center justify-center"
              title="Expand Sidebar"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
              >
                <HugeiconsIcon icon={ActivityCircleIcon} size={13} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className={cn("flex flex-1 flex-col gap-1 p-2 pt-4", isCollapsed && "items-stretch")}>
          {!isCollapsed ? (
            <p
              className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text-disabled)" }}
            >
              Observability
            </p>
          ) : (
            <div className="h-2" />
          )}

          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const active = pathname.startsWith(href)
            
            if (!isCollapsed) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded px-2.5 py-2 text-[13px] transition-all duration-150",
                    active
                      ? "font-medium text-[--text-primary]"
                      : "text-[--text-secondary] hover:bg-[--surface-3]"
                  )}
                  style={{
                    background: active ? "var(--surface-2)" : undefined,
                    border: active ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  }}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    size={16}
                    className="transition-transform duration-150 group-hover:scale-105"
                    style={{
                      color: active ? "var(--accent)" : "var(--text-tertiary)",
                    }}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="leading-none">{label}</span>
                    <span
                      className="text-[10px] leading-tight mt-0.5"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {description}
                    </span>
                  </div>
                </Link>
              )
            } else {
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center justify-center rounded p-2.5 transition-all duration-150 relative",
                    active
                      ? "text-[--text-primary]"
                      : "text-[--text-secondary] hover:bg-[--surface-3]"
                  )}
                  style={{
                    background: active ? "var(--surface-2)" : undefined,
                    border: active ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  }}
                  title={label}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    size={18}
                    className="transition-transform duration-150 group-hover:scale-105"
                    style={{
                      color: active ? "var(--accent)" : "var(--text-tertiary)",
                    }}
                  />
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </Link>
              )
            }
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed ? (
          <div
            className="flex items-center justify-between border-t px-3 py-3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span
              className="font-mono text-[9px]"
              style={{ color: "var(--text-disabled)" }}
            >
              Press{" "}
              <kbd
                className="rounded px-0.5 py-px text-[9px]"
                style={{
                  background: "var(--surface-3)",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border)",
                }}
              >
                D
              </kbd>{" "}
              to toggle theme
            </span>
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="rounded p-1 transition-colors hover:bg-[--surface-3]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <span className="inline-block h-3.5 w-3.5" />
              ) : resolvedTheme === "dark" ? (
                <HugeiconsIcon icon={SunIcon} size={14} />
              ) : (
                <HugeiconsIcon icon={Moon01Icon} size={14} />
              )}
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center border-t py-3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="rounded p-1.5 transition-colors hover:bg-[--surface-3]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <span className="inline-block h-3.5 w-3.5" />
              ) : resolvedTheme === "dark" ? (
                <HugeiconsIcon icon={SunIcon} size={14} />
              ) : (
                <HugeiconsIcon icon={Moon01Icon} size={14} />
              )}
            </button>
          </div>
        )}
      </aside>

      {/* ── Inset main content container ── */}
      <main
        className="flex min-w-0 flex-1 flex-col overflow-hidden m-2 ml-0 rounded-xl border transition-all duration-300"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
