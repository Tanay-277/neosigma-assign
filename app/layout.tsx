import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import type { Metadata } from "next"

import "./globals.css"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased dark",
        generalSans.variable,
        paperMono.variable,
        geistMono.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark" attribute="class" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
