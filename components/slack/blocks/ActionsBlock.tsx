import React from "react"
import type { ActionsBlock as ActionsBlockType } from "@/lib/types"
import { ButtonElement } from "@/components/slack/elements/ButtonElement"
import { SelectElement } from "@/components/slack/elements/SelectElement"

interface ActionsBlockProps {
  block: ActionsBlockType
}

export function ActionsBlock({ block }: ActionsBlockProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {block.elements.map((el, i) => {
        if (el.type === "button") {
          return <ButtonElement key={i} element={el} />
        }
        if (el.type === "static_select") {
          return <SelectElement key={i} element={el} />
        }
        return null
      })}
    </div>
  )
}
