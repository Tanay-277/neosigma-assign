import React from "react"
import type { HeaderBlock as HeaderBlockType } from "@/lib/types"

import { EMOJI_MAP } from "@/lib/mrkdwn"

function parsePlainTextWithEmoji(text: string): React.ReactNode {
  const parts = text.split(/(:[\w_]+:)/g)
  return parts.map((part, i) => {
    const match = part.match(/^:([\w_]+):$/)
    if (match) {
      const cfg = EMOJI_MAP[match[1]]
      if (cfg) {
        const IconComponent = cfg.icon
        return (
          <IconComponent
            key={i}
            size={15}
            className="inline-block align-text-bottom mx-1 text-inherit"
            style={{ color: cfg.color }}
          />
        )
      }
      return <span key={i}>{part}</span>
    }
    return part
  })
}

interface HeaderBlockProps {
  block: HeaderBlockType
}

export function HeaderBlock({ block }: HeaderBlockProps) {
  return (
    <div
      className="pb-2"
      style={{
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <h3
        className="text-base font-semibold leading-snug"
        style={{ color: "var(--text-primary)" }}
      >
        {parsePlainTextWithEmoji(block.text.text)}
      </h3>
    </div>
  )
}
