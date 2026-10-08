import * as React from "react";
import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Plus, Trash2, Edit2, AlertCircle, MapPin, Store, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

// --- Types ---
interface UpliftRule {
  id: number;
  name: string;
  startWeek: string;
  endWeek: string;
  upliftValue: number;
  type: 'absolute' | 'relative';
  notes?: string;
  color: string;
}

interface StoreData {
  id: string;
  name: string;
  format: string;
  channel: string;
  region: string;
  property: string;
  terminal: string;
}

// --- Mock Data ---
const FORMATS = ["Travel", "High Street", "Hospital", "Airport"];
const CHANNELS = ["Direct", "Franchise", "Wholesale"];
const REGIONS = ["London", "South East", "Midlands", "North", "Scotland"];
const PROPERTIES = ["Standalone", "Shopping Centre", "Train Station"];
const TERMINALS = ["T1", "T2", "T3", "T4", "T5", "N/A"];

const MOCK_STORES: StoreData[] = [
  { id: "S001", name: "London Flagship", format: "High Street", channel: "Direct", region: "London", property: "Standalone", terminal: "N/A" },
  { id: "S002", name: "Manchester Central", format: "High Street", channel: "Direct", region: "North", property: "Shopping Centre", terminal: "N/A" },
  { id: "S003", name: "Heathrow T5", format: "Airport", channel: "Direct", region: "London", property: "Train Station", terminal: "T5" },
  { id: "S004", name: "Birmingham New St", format: "Travel", channel: "Franchise", region: "Midlands", property: "Train Station", terminal: "N/A" },
  { id: "S005", name: "Edinburgh Princes St", format: "High Street", channel: "Direct", region: "Scotland", property: "Standalone", terminal: "N/A" },
  { id: "S006", name: "Gatwick North", format: "Airport", channel: "Direct", region: "South East", property: "Shopping Centre", terminal: "N/A" },
];

const MERCH_AREAS = ["Main Floor", "Section A", "Section B"];
const CATEGORIES = ["Stationery", "Electronics", "Gifts", "Books"];
const SUB_CATEGORIES = ["Writing", "Paper", "Storage", "Accessories"];
const PLANNING_GROUPS = ["Premium", "Essential", "Seasonal"];

const WEEKS = Array.from({ length: 52 }, (_, i) => `2026 W${i + 1}`);
const RULE_COLORS = ["#2563eb", "#d97706", "#059669", "#dc2626", "#7c3aed"];

const generateSystemUplift = () => {
  return WEEKS.map((week, i) => {
    const val = 1.0 + 0.1 * Math.sin((i / 52) * Math.PI * 2) + 0.05 * Math.sin((i / 8) * Math.PI * 2);
    return {
      week,
      baseline: 1.0,
      systemUplift: parseFloat(val.toFixed(2))
    };
  });
};

const INITIAL_CHART_DATA = generateSystemUplift();

// --- Components ---

export default function ManageEventUplift() {
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  
  // Store Selection Filters
  const [storeFormat, setStoreFormat] = useState("");
  const [storeChannel, setStoreChannel] = useState("");
  const [storeRegion, setStoreRegion] = useState("");
  const [storeProperty, setStoreProperty] = useState("");
  const [storeTerminal, setStoreTerminal] = useState("");

  // Product Filters
  const [merchArea, setMerchArea] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [planningGroup, setPlanningGroup] = useState("");

  const [rules, setRules] = useState<UpliftRule[]>([
    {
      id: 1,
      name: "Easter Peak",
      startWeek: "2026 W14",
      endWeek: "2026 W16",
      upliftValue: 1.15,
      type: 'absolute',
      notes: "High season multiplier",
      color: RULE_COLORS[0]
    }
  ]);

  const filteredStores = useMemo(() => {
    return MOCK_STORES.filter(s => 
      (!storeFormat || s.format === storeFormat) &&
      (!storeChannel || s.channel === storeChannel) &&
      (!storeRegion || s.region === storeRegion) &&
      (!storeProperty || s.property === storeProperty) &&
      (!storeTerminal || s.terminal === storeTerminal)
    );
  }, [storeFormat, storeChannel, storeRegion, storeProperty, storeTerminal]);

  const isProductSelectionComplete = !!(merchArea && category && subCategory && planningGroup);

  const chartData = useMemo(() => {
    if (!isProductSelectionComplete) return [];

    return INITIAL_CHART_DATA.map((data, index) => {
      const weekNum = index + 1;
      let finalIndex = data.systemUplift;
      const ruleValues: Record<string, number | null> = {};
      
      rules.forEach((rule: UpliftRule) => {
        const startMatch = rule.startWeek.match(/W(\d+)/);
        const endMatch = rule.endWeek.match(/W(\d+)/);
        const start = startMatch ? parseInt(startMatch[1]) : 1;
        const end = endMatch ? parseInt(endMatch[1]) : 52;
        
        if (weekNum >= start && weekNum <= end) {
          if (rule.type === 'absolute') {
            ruleValues[`rule_${rule.id}`] = rule.upliftValue;
            finalIndex = rule.upliftValue; 
          } else {
            ruleValues[`rule_${rule.id}`] = data.systemUplift + rule.upliftValue;
            finalIndex += rule.upliftValue;
          }
        } else {
          ruleValues[`rule_${rule.id}`] = null;
        }
      });

      return {
        ...data,
        ...ruleValues,
        finalUplift: parseFloat(finalIndex.toFixed(2))
      };
    });
  }, [rules, isProductSelectionComplete]);

  const handleAddRule = () => {
    const newId = Math.max(0, ...rules.map((r: UpliftRule) => r.id)) + 1;
    const newRule: UpliftRule = {
      id: newId,
      name: "New Event Adjustment",
      startWeek: "2026 W1",
      endWeek: "2026 W4",
      upliftValue: 1.1,
      type: 'absolute',
      color: RULE_COLORS[rules.length % RULE_COLORS.length]
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter((r: UpliftRule) => r.id !== id));
  };

  // --- Views ---

  if (!selectedStore) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Event Uplift</h1>
            <p className="text-sm text-slate-500">Select a store to define demand shaping rules</p>
          </div>

          <CompactFilterBar
            onApply={() => {}}
            onClear={() => {
              setStoreFormat("");
              setStoreChannel("");
              setStoreRegion("");
              setStoreProperty("");
              setStoreTerminal("");
            }}
            fields={[
              { id: "format", label: "Format", value: storeFormat, onChange: setStoreFormat, options: FORMATS.map(f => ({ value: f, label: f })) },
              { id: "channel", label: "Channel", value: storeChannel, onChange: setStoreChannel, options: CHANNELS.map(f => ({ value: f, label: f })) },
              { id: "region", label: "Region", value: storeRegion, onChange: setStoreRegion, options: REGIONS.map(f => ({ value: f, label: f })) },
              { id: "property", label: "Property", value: storeProperty, onChange: setStoreProperty, options: PROPERTIES.map(f => ({ value: f, label: f })) },
              { id: "terminal", label: "Terminal", value: storeTerminal, onChange: setStoreTerminal, options: TERMINALS.map(f => ({ value: f, label: f })) },
            ]}
          />

          <Card className="glass-card border shadow-lg overflow-hidden">
            <CardHeader className="py-4 px-5 border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Store className="h-4 w-4 text-indigo-600" />
                Store Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Store ID</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Store Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Format</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Channel</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Context (R/P/T)</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{store.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{store.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{store.format}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{store.channel}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          <span className="inline-flex gap-1">
                            <Badge variant="outline" className="text-[10px] py-0 h-4">{store.region}</Badge>
                            <Badge variant="outline" className="text-[10px] py-0 h-4">{store.property}</Badge>
                            <Badge variant="outline" className="text-[10px] py-0 h-4">{store.terminal}</Badge>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setSelectedStore(store)}
                          >
                            View Uplift
                            <ArrowRight className="h-3.5 w-3.5" />
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

  // Detail View
  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setSelectedStore(null)}>Manage Event Uplift</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-900 font-medium">Uplift Details</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Uplift Analysis</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedStore(null)}>
            Change Store
          </Button>
        </div>

        {/* Store Context Card */}
        <Card className="glass-card border shadow-md bg-white/50">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStore.name} ({selectedStore.id})</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedStore.region} • {selectedStore.property} • {selectedStore.terminal}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-md bg-slate-100/80 border border-slate-200">
                <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">Format</p>
                <p className="text-xs font-bold text-slate-700 leading-none">{selectedStore.format}</p>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-slate-100/80 border border-slate-200">
                <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">Channel</p>
                <p className="text-xs font-bold text-slate-700 leading-none">{selectedStore.channel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Filters */}
        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("");
            setCategory("");
            setSubCategory("");
            setPlanningGroup("");
          }}
          fields={[
            { id: "merch-area", label: "Merch Area", value: merchArea, onChange: setMerchArea, options: MERCH_AREAS.map(f => ({ value: f, label: f })) },
            { id: "category", label: "Category", value: category, onChange: setCategory, options: CATEGORIES.map(f => ({ value: f, label: f })) },
            { id: "sub-category", label: "Sub-Category", value: subCategory, onChange: setSubCategory, options: SUB_CATEGORIES.map(f => ({ value: f, label: f })) },
            { id: "planning-group", label: "Planning Group", value: planningGroup, onChange: setPlanningGroup, options: PLANNING_GROUPS.map(f => ({ value: f, label: f })) },
          ]}
        />

        {!isProductSelectionComplete ? (
          <Card className="flex flex-col items-center justify-center py-24 border-dashed border-2 bg-slate-50/50">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-slate-900">Product Hierarchy Required</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Select a complete product hierarchy to view the uplift index graph.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="glass-card border shadow-lg overflow-hidden">
              <CardHeader className="py-4 px-5 border-b border-slate-200 bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Uplift Index Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="week" fontSize={10} tickMargin={10} interval={3} stroke="#94a3b8" />
                      <YAxis fontSize={10} stroke="#94a3b8" domain={[0.5, 1.5]} ticks={[0.6, 0.8, 1.0, 1.2, 1.4]} label={{ value: 'Index', angle: -90, position: 'insideLeft', fontSize: 10, offset: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => value !== null ? value.toFixed(2) : '-'} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <ReferenceLine y={1.0} stroke="#94a3b8" strokeWidth={1} />
                      <Line name="System Uplift" type="monotone" dataKey="systemUplift" stroke="#64748b" strokeWidth={2} dot={false} />
                      {rules.map((rule: UpliftRule) => (
                        <Line key={rule.id} name={rule.name} type="stepAfter" dataKey={`rule_${rule.id}`} stroke={rule.color} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: rule.color }} connectNulls={false} />
                      ))}
                      <Line name="Adjusted Projection" type="monotone" dataKey="finalUplift" stroke="#2563eb" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="Travel" className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Policy & Target Setup</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Configure by Format</p>
                </div>
                <TabsList className="bg-slate-100/50 p-1 h-9 glass-card border">
                  {FORMATS.map(f => (
                    <TabsTrigger key={f} value={f} className="text-[11px] font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                      {f}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {FORMATS.map(format => (
                <TabsContent key={format} value={format} className="mt-0">
                  <Card className="glass-card border shadow-lg">
                    <CardHeader className="py-4 px-5 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Plus className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base font-bold">Uplift Rules ({format})</CardTitle>
                      </div>
                      <Button onClick={handleAddRule} size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5" />
                        Add Rule
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="w-full">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Rule Name</th>
                              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-slate-500">Start Week</th>
                              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-slate-500">End Week</th>
                              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-slate-500">Adjustment</th>
                              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-500">Notes</th>
                              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rules.map((rule) => (
                              <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{rule.name}</td>
                                <td className="px-4 py-3 text-center text-sm text-slate-600 tabular-nums">{rule.startWeek}</td>
                                <td className="px-4 py-3 text-center text-sm text-slate-600 tabular-nums">{rule.endWeek}</td>
                                <td className="px-4 py-3 text-center">
                                  <Badge className={cn("font-bold", rule.type === 'absolute' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
                                    {rule.type === 'absolute' ? `Set to ${rule.upliftValue}` : `+${rule.upliftValue}`}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">{rule.notes || "-"}</td>
                                <td className="px-4 py-3 text-right space-x-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit2 className="h-3.5 w-3.5 text-slate-400" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600" onClick={() => handleDeleteRule(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
}
