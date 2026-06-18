"use client"

import React, { ViewTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GitBranchIcon,
  Message01Icon,
  DashboardCircleIcon,
  SunIcon,
  Moon01Icon,
  ArrowLeft01Icon,
  AbsoluteIcon,
} from "@hugeicons/core-free-icons"
import { PanelLeftIcon } from "lucide-react"

import {
  SidebarProvider,
  Sidebar,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"


const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardCircleIcon },
  { href: "/traces", label: "Traces", icon: GitBranchIcon },
  { href: "/slack", label: "Alerts", icon: Message01Icon },
] as const

const ICON_SIZE = 22

const BTN_CLASS =
  "min-h-[44px] p-[11px] rounded-xl gap-3 group-data-[collapsible=icon]:size-[44px]! group-data-[collapsible=icon]:p-[11px]!"

const TXT_CLASS =
  "transition-all duration-200 -delay-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:blur-sm group-data-[collapsible=icon]:invisible"


function Brand() {
  return (
    <div className="flex items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <HugeiconsIcon
          icon={AbsoluteIcon}
          size={ICON_SIZE}
          color="var(--accent)"
          strokeWidth={1.8}
        />
      </div>
      <span
        className={`text-base font-semibold ${TXT_CLASS}`}
        style={{ color: "var(--text-primary)" }}
      >
        sigma
      </span>
    </div>
  )
}


function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: typeof DashboardCircleIcon
  active: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={BTN_CLASS}
        isActive={active}
        tooltip={label}
        render={<Link href={href} transitionTypes={["navigate"]} />}
      >
        <HugeiconsIcon
          icon={icon}
          size={ICON_SIZE}
          color={active ? "var(--accent)" : "var(--text-tertiary)"}
          strokeWidth={active ? 2 : 1.75}
        />
        <span className={`${TXT_CLASS}`}>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}


function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  const isDark = resolvedTheme === "dark"

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={BTN_CLASS}
        tooltip={mounted ? (isDark ? "Light mode" : "Dark mode") : "Toggle theme"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {mounted ? (
          <HugeiconsIcon
            icon={isDark ? SunIcon : Moon01Icon}
            size={ICON_SIZE}
            color="var(--text-tertiary)"
            strokeWidth={1.75}
          />
        ) : (
          <div className="size-[22px]" />
        )}
        <span className={`line-clamp-1 ${TXT_CLASS}`}>
          {mounted ? (isDark ? "Light mode" : "Dark mode") : "\u00A0"}
        </span>
        <Kbd className="ml-auto">d</Kbd>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}


function CollapseToggle() {
  const { toggleSidebar, open } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={open ? "Collapse" : "Expand"}
        onClick={toggleSidebar}
        className={BTN_CLASS}
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={ICON_SIZE}
          color="var(--text-tertiary)"
          className={`transition-transform duration-200 delay-200 ${!open && "rotate-180"}`}
          strokeWidth={2}
        />
        <span className={TXT_CLASS}>Collapse</span>
        <Kbd className="ml-auto">ctrl + b</Kbd>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}


function MobileToggle() {
  const { setOpenMobile } = useSidebar()

  return (
    <button
      onClick={() => setOpenMobile(true)}
      className="absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-lg sm:hidden"
      style={{ background: "var(--surface-3)" }}
      aria-label="Open sidebar"
    >
      <PanelLeftIcon size={14} style={{ color: "var(--text-secondary)" }} />
    </button>
  )
}

export function AppShell({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh overflow-hidden">
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="px-3 py-4">
          <Brand />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={pathname.startsWith(item.href)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-1 px-2 pb-4">
          <SidebarMenu className="gap-1">
            <ThemeToggle />
            <CollapseToggle />
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset  className="bg-(--bg)/90">
        <MobileToggle />
        <ViewTransition name="page">
          {children}
        </ViewTransition>
      </SidebarInset>
    </SidebarProvider>
  )
}
