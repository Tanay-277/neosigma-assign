import React from "react"
import type { SectionBlock as SectionBlockType } from "@/lib/types"
import { Mrkdwn } from "@/lib/mrkdwn"

interface SectionBlockProps {
  block: SectionBlockType
}

export function SectionBlock({ block }: SectionBlockProps) {
  return (
    <div className="flex flex-col gap-3">
      {block.text && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <Mrkdwn text={block.text.text} />
        </p>
      )}

      {block.fields && block.fields.length > 0 && (
        <div
          className="grid gap-x-6 gap-y-3"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          {block.fields.map((field, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                <Mrkdwn text={field.text} />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
