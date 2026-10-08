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
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Layers, 
  AlertCircle, 
  Plus, 
  X,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["All", "Electronics", "Accessories", "Stationery"];
const PLANNING_GROUPS = ["Audio", "Mobile", "Computing", "Wearables"];
const SUB_PLANNING_GROUPS = ["Headphones", "Speakers", "Smartphones", "Tablets"];

const ACTIVE_GRADES: Record<string, string[]> = {
  "electronics": ["S", "M", "L", "XL", "Mega"],
  "accessories": ["XS", "S", "M", "L"],
  "stationery": ["XS", "S", "M", "L", "XL", "Mega"],
};

const REGIONS = ["North", "South", "East", "West"];
const CHANNELS = ["Retail", "Travel", "Online"];
const FORMATS = ["Flagship", "Standard", "Express"];

const generateMockStyles = () => {
  return [
    { id: "S-1001", desc: "Wireless Noise Cancelling Headphones", pg: "Audio", spg: "Headphones", sales: 1.2, units: 8500, coverage: "95%" },
    { id: "S-1002", desc: "Bluetooth Portable Speaker", pg: "Audio", spg: "Speakers", sales: 0.8, units: 12000, coverage: "88%" },
    { id: "S-2001", desc: "NextGen Smartphone Pro", pg: "Mobile", spg: "Smartphones", sales: 4.5, units: 5000, coverage: "100%" },
    { id: "S-2002", desc: "EcoTablet 10-inch", pg: "Computing", spg: "Tablets", sales: 2.1, units: 3500, coverage: "75%" },
    { id: "S-3001", desc: "Smart Fitness Watch", pg: "Wearables", spg: "Smartphones", sales: 1.5, units: 9000, coverage: "92%" },
  ].map(style => ({
    ...style,
    grade: "",
    exceptions: [] as any[]
  }));
};

export default function RangeStyle() {
  const [merchArea, setMerchArea] = useState("all");
  const [planningGroup, setPlanningGroup] = useState("all");
  const [subPlanningGroup, setSubPlanningGroup] = useState("all");
  const [data, setData] = useState(generateMockStyles);
  
  // Exception Modal State
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);

  const handleGradeChange = (styleId: string, newGrade: string) => {
    setData(prev => prev.map(style => 
      style.id === styleId ? { ...style, grade: newGrade } : style
    ));
  };

  const addException = (styleId: string) => {
    setData(prev => prev.map(style => {
      if (style.id === styleId) {
        return {
          ...style,
          exceptions: [...style.exceptions, { id: Date.now(), region: "All", channel: "All", format: "All" }]
        };
      }
      return style;
    }));
  };

  const removeException = (styleId: string, exceptionId: number) => {
    setData(prev => prev.map(style => {
      if (style.id === styleId) {
        return {
          ...style,
          exceptions: style.exceptions.filter((e: any) => e.id !== exceptionId)
        };
      }
      return style;
    }));
  };

  const updateException = (styleId: string, exceptionId: number, field: string, value: string) => {
    setData(prev => prev.map(style => {
      if (style.id === styleId) {
        return {
          ...style,
          exceptions: style.exceptions.map((e: any) => 
            e.id === exceptionId ? { ...e, [field]: value } : e
          )
        };
      }
      return style;
    }));
  };

  const currentActiveGrades = useMemo(() => {
    return ACTIVE_GRADES[merchArea as keyof typeof ACTIVE_GRADES] || [];
  }, [merchArea]);

  const filteredData = useMemo(() => {
    if (merchArea === "all") return [];
    return data.filter(row => {
      if (planningGroup !== "all" && row.pg.toLowerCase() !== planningGroup) return false;
      if (subPlanningGroup !== "all" && row.spg.toLowerCase() !== subPlanningGroup) return false;
      return true;
    });
  }, [data, planningGroup, subPlanningGroup, merchArea]);

  const activeStyle = useMemo(() => {
    return data.find(s => s.id === activeStyleId);
  }, [data, activeStyleId]);

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Range Styling</h1>
          <p className="text-sm text-slate-500 mt-1">Assign style grades and manage ranging exceptions</p>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("all");
            setPlanningGroup("all");
            setSubPlanningGroup("all");
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
            { id: "planning-group", label: "Planning Group", value: planningGroup, onChange: setPlanningGroup, options: [{ value: "all", label: "All Groups" }, ...PLANNING_GROUPS.map(g => ({ value: g.toLowerCase(), label: g }))] },
            { id: "sub-planning-group", label: "Sub Planning Group", value: subPlanningGroup, onChange: setSubPlanningGroup, options: [{ value: "all", label: "All Subgroups" }, ...SUB_PLANNING_GROUPS.map(s => ({ value: s.toLowerCase(), label: s }))] },
          ]}
        />

        {merchArea !== "all" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Merchandise Area Context</p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{MERCH_AREAS.find(a => a.toLowerCase() === merchArea)}</h2>
              </div>
            </div>

            <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/30 border-b border-border">
                        <TableHead colSpan={4} className="border-r border-border text-center text-[10px] h-8 py-0">Product Context</TableHead>
                        <TableHead colSpan={3} className="border-r border-border text-center text-[10px] h-8 py-0">Performance</TableHead>
                        <TableHead colSpan={3} className="text-center text-[10px] h-8 py-0">Grading & Exceptions</TableHead>
                      </TableRow>
                      <TableRow className="bg-muted/50 border-b border-border">
                        <TableHead className="w-[100px] h-10 border-r text-[10px]">Style ID</TableHead>
                        <TableHead className="w-[220px] h-10 border-r text-[10px]">Description</TableHead>
                        <TableHead className="w-[120px] h-10 border-r text-[10px]">Plan Group</TableHead>
                        <TableHead className="w-[120px] h-10 border-r text-[10px]">Sub-Plan Group</TableHead>
                        <TableHead className="w-[100px] h-10 border-r text-[10px] text-right">Sales (£M)</TableHead>
                        <TableHead className="w-[90px] h-10 border-r text-[10px] text-right">Units</TableHead>
                        <TableHead className="w-[90px] h-10 border-r text-[10px] text-right">Coverage</TableHead>
                        <TableHead className="w-[130px] h-10 border-r text-[10px] text-center bg-primary/5">Assigned Grade</TableHead>
                        <TableHead className="w-[120px] h-10 border-r text-[10px] text-center">Exceptions</TableHead>
                        <TableHead className="w-[100px] h-10 text-[10px] text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row) => (
                        <TableRow key={row.id} className="h-10 hover:bg-muted/20 border-b border-border/40">
                          <TableCell className="text-[11px] font-mono font-medium text-primary border-r py-1">{row.id}</TableCell>
                          <TableCell className="text-[11px] font-medium border-r py-1 h-10">
                            <div className="line-clamp-1">{row.desc}</div>
                          </TableCell>
                          <TableCell className="text-[11px] border-r py-1">{row.pg}</TableCell>
                          <TableCell className="text-[11px] border-r py-1">{row.spg}</TableCell>
                          <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.sales}</TableCell>
                          <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.units.toLocaleString()}</TableCell>
                          <TableCell className="text-[11px] text-right border-r py-1 tabular-nums">{row.coverage}</TableCell>
                          <TableCell className="border-r py-1 bg-primary/[0.02]">
                            <Select 
                              value={row.grade} 
                              onValueChange={(value) => handleGradeChange(row.id, value)}
                            >
                              <SelectTrigger className="h-7 w-24 mx-auto text-[11px] font-bold border-primary/20 rounded-md shadow-none px-2">
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
                          <TableCell className="border-r py-1 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-7 text-[10px] font-bold px-2",
                                row.exceptions.length > 0 ? "text-amber-600 bg-amber-50 hover:bg-amber-100" : "text-slate-400 hover:text-slate-600"
                              )}
                              onClick={() => {
                                setActiveStyleId(row.id);
                                setIsExceptionModalOpen(true);
                              }}
                            >
                              {row.exceptions.length > 0 ? `${row.exceptions.length} Exceptions` : "None"}
                            </Button>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-center">
                            {row.grade ? (
                              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5">
                                GRADED
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold h-5">
                                PENDING
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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
              <Package className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a Merchandise Area to begin range styling</p>
          </div>
        )}
      </div>

      {/* Exception Management Modal */}
      <Dialog open={isExceptionModalOpen} onOpenChange={setIsExceptionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Manage Exceptions: {activeStyle?.desc}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Define conditions where this style should be excluded from ranging.</p>
              <Button size="sm" onClick={() => activeStyleId && addException(activeStyleId)} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Exception
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-[10px]">Region</TableHead>
                    <TableHead className="text-[10px]">Channel</TableHead>
                    <TableHead className="text-[10px]">Format</TableHead>
                    <TableHead className="text-[10px] w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeStyle?.exceptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-slate-400 text-xs italic">
                        No exceptions defined for this style.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeStyle?.exceptions.map((exc: any) => (
                      <TableRow key={exc.id}>
                        <TableCell className="p-2">
                          <Select value={exc.region} onValueChange={(v) => activeStyleId && updateException(activeStyleId, exc.id, "region", v)}>
                            <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Regions</SelectItem>
                              {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Select value={exc.channel} onValueChange={(v) => activeStyleId && updateException(activeStyleId, exc.id, "channel", v)}>
                            <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Channels</SelectItem>
                              {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Select value={exc.format} onValueChange={(v) => activeStyleId && updateException(activeStyleId, exc.id, "format", v)}>
                            <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Formats</SelectItem>
                              {FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => activeStyleId && removeException(activeStyleId, exc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Rule:</strong> Style will be <strong>Excluded</strong> from any store matching the criteria above. 
                Exceptions override the base style grade.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsExceptionModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
