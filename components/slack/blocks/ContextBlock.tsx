import React from "react"
import type { ContextBlock as ContextBlockType } from "@/lib/types"
import { Mrkdwn } from "@/lib/mrkdwn"

interface ContextBlockProps {
  block: ContextBlockType
}

export function ContextBlock({ block }: ContextBlockProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {block.elements.map((el, i) => {
        if (el.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={el.image_url}
              alt={el.alt_text}
              className="rounded-full object-cover"
              style={{ width: 16, height: 16 }}
              onError={(e) => {
                // Fallback to a placeholder circle on image load failure
                const target = e.currentTarget
                target.style.display = "none"
              }}
            />
          )
        }

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <span
                style={{ color: "var(--text-disabled)", fontSize: 10 }}
                aria-hidden
              >
                ·
              </span>
            )}
            <span
              className="text-[11px] leading-snug"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Mrkdwn text={el.text} />
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}
