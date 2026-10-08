import { useState } from "react";
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
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Product hierarchy data
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
const SUB_PLANNING_GROUPS = ["Sub-Group A", "Sub-Group B", "Sub-Group C", "Sub-Group D"];

// Store hierarchy for drill-down display
const STORE_LOCATIONS = Array.from({ length: 50 }, (_, i) => `Store ${String(i + 1).padStart(3, '0')}`);
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

export default function ClosingStockStores() {
  // Product filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  const [selectedStoreFormat, setSelectedStoreFormat] = useState<string>("all");

  // Drill-down state
  const [drillLevel, setDrillLevel] = useState<"format" | "store">("format");
  const [selectedFormat, setSelectedFormat] = useState<string>("Legacy");
  const [selectedTab, setSelectedTab] = useState<"all" | "keyline" | "discontinued">("all");
  const [isFocused, setIsFocused] = useState(false);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  // Get available subcategories for selected category
  const getAvailableSubcategories = () => {
    if (selectedCategory === "all") return [];
    return PRODUCT_SUBCATEGORIES[selectedCategory] || [];
  };

  // Generate store view data based on drill level and filters
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

  const storeViewData = getStoreViewData();

  const drillLevelLabels: Record<string, string> = {
    format: "Format",
    store: "Store"
  };

  // Handle drilling down - update both drill level and filter
  const handleStoreDrill = (label: string) => {
    if (drillLevel === "format") {
      setSelectedFormat(label);
      setDrillLevel("store");
    }
  };

  const handleStoreDrillBack = () => {
    if (drillLevel === "store") {
      setDrillLevel("format");
    }
  };

  const renderFilterControls = () => (
    <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Product & Store Filters</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Category Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subcategory</label>
          <Select 
            value={selectedSubcategory} 
            onValueChange={setSelectedSubcategory}
            disabled={selectedCategory === "all"}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {getAvailableSubcategories().map(subcat => (
                <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Merch Area Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Merch Area</label>
          <Select value={selectedMerchArea} onValueChange={setSelectedMerchArea}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {PRODUCT_MERCH_AREAS.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Planning Group Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Planning Group</label>
          <Select value={selectedPlanningGroup} onValueChange={setSelectedPlanningGroup}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {PRODUCT_PLANNING_GROUPS.map(group => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Planning Group Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sub Planning Group</label>
          <Select value={selectedSubPlanningGroup} onValueChange={setSelectedSubPlanningGroup}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub Groups</SelectItem>
              {SUB_PLANNING_GROUPS.map(subgroup => (
                <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (isFocused) {
    return (
      <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">Closing Stock by Store</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsFocused(false)}>
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <ScrollArea className="w-full h-full">
            <div className="min-w-[1200px]">
              <Table className="text-xs">
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow className="bg-muted/30 border-b-2 border-b-muted h-12">
                    <TableHead className="sticky left-0 bg-background z-20 border-r w-[75px] font-bold text-center">{drillLevelLabels[drillLevel]}</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[85px]">LW Closing $</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[70px]">WoW %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[70px]">YoY %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[85px]">YoY LFL %</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">Target Closing $</TableHead>
                    <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">vs Tgt Closing %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[100px]">LW Closing (units)</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">WoW %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">YoY %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[85px]">YoY LFL %</TableHead>
                    <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">% of Total</TableHead>
                    <TableHead className="text-center border-r bg-amber-50/50 font-bold text-amber-900 w-[85px]">Store Avail %</TableHead>
                    <TableHead className="text-center bg-amber-50/50 font-bold text-amber-900 w-[85px]">WH Avail %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeViewData.map((row: any, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 cursor-pointer">
                      <TableCell className="sticky left-0 bg-background border-r font-medium z-10 text-center text-xs">
                        {drillLevel !== "store" ? (
                          <div className="text-primary hover:underline" onClick={() => handleStoreDrill(row.label)}>{row.label} →</div>
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

        {/* Store Filters Card */}
        {renderFilterControls()}

        {/* Main Table Container */}
        <Card className="border shadow-md">
          <CardHeader className="pb-3 border-b bg-muted/5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <CardTitle>Closing Stock by Store</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Hierarchical drill-down view by {drillLevelLabels[drillLevel].toLowerCase()}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-40">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Store Format</label>
                  <Select value={selectedStoreFormat} onValueChange={setSelectedStoreFormat}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      {STORE_FORMATS.map(format => (
                        <SelectItem key={format} value={format}>{format}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            {/* Store Tabs */}
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

            {/* Back Navigation */}
            {drillLevel !== "format" && (
              <div className="px-4 py-3 border-b bg-muted/20 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleStoreDrillBack}
                >
                  ← Back
                </Button>
                <span className="text-xs text-muted-foreground">
                  Viewing: {drillLevelLabels[drillLevel]}
                  {selectedFormat && (
                    <span className="ml-2 font-medium text-foreground">&gt; {selectedFormat}</span>
                  )}
                </span>
              </div>
            )}

            <ScrollArea className="w-full">
              <div className="min-w-[1200px]">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow className="bg-muted/30 border-b-2 border-b-muted h-12">
                      <TableHead className="sticky left-0 bg-background z-20 border-r w-[75px] font-bold text-center">{drillLevelLabels[drillLevel]}</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[85px]">LW Closing $</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[70px]">WoW %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[70px]">YoY %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[85px]">YoY LFL %</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">Target Closing $</TableHead>
                      <TableHead className="text-center border-r bg-blue-50/50 font-bold text-blue-900 w-[90px]">vs Tgt Closing %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[100px]">LW Closing (units)</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">WoW %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">YoY %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[85px]">YoY LFL %</TableHead>
                      <TableHead className="text-center border-r bg-green-50/50 font-bold text-green-900 w-[70px]">% of Total</TableHead>
                      <TableHead className="text-center border-r bg-amber-50/50 font-bold text-amber-900 w-[85px]">Store Avail %</TableHead>
                      <TableHead className="text-center bg-amber-50/50 font-bold text-amber-900 w-[85px]">WH Avail %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeViewData.map((row: any, idx) => (
                      <TableRow 
                        key={idx} 
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => drillLevel !== "store" && handleStoreDrill(row.label)}
                      >
                        <TableCell className="sticky left-0 bg-background border-r font-medium z-10 text-center text-xs">
                          {drillLevel !== "store" ? (
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
