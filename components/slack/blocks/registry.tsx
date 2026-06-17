import React from "react"
import type { Block } from "@/lib/types"
import { HeaderBlock } from "./HeaderBlock"
import { SectionBlock } from "./SectionBlock"
import { ContextBlock } from "./ContextBlock"
import { DividerBlock } from "./DividerBlock"
import { ActionsBlock } from "./ActionsBlock"

// ─────────────────────────────────────────────────────────────────────────────
// Block registry — adding a new block type is a 1-line addition here.
// No switch statement, no prop-drilling.
// ─────────────────────────────────────────────────────────────────────────────

type BlockComponent = React.ComponentType<{ block: Block }>

const BLOCK_REGISTRY: Record<string, BlockComponent> = {
  header:  HeaderBlock  as BlockComponent,
  section: SectionBlock as BlockComponent,
  context: ContextBlock as BlockComponent,
  divider: DividerBlock as BlockComponent,
  actions: ActionsBlock as BlockComponent,
}

/**
 * Dispatches a block to its registered renderer.
 * Unknown block types render nothing — future-safe.
 */
export function renderBlock(block: Block, key: string | number): React.ReactNode {
  const Component = BLOCK_REGISTRY[block.type]
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SlackRenderer] Unknown block type: "${block.type}"`)
    }
    return null
  }
  return <Component key={key} block={block} />
}
