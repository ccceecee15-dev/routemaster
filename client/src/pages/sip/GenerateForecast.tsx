import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Settings, 
  Info, 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Layers,
  TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["All", "Main Floor", "Section A", "Section B"];
const CATEGORIES = ["All", "Stationery", "Electronics", "Gifts", "Books"];
const SEASONS = ["All", "Spring 2026", "Summer 2026", "Autumn 2025", "Winter 2025"];

export default function GenerateForecast() {
  const [merchArea, setMerchArea] = useState("all");
  const [category, setCategory] = useState("all");
  const [season, setSeason] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowSummary(true);
    }, 2000);
  };

  const ConfigItem = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
      <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Generate Forecast</h1>
          <p className="text-sm text-slate-500">Configure and generate demand forecast</p>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("all");
            setCategory("all");
            setSeason("all");
          }}
          fields={[
            { id: "merch-area", label: "Merch Area", value: merchArea, onChange: setMerchArea, options: MERCH_AREAS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "category", label: "Category", value: category, onChange: setCategory, options: CATEGORIES.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "season", label: "Season", value: season, onChange: setSeason, options: SEASONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration & Context */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card overflow-hidden rounded-xl border shadow-lg">
              <CardHeader className="py-4 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600">
                    <Settings className="h-4.5 w-4.5" />
                  </div>
                  <CardTitle className="text-base font-bold">Forecast Parameters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Forecast Start Week</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          defaultValue="W05 2026"
                          className="w-full h-9 pl-10 pr-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Forecast End Week</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          defaultValue="W52 2026"
                          className="w-full h-9 pl-10 pr-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Review applied context</span>
                    </div>
                    <div className="space-y-3">
                      <ConfigItem label="Baseline demand source" value="CY 2025 Actuals" icon={BarChart3} />
                      <ConfigItem label="Seasonality profile" value="Standard Retail Index" icon={TrendingUp} />
                      <ConfigItem label="Active uplift rules" value="8 active rules applied" icon={Layers} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Generate Forecast
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showSummary && (
              <Card className="glass-card overflow-hidden rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="py-4 px-5 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-emerald-900 dark:text-emerald-100">Forecast Generated Successfully</CardTitle>
                        <p className="text-[10px] text-emerald-600/80 uppercase tracking-wider mt-0.5">Summary for Category: Stationery</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      Latest Run: Just Now
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Forecast Units", value: "1,245,800", sub: "+4.2% vs LY" },
                      { label: "Avg. Weekly Demand", value: "25,954", sub: "Peak: 48,200" },
                      { label: "SKUs Forecasted", value: "482", sub: "98% coverage" },
                      { label: "Forecast Horizon", value: "48 Weeks", sub: "W05-W52 2026" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Top Impacted SKUs</p>
                    <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <ScrollArea className="w-full">
                        <table className="w-full border-collapse">
                          <thead className="bg-slate-50 dark:bg-slate-900/80">
                            <tr>
                              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">SKU ID</th>
                              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Description</th>
                              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">Baseline</th>
                              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">Forecast</th>
                              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">Var %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                              { id: "SKU10284", desc: "Premium Ballpoint Pen Set", base: "12,400", fc: "18,600", var: "+50%" },
                              { id: "SKU10452", desc: "A5 Leather Journal", base: "8,200", fc: "9,840", var: "+20%" },
                              { id: "SKU10119", desc: "Desktop Organizer", base: "5,600", fc: "6,440", var: "+15%" }
                            ].map((row, i) => (
                              <tr key={i} className="text-[11px] hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2 font-medium text-blue-600">{row.id}</td>
                                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.desc}</td>
                                <td className="px-4 py-2 text-right tabular-nums">{row.base}</td>
                                <td className="px-4 py-2 text-right tabular-nums font-bold">{row.fc}</td>
                                <td className="px-4 py-2 text-right text-emerald-600 font-bold">{row.var}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Guidelines/Help Side Panel */}
          <div className="space-y-6">
            <Card className="glass-card border shadow-md">
              <CardHeader className="py-4 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardTitle className="text-sm font-bold">Generation Logic</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {[
                  { title: "Baseline", text: "Uses filtered 2025 actual sales data as the starting point for all SKU projections." },
                  { title: "Seasonality", text: "Applies standard retail index weights to distribute demand across weeks." },
                  { title: "Event Uplift", text: "Overlays active rules from the Manage Event Uplift screen based on defined scopes." }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
