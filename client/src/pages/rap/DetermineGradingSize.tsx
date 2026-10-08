import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, Settings2, Database, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["All", "Electronics", "Accessories", "Stationery"];
const STORE_FORMATS = ["Format 1", "Format 2", "Format 3", "Format 4", "Format 5", "Format 6", "Format 7"];
const STORE_GRADES = ["XS", "S", "M", "L", "XL", "Mega"];
const FIXTURE_TYPES = ["Wall", "Spinner", "Peg", "Shelf"];

const HISTORICAL_DATA = STORE_GRADES.map(grade => ({
  grade,
  formats: STORE_FORMATS.reduce((acc, format) => ({
    ...acc,
    [format]: Math.floor(Math.random() * 50) + 10
  }), {} as Record<string, number>)
}));

const generateInitialPolicy = () => {
  return STORE_GRADES.map(grade => ({
    grade,
    skuCount: Math.floor(Math.random() * 40) + 20,
    allowedFixtures: ["Wall", "Shelf"],
    active: true
  }));
};

// Generate separate policy data for each format
const generateFormatPolicyData = () => {
  return STORE_FORMATS.reduce((acc, format) => ({
    ...acc,
    [format]: generateInitialPolicy()
  }), {} as Record<string, ReturnType<typeof generateInitialPolicy>>);
};

export default function DetermineGradingSize() {
  const [merchArea, setMerchArea] = useState("all");
  const [activeFormat, setActiveFormat] = useState(STORE_FORMATS[0]);
  const [formatPolicies, setFormatPolicies] = useState(generateFormatPolicyData);

  const handlePolicyChange = (format: string, grade: string, field: string, value: any) => {
    setFormatPolicies(prev => ({
      ...prev,
      [format]: prev[format].map(item => 
        item.grade === grade ? { ...item, [field]: value } : item
      )
    }));
  };

  const toggleFixture = (format: string, grade: string, fixture: string) => {
    setFormatPolicies(prev => ({
      ...prev,
      [format]: prev[format].map(item => {
        if (item.grade === grade) {
          const fixtures = item.allowedFixtures.includes(fixture)
            ? item.allowedFixtures.filter(f => f !== fixture)
            : [...item.allowedFixtures, fixture];
          return { ...item, allowedFixtures: fixtures };
        }
        return item;
      })
    }));
  };

  const totalSkuBudget = 500; // Mock budget
  
  const assignedSkuCount = useMemo(() => {
    const currentPolicy = formatPolicies[activeFormat];
    return currentPolicy.reduce((sum, item) => item.active ? sum + item.skuCount : sum, 0);
  }, [formatPolicies, activeFormat]);

  const selectedMerchAreaLabel = useMemo(() => {
    return MERCH_AREAS.find(a => a.toLowerCase() === merchArea);
  }, [merchArea]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Determine Grading Size</h1>
          <p className="text-sm text-slate-500 mt-1">Define SKU targets and fixture policies by grade</p>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => setMerchArea("all")}
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
          ]}
        />

        {merchArea !== "all" ? (
          <div className="space-y-6">
            {/* Context Summary Card */}
            <Card className="rounded-xl border shadow-sm bg-primary/[0.03] border-primary/10 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Selected Merchandise Area</p>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedMerchAreaLabel}</h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total SKU Budget</p>
                      <p className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{totalSkuBudget}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned SKU Count ({activeFormat})</p>
                      <p className={cn(
                        "text-xl font-black tabular-nums",
                        assignedSkuCount > totalSkuBudget ? "text-red-500" : "text-emerald-600"
                      )}>
                        {assignedSkuCount}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilization</p>
                      <p className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {Math.round((assignedSkuCount / totalSkuBudget) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Reference Table */}
            <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
              <CardHeader className="py-3 px-5 border-b bg-muted/30 flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-sm font-bold text-slate-700">Historical Average SKU Count (Reference)</CardTitle>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5">
                  {selectedMerchAreaLabel}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/50 border-b">
                        <TableHead className="text-[10px] w-[100px]">Store Grade</TableHead>
                        {STORE_FORMATS.map(format => (
                          <TableHead key={format} className="text-[10px] text-right font-medium">{format}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {HISTORICAL_DATA.map((row) => (
                        <TableRow key={row.grade} className="h-8 hover:bg-muted/10 border-b border-border/40">
                          <TableCell className="text-[11px] font-bold py-1 bg-muted/5">{row.grade}</TableCell>
                          {STORE_FORMATS.map(format => (
                            <TableCell key={format} className="text-[11px] text-right py-1 text-slate-500 tabular-nums">
                              {row.formats[format]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Primary Planner Table with Tabs */}
            <div className="space-y-4">
              <Tabs value={activeFormat} onValueChange={setActiveFormat} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700">Policy & Target Setup</h3>
                  </div>
                  <TabsList className="bg-slate-100/50 p-1 h-9 glass-card border">
                    {STORE_FORMATS.map(format => (
                      <TabsTrigger 
                        key={format} 
                        value={format} 
                        className="text-[11px] font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                      >
                        {format}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {STORE_FORMATS.map(format => (
                  <TabsContent key={format} value={format} className="mt-0">
                    <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
                      <CardHeader className="py-3 px-5 border-b bg-muted/30 flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4 text-indigo-500" />
                          <CardTitle className="text-sm font-bold text-slate-700">{format} Configuration</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5">
                          {selectedMerchAreaLabel}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table className="border-collapse">
                          <TableHeader>
                            <TableRow className="bg-muted/50 border-b">
                              <TableHead className="w-[120px] h-10 border-r text-[10px]">Store Grade</TableHead>
                              <TableHead className="w-[140px] h-10 border-r text-[10px] text-center bg-primary/5">SKU Count</TableHead>
                              <TableHead className="h-10 border-r text-[10px] text-center bg-primary/5">Allowed Fixture Types</TableHead>
                              <TableHead className="w-[120px] h-10 text-[10px] text-center">Grade Active</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formatPolicies[format].map((row) => (
                              <TableRow 
                                key={row.grade} 
                                className={cn(
                                  "h-12 border-b border-border/40 transition-opacity duration-300",
                                  !row.active && "opacity-40 grayscale"
                                )}
                              >
                                <TableCell className="text-[11px] font-bold border-r py-2 text-center bg-muted/10">
                                  {row.grade}
                                </TableCell>
                                <TableCell className="border-r py-2 bg-primary/[0.02]">
                                  <Input
                                    type="number"
                                    value={row.skuCount}
                                    disabled={!row.active}
                                    onChange={(e) => handlePolicyChange(format, row.grade, "skuCount", parseInt(e.target.value) || 0)}
                                    className="h-8 w-24 mx-auto text-center text-[12px] font-bold border-primary/20 focus:ring-1 focus:ring-primary/20 rounded-md shadow-none px-1"
                                  />
                                </TableCell>
                                <TableCell className="border-r py-2 bg-primary/[0.02]">
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {FIXTURE_TYPES.map(fixture => (
                                      <div key={fixture} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`${format}-${row.grade}-${fixture}`}
                                          checked={row.allowedFixtures.includes(fixture)}
                                          disabled={!row.active}
                                          onCheckedChange={() => toggleFixture(format, row.grade, fixture)}
                                          className="h-4 w-4 border-primary/30"
                                        />
                                        <label 
                                          htmlFor={`${format}-${row.grade}-${fixture}`}
                                          className="text-[11px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {fixture}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Switch 
                                      checked={row.active}
                                      onCheckedChange={(checked) => handlePolicyChange(format, row.grade, "active", checked)}
                                    />
                                    <Badge variant="outline" className={cn(
                                      "text-[9px] font-bold border-none h-5",
                                      row.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                      {row.active ? "ACTIVE" : "EXCLUDED"}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/50">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a Merchandise Area to begin grading setup</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
