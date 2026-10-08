import { useState, useEffect, useMemo, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockService } from "@/services/mockService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Download, Calendar, Grid3x3, Grid2x2, Maximize2, Minimize2, Package, Store, TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Layers, ChevronRight, Sparkles, Filter, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolbarFilter, ToggleGroup } from "@/components/filters/FilterCard";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { KpiCard } from "@/components/filters/KpiCard";
import { SegmentTabs } from "@/components/ui/segment-tabs";
import { motion, AnimatePresence } from "framer-motion";

const PRODUCT_CATEGORIES = ["Books", "Stationery", "Gifts", "Media", "Electronics"];
const PRODUCT_SUBCATEGORIES: Record<string, string[]> = {
  "Books": ["Fiction", "Non-Fiction", "Educational"],
  "Stationery": ["Writing", "Office Supplies", "Notebooks"],
  "Gifts": ["Decorative", "Seasonal", "Premium"],
  "Media": ["DVD", "Vinyl", "CD"],
  "Electronics": ["Chargers", "Cables", "Headphones"],
};

const STORE_FORMATS = ["Legacy", "InMotion", "Tech Express", "The Bookshop by WHSmith", "curi.o.city", "Funky Pigeon", "Fresh+"];
const STORES_BY_FORMAT: Record<string, string[]> = {
  "Legacy": ["Legacy Toronto", "Legacy Vancouver", "Legacy Montreal", "Legacy Calgary", "Legacy Ottawa", "Legacy Edmonton", "Legacy Winnipeg", "Legacy Hamilton", "Legacy Quebec City", "Legacy Mississauga"],
  "InMotion": ["InMotion Chicago", "InMotion New York", "InMotion Los Angeles", "InMotion Houston", "InMotion Phoenix", "InMotion Philadelphia", "InMotion San Antonio", "InMotion San Diego", "InMotion Dallas", "InMotion San Jose"],
  "Tech Express": ["Tech Express Boston", "Tech Express Seattle", "Tech Express Miami", "Tech Express Austin", "Tech Express Denver", "Tech Express Portland", "Tech Express Las Vegas", "Tech Express Atlanta", "Tech Express Minneapolis", "Tech Express Detroit"],
  "The Bookshop by WHSmith": ["Bookshop Toronto", "Bookshop Vancouver", "Bookshop Montreal", "Bookshop Calgary", "Bookshop Ottawa", "Bookshop Edmonton", "Bookshop Winnipeg", "Bookshop Hamilton", "Bookshop Quebec", "Bookshop Mississauga"],
  "curi.o.city": ["curi.o.city Chicago", "curi.o.city New York", "curi.o.city Los Angeles", "curi.o.city Houston", "curi.o.city Phoenix", "curi.o.city Philadelphia", "curi.o.city San Antonio", "curi.o.city San Diego", "curi.o.city Dallas", "curi.o.city San Jose"],
  "Funky Pigeon": ["Funky Pigeon Boston", "Funky Pigeon Seattle", "Funky Pigeon Miami", "Funky Pigeon Austin", "Funky Pigeon Denver", "Funky Pigeon Portland", "Funky Pigeon Las Vegas", "Funky Pigeon Atlanta", "Funky Pigeon Minneapolis", "Funky Pigeon Detroit"],
  "Fresh+": ["Fresh+ Toronto", "Fresh+ Vancouver", "Fresh+ Montreal", "Fresh+ Calgary", "Fresh+ Ottawa", "Fresh+ Edmonton", "Fresh+ Winnipeg", "Fresh+ Hamilton", "Fresh+ Quebec", "Fresh+ Mississauga"],
};

const generateSalesRow = () => ({
  sales_actual: Math.floor(Math.random() * 500000 + 50000),
  sales_cont_percent: Math.random() * 10 + 5,
  sales_wow_percent: Math.random() * 20 - 10,
  sales_ptd: Math.floor(Math.random() * 2000000 + 500000),
  sales_ptd_ly_percent: Math.random() * 15 - 5,
  sales_ptd_lfl_percent: Math.random() * 15 - 5,
  sales_pop_percent: Math.random() * 10 - 5,
  sales_yoy_percent: Math.random() * 25 - 5,
  sales_yoy_lfl_percent: Math.random() * 25 - 5,
  sales_ytd: Math.floor(Math.random() * 5000000 + 1000000),
  sales_ytd_ly_percent: Math.random() * 20 - 5,
  sales_ytd_lfl_percent: Math.random() * 20 - 5,
  cp_sales: Math.floor(Math.random() * 1000000 + 200000),
  vs_cp_percent: Math.random() * 15 - 5,
  ptd_vs_cp_percent: Math.random() * 15 - 5,
  ytd_vs_cp_percent: Math.random() * 15 - 5,
  margin_lw: Math.floor(Math.random() * 200000 + 20000),
  margin_percent: Math.random() * 10 + 25,
  margin_cont_percent: Math.random() * 5 + 2,
  margin_wow_percent: Math.random() * 10 - 5,
  margin_ptd: Math.floor(Math.random() * 800000 + 200000),
  margin_ptd_ly_percent: Math.random() * 15 - 5,
  margin_ptd_lfl_percent: Math.random() * 15 - 5,
  margin_yoy_percent: Math.random() * 20 - 5,
  margin_yoy_lfl_percent: Math.random() * 20 - 5,
  margin_ytd: Math.floor(Math.random() * 2000000 + 500000),
  margin_ytd_ly_percent: Math.random() * 15 - 5,
  margin_ytd_lfl_percent: Math.random() * 15 - 5,
});

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
  compact = true 
}: { 
  value: number; 
  type: "currency" | "percent" | "percentChange";
  showBar?: boolean;
  compact?: boolean;
}) => {
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
    <div className={cn("flex items-center justify-center gap-1", compact ? "text-[11px]" : "text-xs")}>
      <span className={cn("font-medium tabular-nums", getColor())}>
        {formatValue()}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  
  const [tableView, setTableView] = useState<"weeks" | "periods">("weeks");
  const [viewMode, setViewMode] = useState<"time" | "product" | "store">("time");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  };

  const scrollStep = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const step = 400; // Move by roughly 4 columns
      const currentScroll = scrollRef.current.scrollLeft;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - step : currentScroll + step,
        behavior: 'smooth'
      });
    }
  };
  
  const [drillLevel, setDrillLevel] = useState<"category" | "subcategory">("category");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("Books");
  const [storeDrillLevel, setStoreDrillLevel] = useState<"format" | "store">("format");
  const [selectedFormat, setSelectedFormat] = useState<string>("Legacy");
  
  useEffect(() => {
    const loadData = async () => {
      const res = await mockService.getDashboardData({});
      setData(res);
      setLoading(false);
    };
    loadData();
  }, []);

  const productViewData = useMemo(() => {
    if (drillLevel === "category") {
      return PRODUCT_CATEGORIES.map(cat => ({ label: cat, ...generateSalesRow() }));
    }
    return (PRODUCT_SUBCATEGORIES[selectedProductCategory] || []).map(subcat => ({ label: subcat, ...generateSalesRow() }));
  }, [drillLevel, selectedProductCategory]);
  
  const storeViewData = useMemo(() => {
    if (storeDrillLevel === "format") {
      return STORE_FORMATS.map(format => ({ label: format, ...generateSalesRow() }));
    }
    return (STORES_BY_FORMAT[selectedFormat] || []).map(store => ({ label: store, ...generateSalesRow() }));
  }, [storeDrillLevel, selectedFormat]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading Dashboard...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { kpis, weekTrendData, periodTrendData } = data;

  const filterDataByTab = (data: any[]) => {
    if (selectedTab === "all") return data;
    const itemsPerTab = Math.ceil(data.length / 3);
    if (selectedTab === "keyline") return data.slice(0, itemsPerTab);
    return data.slice(itemsPerTab * 2);
  };

  const sortData = (data: any[]) => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  };

  const baseTimeData = tableView === "weeks" ? weekTrendData : periodTrendData;
  const currentTableData = sortData(filterDataByTab(baseTimeData));
  const sortedProductData = sortData(productViewData);
  const sortedStoreData = sortData(storeViewData);
  const displayData = viewMode === "time" ? currentTableData : viewMode === "product" ? sortedProductData : sortedStoreData;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleRowClick = (row: any) => {
    if (viewMode === "product" && drillLevel === "category") {
      setSelectedProductCategory(row.label);
      setDrillLevel("subcategory");
    } else if (viewMode === "store" && storeDrillLevel === "format") {
      setSelectedFormat(row.label);
      setStoreDrillLevel("store");
    }
  };

  const handleDrillBack = () => {
    if (viewMode === "product") setDrillLevel("category");
    else if (viewMode === "store") setStoreDrillLevel("format");
  };

  const canDrill = (viewMode === "product" && drillLevel === "category") || (viewMode === "store" && storeDrillLevel === "format");
  const hasDrilled = (viewMode === "product" && drillLevel !== "category") || (viewMode === "store" && storeDrillLevel !== "format");

  const baseDataLength = baseTimeData?.length || 0;
  const tabs = [
    { id: "all", label: "All", count: baseDataLength, color: "default" as const },
    { id: "keyline", label: "Keyline", count: Math.ceil(baseDataLength / 3), color: "blue" as const },
    { id: "discontinued", label: "Discontinued", count: baseDataLength - Math.ceil(baseDataLength / 3) * 2, color: "rose" as const },
  ];

  const TableHeader = ({ children, group, sortable, sortKey, className }: any) => (
    <th 
      onClick={() => sortable && handleSort(sortKey)}
      className={cn(
        "px-1.5 py-2 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap text-center",
        "border-b-2 border-slate-200 dark:border-slate-700",
        sortable && "cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
        group === "sales" && "bg-gradient-to-b from-blue-50 to-blue-50/50 dark:from-blue-950/60 dark:to-blue-950/30 text-blue-800 dark:text-blue-200",
        group === "margin" && "bg-gradient-to-b from-emerald-50 to-emerald-50/50 dark:from-emerald-950/60 dark:to-emerald-950/30 text-emerald-800 dark:text-emerald-200",
        !group && "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
        className
      )}
    >
      <div className="flex items-center justify-center gap-0.5">
        {children}
        {sortable && sortColumn === sortKey && (
          <ChevronDown className={cn("h-3 w-3 transition-transform", sortDirection === "asc" && "rotate-180")} />
        )}
      </div>
    </th>
  );

  const renderTable = () => (
    <div className="relative border overflow-hidden bg-card">
      <div 
        ref={scrollRef} 
        className="w-full overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        <table className="min-w-[2400px] w-full border-collapse text-[11px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="w-[100px] sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700" />
              <th colSpan={15} className="py-2 text-[10px] font-bold uppercase tracking-widest bg-blue-100/90 dark:bg-blue-900/70 text-blue-900 dark:text-blue-100 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Sales Performance
                </div>
              </th>
              <th colSpan={12} className="py-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-100/90 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-100 border-b border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  Margin Performance
                </div>
              </th>
            </tr>
            <tr>
              <TableHeader className="sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" sortable sortKey="label">
                {viewMode === "time" ? (tableView === "weeks" ? "Week" : "Period") : viewMode === "product" ? (drillLevel === "category" ? "Category" : "Subcategory") : (storeDrillLevel === "format" ? "Format" : "Store")}
              </TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="sales_actual">LW $</TableHeader>
              <TableHeader group="sales" className="w-[100px]" sortable sortKey="sales_cont_percent">Cont. %</TableHeader>
              <TableHeader group="sales" className="w-[100px]" sortable sortKey="sales_wow_percent">WoW %</TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="sales_ptd">PTD $</TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="sales_ptd_ly_percent">PTD vs LY %</TableHeader>
              <TableHeader group="sales" className="w-[110px]" sortable sortKey="sales_ptd_lfl_percent">PTD LFL %</TableHeader>
              <TableHeader group="sales" className="w-[100px]" sortable sortKey="sales_yoy_percent">YoY %</TableHeader>
              <TableHeader group="sales" className="w-[110px]" sortable sortKey="sales_yoy_lfl_percent">YoY LFL %</TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="sales_ytd">YTD $</TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="sales_ytd_ly_percent">YTD vs LY %</TableHeader>
              <TableHeader group="sales" className="w-[110px]" sortable sortKey="sales_ytd_lfl_percent">YTD LFL %</TableHeader>
              <TableHeader group="sales" className="w-[120px]" sortable sortKey="cp_sales">CP Sales $</TableHeader>
              <TableHeader group="sales" className="w-[100px]" sortable sortKey="vs_cp_percent">vs CP %</TableHeader>
              <TableHeader group="sales" className="w-[110px]" sortable sortKey="ptd_vs_cp_percent">PTD vs CP %</TableHeader>
              <TableHeader group="sales" className="w-[110px]" sortable sortKey="ytd_vs_cp_percent">YTD vs CP %</TableHeader>

              <TableHeader group="margin" className="w-[120px]" sortable sortKey="margin_lw">LW $</TableHeader>
              <TableHeader group="margin" className="w-[100px]" sortable sortKey="margin_percent">% Margin</TableHeader>
              <TableHeader group="margin" className="w-[100px]" sortable sortKey="margin_cont_percent">Cont. %</TableHeader>
              <TableHeader group="margin" className="w-[100px]" sortable sortKey="margin_wow_percent">WoW %</TableHeader>
              <TableHeader group="margin" className="w-[130px]" sortable sortKey="margin_ptd">PTD Margin $</TableHeader>
              <TableHeader group="margin" className="w-[120px]" sortable sortKey="margin_ptd_ly_percent">PTD vs LY %</TableHeader>
              <TableHeader group="margin" className="w-[110px]" sortable sortKey="margin_ptd_lfl_percent">PTD LFL %</TableHeader>
              <TableHeader group="margin" className="w-[100px]" sortable sortKey="margin_yoy_percent">YoY %</TableHeader>
              <TableHeader group="margin" className="w-[110px]" sortable sortKey="margin_yoy_lfl_percent">YoY LFL %</TableHeader>
              <TableHeader group="margin" className="w-[130px]" sortable sortKey="margin_ytd">YTD Margin $</TableHeader>
              <TableHeader group="margin" className="w-[120px]" sortable sortKey="margin_ytd_ly_percent">YTD vs LY %</TableHeader>
              <TableHeader group="margin" className="w-[110px]" sortable sortKey="margin_ytd_lfl_percent">YTD LFL %</TableHeader>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayData.map((row: any, idx: number) => (
                <motion.tr
                  key={row.id || row.label || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.01 }}
                  onClick={() => canDrill && handleRowClick(row)}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "group transition-all duration-100",
                    canDrill && "cursor-pointer",
                    hoveredRow === idx ? "bg-slate-50 dark:bg-slate-800/70" : idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50",
                    "border-b border-slate-100 dark:border-slate-800/50"
                  )}
                >
                  <td className={cn(
                    "sticky left-0 z-10 px-3 py-2 font-semibold text-[11px] w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                    hoveredRow === idx ? "bg-slate-50 dark:bg-slate-800/70" : idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50",
                    canDrill && "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                  )}>
                    <div className="flex items-center gap-1">
                      <span className="truncate">{row.label}</span>
                      {canDrill && <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_actual} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_cont_percent} type="percent" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_wow_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ptd} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ptd_ly_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ptd_lfl_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_yoy_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_yoy_lfl_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ytd} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ytd_ly_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.sales_ytd_lfl_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.cp_sales} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.vs_cp_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.ptd_vs_cp_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-blue-50/30 dark:bg-blue-950/20 text-center"><MetricCell value={row.ytd_vs_cp_percent} type="percentChange" compact={false} /></td>

                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_lw} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_percent} type="percent" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_cont_percent} type="percent" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_wow_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ptd} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ptd_ly_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ptd_lfl_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_yoy_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_yoy_lfl_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ytd} type="currency" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ytd_ly_percent} type="percentChange" compact={false} /></td>
                  <td className="px-2 py-2 bg-emerald-50/30 dark:bg-emerald-950/20 text-center"><MetricCell value={row.margin_ytd_lfl_percent} type="percentChange" compact={false} /></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isFocused) {
    return (
      <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div>
            <h1 className="text-lg font-bold">Sales & Margin Performance</h1>
            <p className="text-xs text-muted-foreground">Full-screen view</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsFocused(false)} className="gap-2">
            <Minimize2 className="h-4 w-4" />
            Exit
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {renderTable()}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-5 animate-in fade-in duration-500">
        
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <KpiCard
            title="YTD Sales"
            value={`$${(kpis.ytdSales?.value || 0).toLocaleString()}`}
            change={kpis.ytdSales?.delta || 0}
            icon={<DollarSign size={16} className="text-primary" />}
          />
          <KpiCard
            title="YTD Margin"
            value={`${kpis.ytdMargin?.value || 0}%`}
            change={kpis.ytdMargin?.delta || 0}
            icon={<Percent size={16} className="text-primary" />}
          />
          <KpiCard
            title="YoY Growth"
            value={`${(kpis.yoyGrowth?.value || 0).toFixed(1)}%`}
            change={kpis.yoyGrowth?.delta || 0}
            changeLabel="vs prior"
            icon={<BarChart3 size={16} className="text-primary" />}
          />
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setSelectedCategory("all");
            setSelectedSubcategory("all");
            setSelectedMerchArea("all");
            setSelectedPlanningGroup("all");
            setSelectedSubPlanningGroup("all");
          }}
          fields={[
            { id: "category", label: "Category", value: selectedCategory, onChange: setSelectedCategory, options: [{ value: "all", label: "All" }, { value: "books", label: "Books" }, { value: "stationery", label: "Stationery" }, { value: "gifts", label: "Gifts" }] },
            { id: "subcategory", label: "Subcat", value: selectedSubcategory, onChange: setSelectedSubcategory, options: [{ value: "all", label: "All" }, { value: "fiction", label: "Fiction" }, { value: "non-fiction", label: "Non-Fiction" }] },
            { id: "merch-area", label: "Merch Area", value: selectedMerchArea, onChange: setSelectedMerchArea, options: [{ value: "all", label: "All" }, { value: "main", label: "Main Floor" }, { value: "section-a", label: "Section A" }] },
            { id: "planning-group", label: "Group", value: selectedPlanningGroup, onChange: setSelectedPlanningGroup, options: [{ value: "all", label: "All" }, { value: "group-1", label: "Group 1" }, { value: "group-2", label: "Group 2" }] },
            { id: "sub-planning-group", label: "Sub Group", value: selectedSubPlanningGroup, onChange: setSelectedSubPlanningGroup, options: [{ value: "all", label: "All" }, { value: "sub-1", label: "Sub 1" }, { value: "sub-2", label: "Sub 2" }] },
          ]}
        />

        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    Sales & Margin Trend
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Dashboard</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] font-bold px-1 py-0 h-auto border-none text-blue-600 dark:text-blue-400">2025</Badge>
                      <span className="text-[10px] text-slate-400">/</span>
                      <Badge variant="outline" className="text-[10px] font-bold px-1 py-0 h-auto border-none text-slate-600 dark:text-slate-300">
                        {tableView === "weeks" ? "52 Weeks" : "13 Periods"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  <ToolbarFilter
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    value="2025"
                    onChange={() => {}}
                    options={[{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }]}
                  />
                </div>

                {viewMode === "time" && (
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
                )}

                <div className="flex items-center">
                  <ToggleGroup
                    value={viewMode}
                    showLabel
                    onChange={(v) => {
                      setViewMode(v as "time" | "product" | "store");
                      setDrillLevel("category");
                      setStoreDrillLevel("format");
                    }}
                    options={[
                      { value: "time", label: "Time", icon: <Calendar className="h-3 w-3" /> },
                      { value: "product", label: "Product", icon: <Package className="h-3 w-3" /> },
                      { value: "store", label: "Store", icon: <Store className="h-3 w-3" /> },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-1 ml-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsFocused(true)}>
                    <Maximize2 className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          {hasDrilled && (
            <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDrillBack}
                className="h-7 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 gap-1"
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back to {viewMode === "product" ? "Categories" : "Formats"}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {viewMode === "product" ? selectedProductCategory : selectedFormat}
                </Badge>
              </Button>
            </div>
          )}
          
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between">
            <SegmentTabs
              tabs={tabs}
              activeTab={selectedTab}
              onChange={setSelectedTab}
              variant="pills"
              size="sm"
            />
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3 ml-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700" 
                onClick={scrollToLeft}
                title="Scroll to start"
              >
                <div className="flex -space-x-2">
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700" 
                onClick={() => scrollStep('left')}
                title="Scroll left"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700" 
                onClick={() => scrollStep('right')}
                title="Scroll right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700" 
                onClick={scrollToRight}
                title="Scroll to end"
              >
                <div className="flex -space-x-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-auto">
            {renderTable()}
          </div>
          
          <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Showing {displayData.length} {viewMode === "time" ? (tableView === "weeks" ? "weeks" : "periods") : viewMode === "product" ? (drillLevel === "category" ? "categories" : "subcategories") : (storeDrillLevel === "format" ? "formats" : "stores")}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> Positive</span>
              <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-rose-500" /> Negative</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
