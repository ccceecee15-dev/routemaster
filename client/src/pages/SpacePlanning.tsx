import { Fragment, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  BookOpen,
  Droplets,
  Headphones,
  Package,
  PlugZap,
  Plus,
  Search,
  Smartphone,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  fixtureCompatibility as initialCompatibility,
  fixtureBlockAllocations,
  compatibilityFixtureExamples,
  compatibilityFixtureRules,
  fixtureTypes as initialFixtureTypes,
  fixtures as initialFixtures,
  initialAssignments,
  initialBlocks,
  initialInventory,
  initialStores,
  merchAreaCategories,
  merchAreas,
  skus,
  type FacingAssignment,
  type Fixture,
  type FixtureCompatibility,
  type FixtureType,
  type PlanningBlock,
  type PlanningSku,
  type PlanningStore,
  type StoreInventory,
} from "@/data/spacePlanning";

const screens = [
  { label: "Merchandising Blocks", path: "/space-planning/blocks" },
  { label: "Fixture Master", path: "/space-planning/fixtures" },
  { label: "Block Compatibility & Capacity", path: "/space-planning/compatibility" },
  { label: "Store Grading", path: "/space-planning/grading" },
  { label: "Space Revision", path: "/space-planning/revision" },
  { label: "Facings & Presentations", path: "/space-planning/facings" },
];
const gradeNames = ["XS", "S", "M", "L", "XL", "Mega"];
const gradeBandColors = [
  { fill: "#dbeafe", marker: "#2563eb" },
  { fill: "#bfdbfe", marker: "#1d4ed8" },
  { fill: "#e0e7ff", marker: "#4f46e5" },
  { fill: "#ccfbf1", marker: "#0f766e" },
  { fill: "#fef3c7", marker: "#b45309" },
  { fill: "#ffedd5", marker: "#c2410c" },
];
const areaName = (id: string) => merchAreas.find(area => area.id === id)?.name ?? "Unknown area";
const fixtureName = (code: string, fixtureList: Fixture[] = initialFixtures) => fixtureList.find(fixture => fixture.code === code)?.name ?? code;
const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const storeBlockEft = (storeId: string, blockId: string, inventory: StoreInventory[], compatibility: FixtureCompatibility[], fixtureList: Fixture[]) =>
  inventory.filter(row => row.storeId === storeId && row.change !== "Removed" && row.quantity > 0)
    .reduce((total, row) => {
      const servesBlock = compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === blockId);
      if (!servesBlock) return total;
      const fixtureEft = fixtureList.find(fixture => fixture.code === row.fixtureCode)?.eft ?? 0;
      const allocation = fixtureBlockAllocations.find(item => item.fixtureCode === row.fixtureCode && item.blockId === blockId);
      const fixtureBlocks = new Set(compatibility.filter(rule => rule.fixtureCode === row.fixtureCode).map(rule => rule.blockId));
      const share = allocation?.eftShare ?? (fixtureBlocks.size === 1 ? 1 : 0);
      return total + fixtureEft * share * row.quantity;
    }, 0);

function SelectField({ label, value, onChange, options, className = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">{label}</span>
      <span className="relative block">
        <select value={value} onChange={event => onChange(event.target.value)} className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
      </span>
    </label>
  );
}

function ScreenHeader({ title, description, right }: { title: string; description?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {right}
    </div>
  );
}

function Panel({ title, description, right, children }: {
  title: string; description?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm hover:shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
        <div>
          <CardTitle className="text-sm font-semibold text-slate-800">{title}</CardTitle>
          {description && <p className="mt-1 text-[11px] text-slate-500">{description}</p>}
        </div>
        {right}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function Status({ value }: { value: string }) {
  const color = value === "Active" || value === "Ready" || value === "Existing" || value === "Compatible"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : value === "Review" || value === "Changed" || value === "Added"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : value === "Removed"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-slate-50 text-slate-600";
  return <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${color}`}>{value}</Badge>;
}

function Metric({ label, value, detail, compact = false }: { label: string; value: string; detail?: string; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-baseline gap-2 border-l border-slate-200 pl-3 first:border-0 first:pl-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-slate-900">{value}</p>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-primary pl-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
      {detail && <p className="text-[10px] text-slate-500">{detail}</p>}
    </div>
  );
}

function ModuleShell({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
          <span className="font-medium text-slate-500">Planning</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Space Planning</span>
        </div>
        {children}
      </div>
    </MainLayout>
  );
}

interface BlockEditorState {
  open: boolean;
  blockId?: string;
}

function StoreFixtureInventory({ stores, blocks, fixtureList, compatibility, inventory, setInventory, storeId, setStoreId }: {
  stores: PlanningStore[];
  blocks: PlanningBlock[];
  fixtureList: Fixture[];
  compatibility: FixtureCompatibility[];
  inventory: StoreInventory[];
  setInventory: React.Dispatch<React.SetStateAction<StoreInventory[]>>;
  storeId: string | null;
  setStoreId: (id: string | null) => void;
}) {
  const { toast } = useToast();
  const [region, setRegion] = useState("");
  const [property, setProperty] = useState("");
  const [channel, setChannel] = useState("");
  const [format, setFormat] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [fixtureType, setFixtureType] = useState(fixtureList[0]?.type ?? "");
  const [fixtureCode, setFixtureCode] = useState(fixtureList[0]?.code ?? "");
  const [quantity, setQuantity] = useState("1");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const updateHierarchy = (field: "region" | "property" | "channel" | "format", value: string) => {
    const next = { region, property, channel, format, [field]: value };
    if (next.property && !stores.some(store => store.region === next.region && store.property === next.property)) next.property = "";
    if (next.channel && !stores.some(store =>
      (!next.region || store.region === next.region)
      && (!next.property || store.property === next.property)
      && store.channel === next.channel
    )) {
      next.channel = "";
    }
    if (next.format && !stores.some(store =>
      (!next.region || store.region === next.region)
      && (!next.property || store.property === next.property)
      && (!next.channel || store.channel === next.channel)
      && store.format === next.format
    )) next.format = "";
    setRegion(next.region);
    setProperty(next.property);
    setChannel(next.channel);
    setFormat(next.format);
  };

  const propertyStores = stores.filter(store => !region || store.region === region);
  const channelStores = stores.filter(store =>
    (!region || store.region === region) && (!property || store.property === property)
  );
  const formatStores = stores.filter(store =>
    (!region || store.region === region)
    && (!property || store.property === property)
    && (!channel || store.channel === channel)
  );
  const visibleStores = stores.filter(store =>
    (!region || store.region === region)
    && (!property || store.property === property)
    && (!channel || store.channel === channel)
    && (!format || store.format === format)
    && (!search.trim() || `${store.id} ${store.name}`.toLowerCase().includes(search.trim().toLowerCase()))
  );
  const selectedStore = stores.find(store => store.id === storeId);
  const storeAssignments = inventory.filter(row => row.storeId === storeId && row.change !== "Removed");
  const visibleAssignments = selectedBlockId
    ? storeAssignments.filter(row => compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === selectedBlockId))
    : storeAssignments;
  const availableTypes = Array.from(new Set(fixtureList.map(fixture => fixture.type))).sort();
  const fixturesOfType = fixtureList.filter(fixture => fixture.type === fixtureType);
  const selectedFixture = fixturesOfType.find(fixture => fixture.code === fixtureCode) ?? fixturesOfType[0];
  const getBlockShare = (code: string, blockId: string) => {
    const compatibleBlocks = new Set(compatibility.filter(rule => rule.fixtureCode === code).map(rule => rule.blockId));
    if (!compatibleBlocks.has(blockId)) return 0;
    const configured = fixtureBlockAllocations.find(allocation => allocation.fixtureCode === code && allocation.blockId === blockId);
    if (configured) return configured.eftShare;
    return compatibleBlocks.size === 1 && compatibleBlocks.has(blockId) ? 1 : 0;
  };
  const assignedEft = (rows: StoreInventory[]) => rows.reduce((total, row) =>
    total + row.quantity * (fixtureList.find(fixture => fixture.code === row.fixtureCode)?.eft ?? 0), 0);

  const resetFilters = () => {
    setRegion("");
    setProperty("");
    setChannel("");
    setFormat("");
    setSearch("");
  };
  const addFixtureAssignment = () => {
    const parsedQuantity = Number(quantity);
    if (!selectedStore || !selectedFixture || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      toast({ title: "Check the fixture assignment", description: "Select a fixture definition and enter a whole quantity of at least 1.", variant: "destructive" });
      return;
    }
    if (editingAssignmentId) {
      setInventory(previous => previous.map(row => row.id === editingAssignmentId
        ? { ...row, fixtureCode: selectedFixture.code, quantity: parsedQuantity, change: row.change === "Existing" ? "Added" : row.change }
        : row));
      toast({ title: "Fixture assignment updated", description: `${selectedFixture.name} is assigned to Store ${selectedStore.id}.` });
    } else {
      setInventory(previous => [...previous, {
        id: `inv-${Date.now()}-${previous.length + 1}`,
        storeId: selectedStore.id,
        fixtureCode: selectedFixture.code,
        quantity: parsedQuantity,
        change: "Added",
      }]);
      toast({ title: "Fixture assigned", description: `${parsedQuantity} × ${selectedFixture.name} added to Store ${selectedStore.id}.` });
    }
    setAddOpen(false);
    setEditingAssignmentId(null);
    setQuantity("1");
  };
  const openEditAssignment = (row: StoreInventory) => {
    const fixture = fixtureList.find(item => item.code === row.fixtureCode);
    if (!fixture) {
      toast({ title: "Fixture definition not found", description: `Could not edit assignment ${row.id}.`, variant: "destructive" });
      return;
    }
    setEditingAssignmentId(row.id);
    setFixtureType(fixture.type);
    setFixtureCode(fixture.code);
    setQuantity(String(row.quantity));
    setAddOpen(true);
  };
  const confirmRemove = () => {
    if (!removeId) return;
    setInventory(previous => previous.filter(row => row.id !== removeId));
    setRemoveId(null);
    toast({ title: "Fixture assignment removed", description: "The store fixture assignments have been updated for this prototype." });
  };

  if (!selectedStore) {
    return (
      <div className="space-y-3">
        <ScreenHeader title="Store Fixture Assignments" description="Filter the store hierarchy, then open a store to manage its fixture assignments." />
        <div className="grid items-end gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(120px,1fr))_minmax(190px,1.4fr)_auto]">
          <SelectField label="REGION" value={region} onChange={value => updateHierarchy("region", value)} options={[{ value: "", label: "All regions" }, ...Array.from(new Set(stores.map(store => store.region))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="PROPERTY" value={property} onChange={value => updateHierarchy("property", value)} options={[{ value: "", label: "All properties" }, ...Array.from(new Set(propertyStores.map(store => store.property))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="CHANNEL" value={channel} onChange={value => updateHierarchy("channel", value)} options={[{ value: "", label: "All channels" }, ...Array.from(new Set(channelStores.map(store => store.channel))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="FORMAT" value={format} onChange={value => updateHierarchy("format", value)} options={[{ value: "", label: "All formats" }, ...Array.from(new Set(formatStores.map(store => store.format))).sort().map(value => ({ value, label: value }))]} />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">SEARCH STORES</span>
            <span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Store number or name" className="h-9 pl-8 text-xs" /></span>
          </label>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-xs"><X className="h-3.5 w-3.5" /> Clear filters</Button>
        </div>
        <Panel title="Stores" description={`${visibleStores.length} of ${stores.length} stores`}>
          <Table className="text-xs">
            <TableHeader><TableRow>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Store number</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Store name</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Region</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Property</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Channel</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Format</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Fixtures</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Total fixture EFT</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {visibleStores.map(store => {
                const assignments = inventory.filter(row => row.storeId === store.id && row.change !== "Removed");
                const fixtureCount = assignments.reduce((total, row) => total + row.quantity, 0);
                return <TableRow key={store.id} className="hover:bg-slate-50">
                  <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{store.id}</TableCell>
                  <TableCell className="px-3 py-2 font-medium text-slate-800">{store.name}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.region}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.property}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.channel}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.format}</TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{formatNumber(fixtureCount)}</TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{assignedEft(assignments).toFixed(1)} EFT</TableCell>
                  <TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[10px] text-primary" onClick={() => setStoreId(store.id)}>View Fixtures <ArrowRight className="h-3 w-3" /></Button></TableCell>
                </TableRow>;
              })}
              {!visibleStores.length && <TableRow><TableCell colSpan={9} className="h-16 text-center text-xs text-slate-500">No stores match these filters. Try changing or clearing your selections.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button type="button" onClick={() => setStoreId(null)} className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"><ChevronRight className="h-3 w-3 rotate-180" /> Store Fixture Assignments</button>
          <ScreenHeader title={`Store ${selectedStore.id} — ${selectedStore.name}`} description={`${selectedStore.region} · ${selectedStore.property} · ${selectedStore.channel} · ${selectedStore.format}`} />
        </div>
        <Button size="sm" onClick={() => { setEditingAssignmentId(null); setQuantity("1"); setAddOpen(true); }} className="h-9 gap-1.5 bg-primary text-xs hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Fixture</Button>
      </div>

      <Panel title="Fixture assignments" description={`${visibleAssignments.reduce((total, row) => total + row.quantity, 0)} fixture instances · ${selectedBlockId ? "EFT reflects allocation to the selected block" : "EFT reflects total physical fixture area"}`} right={<SelectField label="MERCHANDISING BLOCK" value={selectedBlockId} onChange={setSelectedBlockId} options={[{ value: "", label: "All merchandising blocks" }, ...blocks.map(block => ({ value: block.id, label: block.name }))]} className="w-52" />}>
        <Table className="text-xs">
          <TableHeader><TableRow>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture type</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture subtype</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture code</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Quantity</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Physical EFT / fixture</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">{selectedBlockId ? `EFT · ${blocks.find(block => block.id === selectedBlockId)?.name ?? "selected block"}` : "Total physical EFT"}</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Status</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {visibleAssignments.map(row => {
              const fixture = fixtureList.find(item => item.code === row.fixtureCode);
              if (!fixture) return null;
              const totalEft = fixture.eft * row.quantity * (selectedBlockId ? getBlockShare(row.fixtureCode, selectedBlockId) : 1);
              return <TableRow key={row.id}>
                <TableCell className="px-3 py-2 text-slate-700">{fixture.type}</TableCell>
                <TableCell className="px-3 py-2 font-medium text-slate-800">{fixture.subtype || fixture.name}</TableCell>
                <TableCell className="px-3 py-2 font-mono text-[11px] text-primary">{fixture.code}</TableCell>
                <TableCell className="px-3 py-2 text-right"><Input type="number" min="1" step="1" value={row.quantity} onChange={event => {
                  const nextQuantity = Math.max(1, Math.floor(Number(event.target.value) || 1));
                  setInventory(previous => previous.map(item => item.id === row.id ? { ...item, quantity: nextQuantity, change: item.change === "Existing" ? "Added" : item.change } : item));
                }} className="ml-auto h-7 w-16 text-center text-xs" aria-label={`Quantity of ${fixture.name} at Store ${selectedStore.id}`} /></TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft.toFixed(1)} EFT</TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums font-medium text-slate-800">{totalEft.toFixed(1)} EFT</TableCell>
                <TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell>
                <TableCell className="px-3 py-2 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => openEditAssignment(row)} className="h-7 gap-1 px-2 text-[10px] text-primary hover:text-primary">Edit</Button><Button variant="ghost" size="sm" onClick={() => setRemoveId(row.id)} className="h-7 gap-1 px-2 text-[10px] text-slate-500 hover:text-slate-700"><Trash2 className="h-3.5 w-3.5" /> Remove</Button></div></TableCell>
              </TableRow>;
            })}
            {!visibleAssignments.length && <TableRow><TableCell colSpan={8} className="h-16 text-center text-xs text-slate-500">{selectedBlockId ? "No fixture assignments for this store are compatible with the selected block." : "No fixture assignments for this store. Use Add Fixture to assign a catalogue definition."}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) setEditingAssignmentId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingAssignmentId ? "Edit fixture assignment" : `Add fixture to Store ${selectedStore.id}`}</DialogTitle><DialogDescription className="text-xs">Select an individually assignable definition from the Fixture Catalogue and enter the number present in this store.</DialogDescription></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="FIXTURE TYPE" value={fixtureType} onChange={value => {
              setFixtureType(value);
              setFixtureCode(fixtureList.find(fixture => fixture.type === value)?.code ?? "");
            }} options={availableTypes.map(value => ({ value, label: value }))} />
            <SelectField label="FIXTURE SUBTYPE / DEFINITION" value={selectedFixture?.code ?? ""} onChange={setFixtureCode} options={fixturesOfType.map(fixture => ({ value: fixture.code, label: `${fixture.subtype || fixture.name} · ${fixture.code}` }))} />
            <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-600">QUANTITY</span><Input type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} className="h-9 text-xs" /></label>
          </div>
          {selectedFixture && <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-800">{selectedFixture.name} <span className="font-mono font-normal text-primary">{selectedFixture.code}</span></p>
            <p className="mt-1 text-[10px] text-slate-600">Dimensions: {selectedFixture.dimensions || "Not specified"} · EFT per fixture: {selectedFixture.eft.toFixed(1)} · Status: {selectedFixture.status}</p>
            <p className="mt-1 text-[10px] text-slate-500">Compatible blocks: {Array.from(new Set(compatibility.filter(rule => rule.fixtureCode === selectedFixture.code).map(rule => blocks.find(block => block.id === rule.blockId)?.name).filter((name): name is string => Boolean(name)))).join(", ") || "No block compatibility configured"}</p>
            <p className="mt-1 text-[10px] text-slate-500">EFT is physical space. Any block-level allocation uses the configured fixture-to-block share.</p>
          </div>}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button><Button size="sm" disabled={!selectedFixture} onClick={addFixtureAssignment} className="bg-primary hover:bg-primary/90">{editingAssignmentId ? "Save assignment" : `Add to Store ${selectedStore.id}`}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(removeId)} onOpenChange={open => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove fixture assignment?</AlertDialogTitle><AlertDialogDescription className="text-xs">This removes the selected fixture assignment from Store {selectedStore.id}. This prototype change is held in frontend state only.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep assignment</AlertDialogCancel><AlertDialogAction onClick={confirmRemove} className="bg-rose-600 text-white hover:bg-rose-700">Remove assignment</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MerchandisingBlocks({ blocks, setBlocks }: {
  blocks: PlanningBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<PlanningBlock[]>>;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [areaFilter, setAreaFilter] = useState("Any area count");
  const [editor, setEditor] = useState<BlockEditorState>({ open: false });
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const areaResultLimit = 12;

  const assignedIds = new Set(blocks.flatMap(block => block.areaIds));
  const filteredBlocks = blocks.filter(block => {
    const text = `${block.name} ${block.code} ${block.areaIds.map(areaName).join(" ")}`.toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    if (status !== "All statuses" && block.status !== status) return false;
    if (areaFilter === "Single area" && block.areaIds.length !== 1) return false;
    if (areaFilter === "Multiple areas" && block.areaIds.length < 2) return false;
    return true;
  });
  const editBlock = blocks.find(block => block.id === editor.blockId);
  const subcategories = Array.from(new Set(
    merchAreas.filter(area => area.category === categoryFilter).map(area => area.subcategory),
  )).sort();
  const areaResults = merchAreas.filter(area => {
    const queryMatch = `${area.name} ${area.code}`.toLowerCase().includes(areaSearch.trim().toLowerCase());
    const categoryMatch = !categoryFilter || area.category === categoryFilter;
    const subcategoryMatch = !subcategoryFilter || subcategoryFilter === "All subcategories" || area.subcategory === subcategoryFilter;
    return queryMatch && categoryMatch && subcategoryMatch;
  });
  const shouldShowAreaResults = Boolean(areaSearch.trim()) || Boolean(categoryFilter && subcategoryFilter);
  const visibleAreaResults = areaResults.slice(0, areaResultLimit);
  const searchScope = !categoryFilter
    ? "All categories"
    : subcategoryFilter === "All subcategories"
      ? `${categoryFilter} · all subcategories`
      : `${categoryFilter} · ${subcategoryFilter}`;

  const openEditor = (block?: PlanningBlock, initialArea?: string) => {
    setName(block?.name ?? "");
    setCode(block?.code ?? `BLK-${String(blocks.length + 1).padStart(3, "0")}`);
    setSelectedAreas(block ? [...block.areaIds] : initialArea ? [initialArea] : []);
    setAreaSearch("");
    setCategoryFilter("");
    setSubcategoryFilter("");
    setEditor({ open: true, blockId: block?.id });
  };

  const saveBlock = () => {
    if (!name.trim() || !code.trim()) {
      toast({ title: "Block details required", description: "Enter a block name and code before saving.", variant: "destructive" });
      return;
    }
    if (!selectedAreas.length) {
      toast({ title: "Select merchandise areas", description: "A block must include at least one merchandise area.", variant: "destructive" });
      return;
    }
    const id = editor.blockId ?? `block-${Date.now()}`;
    setBlocks(previous => previous.map(block => ({ ...block, areaIds: block.id !== id ? block.areaIds.filter(area => !selectedAreas.includes(area)) : block.areaIds })));
    setBlocks(previous => editor.blockId
      ? previous.map(block => block.id === id ? { ...block, name: name.trim(), code: code.trim(), areaIds: selectedAreas } : block)
      : [...previous, { id, name: name.trim(), code: code.trim(), areaIds: selectedAreas, status: "Draft" }]);
    setEditor({ open: false });
    toast({ title: editor.blockId ? "Block updated" : "Block created", description: `${name.trim()} now contains ${selectedAreas.length} merchandise area${selectedAreas.length === 1 ? "" : "s"}.` });
  };

  const toggleArea = (id: string) => setSelectedAreas(previous => previous.includes(id) ? previous.filter(areaId => areaId !== id) : [...previous, id]);
  return (
    <>
      <div className="space-y-4">
        <ScreenHeader title="Merchandising Blocks" right={<Button size="sm" onClick={() => openEditor()} className="h-8 gap-2 bg-primary text-xs hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create block</Button>} />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 pb-3">
          <Metric compact label="Planning blocks" value={String(blocks.length)} />
          <Metric compact label="Areas grouped" value={`${assignedIds.size} / ${merchAreas.length}`} />
          <Metric compact label="Areas ungrouped" value={String(merchAreas.length - assignedIds.size)} />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-56 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH BLOCKS / AREAS</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Block name, code or merchandise area" className="h-8 pl-8 text-xs" /></span></label>
          <SelectField label="STATUS" value={status} onChange={setStatus} options={["All statuses", "Active", "Draft", "Review"].map(value => ({ value, label: value }))} className="w-40" />
          <SelectField label="AREA MEMBERSHIP" value={areaFilter} onChange={setAreaFilter} options={["Any area count", "Single area", "Multiple areas"].map(value => ({ value, label: value }))} className="w-44" />
        </div>
        <Panel title="Block register">
          <Table className="text-xs">
            <TableHeader><TableRow><TableHead className="h-9 px-3 text-[10px] tracking-wide">Block code</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Block name</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Associated merchandise areas</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Area count</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Status</TableHead><TableHead className="h-9 w-16 px-2 text-right text-[10px] tracking-wide">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredBlocks.map(block => <TableRow key={block.id}>
                <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{block.code}</TableCell>
                <TableCell className="px-3 py-2 font-medium text-slate-800">{block.name}</TableCell>
                <TableCell className="px-3 py-2"><div className="flex max-h-20 max-w-xl flex-wrap gap-1 overflow-y-auto">{block.areaIds.map(id => <span key={id} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">{areaName(id)}</span>)}</div></TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{block.areaIds.length}</TableCell>
                <TableCell className="px-3 py-2"><Status value={block.status} /></TableCell>
                <TableCell className="px-2 py-2 text-right"><Button variant="ghost" size="sm" onClick={() => openEditor(block)} className="h-6 px-1.5 text-[11px] text-primary">Edit</Button></TableCell>
              </TableRow>)}
              {!filteredBlocks.length && <TableRow><TableCell colSpan={6} className="h-16 px-3 py-2 text-center text-xs text-slate-500">No blocks match the selected filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Panel>
      </div>
      <Dialog open={editor.open} onOpenChange={open => setEditor(open ? editor : { open: false })}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-slate-200 px-5 py-4">
            <DialogTitle className="text-base">{editBlock ? "Edit merchandising block" : "Create merchandising block"}</DialogTitle>
            <DialogDescription className="text-xs">Search and select merchandise areas to define this block. Each area can belong to one block.</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[66vh] gap-0 overflow-hidden md:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-3 overflow-y-auto p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Block name</span><Input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Beverage Block" className="h-9 text-xs" /></label>
                <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Block code</span><Input value={code} onChange={event => setCode(event.target.value)} className="h-9 font-mono text-xs" /></label>
              </div>
              <label className="block"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH MERCHANDISE AREA NAME OR CODE</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={areaSearch} onChange={event => setAreaSearch(event.target.value)} placeholder={`Search ${merchAreas.length} areas...`} className="h-8 pl-8 text-xs" /></span></label>
              <div className="grid gap-2 sm:grid-cols-2">
                <SelectField label="CATEGORY" value={categoryFilter} onChange={value => { setCategoryFilter(value); setSubcategoryFilter(""); }} options={[{ value: "", label: "All categories" }, ...merchAreaCategories.map(value => ({ value, label: value }))]} />
                {categoryFilter && <SelectField label="SUBCATEGORY" value={subcategoryFilter} onChange={setSubcategoryFilter} options={[{ value: "", label: "Choose subcategory" }, { value: "All subcategories", label: "All subcategories" }, ...subcategories.map(value => ({ value, label: value }))]} />}
              </div>
              <p className="text-[10px] text-slate-500">Search scope: <span className="font-medium text-slate-700">{searchScope}</span></p>
              {shouldShowAreaResults ? <div className="overflow-hidden rounded-md border border-slate-200" aria-label={`${areaResults.length} merchandise area results`}>
                <div className="max-h-64 overflow-auto">
                  {visibleAreaResults.map(area => {
                    const owner = blocks.find(block => block.id !== editor.blockId && block.areaIds.includes(area.id));
                    return <label key={area.id} className={`flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0 ${owner ? "cursor-not-allowed bg-slate-50/70" : "cursor-pointer hover:bg-slate-50"}`}>
                      <Checkbox checked={selectedAreas.includes(area.id)} disabled={Boolean(owner)} onCheckedChange={() => toggleArea(area.id)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-700">{area.name} <span className="font-mono text-[10px] font-normal text-slate-400">{area.code}</span></span>
                        <span className="block truncate text-[10px] text-slate-400">{area.category} / {area.subcategory}</span>
                      </span>
                      {owner && <span className="shrink-0 text-[10px] text-slate-500">In {owner.name}</span>}
                    </label>;
                  })}
                  {!areaResults.length && <p className="p-5 text-center text-xs text-slate-500">No merchandise areas match this search and hierarchy.</p>}
                </div>
                {areaResults.length > areaResultLimit && <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">Showing {areaResultLimit} of {areaResults.length}. Refine your search or hierarchy filters.</p>}
              </div> : <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">Choose a category, then a subcategory to browse areas, or search across all categories.</p>}
            </div>
            <aside className="overflow-y-auto border-t border-slate-200 bg-slate-50/70 p-4 md:border-l md:border-t-0">
              <div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-800">Selected areas</h3><span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{selectedAreas.length}</span></div>
              <div className="mt-3 space-y-1.5">
                {selectedAreas.map(id => {
                  const area = merchAreas.find(item => item.id === id);
                  return <div key={id} className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2.5 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-slate-700">{area?.name ?? areaName(id)} <span className="font-mono text-[10px] text-slate-400">{area?.code}</span></span>
                      {area && <span className="block truncate text-[10px] text-slate-400">{area.category} / {area.subcategory}</span>}
                    </span>
                    <button aria-label={`Remove ${area?.name ?? areaName(id)}`} onClick={() => toggleArea(id)} className="shrink-0 text-slate-400 hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                  </div>;
                })}
                {!selectedAreas.length && <p className="rounded border border-dashed border-slate-300 p-3 text-center text-[11px] text-slate-400">Choose areas from the list.</p>}
              </div>
            </aside>
          </div>
          <DialogFooter className="border-t border-slate-200 bg-white px-5 py-3">
            <Button variant="outline" size="sm" onClick={() => setEditor({ open: false })}>Cancel</Button>
            <Button size="sm" onClick={saveBlock} className="bg-primary hover:bg-primary/90">{editBlock ? "Save block" : "Create block"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BlockCompatibility({ blocks, fixtureList, compatibility, setCompatibility }: {
  blocks: PlanningBlock[];
  fixtureList: Fixture[];
  compatibility: FixtureCompatibility[];
  setCompatibility: React.Dispatch<React.SetStateAction<FixtureCompatibility[]>>;
}) {
  const [view, setView] = useState<"block" | "fixture">("block");
  const [blockId, setBlockId] = useState("");
  const [fixtureCode, setFixtureCode] = useState("");
  const [query, setQuery] = useState("");
  const [fixtureSearch, setFixtureSearch] = useState("");
  const [blockSearch, setBlockSearch] = useState("");
  const [fixtureTypeFilter, setFixtureTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedFixtureSearch = fixtureSearch.trim().toLowerCase();
  const normalizedBlockSearch = blockSearch.trim().toLowerCase();
  const compatibilityFixtures = [
    ...fixtureList,
    ...compatibilityFixtureExamples.filter(example => !fixtureList.some(fixture => fixture.code === example.code)),
  ];
  const selectedBlock = blocks.find(block => block.id === blockId);
  const selectedFixture = compatibilityFixtures.find(fixture => fixture.code === fixtureCode);
  const blockMatches = blocks.filter(block => `${block.name} ${block.code}`.toLowerCase().includes(normalizedQuery));
  const rulesFor = (code: string, id: string) => compatibility.filter(rule => rule.fixtureCode === code && rule.blockId === id);
  const compatible = (code: string, id: string) => rulesFor(code, id).length > 0;
  const fixturesAssigned = (id: string) => new Set(
    compatibility
      .filter(rule => rule.blockId === id && compatibilityFixtures.some(fixture => fixture.code === rule.fixtureCode))
      .map(rule => rule.fixtureCode)
  ).size;
  const slotsFor = (code: string, id: string) => {
    const rules = rulesFor(code, id);
    return rules.length ? rules.reduce((total, rule) => total + rule.slots, 0) : null;
  };
  const fixtureTypes = Array.from(new Set(compatibilityFixtures.map(fixture => fixture.type))).sort();
  const matchingFixtures = compatibilityFixtures.filter(fixture =>
    (!fixtureTypeFilter || fixture.type === fixtureTypeFilter)
    && (!normalizedQuery || `${fixture.type} ${fixture.name} ${fixture.subtype} ${fixture.code}`.toLowerCase().includes(normalizedQuery))
    && (!selectedBlock || (view !== "block" || statusFilter === "All"
      || (statusFilter === "Compatible" ? compatible(fixture.code, selectedBlock.id) : !compatible(fixture.code, selectedBlock.id))))
  );
  const matchingBlocks = blocks.filter(block =>
    (!normalizedBlockSearch || `${block.name} ${block.code}`.toLowerCase().includes(normalizedBlockSearch))
    && (statusFilter === "All" || (statusFilter === "Compatible" ? compatible(fixtureCode, block.id) : !compatible(fixtureCode, block.id)))
  );
  const toggleCompatibility = (code: string, id: string, enabled: boolean) => {
    const block = blocks.find(item => item.id === id);
    if (!block) return;
    const seed = Array.from(`${code}-${id}`).reduce((total, character) => total + character.charCodeAt(0), 0);
    setCompatibility(previous => {
      const current = previous.some(rule => rule.fixtureCode === code && rule.blockId === id);
      if (current === enabled) return previous;
      if (!enabled) return previous.filter(rule => !(rule.fixtureCode === code && rule.blockId === id));
      return [...previous, ...block.areaIds.map((areaId, index) => ({
        fixtureCode: code,
        blockId: id,
        areaId,
        slots: 16 + ((seed + index * 5) % 29),
        status: "Active" as const,
      }))];
    });
  };
  const renderRow = (fixture: Fixture, block: PlanningBlock) => {
    const isCompatible = compatible(fixture.code, block.id);
    const slotCount = slotsFor(fixture.code, block.id);
    return <TableRow key={`${fixture.code}-${block.id}`}>
      <TableCell className="px-3 py-2 text-slate-600">{fixture.type}</TableCell>
      <TableCell className="px-3 py-2"><div className="font-medium text-slate-800">{fixture.name}</div>{fixture.subtype && <div className="text-[10px] text-slate-500">{fixture.subtype}</div>}</TableCell>
      <TableCell className="px-3 py-2 font-mono text-[11px] text-primary">{fixture.code}</TableCell>
      <TableCell className="px-3 py-2"><Checkbox checked={isCompatible} aria-label={`${fixture.name} compatible with ${block.name}`} onCheckedChange={checked => toggleCompatibility(fixture.code, block.id, checked === true)} /></TableCell>
      <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft.toFixed(1)}</TableCell>
      <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{slotCount === null ? "—" : formatNumber(slotCount)}</TableCell>
    </TableRow>;
  };
  const tableHeader = <TableHeader><TableRow>
    <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture Type</TableHead>
    <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture Name / Subtype</TableHead>
    <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture Code</TableHead>
    <TableHead className="h-9 px-3 text-[10px] tracking-wide">Compatibility</TableHead>
    <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Physical EFT</TableHead>
    <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Facing Slots</TableHead>
  </TableRow></TableHeader>;

  return (
    <div className="space-y-4">
      <ScreenHeader title="Block Compatibility & Capacity" description="Review fixture relationships by merchandising block or fixture. Facing slots are sample values; EFT is physical space." />
      <div role="group" aria-label="Relationship view" className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
        <button type="button" aria-pressed={view === "block"} onClick={() => { setView("block"); setFixtureTypeFilter(""); setStatusFilter("All"); setQuery(""); setFixtureSearch(""); setBlockSearch(""); }} className={`rounded px-3 py-1.5 text-[11px] font-medium ${view === "block" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>By Merchandising Block</button>
        <button type="button" aria-pressed={view === "fixture"} onClick={() => { setView("fixture"); setFixtureTypeFilter(""); setStatusFilter("All"); setQuery(""); setFixtureSearch(""); setBlockSearch(""); setFixtureCode(compatibilityFixtures[0]?.code ?? ""); }} className={`rounded px-3 py-1.5 text-[11px] font-medium ${view === "fixture" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>By Fixture</button>
      </div>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
        {view === "fixture" ? <>
          <label className="min-w-52 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH FIXTURES</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={fixtureSearch} onChange={event => { const value = event.target.value; setFixtureSearch(value); const filtered = compatibilityFixtures.filter(fixture => !value.trim() || `${fixture.type} ${fixture.name} ${fixture.subtype} ${fixture.code}`.toLowerCase().includes(value.trim().toLowerCase())); if (!filtered.some(fixture => fixture.code === fixtureCode)) setFixtureCode(filtered[0]?.code ?? ""); }} placeholder="Fixture name, type or code" className="h-8 pl-8 text-xs" /></span></label>
          <SelectField label="FIXTURE" value={fixtureCode} onChange={setFixtureCode} options={compatibilityFixtures.filter(fixture => !normalizedFixtureSearch || `${fixture.type} ${fixture.name} ${fixture.subtype} ${fixture.code}`.toLowerCase().includes(normalizedFixtureSearch)).map(fixture => ({ value: fixture.code, label: `${fixture.type} · ${fixture.name} (${fixture.code})` }))} className="w-72" />
          <label className="min-w-44 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH BLOCKS</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={blockSearch} onChange={event => setBlockSearch(event.target.value)} placeholder="Block name or code" className="h-8 pl-8 text-xs" /></span></label>
        </> : <label className="min-w-52 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH {selectedBlock ? "FIXTURES" : "BLOCKS"}</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={selectedBlock ? "Fixture name, type or code" : "Block name or code"} className="h-8 pl-8 text-xs" /></span></label>}
        {(view === "fixture" || selectedBlock) && <>
          {view === "block" && <SelectField label="FIXTURE TYPE" value={fixtureTypeFilter} onChange={setFixtureTypeFilter} options={[{ value: "", label: "All fixture types" }, ...fixtureTypes.map(type => ({ value: type, label: type }))]} className="w-44" />}
          <SelectField label="COMPATIBILITY" value={statusFilter} onChange={setStatusFilter} options={["All", "Compatible", "Not Compatible"].map(value => ({ value, label: value }))} className="w-40" />
        </>}
      </div>
      {view === "block" && !selectedBlock ? <Panel title="Select a merchandising block" description={`${blockMatches.length} of ${blocks.length} merchandising blocks`}>
        <Table className="text-xs"><TableHeader><TableRow>
          <TableHead className="h-9 px-3 text-[10px]">Merchandising Block</TableHead><TableHead className="h-9 px-3 text-[10px]">Code</TableHead><TableHead className="h-9 px-3 text-[10px]">Merchandise Areas</TableHead><TableHead className="h-9 px-3 text-right text-[10px]">Fixtures Assigned</TableHead><TableHead className="h-9 px-3 text-right text-[10px]">Action</TableHead>
        </TableRow></TableHeader><TableBody>
          {blockMatches.map(block => <TableRow key={block.id}><TableCell className="px-3 py-2 font-medium text-slate-800">{block.name}</TableCell><TableCell className="px-3 py-2 font-mono text-[10px] text-primary">{block.code}</TableCell><TableCell className="px-3 py-2 text-slate-600">{block.areaIds.map(areaName).join(", ")}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixturesAssigned(block.id)}</TableCell><TableCell className="px-3 py-2 text-right"><Button variant="ghost" size="sm" onClick={() => { setBlockId(block.id); setQuery(""); }} className="h-7 px-2 text-[10px] text-primary">Select block</Button></TableCell></TableRow>)}
          {!blockMatches.length && <TableRow><TableCell colSpan={5} className="h-16 text-center text-xs text-slate-500">No blocks match your search.</TableCell></TableRow>}
        </TableBody></Table>
      </Panel> : view === "block" ? <>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setBlockId(""); setQuery(""); setFixtureTypeFilter(""); setStatusFilter("All"); }} className="h-7 px-2 text-xs text-primary">← All merchandising blocks</Button>
          <span className="text-[10px] text-slate-500">{selectedBlock?.name} · {selectedBlock?.code}</span>
        </div>
        <Panel title={selectedBlock?.name ?? "Fixture compatibility"} description={`${matchingFixtures.length} fixture definitions · compatibility and facing slots are specific to this block`}>
          <Table className="text-xs">{tableHeader}<TableBody>
            {matchingFixtures.map(fixture => renderRow(fixture, selectedBlock!))}
            {!matchingFixtures.length && <TableRow><TableCell colSpan={6} className="h-16 text-center text-xs text-slate-500">No fixture definitions match these filters.</TableCell></TableRow>}
          </TableBody></Table>
        </Panel>
      </> : <Panel title={`${selectedFixture?.name ?? "Fixture"} · compatible blocks`} description={`${selectedFixture?.type ?? ""} · ${selectedFixture?.code ?? ""} · toggle a relationship to keep both views in sync`}>
        <Table className="text-xs">{tableHeader}<TableBody>
          {selectedFixture && matchingBlocks.map(block => renderRow(selectedFixture, block))}
          {!matchingBlocks.length && <TableRow><TableCell colSpan={6} className="h-16 text-center text-xs text-slate-500">No blocks match these filters.</TableCell></TableRow>}
        </TableBody></Table>
      </Panel>}
      <p className="text-[10px] text-slate-500">Facing Slots are sample values for compatible fixture–block pairs. Physical EFT is a separate space measure; no conversion is implied.</p>
    </div>
  );
}

function FixtureMaster({ blocks, fixtureList, setFixtureList, fixtureTypes, setFixtureTypes, compatibility, inventory, setInventory, setCompatFixture }: {
  blocks: PlanningBlock[];
  fixtureList: Fixture[];
  setFixtureList: React.Dispatch<React.SetStateAction<Fixture[]>>;
  fixtureTypes: FixtureType[];
  setFixtureTypes: React.Dispatch<React.SetStateAction<FixtureType[]>>;
  compatibility: FixtureCompatibility[];
  inventory: StoreInventory[];
  setInventory: React.Dispatch<React.SetStateAction<StoreInventory[]>>;
  setCompatFixture: (code: string) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [catalogView, setCatalogView] = useState<"hierarchy" | "list">("hierarchy");
  const [fixtureTypeFilter, setFixtureTypeFilter] = useState("All fixture types");
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState("All statuses");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(() => new Set(initialFixtureTypes.map(type => type.id)));
  const [sortBy, setSortBy] = useState<"code" | "name" | "type" | "dimensions" | "eft" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [addFixtureOpen, setAddFixtureOpen] = useState(false);
  const [editor, setEditor] = useState<
    | { kind: "type"; typeId?: string; name: string; status: FixtureType["status"]; mode: "group" | "standalone"; standalone: Fixture }
    | { kind: "fixture"; fixture: Fixture; isNew: boolean }
    | null
  >(null);
  const [selectedFixture, setSelectedFixture] = useState(fixtureList[0]?.code ?? "");
  const [inventoryStoreId, setInventoryStoreId] = useState<string | null>(null);

  const selectedFixtureRow = fixtureList.find(fixture => fixture.code === selectedFixture);
  const tabList = [
    ["catalog", "Fixture Catalogue"],
    ["inventory", "Store Fixture Assignments"],
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const typeName = (id?: string) => fixtureTypes.find(type => type.id === id)?.name ?? "";
  const matchesFixtureQuery = (fixture: Fixture) => `${fixture.code} ${fixture.name} ${fixture.type} ${fixture.subtype}`.toLowerCase().includes(normalizedQuery);
  const matchesFixtureFilters = (fixture: Fixture) =>
    (fixtureTypeFilter === "All fixture types" || fixture.type === fixtureTypeFilter)
    && (fixtureStatusFilter === "All statuses" || fixture.status === fixtureStatusFilter);
  const filteredFixtures = fixtureList.filter(fixture => matchesFixtureFilters(fixture) && matchesFixtureQuery(fixture)).slice().sort((first, second) => {
    const comparison = sortBy === "eft"
      ? first.eft - second.eft
      : sortBy === "type"
        ? (first.parentTypeId ? typeName(first.parentTypeId) : "").localeCompare(second.parentTypeId ? typeName(second.parentTypeId) : "")
        : first[sortBy].localeCompare(second[sortBy]);
    return sortDirection === "asc" ? comparison : -comparison;
  });
  const groupedFixtures = fixtureTypes.map(type => {
    const children = fixtureList.filter(fixture => fixture.parentTypeId === type.id);
    const typeMatchesQuery = type.name.toLowerCase().includes(normalizedQuery);
    const visibleChildren = children.filter(fixture => matchesFixtureFilters(fixture) && (!normalizedQuery || typeMatchesQuery || matchesFixtureQuery(fixture)));
    return { type, children, visibleChildren, typeMatchesQuery };
  }).filter(group =>
    (fixtureTypeFilter === "All fixture types" || group.type.name === fixtureTypeFilter)
    && (group.visibleChildren.length > 0 || Boolean(normalizedQuery && group.typeMatchesQuery) || (!normalizedQuery && fixtureStatusFilter === "All statuses")));
  const standaloneFixtures = fixtureList.filter(fixture => !fixture.parentTypeId && matchesFixtureFilters(fixture) && matchesFixtureQuery(fixture));
  const openTypeEditor = (mode: "group" | "standalone", type?: FixtureType) => {
    setAddFixtureOpen(false);
    setEditor({
      kind: "type",
      typeId: type?.id,
      name: type?.name ?? "",
      status: type?.status ?? "Active",
      mode,
      standalone: { code: "", name: "", type: "", subtype: "", dimensions: "", eft: 0, status: "Active" },
    });
  };
  const openFixtureEditor = (fixture: Fixture, isNew: boolean) => {
    setAddFixtureOpen(false);
    setEditor({ kind: "fixture", fixture: { ...fixture }, isNew });
  };
  const saveFixture = () => {
    if (!editor) return;
    if (editor.kind === "type") {
      const name = editor.name.trim();
      if (!name) {
        toast({ title: "Fixture type name is required", variant: "destructive" });
        return;
      }
      if (editor.mode === "standalone") {
        const fixture = { ...editor.standalone, name, type: name, subtype: "" };
        if (!fixture.code.trim()) {
          toast({ title: "Fixture code is required for a standalone definition", variant: "destructive" });
          return;
        }
        if (fixtureList.some(existing => existing.code.toLowerCase() === fixture.code.trim().toLowerCase())) {
          toast({ title: "Fixture code already exists", description: "Use a unique fixture code.", variant: "destructive" });
          return;
        }
        if (!Number.isFinite(fixture.eft) || fixture.eft < 0) {
          toast({ title: "Enter a valid EFT value", variant: "destructive" });
          return;
        }
        setFixtureList(previous => [...previous, fixture]);
        setSelectedFixture(fixture.code.trim());
        setCompatFixture(fixture.code.trim());
        setEditor(null);
        toast({ title: "Standalone fixture created", description: `${name} is ready to use.` });
        return;
      }
      if (fixtureTypes.some(type => type.id !== editor.typeId && type.name.toLowerCase() === name.toLowerCase())) {
        toast({ title: "Fixture type already exists", description: "Choose a unique fixture type name.", variant: "destructive" });
        return;
      }
      if (editor.typeId) {
        const previousTypeName = fixtureTypes.find(type => type.id === editor.typeId)?.name;
        setFixtureTypes(previous => previous.map(type => type.id === editor.typeId ? { ...type, name, status: editor.status } : type));
        setFixtureList(previous => previous.map(fixture => fixture.parentTypeId === editor.typeId ? { ...fixture, type: name } : fixture));
        if (previousTypeName && fixtureTypeFilter === previousTypeName) setFixtureTypeFilter(name);
      } else {
        const id = `fixture-type-${Date.now()}`;
        setFixtureTypes(previous => [...previous, { id, name, status: editor.status }]);
        setExpandedTypes(previous => new Set(previous).add(id));
      }
      setEditor(null);
      toast({ title: editor.typeId ? "Fixture type updated" : "Fixture type created", description: `${name} has been saved.` });
      return;
    }

    const fixture = editor.fixture;
    if (!fixture.name.trim() || !fixture.code.trim()) {
      toast({ title: "Fixture name and code are required", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(fixture.eft) || fixture.eft < 0) {
      toast({ title: "Enter a valid EFT value", description: "EFT must be zero or greater.", variant: "destructive" });
      return;
    }
    if (fixture.parentTypeId && !fixtureTypes.some(type => type.id === fixture.parentTypeId)) {
      toast({ title: "Choose a valid parent fixture type", variant: "destructive" });
      return;
    }
    if (fixtureList.some(existing => existing.code.toLowerCase() === fixture.code.trim().toLowerCase() && (editor.isNew || existing.code !== fixture.code))) {
      toast({ title: "Fixture code already exists", description: "Use a unique fixture code.", variant: "destructive" });
      return;
    }
    const savedFixture: Fixture = {
      ...fixture,
      code: fixture.code.trim(),
      name: fixture.name.trim(),
      type: fixture.parentTypeId ? typeName(fixture.parentTypeId) : fixture.name.trim(),
      subtype: fixture.subtype.trim(),
    };
    setFixtureList(previous => previous.some(item => item.code === savedFixture.code)
      ? previous.map(item => item.code === savedFixture.code ? savedFixture : item)
      : [...previous, savedFixture]);
    if (savedFixture.parentTypeId) setExpandedTypes(previous => new Set(previous).add(savedFixture.parentTypeId!));
    setSelectedFixture(savedFixture.code);
    setCompatFixture(savedFixture.code);
    setEditor(null);
    toast({ title: editor.isNew ? "Fixture subtype added" : "Fixture definition updated", description: `${savedFixture.name} has been saved.` });
  };

  return (
    <>
      <div className="space-y-4">
        <ScreenHeader title="Fixture Master" description="Maintain fixture catalogue definitions and store fixture assignments." right={tab === "catalog" ? <Button size="sm" onClick={() => setAddFixtureOpen(true)} className="h-9 gap-2 bg-primary text-xs hover:bg-primary/90"><Plus className="h-4 w-4" /> Add fixture</Button> : undefined} />
        <div className="flex flex-wrap border-b border-slate-200">
          {tabList.map(([id, label]) => <button key={id} onClick={() => { setTab(id); if (id !== "catalog") setQuery(""); }} className={`border-b-2 px-3 py-2.5 text-xs font-medium ${tab === id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
        </div>
        {tab === "catalog" && <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Catalogue view" className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
              {(["hierarchy", "list"] as const).map(option => <button key={option} type="button" aria-pressed={catalogView === option} onClick={() => setCatalogView(option)} className={`rounded px-3 py-1.5 text-[11px] font-medium ${catalogView === option ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>{option === "hierarchy" ? "Hierarchy View" : "List View"}</button>)}
            </div>
            <span className="text-[10px] text-slate-500">Fixture data · EFT is physical space, not currency.</span>
          </div>
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <label className="min-w-56 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH CATALOG</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Fixture type, subtype or code" className="h-8 pl-8 text-xs" /></span></label>
            <SelectField label="FIXTURE TYPE" value={fixtureTypeFilter} onChange={setFixtureTypeFilter} options={[{ value: "All fixture types", label: "All fixture types" }, ...Array.from(new Set([...fixtureTypes.map(type => type.name), ...fixtureList.map(fixture => fixture.type)])).sort().map(value => ({ value, label: value }))]} className="w-44" />
            <SelectField label="STATUS" value={fixtureStatusFilter} onChange={setFixtureStatusFilter} options={["All statuses", "Active", "Review"].map(value => ({ value, label: value }))} className="w-36" />
            <span className="pb-2 text-[10px] text-slate-500">{filteredFixtures.length} fixture definitions</span>
          </div>
          {catalogView === "hierarchy" ? <Panel title="Fixture catalogue" description="Types group specific fixture configurations; standalone fixtures remain top-level definitions.">
            <Table className="text-xs"><TableHeader><TableRow><TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture type / subtype</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture code</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Dimensions</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">EFT</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Status</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {groupedFixtures.map(({ type, children, visibleChildren, typeMatchesQuery }) => {
                  const expanded = expandedTypes.has(type.id) || Boolean(normalizedQuery && (typeMatchesQuery || visibleChildren.length));
                  const activeCount = children.filter(fixture => fixture.status === "Active").length;
                  const reviewCount = children.length - activeCount;
                  return <Fragment key={type.id}>
                    <TableRow className="bg-slate-50/70">
                      <TableCell className="px-3 py-2"><div className="flex items-center gap-1.5">
                        {children.length > 0 ? <button type="button" disabled={Boolean(normalizedQuery && (typeMatchesQuery || visibleChildren.length))} aria-label={`${expanded ? "Collapse" : "Expand"} ${type.name}`} aria-expanded={expanded} onClick={() => setExpandedTypes(previous => { const next = new Set(previous); if (next.has(type.id)) next.delete(type.id); else next.add(type.id); return next; })} className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-primary disabled:cursor-default">{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button> : <span className="w-5" />}
                        <span className="font-semibold text-slate-800">{type.name}</span><span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-500">Grouping · {children.length} {children.length === 1 ? "subtype" : "subtypes"}</span>
                      </div></TableCell>
                      <TableCell colSpan={3} className="px-3 py-2 text-[10px] text-slate-500">{children.length ? `${activeCount} active${reviewCount ? ` · ${reviewCount} in review` : ""}` : "No subtypes yet"}</TableCell>
                      <TableCell className="px-3 py-2"><Status value={type.status} /></TableCell>
                      <TableCell className="px-3 py-2 text-right"><div className="inline-flex gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openTypeEditor("group", type)}>Edit type</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor({ code: "", name: "", type: type.name, subtype: "", parentTypeId: type.id, dimensions: "", eft: 0, status: "Active" }, true)}>Add subtype</Button></div></TableCell>
                    </TableRow>
                    {expanded && visibleChildren.map(fixture => <TableRow key={fixture.code}>
                      <TableCell className="px-3 py-2"><div className="flex items-center gap-2 pl-7"><span className="h-4 border-l border-slate-200" /><span className="font-medium text-slate-800">{fixture.name}</span>{fixture.subtype && <span className="text-[10px] text-slate-400">{fixture.subtype}</span>}</div></TableCell>
                      <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
                    </TableRow>)}
                    {expanded && normalizedQuery && typeMatchesQuery && !visibleChildren.length && <TableRow><TableCell colSpan={6} className="py-3 pl-12 text-[10px] text-slate-500">No subtypes match the selected status filter.</TableCell></TableRow>}
                  </Fragment>;
                })}
                {standaloneFixtures.map(fixture => <TableRow key={fixture.code}>
                  <TableCell className="px-3 py-2"><span className="font-medium text-slate-800">{fixture.name}</span><span className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-500">Standalone</span></TableCell><TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
                </TableRow>)}
                {!groupedFixtures.length && !standaloneFixtures.length && <TableRow><TableCell colSpan={6} className="h-16 px-3 text-center text-xs text-slate-500">No fixture definitions match these filters.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Panel> : <Panel title="Fixture list" description="A flat list of all assignable fixture definitions, including standalone fixtures.">
            <Table className="text-xs"><TableHeader><TableRow>
              {([["code", "Fixture code"], ["name", "Fixture name"], ["type", "Parent fixture type"], ["dimensions", "Dimensions"], ["eft", "EFT"], ["status", "Status"]] as const).map(([column, label]) => <TableHead key={column} className="h-9 px-3 text-[10px] tracking-wide"><button type="button" onClick={() => { if (sortBy === column) setSortDirection(previous => previous === "asc" ? "desc" : "asc"); else { setSortBy(column); setSortDirection("asc"); } }} className="inline-flex items-center gap-1 hover:text-primary">{label}<span aria-hidden="true">{sortBy === column ? sortDirection === "asc" ? "↑" : "↓" : "↕"}</span></button></TableHead>)}
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead>
            </TableRow></TableHeader><TableBody>{filteredFixtures.map(fixture => <TableRow key={fixture.code}>
              <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 font-medium text-slate-800">{fixture.name}</TableCell><TableCell className="px-3 py-2 text-slate-600">{fixture.parentTypeId ? typeName(fixture.parentTypeId) : "—"}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
            </TableRow>)}{!filteredFixtures.length && <TableRow><TableCell colSpan={7} className="h-16 px-3 text-center text-xs text-slate-500">No fixture definitions match these filters.</TableCell></TableRow>}</TableBody></Table>
          </Panel>}
        </>}
        {tab === "inventory" && <StoreFixtureInventory
          stores={initialStores}
          blocks={blocks}
          fixtureList={fixtureList}
          compatibility={compatibility}
          inventory={inventory}
          setInventory={setInventory}
          storeId={inventoryStoreId}
          setStoreId={setInventoryStoreId}
        />}
      </div>
      <Dialog open={addFixtureOpen} onOpenChange={setAddFixtureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add to fixture catalogue</DialogTitle><DialogDescription className="text-xs">Choose whether to create a new fixture type or add a configuration to an existing type.</DialogDescription></DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" className="h-auto min-h-20 justify-start whitespace-normal p-3 text-left" onClick={() => openTypeEditor("group")}><span><span className="block text-xs font-semibold text-slate-800">Create Fixture Type</span><span className="mt-1 block text-[10px] font-normal text-slate-500">Create a grouping or a standalone fixture.</span></span></Button>
            <Button variant="outline" disabled={!fixtureTypes.length} className="h-auto min-h-20 justify-start whitespace-normal p-3 text-left" onClick={() => openFixtureEditor({ code: "", name: "", type: fixtureTypes[0]?.name ?? "", subtype: "", parentTypeId: fixtureTypes[0]?.id, dimensions: "", eft: 0, status: "Active" }, true)}><span><span className="block text-xs font-semibold text-slate-800">Add Fixture Subtype</span><span className="mt-1 block text-[10px] font-normal text-slate-500">Add a configuration to an existing type.</span></span></Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editor)} onOpenChange={open => !open && setEditor(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          {editor?.kind === "type" && <>
            <DialogHeader><DialogTitle>{editor.typeId ? "Edit fixture type" : "Create fixture type"}</DialogTitle><DialogDescription className="text-xs">A grouping contains subtypes but is not itself assignable. A standalone type creates an assignable fixture definition.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              {!editor.typeId && <div className="grid grid-cols-2 gap-2">
                {(["group", "standalone"] as const).map(mode => <button key={mode} type="button" aria-pressed={editor.mode === mode} onClick={() => setEditor(previous => previous?.kind === "type" ? { ...previous, mode } : previous)} className={`rounded-md border p-2.5 text-left ${editor.mode === mode ? "border-primary bg-primary/5" : "border-slate-200"}`}><span className="block text-xs font-semibold text-slate-800">{mode === "group" ? "Parent grouping" : "Standalone fixture"}</span><span className="mt-1 block text-[10px] text-slate-500">{mode === "group" ? "Add fixture subtypes later." : "A complete fixture with its own code and attributes."}</span></button>)}
              </div>}
              <label className="block"><span className="mb-1 block text-[11px] font-semibold text-slate-600">Fixture type name</span><Input value={editor.name} onChange={event => setEditor(previous => previous?.kind === "type" ? { ...previous, name: event.target.value } : previous)} placeholder="e.g. Cooler" className="h-9 text-xs" /></label>
              {editor.mode === "standalone" && <div className="grid gap-3 sm:grid-cols-2">
                {([
                  ["code", "Fixture code"], ["dimensions", "Dimensions"], ["eft", "EFT"],
                ] as const).map(([key, label]) => <label key={key}><span className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</span><Input type={key === "eft" ? "number" : "text"} min={key === "eft" ? "0" : undefined} step={key === "eft" ? "0.1" : undefined} value={editor.standalone[key]} onChange={event => setEditor(previous => previous?.kind === "type" ? { ...previous, standalone: { ...previous.standalone, [key]: key === "eft" ? Number(event.target.value) : event.target.value } } : previous)} className="h-9 text-xs" />{key === "code" && <span className="mt-1 block text-[10px] text-slate-500">Required to reference this fixture in other planning sections.</span>}</label>)}
                <SelectField label="STATUS" value={editor.standalone.status} onChange={value => setEditor(previous => previous?.kind === "type" ? { ...previous, standalone: { ...previous.standalone, status: value as Fixture["status"] } } : previous)} options={["Active", "Review"].map(value => ({ value, label: value }))} />
              </div>}
              {editor.mode === "group" && <SelectField label="GROUP STATUS" value={editor.status} onChange={value => setEditor(previous => previous?.kind === "type" ? { ...previous, status: value as FixtureType["status"] } : previous)} options={["Active", "Review"].map(value => ({ value, label: value }))} />}
            </div>
            <DialogFooter><Button variant="outline" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" onClick={saveFixture} className="bg-primary hover:bg-primary/90">Save type</Button></DialogFooter>
          </>}
          {editor?.kind === "fixture" && <>
            <DialogHeader><DialogTitle>{editor.isNew ? "Add fixture subtype" : "Edit fixture definition"}</DialogTitle><DialogDescription className="text-xs">{editor.fixture.parentTypeId ? `Configuration under ${typeName(editor.fixture.parentTypeId)}.` : "Standalone fixture. You may assign it to a parent fixture type."}</DialogDescription></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="PARENT FIXTURE TYPE" value={editor.fixture.parentTypeId ?? ""} onChange={value => setEditor(previous => {
                if (previous?.kind !== "fixture") return previous;
                const type = fixtureTypes.find(item => item.id === value);
                return { ...previous, fixture: { ...previous.fixture, parentTypeId: value || undefined, type: type?.name ?? previous.fixture.name } };
              })} options={[{ value: "", label: "No parent · standalone" }, ...fixtureTypes.map(type => ({ value: type.id, label: type.name }))]} className="sm:col-span-2" />
              <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Fixture subtype name</span><Input value={editor.fixture.name} onChange={event => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, name: event.target.value } } : previous)} placeholder="e.g. Cooler Wall 4S" className="h-9 text-xs" /></label>
              <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Fixture code</span><Input disabled={!editor.isNew} value={editor.fixture.code} onChange={event => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, code: event.target.value } } : previous)} className="h-9 font-mono text-xs" /><span className="mt-1 block text-[10px] text-slate-500">{editor.isNew ? "Unique code used by fixture references." : "Fixture codes are stable identifiers and cannot be changed."}</span></label>
              <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Configuration description</span><Input value={editor.fixture.subtype} onChange={event => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, subtype: event.target.value } } : previous)} className="h-9 text-xs" /></label>
              <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Dimensions</span><Input value={editor.fixture.dimensions} onChange={event => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, dimensions: event.target.value } } : previous)} className="h-9 text-xs" /></label>
              <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">EFT · physical space</span><Input type="number" min="0" step="0.1" value={editor.fixture.eft} onChange={event => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, eft: Number(event.target.value) } } : previous)} className="h-9 text-xs" /></label>
              <SelectField label="STATUS" value={editor.fixture.status} onChange={value => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, status: value as Fixture["status"] } } : previous)} options={["Active", "Review"].map(value => ({ value, label: value }))} />
            </div>
            <DialogFooter><Button variant="outline" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" onClick={saveFixture} className="bg-primary hover:bg-primary/90">Save fixture</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StoreGrading({ blocks, stores, setStores, inventory, compatibility, fixtureList, blockId, setBlockId }: {
  blocks: PlanningBlock[];
  stores: typeof initialStores;
  setStores: React.Dispatch<React.SetStateAction<typeof initialStores>>;
  inventory: StoreInventory[];
  compatibility: FixtureCompatibility[];
  fixtureList: Fixture[];
  blockId: string;
  setBlockId: (id: string) => void;
}) {
  const { toast } = useToast();
  const [formatFilter, setFormatFilter] = useState("");
  const [gradeCount, setGradeCount] = useState(3);
  const [boundaryOverrides, setBoundaryOverrides] = useState<Record<string, number[]>>({});
  const [sortBy, setSortBy] = useState<"store" | "eft" | "fixture">("store");
  const [tableSearch, setTableSearch] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const activeGrades = gradeNames.slice(0, gradeCount);
  const block = blocks.find(item => item.id === blockId);
  const scopeKey = `${blockId}:${formatFilter}`;
  const fixtureRules = compatibility.filter(rule => rule.blockId === blockId);
  const getContribution = (storeId: string, row: StoreInventory) => {
    if (row.change === "Removed" || row.quantity <= 0 || !fixtureRules.some(rule => rule.fixtureCode === row.fixtureCode)) return null;
    const fixture = fixtureList.find(item => item.code === row.fixtureCode);
    if (!fixture) return null;
    const allocation = fixtureBlockAllocations.find(item => item.fixtureCode === row.fixtureCode && item.blockId === blockId);
    const compatibleBlocks = new Set(compatibility.filter(rule => rule.fixtureCode === row.fixtureCode).map(rule => rule.blockId));
    const share = allocation?.eftShare ?? (compatibleBlocks.size === 1 ? 1 : 0);
    if (share <= 0) return null;
    const eftEach = fixture.eft * share;
    return { fixture, quantity: row.quantity, eftEach, contribution: eftEach * row.quantity, inventoryId: row.id, storeId };
  };
  const storeDetails = stores
    .filter(store => store.format === formatFilter)
    .map(store => {
      const rows = inventory.flatMap(row => row.storeId === store.id ? [getContribution(store.id, row)].filter((detail): detail is NonNullable<typeof detail> => detail !== null) : []);
      const total = rows.reduce((sum, row) => sum + row.contribution, 0);
      return { ...store, rows, total, proposed: "" };
    })
    .filter(store => store.total > 0);
  const minimumEft = storeDetails.length ? Math.min(...storeDetails.map(store => store.total)) : 0;
  const maximumEft = storeDetails.length ? Math.max(...storeDetails.map(store => store.total)) : 0;
  const range = Math.max(maximumEft - minimumEft, 0.1);
  const sliderMax = Math.max(maximumEft, minimumEft + 0.1);
  const defaultBoundaries = Array.from({ length: gradeCount - 1 }, (_, index) => Math.round((minimumEft + range * (index + 1) / gradeCount) * 10) / 10);
  const minimumGap = range >= (gradeCount - 1) * 0.1 ? 0.1 : 0;
  const boundaries: number[] = [];
  defaultBoundaries.forEach((defaultValue, index) => {
    const rawValue = boundaryOverrides[scopeKey]?.[index] ?? defaultValue;
    const lowerLimit = index === 0 ? minimumEft : boundaries[index - 1];
    boundaries.push(Math.min(sliderMax, Math.max(lowerLimit + minimumGap, rawValue)));
  });
  const proposedGrade = (eft: number) => {
    for (let index = 0; index < gradeCount - 1; index += 1) if (eft <= (boundaries[index] ?? Infinity)) return activeGrades[index];
    return activeGrades[gradeCount - 1];
  };
  const storesWithGrades = storeDetails.map(store => ({ ...store, proposed: proposedGrade(store.total) }));
  const inScopeStoreIds = new Set(storeDetails.map(store => store.id));
  const changedCount = storesWithGrades.filter(store => store.currentGradeByBlock[blockId] !== store.proposed).length;
  const gradesDistribution = activeGrades.map(grade => ({
    grade,
    count: storesWithGrades.filter(store => store.proposed === grade).length,
  }));
  const maxGradeCount = Math.max(1, ...gradesDistribution.map(item => item.count));
  const visibleRows = storesWithGrades.flatMap(store => store.rows.map(row => ({ ...row, store, proposed: store.proposed })))
    .filter(row => !tableSearch.trim() || `${row.store.id} ${row.store.name} ${row.store.format} ${row.fixture.type} ${row.fixture.name} ${row.fixture.subtype} ${row.fixture.code}`.toLowerCase().includes(tableSearch.trim().toLowerCase()))
    .sort((first, second) => sortBy === "eft"
      ? second.store.total - first.store.total || first.store.name.localeCompare(second.store.name)
      : sortBy === "fixture"
        ? first.fixture.name.localeCompare(second.fixture.name) || first.store.name.localeCompare(second.store.name)
        : first.store.name.localeCompare(second.store.name) || first.fixture.name.localeCompare(second.fixture.name));
  const histogramBins = Array.from({ length: 8 }, (_, index) => {
    const lower = minimumEft + range * index / 8;
    const upper = minimumEft + range * (index + 1) / 8;
    const count = storeDetails.filter(store => store.total >= lower && (index === 7 ? store.total <= upper : store.total < upper)).length;
    const gradeIndex = activeGrades.findIndex((_, gradeIndex) => upper <= (boundaries[gradeIndex] ?? Infinity));
    return { lower, upper, count, gradeIndex: gradeIndex < 0 ? gradeCount - 1 : gradeIndex };
  });
  const setBoundary = (index: number, rawValue: number) => {
    const lowerLimit = index === 0 ? minimumEft : boundaries[index - 1] + minimumGap;
    const upperLimit = index === gradeCount - 2 ? sliderMax : boundaries[index + 1] - minimumGap;
    const nextValue = Math.min(upperLimit, Math.max(lowerLimit, Math.round(rawValue * 10) / 10));
    setBoundaryOverrides(previous => {
      const current = [...(previous[scopeKey] ?? boundaries)];
      current[index] = nextValue;
      return { ...previous, [scopeKey]: current };
    });
    setConfirmed(false);
  };
  const setBoundaries = (values: number[]) => {
    const next = values.map(value => Math.round(value * 10) / 10);
    setBoundaryOverrides(previous => ({ ...previous, [scopeKey]: next }));
    setConfirmed(false);
  };
  const confirmGrades = () => {
    setStores(previous => previous.map(store => {
      if (!inScopeStoreIds.has(store.id)) return store;
      return {
        ...store,
        currentGradeByBlock: {
          ...store.currentGradeByBlock,
          [blockId]: proposedGrade(storeBlockEft(store.id, blockId, inventory, compatibility, fixtureList)),
        },
      };
    }));
    setConfirmed(true);
    toast({ title: "Grade proposal confirmed", description: `${block?.name} assignments updated for ${formatFilter} stores in this prototype.` });
  };

  return (
    <div className="space-y-4">
      <ScreenHeader title="Store Grading" description="Define EFT grade bands by merchandising block and store format." />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
        <SelectField label="MERCHANDISING BLOCK" value={blockId} onChange={value => { setBlockId(value); setConfirmed(false); }} options={blocks.map(item => ({ value: item.id, label: item.name }))} />
        <SelectField label="STORE FORMAT" value={formatFilter} onChange={value => { setFormatFilter(value); setConfirmed(false); }} options={[{ value: "", label: "Select a store format" }, ...Array.from(new Set(stores.map(store => store.format))).sort().map(value => ({ value, label: value }))]} />
      </div>
      {!blockId || !formatFilter ? <Panel title="Select a block and store format" description="Choose both filters to view EFT distribution, configure grade bands and review store fixture contributions."><p className="px-3 pb-3 text-xs text-slate-500">The grading workspace will appear after both selections are made.</p></Panel> : <>
        <section aria-label="EFT distribution and grade configuration" className="space-y-3">
          <Panel title="EFT distribution and grade bands" description={`${block?.name} · ${formatFilter} · ${storeDetails.length} stores carrying this block`} right={<SelectField label="ACTIVE GRADES" value={String(gradeCount)} onChange={value => { const count = Number(value); setGradeCount(count); setBoundaryOverrides(previous => ({ ...previous, [scopeKey]: (previous[scopeKey] ?? boundaries).slice(0, count - 1) })); setConfirmed(false); }} options={[1, 2, 3, 4, 5, 6].map(value => ({ value: String(value), label: `${value} grades` }))} className="w-28" />}>
            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500"><span>Minimum <strong className="ml-1 tabular-nums text-slate-700">{minimumEft.toFixed(1)} EFT</strong></span><span>Maximum <strong className="ml-1 tabular-nums text-slate-700">{maximumEft.toFixed(1)} EFT</strong></span></div>
              <div className="flex h-24 items-end gap-1 border-b border-l border-slate-200 px-2">
                {histogramBins.map((bin, index) => <div key={index} title={`${bin.lower.toFixed(1)}–${bin.upper.toFixed(1)} EFT: ${bin.count} stores`} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(bin.count ? 8 : 2, bin.count / maxGradeCount * 100)}%`, backgroundColor: bin.count ? gradeBandColors[bin.gradeIndex].marker : "#f1f5f9", opacity: bin.count ? 0.72 : 1 }} />)}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400"><span>{minimumEft.toFixed(1)} EFT</span><span>Store count by EFT range</span><span>{maximumEft.toFixed(1)} EFT</span></div>
              {gradeCount > 1 && <SliderPrimitive.Root
                aria-label="Grade EFT boundaries"
                value={boundaries}
                min={minimumEft}
                max={sliderMax}
                step={0.1}
                minStepsBetweenThumbs={minimumGap > 0 ? 1 : 0}
                onValueChange={setBoundaries}
                className="relative flex w-full touch-none select-none items-center py-2"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100">
                  {activeGrades.map((grade, index) => {
                    const lower = index === 0 ? minimumEft : boundaries[index - 1];
                    const upper = index === gradeCount - 1 ? sliderMax : boundaries[index];
                    return <span key={grade} className="absolute h-full" style={{ left: `${((lower - minimumEft) / range) * 100}%`, width: `${Math.max(0, ((upper - lower) / range) * 100)}%`, backgroundColor: gradeBandColors[index].fill }} />;
                  })}
                </SliderPrimitive.Track>
                {boundaries.map((boundary, index) => <SliderPrimitive.Thumb key={activeGrades[index]} aria-label={`${activeGrades[index]}–${activeGrades[index + 1]} EFT boundary`} className="block h-4 w-4 rounded-full border-2 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" style={{ borderColor: gradeBandColors[index + 1].marker }} />)}
              </SliderPrimitive.Root>}
              <div className="grid gap-2 border-t border-slate-100 pt-2" style={{ gridTemplateColumns: activeGrades.map((_, index) => {
                const lower = index === 0 ? minimumEft : boundaries[index - 1];
                const upper = index === gradeCount - 1 ? sliderMax : boundaries[index];
                return `${Math.max(0.08, (upper - lower) / range)}fr`;
              }).join(" ") }}>
                {activeGrades.map((grade, index) => {
                  const lower = index === 0 ? minimumEft : boundaries[index - 1];
                  const upper = index === gradeCount - 1 ? maximumEft : boundaries[index];
                  const count = gradesDistribution.find(item => item.grade === grade)?.count ?? 0;
                  return <div key={grade} className="min-w-0 space-y-1" title={`${grade}: ${lower.toFixed(1)}–${upper.toFixed(1)} EFT`}>
                    <div className="flex items-center gap-1 text-[10px]"><span className="h-2 w-2 shrink-0 rounded-sm ring-1 ring-inset ring-slate-900/10" style={{ backgroundColor: gradeBandColors[index].fill }} /><span className="font-semibold text-slate-700">{grade}</span><span className="tabular-nums text-slate-500">({count})</span></div>
                    <div className="truncate text-[9px] tabular-nums text-slate-500">{lower.toFixed(1)}–{upper.toFixed(1)} EFT</div>
                    {index < gradeCount - 1 && <label className="flex items-center gap-1 text-[9px] text-slate-500">≤<Input aria-label={`${grade}/${activeGrades[index + 1]} shared EFT boundary`} type="number" min={minimumEft} max={sliderMax} step="0.1" value={(boundaries[index] ?? minimumEft).toFixed(1)} onChange={event => setBoundary(index, Number(event.target.value))} className="h-6 w-14 px-1 text-[10px]" /></label>}
                  </div>;
                })}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[10px] text-slate-500">{changedCount} proposed grade changes in this format</span>
                <Button size="sm" disabled={!storeDetails.length} onClick={confirmGrades} className="h-7 gap-1.5 bg-primary px-2.5 text-[10px] hover:bg-primary/90"><Check className="h-3.5 w-3.5" />{confirmed ? "Confirmed" : "Confirm proposal"}</Button>
              </div>
            </div>
          </Panel>
        </section>
        <section aria-label="Store and fixture EFT detail">
          <Panel title="Store and fixture EFT detail" description="One row per store–fixture assignment. Store Total EFT is repeated for reference; fixture contribution is quantity-adjusted EFT allocated to this block." right={<div className="flex flex-wrap items-end gap-2"><label><span className="sr-only">Filter stores or fixtures</span><Input value={tableSearch} onChange={event => setTableSearch(event.target.value)} placeholder="Filter store or fixture" className="h-8 w-48 text-xs" /></label><SelectField label="" value={sortBy} onChange={value => setSortBy(value as "store" | "eft" | "fixture")} options={[{ value: "store", label: "Sort: store" }, { value: "eft", label: "Sort: highest EFT" }, { value: "fixture", label: "Sort: fixture" }]} className="w-36" /></div>}>
            <Table className="text-[11px]"><TableHeader><TableRow className="h-7">
              <TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Store Number</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Store Name</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Store Format</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Fixture Type</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Fixture Subtype</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-right text-[9px]">Qty</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-right text-[9px]">EFT / Fixture</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-right text-[9px]">Total EFT Contribution</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-right text-[9px]">Store Total EFT</TableHead><TableHead className="h-7 whitespace-nowrap px-2 py-1 text-[9px]">Assigned / Proposed Grade</TableHead>
            </TableRow></TableHeader><TableBody>
              {visibleRows.map(row => {
                const changed = row.store.currentGradeByBlock[blockId] !== row.proposed;
                return <TableRow key={row.inventoryId} className={`h-8 ${changed ? "bg-amber-50/40" : ""}`}>
                  <TableCell className="whitespace-nowrap px-2 py-1 font-mono text-[10px] text-slate-500">{row.store.id}</TableCell><TableCell className="max-w-52 truncate px-2 py-1 font-medium text-slate-800" title={row.store.name}>{row.store.name}</TableCell><TableCell className="whitespace-nowrap px-2 py-1 text-[10px] text-slate-600">{row.store.format}</TableCell><TableCell className="whitespace-nowrap px-2 py-1 text-[10px] text-slate-600">{row.fixture.type}</TableCell><TableCell className="whitespace-nowrap px-2 py-1 text-[10px] text-slate-700">{row.fixture.subtype || row.fixture.name}</TableCell><TableCell className="px-2 py-1 text-right tabular-nums text-slate-600">{row.quantity}</TableCell><TableCell className="px-2 py-1 text-right tabular-nums text-slate-600">{row.eftEach.toFixed(1)}</TableCell><TableCell className="px-2 py-1 text-right tabular-nums text-slate-700">{row.contribution.toFixed(1)}</TableCell><TableCell className="whitespace-nowrap px-2 py-1 text-right"><span className="rounded bg-slate-100 px-1 py-0.5 font-semibold tabular-nums text-slate-800">{row.store.total.toFixed(1)}</span><span className="ml-1 text-[8px] text-slate-400">total</span></TableCell><TableCell className="whitespace-nowrap px-2 py-1"><span className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[9px] text-slate-500">{row.store.currentGradeByBlock[blockId] || "—"}</span><ArrowRight className="mx-1 inline h-3 w-3 text-slate-300" /><span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${changed ? "bg-amber-100 text-amber-900" : "bg-primary/10 text-primary"}`}>{row.proposed}</span></TableCell>
                </TableRow>;
              })}
              {!visibleRows.length && <TableRow><TableCell colSpan={10} className="h-16 text-center text-xs text-slate-500">{storeDetails.length ? "No store or fixture rows match your filter." : "No stores in this format currently carry the selected merchandising block."}</TableCell></TableRow>}
            </TableBody></Table>
          </Panel>
        </section>
      </>}
    </div>
  );
}

function SpaceRevision({ blocks, blockId, setBlockId }: { blocks: PlanningBlock[]; blockId: string; setBlockId: (id: string) => void }) {
  const { toast } = useToast();
  const formats = Array.from(new Set(initialStores.map(store => store.format))).sort();
  const [storeFormat, setStoreFormat] = useState(formats[0] ?? "");
  const [grade, setGrade] = useState("XS");
  const [draft, setDraft] = useState<Record<string, number[]>>({});
  const [saved, setSaved] = useState<Record<string, number[]>>({});
  const block = blocks.find(item => item.id === blockId) ?? blocks[0];
  const areas = block?.areaIds ?? [];
  const formatGradingStructures: Record<string, { grade: string; minimumSlots: number; capacity: number }[]> = {
    Destination: [
      { grade: "XS", minimumSlots: 24, capacity: 40 },
      { grade: "S", minimumSlots: 36, capacity: 56 },
      { grade: "M", minimumSlots: 52, capacity: 80 },
      { grade: "L", minimumSlots: 68, capacity: 104 },
      { grade: "XL", minimumSlots: 84, capacity: 128 },
      { grade: "Mega", minimumSlots: 100, capacity: 160 },
    ],
    Community: [
      { grade: "XS", minimumSlots: 18, capacity: 28 },
      { grade: "S", minimumSlots: 26, capacity: 40 },
      { grade: "M", minimumSlots: 36, capacity: 56 },
      { grade: "L", minimumSlots: 48, capacity: 72 },
    ],
    Flagship: [
      { grade: "S", minimumSlots: 40, capacity: 64 },
      { grade: "M", minimumSlots: 56, capacity: 88 },
      { grade: "L", minimumSlots: 72, capacity: 112 },
      { grade: "XL", minimumSlots: 88, capacity: 136 },
      { grade: "Mega", minimumSlots: 104, capacity: 168 },
    ],
    Transit: [
      { grade: "XS", minimumSlots: 20, capacity: 32 },
      { grade: "S", minimumSlots: 30, capacity: 48 },
      { grade: "M", minimumSlots: 44, capacity: 68 },
      { grade: "L", minimumSlots: 58, capacity: 88 },
      { grade: "XL", minimumSlots: 72, capacity: 108 },
    ],
  };
  const availableGrades = formatGradingStructures[storeFormat] ?? formatGradingStructures.Destination;
  const activeGrade = availableGrades.some(item => item.grade === grade) ? grade : availableGrades[0]?.grade ?? gradeNames[0];
  const gradeConfig = availableGrades.find(item => item.grade === activeGrade) ?? { grade: activeGrade, minimumSlots: 0, capacity: 40 };
  const allocationKey = `${block?.id ?? blockId}:${storeFormat}:${activeGrade}`;
  const defaultAllocations = areas.map((_, index) => block?.id === "beverage"
    ? [40, 60, 0, 0, 0][index] ?? 0
    : Math.floor(100 / Math.max(1, areas.length)) + (index < 100 % Math.max(1, areas.length) ? 1 : 0));
  const baseline = saved[allocationKey] ?? defaultAllocations;
  const values = draft[allocationKey] ?? baseline;
  const totalPercent = values.reduce((sum, value) => sum + value, 0);
  const changedAreaCount = values.filter((value, index) => value !== (baseline[index] ?? 0)).length;
  const setValue = (index: number, value: number) => setDraft(previous => ({
    ...previous,
    [allocationKey]: values.map((current, currentIndex) => currentIndex === index
      ? Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : current
      : current),
  }));
  const revert = () => {
    setDraft(previous => ({ ...previous, [allocationKey]: [...baseline] }));
    toast({ title: "Changes cancelled", description: `Revised allocations for ${activeGrade} ${storeFormat} stores were restored.` });
  };
  const save = () => {
    if (totalPercent !== 100) {
      toast({ title: "Allocation must total 100%", description: `Current total is ${totalPercent}%. Adjust percentages before applying.`, variant: "destructive" });
      return;
    }
    setSaved(previous => ({ ...previous, [allocationKey]: [...values] }));
    toast({ title: "Space allocation applied", description: `${activeGrade} grade allocations for ${block?.name ?? "the selected block"} and ${storeFormat} stores have been saved.` });
  };
  const allocationColors = ["bg-primary", "bg-primary/75", "bg-sky-600", "bg-sky-500", "bg-indigo-500", "bg-blue-400"];

  return (
    <div className="space-y-4">
      <ScreenHeader title="Space Revision" description="Review and revise merchandise-area allocations by block and store format." />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-2">
        <SelectField label="MERCHANDISING BLOCK" value={block?.id ?? ""} onChange={setBlockId} options={blocks.map(item => ({ value: item.id, label: item.name }))} />
        <SelectField label="STORE FORMAT" value={storeFormat} onChange={setStoreFormat} options={formats.map(format => ({ value: format, label: format }))} />
      </div>
      <Panel
        title="Space Allocation"
        description={`${block?.name ?? "Merchandising block"} · ${storeFormat} format · ${activeGrade} grade`}
        right={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={revert} className="h-8 text-xs">Cancel / Revert</Button><Button size="sm" onClick={save} className="h-8 gap-1.5 bg-primary text-xs hover:bg-primary/90"><Check className="h-3.5 w-3.5" /> Save / Apply</Button></div>}
      >
        <div className="space-y-4 p-4">
          <div role="tablist" aria-label="Store grade" className="flex flex-wrap gap-1 border-b border-slate-200">
            {availableGrades.map(item => (
              <button
                key={item.grade}
                type="button"
                role="tab"
                aria-selected={item.grade === activeGrade}
                onClick={() => setGrade(item.grade)}
                className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${item.grade === activeGrade ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {item.grade}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-slate-600">
              <span>Minimum required: <strong className="font-semibold text-slate-800">{gradeConfig.minimumSlots} slots</strong></span>
              <span>Available capacity: <strong className="font-semibold text-slate-800">{gradeConfig.capacity} slots</strong></span>
              <span>{changedAreaCount} changed {changedAreaCount === 1 ? "area" : "areas"}</span>
            </div>
            <span className={`font-semibold tabular-nums ${totalPercent === 100 ? "text-emerald-700" : "text-amber-700"}`}>
              Revised allocation: {totalPercent}%
            </span>
          </div>
          <div
            role="img"
            aria-label={`Revised allocation distribution totals ${totalPercent} percent`}
            className="flex h-3 overflow-hidden rounded border border-slate-200 bg-slate-50"
          >
            {values.map((value, index) => value > 0 && (
              <div key={areas[index]} title={`${areaName(areas[index])}: ${value}%`} style={{ width: `${value}%` }} className={`${allocationColors[index % allocationColors.length]} border-r border-white/70 last:border-r-0`} />
            ))}
          </div>
          <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${totalPercent === 100 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            {totalPercent === 100 ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
            <span>{totalPercent === 100 ? "Allocation balances to 100%." : `Allocation totals ${totalPercent}%. Revised percentages must total 100% before saving.`}</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[680px] text-xs">
              <TableHeader><TableRow>
                <TableHead className="h-9 px-3 text-[10px] tracking-wide">Merchandise area</TableHead>
                <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Current allocation</TableHead>
                <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Revised allocation</TableHead>
                <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Current slots</TableHead>
                <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Revised slots</TableHead>
                <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Change in slots</TableHead>
              </TableRow></TableHeader>
              <TableBody>{areas.map((id, index) => {
                const current = baseline[index] ?? 0;
                const revised = values[index] ?? 0;
                const currentSlots = Math.round(gradeConfig.capacity * current / 100);
                const revisedSlots = Math.round(gradeConfig.capacity * revised / 100);
                const change = revisedSlots - currentSlots;
                return <TableRow key={id}>
                  <TableCell className="px-3 py-2 font-medium text-slate-800">{areaName(id)}{revised === 0 && <span className="ml-2 text-[10px] font-normal text-slate-400">zero allocation</span>}</TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-600">{current}%</TableCell>
                  <TableCell className="px-3 py-2">
                    <label className="ml-auto flex w-20 items-center justify-end gap-1">
                      <Input type="number" min="0" max="100" step="1" value={revised} onChange={event => setValue(index, Number(event.target.value))} className="h-7 w-14 text-right text-xs" aria-label={`${areaName(id)} revised allocation percentage`} />
                      <span className="text-slate-400">%</span>
                    </label>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-600">{currentSlots}</TableCell>
                  <TableCell className="px-3 py-2 text-right font-medium tabular-nums text-slate-800">{revisedSlots}</TableCell>
                  <TableCell className={`px-3 py-2 text-right tabular-nums ${change > 0 ? "text-emerald-700" : change < 0 ? "text-rose-700" : "text-slate-400"}`}>{change > 0 ? `+${change}` : change}</TableCell>
                </TableRow>;
              })}</TableBody>
            </Table>
          </div>
          <p className="text-[10px] text-slate-500">Minimums and capacities are planning values; allocation percentages and slot counts remain editable.</p>
        </div>
      </Panel>
    </div>
  );
}

function PlanogramProduct({ sku, selected, onSelect, onDragStart }: {
  sku: PlanningSku;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
}) {
  const area = merchAreas.find(item => item.id === sku.areaId);
  const icon = area?.department === "Beverages"
    ? Droplets
    : sku.areaId.includes("audio") || sku.areaId === "headphones"
      ? Headphones
      : sku.areaId.includes("chargers") || sku.areaId.includes("mobile")
        ? PlugZap
        : sku.areaId === "books" || sku.areaId === "paper"
          ? BookOpen
          : Package;
  const ProductIcon = icon;
  const brandColors: Record<string, string> = {
    "Coca-Cola": "bg-red-700",
    Sprite: "bg-emerald-700",
    Fanta: "bg-orange-600",
    "Northstar Springs": "bg-sky-800",
    "Orchard Press": "bg-amber-700",
    SoundPod: "bg-slate-900",
    Volt: "bg-yellow-600",
    Connect: "bg-blue-800",
    Pulse: "bg-violet-800",
    WHSmith: "bg-rose-800",
  };
  const brandColor = brandColors[sku.brand] ?? "bg-indigo-800";

  return (
    <button
      type="button"
      draggable
      onClick={onSelect}
      onMouseEnter={onSelect}
      onDragStart={onDragStart}
      aria-label={`${sku.code}, ${sku.description}`}
      className={`group relative flex h-[112px] min-w-0 flex-1 flex-col overflow-hidden rounded-t-[3px] border border-slate-300 bg-white text-left shadow-[0_2px_4px_rgba(15,23,42,0.18)] hover:z-10 hover:shadow-md focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected ? "z-[1] outline outline-2 outline-offset-1 outline-blue-500" : ""}`}
    >
      <span className={`flex h-5 shrink-0 items-center justify-center truncate px-1 text-[8px] font-black tracking-[0.08em] text-white ${brandColor}`}>{sku.brand}</span>
      <span className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 bg-slate-50 px-1">
        <ProductIcon className="h-8 w-8 shrink-0 stroke-[1.5] text-slate-800" aria-hidden="true" />
        <span className="line-clamp-2 text-center text-[8px] font-bold leading-tight text-slate-800">{sku.description}</span>
      </span>
      <span className="flex h-4 shrink-0 items-center justify-center bg-white px-1 font-mono text-[7px] font-semibold text-slate-500">{sku.code}</span>
    </button>
  );
}

function FacingsPresentations({ blocks, fixtureList, inventory, compatibility, assignments, setAssignments, storeId, setStoreId, blockId, setBlockId, fixtureCode, setFixtureCode }: {
  blocks: PlanningBlock[];
  fixtureList: Fixture[];
  inventory: StoreInventory[];
  compatibility: FixtureCompatibility[];
  assignments: FacingAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<FacingAssignment[]>>;
  storeId: string;
  setStoreId: (id: string) => void;
  blockId: string;
  setBlockId: (id: string) => void;
  fixtureCode: string;
  setFixtureCode: (code: string) => void;
}) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"area" | "sku" | "facings">("area");
  const [workspaceView, setWorkspaceView] = useState<"allocation" | "planogram">("allocation");
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [storeSearch, setStoreSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("All formats");
  const formats = Array.from(new Set(initialStores.map(store => store.format))).sort();
  const storesForFormat = initialStores.filter(store => formatFilter === "All formats" || store.format === formatFilter);
  const selectedStore = storeId ? storesForFormat.find(store => store.id === storeId) : undefined;
  const selectedStoreId = selectedStore?.id ?? "";
  const availableBlocks = blocks.filter(block => inventory.some(row =>
    row.storeId === selectedStoreId
    && row.change !== "Removed"
    && row.quantity > 0
    && compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === block.id)
  ));
  const selectedBlock = availableBlocks.find(item => item.id === blockId) ?? availableBlocks[0];
  const selectedBlockId = selectedBlock?.id ?? "";
  const blockAreas = selectedBlock?.areaIds ?? [];
  const storeFixtures = inventory
    .filter(row => row.storeId === selectedStoreId && row.change !== "Removed" && row.quantity > 0)
    .reduce((result, row) => {
      const existing = result.find(item => item.fixtureCode === row.fixtureCode);
      if (existing) existing.quantity += row.quantity;
      else result.push({ fixtureCode: row.fixtureCode, quantity: row.quantity });
      return result;
    }, [] as { fixtureCode: string; quantity: number }[])
    .flatMap(row => {
      const fixture = fixtureList.find(item => item.code === row.fixtureCode);
      if (!fixture) return [];
      const areaSlots = blockAreas.flatMap(areaId => {
        const rule = compatibility.find(item => item.fixtureCode === row.fixtureCode && item.blockId === selectedBlockId && item.areaId === areaId);
        return rule ? [{ areaId, slotsPerInstance: rule.slots, available: rule.slots * row.quantity }] : [];
      });
      return areaSlots.length ? [{ ...row, fixture, areaSlots, totalCapacity: areaSlots.reduce((sum, area) => sum + area.available, 0) }] : [];
    });
  const fixtureCapacities = storeFixtures.flatMap(fixture => fixture.areaSlots.map(area => ({
    fixtureCode: fixture.fixtureCode,
    areaId: area.areaId,
    capacity: area.available,
  })));
  const blockAssignments = Array.from(assignments
    .filter(item => item.storeId === selectedStoreId && item.blockId === selectedBlockId)
    .reduce((unique, item) => unique.has(item.skuId) ? unique : unique.set(item.skuId, item), new Map<string, FacingAssignment>())
    .values());
  const getAssignment = (skuId: string) => blockAssignments.find(item => item.skuId === skuId);
  const availableForArea = (areaId: string) => storeFixtures.filter(fixture => fixture.areaSlots.some(area => area.areaId === areaId));
  const assignedFor = (fixtureCode?: string, areaId?: string) => blockAssignments
    .filter(item => (!fixtureCode || item.fixtureCode === fixtureCode) && (!areaId || item.areaId === areaId))
    .reduce((sum, item) => sum + item.facings, 0);
  const capacityFor = (fixtureCode?: string, areaId?: string) => fixtureCapacities
    .filter(item => (!fixtureCode || item.fixtureCode === fixtureCode) && (!areaId || item.areaId === areaId))
    .reduce((sum, item) => sum + item.capacity, 0);
  const totalAvailable = capacityFor();
  const totalAssigned = assignedFor();
  const totalRemaining = totalAvailable - totalAssigned;
  const utilization = totalAvailable > 0 ? totalAssigned / totalAvailable * 100 : 0;
  const currentGrade = selectedStore?.currentGradeByBlock[selectedBlockId] ?? "M";
  const gradeCapacity: Record<string, number> = { XS: 40, S: 56, M: 80, L: 104, XL: 128, Mega: 160 };
  const targetCapacity = gradeCapacity[currentGrade] ?? 80;
  const defaultAllocation = selectedBlockId === "beverage" ? [40, 60, 0, 0, 0] : blockAreas.map(() => Math.floor(100 / Math.max(blockAreas.length, 1)));
  const allocationPercent = selectedBlockId === "beverage"
    ? blockAreas.map((_, index) => defaultAllocation[index] ?? 0)
    : blockAreas.map((_, index) => index === blockAreas.length - 1
      ? 100 - defaultAllocation.slice(0, index).reduce((sum, value) => sum + value, 0)
      : defaultAllocation[index] ?? 0);
  const eligibleSkus = skus.filter(sku => blockAreas.includes(sku.areaId)
    && `${sku.code} ${sku.description} ${sku.brand} ${areaName(sku.areaId)}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((first, second) => blockAreas.indexOf(first.areaId) - blockAreas.indexOf(second.areaId) || first.code.localeCompare(second.code));
  const rowsByArea = blockAreas.map((areaId, index) => {
    const target = Math.round(targetCapacity * (allocationPercent[index] ?? 0) / 100);
    const areaAvailable = capacityFor(undefined, areaId);
    const areaAssigned = assignedFor(undefined, areaId);
    return { areaId, target, areaAvailable, areaAssigned, areaRemaining: areaAvailable - areaAssigned };
  });
  const filteredSkus = eligibleSkus.filter(sku => {
    const assignment = getAssignment(sku.id);
    const activeFixture = assignment ? storeFixtures.find(item => item.fixtureCode === assignment.fixtureCode) : undefined;
    return !assignment || Boolean(activeFixture?.areaSlots.some(item => item.areaId === sku.areaId));
  });
  const visibleSkus = filteredSkus.slice().sort((first, second) => {
    if (sortBy === "sku") return first.code.localeCompare(second.code);
    if (sortBy === "facings") return (getAssignment(second.id)?.facings ?? 0) - (getAssignment(first.id)?.facings ?? 0) || first.code.localeCompare(second.code);
    return blockAreas.indexOf(first.areaId) - blockAreas.indexOf(second.areaId) || first.code.localeCompare(second.code);
  });
  const selectedPlanogramFixture = storeFixtures.find(item => item.fixtureCode === fixtureCode) ?? storeFixtures[0];
  const planogramAssignments = selectedPlanogramFixture
    ? blockAssignments.filter(item => item.fixtureCode === selectedPlanogramFixture.fixtureCode && item.facings > 0)
    : [];
  const planogramCapacity = selectedPlanogramFixture?.totalCapacity ?? 0;
  const planogramAssigned = planogramAssignments.reduce((sum, item) => sum + item.facings, 0);
  const planogramRemaining = planogramCapacity - planogramAssigned;
  const planogramUtilization = planogramCapacity > 0 ? planogramAssigned / planogramCapacity * 100 : 0;
  const planogramShelfCount = selectedPlanogramFixture
    ? selectedPlanogramFixture.fixture.type === "Cooler" ? 4
      : selectedPlanogramFixture.fixture.type === "Till Unit" ? 3
        : selectedPlanogramFixture.fixture.type === "Wall Bay" ? 5 : 4
    : 4;
  const planogramShelfCapacity = Math.max(1, Math.ceil(planogramCapacity / planogramShelfCount));
  const shelfRows = Array.from({ length: planogramShelfCount }, () => [] as { assignment: FacingAssignment; sku: PlanningSku }[]);
  let placedFacings = 0;
  planogramAssignments
    .slice()
    .sort((first, second) => first.areaId.localeCompare(second.areaId) || (skus.find(sku => sku.id === first.skuId)?.code ?? "").localeCompare(skus.find(sku => sku.id === second.skuId)?.code ?? ""))
    .forEach(assignment => {
      const sku = skus.find(item => item.id === assignment.skuId);
      if (!sku || placedFacings >= planogramCapacity) return;
      const preferredShelf = assignment.shelfIndex;
      const firstShelf = Number.isInteger(preferredShelf)
        ? Math.max(0, Math.min(planogramShelfCount - 1, preferredShelf!))
        : shelfRows.findIndex(row => row.length < planogramShelfCapacity);
      let remainingFacings = Math.min(assignment.facings, planogramCapacity - placedFacings);
      for (let shelfOffset = 0; shelfOffset < planogramShelfCount && remainingFacings > 0; shelfOffset += 1) {
        const shelfIndex = (Math.max(0, firstShelf) + shelfOffset) % planogramShelfCount;
        const availableOnShelf = Math.max(0, planogramShelfCapacity - shelfRows[shelfIndex].length);
        const facingsToPlace = Math.min(availableOnShelf, remainingFacings);
        for (let facing = 0; facing < facingsToPlace; facing += 1) {
          shelfRows[shelfIndex].push({ assignment, sku });
        }
        placedFacings += facingsToPlace;
        remainingFacings -= facingsToPlace;
      }
    });
  const selectedPlanogramSku = (selectedSkuId ? eligibleSkus.find(sku => sku.id === selectedSkuId) : undefined)
    ?? planogramAssignments.map(assignment => skus.find(sku => sku.id === assignment.skuId)).find((sku): sku is PlanningSku => Boolean(sku));
  const storesForList = storesForFormat
    .filter(store => `${store.id} ${store.name} ${store.format} ${store.region} ${store.channel}`.toLowerCase().includes(storeSearch.trim().toLowerCase()))
    .sort((first, second) => first.id.localeCompare(second.id));
  const changeFormat = (format: string) => {
    const nextStore = initialStores.find(store => store.format === format);
    const nextBlocks = blocks.filter(block => inventory.some(row => row.storeId === nextStore?.id && row.change !== "Removed" && row.quantity > 0 && compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === block.id)));
    setFormatFilter(format);
    if (nextStore) {
      setStoreId(nextStore.id);
      setFormatFilter(nextStore.format);
    }
    if (nextBlocks[0]) {
      setBlockId(nextBlocks[0].id);
    }
  };
  const changeStore = (nextStoreId: string) => {
    setStoreId(nextStoreId);
    const nextBlocks = blocks.filter(block => inventory.some(row => row.storeId === nextStoreId && row.change !== "Removed" && row.quantity > 0 && compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === block.id)));
    if (!nextBlocks.some(item => item.id === selectedBlockId) && nextBlocks[0]) {
      setBlockId(nextBlocks[0].id);
    }
  };
  const assignFixture = (skuId: string, areaId: string, nextFixtureCode: string) => {
    const existing = getAssignment(skuId);
    if (!nextFixtureCode) {
      if (existing) setAssignments(previous => previous.filter(item => item.id !== existing.id));
      return;
    }
    const fixture = storeFixtures.find(item => item.fixtureCode === nextFixtureCode);
    if (!fixture?.areaSlots.some(item => item.areaId === areaId)) return;
    if (existing) {
      setAssignments(previous => [
        ...previous.filter(item => item.storeId !== selectedStoreId || item.blockId !== selectedBlockId || item.skuId !== skuId),
        { ...existing, fixtureCode: nextFixtureCode, shelfIndex: existing.fixtureCode === nextFixtureCode ? existing.shelfIndex : undefined },
      ]);
    } else {
      setAssignments(previous => [...previous, {
        id: `as-${Date.now()}-${skuId}`,
        storeId: selectedStoreId,
        blockId: selectedBlockId,
        areaId,
        fixtureCode: nextFixtureCode,
        skuId,
        facings: 1,
      }]);
    }
    setFixtureCode(nextFixtureCode);
  };
  const dropSkuOnShelf = (event: React.DragEvent<HTMLElement>, shelfIndex: number) => {
    event.preventDefault();
    const skuId = event.dataTransfer.getData("text/plain");
    const sku = eligibleSkus.find(item => item.id === skuId);
    if (!sku || !selectedPlanogramFixture?.areaSlots.some(area => area.areaId === sku.areaId)) {
      toast({
        title: "SKU is not compatible with this fixture",
        description: "Choose a fixture that supports the SKU's merchandise area.",
        variant: "destructive",
      });
      return;
    }
    const existing = getAssignment(sku.id);
    setAssignments(previous => {
      const index = previous.findIndex(item => item.storeId === selectedStoreId && item.blockId === selectedBlockId && item.skuId === sku.id);
      if (index >= 0) {
        return previous.map((item, itemIndex) => itemIndex === index
          ? { ...item, fixtureCode: selectedPlanogramFixture.fixtureCode, facings: item.facings > 0 ? item.facings : 1, shelfIndex }
          : item);
      }
      return [...previous, {
        id: `as-${Date.now()}-${sku.id}`,
        storeId: selectedStoreId,
        blockId: selectedBlockId,
        areaId: sku.areaId,
        fixtureCode: selectedPlanogramFixture.fixtureCode,
        skuId: sku.id,
        facings: 1,
        shelfIndex,
      }];
    });
    setFixtureCode(selectedPlanogramFixture.fixtureCode);
    setSelectedSkuId(sku.id);
    if (!existing || existing.fixtureCode !== selectedPlanogramFixture.fixtureCode) {
      toast({ title: "SKU assigned to fixture", description: `${sku.code} · ${selectedPlanogramFixture.fixture.name}` });
    }
  };
  const startSkuDrag = (event: React.DragEvent<HTMLElement>, skuId: string) => {
    event.dataTransfer.setData("text/plain", skuId);
    event.dataTransfer.effectAllowed = "move";
  };
  const updateFacings = (skuId: string, facings: number) => {
    const existing = getAssignment(skuId);
    if (!existing) return;
    const safeFacings = Number.isFinite(facings) ? Math.max(0, Math.floor(facings)) : 0;
    setAssignments(previous => previous.map(item => item.id === existing.id ? { ...item, facings: safeFacings } : item));
  };
  const openStore = (nextStoreId: string) => {
    const store = initialStores.find(item => item.id === nextStoreId);
    if (!store) return;
    setFormatFilter(store.format);
    setStoreId(store.id);
    const nextBlock = blocks.find(block => inventory.some(row => row.storeId === store.id && row.change !== "Removed" && row.quantity > 0 && compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === block.id)));
    if (nextBlock) setBlockId(nextBlock.id);
  };

  if (!selectedStore) {
    return <div className="space-y-4">
      <ScreenHeader title="Determine Facings & Presentation" description="Select a store to review fixture capacity and allocate eligible SKU facings." />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(180px,0.35fr)_1fr]">
        <SelectField label="STORE FORMAT" value={formatFilter} onChange={setFormatFilter} options={[{ value: "All formats", label: "All formats" }, ...formats.map(value => ({ value, label: value }))]} />
        <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-600">SEARCH STORES</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={storeSearch} onChange={event => setStoreSearch(event.target.value)} placeholder="Store number, name, region or channel" className="h-9 pl-8 text-xs" /></span></label>
      </div>
      <Panel title="Store selection" description={`${storesForList.length} stores · filter by format, then open a store to plan facings`}>
        <Table className="text-xs"><TableHeader><TableRow className="h-9">
          <TableHead className="h-9 px-3 py-1 text-[10px]">Store Number</TableHead><TableHead className="h-9 px-3 py-1 text-[10px]">Store Name</TableHead><TableHead className="h-9 px-3 py-1 text-[10px]">Format</TableHead><TableHead className="h-9 px-3 py-1 text-[10px]">Channel</TableHead><TableHead className="h-9 px-3 py-1 text-[10px]">Region</TableHead><TableHead className="h-9 px-3 py-1 text-right text-[10px]">Available Blocks</TableHead><TableHead className="h-9 px-3 py-1 text-right text-[10px]">Action</TableHead>
        </TableRow></TableHeader><TableBody>
          {storesForList.map(store => {
            const storeBlocks = blocks.filter(candidate => inventory.some(row => row.storeId === store.id && row.change !== "Removed" && row.quantity > 0 && compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === candidate.id))).length;
            return <TableRow key={store.id} className="h-10">
              <TableCell className="px-3 py-1 font-mono text-[10px] text-primary">{store.id}</TableCell><TableCell className="px-3 py-1 font-medium text-slate-800">{store.name}</TableCell><TableCell className="px-3 py-1 text-slate-600">{store.format}</TableCell><TableCell className="px-3 py-1 text-slate-600">{store.channel}</TableCell><TableCell className="px-3 py-1 text-slate-600">{store.region}</TableCell><TableCell className="px-3 py-1 text-right tabular-nums text-slate-600">{storeBlocks}</TableCell><TableCell className="px-3 py-1 text-right"><Button variant="ghost" size="sm" onClick={() => openStore(store.id)} className="h-7 px-2 text-[10px] text-primary">Select store</Button></TableCell>
            </TableRow>;
          })}
          {!storesForList.length && <TableRow><TableCell colSpan={7} className="h-16 text-center text-xs text-slate-500">No stores match your filters.</TableCell></TableRow>}
        </TableBody></Table>
      </Panel>
    </div>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader title="Determine Facings & Presentation" description={`Planning for ${selectedStore.name}`} right={<Button variant="outline" size="sm" onClick={() => setStoreId("")} className="h-8 gap-1.5 text-xs"><ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Stores</Button>} />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-3">
        <SelectField label="1 · STORE FORMAT" value={formatFilter} onChange={changeFormat} options={formats.map(value => ({ value, label: value }))} />
        <SelectField label="2 · STORE" value={selectedStoreId} onChange={changeStore} options={storesForFormat.map(store => ({ value: store.id, label: `${store.id} · ${store.name}` }))} />
        <SelectField label="3 · MERCHANDISING BLOCK" value={selectedBlockId} onChange={setBlockId} options={availableBlocks.map(item => ({ value: item.id, label: item.name }))} />
      </div>
      {selectedStore && selectedBlock ? <>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 py-2 text-[11px]">
          <div><span className="font-semibold text-slate-800">{selectedStore.id} · {selectedStore.name}</span><span className="mx-2 text-slate-300">/</span><span className="text-slate-600">{selectedStore.format}</span><span className="mx-2 text-slate-300">/</span><span className="font-medium text-primary">{selectedBlock.name}</span></div>
          <span className="text-slate-500">Store grade {currentGrade} · allocation target {targetCapacity} slots</span>
        </div>
        <div role="tablist" aria-label="Facings workspace view" className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
          <button type="button" role="tab" aria-selected={workspaceView === "allocation"} onClick={() => setWorkspaceView("allocation")} className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-[10px] font-semibold ${workspaceView === "allocation" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>SKU Allocation</button>
          <button type="button" role="tab" aria-selected={workspaceView === "planogram"} onClick={() => setWorkspaceView("planogram")} className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-[10px] font-semibold ${workspaceView === "planogram" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-800"}`}>Planogram View</button>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          <Panel title="Merchandise area slot allocation" description={`${selectedBlock.name} · ${currentGrade} grade allocation`}>
            <Table className="text-xs"><TableHeader><TableRow className="h-8"><TableHead className="h-8 px-3 py-1 text-[10px]">Merchandise Area</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Allocated Slots</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Fixture Capacity</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Assigned / Remaining</TableHead></TableRow></TableHeader><TableBody>
              {rowsByArea.map(area => <TableRow key={area.areaId} className="h-8"><TableCell className="px-3 py-1 font-medium text-slate-700">{areaName(area.areaId)}</TableCell><TableCell className="px-3 py-1 text-right tabular-nums text-slate-600">{area.target}</TableCell><TableCell className="px-3 py-1 text-right tabular-nums text-slate-600">{area.areaAvailable}</TableCell><TableCell className="px-3 py-1 text-right tabular-nums"><span className={area.areaAssigned > area.areaAvailable ? "font-semibold text-rose-700" : "text-slate-700"}>{area.areaAssigned}</span><span className="text-slate-400"> / {area.areaRemaining}</span></TableCell></TableRow>)}
            </TableBody></Table>
          </Panel>
          <Panel title="Available fixtures and capacity" description="Facing-slot capacity is fixture/block/area-specific; EFT remains a separate physical-space measure.">
            <div className="grid grid-cols-4 gap-2 border-b border-slate-100 px-3 py-2 text-[10px]">
              <div><p className="text-slate-500">Available</p><p className="font-semibold tabular-nums text-slate-800">{totalAvailable} slots</p></div>
              <div><p className="text-slate-500">Assigned</p><p className={`font-semibold tabular-nums ${totalAssigned > totalAvailable ? "text-rose-700" : "text-slate-800"}`}>{totalAssigned} slots</p></div>
              <div><p className="text-slate-500">Remaining</p><p className={`font-semibold tabular-nums ${totalRemaining < 0 ? "text-rose-700" : "text-slate-800"}`}>{totalRemaining} slots</p></div>
              <div><p className="text-slate-500">Utilisation</p><p className={`font-semibold tabular-nums ${utilization > 100 ? "text-rose-700" : "text-primary"}`}>{utilization.toFixed(1)}%</p></div>
            </div>
            <Table className="text-xs"><TableHeader><TableRow className="h-8"><TableHead className="h-8 px-3 py-1 text-[10px]">Fixture / Subtype</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Instances</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Available Slots</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Assigned</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Remaining</TableHead><TableHead className="h-8 px-3 py-1 text-right text-[10px]">Use</TableHead></TableRow></TableHeader><TableBody>
              {storeFixtures.map(fixture => {
                const assigned = assignedFor(fixture.fixtureCode);
                const capacity = fixture.totalCapacity;
                const remaining = capacity - assigned;
                const percent = capacity ? assigned / capacity * 100 : 0;
                return <TableRow key={fixture.fixtureCode} className="h-8"><TableCell className="px-3 py-1"><span className="font-medium text-slate-700">{fixture.fixture.name}</span><span className="ml-1 text-[9px] text-slate-500">{fixture.fixture.subtype}</span></TableCell><TableCell className="px-3 py-1 text-right tabular-nums text-slate-600">{fixture.quantity}</TableCell><TableCell className="px-3 py-1 text-right tabular-nums text-slate-700">{capacity}</TableCell><TableCell className={`px-3 py-1 text-right tabular-nums ${percent > 100 ? "font-semibold text-rose-700" : "text-slate-700"}`}>{assigned}</TableCell><TableCell className={`px-3 py-1 text-right tabular-nums ${remaining < 0 ? "font-semibold text-rose-700" : "text-slate-600"}`}>{remaining}</TableCell><TableCell className={`px-3 py-1 text-right tabular-nums ${percent > 100 ? "text-rose-700" : "text-slate-600"}`}>{percent.toFixed(1)}%</TableCell></TableRow>;
              })}
              {!storeFixtures.length && <TableRow><TableCell colSpan={6} className="h-12 text-center text-xs text-slate-500">No compatible fixtures are assigned to this store and block.</TableCell></TableRow>}
            </TableBody></Table>
          </Panel>
        </div>
        {totalAssigned > totalAvailable && <div role="alert" className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />Assigned facings exceed available capacity by {totalAssigned - totalAvailable} slots. Reduce facings or reassign SKUs to a fixture with remaining capacity.</div>}
        {totalAvailable > 0 && totalRemaining === 0 && <div role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">All available facing slots are allocated.</div>}
        {workspaceView === "allocation" ? <Panel title="Eligible SKU facings" description={`${eligibleSkus.length} eligible SKUs across ${blockAreas.length} merchandise areas`} right={<div className="flex items-center gap-2"><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search SKU, description or area" className="h-8 w-56 pl-8 text-xs" /></span><SelectField label="" value={sortBy} onChange={value => setSortBy(value as typeof sortBy)} options={[{ value: "area", label: "Sort: area" }, { value: "sku", label: "Sort: style code" }, { value: "facings", label: "Sort: facings" }]} className="w-32" /></div>}>
          <Table className="border-collapse text-xs"><TableHeader><TableRow className="h-10 border-b border-slate-200 bg-slate-50/70">
            <TableHead className="h-10 border-r px-2 py-1 text-[10px]">Style ID</TableHead><TableHead className="h-10 min-w-44 border-r px-2 py-1 text-[10px]">Description</TableHead><TableHead className="h-10 border-r px-2 py-1 text-right text-[10px]">Sales (£M)</TableHead><TableHead className="h-10 border-r px-2 py-1 text-right text-[10px]">Units Sold</TableHead><TableHead className="h-10 border-r px-2 py-1 text-center text-[10px]">Grade</TableHead><TableHead className="h-10 min-w-52 border-r px-2 py-1 text-[10px]">Assigned Fixture</TableHead><TableHead className="h-10 border-r bg-primary/5 px-2 py-1 text-center text-[10px]">Facings</TableHead><TableHead className="h-10 px-2 py-1 text-center text-[10px]">Status</TableHead>
          </TableRow></TableHeader><TableBody>
            {visibleSkus.map(sku => {
              const assignment = getAssignment(sku.id);
              const areaFixtures = availableForArea(sku.areaId);
              const fixture = assignment ? areaFixtures.find(item => item.fixtureCode === assignment.fixtureCode) : undefined;
              const fixtureAssigned = assignment ? assignedFor(assignment.fixtureCode, sku.areaId) : 0;
              const fixtureCapacity = assignment ? capacityFor(assignment.fixtureCode, sku.areaId) : 0;
              const overAllocated = fixtureAssigned > fixtureCapacity;
              return <TableRow key={sku.id} className={`h-10 border-b border-slate-200/70 hover:bg-slate-50/60 ${overAllocated ? "bg-rose-50/50" : ""}`}>
                <TableCell className="whitespace-nowrap border-r px-2 py-1 font-mono text-[11px] font-medium text-primary">{sku.code}</TableCell>
                <TableCell className="max-w-64 truncate border-r px-2 py-1 text-[11px] font-medium text-slate-800" title={sku.description}>{sku.description}</TableCell>
                <TableCell className="border-r px-2 py-1 text-right tabular-nums text-[11px] text-slate-600">{sku.sales?.toFixed(1) ?? "—"}</TableCell>
                <TableCell className="border-r px-2 py-1 text-right tabular-nums text-[11px] text-slate-600">{sku.units?.toLocaleString() ?? "—"}</TableCell>
                <TableCell className="border-r px-2 py-1 text-center"><span className="inline-flex h-5 items-center rounded border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-600">{currentGrade}</span></TableCell>
                <TableCell className="min-w-48 border-r px-2 py-1"><SelectField label="" value={fixture?.fixtureCode ?? ""} onChange={value => assignFixture(sku.id, sku.areaId, value)} options={[{ value: "", label: "Not assigned" }, ...areaFixtures.map(item => ({ value: item.fixtureCode, label: `${item.fixture.name} · ${item.fixture.subtype} (${item.quantity})` }))]} className="w-full" /></TableCell>
                <TableCell className="border-r bg-primary/[0.02] px-2 py-1 text-center"><Input type="number" min="0" step="1" disabled={!assignment} value={assignment?.facings ?? 0} onChange={event => updateFacings(sku.id, Number(event.target.value))} className="mx-auto h-7 w-16 rounded-md border-primary/20 px-1 text-center text-[11px] font-bold shadow-none" aria-label={`Facings for ${sku.code}`} /></TableCell>
                <TableCell className="px-2 py-1 text-center">{overAllocated ? <span className="inline-flex h-5 items-center rounded bg-rose-100 px-2 text-[9px] font-bold uppercase text-rose-700">Over capacity</span> : assignment ? <span className="inline-flex h-5 items-center rounded bg-emerald-100 px-2 text-[9px] font-bold uppercase text-emerald-700">OK</span> : <span className="text-[9px] text-slate-400">{areaFixtures.length ? "Eligible" : "No fixture"}</span>}</TableCell>
              </TableRow>;
            })}
            {!visibleSkus.length && <TableRow><TableCell colSpan={8} className="h-16 text-center text-xs text-slate-500">{eligibleSkus.length ? "No SKUs match your search." : "No eligible SKUs are configured for this merchandising block."}</TableCell></TableRow>}
          </TableBody></Table>
        </Panel> : (
          <div className="grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="space-y-3">
              <section className="rounded-md border border-slate-200 bg-white p-3">
                <SelectField
                  label="FIXTURE"
                  value={selectedPlanogramFixture?.fixtureCode ?? ""}
                  onChange={setFixtureCode}
                  options={storeFixtures.map(item => ({ value: item.fixtureCode, label: `${item.fixture.name} · ${item.fixture.subtype}` }))}
                />
                {selectedPlanogramFixture && <p className="mt-1 text-[10px] text-slate-500">{selectedPlanogramFixture.fixture.type} · {selectedPlanogramFixture.fixture.dimensions}</p>}
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Facing slots</span><strong>{planogramCapacity}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Assigned facings</span><strong className={planogramAssigned > planogramCapacity ? "text-rose-700" : ""}>{planogramAssigned}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Remaining</span><strong className={planogramRemaining < 0 ? "text-rose-700" : ""}>{Math.max(0, planogramRemaining)}</strong></div>
                  <div className="flex justify-between text-[10px] text-slate-500"><span>Utilisation</span><span>{planogramUtilization.toFixed(1)}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${planogramUtilization > 100 ? "bg-rose-500" : "bg-blue-600"}`} style={{ width: `${Math.min(100, planogramUtilization)}%` }} /></div>
                </div>
              </section>

              <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold text-slate-800">Eligible SKUs</h3>
                    <span className="text-[10px] text-slate-500">{visibleSkus.length} listed</span>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search SKU or area" className="h-7 pl-7 text-[10px]" />
                  </div>
                </div>
                <div className="max-h-[470px] divide-y divide-slate-100 overflow-y-auto">
                  {visibleSkus.map(sku => {
                    const assignment = getAssignment(sku.id);
                    const fixtureSupportsSku = selectedPlanogramFixture?.areaSlots.some(area => area.areaId === sku.areaId) ?? false;
                    return (
                      <button
                        key={sku.id}
                        type="button"
                        draggable={fixtureSupportsSku}
                        onClick={() => setSelectedSkuId(sku.id)}
                        onDragStart={event => startSkuDrag(event, sku.id)}
                        className={`w-full cursor-grab px-3 py-2 text-left active:cursor-grabbing ${selectedSkuId === sku.id ? "bg-blue-50" : "hover:bg-slate-50"} ${!fixtureSupportsSku ? "opacity-50" : ""}`}
                        title={fixtureSupportsSku ? "Drag onto a shelf to assign or move this SKU" : "This fixture does not support the SKU's merchandise area"}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block font-mono text-[10px] font-semibold text-primary">{sku.code}</span>
                            <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-800">{sku.description}</span>
                            <span className="mt-0.5 block text-[9px] text-slate-500">{areaName(sku.areaId)}</span>
                          </span>
                          <span className="shrink-0 text-right text-[9px] text-slate-500">
                            {assignment?.fixtureCode === selectedPlanogramFixture?.fixtureCode ? `${assignment.facings} facing${assignment.facings === 1 ? "" : "s"}` : assignment ? fixtureName(assignment.fixtureCode, fixtureList) : fixtureSupportsSku ? "Drag to assign" : "Incompatible"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {!visibleSkus.length && <p className="px-3 py-5 text-center text-[10px] text-slate-500">No SKUs match your search.</p>}
                </div>
              </section>
            </aside>

            <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{selectedPlanogramFixture?.fixture.name ?? "No compatible fixture"}</h3>
                  <p className="text-[10px] text-slate-500">{selectedPlanogramFixture?.fixture.subtype ?? "Add a compatible fixture to this store and block"} · Front-facing allocation preview</p>
                </div>
                <span className="text-[10px] text-slate-400">Drag SKUs onto a shelf to assign · illustrative, not an approved planogram</span>
              </div>
              {planogramAssigned > planogramCapacity && <div role="alert" className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-800"><CircleAlert className="h-3.5 w-3.5 shrink-0" /><strong>Over capacity by {planogramAssigned - planogramCapacity} facings.</strong> Reduce allocation in SKU Allocation.</div>}
              <div className="overflow-x-auto bg-slate-50 px-3 py-4 sm:px-6">
                {selectedPlanogramFixture ? (
                  <div className="mx-auto min-w-[550px] max-w-[1000px] overflow-hidden rounded-t-md border-x-[10px] border-t-[10px] border-slate-500 bg-slate-300 shadow-[0_5px_14px_rgba(15,23,42,0.16)]">
                    <div className="flex h-8 items-center justify-between bg-slate-800 px-3 text-[9px] font-bold tracking-[0.14em] text-white">
                      <span>{selectedPlanogramFixture.fixture.name.toUpperCase()}</span>
                      <span>{selectedBlock.name.toUpperCase()}</span>
                      <span>{planogramCapacity} SLOTS</span>
                    </div>
                    {shelfRows.map((products, shelfIndex) => (
                      <div
                        key={shelfIndex}
                        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                        onDrop={event => dropSkuOnShelf(event, shelfIndex)}
                        className="relative flex h-[126px] items-end gap-1.5 border-b-[10px] border-slate-400 bg-white px-2 pb-2 pt-1 shadow-[inset_0_-4px_5px_rgba(15,23,42,0.10)] transition-colors hover:bg-blue-50/50"
                        aria-label={`Shelf ${planogramShelfCount - shelfIndex}, drop eligible SKUs here`}
                      >
                        <span className="absolute left-0 top-1/2 z-10 -translate-x-[calc(100%+7px)] -translate-y-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-wider text-slate-400">{`S${planogramShelfCount - shelfIndex}`}</span>
                        {products.map(({ sku }, facingIndex) => (
                          <PlanogramProduct
                            key={`${sku.id}-${shelfIndex}-${facingIndex}`}
                            sku={sku}
                            selected={selectedPlanogramSku?.id === sku.id}
                            onSelect={() => setSelectedSkuId(sku.id)}
                            onDragStart={event => startSkuDrag(event, sku.id)}
                          />
                        ))}
                        {!products.length && <span className="mb-1 ml-2 text-[10px] text-slate-300">Drop a compatible SKU on this shelf</span>}
                      </div>
                    ))}
                  </div>
                ) : <div className="flex min-h-56 items-center justify-center text-xs text-slate-500">No compatible fixtures are assigned for this block.</div>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2">
                {selectedPlanogramSku ? (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{selectedPlanogramSku.description}</p>
                    <p className="text-[10px] text-slate-500">
                      <span className="font-mono text-blue-700">{selectedPlanogramSku.code}</span>
                      <span className="px-1.5 text-slate-300">·</span>{areaName(selectedPlanogramSku.areaId)}
                      <span className="px-1.5 text-slate-300">·</span>{fixtureName(getAssignment(selectedPlanogramSku.id)?.fixtureCode ?? "", fixtureList) || "Not assigned"}
                    </p>
                  </div>
                ) : <p className="text-[10px] text-slate-500">Select or hover a product to inspect its allocation.</p>}
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SKU facings</p>
                  <p className="text-sm font-bold tabular-nums text-slate-800">{selectedPlanogramSku ? getAssignment(selectedPlanogramSku.id)?.facings ?? 0 : 0}</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </> : <Panel title="No compatible merchandising block" description="The selected store has no active fixture relationship for the available merchandising blocks."><p className="px-3 pb-3 text-xs text-slate-500">Choose another store format or store with configured compatible fixtures.</p></Panel>}
      <p className="text-[10px] text-slate-500">Facing slots are configured per fixture, block and merchandise area. EFT is physical space and is not converted to facing capacity.</p>
    </div>
  );
}

export default function SpacePlanning() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [blocks, setBlocks] = useState<PlanningBlock[]>(initialBlocks);
  const [fixtureList, setFixtureList] = useState<Fixture[]>(initialFixtures);
  const [fixtureTypes, setFixtureTypes] = useState<FixtureType[]>(initialFixtureTypes);
  const [compatibility, setCompatibility] = useState<FixtureCompatibility[]>([
    ...initialCompatibility,
    ...compatibilityFixtureRules,
  ]);
  const [inventory, setInventory] = useState<StoreInventory[]>(initialInventory);
  const [stores, setStores] = useState(initialStores);
  const [assignments, setAssignments] = useState<FacingAssignment[]>(initialAssignments);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("beverage");
  const [selectedFixtureCode, setSelectedFixtureCode] = useState("IC-01");
  const screen = screens.find(item => item.path === location) ?? screens[0];

  const page = useMemo(() => {
    switch (screen.path) {
      case "/space-planning/fixtures":
        return <FixtureMaster blocks={blocks} fixtureList={fixtureList} setFixtureList={setFixtureList} fixtureTypes={fixtureTypes} setFixtureTypes={setFixtureTypes} compatibility={compatibility} inventory={inventory} setInventory={setInventory} setCompatFixture={setSelectedFixtureCode} />;
      case "/space-planning/compatibility":
        return <BlockCompatibility blocks={blocks} fixtureList={fixtureList} compatibility={compatibility} setCompatibility={setCompatibility} />;
      case "/space-planning/grading":
        return <StoreGrading blocks={blocks} stores={stores} setStores={setStores} inventory={inventory} compatibility={compatibility} fixtureList={fixtureList} blockId={selectedBlockId} setBlockId={setSelectedBlockId} />;
      case "/space-planning/revision":
        return <SpaceRevision blocks={blocks} blockId={selectedBlockId} setBlockId={setSelectedBlockId} />;
      case "/space-planning/facings":
        return <FacingsPresentations blocks={blocks} fixtureList={fixtureList} inventory={inventory} compatibility={compatibility} assignments={assignments} setAssignments={setAssignments} storeId={selectedStoreId} setStoreId={setSelectedStoreId} blockId={selectedBlockId} setBlockId={setSelectedBlockId} fixtureCode={selectedFixtureCode} setFixtureCode={setSelectedFixtureCode} />;
      default:
        return <MerchandisingBlocks blocks={blocks} setBlocks={setBlocks} />;
    }
  }, [screen.path, blocks, fixtureList, fixtureTypes, compatibility, inventory, stores, assignments, selectedFixtureCode, selectedBlockId, selectedStoreId]);

  return (
    <ModuleShell>
      {page}
    </ModuleShell>
  );
}
