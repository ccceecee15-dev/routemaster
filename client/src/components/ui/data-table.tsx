import * as React from "react"
import { cn, getTrafficLightColor } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Column {
  key: string
  label: string
  shortLabel?: string
  type: "text" | "currency" | "percent" | "percentChange"
  group?: "sales" | "margin" | "info"
  width?: string
  sortable?: boolean
  sticky?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  rowClickable?: boolean
  sortColumn?: string | null
  sortDirection?: "asc" | "desc"
  onSort?: (column: string) => void
  className?: string
  compactMode?: boolean
}

const formatValue = (value: any, type: Column["type"]) => {
  if (value === null || value === undefined) return "-"
  
  switch (type) {
    case "currency":
      return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    case "percent":
      return `${Number(value).toFixed(1)}%`
    case "percentChange":
      const num = Number(value)
      return (
        <span className={cn(
          "inline-flex items-center gap-0.5 font-medium tabular-nums",
          num > 2 ? "text-emerald-600 dark:text-emerald-400" :
          num > 0 ? "text-emerald-500/80 dark:text-emerald-400/80" :
          num < -2 ? "text-rose-600 dark:text-rose-400" :
          num < 0 ? "text-rose-500/80 dark:text-rose-400/80" :
          "text-slate-500 dark:text-slate-400"
        )}>
          {num > 0 ? <TrendingUp className="h-3 w-3" /> : num < 0 ? <TrendingDown className="h-3 w-3" /> : null}
          {num > 0 ? "+" : ""}{num.toFixed(1)}%
        </span>
      )
    default:
      return value
  }
}

const MiniSparkline = ({ value }: { value: number }) => {
  const normalized = Math.min(Math.max(value, -20), 20)
  const width = Math.abs(normalized) * 2
  const isPositive = normalized >= 0
  
  return (
    <div className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden relative">
      <div 
        className={cn(
          "absolute h-full transition-all duration-300",
          isPositive ? "bg-emerald-400 dark:bg-emerald-500 left-1/2" : "bg-rose-400 dark:bg-rose-500 right-1/2"
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function DataTable({
  columns,
  data,
  onRowClick,
  rowClickable = false,
  sortColumn,
  sortDirection,
  onSort,
  className,
  compactMode = true
}: DataTableProps) {
  const salesColumns = columns.filter(c => c.group === "sales")
  const marginColumns = columns.filter(c => c.group === "margin")
  const infoColumns = columns.filter(c => !c.group || c.group === "info")

  const renderHeader = (col: Column, idx: number, groupType?: string) => {
    const isFirst = idx === 0
    const isSorted = sortColumn === col.key
    
    return (
      <th
        key={col.key}
        onClick={() => col.sortable && onSort?.(col.key)}
        className={cn(
          "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap",
          "border-b border-slate-200/80 dark:border-slate-700/80",
          col.sticky && "sticky left-0 z-20",
          col.sortable && "cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 select-none",
          groupType === "sales" && "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
          groupType === "margin" && "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
          !groupType && "bg-slate-50/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300"
        )}
        style={{ width: col.width, minWidth: col.width }}
      >
        <div className="flex items-center justify-center gap-1">
          <span>{col.shortLabel || col.label}</span>
          {col.sortable && (
            <span className={cn("transition-opacity", isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40")}>
              {isSorted && sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          )}
        </div>
      </th>
    )
  }

  const renderCell = (row: any, col: Column, groupType?: string) => {
    const value = row[col.key]
    
    return (
      <td
        key={col.key}
        className={cn(
          "px-2 py-1 text-[11px] text-center whitespace-nowrap tabular-nums",
          "border-b border-slate-100 dark:border-slate-800/50",
          col.sticky && "sticky left-0 z-10 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100",
          groupType === "sales" && "bg-blue-50/20 dark:bg-blue-950/10",
          groupType === "margin" && "bg-emerald-50/20 dark:bg-emerald-950/10",
        )}
      >
        {formatValue(value, col.type)}
      </td>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <ScrollArea className="w-full">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-30">
              <tr className="group">
                {infoColumns.map((col, idx) => renderHeader(col, idx))}
                {salesColumns.length > 0 && (
                  <>
                    <th 
                      colSpan={salesColumns.length}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100/90 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800 text-center"
                    >
                      Sales Performance
                    </th>
                  </>
                )}
                {marginColumns.length > 0 && (
                  <th 
                    colSpan={marginColumns.length}
                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800 text-center"
                  >
                    Margin Performance
                  </th>
                )}
              </tr>
              <tr className="group">
                {infoColumns.map((col, idx) => renderHeader(col, idx))}
                {salesColumns.map((col, idx) => renderHeader(col, idx, "sales"))}
                {marginColumns.map((col, idx) => renderHeader(col, idx, "margin"))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => rowClickable && onRowClick?.(row)}
                  className={cn(
                    "group/row transition-colors duration-75",
                    rowClickable && "cursor-pointer",
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    rowIdx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-25 dark:bg-slate-900/50"
                  )}
                >
                  {infoColumns.map(col => renderCell(row, col))}
                  {salesColumns.map(col => renderCell(row, col, "sales"))}
                  {marginColumns.map(col => renderCell(row, col, "margin"))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  )
}

export { type Column, type DataTableProps }
