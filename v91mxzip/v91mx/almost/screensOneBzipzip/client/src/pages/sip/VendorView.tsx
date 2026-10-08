import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Building2, 
  ChevronRight, 
  Upload, 
  FileText, 
  Search, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const VENDORS = ["All", "Global Stationery Corp", "TechFlow Electronics", "Everlasting Gifts", "Signature Books", "Peak Office Supplies"];
const MERCH_AREAS = ["All", "Main Floor", "Section A", "Section B"];
const CATEGORIES = ["All", "Stationery", "Electronics", "Gifts", "Books"];
const SEASONS = ["All", "Spring 2026", "Summer 2026", "Autumn 2025", "Winter 2025"];

const MOCK_VENDOR_DATA = [
  { id: 1, name: "Global Stationery Corp", code: "VND-1001", forecast: 450000, avgWeekly: 9375, skus: 124, alloc: 410000, netReq: 40000, status: "Short" },
  { id: 2, name: "TechFlow Electronics", code: "VND-1002", forecast: 280000, avgWeekly: 5833, skus: 86, alloc: 295000, netReq: -15000, status: "Excess" },
  { id: 3, name: "Everlasting Gifts", code: "VND-1003", forecast: 195000, avgWeekly: 4062, skus: 52, alloc: 195000, netReq: 0, status: "OK" },
  { id: 4, name: "Signature Books", code: "VND-1004", forecast: 320000, avgWeekly: 6667, skus: 94, alloc: 310000, netReq: 10000, status: "OK" },
  { id: 5, name: "Peak Office Supplies", code: "VND-1005", forecast: 150000, avgWeekly: 3125, skus: 45, alloc: 120000, netReq: 30000, status: "Short" }
];

const MOCK_SKU_DATA: Record<number, any[]> = {
  1: [
    { id: "SKU1001", desc: "Premium Ballpoint Pen Set", fc: 12400, alloc: 10000, net: 2400, status: "Short" },
    { id: "SKU1002", desc: "A5 Leather Journal", fc: 8200, alloc: 8500, net: -300, status: "Excess" },
    { id: "SKU1003", desc: "Mechanical Pencil (0.5mm)", fc: 5600, alloc: 5600, net: 0, status: "OK" }
  ],
  2: [
    { id: "SKU2001", desc: "Wireless Earbuds Case", fc: 15000, alloc: 16000, net: -1000, status: "Excess" },
    { id: "SKU2002", desc: "USB-C Charging Cable", fc: 8000, alloc: 8200, net: -200, status: "Excess" }
  ]
};

export default function VendorView() {
  const [vendorFilter, setVendorFilter] = useState("all");
  const [merchArea, setMerchArea] = useState("all");
  const [category, setCategory] = useState("all");
  const [season, setSeason] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const TableHeader = ({ children, className = "", colSpan }: { children?: React.ReactNode, className?: string, colSpan?: number }) => (
    <th 
      colSpan={colSpan}
      className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-center", className)}
    >
      {children}
    </th>
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "OK": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Short": "bg-rose-100 text-rose-700 border-rose-200",
      "Excess": "bg-amber-100 text-amber-700 border-amber-200"
    };
    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 h-4.5", styles[status])}>
        {status}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Vendor View</h1>
            <p className="text-sm text-slate-500">Review forecast and allocation by vendor</p>
          </div>
          <Button 
            onClick={() => setIsUploadOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            Upload PO
          </Button>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setVendorFilter("all");
            setMerchArea("all");
            setCategory("all");
            setSeason("all");
          }}
          fields={[
            { id: "vendor", label: "Vendor", value: vendorFilter, onChange: setVendorFilter, options: VENDORS.map(v => ({ value: v.toLowerCase().replace(/\s+/g, '-'), label: v })) },
            { id: "merch-area", label: "Merch Area", value: merchArea, onChange: setMerchArea, options: MERCH_AREAS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "category", label: "Category", value: category, onChange: setCategory, options: CATEGORIES.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "season", label: "Season", value: season, onChange: setSeason, options: SEASONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
          ]}
        />

        {selectedVendor ? (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedVendor(null)}
              className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Vendor Summary
            </Button>

            <Card className="glass-card overflow-hidden rounded-xl border shadow-lg">
              <CardHeader className="py-4 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{selectedVendor.name}</CardTitle>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{selectedVendor.code} • SKU Detail View</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <TableHeader className="w-[120px]">SKU</TableHeader>
                        <TableHeader className="text-left">Description</TableHeader>
                        <TableHeader className="w-[140px]">Forecast Units</TableHeader>
                        <TableHeader className="w-[140px]">Alloc / DSD</TableHeader>
                        <TableHeader className="w-[140px]">Net Requirement</TableHeader>
                        <TableHeader className="w-[120px]">Status</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(MOCK_SKU_DATA[selectedVendor.id] || []).map((row, i) => (
                        <tr key={i} className="h-11 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2 text-[11px] font-medium text-blue-600 text-center">{row.id}</td>
                          <td className="px-4 py-2 text-[11px] text-slate-700">{row.desc}</td>
                          <td className="px-4 py-2 text-[11px] text-center tabular-nums">{row.fc.toLocaleString()}</td>
                          <td className="px-4 py-2 text-[11px] text-center tabular-nums">{row.alloc.toLocaleString()}</td>
                          <td className="px-4 py-2 text-[11px] text-center tabular-nums font-semibold">{row.net.toLocaleString()}</td>
                          <td className="px-4 py-2 text-center">{getStatusBadge(row.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="glass-card overflow-hidden rounded-xl border shadow-lg">
            <CardHeader className="py-4 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Vendor Summary</CardTitle>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Rolled-up Demand & Supply</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TableHeader colSpan={2} className="bg-slate-100/50">Vendor</TableHeader>
                      <TableHeader colSpan={3} className="bg-blue-50/50">Demand</TableHeader>
                      <TableHeader colSpan={3} className="bg-emerald-50/50">Supply Signal</TableHeader>
                      <TableHeader className="w-[100px] bg-slate-100/50">Action</TableHeader>
                    </tr>
                    <tr>
                      <TableHeader className="w-[180px]">Vendor Name</TableHeader>
                      <TableHeader className="w-[100px]">Code</TableHeader>
                      <TableHeader className="w-[130px]">Total Forecast</TableHeader>
                      <TableHeader className="w-[110px]">Avg Weekly</TableHeader>
                      <TableHeader className="w-[90px]">SKU Count</TableHeader>
                      <TableHeader className="w-[130px]">Total Alloc/DSD</TableHeader>
                      <TableHeader className="w-[130px]">Net Requirement</TableHeader>
                      <TableHeader className="w-[100px]">Status</TableHeader>
                      <TableHeader className="w-[100px]"></TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MOCK_VENDOR_DATA.map((row) => (
                      <tr key={row.id} className="h-12 transition-colors hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-[11px] font-semibold text-slate-900">{row.name}</td>
                        <td className="px-3 py-2 text-[11px] text-center text-slate-500 font-mono">{row.code}</td>
                        <td className="px-3 py-2 text-[11px] text-center tabular-nums">{row.forecast.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[11px] text-center tabular-nums">{row.avgWeekly.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[11px] text-center tabular-nums text-slate-600">{row.skus}</td>
                        <td className="px-3 py-2 text-[11px] text-center tabular-nums text-indigo-600 font-medium">{row.alloc.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[11px] text-center tabular-nums font-bold">{row.netReq.toLocaleString()}</td>
                        <td className="px-3 py-2 border border-slate-100 text-center">{getStatusBadge(row.status)}</td>
                        <td className="px-3 py-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                            onClick={() => setSelectedVendor(row)}
                          >
                            View SKUs
                            <ChevronRight className="h-3 w-3" />
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
        )}

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md glass-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Upload Purchase Order
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select a PO file to upload and preview against vendor allocations.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 gap-4 transition-colors hover:border-indigo-400">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Drop file here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports CSV, XLSX, PDF (Max 10MB)</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider">
                Select File
              </Button>
            </div>
            <DialogFooter className="sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                <HelpCircle className="h-3 w-3" />
                Uploads are simulated for preview only
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsUploadOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                  Preview PO
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
