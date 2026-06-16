"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Activity,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/traces",
    label: "Traces",
    icon: GitBranch,
    description: "Explorer",
  },
  {
    href: "/slack",
    label: "Alerts",
    icon: MessageSquare,
    description: "Slack cards",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Metrics",
  },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex w-[220px] shrink-0 flex-col border-r"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-12 items-center gap-2.5 border-b px-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <Activity size={13} strokeWidth={2.5} />
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Sigma
          </span>
          <span
            className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wider"
            style={{
              background: "var(--surface-3)",
              color: "var(--text-tertiary)",
            }}
          >
            BETA
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
          <p
            className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-disabled)" }}
          >
            Observability
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-75",
                  active
                    ? "font-medium"
                    : "hover:bg-[--surface-3]"
                )}
                style={{
                  background: active ? "var(--accent-muted)" : undefined,
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="leading-none">{label}</span>
                  <span
                    className="text-[10px] leading-tight"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    {description}
                  </span>
                </div>
                {active && (
                  <div
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t px-3 py-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span
            className="font-mono text-[10px]"
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
            {resolvedTheme === "dark" ? (
              <Sun size={13} />
            ) : (
              <Moon size={13} />
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
