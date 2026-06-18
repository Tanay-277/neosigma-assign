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
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          <Mrkdwn text={block.text.text} />
        </div>
      )}

      {block.fields && block.fields.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-6 gap-y-3">
          {block.fields.map((field, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                <Mrkdwn text={field.text} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
