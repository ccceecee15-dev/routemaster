import { useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Download, Calendar, Grid3x3, Grid2x2, Store, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data matching the reference image
const SAMPLE_WEEKS = [
  { label: "Week 1", lwClosing: 113964, wowPercent: -6.2, yoyPercent: 23.2, yoyLflPercent: 22.3, targetClosing: 665698, vsTgtPercent: 22.4, lwClosingUnits: 4888, wowUnitsPercent: -6.2, yoyUnitsPercent: 23.2, yoyLflUnitsPercent: 22.3, percentOfTotal: -1.2, storeAvail: 70, whAvail: 17 },
  { label: "Week 2", lwClosing: 54279, wowPercent: 8.5, yoyPercent: 29.4, yoyLflPercent: 28.7, targetClosing: 506985, vsTgtPercent: 28.7, lwClosingUnits: 2529, wowUnitsPercent: 8.5, yoyUnitsPercent: 29.4, yoyLflUnitsPercent: 28.7, percentOfTotal: -4.8, storeAvail: 2, whAvail: 84 },
  { label: "Week 3", lwClosing: 95489, wowPercent: 9.4, yoyPercent: 22.4, yoyLflPercent: 20.5, targetClosing: 3315581, vsTgtPercent: 23.3, lwClosingUnits: 349, wowUnitsPercent: 9.4, yoyUnitsPercent: 22.4, yoyLflUnitsPercent: 20.5, percentOfTotal: 9.9, storeAvail: 62, whAvail: 39 },
  { label: "Week 4", lwClosing: 850279, wowPercent: 6.1, yoyPercent: 22.9, yoyLflPercent: 26.9, targetClosing: 299818, vsTgtPercent: 27.7, lwClosingUnits: 1041, wowUnitsPercent: 6.1, yoyUnitsPercent: 22.9, yoyLflUnitsPercent: 26.9, percentOfTotal: -0.2, storeAvail: 71, whAvail: 3 },
  { label: "Week 5", lwClosing: 301805, wowPercent: -1.5, yoyPercent: 28.3, yoyLflPercent: 28.3, targetClosing: 4079758, vsTgtPercent: 27.5, lwClosingUnits: 3005, wowUnitsPercent: -1.5, yoyUnitsPercent: 28.3, yoyLflUnitsPercent: 28.3, percentOfTotal: 8.8, storeAvail: 87, whAvail: 88 },
  { label: "Week 6", lwClosing: 919536, wowPercent: 0.2, yoyPercent: 29.8, yoyLflPercent: 29.8, targetClosing: 1924943, vsTgtPercent: 28.1, lwClosingUnits: 4293, wowUnitsPercent: 0.2, yoyUnitsPercent: 29.8, yoyLflUnitsPercent: 29.8, percentOfTotal: 1.8, storeAvail: 68, whAvail: 99 },
  { label: "Week 7", lwClosing: 988382, wowPercent: -7.7, yoyPercent: 24.3, yoyLflPercent: 20.6, targetClosing: 6900331, vsTgtPercent: 20.1, lwClosingUnits: 4338, wowUnitsPercent: -7.7, yoyUnitsPercent: 24.3, yoyLflUnitsPercent: 20.6, percentOfTotal: -3.4, storeAvail: 25, whAvail: 7 },
  { label: "Week 8", lwClosing: 504413, wowPercent: -7.8, yoyPercent: 28.2, yoyLflPercent: 20.7, targetClosing: 3585158, vsTgtPercent: 28.8, lwClosingUnits: 2279, wowUnitsPercent: -7.8, yoyUnitsPercent: 28.2, yoyLflUnitsPercent: 20.7, percentOfTotal: 8.9, storeAvail: 21, whAvail: 79 },
];

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

const generateStoreRow = () => ({
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

export default function ClosingStockDashboard() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  
  const [tableView, setTableView] = useState<"weeks" | "periods" | "stores">("weeks");
  const [drillLevel, setDrillLevel] = useState<"format" | "store">("format");
  const [selectedFormat, setSelectedFormat] = useState<string>("Legacy");
  const [selectedTab, setSelectedTab] = useState<"all" | "keyline" | "discontinued">("all");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const getStoreViewData = () => {
    if (drillLevel === "format") {
      return STORE_FORMATS.map(format => ({
        label: format,
        ...generateStoreRow()
      }));
    } else {
      const stores = STORES_BY_FORMAT[selectedFormat] || [];
      return stores.map(store => ({
        label: store,
        ...generateStoreRow()
      }));
    }
  };

  const currentTableData = tableView === "weeks" ? SAMPLE_WEEKS : tableView === "periods" ? SAMPLE_PERIODS : getStoreViewData();

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
              <Table className="text-xs">
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow className="bg-muted/30 border-b-2 border-b-muted h-12">
                    <TableHead className="sticky left-0 bg-background z-20 border-r w-[100px] font-bold text-center">{tableView === "weeks" ? "Week" : tableView === "periods" ? "Period" : tableView === "stores" && drillLevel === "format" ? "Format" : tableView === "stores" && drillLevel === "store" ? "Store" : "Week"}</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[110px]">LW Closing $</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">WoW %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">YoY %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[110px]">YoY LFL %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[120px]">Target Closing $</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[120px]">vs Tgt Closing %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[130px]">LW Closing (units)</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">WoW %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">YoY %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[110px]">YoY LFL %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">% of Total</TableHead>
                    <TableHead className="text-center border-r bg-amber-50/50 font-bold text-amber-900 w-[110px]">Store Avail %</TableHead>
                    <TableHead className="text-center bg-amber-50/50 font-bold text-amber-900 w-[110px]">WH Avail %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTableData.map((row: any, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="sticky left-0 bg-background border-r font-medium z-10 text-center text-xs">{row.label}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatCurrency(row.lwClosing)}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.wowPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.yoyPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.yoyLflPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatCurrency(row.targetClosing)}</TableCell>
                      <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.vsTgtPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-green-50/5 text-xs">{row.lwClosingUnits.toLocaleString()}</TableCell>
                      <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.wowUnitsPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.yoyUnitsPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.yoyLflUnitsPercent)}</TableCell>
                      <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.percentOfTotal)}</TableCell>
                      <TableCell className="text-center border-r bg-amber-50/5 text-xs">{row.storeAvail}%</TableCell>
                      <TableCell className="text-center bg-amber-50/5 text-xs">{row.whAvail}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        
        {/* Top KPI Strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">YTD Stock</div>
            <div className="text-lg font-bold mt-1">$177,267.6</div>
            <div className="text-xs mt-1 text-green-600">+4.6% vs LY</div>
          </div>
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">Stock Turn %</div>
            <div className="text-lg font-bold mt-1">57.2%</div>
            <div className="text-xs mt-1 text-green-600">+0.8% vs LY</div>
          </div>
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">Growth</div>
            <div className="text-lg font-bold mt-1">6.8%</div>
            <div className="text-xs mt-1 text-green-600">+1.3pp vs prior</div>
          </div>
        </div>

        {/* Product Filters Section */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Product Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="gifts">Gifts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subcategory</label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Merch Area</label>
              <Select value={selectedMerchArea} onValueChange={setSelectedMerchArea}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="main">Main Floor</SelectItem>
                  <SelectItem value="section-a">Section A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Planning Group</label>
              <Select value={selectedPlanningGroup} onValueChange={setSelectedPlanningGroup}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="group-1">Group 1</SelectItem>
                  <SelectItem value="group-2">Group 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sub Planning Group</label>
              <Select value={selectedSubPlanningGroup} onValueChange={setSelectedSubPlanningGroup}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub Groups</SelectItem>
                  <SelectItem value="sub-1">Sub Group 1</SelectItem>
                  <SelectItem value="sub-2">Sub Group 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <Card className="border shadow-md">
          <CardHeader className="pb-3 border-b bg-muted/5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <CardTitle>Closing Stock Trend</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {tableView === "weeks" ? "Weekly breakdown (52 weeks)" : "Period view with drilldown (13 periods)"}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-md border">
                   <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
                   <div className="h-4 w-px bg-border mx-1"></div>
                   <Select value={selectedYear} onValueChange={setSelectedYear}>
                     <SelectTrigger className="h-7 w-[80px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue placeholder="Year" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="2025">2025</SelectItem>
                       <SelectItem value="2024">2024</SelectItem>
                     </SelectContent>
                   </Select>
                </div>

                <div className="flex items-center bg-muted p-1 rounded-lg border">
                  <button
                    onClick={() => setTableView("weeks")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      tableView === "weeks" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid3x3 className="h-3.5 w-3.5" />
                    Weeks
                  </button>
                  <button
                    onClick={() => setTableView("periods")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      tableView === "periods" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid2x2 className="h-3.5 w-3.5" />
                    Periods
                  </button>
                  <button
                    onClick={() => {
                      setTableView("stores");
                      setDrillLevel("format");
                      setSelectedFormat("Legacy");
                    }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      tableView === "stores" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Store className="h-3.5 w-3.5" />
                    Stores
                  </button>
                </div>

                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setIsFocused(true)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {tableView === "stores" && drillLevel !== "format" && (
              <div className="px-4 py-3 border-b bg-muted/20 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setDrillLevel("format")}
                >
                  ← Back
                </Button>
                <span className="text-xs text-muted-foreground">
                  Viewing: Store
                  {selectedFormat && (
                    <span className="ml-2 font-medium text-foreground">&gt; {selectedFormat}</span>
                  )}
                </span>
              </div>
            )}
            <div className="border-b bg-muted/30 px-4">
              <div className="flex gap-1 pt-3">
                {(['all', 'keyline', 'discontinued'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize",
                      selectedTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="w-full h-[600px]">
              <div className="min-w-[1600px]">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow className="bg-muted/30 border-b-2 border-b-muted h-12">
                      <TableHead className="sticky left-0 bg-background z-20 border-r w-[100px] font-bold text-center">{tableView === "weeks" ? "Week" : tableView === "periods" ? "Period" : tableView === "stores" && drillLevel === "format" ? "Format" : tableView === "stores" && drillLevel === "store" ? "Store" : "Week"}</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[110px]">LW Closing $</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">WoW %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">YoY %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[110px]">YoY LFL %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[120px]">Target Closing $</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[120px]">vs Tgt Closing %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[130px]">LW Closing (units)</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">WoW %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">YoY %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[110px]">YoY LFL %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[90px]">% of Total</TableHead>
                      <TableHead className="text-center border-r bg-amber-50/50 font-bold text-amber-900 w-[110px]">Store Avail %</TableHead>
                      <TableHead className="text-center bg-amber-50/50 font-bold text-amber-900 w-[110px]">WH Avail %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTableData.map((row: any, idx) => (
                      <TableRow 
                        key={idx} 
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                          if (tableView === "stores" && drillLevel === "format") {
                            setSelectedFormat(row.label);
                            setDrillLevel("store");
                          }
                        }}
                      >
                        <TableCell className="sticky left-0 bg-background border-r font-medium z-10 text-center text-xs">
                          {tableView === "stores" && drillLevel === "format" ? (
                            <div className="text-primary hover:underline">{row.label} →</div>
                          ) : (
                            row.label
                          )}
                        </TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatCurrency(row.lwClosing)}</TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.wowPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.yoyPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.yoyLflPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatCurrency(row.targetClosing)}</TableCell>
                        <TableCell className="text-center border-r bg-blue-50/5 text-xs">{formatPercent(row.vsTgtPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-green-50/5 text-xs">{row.lwClosingUnits.toLocaleString()}</TableCell>
                        <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.wowUnitsPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.yoyUnitsPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.yoyLflUnitsPercent)}</TableCell>
                        <TableCell className="text-center border-r bg-green-50/5 text-xs">{formatPercent(row.percentOfTotal)}</TableCell>
                        <TableCell className="text-center border-r bg-amber-50/5 text-xs">{row.storeAvail}%</TableCell>
                        <TableCell className="text-center bg-amber-50/5 text-xs">{row.whAvail}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
