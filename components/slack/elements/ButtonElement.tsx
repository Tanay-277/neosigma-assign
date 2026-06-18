import React from "react"
import type { ButtonElement as ButtonElementType } from "@/lib/types"

interface ButtonElementProps {
  element: ButtonElementType
}

export function ButtonElement({ element }: ButtonElementProps) {
  const { style, text, url, action_id } = element

  const buttonClass = style === "primary"
    ? "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-white bg-[var(--accent)] border border-[var(--accent)] hover:opacity-90 active:scale-95 no-underline dark:bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] dark:text-[var(--accent)] dark:border-[var(--accent)] dark:hover:bg-[color-mix(in_oklch,var(--accent)_20%,transparent)]"
    : style === "danger"
      ? "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-[var(--status-error)] bg-transparent border border-[var(--status-error)] hover:bg-[color-mix(in_oklch,var(--status-error)_8%,transparent)] active:scale-95 no-underline"
      : "h-7 px-2.5 text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 text-[var(--text-secondary)] bg-transparent border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)] active:scale-95 no-underline"

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
