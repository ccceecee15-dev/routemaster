import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockService } from "@/services/mockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolbarFilter, ToggleGroup } from "@/components/filters/FilterCard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Calendar, Grid3x3, Grid2x2, Clock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { motion } from "framer-motion";

interface PeriodData {
  period: number;
  cpSales: number;
  actualSales: number | null;
  lyClosingStock: number;
  tgtClosingStock: number | null;
  actualClosingStock: number | null;
  otb: number | null;
  localOrders: number | null;
  importOrders: number | null;
  isEditable: boolean;
  isClosed: boolean;
}

interface VersionSnapshot {
  id: string;
  timestamp: Date;
  data: PeriodData[];
  changes: Record<string, { from: number | null; to: number | null }>;
}

const MicroSparkBar = ({ value, maxValue = 20 }: { value: number; maxValue?: number }) => {
  const normalized = Math.min(Math.abs(value), maxValue)
  const width = (normalized / maxValue) * 100
  const isPositive = value >= 0
  
  return (
    <div className="w-8 h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
      <motion.div 
        className={cn(
          "h-full rounded-full",
          isPositive ? "bg-emerald-500" : "bg-rose-500"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  )
}

const MetricCell = ({ 
  value, 
  type, 
  showBar = false,
}: { 
  value: number | null; 
  type: "currency" | "percent" | "percentChange";
  showBar?: boolean;
}) => {
  if (value === null) return <span className="text-slate-400">—</span>
  
  const formatValue = () => {
    if (type === "currency") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
      return `$${value.toLocaleString()}`
    }
    if (type === "percent" || type === "percentChange") {
      return `${value >= 0 && type === "percentChange" ? "+" : ""}${value.toFixed(1)}%`
    }
    return value
  }

  const getColor = () => {
    if (type !== "percentChange") return "text-slate-700 dark:text-slate-300"
    if (value > 2) return "text-emerald-600 dark:text-emerald-400"
    if (value > 0) return "text-emerald-500/80 dark:text-emerald-400/70"
    if (value < -2) return "text-rose-600 dark:text-rose-400"
    if (value < 0) return "text-rose-500/80 dark:text-rose-400/70"
    return "text-slate-500 dark:text-slate-400"
  }

  return (
    <div className="flex items-center justify-end gap-1 text-[11px]">
      <span className={cn("font-medium tabular-nums", getColor())}>
        {formatValue()}
      </span>
      {showBar && type === "percentChange" && <MicroSparkBar value={value} />}
    </div>
  )
}

export default function OTB() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [tableView, setTableView] = useState<"weeks" | "periods">("periods");
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [weekData, setWeekData] = useState<PeriodData[]>([]);
  const [editedCells, setEditedCells] = useState<Record<string, number>>({});
  const [versionHistory, setVersionHistory] = useState<VersionSnapshot[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const currentPeriod = 5;
  const currentWeek = 18;
  
  useEffect(() => {
    const loadData = async () => {
      await mockService.getDashboardData({});
      
      const newPeriodData: PeriodData[] = Array.from({ length: 13 }, (_, i) => {
        const period = i + 1;
        const isClosed = period < currentPeriod;
        const isAfterCurrent = period > currentPeriod;
        const isFirstPeriodOfYear = period === 1;
        
        const cpSales = 50000 + Math.random() * 40000;
        const lyClosingStock = 75000 + Math.random() * 40000;
        const tgtClosingStock = isAfterCurrent ? 80000 + Math.random() * 35000 : null;
        const actualClosingStockVal = tgtClosingStock ? tgtClosingStock + Math.random() * 3000 - 1500 : lyClosingStock + Math.random() * 2000;
        const actualSalesVal = cpSales * 0.8 + Math.random() * 5000;
        const localOrdersVal = 5000 + Math.random() * 3000;
        const importOrdersVal = 8000 + Math.random() * 5000;
        
        let otbVal = null;
        if (isClosed) {
          if (isFirstPeriodOfYear) {
            otbVal = tgtClosingStock;
          } else {
            otbVal = cpSales + (tgtClosingStock || lyClosingStock) - lyClosingStock;
          }
        }
        
        return {
          period,
          cpSales,
          actualSales: isClosed ? actualSalesVal : null,
          lyClosingStock,
          tgtClosingStock,
          actualClosingStock: isClosed ? actualClosingStockVal : null,
          otb: otbVal,
          localOrders: isClosed ? localOrdersVal : null,
          importOrders: isClosed ? importOrdersVal : null,
          isEditable: isAfterCurrent,
          isClosed,
        };
      });

      const newWeekData: PeriodData[] = Array.from({ length: 52 }, (_, i) => {
        const week = i + 1;
        const isClosed = week < currentWeek;
        const isAfterCurrent = week > currentWeek;
        const isFirstWeekOfYear = week === 1;
        
        const cpSales = 12000 + Math.random() * 8000;
        const lyClosingStock = 18000 + Math.random() * 8000;
        const tgtClosingStock = isAfterCurrent ? 15000 + Math.random() * 8000 : null;
        const actualClosingStockVal = tgtClosingStock ? tgtClosingStock + Math.random() * 500 - 250 : lyClosingStock + Math.random() * 300;
        const actualSalesVal = cpSales * 0.8 + Math.random() * 1000;
        const localOrdersVal = 1000 + Math.random() * 500;
        const importOrdersVal = 2000 + Math.random() * 1500;
        
        let otbVal = null;
        if (isClosed) {
          if (isFirstWeekOfYear) {
            otbVal = tgtClosingStock;
          } else {
            otbVal = cpSales + (tgtClosingStock || lyClosingStock) - lyClosingStock;
          }
        }
        
        return {
          period: week,
          cpSales,
          actualSales: isClosed ? actualSalesVal : null,
          lyClosingStock,
          tgtClosingStock,
          actualClosingStock: isClosed ? actualClosingStockVal : null,
          otb: otbVal,
          localOrders: isClosed ? localOrdersVal : null,
          importOrders: isClosed ? importOrdersVal : null,
          isEditable: isAfterCurrent,
          isClosed,
        };
      });
      
      setPeriodData(newPeriodData);
      setWeekData(newWeekData);
      setLoading(false);
    };
    loadData();
  }, []);

  const data = tableView === "weeks" ? weekData : periodData;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const sortData = (dataToSort: PeriodData[]) => {
    if (!sortColumn) return dataToSort;
    return [...dataToSort].sort((a, b) => {
      const aVal = a[sortColumn as keyof PeriodData];
      const bVal = b[sortColumn as keyof PeriodData];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      const aNum = parseInt(aStr.replace(/\D/g, ""), 10);
      const bNum = parseInt(bStr.replace(/\D/g, ""), 10);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  };

  const sortedData = sortData(data);

  const handleEditCell = (key: string, value: number) => {
    setEditedCells(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyChanges = () => {
    let hasNegativeOTB = false;
    const changes: Record<string, { from: number | null; to: number | null }> = {};
    
    const updatedData = data.map(row => {
      const tgtKey = `p${row.period}-tgtClosing`;
      const tgtClosing = editedCells[tgtKey] ?? row.tgtClosingStock;
      
      if (tgtClosing !== null && tgtClosing < 0) {
        hasNegativeOTB = true;
      }
      
      const isFirstPeriod = row.period === 1;
      let calculatedOTB = row.otb;
      if (tgtClosing !== null) {
        if (isFirstPeriod) {
          calculatedOTB = tgtClosing;
        } else {
          calculatedOTB = row.cpSales + tgtClosing - row.lyClosingStock;
        }
      }
      
      if (calculatedOTB !== null && calculatedOTB < 0) {
        hasNegativeOTB = true;
      }

      if (editedCells[tgtKey] !== undefined) {
        changes[tgtKey] = { from: row.tgtClosingStock, to: tgtClosing };
      }
      
      return {
        ...row,
        tgtClosingStock: tgtClosing,
        otb: calculatedOTB,
      };
    });
    
    if (hasNegativeOTB) {
      toast.error("You cannot have a negative purchase plan.");
      return;
    }
    
    if (tableView === "weeks") {
      setWeekData(updatedData);
    } else {
      setPeriodData(updatedData);
    }

    const newVersion: VersionSnapshot = {
      id: Date.now().toString(),
      timestamp: new Date(),
      data: updatedData,
      changes,
    };
    
    setVersionHistory(prev => [newVersion, ...prev].slice(0, 2));
    setEditedCells({});
    toast.success("OTB changes applied successfully.");
  };

  const handleRestoreVersion = (versionId: string) => {
    const version = versionHistory.find(v => v.id === versionId);
    if (!version) return;
    
    if (tableView === "weeks") {
      setWeekData(version.data);
    } else {
      setPeriodData(version.data);
    }
    setSelectedVersion(null);
    setShowVersionHistory(false);
    toast.success("Version restored successfully.");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading OTB Data...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const TableHeader = ({ children, sortable, sortKey, className, group }: any) => (
    <th 
      onClick={() => sortable && handleSort(sortKey)}
      className={cn(
        "px-2 py-2 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-slate-700",
        sortable && "cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors",
        group === "sales" && "bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
        group === "stock" && "bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
        group === "orders" && "bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
        className
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {children}
        {sortable && getSortIcon(sortKey)}
      </div>
    </th>
  )

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setSelectedCategory("all");
            setSelectedSubcategory("all");
            setSelectedMerchArea("all");
          }}
          fields={[
            {
              id: "category",
              label: "Category",
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: [
                { value: "all", label: "All" },
                { value: "books", label: "Books" },
                { value: "stationery", label: "Stationery" },
                { value: "gifts", label: "Gifts" },
              ]
            },
            {
              id: "subcategory",
              label: "Subcat",
              value: selectedSubcategory,
              onChange: setSelectedSubcategory,
              options: [
                { value: "all", label: "All" },
                { value: "fiction", label: "Fiction" },
                { value: "non-fiction", label: "Non-Fiction" },
              ]
            },
            {
              id: "merch-area",
              label: "Merch Area",
              value: selectedMerchArea,
              onChange: setSelectedMerchArea,
              options: [
                { value: "all", label: "All" },
                { value: "main", label: "Main Floor" },
                { value: "section-a", label: "Section A" },
              ]
            },
          ]}
        />

        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    OTB Plan
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Planning</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] font-bold px-1 py-0 h-auto border-none text-blue-600 dark:text-blue-400">{selectedYear}</Badge>
                      <span className="text-[10px] text-slate-400">/</span>
                      <Badge variant="outline" className="text-[10px] font-bold px-1 py-0 h-auto border-none text-slate-600 dark:text-slate-300">
                        {tableView === "weeks" ? "52 Weeks" : "13 Periods"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="flex items-center">
                  <ToolbarFilter
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={[{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }]}
                  />
                </div>

                <div className="flex items-center">
                  <ToggleGroup
                    value={tableView}
                    onChange={(v) => setTableView(v as "weeks" | "periods")}
                    options={[
                      { value: "weeks", label: "Wks", icon: <Grid3x3 className="h-3 w-3" /> },
                      { value: "periods", label: "Prd", icon: <Grid2x2 className="h-3 w-3" /> },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-1.5 ml-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <Button 
                    size="sm" 
                    variant={Object.keys(editedCells).length > 0 ? "default" : "outline"}
                    className={cn(
                      "h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                      Object.keys(editedCells).length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                        : "text-slate-400"
                    )}
                    onClick={handleApplyChanges}
                    disabled={Object.keys(editedCells).length === 0}
                  >
                    Apply Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg" 
                    onClick={() => setShowVersionHistory(true)}
                    disabled={versionHistory.length === 0}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    History
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-full">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th colSpan={1} className="bg-slate-50 dark:bg-slate-900 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700"></th>
                      <th colSpan={2} className="bg-blue-50/60 dark:bg-blue-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 border-r border-slate-200 dark:border-slate-700">Sales</th>
                      <th colSpan={4} className="bg-emerald-50/60 dark:bg-emerald-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-700">Stock</th>
                      <th colSpan={3} className="bg-amber-50/60 dark:bg-amber-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Orders</th>
                    </tr>
                    <tr>
                      <TableHeader sortable sortKey="period" className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-w-[70px]">
                        {tableView === "weeks" ? "Week" : "Period"}
                      </TableHeader>
                      <TableHeader sortable sortKey="cpSales" group="sales">CP Sales</TableHeader>
                      <TableHeader sortable sortKey="actualSales" group="sales">Actual</TableHeader>
                      <TableHeader sortable sortKey="lyClosingStock" group="stock">LY Closing</TableHeader>
                      <TableHeader sortable sortKey="tgtClosingStock" group="stock">Target</TableHeader>
                      <TableHeader sortable sortKey="actualClosingStock" group="stock">Actual</TableHeader>
                      <TableHeader sortable sortKey="otb" group="stock">OTB</TableHeader>
                      <TableHeader sortable sortKey="localOrders" group="orders">Local</TableHeader>
                      <TableHeader sortable sortKey="importOrders" group="orders">Import</TableHeader>
                      <TableHeader group="orders">Total</TableHeader>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedData.map((row, idx) => {
                      const tgtKey = `p${row.period}-tgtClosing`;
                      const tgtClosing = editedCells[tgtKey] ?? row.tgtClosingStock;
                      const isFirstPeriod = row.period === 1;
                      let calculatedOTB = row.otb;
                      if (tgtClosing !== null) {
                        if (isFirstPeriod) {
                          calculatedOTB = tgtClosing;
                        } else {
                          calculatedOTB = row.cpSales + tgtClosing - row.lyClosingStock;
                        }
                      }
                      const isNegative = calculatedOTB !== null && calculatedOTB < 0;
                      const totalOrders = (row.localOrders || 0) + (row.importOrders || 0);
                      
                      return (
                        <motion.tr 
                          key={`${tableView}-${row.period}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          className={cn(
                            "h-9 transition-colors",
                            hoveredRow === idx && "bg-slate-50 dark:bg-slate-800/50",
                            row.isClosed && "bg-slate-50/50 dark:bg-slate-800/30"
                          )}
                          onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 px-2 py-1.5 font-bold text-center text-slate-700 dark:text-slate-300">
                            {tableView === "weeks" ? `W${row.period}` : `P${row.period}`}
                          </td>
                          <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10">
                            <MetricCell value={row.cpSales} type="currency" />
                          </td>
                          <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10 border-r border-slate-200 dark:border-slate-700">
                            <MetricCell value={row.actualSales} type="currency" />
                          </td>
                          <td className="px-2 py-1.5 text-right bg-emerald-50/20 dark:bg-emerald-950/10">
                            <MetricCell value={row.lyClosingStock} type="currency" />
                          </td>
                          <td className={cn("px-1 py-1 bg-emerald-50/20 dark:bg-emerald-950/10", row.isEditable && "cursor-text")}>
                            {row.isEditable ? (
                              <input
                                type="number"
                                value={tgtClosing ? Math.floor(tgtClosing) : ""}
                                onChange={(e) => handleEditCell(tgtKey, parseFloat(e.target.value) || 0)}
                                className="w-full h-7 text-right text-[11px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 rounded px-2 font-medium transition-colors"
                              />
                            ) : (
                              <div className="px-1">
                                <MetricCell value={tgtClosing} type="currency" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right bg-emerald-50/20 dark:bg-emerald-950/10">
                            <MetricCell value={row.actualClosingStock} type="currency" />
                          </td>
                          <td className={cn("px-2 py-1.5 text-right bg-emerald-50/20 dark:bg-emerald-950/10 border-r border-slate-200 dark:border-slate-700 font-semibold", isNegative && "text-rose-600 dark:text-rose-400")}>
                            <MetricCell value={calculatedOTB} type="currency" />
                          </td>
                          <td className="px-2 py-1.5 text-right bg-amber-50/20 dark:bg-amber-950/10">
                            <MetricCell value={row.localOrders} type="currency" />
                          </td>
                          <td className="px-2 py-1.5 text-right bg-amber-50/20 dark:bg-amber-950/10">
                            <MetricCell value={row.importOrders} type="currency" />
                          </td>
                          <td className="px-2 py-1.5 text-right bg-amber-50/20 dark:bg-amber-950/10 font-semibold">
                            <MetricCell value={row.localOrders !== null ? totalOrders : null} type="currency" />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className={selectedVersion ? "max-w-4xl max-h-[90vh]" : "max-w-2xl max-h-96"}>
            <DialogHeader>
              <DialogTitle>{selectedVersion ? "Version Details" : "Version History"}</DialogTitle>
            </DialogHeader>
            
            {!selectedVersion ? (
              <ScrollArea className="h-72 w-full pr-4">
                <div className="space-y-3">
                  {versionHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No version history available</p>
                  ) : (
                    versionHistory.map((version, idx) => (
                      <div key={version.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">Version {idx + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {version.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedVersion(version.id)}
                          >
                            View Version
                          </Button>
                        </div>
                        {Object.keys(version.changes).length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                            <p className="text-xs font-medium text-amber-900">Changes:</p>
                            {Object.entries(version.changes).map(([key, change]) => (
                              <div key={key} className="text-xs text-amber-800">
                                <span className="line-through text-red-600">${change.from ? Math.floor(change.from).toLocaleString() : "—"}</span>
                                <span className="ml-2 text-green-600">${change.to ? Math.floor(change.to).toLocaleString() : "—"}</span>
                                <span className="ml-1 text-muted-foreground">({key})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Changes from current version:</p>
                  {versionHistory.find(v => v.id === selectedVersion)?.changes && Object.keys(versionHistory.find(v => v.id === selectedVersion)?.changes || {}).length > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
                      {Object.entries(versionHistory.find(v => v.id === selectedVersion)?.changes || {}).map(([key, change]) => (
                        <div key={key} className="text-sm text-amber-800">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2 line-through text-red-600">${change.from ? Math.floor(change.from).toLocaleString() : "—"}</span>
                          <span className="ml-2 text-green-600">${change.to ? Math.floor(change.to).toLocaleString() : "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No changes in this version</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedVersion(null)}>
                    Back
                  </Button>
                  <Button onClick={() => handleRestoreVersion(selectedVersion!)}>
                    Restore This Version
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
