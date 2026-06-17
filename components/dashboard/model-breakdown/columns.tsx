"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { CostByModel } from "@/lib/types"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export const MODEL_COLORS = [
  "var(--type-llm)",
  "var(--type-tool)",
  "var(--type-chain)",
  "var(--type-retriever)",
  "var(--type-parser)",
  "var(--chart-5)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-4)",
]

function SortHeader({
  column,
  label,
  align = "left",
}: {
  column: any
  label: string
  align?: "left" | "right"
}) {
  const isSorted = column.getIsSorted()
  return (
    <button
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className={cn(
        "flex items-center gap-1 text-[10px] font-semibold uppercase font-mono tracking-widest cursor-pointer hover:opacity-80 transition-opacity outline-none focus-visible:opacity-80",
        align === "right" && "justify-end w-full"
      )}
      style={{ color: isSorted ? "var(--text-primary)" : "var(--text-tertiary)" }}
    >
      {label}
      {isSorted === "asc" ? (
        <ArrowUp className="size-3 shrink-0" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="size-3 shrink-0" />
      ) : (
        <ArrowUpDown className="size-3 shrink-0 opacity-30" />
      )}
    </button>
  )
}

export const columns: ColumnDef<CostByModel>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "model",
    header: ({ column }) => <SortHeader column={column} label="Model" />,
    cell: ({ row }) => (
      <span
        className="text-[12px] font-medium truncate block max-w-[200px]"
        style={{ color: "var(--text-primary)" }}
      >
        {row.getValue("model")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "traceCount",
    header: ({ column }) => <SortHeader column={column} label="Traces" align="right" />,
    cell: ({ row }) => (
      <span
        className="text-[12px] font-mono tabular-nums block text-right"
        style={{ color: "var(--text-secondary)" }}
      >
        {(row.getValue("traceCount") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "totalCost",
    header: ({ column }) => <SortHeader column={column} label="Total cost" align="right" />,
    cell: ({ row }) => (
      <span
        className="text-[12px] font-mono tabular-nums block text-right truncate"
        style={{ color: "var(--text-secondary)" }}
      >
        ${(row.getValue("totalCost") as number).toFixed(6)}
      </span>
    ),
  },
  {
    id: "avgTokens",
    header: ({ column }) => <SortHeader column={column} label="Avg tokens" align="right" />,
    accessorFn: (row) =>
      row.traceCount > 0 ? Math.round(row.totalTokens / row.traceCount) : 0,
    cell: ({ row }) => {
      const val = row.getValue("avgTokens") as number
      return (
        <span
          className="text-[12px] font-mono tabular-nums block text-right"
          style={{ color: "var(--text-secondary)" }}
        >
          {val > 0 ? val.toLocaleString() : "—"}
        </span>
      )
    },
  },
  {
    id: "color",
    header: () => null,
    cell: ({ row }) => {
      const color = MODEL_COLORS[row.index % MODEL_COLORS.length]
      return (
        <span
          className="size-2 rounded-full block shrink-0"
          style={{ background: color }}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
]
