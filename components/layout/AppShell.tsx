"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GitBranchIcon,
  Message01Icon,
  DashboardCircleIcon,
  SunIcon,
  Moon01Icon,
  ActivityCircleIcon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

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

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-3">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              <HugeiconsIcon icon={ActivityCircleIcon} size={13} strokeWidth={2.5} />
            </div>
            <span
              className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden"
              style={{ color: "var(--text-primary)" }}
            >
              Sigma
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Observability</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
                  const active = pathname.startsWith(href)
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={label}
                        render={<Link href={href} />}
                      >
                        <HugeiconsIcon icon={Icon} size={16} />
                        <div className="flex min-w-0 flex-col">
                          <span>{label}</span>
                          <span className="text-[10px] leading-tight mt-0.5 text-sidebar-foreground/60">
                            {description}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between px-3 py-2">
            <span
              className="font-mono text-[9px] text-sidebar-foreground/40 group-data-[collapsible=icon]/sidebar-wrapper:hidden"
            >
              <kbd
                className="rounded-[4px] px-0.5 py-px text-[9px]"
                style={{
                  background: "var(--surface-3)",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border)",
                }}
              >
                D
              </kbd>{" "}
              theme
            </span>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded p-1.5 transition-colors hover:bg-sidebar-accent"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {resolvedTheme === "dark" ? (
                <HugeiconsIcon icon={SunIcon} size={14} />
              ) : (
                <HugeiconsIcon icon={Moon01Icon} size={14} />
              )}
            </button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Mobile header with sidebar trigger */}
        <header
          className="flex h-10 items-center gap-2 border-b px-4 md:hidden"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg)" }}
        >
          <SidebarTrigger />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sigma
          </span>
        </header>

        {/* Page content */}
        <main
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
          style={{ background: "var(--bg)" }}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
