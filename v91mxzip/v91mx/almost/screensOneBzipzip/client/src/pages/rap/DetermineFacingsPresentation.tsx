import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ArrowLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const REGIONS = ["North", "South", "East", "West", "Central"];
const STORE_FORMATS = ["Express", "Standard", "Flagship", "Travel Hub"];
const STORE_CHANNELS = ["Retail", "Travel", "Online"];
const STORE_GRADES = ["XS", "S", "M", "L", "XL", "Mega"];

const MERCH_AREAS = ["Electronics", "Accessories", "Stationery"];
const CATEGORIES = ["Audio", "Mobile", "Computing", "Wearables"];
const SUB_CATEGORIES = ["Personal Audio", "Smart Home", "Business", "Fitness"];
const PLANNING_GROUPS = ["Headphones", "Speakers", "Smartphones", "Tablets"];
const SUB_PLANNING_GROUPS = ["Wireless", "Wired", "Pro", "Standard"];

const generateMockStores = () => {
  return [
    { id: "0876", name: "London Victoria", format: "Flagship", channel: "Retail", region: "South", fixtures: "Wall + Spinner", facingsCap: 120, presCap: 480 },
    { id: "1024", name: "Manchester Piccadilly", format: "Flagship", channel: "Retail", region: "North", fixtures: "Wall + Peg", facingsCap: 100, presCap: 400 },
    { id: "1489", name: "Heathrow T5", format: "Travel Hub", channel: "Travel", region: "South", fixtures: "Spinner + Shelf", facingsCap: 150, presCap: 600 },
    { id: "0542", name: "Birmingham New Street", format: "Standard", channel: "Retail", region: "Central", fixtures: "Wall", facingsCap: 80, presCap: 320 },
    { id: "0112", name: "Reading Station", format: "Express", channel: "Retail", region: "South", fixtures: "Peg", facingsCap: 40, presCap: 160 },
  ];
};

const generateMockStyles = () => {
  return [
    { id: "S-1001", desc: "Wireless Headphones", merchArea: "Electronics", cat: "Audio", subCat: "Personal Audio", pg: "Headphones", spg: "Wireless", grade: "XL", sales: 1.2, units: 8500, facings: 2, depth: 4 },
    { id: "S-1002", desc: "Bluetooth Speaker", merchArea: "Electronics", cat: "Audio", subCat: "Smart Home", pg: "Speakers", spg: "Wireless", grade: "M", sales: 0.8, units: 12000, facings: 3, depth: 4 },
    { id: "S-2001", desc: "Smartphone Pro", merchArea: "Electronics", cat: "Mobile", subCat: "Business", pg: "Smartphones", spg: "Pro", grade: "Mega", sales: 4.5, units: 5000, facings: 1, depth: 4 },
    { id: "S-2002", desc: "EcoTablet 10\"", merchArea: "Electronics", cat: "Computing", subCat: "Business", pg: "Tablets", spg: "Standard", grade: "L", sales: 2.1, units: 3500, facings: 2, depth: 4 },
    { id: "S-3001", desc: "Fitness Watch", merchArea: "Accessories", cat: "Wearables", subCat: "Fitness", pg: "Smartphones", spg: "Standard", grade: "S", sales: 1.5, units: 9000, facings: 2, depth: 4 },
  ];
};

export default function DetermineFacingsPresentation() {
  // Store Selection Filters
  const [region, setRegion] = useState("all");
  const [format, setFormat] = useState("all");
  const [channel, setChannel] = useState("all");
  
  // Style Detail Filters
  const [detailMerchArea, setDetailMerchArea] = useState("all");
  const [detailCat, setDetailCat] = useState("all");
  const [detailSubCat, setDetailSubCat] = useState("all");
  const [detailPg, setDetailPg] = useState("all");
  const [detailSpg, setDetailSpg] = useState("all");

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [styleData, setStyleData] = useState(generateMockStyles());
  const stores = useMemo(() => generateMockStores(), []);

  const selectedStore = useMemo(() => 
    stores.find(s => s.id === selectedStoreId), 
    [selectedStoreId, stores]
  );

  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      if (region !== "all" && s.region.toLowerCase() !== region) return false;
      if (format !== "all" && s.format.toLowerCase() !== format) return false;
      if (channel !== "all" && s.channel.toLowerCase() !== channel) return false;
      return true;
    });
  }, [stores, region, format, channel]);

  const filteredStyles = useMemo(() => {
    return styleData.filter(s => {
      if (detailMerchArea !== "all" && s.merchArea.toLowerCase() !== detailMerchArea) return false;
      if (detailCat !== "all" && s.cat.toLowerCase() !== detailCat) return false;
      if (detailSubCat !== "all" && s.subCat.toLowerCase() !== detailSubCat) return false;
      if (detailPg !== "all" && s.pg.toLowerCase() !== detailPg) return false;
      if (detailSpg !== "all" && s.spg.toLowerCase() !== detailSpg) return false;
      return true;
    });
  }, [styleData, detailMerchArea, detailCat, detailSubCat, detailPg, detailSpg]);

  const handleStyleUpdate = (id: string, field: "facings" | "depth", value: string) => {
    const numValue = parseInt(value) || 0;
    setStyleData(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: numValue } : s
    ));
  };

  const totals = useMemo(() => {
    return filteredStyles.reduce((acc, s) => ({
      facings: acc.facings + s.facings,
      presentation: acc.presentation + (s.facings * s.depth)
    }), { facings: 0, presentation: 0 });
  }, [filteredStyles]);

  const resetDetailFilters = () => {
    setDetailMerchArea("all");
    setDetailCat("all");
    setDetailSubCat("all");
    setDetailPg("all");
    setDetailSpg("all");
  };

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Determine Facings & Presentation</h1>
            <p className="text-sm text-slate-500 mt-1">
              {selectedStore ? `Planning for ${selectedStore.name}` : "Store-level capacity planning"}
            </p>
          </div>
          {selectedStore && (
            <Button variant="outline" size="sm" onClick={() => setSelectedStoreId(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Stores
            </Button>
          )}
        </div>

        {!selectedStore ? (
          <CompactFilterBar
            onApply={() => {}}
            onClear={() => {
              setRegion("all");
              setFormat("all");
              setChannel("all");
            }}
            fields={[
              { id: "channel", label: "Channel", value: channel, onChange: setChannel, options: [{ value: "all", label: "All Channels" }, ...STORE_CHANNELS.map(c => ({ value: c.toLowerCase(), label: c }))] },
              { id: "region", label: "Region", value: region, onChange: setRegion, options: [{ value: "all", label: "All Regions" }, ...REGIONS.map(r => ({ value: r.toLowerCase(), label: r }))] },
              { id: "format", label: "Format", value: format, onChange: setFormat, options: [{ value: "all", label: "All Formats" }, ...STORE_FORMATS.map(f => ({ value: f.toLowerCase(), label: f }))] },
            ]}
          />
        ) : (
          <CompactFilterBar
            onApply={() => {}}
            onClear={resetDetailFilters}
            fields={[
              { id: "detail-merch-area", label: "Merch Area", value: detailMerchArea, onChange: setDetailMerchArea, options: [{ value: "all", label: "All Areas" }, ...MERCH_AREAS.map(a => ({ value: a.toLowerCase(), label: a }))] },
              { id: "detail-cat", label: "Category", value: detailCat, onChange: setDetailCat, options: [{ value: "all", label: "All Categories" }, ...CATEGORIES.map(c => ({ value: c.toLowerCase(), label: c }))] },
              { id: "detail-sub-cat", label: "Sub Cat", value: detailSubCat, onChange: setDetailSubCat, options: [{ value: "all", label: "All Subcats" }, ...SUB_CATEGORIES.map(s => ({ value: s.toLowerCase(), label: s }))] },
              { id: "detail-pg", label: "Plan Group", value: detailPg, onChange: setDetailPg, options: [{ value: "all", label: "All Groups" }, ...PLANNING_GROUPS.map(g => ({ value: g.toLowerCase(), label: g }))] },
              { id: "detail-spg", label: "Sub Plan Group", value: detailSpg, onChange: setDetailSpg, options: [{ value: "all", label: "All Subgroups" }, ...SUB_PLANNING_GROUPS.map(s => ({ value: s.toLowerCase(), label: s }))] },
            ]}
          />
        )}

        {selectedStore ? (
          <div className="space-y-4">
            {/* Store Summary Card */}
            <Card className="rounded-xl border shadow-sm bg-primary/[0.03] border-primary/10 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{selectedStore.id}</p>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedStore.name}</h2>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                        {selectedStore.format} • {selectedStore.channel} • {selectedStore.fixtures}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facings Used</p>
                      <p className={cn(
                        "text-xl font-black tabular-nums",
                        totals.facings > selectedStore.facingsCap ? "text-red-500" : "text-slate-900 dark:text-slate-100"
                      )}>
                        {totals.facings} <span className="text-xs font-medium text-slate-400">/ {selectedStore.facingsCap}</span>
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Presentation Used</p>
                      <p className={cn(
                        "text-xl font-black tabular-nums",
                        totals.presentation > selectedStore.presCap ? "text-red-500" : "text-slate-900 dark:text-slate-100"
                      )}>
                        {totals.presentation} <span className="text-xs font-medium text-slate-400">/ {selectedStore.presCap}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Styles Detail Table */}
            <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/50 border-b border-border">
                        <TableHead className="w-[100px] h-10 border-r text-[10px]">Style ID</TableHead>
                        <TableHead className="w-[180px] h-10 border-r text-[10px]">Description</TableHead>
                        <TableHead className="w-[120px] h-10 border-r text-[10px] text-right">Sales (£M)</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-right">Units Sold</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-center">Grade</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-center bg-primary/5">Facings</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-center bg-primary/5">Depth</TableHead>
                        <TableHead className="w-[120px] h-10 text-[10px] text-right font-bold">Presentation</TableHead>
                        <TableHead className="w-[100px] h-10 text-[10px] text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStyles.length > 0 ? (
                        filteredStyles.map((row) => {
                          const presentation = row.facings * row.depth;
                          return (
                            <TableRow key={row.id} className="h-10 hover:bg-muted/20 border-b border-border/40">
                              <TableCell className="text-[11px] font-mono font-medium text-primary border-r py-1">{row.id}</TableCell>
                              <TableCell className="text-[11px] font-medium border-r py-1 line-clamp-1 h-10 flex items-center">{row.desc}</TableCell>
                              <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.sales}</TableCell>
                              <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.units.toLocaleString()}</TableCell>
                              <TableCell className="text-[11px] text-center border-r py-1">
                                <Badge variant="outline" className="text-[10px] font-bold px-2 h-5">{row.grade}</Badge>
                              </TableCell>
                              <TableCell className="border-r py-1 bg-primary/[0.02]">
                                <Input
                                  type="number"
                                  value={row.facings}
                                  onChange={(e) => handleStyleUpdate(row.id, "facings", e.target.value)}
                                  className="h-7 w-16 mx-auto text-center text-[11px] font-bold border-primary/20 rounded-md shadow-none px-1"
                                />
                              </TableCell>
                              <TableCell className="border-r py-1 bg-primary/[0.02]">
                                <Input
                                  type="number"
                                  value={row.depth}
                                  onChange={(e) => handleStyleUpdate(row.id, "depth", e.target.value)}
                                  className="h-7 w-16 mx-auto text-center text-[11px] font-bold border-primary/20 rounded-md shadow-none px-1"
                                />
                              </TableCell>
                              <TableCell className="text-[11px] text-right font-bold py-1 tabular-nums">{presentation}</TableCell>
                              <TableCell className="py-1 px-2 text-center">
                                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5 uppercase">
                                  OK
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground italic">
                            No styles match the current filters.
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
          <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-border">
                      <TableHead className="w-[80px] h-10 border-r text-[10px]">Store ID</TableHead>
                      <TableHead className="w-[180px] h-10 border-r text-[10px]">Store Name</TableHead>
                      <TableHead className="w-[100px] h-10 border-r text-[10px]">Format</TableHead>
                      <TableHead className="w-[150px] h-10 border-r text-[10px]">Fixtures</TableHead>
                      <TableHead className="w-[100px] h-10 border-r text-[10px] text-right">Facings Cap</TableHead>
                      <TableHead className="w-[100px] h-10 border-r text-[10px] text-right">Pres Cap</TableHead>
                      <TableHead className="w-[100px] h-10 border-r text-[10px] text-center">Status</TableHead>
                      <TableHead className="w-[100px] h-10 text-[10px] text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.length > 0 ? (
                      filteredStores.map((row) => (
                        <TableRow key={row.id} className="h-10 hover:bg-muted/20 border-b border-border/40">
                          <TableCell className="text-[11px] font-mono font-medium text-primary border-r py-1">{row.id}</TableCell>
                          <TableCell className="text-[11px] font-medium border-r py-1">{row.name}</TableCell>
                          <TableCell className="text-[11px] border-r py-1">{row.format}</TableCell>
                          <TableCell className="text-[11px] border-r py-1">{row.fixtures}</TableCell>
                          <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.facingsCap}</TableCell>
                          <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.presCap}</TableCell>
                          <TableCell className="border-r py-1 text-center">
                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold h-5 uppercase">
                              PENDING
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1 text-center">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedStoreId(row.id)} className="h-7 text-[10px] font-bold text-primary">
                              View Store
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground italic">
                          No stores match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
