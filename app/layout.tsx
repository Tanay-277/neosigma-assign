import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import type { Metadata } from "next"

import "./globals.css"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/layout/AppShell"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const generalSans = localFont({
  src: "./fonts/GeneralSans.woff2",
  display: "swap",
  preload: true,
  variable: "--font-general",
})

const paperMono = localFont({
  src: "./fonts/PaperMono.woff2",
  display: "swap",
  preload: true,
  variable: "--font-paper",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-fallback",
})

export const metadata: Metadata = {
  title: {
    default: "Sigma",
    template: "%s | Sigma",
  },
  description:
    "Trace explorer, alert management, and metrics for LLM applications. Built for production debugging.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        generalSans.variable,
        paperMono.variable,
        geistMono.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="light" attribute="class" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <AppShell defaultOpen={defaultOpen}>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
