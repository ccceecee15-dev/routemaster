import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockService } from "@/services/mockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolbarFilter, ToggleGroup } from "@/components/filters/FilterCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Download, Package, Store, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { SegmentTabs } from "@/components/ui/segment-tabs";
import { motion } from "framer-motion";

const PRODUCT_CATEGORIES = ["Books", "Stationery", "Gifts", "Media", "Electronics", "Home & Garden", "Sports", "Art Supplies", "Toys", "Jewelry", "Clothing", "Footwear", "Beauty & Personal Care", "Food & Beverages", "Office Equipment", "Furniture", "Lighting", "Outdoor Gear", "Pet Supplies", "Health & Wellness"];
const PRODUCT_SUBCATEGORIES: Record<string, string[]> = {
  "Books": ["Fiction", "Non-Fiction", "Educational", "Reference", "Biography", "Children", "Comic", "Poetry", "Business", "Science"],
  "Stationery": ["Writing", "Office Supplies", "Notebooks", "Pads", "Envelopes", "Folders", "Labels", "Markers", "Pencils", "Erasers"],
  "Gifts": ["Decorative", "Seasonal", "Premium", "Cards", "Wrapping", "Frames", "Keychains", "Photo", "Mugs", "Candles"],
  "Media": ["DVD", "Vinyl", "Blu-ray", "CD", "Digital", "Gaming", "Software", "Audiobooks", "Podcasts", "Streaming"],
  "Electronics": ["Chargers", "Cables", "Adapters", "Headphones", "Speakers", "Power Banks", "Screen Protectors", "Cases", "Accessories", "Hubs"],
  "Home & Garden": ["Kitchen", "Bedroom", "Bathroom", "Living Room", "Garden Tools", "Plants", "Decorations", "Lighting", "Storage", "Rugs"],
  "Sports": ["Outdoor", "Indoor", "Fitness", "Cycling", "Running", "Water Sports", "Winter Sports", "Equipment", "Apparel", "Shoes"],
  "Art Supplies": ["Paints", "Brushes", "Canvas", "Sketchbooks", "Pencils", "Markers", "Clay", "Sculpting", "Frames", "Easels"],
  "Toys": ["Action Figures", "Dolls", "Building Sets", "Puzzles", "Board Games", "Plush", "Educational", "Electronic", "Outdoor", "Collectibles"],
  "Jewelry": ["Necklaces", "Bracelets", "Earrings", "Rings", "Watches", "Brooches", "Anklets", "Charms", "Pendants", "Sets"],
  "Clothing": ["Shirts", "Pants", "Dresses", "Jackets", "Sweaters", "Activewear", "Undergarments", "Accessories", "Seasonal", "Designer"],
  "Footwear": ["Casual", "Athletic", "Formal", "Sandals", "Boots", "Heels", "Slippers", "Work Boots", "Winter", "Summer"],
  "Beauty & Personal Care": ["Skincare", "Makeup", "Hair Care", "Fragrance", "Bath & Body", "Oral Care", "Shaving", "Deodorant", "Nail Care", "Tools"],
  "Food & Beverages": ["Snacks", "Beverages", "Coffee & Tea", "Baking Supplies", "Condiments", "Dairy", "Frozen", "Organic", "International", "Health Foods"],
  "Office Equipment": ["Computers", "Printers", "Keyboards", "Mice", "Monitors", "Desk Accessories", "Cables", "Storage", "Desks", "Chairs"],
  "Furniture": ["Sofas", "Tables", "Chairs", "Beds", "Cabinets", "Shelves", "Bookcases", "Outdoor", "Dining", "Office"],
  "Lighting": ["Lamps", "Bulbs", "Fixtures", "LED", "Outdoor", "Indoor", "Decorative", "Task", "Ambient", "Smart"],
  "Outdoor Gear": ["Tents", "Sleeping Bags", "Backpacks", "Climbing", "Hiking", "Camping", "Survival", "Biking", "Water Sports", "Snow Sports"],
  "Pet Supplies": ["Dog Food", "Cat Food", "Toys", "Beds", "Grooming", "Treats", "Accessories", "Cages", "Training", "Health"],
  "Health & Wellness": ["Vitamins", "Supplements", "Fitness", "Yoga", "Meditation", "First Aid", "Pain Relief", "Sleep Aids", "Immunity", "Wellness"],
};
const PRODUCT_MERCH_AREAS = ["Main Floor", "Section A", "Section B", "Display", "Premium Corner", "Outlet", "Back Wall", "Center Island", "Entrance", "Window"];
const PRODUCT_PLANNING_GROUPS = ["Group 1", "Group 2", "Group 3", "Group 4", "Group 5", "Group 6", "Group 7", "Group 8", "Group 9", "Group 10"];
const PRODUCT_SUB_PLANNING_GROUPS = ["Sub Group A", "Sub Group B", "Sub Group C", "Sub Group D", "Sub Group E", "Sub Group F", "Sub Group G", "Sub Group H"];
const PRODUCT_STYLES = ["Classic", "Modern", "Vintage", "Contemporary", "Minimalist", "Traditional", "Rustic", "Industrial", "Bohemian", "Scandinavian"];

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

interface AvailabilityRow {
  id: string;
  label: string;
  category: string;
  subCategory: string;
  merchArea: string;
  planningGroup: string;
  
  stockBase: number;
  stockClosing: number;
  stockOverStock: number;
  stockUnderStock: number;
  
  avail_06_12_2025: number;
  avail_05_12_2025: number;
  avail_04_12_2025: number;
  avail_03_12_2025: number;
  avail_02_12_2025: number;
  avail_01_12_2025: number;
  avail_30_11_2025: number;
  avail_W10: number;
  avail_W9: number;
  
  openIntransit: number;
  openNotPicked: number;
  
  isKeyLine: boolean;
  isDiscontinued: boolean;
}


const AvailabilityCell = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value >= 85) return "text-emerald-600 dark:text-emerald-400"
    if (value >= 70) return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }
  
  return (
    <div className="flex items-center justify-center">
      <span className={cn("text-[11px] font-bold tabular-nums", getColor())}>
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

const MetricCell = ({ value, type }: { value: number; type: "number" | "currency" }) => {
  const formatValue = () => {
    if (type === "currency") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
      return `$${value.toLocaleString()}`
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }
  
  return (
    <div className="flex items-center justify-center">
      <span className="text-[11px] font-medium tabular-nums text-slate-700 dark:text-slate-300">
        {formatValue()}
      </span>
    </div>
  )
}

export default function Availability() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [selectedFilterFormat, setSelectedFilterFormat] = useState<string>("all");
  const [selectedFilterStore, setSelectedFilterStore] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<"all" | "keyline" | "discontinued">("all");
  const [viewMode, setViewMode] = useState<"product" | "store">("product");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const [drillLevel, setDrillLevel] = useState<"category" | "subcategory" | "merchArea" | "planningGroup">("category");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("Books");
  
  const [storeDrillLevel, setStoreDrillLevel] = useState<"format" | "store">("format");
  const [selectedStoreFormat, setSelectedStoreFormat] = useState<string>("Legacy");
  
  const generateAvailabilityRow = (rowIndex?: number) => {
    const rand = rowIndex !== undefined ? (rowIndex % 5 === 0 ? 1 : 0) : Math.random();
    const rand2 = rowIndex !== undefined ? (rowIndex % 7 === 0 ? 1 : 0) : Math.random();
    return {
      stockBase: Math.floor(1000 + Math.random() * 9000),
      stockClosing: Math.floor(800 + Math.random() * 8000),
      stockOverStock: Math.floor(100 + Math.random() * 500),
      stockUnderStock: Math.floor(50 + Math.random() * 300),
      
      avail_06_12_2025: 72 + Math.random() * 28,
      avail_05_12_2025: 70 + Math.random() * 30,
      avail_04_12_2025: 68 + Math.random() * 30,
      avail_03_12_2025: 72 + Math.random() * 25,
      avail_02_12_2025: 65 + Math.random() * 30,
      avail_01_12_2025: 75 + Math.random() * 20,
      avail_30_11_2025: 70 + Math.random() * 28,
      avail_W10: 71 + Math.random() * 25,
      avail_W9: 69 + Math.random() * 28,
      
      openIntransit: Math.floor(50 + Math.random() * 200),
      openNotPicked: Math.floor(20 + Math.random() * 100),
      
      isKeyLine: rand > 0.8,
      isDiscontinued: rand2 > 0.85,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      await mockService.getDashboardData({});
      setLoading(false);
    };
    loadData();
  }, []);

  const drillLevelLabels: Record<string, string> = {
    category: "Category",
    subcategory: "Subcategory",
    merchArea: "Merch Area",
    planningGroup: "Planning Group"
  };

  const storeDrillLevelLabels: Record<string, string> = {
    format: "Format",
    store: "Store"
  };

  const getDrillDownData = () => {
    if (drillLevel === "category") {
      return PRODUCT_CATEGORIES.map((category, idx) => ({
        id: `category-${category}`,
        label: category,
        category: category,
        subCategory: "",
        merchArea: "",
        planningGroup: "",
        ...generateAvailabilityRow(idx)
      }));
    } else if (drillLevel === "subcategory") {
      const subcats = PRODUCT_SUBCATEGORIES[selectedProductCategory] || [];
      return subcats.map((subcat, idx) => ({
        id: `subcat-${subcat}`,
        label: subcat,
        category: selectedProductCategory,
        subCategory: subcat,
        merchArea: "",
        planningGroup: "",
        ...generateAvailabilityRow(idx)
      }));
    } else if (drillLevel === "merchArea") {
      return PRODUCT_MERCH_AREAS.map((area, idx) => ({
        id: `merch-${area}`,
        label: area,
        category: selectedProductCategory,
        subCategory: "",
        merchArea: area,
        planningGroup: "",
        ...generateAvailabilityRow(idx)
      }));
    } else {
      return PRODUCT_PLANNING_GROUPS.map((group, idx) => ({
        id: `pg-${group}`,
        label: group,
        category: selectedProductCategory,
        subCategory: "",
        merchArea: "",
        planningGroup: group,
        ...generateAvailabilityRow(idx)
      }));
    }
  };

  const getStoreDrillDownData = () => {
    if (storeDrillLevel === "format") {
      return STORE_FORMATS.map((format, idx) => ({
        id: `format-${format}`,
        label: format,
        category: "",
        subCategory: "",
        merchArea: "",
        planningGroup: "",
        ...generateAvailabilityRow(idx)
      }));
    } else {
      const stores = STORES_BY_FORMAT[selectedStoreFormat] || [];
      return stores.map((store, idx) => ({
        id: `store-${store}`,
        label: store,
        category: "",
        subCategory: "",
        merchArea: "",
        planningGroup: "",
        ...generateAvailabilityRow(idx)
      }));
    }
  };

  const displayData = viewMode === "product" ? getDrillDownData() : getStoreDrillDownData();
  
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

  const filteredDisplayData = displayData
    .filter(row => {
      if (selectedTab === "keyline" && !row.isKeyLine) return false;
      if (selectedTab === "discontinued" && !row.isDiscontinued) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  const currentDrillLevelLabel = viewMode === "product" 
    ? drillLevelLabels[drillLevel] 
    : storeDrillLevelLabels[storeDrillLevel];

  const handleDrill = (label: string) => {
    if (drillLevel === "category") {
      setSelectedProductCategory(label);
      setDrillLevel("subcategory");
    } else if (drillLevel === "subcategory") {
      setDrillLevel("merchArea");
    } else if (drillLevel === "merchArea") {
      setDrillLevel("planningGroup");
    }
  };

  const handleDrillBack = () => {
    if (drillLevel === "planningGroup") {
      setDrillLevel("merchArea");
    } else if (drillLevel === "merchArea") {
      setDrillLevel("subcategory");
    } else if (drillLevel === "subcategory") {
      setDrillLevel("category");
    }
  };

  const handleStoreDrill = (label: string) => {
    if (storeDrillLevel === "format") {
      setSelectedStoreFormat(label);
      setStoreDrillLevel("store");
    } else if (storeDrillLevel === "store") {
      setSelectedFilterFormat(selectedStoreFormat);
      setSelectedFilterStore(label);
      setViewMode("product");
      setStoreDrillLevel("format");
      toast({
        title: "View Changed",
        description: `Switched to Product view for ${label} (${selectedStoreFormat})`,
      });
    }
  };

  const handleStoreDrillBack = () => {
    if (storeDrillLevel === "store") {
      setStoreDrillLevel("format");
    }
  };

  const canDrill = (viewMode === "product" && drillLevel !== "planningGroup") || (viewMode === "store" && storeDrillLevel === "format");
  const hasDrilled = (viewMode === "product" && drillLevel !== "category") || (viewMode === "store" && storeDrillLevel !== "format");

  const tabs = [
    { id: "all", label: "All", count: displayData.length, color: "default" as const },
    { id: "keyline", label: "Keyline", count: displayData.filter(r => r.isKeyLine).length, color: "blue" as const },
    { id: "discontinued", label: "Discontinued", count: displayData.filter(r => r.isDiscontinued).length, color: "rose" as const },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading Availability Data...</span>
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
        group === "stock" && "bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
        group === "daily" && "bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
        group === "weekly" && "bg-violet-50/40 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300",
        group === "open" && "bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
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
            setSelectedSubCategory("all");
            setSelectedMerchArea("all");
            setSelectedPlanningGroup("all");
            setSelectedSubPlanningGroup("all");
            setSelectedStyle("all");
            setSelectedFilterFormat("all");
            setSelectedFilterStore("all");
          }}
          fields={viewMode === "product" ? [
            {
              id: "format",
              label: "Format",
              value: selectedFilterFormat,
              onChange: setSelectedFilterFormat,
              options: [
                { value: "all", label: "All" },
                ...STORE_FORMATS.map(f => ({ value: f, label: f }))
              ]
            },
            {
              id: "store",
              label: "Store",
              value: selectedFilterStore,
              onChange: setSelectedFilterStore,
              options: [
                { value: "all", label: "All" },
                ...(selectedFilterFormat !== "all" 
                  ? (STORES_BY_FORMAT[selectedFilterFormat] || []).map(s => ({ value: s, label: s }))
                  : Object.values(STORES_BY_FORMAT).flat().slice(0, 20).map(s => ({ value: s, label: s })))
              ]
            },
          ] : [
            {
              id: "category",
              label: "Category",
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: [
                { value: "all", label: "All" },
                ...PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))
              ]
            },
            {
              id: "subcategory",
              label: "Subcat",
              value: selectedSubCategory,
              onChange: setSelectedSubCategory,
              options: [
                { value: "all", label: "All" },
                ...(selectedCategory !== "all" ? (PRODUCT_SUBCATEGORIES[selectedCategory] || []).map(s => ({ value: s, label: s })) : [])
              ]
            },
          ]}
        />


        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    Availability
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Inventory</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0.5 h-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">Year 2026</Badge>
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0.5 h-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">Period 3</Badge>
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0.5 h-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">Week 2</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="flex items-center">
                  <ToggleGroup
                    value={viewMode}
                    showLabel
                    onChange={(v) => {
                      setViewMode(v as "product" | "store");
                      // Reset drill levels when switching modes
                      setDrillLevel("category");
                      setStoreDrillLevel("format");
                    }}
                    options={[
                      { value: "product", label: "Product", icon: <Package className="h-3 w-3" /> },
                      { value: "store", label: "Store", icon: <Store className="h-3 w-3" /> },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-1 ml-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <SegmentTabs
                  tabs={tabs}
                  activeTab={selectedTab}
                  onChange={(tab) => setSelectedTab(tab as any)}
                />
              </div>
              
              {hasDrilled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={viewMode === "product" ? handleDrillBack : handleStoreDrillBack}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <ScrollArea className="w-full">
              <div className="min-w-full">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th colSpan={1} className="bg-slate-50/50 dark:bg-slate-900/50 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700"></th>
                      <th colSpan={4} className="bg-blue-50/30 dark:bg-blue-950/20 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-700/70 dark:text-blue-300/70 border-r border-slate-200 dark:border-slate-700">Inventory Status</th>
                      <th colSpan={7} className="bg-emerald-50/30 dark:bg-emerald-950/20 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-300/70 border-r border-slate-200 dark:border-slate-700">Daily Service Levels</th>
                      <th colSpan={2} className="bg-violet-50/30 dark:bg-violet-950/20 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-violet-700/70 dark:text-violet-300/70 border-r border-slate-200 dark:border-slate-700">Weekly Trends</th>
                      <th colSpan={2} className="bg-amber-50/30 dark:bg-amber-950/20 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700/70 dark:text-amber-300/70">Allocation Queue</th>
                    </tr>
                    <tr>
                      <TableHeader sortable sortKey="label" className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-w-[120px] !justify-start !text-left px-4">
                        {currentDrillLevelLabel}
                      </TableHeader>
                      <TableHeader sortable sortKey="stockBase" group="stock">Base</TableHeader>
                      <TableHeader sortable sortKey="stockClosing" group="stock">Closing</TableHeader>
                      <TableHeader sortable sortKey="stockOverStock" group="stock">Over</TableHeader>
                      <TableHeader sortable sortKey="stockUnderStock" group="stock">Under</TableHeader>
                      <TableHeader sortable sortKey="avail_06_12_2025" group="daily">06/12</TableHeader>
                      <TableHeader sortable sortKey="avail_05_12_2025" group="daily">05/12</TableHeader>
                      <TableHeader sortable sortKey="avail_04_12_2025" group="daily">04/12</TableHeader>
                      <TableHeader sortable sortKey="avail_03_12_2025" group="daily">03/12</TableHeader>
                      <TableHeader sortable sortKey="avail_02_12_2025" group="daily">02/12</TableHeader>
                      <TableHeader sortable sortKey="avail_01_12_2025" group="daily">01/12</TableHeader>
                      <TableHeader sortable sortKey="avail_30_11_2025" group="daily">30/11</TableHeader>
                      <TableHeader sortable sortKey="avail_W10" group="weekly">W10</TableHeader>
                      <TableHeader sortable sortKey="avail_W9" group="weekly">W9</TableHeader>
                      <TableHeader sortable sortKey="openIntransit" group="open">In Transit</TableHeader>
                      <TableHeader sortable sortKey="openNotPicked" group="open">Not Picked</TableHeader>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDisplayData.map((row, idx) => (
                      <motion.tr 
                        key={row.id}
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
                        onClick={() => canDrill && (viewMode === "product" ? handleDrill(row.label) : handleStoreDrill(row.label))}
                      >
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 px-2 py-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[150px]">{row.label}</span>
                            {canDrill && <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10">
                          <MetricCell value={row.stockBase} type="number" />
                        </td>
                        <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10">
                          <MetricCell value={row.stockClosing} type="number" />
                        </td>
                        <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10">
                          <MetricCell value={row.stockOverStock} type="number" />
                        </td>
                        <td className="px-2 py-1.5 text-right bg-blue-50/20 dark:bg-blue-950/10 border-r border-slate-200 dark:border-slate-700">
                          <MetricCell value={row.stockUnderStock} type="number" />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_06_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_05_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_04_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_03_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_02_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                          <AvailabilityCell value={row.avail_01_12_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-emerald-50/20 dark:bg-emerald-950/10 border-r border-slate-200 dark:border-slate-700">
                          <AvailabilityCell value={row.avail_30_11_2025} />
                        </td>
                        <td className="px-2 py-1.5 bg-violet-50/20 dark:bg-violet-950/10">
                          <AvailabilityCell value={row.avail_W10} />
                        </td>
                        <td className="px-2 py-1.5 bg-violet-50/20 dark:bg-violet-950/10 border-r border-slate-200 dark:border-slate-700">
                          <AvailabilityCell value={row.avail_W9} />
                        </td>
                        <td className="px-2 py-1.5 text-right bg-amber-50/20 dark:bg-amber-950/10">
                          <MetricCell value={row.openIntransit} type="number" />
                        </td>
                        <td className="px-2 py-1.5 text-right bg-amber-50/20 dark:bg-amber-950/10">
                          <MetricCell value={row.openNotPicked} type="number" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
