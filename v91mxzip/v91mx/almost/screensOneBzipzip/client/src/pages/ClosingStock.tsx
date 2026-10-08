import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { SegmentTabs } from "@/components/ui/segment-tabs";
import { Download, Calendar, Grid3x3, Grid2x2, Store, Package, Maximize2, Minimize2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, TrendingUp, Filter, ChevronDown, X, DollarSign, Percent, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { motion } from "framer-motion";

const KpiCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  changeLabel = "vs LY" 
}: { 
  title: string; 
  value: string; 
  change: number; 
  icon: React.ReactNode;
  changeLabel?: string;
}) => (
  <Card className="relative overflow-hidden glass-card border border-slate-200/50 dark:border-slate-800/50 shadow-sm rounded-xl">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
          {title}
        </span>
        <div className="flex items-center gap-2.5">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </h3>
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold",
            change >= 0 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-rose-600 dark:text-rose-400"
          )}>
            {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5 rotate-180" />}
            {change >= 0 ? "+" : ""}{change}%
            <span className="text-slate-400 dark:text-slate-500 font-medium ml-0.5">{changeLabel}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SAMPLE_WEEKS = Array.from({ length: 52 }, (_, i) => {
  const sampleData = [
    { lwClosing: 113964, wowPercent: -6.2, yoyPercent: 23.2, yoyLflPercent: 22.3, targetClosing: 665698, vsTgtPercent: 22.4, lwClosingUnits: 4888, wowUnitsPercent: -6.2, yoyUnitsPercent: 23.2, yoyLflUnitsPercent: 22.3, percentOfTotal: -1.2, storeAvail: 70, whAvail: 17 },
    { lwClosing: 54279, wowPercent: 8.5, yoyPercent: 29.4, yoyLflPercent: 28.7, targetClosing: 506985, vsTgtPercent: 28.7, lwClosingUnits: 2529, wowUnitsPercent: 8.5, yoyUnitsPercent: 29.4, yoyLflUnitsPercent: 28.7, percentOfTotal: -4.8, storeAvail: 2, whAvail: 84 },
    { lwClosing: 95489, wowPercent: 9.4, yoyPercent: 22.4, yoyLflPercent: 20.5, targetClosing: 3315581, vsTgtPercent: 23.3, lwClosingUnits: 349, wowUnitsPercent: 9.4, yoyUnitsPercent: 22.4, yoyLflUnitsPercent: 20.5, percentOfTotal: 9.9, storeAvail: 62, whAvail: 39 },
    { lwClosing: 850279, wowPercent: 6.1, yoyPercent: 22.9, yoyLflPercent: 26.9, targetClosing: 299818, vsTgtPercent: 27.7, lwClosingUnits: 1041, wowUnitsPercent: 6.1, yoyUnitsPercent: 22.9, yoyLflUnitsPercent: 26.9, percentOfTotal: -0.2, storeAvail: 71, whAvail: 3 },
    { lwClosing: 301805, wowPercent: -1.5, yoyPercent: 28.3, yoyLflPercent: 28.3, targetClosing: 4079758, vsTgtPercent: 27.5, lwClosingUnits: 3005, wowUnitsPercent: -1.5, yoyUnitsPercent: 28.3, yoyLflUnitsPercent: 28.3, percentOfTotal: 8.8, storeAvail: 87, whAvail: 88 },
    { lwClosing: 919536, wowPercent: 0.2, yoyPercent: 29.8, yoyLflPercent: 29.8, targetClosing: 1924943, vsTgtPercent: 28.1, lwClosingUnits: 4293, wowUnitsPercent: 0.2, yoyUnitsPercent: 29.8, yoyLflUnitsPercent: 29.8, percentOfTotal: 1.8, storeAvail: 68, whAvail: 99 },
    { lwClosing: 988382, wowPercent: -7.7, yoyPercent: 24.3, yoyLflPercent: 20.6, targetClosing: 6900331, vsTgtPercent: 20.1, lwClosingUnits: 4338, wowUnitsPercent: -7.7, yoyUnitsPercent: 24.3, yoyLflUnitsPercent: 20.6, percentOfTotal: -3.4, storeAvail: 25, whAvail: 7 },
    { lwClosing: 504413, wowPercent: -7.8, yoyPercent: 28.2, yoyLflPercent: 20.7, targetClosing: 3585158, vsTgtPercent: 28.8, lwClosingUnits: 2279, wowUnitsPercent: -7.8, yoyUnitsPercent: 28.2, yoyLflUnitsPercent: 20.7, percentOfTotal: 8.9, storeAvail: 21, whAvail: 79 },
  ];
  
  const data = i < 8 ? sampleData[i] : {
    lwClosing: Math.floor(Math.random() * 800000 + 50000),
    wowPercent: Math.random() * 20 - 10,
    yoyPercent: Math.random() * 30 - 5,
    yoyLflPercent: Math.random() * 25 - 5,
    targetClosing: Math.floor(Math.random() * 800000 + 50000),
    vsTgtPercent: Math.random() * 15 - 7,
    lwClosingUnits: Math.floor(Math.random() * 8000 + 1000),
    wowUnitsPercent: Math.random() * 20 - 10,
    yoyUnitsPercent: Math.random() * 30 - 5,
    yoyLflUnitsPercent: Math.random() * 25 - 5,
    percentOfTotal: Math.random() * 10 + 5,
    storeAvail: Math.floor(Math.random() * 100),
    whAvail: Math.floor(Math.random() * 100),
  };
  
  return {
    label: `Week ${i + 1}`,
    ...data
  };
});

const SAMPLE_PERIODS = Array.from({ length: 13 }, (_, i) => ({
  label: `Period ${i + 1}`,
  lwClosing: Math.floor(Math.random() * 800000 + 50000),
  wowPercent: Math.random() * 20 - 10,
  yoyPercent: Math.random() * 30 - 5,
  yoyLflPercent: Math.random() * 25 - 5,
  targetClosing: Math.floor(Math.random() * 800000 + 50000),
  vsTgtPercent: Math.random() * 15 - 7,
  lwClosingUnits: Math.floor(Math.random() * 8000 + 1000),
  wowUnitsPercent: Math.random() * 20 - 10,
  yoyUnitsPercent: Math.random() * 30 - 5,
  yoyLflUnitsPercent: Math.random() * 25 - 5,
  percentOfTotal: Math.random() * 10 + 5,
  storeAvail: Math.floor(Math.random() * 100),
  whAvail: Math.floor(Math.random() * 100),
}));

const PRODUCT_CATEGORIES = ["Books", "Stationery", "Gifts", "Media", "Electronics", "Home & Garden", "Sports", "Art Supplies", "Toys", "Jewelry"];
const PRODUCT_SUBCATEGORIES: Record<string, string[]> = {
  "Books": ["Fiction", "Non-Fiction", "Educational", "Reference", "Biography", "Children", "Comic", "Poetry", "Business", "Science"],
  "Stationery": ["Writing", "Office Supplies", "Notebooks", "Pads", "Envelopes", "Folders", "Labels", "Markers", "Pencils", "Erasers"],
  "Gifts": ["Decorative", "Seasonal", "Premium", "Cards", "Wrapping", "Frames", "Keychains", "Photo", "Mugs", "Candles"],
  "Media": ["DVD", "Vinyl", "Blu-ray", "CD", "Digital", "Gaming", "Software", "Audiobooks", "Podcasts", "Streaming"],
  "Electronics": ["Chargers", "Cables", "Adapters", "Headphones", "Speakers", "Power Banks", "Screen Protectors", "Cases", "Cables", "Accessories"],
  "Home & Garden": ["Kitchen", "Bedroom", "Bathroom", "Living Room", "Garden Tools", "Plants", "Decorations", "Lighting", "Storage", "Rugs"],
  "Sports": ["Outdoor", "Indoor", "Fitness", "Cycling", "Running", "Water Sports", "Winter Sports", "Equipment", "Apparel", "Shoes"],
  "Art Supplies": ["Paints", "Brushes", "Canvas", "Sketchbooks", "Pencils", "Markers", "Clay", "Sculpting", "Frames", "Easels"],
  "Toys": ["Action Figures", "Dolls", "Building Sets", "Puzzles", "Board Games", "Plush", "Educational", "Electronic", "Outdoor", "Collectibles"],
  "Jewelry": ["Necklaces", "Bracelets", "Earrings", "Rings", "Watches", "Brooches", "Anklets", "Charms", "Pendants", "Sets"],
};
const PRODUCT_MERCH_AREAS = ["Main Floor", "Section A", "Section B", "Display", "Premium Corner", "Outlet", "Back Wall", "Center Island", "Entrance", "Window"];
const PRODUCT_PLANNING_GROUPS = ["Group 1", "Group 2", "Group 3", "Group 4", "Group 5", "Group 6", "Group 7", "Group 8", "Group 9", "Group 10"];

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

const generateProductRow = () => ({
  lwClosing: Math.floor(Math.random() * 800000 + 50000),
  wowPercent: Math.random() * 20 - 10,
  yoyPercent: Math.random() * 30 - 5,
  yoyLflPercent: Math.random() * 25 - 5,
  targetClosing: Math.floor(Math.random() * 800000 + 50000),
  vsTgtPercent: Math.random() * 15 - 7,
  lwClosingUnits: Math.floor(Math.random() * 8000 + 1000),
  wowUnitsPercent: Math.random() * 20 - 10,
  yoyUnitsPercent: Math.random() * 30 - 5,
  yoyLflUnitsPercent: Math.random() * 25 - 5,
  percentOfTotal: Math.random() * 10 + 5,
  storeAvail: Math.floor(Math.random() * 100),
  whAvail: Math.floor(Math.random() * 100),
});

const MetricCell = ({ 
  value, 
  type, 
}: { 
  value: number; 
  type: "currency" | "percent" | "percentChange" | "number";
}) => {
  const formatValue = () => {
    if (type === "currency") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
      return `$${value.toLocaleString()}`
    }
    if (type === "number") {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return value.toLocaleString()
    }
    if (type === "percent" || type === "percentChange") {
      return `${value >= 0 && type === "percentChange" ? "+" : ""}${value.toFixed(1)}%`
    }
    return value
  }

  const getColor = () => {
    if (type !== "percentChange") return "text-slate-700 dark:text-slate-300"
    if (value > 2) return "text-emerald-600 dark:text-emerald-400 font-bold"
    if (value > 0) return "text-emerald-500/80 dark:text-emerald-400/70 font-semibold"
    if (value < -2) return "text-rose-600 dark:text-rose-400 font-bold"
    if (value < 0) return "text-rose-500/80 dark:text-rose-400/70 font-semibold"
    return "text-slate-500 dark:text-slate-400"
  }

  return (
    <div className="flex items-center justify-center gap-1 text-[11px]">
      <span className={cn("font-medium tabular-nums text-center w-full", getColor())}>
        {formatValue()}
      </span>
    </div>
  )
}

const AvailabilityCell = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value >= 70) return "text-emerald-600 dark:text-emerald-400"
    if (value >= 40) return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }
  
  return (
    <div className="flex items-center justify-center">
      <span className={cn("text-[11px] font-medium tabular-nums", getColor())}>
        {value}%
      </span>
    </div>
  )
}

export default function ClosingStock() {
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
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const [drillLevel, setDrillLevel] = useState<"category" | "subcategory" | "merchArea" | "planningGroup">("category");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("Books");

  const filterDataByTab = (data: any[]) => {
    if (selectedTab === "all") return data;
    const itemsPerTab = Math.ceil(data.length / 3);
    if (selectedTab === "keyline") return data.slice(0, itemsPerTab);
    return data.slice(itemsPerTab * 2);
  };
  
  const [storeDrillLevel, setStoreDrillLevel] = useState<"format" | "store">("format");
  const [selectedFormat, setSelectedFormat] = useState<string>("Legacy");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const sortData = (data: any[]) => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
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

  const currentTableData = sortData(filterDataByTab(tableView === "weeks" ? SAMPLE_WEEKS : SAMPLE_PERIODS));

  const getProductViewData = () => {
    if (drillLevel === "category") {
      return PRODUCT_CATEGORIES.map(cat => ({
        label: cat,
        ...generateProductRow()
      }));
    } else if (drillLevel === "subcategory") {
      return (PRODUCT_SUBCATEGORIES[selectedProductCategory] || []).map(subcat => ({
        label: subcat,
        ...generateProductRow()
      }));
    } else if (drillLevel === "merchArea") {
      return PRODUCT_MERCH_AREAS.map(area => ({
        label: area,
        ...generateProductRow()
      }));
    } else {
      return PRODUCT_PLANNING_GROUPS.map(group => ({
        label: group,
        ...generateProductRow()
      }));
    }
  };

  const productViewData = sortData(filterDataByTab(getProductViewData()));
  
  const drillLevelLabels: Record<string, string> = {
    category: "Category",
    subcategory: "Subcategory",
    merchArea: "Merch Area",
    planningGroup: "Planning Group"
  };

  const handleProductDrill = (label: string) => {
    if (drillLevel === "category") {
      setSelectedProductCategory(label);
      setDrillLevel("subcategory");
    } else if (drillLevel === "subcategory") {
      setDrillLevel("merchArea");
    } else if (drillLevel === "merchArea") {
      setDrillLevel("planningGroup");
    }
  };

  const handleProductDrillBack = () => {
    if (drillLevel === "subcategory") {
      setDrillLevel("category");
    } else if (drillLevel === "merchArea") {
      setDrillLevel("subcategory");
    } else if (drillLevel === "planningGroup") {
      setDrillLevel("merchArea");
    }
  };

  const getStoreViewData = () => {
    if (storeDrillLevel === "format") {
      return STORE_FORMATS.map(format => ({
        label: format,
        ...generateProductRow()
      }));
    } else {
      const stores = STORES_BY_FORMAT[selectedFormat] || [];
      return stores.map(store => ({
        label: store,
        ...generateProductRow()
      }));
    }
  };

  const storeViewData = sortData(filterDataByTab(getStoreViewData()));

  const storeDrillLevelLabels: Record<string, string> = {
    format: "Format",
    store: "Store"
  };

  const handleStoreDrill = (label: string) => {
    if (storeDrillLevel === "format") {
      setSelectedFormat(label);
      setStoreDrillLevel("store");
    }
  };

  const handleStoreDrillBack = () => {
    if (storeDrillLevel === "store") {
      setStoreDrillLevel("format");
    }
  };

  const displayData = viewMode === "time" ? currentTableData : viewMode === "product" ? productViewData : storeViewData;
  const canDrill = (viewMode === "product" && drillLevel !== "planningGroup") || (viewMode === "store" && storeDrillLevel === "format");
  const hasDrilled = (viewMode === "product" && drillLevel !== "category") || (viewMode === "store" && storeDrillLevel !== "format");

  const baseData = tableView === "weeks" ? SAMPLE_WEEKS : SAMPLE_PERIODS;
  const tabs = [
    { id: "all", label: "All", count: baseData.length, color: "default" as const },
    { id: "keyline", label: "Keyline", count: Math.ceil(baseData.length / 3), color: "blue" as const },
    { id: "discontinued", label: "Discontinued", count: baseData.length - Math.ceil(baseData.length / 3) * 2, color: "rose" as const },
  ];

  const TableHeader = ({ children, sortable, sortKey, className, group }: any) => (
    <th 
      onClick={() => sortable && handleSort(sortKey)}
      className={cn(
        "px-2 py-2 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-slate-700",
        sortable && "cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors",
        group === "closing" && "bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
        group === "units" && "bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
        group === "avail" && "bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
        className
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {children}
        {sortable && getSortIcon(sortKey)}
      </div>
    </th>
  )

  if (isFocused) {
    return (
      <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">Closing Stock Trend</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsFocused(false)}>
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <ScrollArea className="w-full h-full">
            <div className="min-w-[1600px]">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th colSpan={1} className="bg-slate-50 dark:bg-slate-900"></th>
                    <th colSpan={6} className="bg-blue-50/60 dark:bg-blue-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 border-r border-slate-200 dark:border-slate-700">Closing Stock ($)</th>
                    <th colSpan={5} className="bg-emerald-50/60 dark:bg-emerald-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-700">Closing Stock (Units)</th>
                    <th colSpan={2} className="bg-amber-50/60 dark:bg-amber-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Availability</th>
                  </tr>
                  <tr>
                    <TableHeader sortable sortKey="label" className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-w-[80px]">
                      {tableView === "weeks" ? "Week" : "Period"}
                    </TableHeader>
                    <TableHeader sortable sortKey="lwClosing" group="closing">LW $</TableHeader>
                    <TableHeader sortable sortKey="wowPercent" group="closing">WoW</TableHeader>
                    <TableHeader sortable sortKey="yoyPercent" group="closing">YoY</TableHeader>
                    <TableHeader sortable sortKey="yoyLflPercent" group="closing">YoY LFL</TableHeader>
                    <TableHeader sortable sortKey="targetClosing" group="closing">Target $</TableHeader>
                    <TableHeader sortable sortKey="vsTgtPercent" group="closing">vs Tgt</TableHeader>
                    <TableHeader sortable sortKey="lwClosingUnits" group="units">LW Units</TableHeader>
                    <TableHeader sortable sortKey="wowUnitsPercent" group="units">WoW</TableHeader>
                    <TableHeader sortable sortKey="yoyUnitsPercent" group="units">YoY</TableHeader>
                    <TableHeader sortable sortKey="yoyLflUnitsPercent" group="units">YoY LFL</TableHeader>
                    <TableHeader sortable sortKey="percentOfTotal" group="units">% Total</TableHeader>
                    <TableHeader sortable sortKey="storeAvail" group="avail">Store</TableHeader>
                    <TableHeader sortable sortKey="whAvail" group="avail">WH</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayData.map((row: any, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.01 }}
                      className={cn(
                        "h-9 transition-colors",
                        hoveredRow === idx && "bg-slate-50 dark:bg-slate-800/50"
                      )}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 px-2 py-1.5 font-medium text-slate-700 dark:text-slate-300 text-center">{row.label}</td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.lwClosing} type="currency" /></td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.wowPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.yoyPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.yoyLflPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.targetClosing} type="currency" /></td>
                      <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10 border-r border-slate-200 dark:border-slate-700"><MetricCell value={row.vsTgtPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.lwClosingUnits} type="number" /></td>
                      <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.wowUnitsPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.yoyUnitsPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.yoyLflUnitsPercent} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10 border-r border-slate-200 dark:border-slate-700"><MetricCell value={row.percentOfTotal} type="percentChange" /></td>
                      <td className="px-2 py-1.5 text-center bg-amber-50/20 dark:bg-amber-950/10"><AvailabilityCell value={row.storeAvail} /></td>
                      <td className="px-2 py-1.5 text-center bg-amber-50/20 dark:bg-amber-950/10"><AvailabilityCell value={row.whAvail} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <KpiCard
            title="YTD Stock"
            value="$177,267.6"
            change={4.6}
            icon={<DollarSign size={18} />}
          />
          <KpiCard
            title="Stock Turn %"
            value="57.2%"
            change={0.8}
            icon={<Percent size={18} />}
          />
          <KpiCard
            title="Growth"
            value="6.8%"
            change={1.3}
            changeLabel="vs prior"
            icon={<BarChart3 size={18} />}
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
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    Closing Stock Trend
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Inventory</span>
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

          <CardContent className="p-0">
            <div className="h-[540px] flex flex-col">
              {hasDrilled && (
                <div className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={viewMode === "product" ? handleProductDrillBack : handleStoreDrillBack}
                    className="h-8 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to {viewMode === "product" ? 
                      (drillLevel === "subcategory" ? "Categories" : 
                       drillLevel === "merchArea" ? "Subcategories" : "Merch Areas") :
                      "Formats"}
                  </Button>
                </div>
              )}
              
              <ScrollArea className="flex-1 w-full">
                <div className="min-w-full">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th colSpan={1} className="bg-slate-50 dark:bg-slate-900"></th>
                        <th colSpan={6} className="bg-blue-50/60 dark:bg-blue-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 border-r border-slate-200 dark:border-slate-700">Closing Stock ($)</th>
                        <th colSpan={5} className="bg-emerald-50/60 dark:bg-emerald-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-700">Closing Stock (Units)</th>
                        <th colSpan={2} className="bg-amber-50/60 dark:bg-amber-950/30 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Availability</th>
                      </tr>
                      <tr>
                        <TableHeader sortable sortKey="label" className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-w-[100px]">
                          {viewMode === "time" ? (tableView === "weeks" ? "Week" : "Period") : 
                           viewMode === "product" ? drillLevelLabels[drillLevel] :
                           storeDrillLevelLabels[storeDrillLevel]}
                        </TableHeader>
                        <TableHeader sortable sortKey="lwClosing" group="closing">LW $</TableHeader>
                        <TableHeader sortable sortKey="wowPercent" group="closing">WoW</TableHeader>
                        <TableHeader sortable sortKey="yoyPercent" group="closing">YoY</TableHeader>
                        <TableHeader sortable sortKey="yoyLflPercent" group="closing">YoY LFL</TableHeader>
                        <TableHeader sortable sortKey="targetClosing" group="closing">Target $</TableHeader>
                        <TableHeader sortable sortKey="vsTgtPercent" group="closing">vs Tgt</TableHeader>
                        <TableHeader sortable sortKey="lwClosingUnits" group="units">LW Units</TableHeader>
                        <TableHeader sortable sortKey="wowUnitsPercent" group="units">WoW</TableHeader>
                        <TableHeader sortable sortKey="yoyUnitsPercent" group="units">YoY</TableHeader>
                        <TableHeader sortable sortKey="yoyLflUnitsPercent" group="units">YoY LFL</TableHeader>
                        <TableHeader sortable sortKey="percentOfTotal" group="units">% Total</TableHeader>
                        <TableHeader sortable sortKey="storeAvail" group="avail">Store</TableHeader>
                        <TableHeader sortable sortKey="whAvail" group="avail">WH</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayData.slice(0, 15).map((row: any, idx) => (
                        <motion.tr 
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          className={cn(
                            "h-9 transition-colors",
                            hoveredRow === idx && "bg-slate-50 dark:bg-slate-800/50",
                            canDrill && "cursor-pointer"
                          )}
                          onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => canDrill && (viewMode === "product" ? handleProductDrill(row.label) : handleStoreDrill(row.label))}
                        >
                          <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 px-2 py-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2 justify-center">
                              <span className="truncate max-w-[120px]">{row.label}</span>
                              {canDrill && <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.lwClosing} type="currency" /></td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.wowPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.yoyPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.yoyLflPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10"><MetricCell value={row.targetClosing} type="currency" /></td>
                          <td className="px-2 py-1.5 text-center bg-blue-50/20 dark:bg-blue-950/10 border-r border-slate-200 dark:border-slate-700"><MetricCell value={row.vsTgtPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.lwClosingUnits} type="number" /></td>
                          <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.wowUnitsPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.yoyUnitsPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10"><MetricCell value={row.yoyLflUnitsPercent} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10 border-r border-slate-200 dark:border-slate-700"><MetricCell value={row.percentOfTotal} type="percentChange" /></td>
                          <td className="px-2 py-1.5 text-center bg-amber-50/20 dark:bg-amber-950/10"><AvailabilityCell value={row.storeAvail} /></td>
                          <td className="px-2 py-1.5 text-center bg-amber-50/20 dark:bg-amber-950/10"><AvailabilityCell value={row.whAvail} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
