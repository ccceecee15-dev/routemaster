import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Layers, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const MERCH_AREAS = ["All", "Main Floor", "Section A", "Section B"];
const PLANNING_GROUPS = ["All", "Group A", "Group B", "Group C"];
const SUB_PLANNING_GROUPS = ["All", "Sub Group 1", "Sub Group 2", "Sub Group 3"];
const VENDORS = ["All", "Vendor A", "Vendor B", "Vendor C", "Vendor D"];

const PRODUCT_NAMES = [
  "Travel Neck Pillow", "Leather Journal A5", "Premium Ballpoint Pen Set", "Wireless Earbuds Case",
  "Passport Holder Premium", "Desktop Organizer Wood", "Charging Cable 3-Pack", "Novelty Mug Gift",
  "Pocket Calculator Solar", "Hand Sanitizer Travel", "Magnetic Bookmark Set", "USB Flash Drive 64GB",
  "Reading Glasses Case", "Compact Mirror LED", "Reusable Water Bottle", "Desk Lamp USB",
  "Fabric Notebook Cover", "Phone Stand Adjustable", "Card Wallet RFID", "Travel Adapter Universal",
  "Mechanical Pencil Set", "Screen Cleaner Kit", "Luggage Tag Set", "Tablet Sleeve 10in",
  "Fountain Pen Classic", "Cable Organizer Pouch", "Travel Sewing Kit", "Mini Stapler Set",
  "Desk Calendar 2026", "Sticky Notes Cube"
];

const generateMockData = () => {
  const vendorPatterns: Record<string, { safetyBase: number; forecastBase: number }> = {
    "Vendor A": { safetyBase: 2.0, forecastBase: 4500 },
    "Vendor B": { safetyBase: 2.5, forecastBase: 3200 },
    "Vendor C": { safetyBase: 1.5, forecastBase: 6800 },
    "Vendor D": { safetyBase: 2.0, forecastBase: 5100 }
  };

  return Array.from({ length: 30 }, (_, i) => {
    const vendor = VENDORS[Math.floor(i / 8) % 4 + 1];
    const pattern = vendorPatterns[vendor];
    
    const safetyStockWks = Math.ceil(pattern.safetyBase + (Math.random() * 0.8 - 0.4));
    const totalForecast = Math.floor(pattern.forecastBase + (Math.random() * 2000 - 1000));
    
    const statusRoll = Math.random();
    let status: string;
    let minWks: number;
    let riskStores: number;
    let projectedClosing: number;
    let allocDsd: number;

    if (statusRoll < 0.5) {
      status = "OK";
      minWks = parseFloat((safetyStockWks + 0.5 + Math.random() * 1.5).toFixed(1));
      riskStores = Math.floor(Math.random() * 4);
      projectedClosing = Math.floor(totalForecast * (0.35 + Math.random() * 0.25));
      allocDsd = Math.floor(totalForecast * (0.05 + Math.random() * 0.05));
    } else if (statusRoll < 0.8) {
      status = "At Risk";
      minWks = parseFloat((safetyStockWks - 0.3 + Math.random() * 0.6).toFixed(1));
      riskStores = Math.floor(4 + Math.random() * 5);
      projectedClosing = Math.floor(totalForecast * (0.12 + Math.random() * 0.10));
      allocDsd = Math.floor(totalForecast * (0.10 + Math.random() * 0.08));
    } else {
      status = "Critical";
      minWks = parseFloat((safetyStockWks - 0.8 - Math.random() * 0.5).toFixed(1));
      riskStores = Math.floor(9 + Math.random() * 12);
      projectedClosing = Math.floor(totalForecast * (0.02 + Math.random() * 0.06));
      allocDsd = Math.floor(totalForecast * (0.12 + Math.random() * 0.08));
    }

    minWks = Math.max(0.8, minWks);

    return {
      id: i + 1,
      skuId: `SKU${10000 + i}`,
      description: PRODUCT_NAMES[i],
      vendor,
      safetyStockWks,
      totalForecast,
      projectedClosing,
      allocDsd,
      minWks,
      riskStores,
      status
    };
  });
};

export default function AllocationView() {
  const [, setLocation] = useLocation();
  const [searchSku, setSearchSku] = useState("");
  const [merchArea, setMerchArea] = useState("all");
  const [planningGroup, setPlanningGroup] = useState("all");
  const [subPlanningGroup, setSubPlanningGroup] = useState("all");
  const [vendor, setVendor] = useState("all");
  const [data] = useState(generateMockData);

  const filteredData = data.filter(row => {
    if (searchSku && !row.skuId.toLowerCase().includes(searchSku.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "OK": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
      "Critical": "bg-red-100 text-red-700 border-red-200"
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
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search SKU..."
              value={searchSku}
              onChange={(e) => setSearchSku(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("all");
            setPlanningGroup("all");
            setSubPlanningGroup("all");
            setVendor("all");
          }}
          fields={[
            { id: "merch-area", label: "Merch Area", value: merchArea, onChange: setMerchArea, options: MERCH_AREAS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "planning-group", label: "Planning Group", value: planningGroup, onChange: setPlanningGroup, options: PLANNING_GROUPS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "sub-planning-group", label: "Sub Planning Group", value: subPlanningGroup, onChange: setSubPlanningGroup, options: SUB_PLANNING_GROUPS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "vendor", label: "Vendor", value: vendor, onChange: setVendor, options: VENDORS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
          ]}
        />

        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Allocation View</CardTitle>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">SKU-Level Inventory</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <TableHeader className="w-[100px]">SKU ID</TableHeader>
                    <TableHeader className="w-[180px]">Description</TableHeader>
                    <TableHeader className="w-[100px]">Vendor</TableHeader>
                    <TableHeader className="w-[100px]">Safety Stock (wks)</TableHeader>
                    <TableHeader className="w-[100px]">Total Forecast</TableHeader>
                    <TableHeader className="w-[100px]">Proj. Closing</TableHeader>
                    <TableHeader className="w-[80px]">Alloc / DSD</TableHeader>
                    <TableHeader className="w-[70px]">Min Wks</TableHeader>
                    <TableHeader className="w-[80px]">Risk Stores</TableHeader>
                    <TableHeader className="w-[90px]">Status</TableHeader>
                    <TableHeader className="w-[50px]"></TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="h-10 transition-colors hover:bg-slate-50/50">
                      <td className="px-2 py-2 text-[11px] font-medium border border-slate-100 text-center text-blue-600">{row.skuId}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-left truncate max-w-[180px] text-slate-700">{row.description}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center text-slate-600">{row.vendor}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">
                        {row.safetyStockWks}
                      </td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.totalForecast.toLocaleString()}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.projectedClosing.toLocaleString()}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">
                        {row.allocDsd.toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.minWks}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.riskStores}</td>
                      <td className="px-2 py-2 border border-slate-100 text-center">{getStatusBadge(row.status)}</td>
                      <td className="px-2 py-2 border border-slate-100 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setLocation(`/sip/allocation/${row.skuId}`)}
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
