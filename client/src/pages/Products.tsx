import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockService } from "@/services/mockService";
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
import { Download, Calendar, ChevronLeft, ChevronRight, Store, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Products() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  const [showSalesColumns, setShowSalesColumns] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"all" | "keyline" | "discontinued">("all");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1");
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  const [selectedStoreFormat, setSelectedStoreFormat] = useState<string>("all");
  const [isFocused, setIsFocused] = useState(false);
  const [aggregateByProduct, setAggregateByProduct] = useState<string>("category");
  const [aggregateByStore, setAggregateByStore] = useState<string>("format");
  const [aggregateByPeriod, setAggregateByPeriod] = useState<string>("week");
  
  useEffect(() => {
    const loadData = async () => {
      const res = await mockService.getProductsData({});
      setData(res);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96 text-muted-foreground animate-pulse">
          Loading Product Data...
        </div>
      </MainLayout>
    );
  }

  const { kpis, productTableData } = data;
  const formatCurrency = (val: number) => `$${(val).toLocaleString()}`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const filterDataByTab = (data: any[]) => {
    if (selectedTab === "all") return data;
    const itemsPerTab = Math.ceil(data.length / 3);
    if (selectedTab === "keyline") {
      return data.slice(0, itemsPerTab);
    } else {
      return data.slice(itemsPerTab, itemsPerTab * 2);
    }
  };

  const currentTableData = filterDataByTab(productTableData);

  if (isFocused) {
    return (
      <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">Product Performance</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsFocused(false)}>
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Product Drilldowns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="books">Books</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subcategory</label>
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Subcategories</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Merch Area</label>
                    <Select value={selectedMerchArea} onValueChange={setSelectedMerchArea}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Areas</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Planning Group</label>
                    <Select value={selectedPlanningGroup} onValueChange={setSelectedPlanningGroup}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Groups</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sub Planning Group</label>
                    <Select value={selectedSubPlanningGroup} onValueChange={setSelectedSubPlanningGroup}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Sub Groups</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Card className="border shadow-md">
                <CardContent className="p-0">
                  <div className="border-b bg-muted/30 px-4">
                    <div className="flex gap-1 pt-3">
                      {(['all', 'keyline', 'discontinued'] as const).map((tab) => (
                        <button key={tab} onClick={() => setSelectedTab(tab)} className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize", selectedTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{tab}</button>
                      ))}
                    </div>
                  </div>
                  <ScrollArea className="w-full">
                    <div className={showSalesColumns ? "min-w-[2400px]" : "min-w-full"}>
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                          <TableRow className="bg-muted/30 border-b-2 border-b-muted">
                            <TableHead className="sticky left-0 bg-background z-20 border-r w-[135px] font-bold text-black">Product</TableHead>
                            {showSalesColumns ? (<><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">LW Sales $</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">Sales Cont. %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">WoW %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PTD Sales $</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PTD vs LY %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PTD LFL %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PoP %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YoY %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YoY LFL %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YTD Sales $</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YTD vs LY %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YTD LFL %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">CP Sales $</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">vs CP %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PTD vs CP %</TableHead><TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r flex items-center justify-end gap-1 pr-2"><span>YTD vs CP %</span><button onClick={() => setShowSalesColumns(!showSalesColumns)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"><ChevronLeft className="h-4 w-4 text-blue-900 dark:text-blue-300" /></button></TableHead></>) : (<TableHead className="text-center bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r w-12"><button onClick={() => setShowSalesColumns(!showSalesColumns)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded mx-auto block"><ChevronRight className="h-4 w-4 text-blue-900 dark:text-blue-300" /></button></TableHead>)}
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">LW Margin $</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">Margin Cont. %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">% Margin</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">WoW %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PTD Margin $</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PTD vs LY %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PTD LFL %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PoP %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YoY %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YoY LFL %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YTD Margin $</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YTD vs LY %</TableHead>
                            <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YTD LFL %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{currentTableData.map((row: any) => (<TableRow key={row.id} className="hover:bg-muted/30"><TableCell className="sticky left-0 bg-background border-r font-medium z-10">{row.label}</TableCell>{showSalesColumns ? (<><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_actual)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_cont_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_wow_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_ptd)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ptd_ly_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ptd_lfl_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_pop_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_yoy_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_yoy_lfl_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_ytd)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ytd_ly_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ytd_lfl_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.cp_sales)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.vs_cp_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.ptd_vs_cp_percent)}</TableCell><TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.ytd_vs_cp_percent)}</TableCell></>) : (<TableCell className="border-r bg-blue-50/5 dark:bg-blue-950/20"></TableCell>)}<TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_lw)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_cont_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_wow_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_ptd)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ptd_ly_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ptd_lfl_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_pop_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_yoy_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_yoy_lfl_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_ytd)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ytd_ly_percent)}</TableCell><TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ytd_lfl_percent)}</TableCell></TableRow>))}</TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">YTD Sales</div>
            <div className="text-lg font-bold mt-1">${(kpis.ytdSales?.value || 0).toLocaleString()}</div>
            <div className={cn("text-xs mt-1", (kpis.ytdSales?.delta || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {(kpis.ytdSales?.delta || 0) > 0 ? '+' : ''}{(kpis.ytdSales?.delta || 0).toFixed(1)}% vs LY
            </div>
          </div>
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">YTD Margin %</div>
            <div className="text-lg font-bold mt-1">{kpis.ytdMargin?.value || 0}%</div>
            <div className={cn("text-xs mt-1", (kpis.ytdMargin?.delta || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {(kpis.ytdMargin?.delta || 0) > 0 ? '+' : ''}{(kpis.ytdMargin?.delta || 0).toFixed(1)}% vs LY
            </div>
          </div>
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-muted-foreground font-medium">YoY Growth</div>
            <div className="text-lg font-bold mt-1">{(kpis.yoyGrowth?.value || 0).toFixed(1)}%</div>
            <div className={cn("text-xs mt-1", (kpis.yoyGrowth?.delta || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {(kpis.yoyGrowth?.delta || 0) > 0 ? '+' : ''}{(kpis.yoyGrowth?.delta || 0).toFixed(1)}pp vs prior
            </div>
          </div>
        </div>

        {/* Product Drilldowns */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Product Filters</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" className="h-8">Apply Filters</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubcategory("all");
                    setSelectedMerchArea("all");
                    setSelectedPlanningGroup("all");
                    setSelectedSubPlanningGroup("all");
                    setAggregateByProduct("category");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Aggregate by Product</label>
                <Select value={aggregateByProduct} onValueChange={setAggregateByProduct}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border shadow-md">
          <CardHeader className="pb-3 border-b bg-muted/5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <CardTitle>Product Performance</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Product-level sales and margin metrics</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-md border">
                   <Store className="h-4 w-4 text-muted-foreground ml-1" />
                   <Select value={aggregateByStore} onValueChange={setAggregateByStore}>
                     <SelectTrigger className="h-7 w-[100px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue placeholder="Agg. Store" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="format">Format</SelectItem>
                       <SelectItem value="region">Region</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-md border">
                   <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
                   <Select value={selectedYear} onValueChange={setSelectedYear}>
                     <SelectTrigger className="h-7 w-[70px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="2025">2025</SelectItem>
                       <SelectItem value="2024">2024</SelectItem>
                     </SelectContent>
                   </Select>
                   <div className="h-4 w-px bg-border"></div>
                   <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                     <SelectTrigger className="h-7 w-[70px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {Array.from({ length: 13 }, (_, i) => (
                         <SelectItem key={i + 1} value={String(i + 1)}>
                           P{i + 1}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="h-4 w-px bg-border"></div>
                   <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                     <SelectTrigger className="h-7 w-[70px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {Array.from({ length: 4 }, (_, i) => (
                         <SelectItem key={i + 1} value={String(i + 1)}>
                           W{i + 1}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="h-4 w-px bg-border"></div>
                   <Select value={aggregateByPeriod} onValueChange={setAggregateByPeriod}>
                     <SelectTrigger className="h-7 w-[100px] border-0 bg-transparent focus:ring-0 text-xs">
                       <SelectValue placeholder="Agg. By" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="week">Week</SelectItem>
                       <SelectItem value="period">Period</SelectItem>
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
            {/* Tabs */}
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

            <ScrollArea className="w-full">
              <div className={showSalesColumns ? "min-w-[2400px]" : "min-w-full"}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow className="bg-muted/30 border-b-2 border-b-muted">
                      <TableHead className="sticky left-0 bg-background z-20 border-r w-[135px] font-bold text-black">
                        Product
                      </TableHead>

                      {showSalesColumns ? (
                        <>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">LW Sales $</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">Sales Cont. %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[90px]">Sales KL Cont. %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[90px]">Sales CL Cont. %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">WoW %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PTD Sales $</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[90px]">PTD vs LY %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[85px]">PTD LFL %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">PoP %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YoY %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[85px]">YoY LFL %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">YTD Sales $</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[90px]">YTD vs LY %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r min-w-[85px]">YTD LFL %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">CP Sales $</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r">vs CP %</TableHead>
                          <TableHead className="text-right bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r flex items-center justify-end gap-1 pr-2">
                            <span>PTD vs CP %</span>
                            <button onClick={() => setShowSalesColumns(!showSalesColumns)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors">
                              <ChevronLeft className="h-4 w-4 text-blue-900 dark:text-blue-300" />
                            </button>
                          </TableHead>
                        </>
                      ) : (
                        <TableHead className="text-center bg-blue-50/50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-r w-12">
                          <button onClick={() => setShowSalesColumns(!showSalesColumns)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded mx-auto block">
                            <ChevronRight className="h-4 w-4 text-blue-900 dark:text-blue-300" />
                          </button>
                        </TableHead>
                      )}

                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">LW Margin $</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">Margin Cont. %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[95px]">Margin KL Cont. %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[95px]">Margin CL Cont. %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">% Margin</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">WoW %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PTD Margin $</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[90px]">PTD vs LY %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[85px]">PTD LFL %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">PoP %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YoY %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[85px]">YoY LFL %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r">YTD Margin $</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[90px]">YTD vs LY %</TableHead>
                      <TableHead className="text-right bg-green-50/50 font-bold text-green-900 dark:bg-green-950 dark:text-green-300 border-r min-w-[85px]">YTD LFL %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTableData.map((row: any) => (
                      <TableRow key={row.id} className="hover:bg-muted/30">
                        <TableCell className="sticky left-0 bg-background border-r font-medium z-10">{row.label}</TableCell>
                        {showSalesColumns ? (
                          <>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_actual)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_cont_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_kl_cont || 0)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_cl_cont || 0)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_wow_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_ptd)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ptd_ly_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ptd_lfl_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_pop_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_yoy_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_yoy_lfl_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.sales_ytd)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ytd_ly_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.sales_ytd_lfl_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatCurrency(row.cp_sales)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.vs_cp_percent)}</TableCell>
                            <TableCell className="text-right border-r bg-blue-50/5 dark:bg-blue-950/20">{formatPercent(row.ptd_vs_cp_percent)}</TableCell>
                          </>
                        ) : (
                          <TableCell className="border-r bg-blue-50/5 dark:bg-blue-950/20"></TableCell>
                        )}
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_lw)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_cont_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_wow_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_ptd)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ptd_ly_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ptd_lfl_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_pop_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_yoy_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_yoy_lfl_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatCurrency(row.margin_ytd)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ytd_ly_percent)}</TableCell>
                        <TableCell className="text-right border-r bg-green-50/5 dark:bg-green-950/20">{formatPercent(row.margin_ytd_lfl_percent)}</TableCell>
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
