import React from "react"
import type { StaticSelectElement as StaticSelectElementType } from "@/lib/types"

interface SelectElementProps {
  element: StaticSelectElementType
}

export function SelectElement({ element }: SelectElementProps) {
  const { placeholder, options, action_id } = element

  return (
    <select
      id={`select-${action_id}`}
      defaultValue=""
      style={{
        height: 28,
        paddingLeft: 8,
        paddingRight: 24,
        fontSize: 12,
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        background: "var(--surface-3)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b8b99' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      <option value="" disabled style={{ color: "var(--text-disabled)" }}>
        {placeholder.text}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.text.text}
        </option>
      ))}
    </select>
  )
}
