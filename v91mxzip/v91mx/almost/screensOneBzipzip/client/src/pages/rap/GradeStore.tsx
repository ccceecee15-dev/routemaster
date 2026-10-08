import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LayoutGrid, TrendingUp, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["All", "Electronics", "Accessories", "Stationery"];
const REGIONS = ["North", "South", "East", "West", "Central"];
const STORE_FORMATS = ["Express", "Standard", "Flagship", "Travel Hub"];
const STORE_CHANNELS = ["Retail", "Travel", "Online", "Wholesale"];

// Mock active grades per Merchandise Area (sourced conceptually from Determine Grading Size)
const ACTIVE_GRADES: Record<string, string[]> = {
  "electronics": ["S", "M", "L", "XL", "Mega"],
  "accessories": ["XS", "S", "M", "L"],
  "stationery": ["XS", "S", "M", "L", "XL", "Mega"],
};

const generateMockStores = () => {
  const stores = [
    { id: "0876", name: "London Victoria", format: "Flagship", channel: "Retail", region: "South", annualSales: 4.2, unitsSold: 125000, density: 450 },
    { id: "1024", name: "Manchester Piccadilly", format: "Flagship", channel: "Retail", region: "North", annualSales: 3.8, unitsSold: 110000, density: 420 },
    { id: "0542", name: "Birmingham New Street", format: "Standard", channel: "Retail", region: "Central", annualSales: 2.1, unitsSold: 65000, density: 310 },
    { id: "0219", name: "Edinburgh Waverley", format: "Standard", channel: "Retail", region: "North", annualSales: 1.9, unitsSold: 58000, density: 290 },
    { id: "0931", name: "Glasgow Central", format: "Standard", channel: "Retail", region: "North", annualSales: 2.2, unitsSold: 68000, density: 330 },
    { id: "1105", name: "Leeds Station", format: "Standard", channel: "Retail", region: "North", annualSales: 1.8, unitsSold: 55000, density: 280 },
    { id: "0348", name: "Bristol Temple Meads", format: "Standard", channel: "Retail", region: "West", annualSales: 1.6, unitsSold: 48000, density: 260 },
    { id: "0762", name: "Liverpool Lime Street", format: "Standard", channel: "Retail", region: "North", annualSales: 2.0, unitsSold: 62000, density: 300 },
    { id: "1489", name: "Heathrow T5", format: "Travel Hub", channel: "Travel", region: "South", annualSales: 5.2, unitsSold: 180000, density: 550 },
    { id: "1502", name: "Gatwick South", format: "Travel Hub", channel: "Travel", region: "South", annualSales: 4.8, unitsSold: 165000, density: 520 },
    { id: "0112", name: "Reading Station", format: "Express", channel: "Retail", region: "South", annualSales: 0.9, unitsSold: 32000, density: 240 },
    { id: "0645", name: "Oxford High Street", format: "Express", channel: "Retail", region: "South", annualSales: 0.8, unitsSold: 28000, density: 220 },
    { id: "0821", name: "Cambridge Station", format: "Express", channel: "Retail", region: "East", annualSales: 1.1, unitsSold: 42000, density: 280 },
    { id: "0493", name: "York Station", format: "Express", channel: "Retail", region: "North", annualSales: 0.7, unitsSold: 25000, density: 200 },
  ];

  return stores.map(store => ({
    ...store,
    grade: "" // Initially ungraded
  }));
};

export default function GradeStore() {
  const [merchArea, setMerchArea] = useState("all");
  const [region, setRegion] = useState("all");
  const [format, setFormat] = useState("all");
  const [channel, setChannel] = useState("all");
  const [showOnlyUngraded, setShowOnlyUngraded] = useState(false);
  const [data, setData] = useState(generateMockStores);

  const handleGradeChange = (storeId: string, newGrade: string) => {
    setData(prev => prev.map(store => 
      store.id === storeId ? { ...store, grade: newGrade } : store
    ));
  };

  const currentActiveGrades = useMemo(() => {
    return ACTIVE_GRADES[merchArea as keyof typeof ACTIVE_GRADES] || [];
  }, [merchArea]);

  const filteredData = useMemo(() => {
    if (merchArea === "all") return [];
    return data.filter(row => {
      if (region !== "all" && row.region.toLowerCase() !== region) return false;
      if (format !== "all" && row.format.toLowerCase() !== format) return false;
      if (channel !== "all" && row.channel.toLowerCase() !== channel) return false;
      if (showOnlyUngraded && row.grade !== "") return false;
      return true;
    });
  }, [data, region, format, channel, showOnlyUngraded, merchArea]);

  const selectedMerchAreaLabel = useMemo(() => {
    return MERCH_AREAS.find(a => a.toLowerCase() === merchArea);
  }, [merchArea]);

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Grade Store</h1>
          <p className="text-sm text-slate-500 mt-1">Assign store grades by Merchandise Area</p>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("all");
            setRegion("all");
            setFormat("all");
            setChannel("all");
            setShowOnlyUngraded(false);
          }}
          fields={[
            { 
              id: "merch-area", 
              label: "Merchandise Area", 
              value: merchArea, 
              onChange: setMerchArea, 
              options: [
                { value: "all", label: "Select Area..." },
                ...MERCH_AREAS.filter(a => a !== "All").map(a => ({ value: a.toLowerCase(), label: a }))
              ] 
            },
            { id: "channel", label: "Channel", value: channel, onChange: setChannel, options: [{ value: "all", label: "All Channels" }, ...STORE_CHANNELS.map(c => ({ value: c.toLowerCase(), label: c }))] },
            { id: "region", label: "Region", value: region, onChange: setRegion, options: [{ value: "all", label: "All Regions" }, ...REGIONS.map(r => ({ value: r.toLowerCase(), label: r }))] },
            { id: "format", label: "Format", value: format, onChange: setFormat, options: [{ value: "all", label: "All Formats" }, ...STORE_FORMATS.map(f => ({ value: f.toLowerCase(), label: f }))] },
          ]}
        />

        {merchArea !== "all" ? (
          <div className="space-y-4">
            {/* Merch Area Header Badge & Toggle */}
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Merchandise Area Context</p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedMerchAreaLabel}</h2>
              </div>
              
              <div className="ml-auto flex items-center gap-6">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-border/50">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <Label htmlFor="ungraded-toggle" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                    Only Ungraded
                  </Label>
                  <Switch 
                    id="ungraded-toggle"
                    checked={showOnlyUngraded}
                    onCheckedChange={setShowOnlyUngraded}
                    className="scale-75"
                  />
                </div>

                <Badge variant="outline" className="bg-white/50 py-1 px-3 h-9">
                  <span className="text-muted-foreground mr-1">Active Grades:</span>
                  <span className="font-bold text-primary">{currentActiveGrades.join(", ")}</span>
                </Badge>
              </div>
            </div>

            <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/30 border-b border-border">
                        <TableHead colSpan={4} className="border-r border-border text-center text-[10px] h-8 py-0">Store Context</TableHead>
                        <TableHead colSpan={3} className="border-r border-border text-center text-[10px] h-8 py-0">Performance Metrics</TableHead>
                        <TableHead colSpan={2} className="text-center text-[10px] h-8 py-0">Grading Assignment</TableHead>
                      </TableRow>
                      <TableRow className="bg-muted/50 border-b border-border">
                        <TableHead className="w-[80px] h-10 border-r text-[10px]">Store #</TableHead>
                        <TableHead className="w-[180px] h-10 border-r text-[10px]">Store Name</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px]">Format</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px]">Region</TableHead>
                        <TableHead className="w-[110px] h-10 border-r text-[10px] text-right">Annual Sales</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-right">Units Sold</TableHead>
                        <TableHead className="w-[120px] h-10 border-r text-[10px] text-right">Sales Density</TableHead>
                        <TableHead className="w-[140px] h-10 border-r text-[10px] text-center bg-primary/5">Assigned Grade</TableHead>
                        <TableHead className="w-[120px] h-10 text-[10px] text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((row) => (
                          <TableRow key={row.id} className="h-10 hover:bg-muted/20 border-b border-border/40">
                            <TableCell className="text-[11px] font-mono font-medium text-primary border-r py-1">{row.id}</TableCell>
                            <TableCell className="text-[11px] font-medium border-r py-1">{row.name}</TableCell>
                            <TableCell className="text-[11px] border-r py-1">{row.format}</TableCell>
                            <TableCell className="text-[11px] border-r py-1">{row.region}</TableCell>
                            <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">£{row.annualSales}M</TableCell>
                            <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.unitsSold.toLocaleString()}</TableCell>
                            <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">£{row.density}/sqft</TableCell>
                            <TableCell className="border-r py-1 bg-primary/[0.02]">
                              <Select 
                                value={row.grade} 
                                onValueChange={(value) => handleGradeChange(row.id, value)}
                              >
                                <SelectTrigger className="h-7 w-28 mx-auto text-[11px] font-bold border-primary/20 hover:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-md shadow-none px-2">
                                  <SelectValue placeholder="Grade..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentActiveGrades.map(grade => (
                                    <SelectItem key={grade} value={grade} className="text-[11px] font-bold">
                                      {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-1 px-2 text-center">
                              {row.grade ? (
                                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5">
                                  ASSIGNED
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold h-5">
                                  UNGRADED
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                            No stores match the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/50">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a Merchandise Area to begin store grading</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
