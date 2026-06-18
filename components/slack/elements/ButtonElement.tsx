import React from "react"
import Link from "next/link"
import type { ButtonElement as ButtonElementType } from "@/lib/types"

interface ButtonElementProps {
  element: ButtonElementType
}

export function ButtonElement({ element }: ButtonElementProps) {
  const { style, text, url, action_id } = element

  const buttonClass = style === "primary"
    ? "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-white bg-[var(--status-success)] border border-[var(--status-success)] hover:opacity-90 active:scale-95 no-underline dark:bg-[color-mix(in_oklch,var(--status-success)_12%,transparent)] dark:text-[var(--status-success)] dark:border-[var(--status-success)] dark:hover:bg-[color-mix(in_oklch,var(--status-success)_20%,transparent)]"
    : style === "danger"
      ? "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-[var(--status-error)] bg-transparent border border-[var(--status-error)] hover:bg-[color-mix(in_oklch,var(--status-error)_8%,transparent)] active:scale-95 no-underline"
      : "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-[var(--text-secondary)] bg-transparent border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)] active:scale-95 no-underline"

  if (action_id === "view_trace") {
    const traceId = url ? url.split("/").pop() : ""
    return (
      <Link
        href={`/traces/${traceId}`}
        className={buttonClass}
        id={`btn-${action_id}`}
      >
        {text.text}
      </Link>
    )
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        id={`btn-${action_id}`}
      >
        {text.text}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={buttonClass}
      id={`btn-${action_id}`}
    >
      {text.text}
    </button>
  )
}
