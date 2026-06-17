"use client"

import * as React from "react"
import type { SortingState, RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData extends { model: string }> {
  columns: ColumnDef<TData>[]
  data: TData[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
}

export function DataTable<TData extends { model: string }>({
  columns,
  data,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.model,
    enableRowSelection: true,
  })

  return (
    <div className="flex flex-col">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-2 py-0 h-auto border-b"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                onClick={() => row.toggleSelected()}
                className="cursor-pointer transition-colors"
                style={{
                  borderColor: "var(--border-subtle)",
                  background: row.getIsSelected()
                    ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                    : undefined,
                  animation: `fade-in 200ms ease-out ${i * 30}ms both`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-2 py-2.5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
