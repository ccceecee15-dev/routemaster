import { Fragment, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Eye,
  Image as ImageIcon,
  Plus,
  Search,
  Smartphone,
  SlidersHorizontal,
  Trash2,
  Upload,
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
  fixturePlanogramLayouts,
  compatibilityFixtureExamples,
  compatibilityFixtureRules,
  fixtureTypes as initialFixtureTypes,
  fixtures as initialFixtures,
  fixtureImageCredits,
  initialAssignments,
  initialBlocks,
  initialFormatBlocks,
  initialInventory,
  initialStores,
  merchAreaCategories,
  merchAreas,
  skus,
  storeFormats,
  type FacingAssignment,
  type FormatPlanningBlock,
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkFixtureCodes, setBulkFixtureCodes] = useState<string[]>([]);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, string>>({});
  const [bulkRegion, setBulkRegion] = useState("");
  const [bulkProperty, setBulkProperty] = useState("");
  const [bulkChannel, setBulkChannel] = useState("");
  const [bulkFormat, setBulkFormat] = useState("");

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
      && store.storeFormatId === next.format
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
    && (!format || store.storeFormatId === format)
    && (!search.trim() || `${store.id} ${store.name}`.toLowerCase().includes(search.trim().toLowerCase()))
  );
  const selectedStore = stores.find(store => store.id === storeId);
  const storeAssignments = inventory.filter(row => row.storeId === storeId && row.change !== "Removed");
  const visibleAssignments = selectedBlockId
    ? storeAssignments.filter(row => compatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === selectedBlockId))
    : storeAssignments;
  const eligibleFixtures = selectedStore
    ? fixtureList.filter(fixture => (fixture.applicableFormatIds ?? storeFormats.map(item => item.id)).includes(selectedStore.storeFormatId))
    : fixtureList;
  const availableTypes = Array.from(new Set(eligibleFixtures.map(fixture => fixture.type))).sort();
  const fixturesOfType = eligibleFixtures.filter(fixture => fixture.type === fixtureType || fixture.code === fixtureCode);
  const selectedFixture = fixturesOfType.find(fixture => fixture.code === fixtureCode) ?? fixturesOfType[0];
  const bulkTargetStores = stores.filter(store =>
    (!bulkRegion || store.region === bulkRegion)
    && (!bulkProperty || store.property === bulkProperty)
    && (!bulkChannel || store.channel === bulkChannel)
    && (!bulkFormat || store.storeFormatId === bulkFormat)
  );
  const bulkFixtures = fixtureList.filter(fixture => bulkFixtureCodes.includes(fixture.code));
  const bulkPreview = bulkTargetStores.map(store => {
    const eligible = bulkFixtures.filter(fixture => (fixture.applicableFormatIds ?? storeFormats.map(item => item.id)).includes(store.storeFormatId));
    const excluded = bulkFixtures.filter(fixture => !eligible.includes(fixture));
    const assignments = inventory.filter(row => row.storeId === store.id && bulkFixtureCodes.includes(row.fixtureCode));
    const overrides = assignments.filter(row => row.assignmentSource === "Store override");
    const activeCodes = new Set(assignments.filter(row => row.change !== "Removed").map(row => row.fixtureCode));
    const preservedOverrides = overrides.filter(row => row.change === "Removed" || activeCodes.has(row.fixtureCode));
    const addable = eligible.filter(fixture =>
      !activeCodes.has(fixture.code)
      && !overrides.some(row => row.fixtureCode === fixture.code),
    );
    return { store, eligible, excluded, overrides: preservedOverrides, activeCodes, addable };
  });
  const bulkEligibleStores = bulkPreview.filter(item => item.eligible.length > 0);
  const bulkExcludedStores = bulkPreview.filter(item => item.excluded.length > 0);
  const bulkOverrideCount = bulkPreview.reduce((total, item) => total + item.overrides.length, 0);
  const bulkQuantitiesValid = bulkFixtureCodes.length > 0 && bulkFixtureCodes.every(code => Number.isInteger(Number(bulkQuantities[code])) && Number(bulkQuantities[code]) > 0);
  const bulkTotalUnits = bulkPreview.reduce((total, item) =>
    total + item.addable.reduce((storeTotal, fixture) => storeTotal + (Number(bulkQuantities[fixture.code]) || 0), 0), 0);
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
    if (!(selectedFixture.applicableFormatIds ?? storeFormats.map(item => item.id)).includes(selectedStore.storeFormatId)) {
      toast({ title: "Fixture is not eligible for this format", description: `${selectedFixture.name} is not applicable to ${storeFormats.find(item => item.id === selectedStore.storeFormatId)?.name ?? "this store format"}.`, variant: "destructive" });
      return;
    }
    const duplicate = inventory.some(row =>
      row.storeId === selectedStore.id
      && row.fixtureCode === selectedFixture.code
      && row.change !== "Removed"
      && row.id !== editingAssignmentId
    );
    if (duplicate) {
      toast({ title: "Fixture already assigned", description: "Edit the existing assignment instead of adding a duplicate.", variant: "destructive" });
      return;
    }
    if (editingAssignmentId) {
      const currentAssignment = inventory.find(row => row.id === editingAssignmentId);
      if (currentAssignment && currentAssignment.fixtureCode !== selectedFixture.code) {
        setInventory(previous => {
          const next = previous.map(row => row.id === editingAssignmentId
            ? { ...row, change: "Removed" as const, assignmentSource: "Store override" as const }
            : row);
          const removedTarget = next.find(row => row.storeId === selectedStore.id && row.fixtureCode === selectedFixture.code && row.change === "Removed");
          if (removedTarget) {
            return next.map(row => row.id === removedTarget.id
              ? { ...row, quantity: parsedQuantity, change: "Added" as const, assignmentSource: "Store override" as const }
              : row);
          }
          return [...next, {
            id: `inv-${Date.now()}-${previous.length + 1}`,
            storeId: selectedStore.id,
            fixtureCode: selectedFixture.code,
            quantity: parsedQuantity,
            change: "Added" as const,
            assignmentSource: "Store override" as const,
          }];
        });
      } else {
        setInventory(previous => previous.map(row => row.id === editingAssignmentId
          ? { ...row, fixtureCode: selectedFixture.code, quantity: parsedQuantity, change: "Added", assignmentSource: "Store override" }
          : row));
      }
      toast({ title: "Fixture assignment updated", description: `${selectedFixture.name} is assigned to Store ${selectedStore.id}.` });
    } else {
      setInventory(previous => {
        const removedAssignment = previous.find(row => row.storeId === selectedStore.id && row.fixtureCode === selectedFixture.code && row.change === "Removed");
        if (removedAssignment) return previous.map(row => row.id === removedAssignment.id
          ? { ...row, quantity: parsedQuantity, change: "Added", assignmentSource: "Store override" }
          : row);
        return [...previous, {
          id: `inv-${Date.now()}-${previous.length + 1}`,
          storeId: selectedStore.id,
          fixtureCode: selectedFixture.code,
          quantity: parsedQuantity,
          change: "Added",
          assignmentSource: "Store override",
        }];
      });
      toast({ title: "Fixture assigned", description: `${parsedQuantity} × ${selectedFixture.name} added to Store ${selectedStore.id} as a store-level override.` });
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
    setInventory(previous => previous.map(row => row.id === removeId
      ? { ...row, change: "Removed", assignmentSource: "Store override" }
      : row));
    setRemoveId(null);
    toast({ title: "Fixture assignment removed", description: "This store-level exception does not change assignments at other stores." });
  };

  const applyBulkAssignments = () => {
    if (!bulkFixtureCodes.length || !bulkEligibleStores.length) return;
    const ruleId = `bulk-${Date.now()}`;
    const created = bulkPreview.reduce((total, item) => total + item.addable.length, 0);
    const duplicateCount = bulkPreview.reduce((total, item) =>
      total + item.eligible.filter(fixture => item.activeCodes.has(fixture.code)).length, 0);
    const overrideCount = bulkPreview.reduce((total, item) => total + item.overrides.length, 0);
    setInventory(previous => {
      let next = [...previous];
      bulkPreview.forEach(({ store, addable }) => {
        addable.forEach(fixture => {
          const removed = next.find(row => row.storeId === store.id && row.fixtureCode === fixture.code && row.change === "Removed");
          if (removed) {
            next = next.map(row => row.id === removed.id
              ? { ...row, change: "Added", assignmentSource: "Bulk rule", bulkRuleId: ruleId, quantity: Number(bulkQuantities[fixture.code]) }
              : row);
          } else {
            next.push({
              id: `${ruleId}-${store.id}-${fixture.code}`,
              storeId: store.id,
              fixtureCode: fixture.code,
              quantity: Number(bulkQuantities[fixture.code]),
              change: "Added",
              assignmentSource: "Bulk rule",
              bulkRuleId: ruleId,
            });
          }
        });
      });
      return next;
    });
    setBulkConfirmOpen(false);
    setBulkOpen(false);
    toast({
      title: "Bulk fixture assignment applied",
      description: `${created} assignments added (${bulkTotalUnits} total fixture quantity). ${duplicateCount} existing assignments and ${overrideCount} store overrides were preserved.`,
    });
    setBulkFixtureCodes([]);
  };

  if (!selectedStore) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <ScreenHeader title="Store Fixture Assignments" description="Find stores, review fixture assignments and apply format-eligible fixtures in bulk." />
          <Button size="sm" onClick={() => setBulkOpen(true)} className="h-9 gap-1.5 bg-primary text-xs hover:bg-primary/90"><Plus className="h-4 w-4" /> Bulk Assign Fixtures</Button>
        </div>
        <div className="grid items-end gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(120px,1fr))_minmax(190px,1.4fr)_auto]">
          <SelectField label="REGION" value={region} onChange={value => updateHierarchy("region", value)} options={[{ value: "", label: "All regions" }, ...Array.from(new Set(stores.map(store => store.region))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="PROPERTY" value={property} onChange={value => updateHierarchy("property", value)} options={[{ value: "", label: "All properties" }, ...Array.from(new Set(propertyStores.map(store => store.property))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="CHANNEL" value={channel} onChange={value => updateHierarchy("channel", value)} options={[{ value: "", label: "All channels" }, ...Array.from(new Set(channelStores.map(store => store.channel))).sort().map(value => ({ value, label: value }))]} />
          <SelectField label="FORMAT" value={format} onChange={value => updateHierarchy("format", value)} options={[{ value: "", label: "All formats" }, ...storeFormats.map(item => ({ value: item.id, label: item.name }))]} />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">SEARCH STORES</span>
            <span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Store number or name" className="h-9 pl-8 text-xs" /></span>
          </label>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-xs"><X className="h-3.5 w-3.5" /> Clear filters</Button>
        </div>
        <Panel title="Stores" description={`${visibleStores.length} matching · ${stores.length} total · ${stores.filter(store => inventory.some(row => row.storeId === store.id && row.change !== "Removed")).length} with fixture assignments`}>
          <Table className="text-xs">
            <TableHeader><TableRow>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Store number</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Store name</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Region</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Property</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Channel</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Format</TableHead>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Assignment status</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Fixtures</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Total fixture EFT</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {visibleStores.map(store => {
                const assignments = inventory.filter(row => row.storeId === store.id && row.change !== "Removed");
                const fixtureCount = assignments.reduce((total, row) => total + row.quantity, 0);
                const storeFormatName = storeFormats.find(item => item.id === store.storeFormatId)?.name ?? "Unknown format";
                return <TableRow key={store.id} className="hover:bg-slate-50">
                  <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{store.id}</TableCell>
                  <TableCell className="px-3 py-2 font-medium text-slate-800">{store.name}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.region}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.property}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{store.channel}</TableCell>
                  <TableCell className="px-3 py-2 text-slate-600">{storeFormatName}</TableCell>
                  <TableCell className="px-3 py-2">{assignments.length ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Assigned</Badge> : <Badge variant="outline">Unassigned</Badge>}</TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{formatNumber(fixtureCount)}</TableCell>
                  <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{assignedEft(assignments).toFixed(1)} EFT</TableCell>
                  <TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[10px] text-primary" onClick={() => setStoreId(store.id)}>View Fixtures <ArrowRight className="h-3 w-3" /></Button></TableCell>
                </TableRow>;
              })}
              {!visibleStores.length && <TableRow><TableCell colSpan={10} className="h-16 text-center text-xs text-slate-500">No stores match these filters. Try changing or clearing your selections.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Panel>
        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Assign Fixtures</DialogTitle>
              <DialogDescription className="text-xs">Choose catalogue definitions and target stores. Format restrictions, duplicates and store-level exceptions are checked before applying.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(420px,1.5fr)]">
              <section className="space-y-3">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">1 · Fixture definitions</h3>
                  <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2">
                    {fixtureList.map(fixture => <div key={fixture.code} className="flex items-center gap-2 rounded p-1.5 hover:bg-slate-50">
                      <Checkbox aria-label={`Select ${fixture.name}`} checked={bulkFixtureCodes.includes(fixture.code)} onCheckedChange={checked => {
                        setBulkFixtureCodes(previous => checked
                          ? [...previous, fixture.code]
                          : previous.filter(code => code !== fixture.code));
                        if (checked) setBulkQuantities(previous => ({ ...previous, [fixture.code]: previous[fixture.code] ?? "" }));
                      }} />
                      <FixturePhoto src={fixture.imageUrl} alt={`${fixture.name} fixture photo`} className="h-9 w-12 shrink-0" />
                      <span className="min-w-0 flex-1 text-[11px]"><span className="block truncate font-medium text-slate-800">{fixture.name}</span><span className="font-mono text-[10px] text-primary">{fixture.code}</span></span>
                      {bulkFixtureCodes.includes(fixture.code) && <label className="text-[9px] text-slate-500">Qty <Input type="number" min="1" step="1" value={bulkQuantities[fixture.code] ?? ""} onChange={event => setBulkQuantities(previous => ({ ...previous, [fixture.code]: event.target.value }))} className="mt-0.5 h-7 w-16 text-center text-[10px]" /></label>}
                    </div>)}
                  </div>
                  {bulkFixtureCodes.length > 0 && !bulkQuantitiesValid && <p className="mt-1 text-[10px] text-amber-700">Enter a whole quantity of at least 1 for every selected fixture definition.</p>}
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">2 · Target store criteria</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <SelectField label="FORMAT" value={bulkFormat} onChange={setBulkFormat} options={[{ value: "", label: "All formats" }, ...storeFormats.map(item => ({ value: item.id, label: item.name }))]} />
                    <SelectField label="REGION" value={bulkRegion} onChange={setBulkRegion} options={[{ value: "", label: "All regions" }, ...Array.from(new Set(stores.map(store => store.region))).sort().map(value => ({ value, label: value }))]} />
                    <SelectField label="PROPERTY" value={bulkProperty} onChange={setBulkProperty} options={[{ value: "", label: "All properties" }, ...Array.from(new Set(stores.map(store => store.property))).sort().map(value => ({ value, label: value }))]} />
                    <SelectField label="CHANNEL" value={bulkChannel} onChange={setBulkChannel} options={[{ value: "", label: "All channels" }, ...Array.from(new Set(stores.map(store => store.channel))).sort().map(value => ({ value, label: value }))]} />
                  </div>
                </div>
              </section>
              <section className="min-w-0">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">3 · Review matching stores</h3>
                <div className="mt-2 mb-2 flex flex-wrap gap-2 text-[10px]">
                  <Badge variant="outline">{bulkTargetStores.length} matching stores</Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{bulkEligibleStores.length} with eligible fixtures</Badge>
                  <Badge variant="outline">{bulkPreview.reduce((count, item) => count + item.addable.length, 0)} new assignments</Badge>
                  {bulkExcludedStores.length > 0 && <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50">{bulkExcludedStores.length} with format exclusions</Badge>}
                </div>
                <div className="max-h-[28rem] overflow-auto rounded-md border border-slate-200">
                  <Table className="text-xs">
                    <TableHeader><TableRow>
                      <TableHead className="h-8 px-2 text-[10px]">Store</TableHead>
                      <TableHead className="h-8 px-2 text-[10px]">Format</TableHead>
                      <TableHead className="h-8 px-2 text-[10px]">Eligible / excluded</TableHead>
                      <TableHead className="h-8 px-2 text-[10px]">Existing / exceptions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>{bulkPreview.map(({ store, eligible, excluded, overrides, activeCodes, addable }) => <TableRow key={store.id}>
                      <TableCell className="whitespace-nowrap px-2 py-1.5"><span className="font-mono text-primary">{store.id}</span><span className="ml-1 text-slate-700">{store.name}</span></TableCell>
                      <TableCell className="whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600">{storeFormats.find(item => item.id === store.storeFormatId)?.name ?? "Unknown"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[10px]">
                        {bulkFixtureCodes.length ? <><span className="text-emerald-700">{eligible.length} eligible</span>{excluded.length > 0 && <span className="ml-1 text-amber-700" title={excluded.map(item => item.name).join(", ")}>· {excluded.length} excluded</span>}</> : <span className="text-slate-400">Select fixtures</span>}
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-[10px]">
                        {bulkFixtureCodes.length ? <><span>{eligible.filter(item => activeCodes.has(item.code)).length} already assigned</span>{overrides.length > 0 && <span className="ml-1 font-medium text-amber-700" title={overrides.map(item => `${item.fixtureCode}: ${item.change}`).join(", ")}>· {overrides.length} overrides preserved</span>}</> : <span className="text-slate-400">—</span>}
                      </TableCell>
                    </TableRow>)}
                    {!bulkPreview.length && <TableRow><TableCell colSpan={4} className="h-16 text-center text-xs text-slate-500">No stores match these criteria.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
                {bulkExcludedStores.length > 0 && <p className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-900">Stores in the preview remain visible, but fixtures outside their applicable format are excluded and will not be assigned.</p>}
                {bulkOverrideCount > 0 && <p className="mt-2 rounded border border-blue-200 bg-blue-50 p-2 text-[10px] text-blue-900">Matching store-level overrides are preserved. Bulk assignments do not replace or reactivate those exceptions.</p>}
              </section>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setBulkOpen(false)}>Cancel</Button>
              <Button size="sm" disabled={!bulkQuantitiesValid || !bulkPreview.some(item => item.addable.length > 0)} onClick={() => setBulkConfirmOpen(true)} className="bg-primary hover:bg-primary/90">Review and confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply bulk fixture assignments?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Add {bulkPreview.reduce((total, item) => total + item.addable.length, 0)} eligible fixture assignments ({bulkTotalUnits} total fixture quantity) across {bulkPreview.filter(item => item.addable.length > 0).length} stores. Ineligible formats, duplicates, and {bulkOverrideCount} store-level overrides will be left unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Go back</AlertDialogCancel><AlertDialogAction onClick={applyBulkAssignments} className="bg-primary text-white hover:bg-primary/90">Apply assignments</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button type="button" onClick={() => setStoreId(null)} className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"><ChevronRight className="h-3 w-3 rotate-180" /> Store Fixture Assignments</button>
          <ScreenHeader title={`Store ${selectedStore.id} — ${selectedStore.name}`} description={`${selectedStore.region} · ${selectedStore.property} · ${selectedStore.channel} · ${storeFormats.find(item => item.id === selectedStore.storeFormatId)?.name ?? "Unknown format"}`} />
        </div>
        <Button size="sm" onClick={() => { const firstEligible = eligibleFixtures[0]; setEditingAssignmentId(null); setQuantity("1"); setFixtureType(firstEligible?.type ?? ""); setFixtureCode(firstEligible?.code ?? ""); setAddOpen(true); }} className="h-9 gap-1.5 bg-primary text-xs hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Fixture</Button>
      </div>

      <Panel title="Fixture assignments" description={`${visibleAssignments.reduce((total, row) => total + row.quantity, 0)} fixture instances · ${selectedBlockId ? "EFT reflects allocation to the selected block" : "EFT reflects total physical fixture area"}`} right={<SelectField label="MERCHANDISING BLOCK" value={selectedBlockId} onChange={setSelectedBlockId} options={[{ value: "", label: "All merchandising blocks" }, ...blocks.map(block => ({ value: block.id, label: block.name }))]} className="w-52" />}>
        <Table className="text-xs">
          <TableHeader><TableRow>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Type / subtype</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Dimensions</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Quantity</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Physical EFT / fixture</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">{selectedBlockId ? `EFT · ${blocks.find(block => block.id === selectedBlockId)?.name ?? "selected block"}` : "Total physical EFT"}</TableHead>
            <TableHead className="h-9 px-3 text-[10px] tracking-wide">Assignment status / source</TableHead>
            <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {visibleAssignments.map(row => {
              const fixture = fixtureList.find(item => item.code === row.fixtureCode);
              if (!fixture) return null;
              const totalEft = fixture.eft * row.quantity * (selectedBlockId ? getBlockShare(row.fixtureCode, selectedBlockId) : 1);
              return <TableRow key={row.id}>
                <TableCell className="px-3 py-2">
                  <div className="flex min-w-40 items-center gap-2">
                    <FixturePhoto src={fixture.imageUrl} alt={`${fixture.name} fixture photo`} className="h-10 w-14 shrink-0" />
                    <span><span className="block font-medium text-slate-800">{fixture.name}</span><span className="font-mono text-[10px] text-primary">{fixture.code}</span></span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2 text-slate-700"><span className="block">{fixture.type}</span><span className="text-[10px] text-slate-500">{fixture.subtype || "—"}</span></TableCell>
                <TableCell className="whitespace-nowrap px-3 py-2 text-[10px] text-slate-600">{fixture.dimensions || "—"}</TableCell>
                <TableCell className="px-3 py-2 text-right"><Input type="number" min="1" step="1" value={row.quantity} onChange={event => {
                  const nextQuantity = Math.max(1, Math.floor(Number(event.target.value) || 1));
                  setInventory(previous => previous.map(item => item.id === row.id ? { ...item, quantity: nextQuantity, change: "Added", assignmentSource: "Store override" } : item));
                }} className="ml-auto h-7 w-16 text-center text-xs" aria-label={`Quantity of ${fixture.name} at Store ${selectedStore.id}`} /></TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft.toFixed(1)} EFT</TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums font-medium text-slate-800">{totalEft.toFixed(1)} EFT</TableCell>
                <TableCell className="px-3 py-2">
                  <Badge variant="outline">{row.change}</Badge>
                  <span className={`mt-1 block text-[9px] ${row.assignmentSource === "Store override" ? "font-medium text-amber-700" : row.assignmentSource === "Bulk rule" ? "text-primary" : "text-slate-500"}`}>{row.assignmentSource ?? "Existing store data"}{row.bulkRuleId && row.assignmentSource === "Store override" ? " · exception" : ""}</span>
                  <span className="mt-0.5 block text-[9px] text-slate-400">Definition: {fixture.status}</span>
                </TableCell>
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
              setFixtureCode(eligibleFixtures.find(fixture => fixture.type === value)?.code ?? "");
            }} options={availableTypes.map(value => ({ value, label: value }))} />
            <SelectField label="FIXTURE SUBTYPE / DEFINITION" value={selectedFixture?.code ?? ""} onChange={setFixtureCode} options={fixturesOfType.map(fixture => ({ value: fixture.code, label: `${fixture.subtype || fixture.name} · ${fixture.code}` }))} />
            <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-600">QUANTITY</span><Input type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} className="h-9 text-xs" /></label>
          </div>
          {selectedFixture && <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <FixturePhoto src={selectedFixture.imageUrl} alt={`${selectedFixture.name} fixture photo`} className="h-20 w-28 shrink-0" />
            <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">{selectedFixture.name} <span className="font-mono font-normal text-primary">{selectedFixture.code}</span></p>
            <p className="mt-1 text-[10px] text-slate-600">{selectedFixture.type} · {selectedFixture.subtype || "No subtype"} · {selectedFixture.dimensions || "Dimensions not specified"} · {selectedFixture.eft.toFixed(1)} EFT</p>
            <p className="mt-1 text-[10px] text-slate-600">Eligible for {storeFormats.find(item => item.id === selectedStore.storeFormatId)?.name ?? "this store format"} · Definition status: {selectedFixture.status}</p>
            <p className="mt-1 text-[10px] text-slate-500">Compatible blocks: {Array.from(new Set(compatibility.filter(rule => rule.fixtureCode === selectedFixture.code).map(rule => blocks.find(block => block.id === rule.blockId)?.name).filter((name): name is string => Boolean(name)))).join(", ") || "No block compatibility configured"}</p>
            <p className="mt-1 text-[10px] text-slate-500">EFT is physical space. Any block-level allocation uses the configured fixture-to-block share.</p>
            </div>
          </div>}
          {!eligibleFixtures.length && <p className="text-[11px] text-amber-700">No fixture definitions are eligible for this store format.</p>}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button><Button size="sm" disabled={!selectedFixture} onClick={addFixtureAssignment} className="bg-primary hover:bg-primary/90">{editingAssignmentId ? "Save assignment" : `Add to Store ${selectedStore.id}`}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(removeId)} onOpenChange={open => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove fixture assignment?</AlertDialogTitle><AlertDialogDescription className="text-xs">This creates a store-level removal exception for Store {selectedStore.id}. Other stores and the bulk rule remain unchanged.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep assignment</AlertDialogCancel><AlertDialogAction onClick={confirmRemove} className="bg-rose-600 text-white hover:bg-rose-700">Remove assignment</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MerchandisingBlocks({ blocks, setBlocks }: {
  blocks: Record<string, FormatPlanningBlock[]>;
  setBlocks: React.Dispatch<React.SetStateAction<Record<string, FormatPlanningBlock[]>>>;
}) {
  const { toast } = useToast();
  const [formatId, setFormatId] = useState(storeFormats[0].id);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [areaFilter, setAreaFilter] = useState("Any area count");
  const [editor, setEditor] = useState<BlockEditorState>({ open: false });
  const [viewingBlockId, setViewingBlockId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [blockStatus, setBlockStatus] = useState<FormatPlanningBlock["status"]>("Draft");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const areaResultLimit = 12;

  const selectedFormat = storeFormats.find(format => format.id === formatId) ?? storeFormats[0];
  const formatBlocks = blocks[selectedFormat.id] ?? [];
  const filteredBlocks = formatBlocks.filter(block => {
    const text = `${block.name} ${block.code} ${block.areaIds.map(areaName).join(" ")}`.toLowerCase();
    if (!text.includes(search.trim().toLowerCase())) return false;
    if (status !== "All statuses" && block.status !== status) return false;
    if (areaFilter === "Single area" && block.areaIds.length !== 1) return false;
    if (areaFilter === "Multiple areas" && block.areaIds.length < 2) return false;
    return true;
  });
  const editBlock = formatBlocks.find(block => block.id === editor.blockId);
  const viewingBlock = formatBlocks.find(block => block.id === viewingBlockId);
  const deletingBlock = formatBlocks.find(block => block.id === deletingBlockId);
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

  const openEditor = (block?: FormatPlanningBlock) => {
    setName(block?.name ?? "");
    if (block) {
      setCode(block.code);
    } else {
      const existingCodes = new Set(formatBlocks.map(item => item.code));
      let sequence = formatBlocks.length + 1;
      let nextCode = `MB-${selectedFormat.code}-${String(sequence).padStart(3, "0")}`;
      while (existingCodes.has(nextCode)) {
        sequence += 1;
        nextCode = `MB-${selectedFormat.code}-${String(sequence).padStart(3, "0")}`;
      }
      setCode(nextCode);
    }
    setBlockStatus(block?.status ?? "Draft");
    setSelectedAreas(block ? [...block.areaIds] : []);
    setAreaSearch("");
    setCategoryFilter("");
    setSubcategoryFilter("");
    setEditor({ open: true, blockId: block?.id });
  };

  const saveBlock = () => {
    if (!name.trim()) {
      toast({ title: "Block name required", description: "Enter a block name before saving.", variant: "destructive" });
      return;
    }
    if (!selectedAreas.length) {
      toast({ title: "Select merchandise areas", description: "A block must include at least one merchandise area.", variant: "destructive" });
      return;
    }
    const id = editor.blockId ?? `${selectedFormat.id}-block-${Date.now()}`;
    setBlocks(previous => editor.blockId
      ? {
        ...previous,
        [selectedFormat.id]: (previous[selectedFormat.id] ?? []).map(block => block.id === id
          ? { ...block, name: name.trim(), areaIds: [...selectedAreas], status: blockStatus }
          : block),
      }
      : {
        ...previous,
        [selectedFormat.id]: [...(previous[selectedFormat.id] ?? []), {
          id,
          formatId: selectedFormat.id,
          code,
          name: name.trim(),
          areaIds: [...selectedAreas],
          status: blockStatus,
        }],
      });
    setEditor({ open: false });
    toast({ title: editor.blockId ? "Block updated" : "Block created", description: `${name.trim()} now contains ${selectedAreas.length} merchandise area${selectedAreas.length === 1 ? "" : "s"}.` });
  };

  const confirmDelete = () => {
    if (!deletingBlock) return;
    setBlocks(previous => ({
      ...previous,
      [selectedFormat.id]: (previous[selectedFormat.id] ?? []).filter(block => block.id !== deletingBlock.id),
    }));
    setDeletingBlockId(null);
    toast({ title: "Block deleted", description: `${deletingBlock.name} was removed from ${selectedFormat.name}.` });
  };

  const toggleArea = (id: string) => setSelectedAreas(previous => previous.includes(id) ? previous.filter(areaId => areaId !== id) : [...previous, id]);
  return (
    <>
      <div className="space-y-4">
        <ScreenHeader title="Merchandising Blocks" description="Manage format-specific merchandising block definitions." />
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-end gap-4">
            <SelectField label="STORE FORMAT" value={selectedFormat.id} onChange={value => { setFormatId(value); setSearch(""); setStatus("All statuses"); setAreaFilter("Any area count"); }} options={storeFormats.map(format => ({ value: format.id, label: format.name }))} className="w-72" />
            <div className="pb-2 text-[11px] text-slate-500">Selected format: <strong className="text-slate-800">{selectedFormat.name}</strong></div>
            <Metric compact label="Blocks in format" value={String(formatBlocks.length)} />
          </div>
          <Button size="sm" onClick={() => openEditor()} className="h-8 gap-2 bg-primary text-xs hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> New Block</Button>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-56 flex-1"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH BLOCKS</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Block name or code" className="h-8 pl-8 text-xs" /></span></label>
          <SelectField label="STATUS" value={status} onChange={setStatus} options={["All statuses", "Active", "Draft", "Review"].map(value => ({ value, label: value }))} className="w-40" />
          <SelectField label="AREA MEMBERSHIP" value={areaFilter} onChange={setAreaFilter} options={["Any area count", "Single area", "Multiple areas"].map(value => ({ value, label: value }))} className="w-44" />
        </div>
        <Panel title={`${selectedFormat.name} · Block library`} description={`${filteredBlocks.length} of ${formatBlocks.length} blocks`}>
          <Table className="text-xs">
            <TableHeader><TableRow><TableHead className="h-9 px-3 text-[10px] tracking-wide">Block code</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Block name</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Merchandise areas</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Area count</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Status</TableHead><TableHead className="h-9 w-28 px-2 text-right text-[10px] tracking-wide">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredBlocks.map(block => <TableRow key={block.id}>
                <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{block.code}</TableCell>
                <TableCell className="px-3 py-2 font-medium text-slate-800">{block.name}</TableCell>
                <TableCell className="px-3 py-2"><div className="flex max-h-20 max-w-xl flex-wrap gap-1 overflow-y-auto">{block.areaIds.map(id => <span key={id} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">{areaName(id)}</span>)}</div></TableCell>
                <TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{block.areaIds.length}</TableCell>
                <TableCell className="px-3 py-2"><Status value={block.status} /></TableCell>
                <TableCell className="px-2 py-2 text-right">
                  <Button variant="ghost" size="sm" aria-label={`View ${block.name}`} onClick={() => setViewingBlockId(block.id)} className="h-7 w-7 p-0 text-slate-500"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditor(block)} className="h-7 px-1.5 text-[11px] text-primary">Edit</Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${block.name}`} onClick={() => setDeletingBlockId(block.id)} className="h-7 w-7 p-0 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>)}
              {!filteredBlocks.length && <TableRow><TableCell colSpan={6} className="h-16 px-3 py-2 text-center text-xs text-slate-500">{formatBlocks.length ? "No blocks match the selected filters." : `No merchandising blocks are defined for ${selectedFormat.name}.`}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Panel>
      </div>
      <Dialog open={editor.open} onOpenChange={open => setEditor(open ? editor : { open: false })}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-slate-200 px-5 py-4">
            <DialogTitle className="text-base">{editBlock ? "Edit merchandising block" : "Create merchandising block"}</DialogTitle>
            <DialogDescription className="text-xs">This definition belongs to {selectedFormat.name}. Add any combination of merchandise areas.</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[66vh] gap-0 overflow-hidden md:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-3 overflow-y-auto p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Store format</span><Input value={selectedFormat.name} readOnly className="h-9 bg-slate-50 text-xs" /></label>
                <label><span className="mb-1 block text-[11px] font-semibold text-slate-600">Block code</span><Input value={code} readOnly className="h-9 bg-slate-50 font-mono text-xs" /></label>
              </div>
              <label className="block"><span className="mb-1 block text-[11px] font-semibold text-slate-600">Block name</span><Input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Beverage Block" className="h-9 text-xs" /></label>
              <SelectField label="STATUS" value={blockStatus} onChange={value => setBlockStatus(value as FormatPlanningBlock["status"])} options={["Active", "Draft", "Review"].map(value => ({ value, label: value }))} />
              <label className="block"><span className="mb-1 block text-[10px] font-semibold text-slate-500">SEARCH MERCHANDISE AREA NAME OR CODE</span><span className="relative block"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input value={areaSearch} onChange={event => setAreaSearch(event.target.value)} placeholder={`Search ${merchAreas.length} areas...`} className="h-8 pl-8 text-xs" /></span></label>
              <div className="grid gap-2 sm:grid-cols-2">
                <SelectField label="CATEGORY" value={categoryFilter} onChange={value => { setCategoryFilter(value); setSubcategoryFilter(""); }} options={[{ value: "", label: "All categories" }, ...merchAreaCategories.map(value => ({ value, label: value }))]} />
                {categoryFilter && <SelectField label="SUBCATEGORY" value={subcategoryFilter} onChange={setSubcategoryFilter} options={[{ value: "", label: "Choose subcategory" }, { value: "All subcategories", label: "All subcategories" }, ...subcategories.map(value => ({ value, label: value }))]} />}
              </div>
              <p className="text-[10px] text-slate-500">Search scope: <span className="font-medium text-slate-700">{searchScope}</span></p>
              {shouldShowAreaResults ? <div className="overflow-hidden rounded-md border border-slate-200" aria-label={`${areaResults.length} merchandise area results`}>
                <div className="max-h-64 overflow-auto">
                  {visibleAreaResults.map(area => {
                    return <label key={area.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0 hover:bg-slate-50">
                      <Checkbox checked={selectedAreas.includes(area.id)} onCheckedChange={() => toggleArea(area.id)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-700">{area.name} <span className="font-mono text-[10px] font-normal text-slate-400">{area.code}</span></span>
                        <span className="block truncate text-[10px] text-slate-400">{area.category} / {area.subcategory}</span>
                      </span>
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
      <Dialog open={Boolean(viewingBlock)} onOpenChange={open => !open && setViewingBlockId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{viewingBlock?.name}</DialogTitle>
            <DialogDescription className="text-xs">Format-specific block definition</DialogDescription>
          </DialogHeader>
          {viewingBlock && <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[10px] font-semibold uppercase text-slate-500">Store format</p><p className="mt-1 font-medium text-slate-800">{selectedFormat.name}</p></div>
              <div><p className="text-[10px] font-semibold uppercase text-slate-500">Block code</p><p className="mt-1 font-mono text-primary">{viewingBlock.code}</p></div>
              <div><p className="text-[10px] font-semibold uppercase text-slate-500">Status</p><div className="mt-1"><Status value={viewingBlock.status} /></div></div>
              <div><p className="text-[10px] font-semibold uppercase text-slate-500">Merchandise areas</p><p className="mt-1 font-medium text-slate-800">{viewingBlock.areaIds.length}</p></div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Associated merchandise areas</p>
              <div className="flex flex-wrap gap-1.5">{viewingBlock.areaIds.map(id => <span key={id} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-700">{areaName(id)}</span>)}</div>
            </div>
          </div>}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setViewingBlockId(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deletingBlock)} onOpenChange={open => !open && setDeletingBlockId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete merchandising block?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">This removes {deletingBlock?.name} from {selectedFormat.name} only. Definitions in other store formats are unchanged.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 text-white hover:bg-rose-700">Delete block</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    <div className="space-y-3">
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

function FixturePhoto({ src, alt, className }: { src?: string; alt: string; className: string }) {
  return src
    ? <img src={src} alt={alt} className={`${className} rounded border border-slate-200 bg-white object-cover`} />
    : <div role="img" aria-label={alt || "No fixture photo uploaded"} className={`${className} flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-slate-400`}>
      <ImageIcon className="h-4 w-4" />
    </div>;
}

function FixtureAppearanceFields({ imageUrl, required, applicableFormatIds, onImageChange, onFormatsChange }: {
  imageUrl?: string;
  required: boolean;
  applicableFormatIds?: string[];
  onImageChange: (imageUrl: string) => void;
  onFormatsChange: (formatIds: string[]) => void;
}) {
  const { toast } = useToast();
  const selectedFormats = applicableFormatIds ?? storeFormats.map(format => format.id);
  const allSelected = selectedFormats.length === storeFormats.length;
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: "Unsupported image type", description: "Choose a JPG, PNG, or WebP photo.", variant: "destructive" });
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "Choose a photo no larger than 5 MB.", variant: "destructive" });
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast({ title: "Could not read image", description: "Please choose the photo again.", variant: "destructive" });
        return;
      }
      onImageChange(reader.result);
    };
    reader.onerror = () => toast({ title: "Could not read image", description: "Please choose the photo again.", variant: "destructive" });
    reader.readAsDataURL(file);
  };
  const toggleFormat = (formatId: string) => {
    onFormatsChange(selectedFormats.includes(formatId)
      ? selectedFormats.filter(id => id !== formatId)
      : [...selectedFormats, formatId]);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
        <FixturePhoto src={imageUrl} alt={imageUrl ? "Uploaded fixture photo preview" : "No fixture photo uploaded"} className="h-20 w-28 shrink-0" />
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">Upload actual fixture photo{required ? <span className="text-rose-600"> · Required</span> : ""}</span>
          <span className="relative flex h-9 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:border-primary">
            <Upload className="h-3.5 w-3.5 text-primary" />
            {imageUrl ? "Replace photo" : "Choose photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" required={required} onChange={onFileChange} aria-label="Upload actual fixture photo" className="absolute inset-0 cursor-pointer opacity-0" />
          </span>
          <span className="mt-1 block text-[10px] text-slate-500">JPG, PNG or WebP · up to 5 MB. Uploaded in this session only.</span>
        </label>
      </div>
      <fieldset className="rounded-md border border-slate-200 p-3 sm:col-span-2">
        <legend className="px-1 text-[11px] font-semibold text-slate-600">Applicable Store Formats</legend>
        <label className="mb-2 flex cursor-pointer items-center gap-2 border-b border-slate-100 pb-2 text-[11px] font-medium text-slate-800">
          <Checkbox checked={allSelected} onCheckedChange={checked => onFormatsChange(checked ? storeFormats.map(format => format.id) : [])} />
          All formats
        </label>
        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {storeFormats.map(format => <label key={format.id} className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
            <Checkbox checked={selectedFormats.includes(format.id)} onCheckedChange={() => toggleFormat(format.id)} />
            {format.name}
          </label>)}
        </div>
        {!selectedFormats.length && <p className="mt-2 text-[10px] text-amber-700">Select at least one format to make this fixture applicable.</p>}
      </fieldset>
    </>
  );
}

function FixtureMaster({ blocks, fixtureList, setFixtureList, fixtureTypes, setFixtureTypes, compatibility, inventory, setInventory, stores, setCompatFixture }: {
  blocks: PlanningBlock[];
  fixtureList: Fixture[];
  setFixtureList: React.Dispatch<React.SetStateAction<Fixture[]>>;
  fixtureTypes: FixtureType[];
  setFixtureTypes: React.Dispatch<React.SetStateAction<FixtureType[]>>;
  compatibility: FixtureCompatibility[];
  inventory: StoreInventory[];
  setInventory: React.Dispatch<React.SetStateAction<StoreInventory[]>>;
  stores: PlanningStore[];
  setCompatFixture: (code: string) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [catalogView, setCatalogView] = useState<"hierarchy" | "list">("hierarchy");
  const [fixtureTypeFilter, setFixtureTypeFilter] = useState("All fixture types");
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState("All statuses");
  const [fixtureFormatFilter, setFixtureFormatFilter] = useState("All formats");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(() => new Set(initialFixtureTypes.map(type => type.id)));
  const [sortBy, setSortBy] = useState<"code" | "name" | "type" | "dimensions" | "eft" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [addFixtureOpen, setAddFixtureOpen] = useState(false);
  const [viewingFixtureCode, setViewingFixtureCode] = useState<string | null>(null);
  const [editor, setEditor] = useState<
    | { kind: "type"; typeId?: string; name: string; status: FixtureType["status"]; mode: "group" | "standalone"; standalone: Fixture }
    | { kind: "fixture"; fixture: Fixture; isNew: boolean }
    | null
  >(null);
  const [selectedFixture, setSelectedFixture] = useState(fixtureList[0]?.code ?? "");
  const [inventoryStoreId, setInventoryStoreId] = useState<string | null>(null);

  const selectedFixtureRow = fixtureList.find(fixture => fixture.code === selectedFixture);
  const viewingFixture = fixtureList.find(fixture => fixture.code === viewingFixtureCode);
  const allFormatIds = storeFormats.map(format => format.id);
  const applicableFormats = (fixture: Fixture) => fixture.applicableFormatIds ?? allFormatIds;
  const imageCreditFor = (imageUrl?: string) => imageUrl ? fixtureImageCredits[imageUrl] : undefined;
  const viewingImageCredit = imageCreditFor(viewingFixture?.imageUrl);
  const formatSummary = (fixture: Fixture) => {
    const formatIds = applicableFormats(fixture);
    if (formatIds.length === allFormatIds.length) return "All formats";
    if (formatIds.length <= 2) return formatIds.map(id => storeFormats.find(format => format.id === id)?.name ?? id).join(", ");
    return `${formatIds.length} formats`;
  };
  const hasSelectedFormat = (fixture: Fixture) => fixtureFormatFilter === "All formats" || applicableFormats(fixture).includes(fixtureFormatFilter);
  const tabList = [
    ["catalog", "Fixture Catalogue"],
    ["inventory", "Store Fixture Assignments"],
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const typeName = (id?: string) => fixtureTypes.find(type => type.id === id)?.name ?? "";
  const matchesFixtureQuery = (fixture: Fixture) => `${fixture.code} ${fixture.name} ${fixture.type} ${fixture.subtype}`.toLowerCase().includes(normalizedQuery);
  const matchesFixtureFilters = (fixture: Fixture) =>
    (fixtureTypeFilter === "All fixture types" || fixture.type === fixtureTypeFilter)
    && (fixtureStatusFilter === "All statuses" || fixture.status === fixtureStatusFilter)
    && hasSelectedFormat(fixture);
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
    && (group.visibleChildren.length > 0 || Boolean(normalizedQuery && group.typeMatchesQuery) || (!normalizedQuery && fixtureStatusFilter === "All statuses" && fixtureFormatFilter === "All formats")));
  const standaloneFixtures = fixtureList.filter(fixture => !fixture.parentTypeId && matchesFixtureFilters(fixture) && matchesFixtureQuery(fixture));
  const openTypeEditor = (mode: "group" | "standalone", type?: FixtureType) => {
    setAddFixtureOpen(false);
    setEditor({
      kind: "type",
      typeId: type?.id,
      name: type?.name ?? "",
      status: type?.status ?? "Active",
      mode,
      standalone: { code: "", name: "", type: "", subtype: "", dimensions: "", eft: 0, status: "Active", applicableFormatIds: [...allFormatIds] },
    });
  };
  const openFixtureEditor = (fixture: Fixture, isNew: boolean) => {
    setAddFixtureOpen(false);
    setEditor({
      kind: "fixture",
      fixture: {
        ...fixture,
        applicableFormatIds: [...applicableFormats(fixture)],
      },
      isNew,
    });
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
        const fixture = { ...editor.standalone, name, type: name, subtype: "", applicableFormatIds: editor.standalone.applicableFormatIds ?? [...allFormatIds] };
        if (!fixture.code.trim()) {
          toast({ title: "Fixture code is required for a standalone definition", variant: "destructive" });
          return;
        }
        if (!fixture.imageUrl) {
          toast({ title: "Fixture photo is required", description: "Upload an actual photo of this fixture before saving.", variant: "destructive" });
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
        if (!fixture.applicableFormatIds.length) {
          toast({ title: "Select an applicable store format", description: "A fixture must be applicable to at least one store format.", variant: "destructive" });
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
    if (!fixture.imageUrl) {
      toast({ title: "Fixture photo is required", description: "Upload an actual photo of this fixture before saving.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(fixture.eft) || fixture.eft < 0) {
      toast({ title: "Enter a valid EFT value", description: "EFT must be zero or greater.", variant: "destructive" });
      return;
    }
    if (!(fixture.applicableFormatIds ?? allFormatIds).length) {
      toast({ title: "Select an applicable store format", description: "A fixture must be applicable to at least one store format.", variant: "destructive" });
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
      applicableFormatIds: fixture.applicableFormatIds ?? [...allFormatIds],
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
            <SelectField label="APPLICABLE FORMAT" value={fixtureFormatFilter} onChange={setFixtureFormatFilter} options={[{ value: "All formats", label: "All formats" }, ...storeFormats.map(format => ({ value: format.id, label: format.name }))]} className="w-52" />
            <span className="pb-2 text-[10px] text-slate-500">{filteredFixtures.length} fixture definitions</span>
          </div>
          {catalogView === "hierarchy" ? <Panel title="Fixture catalogue" description="Types group specific fixture configurations; standalone fixtures remain top-level definitions.">
            <Table className="text-xs"><TableHeader><TableRow><TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture type / subtype</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Fixture code</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Dimensions</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">EFT</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Applicable formats</TableHead><TableHead className="h-9 px-3 text-[10px] tracking-wide">Status</TableHead><TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {groupedFixtures.map(({ type, children, visibleChildren, typeMatchesQuery }) => {
                  const expanded = expandedTypes.has(type.id) || Boolean(normalizedQuery && (typeMatchesQuery || visibleChildren.length));
                  const activeCount = visibleChildren.filter(fixture => fixture.status === "Active").length;
                  const reviewCount = visibleChildren.length - activeCount;
                  return <Fragment key={type.id}>
                    <TableRow className="bg-slate-50/70">
                      <TableCell className="px-3 py-2"><div className="flex items-center gap-1.5">
                        {children.length > 0 ? <button type="button" disabled={Boolean(normalizedQuery && (typeMatchesQuery || visibleChildren.length))} aria-label={`${expanded ? "Collapse" : "Expand"} ${type.name}`} aria-expanded={expanded} onClick={() => setExpandedTypes(previous => { const next = new Set(previous); if (next.has(type.id)) next.delete(type.id); else next.add(type.id); return next; })} className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-primary disabled:cursor-default">{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button> : <span className="w-5" />}
                        <span className="font-semibold text-slate-800">{type.name}</span><span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-500">Grouping · {visibleChildren.length} {visibleChildren.length === 1 ? "subtype" : "subtypes"}</span>
                      </div></TableCell>
                      <TableCell colSpan={4} className="px-3 py-2 text-[10px] text-slate-500">{visibleChildren.length ? `${activeCount} active${reviewCount ? ` · ${reviewCount} in review` : ""}` : "No applicable subtypes"}</TableCell>
                      <TableCell className="px-3 py-2"><Status value={type.status} /></TableCell>
                      <TableCell className="px-3 py-2 text-right"><div className="inline-flex gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openTypeEditor("group", type)}>Edit type</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor({ code: "", name: "", type: type.name, subtype: "", parentTypeId: type.id, dimensions: "", eft: 0, status: "Active" }, true)}>Add subtype</Button></div></TableCell>
                    </TableRow>
                    {expanded && visibleChildren.map(fixture => <TableRow key={fixture.code}>
                      <TableCell className="px-3 py-2"><div className="flex items-center gap-2 pl-7"><span className="h-4 border-l border-slate-200" /><FixturePhoto src={fixture.imageUrl} alt={`${fixture.name} fixture photo`} className="h-8 w-10 shrink-0" /><span className="font-medium text-slate-800">{fixture.name}</span>{fixture.subtype && <span className="text-[10px] text-slate-400">{fixture.subtype}</span>}</div></TableCell>
                      <TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2 text-[10px] text-slate-600">{formatSummary(fixture)}</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => setViewingFixtureCode(fixture.code)}>View</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
                    </TableRow>)}
                    {expanded && normalizedQuery && typeMatchesQuery && !visibleChildren.length && <TableRow><TableCell colSpan={7} className="py-3 pl-12 text-[10px] text-slate-500">No subtypes match the selected status filter.</TableCell></TableRow>}
                  </Fragment>;
                })}
                {standaloneFixtures.map(fixture => <TableRow key={fixture.code}>
                  <TableCell className="px-3 py-2"><div className="flex items-center gap-2"><FixturePhoto src={fixture.imageUrl} alt={`${fixture.name} fixture photo`} className="h-8 w-10 shrink-0" /><span className="font-medium text-slate-800">{fixture.name}</span><span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-500">Standalone</span></div></TableCell><TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2 text-[10px] text-slate-600">{formatSummary(fixture)}</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => setViewingFixtureCode(fixture.code)}>View</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
                </TableRow>)}
                {!groupedFixtures.length && !standaloneFixtures.length && <TableRow><TableCell colSpan={7} className="h-16 px-3 text-center text-xs text-slate-500">No fixture definitions match these filters.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Panel> : <Panel title="Fixture list" description="A flat list of all assignable fixture definitions, including standalone fixtures.">
            <Table className="text-xs"><TableHeader><TableRow>
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Image</TableHead>
              {([["code", "Fixture code"], ["name", "Fixture name"], ["type", "Parent fixture type"], ["dimensions", "Dimensions"], ["eft", "EFT"], ["status", "Status"]] as const).map(([column, label]) => <TableHead key={column} className="h-9 px-3 text-[10px] tracking-wide"><button type="button" onClick={() => { if (sortBy === column) setSortDirection(previous => previous === "asc" ? "desc" : "asc"); else { setSortBy(column); setSortDirection("asc"); } }} className="inline-flex items-center gap-1 hover:text-primary">{label}<span aria-hidden="true">{sortBy === column ? sortDirection === "asc" ? "↑" : "↓" : "↕"}</span></button></TableHead>)}
              <TableHead className="h-9 px-3 text-[10px] tracking-wide">Applicable formats</TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] tracking-wide">Actions</TableHead>
            </TableRow></TableHeader><TableBody>{filteredFixtures.map(fixture => <TableRow key={fixture.code}>
              <TableCell className="px-3 py-2"><FixturePhoto src={fixture.imageUrl} alt={`${fixture.name} fixture photo`} className="h-9 w-12" /></TableCell><TableCell className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{fixture.code}</TableCell><TableCell className="px-3 py-2 font-medium text-slate-800">{fixture.name}</TableCell><TableCell className="px-3 py-2 text-slate-600">{fixture.parentTypeId ? typeName(fixture.parentTypeId) : "—"}</TableCell><TableCell className="px-3 py-2 text-[11px] text-slate-600">{fixture.dimensions || "—"}</TableCell><TableCell className="px-3 py-2 text-right tabular-nums text-slate-700">{fixture.eft} EFT</TableCell><TableCell className="px-3 py-2"><Status value={fixture.status} /></TableCell><TableCell className="px-3 py-2 text-[10px] text-slate-600">{formatSummary(fixture)}</TableCell><TableCell className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => setViewingFixtureCode(fixture.code)}>View</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-primary" onClick={() => openFixtureEditor(fixture, false)}>Edit</Button></TableCell>
            </TableRow>)}{!filteredFixtures.length && <TableRow><TableCell colSpan={9} className="h-16 px-3 text-center text-xs text-slate-500">No fixture definitions match these filters.</TableCell></TableRow>}</TableBody></Table>
          </Panel>}
        </>}
        {tab === "inventory" && <StoreFixtureInventory
          stores={stores}
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
                <FixtureAppearanceFields
                  imageUrl={editor.standalone.imageUrl}
                  required={!editor.standalone.imageUrl}
                  applicableFormatIds={editor.standalone.applicableFormatIds}
                  onImageChange={imageUrl => setEditor(previous => previous?.kind === "type" ? { ...previous, standalone: { ...previous.standalone, imageUrl } } : previous)}
                  onFormatsChange={applicableFormatIds => setEditor(previous => previous?.kind === "type" ? { ...previous, standalone: { ...previous.standalone, applicableFormatIds } } : previous)}
                />
              </div>}
              {editor.mode === "group" && <SelectField label="GROUP STATUS" value={editor.status} onChange={value => setEditor(previous => previous?.kind === "type" ? { ...previous, status: value as FixtureType["status"] } : previous)} options={["Active", "Review"].map(value => ({ value, label: value }))} />}
            </div>
            <DialogFooter><Button variant="outline" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" onClick={saveFixture} className="bg-primary hover:bg-primary/90">{editor.mode === "standalone" ? "Save fixture" : "Save type"}</Button></DialogFooter>
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
              <FixtureAppearanceFields
                imageUrl={editor.fixture.imageUrl}
                required={editor.isNew || !editor.fixture.imageUrl}
                applicableFormatIds={editor.fixture.applicableFormatIds}
                onImageChange={imageUrl => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, imageUrl } } : previous)}
                onFormatsChange={applicableFormatIds => setEditor(previous => previous?.kind === "fixture" ? { ...previous, fixture: { ...previous.fixture, applicableFormatIds } } : previous)}
              />
            </div>
            <DialogFooter><Button variant="outline" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" onClick={saveFixture} className="bg-primary hover:bg-primary/90">Save fixture</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(viewingFixture)} onOpenChange={open => !open && setViewingFixtureCode(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{viewingFixture?.name ?? "Fixture details"}</DialogTitle>
            <DialogDescription className="text-xs">Fixture definition · {viewingFixture?.code}</DialogDescription>
          </DialogHeader>
          {viewingFixture && <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div>
              <FixturePhoto src={viewingFixture.imageUrl} alt={`${viewingFixture.name} fixture photo`} className="h-44 w-full" />
              {viewingImageCredit && <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                Photo: {viewingImageCredit.title} by {viewingImageCredit.artist} · {viewingImageCredit.license} · <a href={viewingImageCredit.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline">Source</a>
              </p>}
            </div>
            <dl className="grid content-start grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Type</dt><dd className="mt-1 text-slate-800">{viewingFixture.type}</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Subtype</dt><dd className="mt-1 text-slate-800">{viewingFixture.subtype || "—"}</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Dimensions</dt><dd className="mt-1 text-slate-800">{viewingFixture.dimensions || "—"}</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase text-slate-500">EFT</dt><dd className="mt-1 text-slate-800">{viewingFixture.eft} · physical space</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Status</dt><dd className="mt-1"><Status value={viewingFixture.status} /></dd></div>
              <div className="col-span-2"><dt className="text-[10px] font-semibold uppercase text-slate-500">Applicable store formats</dt><dd className="mt-1 text-slate-700">{applicableFormats(viewingFixture).length === allFormatIds.length ? "All formats" : applicableFormats(viewingFixture).map(id => storeFormats.find(format => format.id === id)?.name ?? id).join(", ") || "None"}</dd></div>
            </dl>
          </div>}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setViewingFixtureCode(null)}>Close</Button>{viewingFixture && <Button size="sm" onClick={() => openFixtureEditor(viewingFixture, false)} className="bg-primary hover:bg-primary/90">Edit fixture</Button>}</DialogFooter>
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

function SpaceRevision({ formatBlocks, stores, blockId, setBlockId }: {
  formatBlocks: Record<string, FormatPlanningBlock[]>;
  stores: PlanningStore[];
  blockId: string;
  setBlockId: (id: string) => void;
}) {
  const { toast } = useToast();
  const [storeFormatId, setStoreFormatId] = useState(storeFormats[0]?.id ?? "");
  const [grade, setGrade] = useState("XS");
  const [draft, setDraft] = useState<Record<string, number[]>>({});
  const [saved, setSaved] = useState<Record<string, number[]>>({});
  const format = storeFormats.find(item => item.id === storeFormatId) ?? storeFormats[0];
  const selectedFormatBlocks = format ? formatBlocks[storeFormatId] ?? [] : [];
  const selectedBlock = selectedFormatBlocks.find(item => item.id === blockId || item.id === `${storeFormatId}-${blockId}`)
    ?? selectedFormatBlocks[0];
  const selectedBlockBaseId = selectedBlock?.id.startsWith(`${storeFormatId}-`)
    ? selectedBlock.id.slice(storeFormatId.length + 1)
    : selectedBlock?.id ?? blockId;
  const areas = selectedBlock?.areaIds ?? [];
  const formatStores = stores.filter(store => store.storeFormatId === storeFormatId);
  const activeGrades = gradeNames.filter(name => formatStores.some(store => store.currentGradeByBlock[selectedBlockBaseId] === name));
  const availableGrades = activeGrades.length ? activeGrades : [gradeNames[0]];
  const activeGrade = availableGrades.includes(grade) ? grade : availableGrades[0];
  const gradeSlotCapacity: Record<string, { minimumSlots: number; capacity: number }> = {
    XS: { minimumSlots: 24, capacity: 40 },
    S: { minimumSlots: 36, capacity: 56 },
    M: { minimumSlots: 52, capacity: 80 },
    L: { minimumSlots: 68, capacity: 104 },
    XL: { minimumSlots: 84, capacity: 128 },
    Mega: { minimumSlots: 100, capacity: 160 },
  };
  const gradeConfig = gradeSlotCapacity[activeGrade] ?? gradeSlotCapacity.XS;
  const allocationKey = `${selectedBlock?.id ?? blockId}:${storeFormatId}:${activeGrade}`;
  const defaultAllocations = areas.map((_, index) => selectedBlockBaseId === "beverage"
    ? [40, 60, 0, 0, 0][index] ?? 0
    : Math.floor(100 / Math.max(1, areas.length)) + (index < 100 % Math.max(1, areas.length) ? 1 : 0));
  const baseline = saved[allocationKey] ?? defaultAllocations;
  const values = draft[allocationKey] ?? baseline;
  const totalPercent = values.reduce((sum, value) => sum + value, 0);
  const isValid = totalPercent === 100 && values.every(value => Number.isInteger(value) && value >= 0 && value <= 100);
  const changedAreaCount = values.filter((value, index) => value !== (baseline[index] ?? 0)).length;
  const slotCountsFor = (allocation: number[]) => {
    const exactCounts = allocation.map(percent => gradeConfig.capacity * percent / 100);
    const slotCounts = exactCounts.map(Math.floor);
    const targetSlots = Math.round(gradeConfig.capacity * allocation.reduce((sum, percent) => sum + percent, 0) / 100);
    const remainderOrder = exactCounts
      .map((exact, index) => ({ index, remainder: exact - slotCounts[index] }))
      .sort((first, second) => second.remainder - first.remainder);
    for (let remaining = targetSlots - slotCounts.reduce((sum, count) => sum + count, 0), index = 0; remaining > 0; remaining -= 1, index += 1) {
      const targetIndex = remainderOrder[index % Math.max(1, remainderOrder.length)]?.index;
      if (targetIndex === undefined) break;
      slotCounts[targetIndex] += 1;
    }
    return slotCounts;
  };
  const currentSlotCounts = slotCountsFor(baseline);
  const revisedSlotCounts = slotCountsFor(values);
  const setValue = (index: number, value: number) => setDraft(previous => ({
    ...previous,
    [allocationKey]: values.map((current, currentIndex) => currentIndex === index
      ? Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : current
      : current),
  }));
  const revert = () => {
    setDraft(previous => ({ ...previous, [allocationKey]: [...baseline] }));
    toast({ title: "Changes cancelled", description: `Revised allocations for ${activeGrade} ${format?.name ?? ""} stores were restored.` });
  };
  const save = () => {
    if (!isValid) {
      toast({ title: "Allocation must total 100%", description: `Current total is ${totalPercent}%. Adjust percentages before applying.`, variant: "destructive" });
      return;
    }
    setSaved(previous => ({ ...previous, [allocationKey]: [...values] }));
    toast({ title: "Space allocation applied", description: `${activeGrade} grade allocations for ${selectedBlock?.name ?? "the selected block"} and ${format?.name ?? "selected"} stores have been saved.` });
  };
  const copyPatternToGrades = () => {
    setDraft(previous => {
      const next = { ...previous };
      availableGrades.forEach(targetGrade => {
        next[`${selectedBlock?.id ?? blockId}:${storeFormatId}:${targetGrade}`] = [...values];
      });
      return next;
    });
    toast({ title: "Pattern copied to active grades", description: `The revised ${activeGrade} allocation was copied to ${availableGrades.length} active grades. You can still edit each grade independently.` });
  };
  const changeBlock = (nextId: string) => {
    const next = selectedFormatBlocks.find(item => item.id === nextId);
    if (!next) return;
    setBlockId(next.id.startsWith(`${storeFormatId}-`) ? next.id.slice(storeFormatId.length + 1) : next.id);
  };
  const allocationColors = ["bg-primary", "bg-primary/75", "bg-sky-600", "bg-sky-500", "bg-indigo-500", "bg-blue-400"];
  const salesByArea = areas.map(areaId => {
    const areaSkus = skus.filter(sku => sku.areaId === areaId);
    const salesMillions = areaSkus.reduce((total, sku) => total + (sku.sales ?? 0), 0);
    const units = areaSkus.reduce((total, sku) => total + (sku.units ?? 0), 0);
    return { areaId, salesMillions, units };
  });
  const totalSalesMillions = salesByArea.reduce((total, area) => total + area.salesMillions, 0);
  const averageBlockEft = selectedBlockBaseId
    ? formatStores.reduce((total, store) => total + (store.eftByBlock[selectedBlockBaseId] ?? 0), 0) / Math.max(1, formatStores.length)
    : 0;
  const productivity = salesByArea.map((area, index) => {
    const spaceShare = baseline[index] ?? 0;
    const salesShare = totalSalesMillions > 0 ? area.salesMillions / totalSalesMillions * 100 : 0;
    const allocatedEft = averageBlockEft * spaceShare / 100;
    return { ...area, spaceShare, salesShare, allocatedEft, salesPerEft: allocatedEft > 0 ? area.salesMillions / allocatedEft : null, gap: salesShare - spaceShare };
  });
  const maxSalesPerEft = Math.max(0, ...productivity.map(item => item.salesPerEft ?? 0));
  return (
    <div className="space-y-3">
      <ScreenHeader title="Space Revision" description="Compare illustrative merchandise-area productivity with current space, then review proposed slot impacts." />
      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-2">
        <SelectField label="STORE FORMAT" value={storeFormatId} onChange={value => setStoreFormatId(value)} options={storeFormats.map(item => ({ value: item.id, label: item.name }))} />
        <SelectField label="MERCHANDISING BLOCK" value={selectedBlock?.id ?? ""} onChange={changeBlock} options={selectedFormatBlocks.map(item => ({ value: item.id, label: item.name }))} />
      </div>
      {!selectedBlock ? <Panel title="No blocks available" description="Choose a format that has a merchandising block definition."><p className="px-4 py-3 text-xs text-slate-500">The selected store format does not have any block definitions yet.</p></Panel> : <>
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500" aria-label="Space revision stages">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-primary">1 · Productivity Analysis</span><ArrowRight className="h-3 w-3 text-slate-300" />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">2 · Current Allocation</span><ArrowRight className="h-3 w-3 text-slate-300" />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">3 · Revised Allocation</span>
        </div>
        <Panel
          title="1–2 · Productivity Analysis & Current Allocation"
          description={`${selectedBlock.name} · illustrative same-period mock sales · not actual WHSmith performance`}
          right={<SelectField label="STORE GRADE" value={activeGrade} onChange={setGrade} options={availableGrades.map(value => ({ value, label: value }))} className="w-28" />}
        >
          <div className="space-y-2 p-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Current space share</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Sales share</span>
              <span className="text-slate-400">Current allocation · {activeGrade} grade · minimum {gradeConfig.minimumSlots} / capacity {gradeConfig.capacity} slots · average block {averageBlockEft.toFixed(2)} EFT/store</span>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[850px] text-[10px]">
                <TableHeader><TableRow className="h-7">
                  <TableHead className="h-7 px-2 text-[9px]">Merchandise area</TableHead>
                  <TableHead className="h-7 min-w-[150px] px-2 text-[9px]">Space share vs sales share</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Sales retail ($M)</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Units</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Current allocation</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Current slots</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Sales share</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Gap · pp</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Sales / EFT ($M/EFT)</TableHead>
                </TableRow></TableHeader>
                <TableBody>{productivity.map(item => {
                  const gapClass = item.gap >= 10 ? "text-emerald-700" : item.gap <= -10 ? "text-rose-700" : "text-slate-500";
                  const areaIndex = areas.indexOf(item.areaId);
                  return <TableRow key={item.areaId} className="h-8">
                    <TableCell className="whitespace-nowrap px-2 py-1 font-medium text-slate-800">{areaName(item.areaId)}</TableCell>
                    <TableCell className="px-2 py-1">
                      <div className="space-y-0.5" title={`Current space ${item.spaceShare.toFixed(1)}%; sales ${item.salesShare.toFixed(1)}%`}>
                        <div className="h-2 overflow-hidden rounded-sm bg-slate-100"><div className="h-full rounded-sm bg-slate-400" style={{ width: `${Math.min(100, item.spaceShare)}%` }} /></div>
                        <div className="h-2 overflow-hidden rounded-sm bg-slate-100"><div className="h-full rounded-sm bg-primary" style={{ width: `${Math.min(100, item.salesShare)}%` }} /></div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-700">${item.salesMillions.toFixed(1)}M</TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-600">{formatNumber(item.units)}</TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-600">{item.spaceShare.toFixed(1)}%</TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-700">{currentSlotCounts[areaIndex] ?? 0}</TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-600">{item.salesShare.toFixed(1)}%</TableCell>
                    <TableCell className={`px-2 py-1 text-right font-semibold tabular-nums ${gapClass}`}>{item.gap > 0 ? "+" : ""}{item.gap.toFixed(1)}</TableCell>
                    <TableCell className="px-2 py-1 text-right tabular-nums text-slate-700" title={`Sales ${item.salesMillions.toFixed(2)} $M ÷ allocated ${item.allocatedEft.toFixed(2)} EFT`}>{item.salesPerEft === null ? "—" : item.salesPerEft.toFixed(2)}</TableCell>
                  </TableRow>;
                })}</TableBody>
              </Table>
            </div>
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {productivity.slice().sort((a, b) => (b.salesPerEft ?? -1) - (a.salesPerEft ?? -1)).map(item => <div key={item.areaId} className="grid grid-cols-[minmax(90px,1fr)_2fr_auto] items-center gap-2 text-[9px]">
                <span className="truncate text-slate-600">{areaName(item.areaId)}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-primary/80" style={{ width: `${maxSalesPerEft ? Math.max(item.salesPerEft === null ? 0 : 3, (item.salesPerEft ?? 0) / maxSalesPerEft * 100) : 0}%` }} /></span>
                <span className="w-20 text-right font-medium tabular-nums text-slate-700">{item.salesPerEft === null ? "—" : `$${item.salesPerEft.toFixed(2)}M/EFT`}</span>
              </div>)}
            </div>
            <p className="text-[9px] text-slate-500">Sales per EFT = illustrative merchandise-area sales ($M) ÷ estimated average allocated block EFT per store. EFT is physical area and remains separate from facing slots; sample values are not actual WHSmith performance.</p>
          </div>
        </Panel>
        <Panel title="3 · Revised Allocation" description={`${selectedBlock.name} · ${activeGrade} grade · revise percentages and inspect slot changes immediately`} right={<div className="flex flex-wrap items-center justify-end gap-2"><Button variant="outline" size="sm" disabled={!isValid || availableGrades.length < 2} onClick={copyPatternToGrades} className="h-8 text-xs">Copy pattern to grades</Button><Button variant="outline" size="sm" onClick={revert} className="h-8 text-xs">Cancel / Revert</Button><Button size="sm" disabled={!isValid} onClick={save} className="h-8 gap-1.5 bg-primary text-xs hover:bg-primary/90"><Check className="h-3.5 w-3.5" /> Save / Apply</Button></div>}>
          <div className="space-y-2 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <span className="text-slate-600">{changedAreaCount} changed {changedAreaCount === 1 ? "area" : "areas"} · slot capacity {gradeConfig.capacity}</span>
              <span className={`font-semibold tabular-nums ${isValid ? "text-emerald-700" : "text-amber-700"}`}>Revised allocation: {totalPercent}%</span>
            </div>
            <div role="img" aria-label={`Revised allocation distribution totals ${totalPercent} percent`} className="flex h-3 overflow-hidden rounded border border-slate-200 bg-slate-50">
              {values.map((value, index) => value > 0 && <div key={areas[index]} title={`${areaName(areas[index])}: ${value}%`} style={{ width: `${value}%` }} className={`${allocationColors[index % allocationColors.length]} border-r border-white/70 last:border-r-0`} />)}
            </div>
            <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] ${isValid ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              {isValid ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
              <span>{isValid ? "Allocation balances to 100%." : `Allocation totals ${totalPercent}%. Revised percentages must total 100% before saving.`}</span>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[820px] text-xs">
                <TableHeader><TableRow className="h-8">
                  <TableHead rowSpan={2} className="h-8 px-2 text-[10px]">Merchandise area</TableHead>
                  <TableHead colSpan={2} className="h-8 border-l px-2 text-center text-[10px]">Allocation</TableHead>
                  <TableHead colSpan={3} className="h-8 border-l px-2 text-center text-[10px]">Facing slots · capacity {gradeConfig.capacity}</TableHead>
                  <TableHead rowSpan={2} className="h-8 border-l px-2 text-right text-[10px]">Sales-share gap</TableHead>
                </TableRow><TableRow className="h-7">
                  <TableHead className="h-7 border-l px-2 text-right text-[9px]">Current</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Revised</TableHead>
                  <TableHead className="h-7 border-l px-2 text-right text-[9px]">Current</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Revised</TableHead>
                  <TableHead className="h-7 px-2 text-right text-[9px]">Change</TableHead>
                </TableRow></TableHeader>
                <TableBody>{areas.map((id, index) => {
                  const current = baseline[index] ?? 0;
                  const revised = values[index] ?? 0;
                  const currentSlots = currentSlotCounts[index] ?? 0;
                  const revisedSlots = revisedSlotCounts[index] ?? 0;
                  const slotChange = revisedSlots - currentSlots;
                  const analytics = productivity[index];
                  return <TableRow key={id} className="h-8">
                    <TableCell className="px-2 py-1 font-medium text-slate-800">{areaName(id)}{revised === 0 && <span className="ml-2 text-[9px] font-normal text-slate-400">zero allocation</span>}</TableCell>
                    <TableCell className="border-l px-2 py-1 text-right tabular-nums text-slate-500">{current}%</TableCell>
                    <TableCell className="px-2 py-1">
                      <label className="ml-auto flex w-20 items-center justify-end gap-1">
                        <Input type="number" min="0" max="100" step="1" value={revised} onChange={event => setValue(index, Number(event.target.value))} className="h-7 w-14 text-right text-xs" aria-label={`${areaName(id)} revised allocation percentage`} />
                        <span className="text-slate-400">%</span>
                      </label>
                    </TableCell>
                    <TableCell className="border-l px-2 py-1 text-right tabular-nums text-slate-500">{currentSlots}</TableCell>
                    <TableCell className="px-2 py-1 text-right font-medium tabular-nums text-slate-800">{revisedSlots}</TableCell>
                    <TableCell className={`px-2 py-1 text-right font-semibold tabular-nums ${slotChange > 0 ? "text-emerald-700" : slotChange < 0 ? "text-rose-700" : "text-slate-400"}`}>{slotChange > 0 ? `+${slotChange}` : slotChange}</TableCell>
                    <TableCell className={`border-l px-2 py-1 text-right tabular-nums ${analytics.gap >= 10 ? "font-semibold text-emerald-700" : analytics.gap <= -10 ? "font-semibold text-rose-700" : "text-slate-500"}`}>{analytics.gap > 0 ? "+" : ""}{analytics.gap.toFixed(1)} pp</TableCell>
                  </TableRow>;
                })}</TableBody>
              </Table>
            </div>
            <p className="text-[9px] text-slate-500">Slot counts are calculated as allocation × available facing-slot capacity and rounded to the nearest whole slot. EFT is a separate physical-space measure. Minimums and capacities are illustrative planning values.</p>
          </div>
        </Panel>
      </>}
    </div>
  );
}

function SkuThumbnail({ sku, className }: {
  sku: PlanningSku;
  className?: string;
}) {
  const colors = [
    "#1d4ed8", "#047857", "#b45309", "#be123c", "#6d28d9", "#0f766e", "#334155",
    "#0369a1", "#c2410c", "#7e22ce", "#15803d", "#a21caf", "#b91c1c", "#4338ca",
    "#0e7490", "#4d7c0f", "#a16207", "#9f1239", "#5b21b6", "#166534", "#9a3412",
    "#1e40af", "#0f766e",
  ];
  const colorIndex = Math.max(0, skus.findIndex(item => item.id === sku.id)) % colors.length;
  const packageColor = colors[colorIndex];

  return (
    <svg viewBox="0 0 80 120" className={className} role="img" aria-label={`${sku.brand} ${sku.description}`}>
        {sku.packageType === "bottle" && <>
          <path d="M34 5h12v13l7 8v77a7 7 0 0 1-7 7H34a7 7 0 0 1-7-7V26l7-8z" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <rect x="34" y="4" width="12" height="9" rx="2" fill="#e2e8f0" stroke="#64748b" />
          <path d="M28 48h24v32H28z" fill="#fff" opacity=".93" />
        </>}
        {sku.packageType === "can" && <>
          <rect x="25" y="15" width="30" height="91" rx="7" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <ellipse cx="40" cy="17" rx="14" ry="4" fill="#cbd5e1" stroke="#64748b" />
          <ellipse cx="40" cy="104" rx="14" ry="4" fill="#94a3b8" />
          <path d="M27 49h26v28H27z" fill="#fff" opacity=".93" />
        </>}
        {sku.packageType === "carton" && <>
          <path d="M28 16h24l8 10v77H20V26z" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <path d="M28 16h24l8 10H20z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          <rect x="23" y="48" width="34" height="28" rx="2" fill="#fff" opacity=".94" />
        </>}
        {sku.packageType === "pouch" && <>
          <path d="M24 14h32l-3 11 5 70-7 12H29l-7-12 5-70z" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <path d="M26 25h28M25 89h30" stroke="#f8fafc" strokeWidth="3" opacity=".85" />
          <rect x="25" y="48" width="30" height="25" rx="3" fill="#fff" opacity=".94" />
        </>}
        {sku.packageType === "box" && <>
          <path d="M20 25 40 13l20 12v75H20z" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <path d="m20 25 20 12 20-12M40 37v63" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <rect x="25" y="49" width="30" height="27" rx="2" fill="#fff" opacity=".94" />
        </>}
        {sku.packageType === "blister" && <>
          <path d="M20 13h40v94H20z" rx="4" fill={packageColor} stroke="#334155" strokeWidth="2" />
          <rect x="27" y="27" width="26" height="48" rx="8" fill="#e2e8f0" fillOpacity=".9" stroke="#64748b" strokeWidth="2" />
          <rect x="25" y="80" width="30" height="16" rx="2" fill="#fff" opacity=".94" />
        </>}
        <text x="40" y="61" textAnchor="middle" fontSize="6" fontWeight="700" fill={packageColor}>{sku.brand.slice(0, 11)}</text>
        <text x="40" y="70" textAnchor="middle" fontSize="5" fill="#334155">{sku.code}</text>
        <path d="M24 109h32" stroke="#64748b" strokeWidth="2" opacity=".45" />
    </svg>
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
  const [draggingSkuId, setDraggingSkuId] = useState<string | null>(null);
  const [activeShelfIndex, setActiveShelfIndex] = useState<number | null>(null);
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
  const defaultShelfCount = selectedPlanogramFixture?.fixture.type === "Till Unit" ? 3 : selectedPlanogramFixture?.fixture.type === "Wall Bay" ? 5 : 4;
  const planogramLayout = selectedPlanogramFixture
    ? fixturePlanogramLayouts[selectedPlanogramFixture.fixtureCode] ?? {
      usableWidthMm: 900,
      shelves: Array.from({ length: defaultShelfCount }, () => ({ clearHeightMm: 350 })),
    }
    : { usableWidthMm: 900, shelves: Array.from({ length: 4 }, () => ({ clearHeightMm: 350 })) };
  const planogramShelfCount = planogramLayout.shelves.length;
  const shelfRows = planogramLayout.shelves.map(() => [] as { assignment: FacingAssignment; sku: PlanningSku }[]);
  const shelfOccupiedWidth = planogramLayout.shelves.map(() => 0);
  const unplacedPlanogramAssignments: { assignment: FacingAssignment; sku: PlanningSku }[] = [];
  planogramAssignments
    .slice()
    .sort((first, second) => {
      const firstShelf = first.shelfIndex ?? 0;
      const secondShelf = second.shelfIndex ?? 0;
      return firstShelf - secondShelf
        || (first.shelfOrder ?? Number.MAX_SAFE_INTEGER) - (second.shelfOrder ?? Number.MAX_SAFE_INTEGER)
        || first.areaId.localeCompare(second.areaId)
        || (skus.find(sku => sku.id === first.skuId)?.code ?? "").localeCompare(skus.find(sku => sku.id === second.skuId)?.code ?? "");
    })
    .forEach(assignment => {
      const sku = skus.find(item => item.id === assignment.skuId);
      if (!sku) return;
      const requiredWidth = sku.widthMm * assignment.facings;
      const preferredShelf = Number.isInteger(assignment.shelfIndex) ? assignment.shelfIndex! : null;
      const candidateShelves = preferredShelf === null
        ? planogramLayout.shelves.map((_, index) => index)
        : [Math.max(0, Math.min(planogramShelfCount - 1, preferredShelf))];
      const shelfIndex = candidateShelves.find(index =>
        sku.heightMm <= planogramLayout.shelves[index].clearHeightMm
        && shelfOccupiedWidth[index] + requiredWidth <= planogramLayout.usableWidthMm
      );
      if (shelfIndex === undefined) {
        unplacedPlanogramAssignments.push({ assignment, sku });
        return;
      }
      shelfRows[shelfIndex].push({ assignment, sku });
      shelfOccupiedWidth[shelfIndex] += requiredWidth;
    });
  const planogramOccupiedWidth = shelfOccupiedWidth.reduce((sum, width) => sum + width, 0);
  const planogramTotalWidth = planogramLayout.usableWidthMm * planogramLayout.shelves.length;
  const planogramRemainingWidth = planogramTotalWidth - planogramOccupiedWidth;
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
  const dropSkuOnShelf = (event: React.DragEvent<HTMLElement>, shelfIndex: number, insertionIndex?: number) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveShelfIndex(null);
    setDraggingSkuId(null);
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
    const targetFacings = existing?.facings && existing.facings > 0 ? existing.facings : 1;
    const targetCapacity = capacityFor(selectedPlanogramFixture.fixtureCode, sku.areaId);
    const assignedAtDestination = assignedFor(selectedPlanogramFixture.fixtureCode, sku.areaId)
      - (existing?.fixtureCode === selectedPlanogramFixture.fixtureCode ? existing.facings : 0);
    if (targetFacings > targetCapacity - assignedAtDestination) {
      toast({
        title: "No facing slots available",
        description: `${sku.code} needs ${targetFacings} slots, but this fixture has only ${Math.max(0, targetCapacity - assignedAtDestination)} available for ${areaName(sku.areaId)}.`,
        variant: "destructive",
      });
      return;
    }

    const shelf = planogramLayout.shelves[shelfIndex];
    if (sku.heightMm > shelf.clearHeightMm) {
      toast({
        title: "Product is too tall for this shelf",
        description: `${sku.description} is ${sku.heightMm} mm high; shelf clearance is ${shelf.clearHeightMm} mm.`,
        variant: "destructive",
      });
      return;
    }
    const existingOnTargetShelf = existing?.fixtureCode === selectedPlanogramFixture.fixtureCode
      && shelfRows[shelfIndex].some(row => row.assignment.skuId === sku.id)
      ? existing.facings * sku.widthMm
      : 0;
    const shelfWidthAfterMove = shelfOccupiedWidth[shelfIndex] - existingOnTargetShelf + sku.widthMm * targetFacings;
    if (shelfWidthAfterMove > planogramLayout.usableWidthMm) {
      const remainingWidth = Math.max(0, planogramLayout.usableWidthMm - shelfOccupiedWidth[shelfIndex] + existingOnTargetShelf);
      toast({
        title: "Product does not fit on this shelf",
        description: `${sku.description} needs ${sku.widthMm * targetFacings} mm; only ${remainingWidth} mm of usable shelf width remains.`,
        variant: "destructive",
      });
      return;
    }

    const destinationOrder = shelfRows[shelfIndex]
      .filter(row => row.assignment.skuId !== sku.id)
      .map(row => row.assignment);
    const insertAt = Math.max(0, Math.min(insertionIndex ?? destinationOrder.length, destinationOrder.length));
    destinationOrder.splice(insertAt, 0, existing ?? {
      id: `as-${Date.now()}-${sku.id}`,
      storeId: selectedStoreId,
      blockId: selectedBlockId,
      areaId: sku.areaId,
      fixtureCode: selectedPlanogramFixture.fixtureCode,
      skuId: sku.id,
      facings: 1,
    });
    setAssignments(previous => {
      const index = previous.findIndex(item => item.storeId === selectedStoreId && item.blockId === selectedBlockId && item.skuId === sku.id);
      const nextAssignment: FacingAssignment = index >= 0
        ? { ...previous[index], fixtureCode: selectedPlanogramFixture.fixtureCode, facings: targetFacings, shelfIndex }
        : { ...destinationOrder[insertAt], fixtureCode: selectedPlanogramFixture.fixtureCode, facings: targetFacings, shelfIndex };
      const next = index >= 0
        ? previous.map((item, itemIndex) => itemIndex === index ? nextAssignment : item)
        : [...previous, nextAssignment];
      return next.map(item => {
        const order = item.storeId === selectedStoreId
          && item.blockId === selectedBlockId
          && item.fixtureCode === selectedPlanogramFixture.fixtureCode
          && item.shelfIndex === shelfIndex
          ? destinationOrder.findIndex(row => row.skuId === item.skuId)
          : -1;
        return order >= 0 ? { ...item, shelfOrder: order } : item;
      });
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
    setDraggingSkuId(skuId);
  };
  const updateFacings = (skuId: string, facings: number) => {
    const existing = getAssignment(skuId);
    if (!existing) return;
    const safeFacings = Number.isFinite(facings) ? Math.max(0, Math.floor(facings)) : 0;
    setAssignments(previous => previous.map(item => item.id === existing.id ? { ...item, facings: safeFacings } : item));
  };
  const removeFromPlanogram = (skuId: string) => {
    const existing = getAssignment(skuId);
    if (!existing) return;
    setAssignments(previous => previous.filter(item => item.id !== existing.id));
    toast({ title: "SKU removed from this fixture", description: "The SKU remains eligible for this merchandising block." });
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
                <TableCell className="max-w-64 border-r px-2 py-1 text-[11px] font-medium text-slate-800" title={sku.description}>
                  <span className="flex min-w-0 items-center gap-2">
                    <SkuThumbnail sku={sku} className="h-8 w-6 shrink-0 rounded border border-slate-200 bg-white p-0.5" />
                    <span className="truncate">{sku.description}</span>
                  </span>
                </TableCell>
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
                  <div className="flex justify-between"><span className="text-slate-500">Facing slots · {selectedPlanogramFixture.quantity} instance{selectedPlanogramFixture.quantity === 1 ? "" : "s"}</span><strong>{planogramCapacity}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Assigned facings</span><strong className={planogramAssigned > planogramCapacity ? "text-rose-700" : ""}>{planogramAssigned}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Remaining</span><strong className={planogramRemaining < 0 ? "text-rose-700" : ""}>{Math.max(0, planogramRemaining)}</strong></div>
                  <div className="flex justify-between text-[10px] text-slate-500"><span>Utilisation</span><span>{planogramUtilization.toFixed(1)}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${planogramUtilization > 100 ? "bg-rose-500" : "bg-blue-600"}`} style={{ width: `${Math.min(100, planogramUtilization)}%` }} /></div>
                  <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-500">Shelf width occupied</span><strong>{planogramOccupiedWidth.toLocaleString()} mm</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Shelf width remaining</span><strong>{planogramRemainingWidth.toLocaleString()} mm</strong></div>
                  <p className="text-[9px] leading-relaxed text-slate-400">{planogramLayout.usableWidthMm.toLocaleString()} mm usable width per displayed instance · {planogramShelfCount} shelves · illustrative dimensions</p>
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
                        onDragEnd={() => { setDraggingSkuId(null); setActiveShelfIndex(null); }}
                        className={`w-full cursor-grab px-3 py-2 text-left active:cursor-grabbing ${selectedSkuId === sku.id ? "bg-blue-50" : "hover:bg-slate-50"} ${!fixtureSupportsSku ? "opacity-50" : ""}`}
                        title={fixtureSupportsSku ? "Drag onto a shelf to assign or move this SKU" : "This fixture does not support the SKU's merchandise area"}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <SkuThumbnail sku={sku} className="h-10 w-7 shrink-0 rounded border border-slate-200 bg-white p-0.5" />
                          <span className="min-w-0">
                            <span className="block font-mono text-[10px] font-semibold text-primary">{sku.code}</span>
                            <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-800">{sku.description}</span>
                            <span className="mt-0.5 block text-[9px] text-slate-500">{areaName(sku.areaId)} · {sku.widthMm} × {sku.heightMm} mm</span>
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
                <span className="text-[10px] text-slate-400">Drag tray SKUs to assign; drag shelf products to move or reorder · illustrative only</span>
              </div>
              {planogramAssigned > planogramCapacity && <div role="alert" className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-800"><CircleAlert className="h-3.5 w-3.5 shrink-0" /><strong>Over capacity by {planogramAssigned - planogramCapacity} facings.</strong> Reduce allocation in SKU Allocation.</div>}
              <div className="overflow-x-auto bg-slate-50 px-3 py-4 sm:px-6">
                {selectedPlanogramFixture ? (
                  <div className="mx-auto min-w-[550px] max-w-[1000px] overflow-hidden rounded-t-md border-x-[10px] border-t-[10px] border-slate-500 bg-slate-300 shadow-[0_5px_14px_rgba(15,23,42,0.16)]">
                    <div className="flex h-8 items-center justify-between bg-slate-800 px-3 text-[9px] font-bold tracking-[0.14em] text-white">
                      <span>{selectedPlanogramFixture.fixture.name.toUpperCase()}</span>
                      <span>{selectedBlock.name.toUpperCase()}</span>
                      <span>{planogramCapacity} FACING SLOTS · {planogramLayout.usableWidthMm} MM WIDE</span>
                    </div>
                    {shelfRows.map((products, shelfIndex) => (
                      <div
                        key={shelfIndex}
                        onDragEnter={() => setActiveShelfIndex(shelfIndex)}
                        onDragLeave={() => setActiveShelfIndex(current => current === shelfIndex ? null : current)}
                        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setActiveShelfIndex(shelfIndex); }}
                        onDrop={event => dropSkuOnShelf(event, shelfIndex)}
                        className={`relative flex h-[144px] items-end gap-0 border-b-[10px] border-slate-400 px-2 pb-2 pt-1 shadow-[inset_0_-4px_5px_rgba(15,23,42,0.10)] transition-colors ${activeShelfIndex === shelfIndex ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : "bg-white hover:bg-blue-50/50"}`}
                        aria-label={`Shelf ${planogramShelfCount - shelfIndex}, drop eligible SKUs here`}
                      >
                        <div className="absolute inset-x-2 top-1 flex justify-between text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                          <span>S{planogramShelfCount - shelfIndex} · {planogramLayout.shelves[shelfIndex].clearHeightMm} mm clearance</span>
                          <span>{shelfOccupiedWidth[shelfIndex].toLocaleString()} / {planogramLayout.usableWidthMm.toLocaleString()} mm occupied</span>
                        </div>
                        <span className="absolute left-0 top-1/2 z-10 -translate-x-[calc(100%+7px)] -translate-y-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-wider text-slate-400">{`S${planogramShelfCount - shelfIndex}`}</span>
                        {products.map(({ assignment, sku }, productIndex) => {
                          const productWidth = sku.widthMm * assignment.facings;
                          return (
                            <div
                              key={sku.id}
                              role="button"
                              tabIndex={0}
                              draggable
                              onClick={() => setSelectedSkuId(sku.id)}
                              onKeyDown={event => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setSelectedSkuId(sku.id);
                                }
                              }}
                              onDragStart={event => startSkuDrag(event, sku.id)}
                              onDragEnd={() => { setDraggingSkuId(null); setActiveShelfIndex(null); }}
                              onDragOver={event => { event.preventDefault(); event.stopPropagation(); setActiveShelfIndex(shelfIndex); }}
                              onDrop={event => dropSkuOnShelf(event, shelfIndex, productIndex)}
                              title={`${sku.description} · ${assignment.facings} facing${assignment.facings === 1 ? "" : "s"} · ${productWidth} mm wide`}
                              aria-label={`${sku.description}, ${assignment.facings} facings. Drag to rearrange; press Enter to inspect.`}
                              className={`relative flex shrink-0 cursor-grab items-end gap-0 overflow-hidden rounded-t-sm pb-0.5 active:cursor-grabbing hover:z-10 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selectedPlanogramSku?.id === sku.id ? "z-[1] outline outline-2 outline-offset-1 outline-blue-500" : ""} ${draggingSkuId === sku.id ? "opacity-40" : ""}`}
                              style={{
                                flexBasis: `${productWidth / planogramLayout.usableWidthMm * 100}%`,
                                height: `${Math.min(96, sku.heightMm / planogramLayout.shelves[shelfIndex].clearHeightMm * 100)}%`,
                              }}
                            >
                              {Array.from({ length: assignment.facings }, (_, facingIndex) => (
                                <SkuThumbnail
                                  key={`${sku.id}-${facingIndex}`}
                                  sku={sku}
                                  className="h-full min-w-0 flex-1 border-x border-slate-300/50 bg-white/70 p-0.5"
                                />
                              ))}
                              {assignment.facings > 1 && <span className="absolute right-0 top-0 rounded-bl bg-slate-800/80 px-1 text-[7px] font-bold text-white">{assignment.facings}×</span>}
                            </div>
                          );
                        })}
                        {!products.length && <span className="mb-1 ml-2 text-[10px] text-slate-300">{activeShelfIndex === shelfIndex ? "Release to place product" : "Drop a compatible SKU on this shelf"}</span>}
                      </div>
                    ))}
                  </div>
                ) : <div className="flex min-h-56 items-center justify-center text-xs text-slate-500">No compatible fixtures are assigned for this block.</div>}
              </div>
              {unplacedPlanogramAssignments.length > 0 && <div role="alert" className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-900">
                <strong>Some assigned products are not drawn on a shelf:</strong>{" "}
                {unplacedPlanogramAssignments.map(({ assignment, sku }) => `${sku.code} (${assignment.facings} facing${assignment.facings === 1 ? "" : "s"})`).join(", ")}{" "}
                — shelf width or clearance is insufficient. Reduce facings or choose another shelf/fixture.
              </div>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2">
                {selectedPlanogramSku ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <SkuThumbnail sku={selectedPlanogramSku} className="h-11 w-8 shrink-0 rounded border border-slate-200 bg-white p-0.5" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{selectedPlanogramSku.description}</p>
                      <p className="text-[10px] text-slate-500">
                        <span className="font-mono text-blue-700">{selectedPlanogramSku.code}</span>
                        <span className="px-1.5 text-slate-300">·</span>{areaName(selectedPlanogramSku.areaId)}
                        <span className="px-1.5 text-slate-300">·</span>{selectedPlanogramSku.widthMm} × {selectedPlanogramSku.heightMm} mm
                        <span className="px-1.5 text-slate-300">·</span>{fixtureName(getAssignment(selectedPlanogramSku.id)?.fixtureCode ?? "", fixtureList) || "Not assigned"}
                      </p>
                    </div>
                  </div>
                ) : <p className="text-[10px] text-slate-500">Select or hover a product to inspect its allocation.</p>}
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SKU facings</p>
                    <p className="text-sm font-bold tabular-nums text-slate-800">{selectedPlanogramSku ? getAssignment(selectedPlanogramSku.id)?.facings ?? 0 : 0}</p>
                  </div>
                  {selectedPlanogramSku && getAssignment(selectedPlanogramSku.id)?.fixtureCode === selectedPlanogramFixture?.fixtureCode && <Button variant="outline" size="sm" onClick={() => removeFromPlanogram(selectedPlanogramSku.id)} className="h-7 gap-1.5 px-2 text-[10px] text-rose-700 hover:bg-rose-50"><Trash2 className="h-3 w-3" /> Remove from fixture</Button>}
                </div>
              </div>
            </section>
          </div>
        )}
      </> : <Panel title="No compatible merchandising block" description="The selected store has no active fixture relationship for the available merchandising blocks."><p className="px-3 pb-3 text-xs text-slate-500">Choose another store format or store with configured compatible fixtures.</p></Panel>}
      <p className="text-[10px] text-slate-500">Facing slots are configured per fixture, block and merchandise area; shelf width uses separate illustrative SKU dimensions. Capacity includes all configured fixture instances, while the preview shows one representative instance. These mock dimensions are not validated measurements.</p>
    </div>
  );
}

export default function SpacePlanning() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [blocks, setBlocks] = useState<PlanningBlock[]>(initialBlocks);
  const [formatBlocks, setFormatBlocks] = useState<Record<string, FormatPlanningBlock[]>>(initialFormatBlocks);
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
        return <FixtureMaster blocks={blocks} fixtureList={fixtureList} setFixtureList={setFixtureList} fixtureTypes={fixtureTypes} setFixtureTypes={setFixtureTypes} compatibility={compatibility} inventory={inventory} setInventory={setInventory} stores={stores} setCompatFixture={setSelectedFixtureCode} />;
      case "/space-planning/compatibility":
        return <BlockCompatibility blocks={blocks} fixtureList={fixtureList} compatibility={compatibility} setCompatibility={setCompatibility} />;
      case "/space-planning/grading":
        return <StoreGrading blocks={blocks} stores={stores} setStores={setStores} inventory={inventory} compatibility={compatibility} fixtureList={fixtureList} blockId={selectedBlockId} setBlockId={setSelectedBlockId} />;
      case "/space-planning/revision":
        return <SpaceRevision formatBlocks={formatBlocks} stores={stores} blockId={selectedBlockId} setBlockId={setSelectedBlockId} />;
      case "/space-planning/facings":
        return <FacingsPresentations blocks={blocks} fixtureList={fixtureList} inventory={inventory} compatibility={compatibility} assignments={assignments} setAssignments={setAssignments} storeId={selectedStoreId} setStoreId={setSelectedStoreId} blockId={selectedBlockId} setBlockId={setSelectedBlockId} fixtureCode={selectedFixtureCode} setFixtureCode={setSelectedFixtureCode} />;
      default:
        return <MerchandisingBlocks blocks={formatBlocks} setBlocks={setFormatBlocks} />;
    }
  }, [screen.path, blocks, formatBlocks, fixtureList, fixtureTypes, compatibility, inventory, stores, assignments, selectedFixtureCode, selectedBlockId, selectedStoreId]);

  return (
    <ModuleShell>
      {page}
    </ModuleShell>
  );
}
