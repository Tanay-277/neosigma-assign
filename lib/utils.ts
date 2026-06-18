import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Deterministic 12-hour time string (server/client safe) */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  const hh = d.getHours()
  const mm = d.getMinutes().toString().padStart(2, "0")
  const ss = d.getSeconds().toString().padStart(2, "0")
  const ampm = hh >= 12 ? "PM" : "AM"
  const h12 = hh % 12 || 12
  return `${h12}:${mm}:${ss} ${ampm}`
}

/** Deterministic number formatting with comma separator */
export function formatInt(n: number): string {
  return n.toLocaleString("en-US")
}
