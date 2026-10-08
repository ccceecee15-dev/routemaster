import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronDown, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useParams } from "wouter";

const STATUS_OPTIONS = ["OK", "At Risk", "Critical", "Low Stock"];

const generateDCData = () => {
  const dcNames = ["DC North", "DC South", "DC East", "DC West", "DC Central"];
  return dcNames.map((dc, i) => ({
    id: i + 1,
    dc,
    openingInventory: Math.floor(Math.random() * 5000) + 1000,
    inbound: Math.floor(Math.random() * 2000) + 200,
    outbound: Math.floor(Math.random() * 1500) + 300,
    closingInventory: Math.floor(Math.random() * 4000) + 800,
    weeksCover: (Math.random() * 8 + 2).toFixed(1),
    status: STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)]
  }));
};

const generateStoreData = () => {
  const storeNames = Array.from({ length: 25 }, (_, i) => `Store ${100 + i}`);
  const dcNames = ["DC North", "DC South", "DC East", "DC West", "DC Central"];
  return storeNames.map((store, i) => {
    const replenishLT = Math.floor(Math.random() * 3) + 1;
    const isStore100 = store === "Store 100";
    
    // Store 100 manual consistency overrides
    const store100Data = [
      { f: 45, cs: 50, wc: 1.1, rp: 45, al: 45 }, // W1: Stable start
      { f: 48, cs: 40, wc: 0.8, rp: 55, al: 38 }, // W2: Forecast > Alloc, Stock drops, WC < 1 (Critical signal)
      { f: 46, cs: 35, wc: 0.7, rp: 60, al: 41 }, // W3: Continued stress, System suggests 60
      { f: 44, cs: 85, wc: 1.9, rp: 45, al: 94 }, // W4: Alloc 94 overrides Suggestion 60 to recover stock
      { f: 45, cs: 90, wc: 2.0, rp: 45, al: 50 }, // W5: Stock stabilizes
      { f: 47, cs: 85, wc: 1.8, rp: 45, al: 42 }, // W6: Slight dip
      { f: 46, cs: 80, wc: 1.7, rp: 45, al: 41 }, // W7
      { f: 45, cs: 75, wc: 1.6, rp: 50, al: 40 }, // W8
      { f: 48, cs: 110, wc: 2.3, rp: 45, al: 83 }, // W9: Another recovery
      { f: 46, cs: 105, wc: 2.2, rp: 45, al: 41 }, // W10
      { f: 44, cs: 100, wc: 2.2, rp: 45, al: 39 }, // W11
      { f: 45, cs: 95, wc: 2.1, rp: 45, al: 40 }, // W12
    ];

    return {
      id: i + 1,
      store,
      dc: dcNames[Math.floor(Math.random() * dcNames.length)],
      presentation: Math.floor(Math.random() * 10) + 2,
      replenishLT,
      currentStock: isStore100 ? 55 : Math.floor(Math.random() * 100) + 10,
      weeksCover: isStore100 ? "1.1" : (Math.random() * 6 + 1).toFixed(1),
      status: isStore100 ? "Critical" : STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)],
      weeklyData: Array.from({ length: 12 }, (_, w) => {
        const weekNum = w + 1;
        const weekLabel = `2026W${weekNum.toString().padStart(2, '0')}`;
        
        if (isStore100 && store100Data[w]) {
          const d = store100Data[w];
          return {
            week: weekLabel,
            weekNum: weekNum,
            forecast: d.f,
            closingStock: d.cs,
            weeksCover: d.wc,
            replenishPlan: d.rp,
            alloc: d.al,
            frozen: w < replenishLT
          };
        }

        const forecast = Math.floor(Math.random() * 50) + 10;
        const closingStock = Math.floor(Math.random() * 80) + 20;
        return {
          week: weekLabel,
          weekNum: weekNum,
          forecast,
          closingStock,
          weeksCover: Math.ceil(closingStock / Math.max(forecast, 1)),
          replenishPlan: Math.floor(forecast * 1.1),
          alloc: Math.floor(Math.random() * 20) + 2,
          frozen: w < replenishLT
        };
      })
    };
  });
};

export default function SkuDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const skuId = params.skuId || "SKU10000";
  const [dcData] = useState(generateDCData);
  const [storeData] = useState(generateStoreData);
  const [expandedStores, setExpandedStores] = useState<Set<number>>(new Set());

  const toggleStoreExpand = (id: number) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedStores(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "OK": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "Low Stock": "bg-orange-100 text-orange-700 border-orange-200"
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] font-medium", styles[status])}>
        {status}
      </Badge>
    );
  };

  const TableHeader = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <th className={cn("px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-center", className)}>
      {children}
    </th>
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/sip/allocation")}
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{skuId}</h1>
              <p className="text-sm text-slate-500">Product Description for {skuId} | Vendor A</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dcs" className="w-full">
          <TabsList className="grid w-full max-w-[300px] grid-cols-2">
            <TabsTrigger value="dcs">DCs</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
          </TabsList>

          <TabsContent value="dcs" className="mt-4">
            <Card className="glass-card">
              <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-sm font-semibold">Distribution Centers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <TableHeader className="w-[120px]">DC</TableHeader>
                        <TableHeader className="w-[120px]">Opening Inventory</TableHeader>
                        <TableHeader className="w-[100px]">Inbound</TableHeader>
                        <TableHeader className="w-[100px]">Outbound</TableHeader>
                        <TableHeader className="w-[120px]">Closing Inventory</TableHeader>
                        <TableHeader className="w-[100px]">Weeks Cover</TableHeader>
                        <TableHeader className="w-[90px]">Status</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dcData.map((row) => (
                        <tr key={row.id} className="h-10 transition-colors hover:bg-slate-50/50">
                          <td className="px-2 py-2 text-[11px] font-medium border border-slate-100 text-center text-slate-700">{row.dc}</td>
                          <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.openingInventory.toLocaleString()}</td>
                          <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-emerald-600">+{row.inbound.toLocaleString()}</td>
                          <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-red-600">-{row.outbound.toLocaleString()}</td>
                          <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.closingInventory.toLocaleString()}</td>
                          <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.weeksCover}</td>
                          <td className="px-2 py-2 border border-slate-100 text-center">{getStatusBadge(row.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stores" className="mt-4">
            <Card className="glass-card">
              <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-sm font-semibold">Store Inventory</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full max-h-[600px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <TableHeader className="w-[40px]"></TableHeader>
                        <TableHeader className="w-[100px]">Store</TableHeader>
                        <TableHeader className="w-[100px]">DC</TableHeader>
                        <TableHeader className="w-[90px]">Presentation</TableHeader>
                        <TableHeader className="w-[90px]">Replenish LT</TableHeader>
                        <TableHeader className="w-[100px]">Current Stock</TableHeader>
                        <TableHeader className="w-[90px]">Weeks Cover</TableHeader>
                        <TableHeader className="w-[90px]">Status</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {storeData.map((row) => (
                        <React.Fragment key={row.id}>
                          <tr className="h-10 transition-colors hover:bg-slate-50/50">
                            <td className="px-2 py-2 border border-slate-100 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => toggleStoreExpand(row.id)}
                              >
                                {expandedStores.has(row.id) ? (
                                  <ChevronDown className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-slate-400" />
                                )}
                              </Button>
                            </td>
                            <td className="px-2 py-2 text-[11px] font-medium border border-slate-100 text-center text-slate-700">{row.store}</td>
                            <td className="px-2 py-2 text-[11px] border border-slate-100 text-center text-slate-600">{row.dc}</td>
                            <td className="px-2 py-2 border border-slate-100 text-center">
                              <Input 
                                defaultValue={row.presentation} 
                                className="h-6 w-12 text-[10px] text-center mx-auto"
                              />
                            </td>
                            <td className="px-2 py-2 border border-slate-100 text-center">
                              <Input 
                                defaultValue={row.replenishLT} 
                                className="h-6 w-12 text-[10px] text-center mx-auto"
                              />
                            </td>
                            <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.currentStock}</td>
                            <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.weeksCover}</td>
                            <td className="px-2 py-2 border border-slate-100 text-center">{getStatusBadge(row.status)}</td>
                          </tr>
                          {expandedStores.has(row.id) && (
                            <tr key={`${row.id}-expanded`}>
                              <td colSpan={8} className="p-0 bg-slate-50/30">
                                <div className="p-4 pl-12 space-y-3">
                                  <div className="flex items-center gap-6 py-2 px-3 bg-white rounded border border-slate-200">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">Store</span>
                                      <span className="text-[11px] font-semibold text-slate-700">{row.store}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">DC</span>
                                      <span className="text-[11px] text-slate-600">{row.dc}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">Presentation</span>
                                      <Input 
                                        defaultValue={row.presentation} 
                                        className="h-6 w-12 text-[10px] text-center"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">Replenish LT</span>
                                      <Input 
                                        defaultValue={row.replenishLT} 
                                        className="h-6 w-12 text-[10px] text-center"
                                      />
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto overflow-y-hidden">
                                    <table className="border-collapse w-full table-fixed">
                                      <thead>
                                        <tr>
                                          <th className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 text-left border border-slate-200 w-[80px]">Metric</th>
                                          {row.weeklyData.map((week, idx) => (
                                            <th 
                                              key={week.week} 
                                              className={cn(
                                                "px-1 py-1 text-[9px] font-bold uppercase tracking-wider text-center border border-slate-200 min-w-[65px]",
                                                week.frozen ? "bg-slate-100 text-slate-500" : "bg-slate-50 text-slate-500"
                                              )}
                                            >
                                              <div className="flex flex-col gap-0.5">
                                                <span>{week.week}</span>
                                                {idx === 0 && (
                                                  <span className="text-[8px] bg-blue-600 text-white px-1 rounded-sm w-fit mx-auto">CURRENT</span>
                                                )}
                                              </div>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td className="px-2 py-1 text-[9px] font-medium text-slate-500 bg-white border border-slate-200">Forecast</td>
                                          {row.weeklyData.map((week) => (
                                            <td 
                                              key={`forecast-${week.week}`}
                                              className={cn(
                                                "px-1 py-1 text-[10px] text-center tabular-nums border border-slate-200",
                                                week.frozen ? "bg-slate-50/50 text-slate-400" : "bg-white text-slate-500"
                                              )}
                                            >
                                              {week.forecast}
                                            </td>
                                          ))}
                                        </tr>
                                        <tr>
                                          <td className="px-2 py-1 text-[9px] font-medium text-slate-400/80 bg-white border border-slate-200">Closing Stock</td>
                                          {row.weeklyData.map((week) => (
                                            <td 
                                              key={`closing-${week.week}`}
                                              className={cn(
                                                "px-1 py-1 text-[10px] text-center tabular-nums border border-slate-200",
                                                week.frozen ? "bg-slate-50/50 text-slate-400/60" : "bg-white text-slate-400/80"
                                              )}
                                            >
                                              {week.closingStock}
                                            </td>
                                          ))}
                                        </tr>
                                        <tr className="border-b-2 border-slate-100/50">
                                          <td className="px-2 py-1 text-[9px] font-medium text-slate-500 bg-white border border-slate-200">Weeks Cover</td>
                                          {row.weeklyData.map((week) => {
                                            const cover = week.weeksCover;
                                            let textColor = "text-slate-500";
                                            if (cover < 1.0) textColor = "text-red-600 font-medium";
                                            else if (cover < 2.0) textColor = "text-amber-600 font-medium";

                                            return (
                                              <td 
                                                key={`cover-${week.week}`}
                                                className={cn(
                                                  "px-1 py-1 text-[10px] text-center tabular-nums border border-slate-200",
                                                  week.frozen ? "bg-slate-50/50 text-slate-400" : "bg-white",
                                                  !week.frozen && textColor
                                                )}
                                              >
                                                {week.weeksCover}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                        <tr>
                                          <td className="px-2 py-1 text-[9px] font-medium text-slate-600 bg-slate-50/50 border border-slate-200">Replenish Plan</td>
                                          {row.weeklyData.map((week) => (
                                            <td 
                                              key={`replenish-${week.week}`}
                                              className={cn(
                                                "px-1 py-1 text-[10px] text-center tabular-nums border border-slate-200",
                                                week.frozen ? "bg-slate-100/40 text-slate-400" : "bg-slate-50/30 text-slate-600 font-medium"
                                              )}
                                            >
                                              {week.replenishPlan}
                                            </td>
                                          ))}
                                        </tr>
                                        <tr className="bg-blue-50/30">
                                          <td className="px-2 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50/50 border border-blue-100">Alloc / DSD</td>
                                          {row.weeklyData.map((week) => (
                                            <td 
                                              key={`alloc-${week.week}`}
                                              className={cn(
                                                "px-1 py-1 text-center border transition-colors",
                                                week.frozen 
                                                  ? "bg-slate-100/50 border-slate-200" 
                                                  : "bg-blue-50/60 border-blue-100"
                                              )}
                                            >
                                              <Input 
                                                defaultValue={week.alloc} 
                                                disabled={week.frozen}
                                                className={cn(
                                                  "h-5 w-11 text-[10px] text-center mx-auto transition-all p-0",
                                                  week.frozen 
                                                    ? "bg-transparent border-transparent text-slate-600 font-medium shadow-none cursor-default" 
                                                    : "bg-white border-blue-200 focus:border-blue-400 shadow-sm"
                                                )}
                                              />
                                            </td>
                                          ))}
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
