import React from "react"
import type { ButtonElement as ButtonElementType } from "@/lib/types"

interface ButtonElementProps {
  element: ButtonElementType
}

export function ButtonElement({ element }: ButtonElementProps) {
  const { style, text, url, action_id } = element

  const baseStyle: React.CSSProperties = {
    height: 28,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 12,
    fontWeight: 500,
    borderRadius: "var(--radius-sm)",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    transition: "background 100ms ease, color 100ms ease",
    textDecoration: "none",
    whiteSpace: "nowrap",
    border: "1px solid",
  }

  let colorStyle: React.CSSProperties

  if (style === "primary") {
    colorStyle = {
      background: "var(--accent)",
      borderColor: "var(--accent)",
      color: "var(--accent-fg)",
    }
  } else if (style === "danger") {
    colorStyle = {
      background: "transparent",
      borderColor: "var(--status-error)",
      color: "var(--status-error)",
    }
  } else {
    colorStyle = {
      background: "transparent",
      borderColor: "var(--border)",
      color: "var(--text-secondary)",
    }
  }

  const content = (
    <span style={{ ...baseStyle, ...colorStyle }} id={`btn-${action_id}`}>
      {text.text}
    </span>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return <button type="button">{content}</button>
}
