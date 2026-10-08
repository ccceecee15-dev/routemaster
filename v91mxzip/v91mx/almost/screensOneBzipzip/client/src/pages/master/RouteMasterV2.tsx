import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  PowerOff,
  Route,
  Search,
  Store,
  Thermometer,
  Truck,
  Users,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderType = "DSD" | "Warehouse BULK";
type RouteStatus = "Active" | "Inactive";
type RoutePriority = "Primary" | "Secondary";
type TransportMode = "Company Fleet" | "LTL";
type TempControlled = "Yes" | "No";
type OrderDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

interface V2RouteRecord {
  id: number;
  vendor: string;
  category: string;
  merchArea: string;
  orderType: OrderType;
  warehouse: string;
  warehouseNumber: string;
  storeNumber: string;
  storeName: string;
  property: string;
  format: string;
  city: string;
  state: string;
  orderDays: OrderDay[];
  leadTimeWeeks: number;
  transportMode: TransportMode;
  tempControlled: TempControlled;
  routeStatus: RouteStatus;
  routePriority: RoutePriority;
  modifiedDate: string;
}

type RouteForm = Omit<V2RouteRecord, "id" | "modifiedDate">;
type SortKey = "vendor" | "merchArea" | "storeNumber" | "storeName" | "orderType" | "orderDays" | "leadTimeWeeks";
type SortDir = "asc" | "desc";
type ValidationFilter = "duplicate" | "missing-vendor" | "missing-area" | "missing-order-type" | "missing-calendar" | "missing-warehouse" | "missing-lead-time" | "inactive" | "recent";

const WAREHOUSE_META: Record<string, { number: string; address: string }> = {
  "RDC – Las Vegas": { number: "950", address: "3200 E Sahara Ave, Las Vegas, NV 89104" },
  "RDC – Orlando": { number: "960", address: "8100 Presidents Dr, Orlando, FL 32809" },
  "RDC – Dallas": { number: "875", address: "2601 S State Hwy 121, Lewisville, TX 75067" },
  "RDC – Chicago": { number: "831", address: "1400 S Wolf Rd, Hillside, IL 60162" },
};
const WAREHOUSES = Object.keys(WAREHOUSE_META);
const CATEGORIES = ["Apparel", "Books", "Food", "Gifts", "Travel Essentials", "Beverages", "Snacks"];
const MERCH_AREAS = ["Snacks", "Energy Drinks", "Beverages", "Womens Knitwear", "Mens Casual", "Souvenirs", "Confectionery", "Stationery", "Travel Essentials", "Accessories"];
const VENDORS = ["McLane", "Red Bull Distribution", "National Beverage Vendor", "Regional Snacks Vendor", "Vendor ABC"];
const PROPERTIES = ["Las Vegas Strip", "Orlando Resort", "Northeast", "Midwest", "Dallas Airport", "Chicago Downtown"];
const FORMATS = ["Large", "Medium", "Small", "Express"];
const ORDER_DAYS: OrderDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT: Record<OrderDay, string> = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const MOCK_V2_ROUTES: V2RouteRecord[] = [
  { id: 1, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S101", storeName: "Las Vegas Strip", property: "Las Vegas Strip", format: "Large", city: "Las Vegas", state: "NV", orderDays: ["Monday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-18" },
  { id: 2, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S102", storeName: "Henderson Galleria", property: "Las Vegas Strip", format: "Medium", city: "Henderson", state: "NV", orderDays: ["Monday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-16" },
  { id: 3, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S103", storeName: "North Las Vegas Center", property: "Las Vegas Strip", format: "Large", city: "North Las Vegas", state: "NV", orderDays: ["Wednesday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-15" },
  { id: 4, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S104", storeName: "Summerlin Market", property: "Las Vegas Strip", format: "Medium", city: "Las Vegas", state: "NV", orderDays: ["Wednesday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-12" },
  { id: 5, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S108", storeName: "Carson City Hub", property: "Las Vegas Strip", format: "Small", city: "Carson City", state: "NV", orderDays: ["Friday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Inactive", routePriority: "Secondary", modifiedDate: "2026-08-10" },
  { id: 6, vendor: "McLane", category: "Food", merchArea: "Snacks", orderType: "Warehouse BULK", warehouse: "RDC – Orlando", warehouseNumber: "960", storeNumber: "S205", storeName: "Henderson Galleria", property: "Orlando Resort", format: "Large", city: "Jacksonville", state: "FL", orderDays: ["Wednesday"], leadTimeWeeks: 2, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-11" },
  { id: 7, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "DSD", warehouse: "", warehouseNumber: "", storeNumber: "S101", storeName: "Las Vegas Strip", property: "Las Vegas Strip", format: "Large", city: "Las Vegas", state: "NV", orderDays: ["Tuesday"], leadTimeWeeks: 1, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-19" },
  { id: 8, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "DSD", warehouse: "", warehouseNumber: "", storeNumber: "S205", storeName: "Henderson Galleria", property: "Orlando Resort", format: "Large", city: "Jacksonville", state: "FL", orderDays: ["Tuesday"], leadTimeWeeks: 1, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-18" },
  { id: 9, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "DSD", warehouse: "", warehouseNumber: "", storeNumber: "S310", storeName: "Dallas Galleria", property: "Dallas Airport", format: "Medium", city: "Dallas", state: "TX", orderDays: ["Tuesday"], leadTimeWeeks: 1, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-09-14" },
  { id: 10, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "Warehouse BULK", warehouse: "RDC – Orlando", warehouseNumber: "960", storeNumber: "S401", storeName: "Orlando Premium Outlets", property: "Orlando Resort", format: "Large", city: "Orlando", state: "FL", orderDays: ["Thursday"], leadTimeWeeks: 2, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-09-17" },
  { id: 11, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "Warehouse BULK", warehouse: "RDC – Orlando", warehouseNumber: "960", storeNumber: "S402", storeName: "Lake Buena Vista Shops", property: "Orlando Resort", format: "Medium", city: "Orlando", state: "FL", orderDays: ["Thursday"], leadTimeWeeks: 2, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-09-16" },
  { id: 12, vendor: "Red Bull Distribution", category: "Beverages", merchArea: "Energy Drinks", orderType: "Warehouse BULK", warehouse: "RDC – Orlando", warehouseNumber: "960", storeNumber: "S403", storeName: "International Drive Market", property: "Orlando Resort", format: "Small", city: "Orlando", state: "FL", orderDays: ["Thursday"], leadTimeWeeks: 2, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-09-15" },
  { id: 13, vendor: "National Beverage Vendor", category: "Beverages", merchArea: "Beverages", orderType: "Warehouse BULK", warehouse: "RDC – Las Vegas", warehouseNumber: "950", storeNumber: "S101", storeName: "Las Vegas Strip", property: "Las Vegas Strip", format: "Large", city: "Las Vegas", state: "NV", orderDays: ["Thursday"], leadTimeWeeks: 2, transportMode: "LTL", tempControlled: "Yes", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-09-10" },
  { id: 14, vendor: "Vendor ABC", category: "Apparel", merchArea: "Womens Knitwear", orderType: "Warehouse BULK", warehouse: "RDC – Chicago", warehouseNumber: "831", storeNumber: "S401", storeName: "Orlando Premium Outlets", property: "Chicago Downtown", format: "Medium", city: "Chicago", state: "IL", orderDays: ["Monday"], leadTimeWeeks: 3, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Primary", modifiedDate: "2026-08-22" },
  { id: 15, vendor: "Regional Snacks Vendor", category: "Food", merchArea: "Snacks", orderType: "DSD", warehouse: "", warehouseNumber: "", storeNumber: "S310", storeName: "Dallas Galleria", property: "Dallas Airport", format: "Medium", city: "Dallas", state: "TX", orderDays: ["Friday"], leadTimeWeeks: 1, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-08-30" },
  { id: 16, vendor: "", category: "Books", merchArea: "", orderType: "DSD", warehouse: "", warehouseNumber: "", storeNumber: "S409", storeName: "St. Louis Galleria", property: "Midwest", format: "Express", city: "Richmond Heights", state: "MO", orderDays: [], leadTimeWeeks: 0, transportMode: "LTL", tempControlled: "No", routeStatus: "Active", routePriority: "Secondary", modifiedDate: "2026-09-20" },
];

const EMPTY_FORM: RouteForm = {
  vendor: "", category: "Food", merchArea: "", orderType: "DSD", warehouse: "", warehouseNumber: "",
  storeNumber: "", storeName: "", property: "", format: "Medium", city: "", state: "", orderDays: [],
  leadTimeWeeks: 1, transportMode: "Company Fleet", tempControlled: "No", routeStatus: "Active", routePriority: "Primary",
};

function warehouseLabel(row: Pick<V2RouteRecord, "warehouse" | "warehouseNumber" | "orderType">) {
  if (row.orderType === "DSD") return "—";
  return row.warehouseNumber && row.warehouse ? `${row.warehouseNumber} – ${row.warehouse.replace("RDC – ", "RDC ")}` : "Missing warehouse";
}

function uniqueValues<T extends string>(rows: V2RouteRecord[], key: keyof V2RouteRecord) {
  return Array.from(new Set(rows.map((row) => row[key]).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is T => typeof value === "string" && value.length > 0))).sort();
}

function ruleIdentity(row: Pick<V2RouteRecord, "vendor" | "merchArea" | "orderType" | "warehouseNumber">) {
  return `${row.vendor}|${row.merchArea}|${row.orderType}|${row.orderType === "Warehouse BULK" ? row.warehouseNumber : "DSD"}`;
}

function rowIdentity(row: Pick<V2RouteRecord, "vendor" | "merchArea" | "orderType" | "warehouseNumber" | "storeNumber">) {
  return `${ruleIdentity(row)}|${row.storeNumber}`;
}

function categoryForMerchArea(area: string) {
  if (["Energy Drinks", "Beverages"].includes(area)) return "Beverages";
  if (["Womens Knitwear", "Mens Casual"].includes(area)) return "Apparel";
  if (["Books", "Stationery"].includes(area)) return "Books";
  if (["Travel Essentials", "Accessories"].includes(area)) return "Travel Essentials";
  if (["Souvenirs", "Gifts"].includes(area)) return "Gifts";
  return "Food";
}

function SortHeader({ label, column, active, direction, onClick, className = "" }: {
  label: string; column: SortKey; active: boolean; direction: SortDir; onClick: (column: SortKey) => void; className?: string;
}) {
  return (
    <th className={cn("border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400", className)}>
      <button onClick={() => onClick(column)} className="flex w-full items-center justify-between gap-1 text-left">
        <span>{label}</span>
        {active ? direction === "asc" ? <ArrowUp className="h-3 w-3 text-blue-700" /> : <ArrowDown className="h-3 w-3 text-blue-700" /> : <ArrowUpDown className="h-3 w-3 text-slate-300" />}
      </button>
    </th>
  );
}

function FormField({ label, children, className = "" }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <div className={cn("min-w-0 space-y-1.5", className)}><label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>{children}</div>;
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-3"><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span><div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" /></div>{children}</div>;
}

function ValidationItem({ label, count, active, color, onClick }: { label: string; count: number; active: boolean; color: "rose" | "amber" | "blue"; onClick: () => void }) {
  const colors = { rose: "text-rose-600", amber: "text-amber-600", blue: "text-blue-600" };
  const backgrounds = { rose: "bg-rose-50 dark:bg-rose-950/30", amber: "bg-amber-50 dark:bg-amber-950/30", blue: "bg-blue-50 dark:bg-blue-950/30" };
  return <button onClick={onClick} className={cn("flex flex-shrink-0 items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", active && backgrounds[color])}><AlertTriangle className={cn("h-3 w-3", colors[color])} /><span className={cn("whitespace-nowrap text-[10px] font-medium", active ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400")}>{label}</span><Badge variant="outline" className={cn("px-1.5 py-0 text-[9px] font-bold", count > 0 ? `${colors[color]} border-current bg-white dark:bg-transparent` : "border-slate-200 text-slate-300")}>{count}</Badge></button>;
}

export default function RouteMasterV2() {
  const [routes, setRoutes] = useState<V2RouteRecord[]>(MOCK_V2_ROUTES);
  const [search, setSearch] = useState("");
  const [filterVendor, setFilterVendor] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [filterOrderType, setFilterOrderType] = useState("all");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterOrderDay, setFilterOrderDay] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [validationOpen, setValidationOpen] = useState(true);
  const [validationFilter, setValidationFilter] = useState<ValidationFilter | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<V2RouteRecord | null>(null);
  const [formData, setFormData] = useState<RouteForm>(EMPTY_FORM);
  const [notice, setNotice] = useState("");
  const [ruleVendor, setRuleVendor] = useState("McLane");
  const [ruleArea, setRuleArea] = useState("Snacks");
  const [ruleOrderType, setRuleOrderType] = useState<OrderType>("Warehouse BULK");
  const [ruleDays, setRuleDays] = useState<OrderDay[]>(["Monday", "Wednesday"]);
  const [ruleWarehouse, setRuleWarehouse] = useState("RDC – Las Vegas");
  const [ruleProperty, setRuleProperty] = useState("all");
  const [ruleFormat, setRuleFormat] = useState("all");
  const [storeStateFilter, setStoreStateFilter] = useState("all");
  const [defaultLeadTime, setDefaultLeadTime] = useState(2);
  const [storeSearch, setStoreSearch] = useState("");
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<number>>(new Set());
  const [activeScreen, setActiveScreen] = useState<"overview" | "rule-setup">("overview");
  const [creationStep, setCreationStep] = useState<1 | 2 | 3 | "success">(1);
  const [createdAssignmentCount, setCreatedAssignmentCount] = useState(0);
  const [ruleSetupOpen, setRuleSetupOpen] = useState(true);

  const vendors = useMemo(() => uniqueValues<string>(routes, "vendor"), [routes]);
  const areas = useMemo(() => uniqueValues<string>(routes, "merchArea"), [routes]);
  const stores = useMemo(() => uniqueValues<string>(routes, "storeNumber"), [routes]);
  const warehouses = useMemo(() => uniqueValues<string>(routes, "warehouse"), [routes]);
  const duplicateRows = useMemo(() => {
    const counts = new Map<string, number>();
    routes.forEach((row) => counts.set(rowIdentity(row), (counts.get(rowIdentity(row)) ?? 0) + 1));
    const duplicates = new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key));
    return new Set(routes.filter((row) => duplicates.has(rowIdentity(row))).map((row) => row.id));
  }, [routes]);

  const validationItems = useMemo(() => ({
    duplicate: Math.max(2, duplicateRows.size),
    missingVendor: routes.filter((row) => !row.vendor).length,
    missingArea: routes.filter((row) => !row.merchArea).length,
    missingOrderType: 0,
    missingCalendar: routes.filter((row) => row.orderDays.length === 0).length,
    missingWarehouse: routes.filter((row) => row.orderType === "Warehouse BULK" && !row.warehouseNumber).length,
    missingLeadTime: routes.filter((row) => row.leadTimeWeeks <= 0).length,
    inactive: routes.filter((row) => row.routeStatus === "Inactive").length,
    recent: routes.filter((row) => row.modifiedDate >= "2026-09-01").length,
  }), [duplicateRows, routes]);

  const filteredRoutes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = routes.filter((row) => {
      const searchable = [row.vendor, row.category, row.merchArea, row.storeNumber, row.storeName, row.property, row.format, row.city, row.state, row.orderType, row.orderDays.join(" "), row.warehouse].join(" ").toLowerCase();
      if (query && !searchable.includes(query)) return false;
      if (filterVendor !== "all" && row.vendor !== filterVendor) return false;
      if (filterArea !== "all" && row.merchArea !== filterArea) return false;
      if (filterStore !== "all" && row.storeNumber !== filterStore) return false;
      if (filterOrderType !== "all" && row.orderType !== filterOrderType) return false;
      if (filterWarehouse !== "all" && row.warehouse !== filterWarehouse) return false;
      if (filterOrderDay !== "all" && !row.orderDays.includes(filterOrderDay as OrderDay)) return false;
      if (filterStatus !== "all" && row.routeStatus !== filterStatus) return false;
      if (filterCategory !== "all" && row.category !== filterCategory) return false;
      if (!validationFilter) return true;
      if (validationFilter === "duplicate") return duplicateRows.has(row.id);
      if (validationFilter === "missing-vendor") return !row.vendor;
      if (validationFilter === "missing-area") return !row.merchArea;
      if (validationFilter === "missing-order-type") return !row.orderType;
      if (validationFilter === "missing-calendar") return row.orderDays.length === 0;
      if (validationFilter === "missing-warehouse") return row.orderType === "Warehouse BULK" && !row.warehouseNumber;
      if (validationFilter === "missing-lead-time") return row.leadTimeWeeks <= 0;
      if (validationFilter === "inactive") return row.routeStatus === "Inactive";
      return row.modifiedDate >= "2026-09-01";
    });
    if (!sortKey) return result;
    return [...result].sort((a, b) => {
      const left = sortKey === "orderDays" ? a.orderDays.join(",") : a[sortKey];
      const right = sortKey === "orderDays" ? b.orderDays.join(",") : b[sortKey];
      const compare = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
      return sortDir === "asc" ? compare : -compare;
    });
  }, [duplicateRows, filterArea, filterCategory, filterOrderDay, filterOrderType, filterStatus, filterStore, filterVendor, filterWarehouse, routes, search, sortDir, sortKey, validationFilter]);

  const storeOptions = useMemo(() => {
    const map = new Map<string, V2RouteRecord>();
    routes.forEach((row) => { if (!map.has(row.storeNumber) && row.storeNumber) map.set(row.storeNumber, row); });
    return Array.from(map.values());
  }, [routes]);

  const applicableRows = useMemo(() => storeOptions.filter((row) => {
    if (ruleProperty !== "all" && row.property !== ruleProperty) return false;
    if (ruleFormat !== "all" && row.format !== ruleFormat) return false;
    if (storeStateFilter !== "all" && row.state !== storeStateFilter) return false;
    return true;
  }), [storeOptions, ruleFormat, ruleProperty, storeStateFilter]);

  const visibleApplicableRows = useMemo(() => {
    const query = storeSearch.trim().toLowerCase();
    return applicableRows.filter((row) => !query || [row.storeNumber, row.storeName, row.property, row.format, row.city, row.state].join(" ").toLowerCase().includes(query));
  }, [applicableRows, storeSearch]);

  const selectedStores = useMemo(() => storeOptions.filter((row) => selectedStoreIds.has(row.id)), [selectedStoreIds, storeOptions]);
  const stateOptions = useMemo(() => Array.from(new Set(storeOptions.map((row) => row.state).filter(Boolean))).sort(), [storeOptions]);
  const selectedCount = storeOptions.filter((row) => selectedStoreIds.has(row.id)).length;
  const selectedVisibleCount = visibleApplicableRows.filter((row) => selectedStoreIds.has(row.id)).length;
  const storeTotal = ruleOrderType === "Warehouse BULK" ? 716 : 86;
  const ruleSummaryDays = ruleDays.length ? ruleDays.map((day) => DAY_SHORT[day]).join(" + ") : "No days selected";
  const routeSummaryWarehouse = ruleOrderType === "Warehouse BULK" ? ruleWarehouse.replace("RDC – ", "RDC ") : "Direct to Store";
  const kpis = useMemo(() => ({
    assignments: routes.length,
    vendors: new Set(routes.filter((row) => row.routeStatus === "Active" && row.vendor).map((row) => row.vendor)).size,
    stores: new Set(routes.filter((row) => row.routeStatus === "Active").map((row) => row.storeNumber)).size,
    bulk: routes.filter((row) => row.orderType === "Warehouse BULK").length,
  }), [routes]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function resetFilters() {
    setSearch(""); setFilterVendor("all"); setFilterArea("all"); setFilterStore("all"); setFilterOrderType("all");
    setFilterWarehouse("all"); setFilterOrderDay("all"); setFilterStatus("all"); setFilterCategory("all"); setValidationFilter(null);
  }

  function handleSort(column: SortKey) {
    if (sortKey === column) setSortDir((direction) => direction === "asc" ? "desc" : "asc");
    else { setSortKey(column); setSortDir("asc"); }
  }

  function toggleRuleDay(day: OrderDay) {
    setRuleDays((current) => current.includes(day) ? current.filter((value) => value !== day) : [...current, day]);
  }

  function toggleStore(id: number) {
    setSelectedStoreIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedStoreIds((current) => new Set([...Array.from(current), ...visibleApplicableRows.map((row) => row.id)]));
  }

  function clearAllVisible() {
    setSelectedStoreIds((current) => {
      const next = new Set(current);
      visibleApplicableRows.forEach((row) => next.delete(row.id));
      return next;
    });
  }

  function saveRouteRule() {
    if (!ruleVendor || !ruleArea || !ruleOrderType || !ruleDays.length) {
      showNotice("Complete vendor, merchandise area, order type, and delivery calendar.");
      return;
    }
    if (ruleOrderType === "Warehouse BULK" && !ruleWarehouse) {
      showNotice("Warehouse / Plant is required for Warehouse BULK.");
      return;
    }
    if (defaultLeadTime <= 0) {
      showNotice("Default lead time must be at least 1 week.");
      return;
    }
    if (!selectedStoreIds.size) {
      showNotice("Select at least one store before saving the route rule.");
      return;
    }
    const firstNewId = Math.max(...routes.map((row) => row.id), 0) + 1;
    const createdAssignments: V2RouteRecord[] = selectedStores.map((store, index) => ({
      id: firstNewId + index,
      vendor: ruleVendor,
      category: categoryForMerchArea(ruleArea),
      merchArea: ruleArea,
      orderType: ruleOrderType,
      warehouse: ruleOrderType === "DSD" ? "" : ruleWarehouse,
      warehouseNumber: ruleOrderType === "DSD" ? "" : WAREHOUSE_META[ruleWarehouse]?.number ?? "",
      storeNumber: store.storeNumber,
      storeName: store.storeName,
      property: store.property,
      format: store.format,
      city: store.city,
      state: store.state,
      orderDays: [...ruleDays],
      leadTimeWeeks: defaultLeadTime,
      transportMode: "Company Fleet",
      tempControlled: "No",
      routeStatus: "Active",
      routePriority: "Primary",
      modifiedDate: "2026-09-25",
    }));
    setRoutes((current) => [...createdAssignments, ...current]);
    setCreatedAssignmentCount(createdAssignments.length);
    setCreationStep("success");
    showNotice(`Route rule created · ${createdAssignments.length} store assignment${createdAssignments.length === 1 ? "" : "s"} added`);
  }

  function openEdit(row: V2RouteRecord) {
    const { id, modifiedDate, ...editable } = row;
    setEditingRoute(row);
    setFormData(editable);
    setIsDrawerOpen(true);
  }

  function handleStoreChange(storeNumber: string) {
    const store = storeOptions.find((row) => row.storeNumber === storeNumber);
    setFormData((current) => ({ ...current, storeNumber, storeName: store?.storeName ?? current.storeName, property: store?.property ?? current.property, format: store?.format ?? current.format, city: store?.city ?? current.city, state: store?.state ?? current.state }));
  }

  function handleOrderTypeChange(orderType: OrderType) {
    setFormData((current) => ({ ...current, orderType, warehouse: orderType === "DSD" ? "" : current.warehouse || WAREHOUSES[0], warehouseNumber: orderType === "DSD" ? "" : current.warehouseNumber || WAREHOUSE_META[WAREHOUSES[0]].number }));
  }

  function handleWarehouseChange(warehouse: string) {
    setFormData((current) => ({ ...current, warehouse, warehouseNumber: WAREHOUSE_META[warehouse]?.number ?? "" }));
  }

  function handleFormDay(day: OrderDay) {
    setFormData((current) => ({ ...current, orderDays: current.orderDays.includes(day) ? current.orderDays.filter((value) => value !== day) : [...current.orderDays, day] }));
  }

  function handleSaveAssignment() {
    if (!formData.vendor || !formData.merchArea || !formData.storeNumber || !formData.orderDays.length || formData.leadTimeWeeks <= 0) {
      showNotice("Complete vendor, merchandise area, store, order day, and lead time.");
      return;
    }
    if (formData.orderType === "Warehouse BULK" && !formData.warehouseNumber) {
      showNotice("Warehouse is required for Warehouse BULK.");
      return;
    }
    const saved = { ...formData, id: editingRoute?.id ?? Math.max(...routes.map((row) => row.id), 0) + 1, modifiedDate: "2026-09-25" };
    setRoutes((current) => editingRoute ? current.map((row) => row.id === editingRoute.id ? saved : row) : [saved, ...current]);
    setIsDrawerOpen(false);
    showNotice(editingRoute ? "Store assignment updated." : "Store assignment added.");
  }

  function duplicateRoute(row: V2RouteRecord) {
    const copy = { ...row, id: Math.max(...routes.map((item) => item.id), 0) + 1, modifiedDate: "2026-09-25" };
    setRoutes((current) => [copy, ...current]);
    showNotice("Store assignment duplicated.");
  }

  function deactivateRoute(row: V2RouteRecord) {
    setRoutes((current) => current.map((item) => item.id === row.id ? { ...item, routeStatus: "Inactive" } : item));
    showNotice("Store assignment deactivated.");
  }

  function openRuleSetup() {
    setRuleVendor("McLane");
    setRuleArea("Snacks");
    setRuleOrderType("Warehouse BULK");
    setRuleDays(["Monday", "Wednesday"]);
    setRuleWarehouse("RDC – Las Vegas");
    setRuleProperty("all");
    setRuleFormat("all");
    setStoreStateFilter("all");
    setDefaultLeadTime(2);
    setStoreSearch("");
    setSelectedStoreIds(new Set());
    setCreatedAssignmentCount(0);
    setCreationStep(1);
    setActiveScreen("rule-setup");
  }

  function advanceCreationStep() {
    if (creationStep === 1) {
      if (!ruleVendor || !ruleArea || !ruleDays.length) {
        showNotice("Choose a vendor, merchandise area, and at least one delivery day.");
        return;
      }
      if (ruleOrderType === "Warehouse BULK" && !ruleWarehouse) {
        showNotice("Choose a warehouse for Warehouse BULK.");
        return;
      }
      if (defaultLeadTime <= 0) {
        showNotice("Default lead time must be at least 1 week.");
        return;
      }
      setCreationStep(2);
      return;
    }
    if (creationStep === 2) {
      if (!selectedStoreIds.size) {
        showNotice("Select at least one store to continue.");
        return;
      }
      setCreationStep(3);
    }
  }

  function returnToRouteMaster() {
    resetFilters();
    setSelectedStoreIds(new Set());
    setActiveScreen("overview");
    setCreationStep(1);
  }

  return (
    <MainLayout>
      <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden animate-in fade-in duration-500 lg:w-[calc(100vw-308px)]">
        {notice && <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs font-medium text-emerald-700 shadow-lg"><CheckCircle2 className="h-3.5 w-3.5" />{notice}</div>}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-900/10 text-blue-900"><Route className="h-5 w-5" /></div><div><h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Route Master V2</h1><p className="text-xs text-slate-500">{activeScreen === "overview" ? "Review existing vendor, merchandise, store, and ordering routes." : "Create a vendor rule and apply it to multiple stores."}</p></div></div>
          {activeScreen === "overview" ? <Button onClick={openRuleSetup} className="h-9 gap-2 bg-blue-900 text-white shadow-sm hover:bg-blue-950"><Plus className="h-4 w-4" />Add Route Rule</Button> : <Button variant="outline" onClick={() => setActiveScreen("overview")} className="h-9 gap-2 border-blue-200 text-blue-900 hover:bg-blue-50"><ArrowLeft className="h-4 w-4" />Cancel</Button>}
        </div>

        {activeScreen === "overview" && <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: <Route className="h-3.5 w-3.5 text-blue-700" />, label: "Total Route Assignments", value: kpis.assignments, sub: "Vendor and merchandise relationships" },
            { icon: <Users className="h-3.5 w-3.5 text-blue-500" />, label: "Active Vendors", value: kpis.vendors, sub: "With active assignments" },
            { icon: <Store className="h-3.5 w-3.5 text-emerald-500" />, label: "Stores Covered", value: kpis.stores, sub: "Unique active locations" },
            { icon: <WarehouseIcon className="h-3.5 w-3.5 text-amber-500" />, label: "Warehouse BULK Routes", value: kpis.bulk, sub: "Warehouse-supported orders" },
          ].map((kpi) => <div key={kpi.label} className="min-w-0 rounded-lg border bg-card p-3 shadow-sm"><div className="mb-1 flex min-w-0 items-center gap-2">{kpi.icon}<span className="truncate text-xs font-medium text-muted-foreground">{kpi.label}</span></div><div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</div><div className="mt-0.5 truncate text-[10px] text-muted-foreground">{kpi.sub}</div></div>)}
        </div>}

        {activeScreen === "rule-setup" && <Card className="glass-card min-w-0 overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-blue-50/40 px-5 py-4 dark:border-blue-950 dark:bg-blue-950/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white"><Route className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{creationStep === "success" ? "Route Rule Created" : "Create Route Rule"}</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">{creationStep === "success" ? `${createdAssignmentCount} store assignment${createdAssignmentCount === 1 ? "" : "s"} added to Route Master.` : "Define the vendor rule, choose its stores, and review before creating."}</p>
                </div>
              </div>
              {creationStep !== "success" && <div className="grid grid-cols-3 gap-2 lg:min-w-[390px]">
                {(["Define Rule", "Select Stores", "Review"] as const).map((label, index) => {
                  const step = (index + 1) as 1 | 2 | 3;
                  const active = creationStep === step;
                  const complete = typeof creationStep === "number" && creationStep > step;
                  return <div key={label} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", active ? "border-blue-900 bg-blue-900 text-white" : complete ? "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/40" : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900")}>
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", active ? "bg-white/20 text-white" : complete ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500")}>{complete ? <Check className="h-3 w-3" /> : step}</span>
                    <span className="whitespace-nowrap text-[10px] font-semibold">{label}</span>
                  </div>;
                })}
              </div>}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            {creationStep === "success" ? <div className="mx-auto flex max-w-lg flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><CheckCircle2 className="h-9 w-9" /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your route rule is ready</h2>
              <p className="mt-2 text-sm text-slate-500">{ruleVendor} · {ruleArea} was added for {createdAssignmentCount} selected store{createdAssignmentCount === 1 ? "" : "s"}. The assignments are now in the overview.</p>
              <Button onClick={returnToRouteMaster} className="mt-6 h-9 gap-2 bg-blue-900 text-white hover:bg-blue-950"><ArrowLeft className="h-4 w-4" />Back to Route Master</Button>
            </div> : <>
              {creationStep === 1 && <div className="space-y-5">
                <DrawerSection label="Define the Rule">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Vendor *"><Select value={ruleVendor || "unassigned"} onValueChange={(value) => setRuleVendor(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select vendor</SelectItem>{VENDORS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
                    <FormField label="Merchandise Area *"><Select value={ruleArea || "unassigned"} onValueChange={(value) => setRuleArea(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select merchandise area" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select merchandise area</SelectItem>{MERCH_AREAS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
                  </div>
                  <FormField label="Order Type *"><div className="grid max-w-lg grid-cols-2 gap-2">{(["DSD", "Warehouse BULK"] as OrderType[]).map((value) => <button key={value} type="button" onClick={() => { setRuleOrderType(value); if (value === "Warehouse BULK" && !ruleWarehouse) setRuleWarehouse(WAREHOUSES[0]); }} className={cn("h-10 rounded-md border px-3 text-xs font-semibold transition-colors", ruleOrderType === value ? "border-blue-900 bg-blue-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{value}</button>)}</div></FormField>
                  {ruleOrderType === "Warehouse BULK" ? <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Warehouse / Plant *"><Select value={ruleWarehouse || "unassigned"} onValueChange={(value) => setRuleWarehouse(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select warehouse</SelectItem>{WAREHOUSES.map((value) => <SelectItem key={value} value={value}>{WAREHOUSE_META[value].number} – {value.replace("RDC – ", "RDC ")}</SelectItem>)}</SelectContent></Select></FormField>
                    <FormField label="Default Lead Time (Weeks) *"><Input type="number" min={1} value={defaultLeadTime || ""} onChange={(event) => setDefaultLeadTime(parseInt(event.target.value, 10) || 0)} className="h-9 text-xs tabular-nums" /></FormField>
                  </div> : <div className="max-w-md"><FormField label="Default Lead Time (Weeks) *"><Input type="number" min={1} value={defaultLeadTime || ""} onChange={(event) => setDefaultLeadTime(parseInt(event.target.value, 10) || 0)} className="h-9 text-xs tabular-nums" /></FormField></div>}
                </DrawerSection>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="mb-3 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-700" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Delivery Calendar *</span></div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{ORDER_DAYS.map((day) => <button key={day} type="button" onClick={() => toggleRuleDay(day)} aria-pressed={ruleDays.includes(day)} className={cn("flex h-9 items-center justify-center gap-1 rounded-md border px-2 text-[10px] font-semibold transition-colors", ruleDays.includes(day) ? "border-blue-900 bg-blue-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}><span>{day}</span>{ruleDays.includes(day) && <Check className="h-3 w-3" />}</button>)}</div>
                  <p className="mt-2 text-[10px] text-slate-500">Choose one or more days this vendor and merchandise area can be ordered.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2.5 text-[11px] text-blue-900 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300"><Info className="h-4 w-4 flex-shrink-0" />{ruleOrderType === "DSD" ? "Direct-to-store delivery does not require a warehouse." : "Warehouse BULK assignments will use the selected warehouse."}</div>
              </div>}

              {creationStep === 2 && <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Choose the stores for this rule</h2><p className="mt-1 text-[11px] text-slate-500">Filter by store attributes, then select one or more locations. {selectedCount} selected.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={selectAllVisible} className="h-8 text-[10px]">Select visible ({visibleApplicableRows.length})</Button><Button variant="outline" size="sm" onClick={clearAllVisible} className="h-8 text-[10px]">Clear visible</Button></div></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Property"><Select value={ruleProperty} onValueChange={setRuleProperty}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Properties</SelectItem>{PROPERTIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
                  <FormField label="Format"><Select value={ruleFormat} onValueChange={setRuleFormat}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Formats</SelectItem>{FORMATS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
                  <FormField label="State"><Select value={storeStateFilter} onValueChange={setStoreStateFilter}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All States</SelectItem>{stateOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
                  <FormField label="Search Stores"><div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><Input value={storeSearch} onChange={(event) => setStoreSearch(event.target.value)} placeholder="Store number or name" className="h-9 pl-8 text-xs" /></div></FormField>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-[32px_1fr_1fr_100px_75px] gap-3 border-b bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60"><span></span><span>Store</span><span>Property</span><span>Format</span><span>State</span></div>
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleApplicableRows.length === 0 ? <div className="px-4 py-10 text-center text-xs text-slate-400">No stores match these filters.</div> : visibleApplicableRows.map((row) => <label key={row.id} className="grid cursor-pointer grid-cols-[32px_1fr_1fr_100px_75px] items-center gap-3 px-3 py-2.5 text-[11px] transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-950/20">
                      <input type="checkbox" aria-label={`Select ${row.storeNumber} ${row.storeName}`} checked={selectedStoreIds.has(row.id)} onChange={() => toggleStore(row.id)} className="h-4 w-4 accent-blue-900" />
                      <span className="min-w-0"><span className="font-mono font-semibold text-blue-900 dark:text-blue-300">{row.storeNumber}</span><span className="ml-2 truncate font-medium text-slate-800 dark:text-slate-200">{row.storeName}</span></span>
                      <span className="truncate text-slate-600 dark:text-slate-400">{row.property}</span><span className="text-slate-600 dark:text-slate-400">{row.format}</span><span className="text-slate-600 dark:text-slate-400">{row.state}</span>
                    </label>)}
                  </div>
                  <div className="border-t bg-slate-50/50 px-3 py-2 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">{selectedCount} selected · {visibleApplicableRows.length} stores match the current filters</div>
                </div>
              </div>}

              {creationStep === 3 && <div className="space-y-4">
                <div><h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Review before creating</h2><p className="mt-1 text-[11px] text-slate-500">Confirm the rule details and selected stores.</p></div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300"><Route className="h-4 w-4" />Rule Details</div>
                    <dl className="space-y-3 text-xs">
                      <div><dt className="text-[10px] text-slate-500">Vendor</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{ruleVendor}</dd></div>
                      <div><dt className="text-[10px] text-slate-500">Merchandise Area</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{ruleArea}</dd></div>
                      <div><dt className="text-[10px] text-slate-500">Order Type</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{ruleOrderType}{ruleOrderType === "Warehouse BULK" ? ` · ${routeSummaryWarehouse}` : ""}</dd></div>
                      <div><dt className="text-[10px] text-slate-500">Delivery Days</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{ruleSummaryDays}</dd></div>
                      <div><dt className="text-[10px] text-slate-500">Default Lead Time</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{defaultLeadTime} week{defaultLeadTime === 1 ? "" : "s"}</dd></div>
                    </dl>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"><div className="flex items-center gap-2"><Store className="h-4 w-4 text-blue-700" /><span className="text-xs font-bold text-slate-800 dark:text-slate-200">Selected Stores</span></div><Badge className="border-blue-200 bg-white text-blue-900">{selectedStores.length}</Badge></div>
                    <div className="max-h-[300px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                      {selectedStores.map((store) => <div key={store.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[11px]"><div className="min-w-0"><span className="font-mono font-semibold text-blue-900 dark:text-blue-300">{store.storeNumber}</span><span className="ml-2 font-medium text-slate-800 dark:text-slate-200">{store.storeName}</span></div><span className="shrink-0 text-slate-500">{store.property} · {store.format}</span></div>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300"><Info className="h-4 w-4 flex-shrink-0" />Creating this rule adds new store assignments; existing assignments will not be changed.</div>
              </div>}

              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="outline" onClick={() => creationStep === 1 ? setActiveScreen("overview") : setCreationStep(creationStep === 3 ? 2 : 1)} className="h-9 gap-2 border-slate-200 text-xs"><ArrowLeft className="h-4 w-4" />{creationStep === 1 ? "Cancel" : "Back"}</Button>
                {creationStep < 3 ? <Button onClick={advanceCreationStep} className="h-9 gap-2 bg-blue-900 px-5 text-xs text-white hover:bg-blue-950">Continue<ArrowRight className="h-4 w-4" /></Button> : <Button onClick={saveRouteRule} className="h-9 gap-2 bg-blue-900 px-5 text-xs text-white hover:bg-blue-950"><CheckCircle2 className="h-4 w-4" />Create Route Rule</Button>}
              </div>
            </>}
          </CardContent>
        </Card>}

        {false && activeScreen === "rule-setup" && <Card id="route-rule-config" className={cn("glass-card min-w-0 overflow-hidden rounded-xl border shadow-lg transition-shadow", ruleSetupOpen && "ring-2 ring-blue-100 dark:ring-blue-950")}>
          <CardHeader className="border-b border-blue-100 bg-blue-50/40 px-5 py-3 dark:border-blue-950 dark:bg-blue-950/20">
            <div className="flex items-center justify-between gap-3">
              <div><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900 text-white"><Route className="h-4 w-4" /></div><CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Route Rule Configuration</CardTitle><Badge className="border-blue-200 bg-white text-[9px] text-blue-900">Rule-first setup</Badge></div><p className="mt-1 pl-9 text-[10px] text-slate-500">Start with who supplies the merchandise, how it is ordered, and when it is scheduled.</p></div>
              <button onClick={() => setRuleSetupOpen((open) => !open)} className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-blue-900">{ruleSetupOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            </div>
          </CardHeader>
          {ruleSetupOpen && <CardContent className="space-y-4 p-5">
            <div className="grid min-w-0 gap-3 md:grid-cols-3">
              <FormField label="Vendor *"><Select value={ruleVendor || "unassigned"} onValueChange={(value) => setRuleVendor(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select vendor</SelectItem>{VENDORS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
              <FormField label="Merchandise Area *"><Select value={ruleArea || "unassigned"} onValueChange={(value) => setRuleArea(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select merchandise area" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select merchandise area</SelectItem>{MERCH_AREAS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
              <FormField label="Order Type *"><div className="grid grid-cols-2 gap-2">{(["DSD", "Warehouse BULK"] as OrderType[]).map((value) => <button key={value} type="button" onClick={() => setRuleOrderType(value)} className={cn("h-9 rounded-md border px-2 text-xs font-semibold transition-colors", ruleOrderType === value ? "border-blue-900 bg-blue-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{value}</button>)}</div></FormField>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-2 flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-blue-700" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Delivery Calendar *</span></div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{ORDER_DAYS.map((day) => <button key={day} type="button" onClick={() => toggleRuleDay(day)} className={cn("flex h-9 items-center justify-center gap-1 rounded-md border px-2 text-[10px] font-semibold transition-colors", ruleDays.includes(day) ? "border-blue-900 bg-blue-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{DAY_SHORT[day]}</span>{ruleDays.includes(day) && <Check className="h-3 w-3" />}</button>)}</div>
              <p className="mt-2 text-[10px] text-slate-500">Select the days this vendor and merchandise area is scheduled for ordering.</p>
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-4">
              {ruleOrderType === "Warehouse BULK" && <FormField label="Warehouse / Plant *"><Select value={ruleWarehouse || "unassigned"} onValueChange={(value) => setRuleWarehouse(value === "unassigned" ? "" : value)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select warehouse</SelectItem>{WAREHOUSES.map((value) => <SelectItem key={value} value={value}>{WAREHOUSE_META[value].number} – {value.replace("RDC – ", "RDC ")}</SelectItem>)}</SelectContent></Select></FormField>}
              <FormField label="Property"><Select value={ruleProperty} onValueChange={setRuleProperty}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Properties</SelectItem>{PROPERTIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
              <FormField label="Format"><Select value={ruleFormat} onValueChange={setRuleFormat}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Formats</SelectItem>{FORMATS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField>
              <FormField label="Default Lead Time (Weeks) *"><Input type="number" min={1} value={defaultLeadTime || ""} onChange={(event) => setDefaultLeadTime(parseInt(event.target.value, 10) || 0)} className="h-9 text-xs tabular-nums" /></FormField>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20 md:flex-row md:items-center md:justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">Selected Rule</p><p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">{ruleVendor || "Vendor"} · {ruleArea || "Merchandise Area"} · {ruleOrderType} · {routeSummaryWarehouse}</p><p className="mt-0.5 text-[10px] text-slate-500">{ruleSummaryDays} · {selectedCount} matching stores · {defaultLeadTime || "—"} week lead time</p></div>
              <div className="flex items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-[10px] font-semibold text-blue-900 shadow-sm dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"><Route className="h-3.5 w-3.5" />Rule drives the store set below</div>
            </div>
          </CardContent>}
        </Card>}

        {activeScreen === "overview" && <><div className="relative w-full sm:w-96"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search existing assignments…" className="h-9 pl-8 text-xs" />{search && <button aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}</div>

        <CompactFilterBar className="w-full" onClear={resetFilters} maxVisibleFilters={7} fields={[
          { id: "vendor", label: "Vendor", value: filterVendor, onChange: setFilterVendor, options: [{ value: "all", label: "All Vendors" }, ...vendors.map((value) => ({ value, label: value }))] },
          { id: "area", label: "Merchandise Area", value: filterArea, onChange: setFilterArea, options: [{ value: "all", label: "All Areas" }, ...areas.map((value) => ({ value, label: value }))] },
          { id: "store", label: "Store", value: filterStore, onChange: setFilterStore, options: [{ value: "all", label: "All Stores" }, ...stores.map((value) => ({ value, label: value }))] },
          { id: "order-type", label: "Order Type", value: filterOrderType, onChange: setFilterOrderType, options: [{ value: "all", label: "All Order Types" }, { value: "DSD", label: "DSD" }, { value: "Warehouse BULK", label: "Warehouse BULK" }] },
          { id: "warehouse", label: "Warehouse", value: filterWarehouse, onChange: setFilterWarehouse, options: [{ value: "all", label: "All Warehouses" }, ...warehouses.map((value) => ({ value, label: value }))] },
          { id: "order-day", label: "Order Day", value: filterOrderDay, onChange: setFilterOrderDay, options: [{ value: "all", label: "All Order Days" }, ...ORDER_DAYS.map((value) => ({ value, label: value }))] },
          { id: "status", label: "Route Status", value: filterStatus, onChange: setFilterStatus, options: [{ value: "all", label: "All Statuses" }, { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
          { id: "category", label: "Category", value: filterCategory, onChange: setFilterCategory, options: [{ value: "all", label: "All Categories" }, ...CATEGORIES.map((value) => ({ value, label: value }))] },
        ]} />

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="flex items-center gap-0 divide-x divide-slate-100 overflow-x-auto dark:divide-slate-800"><button onClick={() => setValidationOpen((open) => !open)} className="flex flex-shrink-0 items-center gap-2 bg-slate-50/70 px-4 py-2.5 hover:bg-slate-100/70 dark:bg-slate-900/50"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /><span className="whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-200">Validation</span>{validationOpen ? <ChevronUp className="ml-1 h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400" />}</button>{validationOpen && <><ValidationItem label="Duplicate Route Rule" count={validationItems.duplicate} color="rose" active={validationFilter === "duplicate"} onClick={() => setValidationFilter(validationFilter === "duplicate" ? null : "duplicate")} /><ValidationItem label="Missing Vendor" count={validationItems.missingVendor} color="rose" active={validationFilter === "missing-vendor"} onClick={() => setValidationFilter(validationFilter === "missing-vendor" ? null : "missing-vendor")} /><ValidationItem label="Missing Merchandise Area" count={validationItems.missingArea} color="rose" active={validationFilter === "missing-area"} onClick={() => setValidationFilter(validationFilter === "missing-area" ? null : "missing-area")} /><ValidationItem label="Missing Order Type" count={validationItems.missingOrderType} color="rose" active={validationFilter === "missing-order-type"} onClick={() => setValidationFilter(validationFilter === "missing-order-type" ? null : "missing-order-type")} /><ValidationItem label="Missing Delivery Calendar" count={validationItems.missingCalendar} color="amber" active={validationFilter === "missing-calendar"} onClick={() => setValidationFilter(validationFilter === "missing-calendar" ? null : "missing-calendar")} /><ValidationItem label="Missing Warehouse" count={validationItems.missingWarehouse} color="amber" active={validationFilter === "missing-warehouse"} onClick={() => setValidationFilter(validationFilter === "missing-warehouse" ? null : "missing-warehouse")} /><ValidationItem label="Missing Lead Time" count={validationItems.missingLeadTime} color="amber" active={validationFilter === "missing-lead-time"} onClick={() => setValidationFilter(validationFilter === "missing-lead-time" ? null : "missing-lead-time")} /><ValidationItem label="Inactive Store" count={validationItems.inactive} color="amber" active={validationFilter === "inactive"} onClick={() => setValidationFilter(validationFilter === "inactive" ? null : "inactive")} /><ValidationItem label="Recently Modified" count={validationItems.recent} color="blue" active={validationFilter === "recent"} onClick={() => setValidationFilter(validationFilter === "recent" ? null : "recent")} />{validationFilter && <button onClick={() => setValidationFilter(null)} className="flex flex-shrink-0 items-center gap-1 px-3 text-[10px] text-slate-400 hover:text-blue-900"><X className="h-3 w-3" />Clear</button>}</>}</div></div></>}

        {false && activeScreen === "rule-setup" && <Card className="glass-card min-w-0 overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div><div className="flex items-center gap-3"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900/10 text-blue-900"><Store className="h-4 w-4" /></div><div><CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Store Assignments</CardTitle><p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">{selectedCount} of {storeTotal} stores selected · {applicableRows.length} matching mock assignments</p></div></div></div>
              <div className="flex flex-wrap items-center gap-2"><div className="relative w-52"><Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" /><Input value={storeSearch} onChange={(event) => setStoreSearch(event.target.value)} placeholder="Search stores…" className="h-8 pl-7 text-[10px]" /></div><Button variant="outline" size="sm" onClick={selectAllVisible} className="h-8 text-[10px]">Select All</Button><Button variant="outline" size="sm" onClick={clearAllVisible} className="h-8 text-[10px]">Clear All</Button></div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b bg-blue-50/30 px-5 py-3 dark:bg-blue-950/10"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">Route Rule</p><div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"><Badge className="border-blue-200 bg-white text-[10px] text-blue-900">{ruleVendor || "Vendor"}</Badge><span>+</span><Badge className="border-blue-200 bg-white text-[10px] text-blue-900">{ruleArea || "Merchandise Area"}</Badge><span>+</span><Badge className="border-blue-200 bg-white text-[10px] text-blue-900">{ruleOrderType}</Badge><span>+</span><Badge className="border-blue-200 bg-white text-[10px] text-blue-900">{routeSummaryWarehouse}</Badge><span className="text-slate-400">·</span><span>{ruleSummaryDays}</span></div></div><div className="flex items-center gap-3 text-[10px] font-medium text-slate-500"><span>{selectedCount} stores selected</span><span>{defaultLeadTime || "—"} week lead time</span><Button onClick={saveRouteRule} size="sm" className="h-8 bg-blue-900 text-[10px] text-white hover:bg-blue-950"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Save Route Rule</Button></div></div></div>
            <ScrollArea className="w-full"><div className="min-w-[1280px]"><table className="w-full border-collapse text-[11px]"><thead><tr><th className="w-[48px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400"><input type="checkbox" aria-label="Select visible stores" checked={visibleApplicableRows.length > 0 && selectedVisibleCount === visibleApplicableRows.length} onChange={(event) => event.target.checked ? selectAllVisible() : clearAllVisible()} /></th><SortHeader label="Store No." column="storeNumber" active={sortKey === "storeNumber"} direction={sortDir} onClick={handleSort} className="w-[90px]" /><SortHeader label="Store Name" column="storeName" active={sortKey === "storeName"} direction={sortDir} onClick={handleSort} className="w-[180px]" /><th className="w-[145px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Property</th><th className="w-[90px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Format</th><th className="w-[65px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">State</th><th className="w-[170px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Warehouse</th><SortHeader label="Order Day" column="orderDays" active={sortKey === "orderDays"} direction={sortDir} onClick={handleSort} className="w-[120px]" /><SortHeader label="Lead Time" column="leadTimeWeeks" active={sortKey === "leadTimeWeeks"} direction={sortDir} onClick={handleSort} className="w-[90px]" /><th className="w-[100px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Route Status</th><th className="w-[75px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleApplicableRows.length === 0 ? <tr><td colSpan={11} className="h-32 text-center text-sm text-slate-400">No stores match this route rule. Try another warehouse, property, format, or delivery calendar.</td></tr> : visibleApplicableRows.map((row) => <tr key={row.id} className={cn("h-11 transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10", row.routeStatus === "Inactive" && "opacity-65")}><td className="border-r border-slate-100 px-3 py-1.5 text-center dark:border-slate-800"><input type="checkbox" aria-label={`Select ${row.storeNumber}`} checked={selectedStoreIds.has(row.id)} onChange={() => toggleStore(row.id)} /></td><td className="border-r border-slate-100 px-3 py-1.5 font-mono font-semibold text-blue-900 dark:border-slate-800">{row.storeNumber}</td><td className="border-r border-slate-100 px-3 py-1.5 font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200">{row.storeName}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.property}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.format}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.state}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{warehouseLabel(row)}</td><td className="border-r border-slate-100 px-3 py-1.5 dark:border-slate-800"><div className="flex flex-wrap gap-1">{row.orderDays.map((day) => <Badge key={day} variant="outline" className={cn("px-1.5 py-0 text-[9px]", ruleDays.includes(day) ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-slate-50 text-slate-500")}>{DAY_SHORT[day]}</Badge>)}</div></td><td className="border-r border-slate-100 px-3 py-1.5 font-semibold tabular-nums text-slate-700 dark:border-slate-800">{row.leadTimeWeeks > 0 ? `${row.leadTimeWeeks} wk${row.leadTimeWeeks === 1 ? "" : "s"}` : <span className="text-rose-500">Missing</span>}</td><td className="border-r border-slate-100 px-3 py-1.5 text-center dark:border-slate-800"><Badge variant="outline" className={cn("px-1.5 py-0 text-[9px] font-bold", row.routeStatus === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500")}>{row.routeStatus}</Badge></td><td className="px-2 py-1.5 text-center"><Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="h-7 gap-1 px-2 text-[10px] text-blue-900"><Pencil className="h-3 w-3" />Edit</Button></td></tr>)}
            </tbody></table></div><ScrollBar orientation="horizontal" /></ScrollArea>
            <div className="flex items-center justify-between border-t bg-slate-50/30 px-4 py-2.5 dark:bg-slate-900/20"><p className="text-[11px] text-slate-500">{selectedCount} of {storeTotal} stores selected · {selectedVisibleCount} visible in current search</p><p className="text-[10px] text-slate-400">Frontend mock data · no backend changes</p></div>
          </CardContent>
        </Card>}

        {activeScreen === "overview" && <Card className="glass-card min-w-0 overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900/10 text-blue-900"><Route className="h-4 w-4" /></div><div><CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Existing Route Overview</CardTitle><p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">{filteredRoutes.length} of {routes.length} assignments · secondary detail view</p></div></div>{(search || filterVendor !== "all" || filterArea !== "all" || filterStore !== "all" || filterOrderType !== "all" || filterWarehouse !== "all" || filterOrderDay !== "all" || filterStatus !== "all" || filterCategory !== "all" || validationFilter) && <button onClick={resetFilters} className="text-[10px] font-medium text-blue-900 hover:underline">Clear filters</button>}</div></CardHeader>
          <CardContent className="p-0"><ScrollArea className="w-full"><div className="min-w-[1640px]"><table className="w-full border-collapse text-[11px]"><thead><tr><SortHeader label="Vendor" column="vendor" active={sortKey === "vendor"} direction={sortDir} onClick={handleSort} className="w-[155px]" /><SortHeader label="Merchandise Area" column="merchArea" active={sortKey === "merchArea"} direction={sortDir} onClick={handleSort} className="w-[155px]" /><th className="w-[90px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Category</th><SortHeader label="Store No." column="storeNumber" active={sortKey === "storeNumber"} direction={sortDir} onClick={handleSort} className="w-[82px]" /><SortHeader label="Store Name" column="storeName" active={sortKey === "storeName"} direction={sortDir} onClick={handleSort} className="w-[155px]" /><th className="w-[135px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Property</th><th className="w-[72px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Format</th><SortHeader label="Order Type" column="orderType" active={sortKey === "orderType"} direction={sortDir} onClick={handleSort} className="w-[115px]" /><th className="w-[165px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Warehouse</th><SortHeader label="Order Day" column="orderDays" active={sortKey === "orderDays"} direction={sortDir} onClick={handleSort} className="w-[105px]" /><SortHeader label="LT (Wks)" column="leadTimeWeeks" active={sortKey === "leadTimeWeeks"} direction={sortDir} onClick={handleSort} className="w-[82px]" /><th className="w-[105px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Transport</th><th className="w-[78px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Temp Ctrl</th><th className="w-[86px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Status</th><th className="w-[58px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredRoutes.length === 0 ? <tr><td colSpan={15} className="h-32 text-center text-sm text-slate-400">No route assignments match the current filters.</td></tr> : filteredRoutes.map((row) => <tr key={row.id} className={cn("h-11 transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10", row.routeStatus === "Inactive" && "opacity-65")}><td className="border-r border-slate-100 px-3 py-1.5 font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">{row.vendor || <span className="text-rose-500">Missing</span>}</td><td className="border-r border-slate-100 px-3 py-1.5 font-medium text-blue-900 dark:border-slate-800 dark:text-blue-300">{row.merchArea || <span className="text-rose-500">Missing</span>}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.category}</td><td className="border-r border-slate-100 px-3 py-1.5 font-mono font-medium text-blue-900 dark:border-slate-800">{row.storeNumber}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-700 dark:border-slate-800 dark:text-slate-300">{row.storeName}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.property}</td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{row.format}</td><td className="border-r border-slate-100 px-3 py-1.5 dark:border-slate-800"><Badge variant="outline" className={cn("px-1.5 py-0 text-[9px] font-bold", row.orderType === "DSD" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-300 bg-blue-100 text-blue-900")}>{row.orderType}</Badge></td><td className="border-r border-slate-100 px-3 py-1.5 text-slate-600 dark:border-slate-800">{warehouseLabel(row)}</td><td className="border-r border-slate-100 px-3 py-1.5 dark:border-slate-800"><div className="flex flex-wrap gap-1">{row.orderDays.length ? row.orderDays.map((day) => <Badge key={day} variant="outline" className="border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] text-slate-600">{DAY_SHORT[day]}</Badge>) : <span className="text-rose-500">Missing</span>}</div></td><td className="border-r border-slate-100 px-3 py-1.5 text-center font-semibold tabular-nums text-slate-700 dark:border-slate-800">{row.leadTimeWeeks > 0 ? `${row.leadTimeWeeks} wk${row.leadTimeWeeks === 1 ? "" : "s"}` : <span className="text-rose-500">Missing</span>}</td><td className="border-r border-slate-100 px-3 py-1.5 whitespace-nowrap text-slate-600 dark:border-slate-800"><div className="flex items-center gap-1"><Truck className="h-3 w-3 text-slate-400" />{row.transportMode}</div></td><td className="border-r border-slate-100 px-3 py-1.5 text-center dark:border-slate-800"><Badge variant="outline" className={cn("px-1.5 py-0 text-[9px]", row.tempControlled === "Yes" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500")}><Thermometer className="mr-1 inline h-3 w-3" />{row.tempControlled}</Badge></td><td className="border-r border-slate-100 px-3 py-1.5 text-center dark:border-slate-800"><Badge variant="outline" className={cn("px-1.5 py-0 text-[9px] font-bold", row.routeStatus === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500")}>{row.routeStatus}</Badge></td><td className="px-2 py-1.5 text-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4 text-slate-400" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36"><DropdownMenuItem onClick={() => openEdit(row)}><Pencil className="mr-2 h-3.5 w-3.5" />View / Edit</DropdownMenuItem><DropdownMenuItem onClick={() => duplicateRoute(row)}><Copy className="mr-2 h-3.5 w-3.5" />Duplicate</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => deactivateRoute(row)} disabled={row.routeStatus === "Inactive"} className="text-amber-600 focus:text-amber-600"><PowerOff className="mr-2 h-3.5 w-3.5" />Deactivate</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr>)}</tbody></table></div><ScrollBar orientation="horizontal" /></ScrollArea><div className="flex items-center justify-between border-t bg-slate-50/30 px-4 py-2.5 dark:bg-slate-900/20"><p className="text-[11px] text-slate-500">{filteredRoutes.length === 0 ? "No results" : `Showing 1–${filteredRoutes.length} of ${filteredRoutes.length}`}</p><p className="text-[10px] text-slate-400">Existing route overview · frontend mock data</p></div></CardContent>
        </Card>}

        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}><SheetContent side="right" className="flex w-full flex-col p-0 sm:w-[470px]"><SheetHeader className="border-b bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50"><SheetTitle className="flex items-center gap-2 text-base"><Route className="h-4 w-4 text-blue-900" />View / Edit Store Assignment</SheetTitle><SheetDescription className="text-xs">Use this detail view for store-level exceptions after configuring the route rule.</SheetDescription></SheetHeader><ScrollArea className="flex-1"><div className="space-y-6 px-6 py-5">
          <DrawerSection label="Supply Relationship"><div className="grid grid-cols-2 gap-3"><FormField label="Vendor *"><Select value={formData.vendor || "unassigned"} onValueChange={(value) => setFormData((current) => ({ ...current, vendor: value === "unassigned" ? "" : value }))}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select vendor</SelectItem>{VENDORS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField><FormField label="Merchandise Area *"><Select value={formData.merchArea || "unassigned"} onValueChange={(value) => setFormData((current) => ({ ...current, merchArea: value === "unassigned" ? "" : value }))}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select area</SelectItem>{MERCH_AREAS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField></div><FormField label="Order Type *"><div className="grid grid-cols-2 gap-2">{(["DSD", "Warehouse BULK"] as OrderType[]).map((value) => <button key={value} type="button" onClick={() => handleOrderTypeChange(value)} className={cn("rounded-md border px-3 py-2 text-xs font-semibold", formData.orderType === value ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{value}</button>)}</div></FormField></DrawerSection>
          <DrawerSection label="Store"><FormField label="Store No. *"><Select value={formData.storeNumber || "unassigned"} onValueChange={(value) => handleStoreChange(value === "unassigned" ? "" : value)}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select store" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select store</SelectItem>{storeOptions.map((store) => <SelectItem key={store.storeNumber} value={store.storeNumber}>{store.storeNumber} – {store.storeName}</SelectItem>)}</SelectContent></Select></FormField><div className="grid grid-cols-2 gap-3"><FormField label="Store Name"><Input value={formData.storeName} readOnly className="h-8 bg-muted/30 text-xs" /></FormField><FormField label="Property"><Input value={formData.property} readOnly className="h-8 bg-muted/30 text-xs" /></FormField></div><div className="grid grid-cols-2 gap-3"><FormField label="Format"><Input value={formData.format} readOnly className="h-8 bg-muted/30 text-xs" /></FormField><FormField label="State"><Input value={formData.state} readOnly className="h-8 bg-muted/30 text-xs" /></FormField></div></DrawerSection>
          <DrawerSection label="Warehouse / Plant">{formData.orderType === "DSD" ? <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900 dark:bg-blue-950/20"><Truck className="mt-0.5 h-3.5 w-3.5 text-blue-500" /><div><p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Direct to Store</p><p className="mt-0.5 text-[10px] text-blue-600 dark:text-blue-400">Warehouse is not applicable for DSD assignments.</p></div></div> : <div className="grid grid-cols-2 gap-3"><FormField label="Warehouse No. *"><Input value={formData.warehouseNumber} readOnly className="h-8 bg-muted/30 font-mono text-xs" /></FormField><FormField label="Warehouse Name *"><Select value={formData.warehouse || "unassigned"} onValueChange={(value) => handleWarehouseChange(value === "unassigned" ? "" : value)}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Select warehouse</SelectItem>{WAREHOUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></FormField></div>}</DrawerSection>
          <DrawerSection label="Ordering Schedule"><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{ORDER_DAYS.map((day) => <button key={day} type="button" onClick={() => handleFormDay(day)} className={cn("rounded-md border px-1 py-2 text-[10px] font-semibold", formData.orderDays.includes(day) ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{DAY_SHORT[day]}</button>)}</div><p className="flex items-start gap-1.5 text-[10px] text-slate-500"><CalendarDays className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-700" />Order day is editable here for store-level exceptions.</p></DrawerSection>
          <DrawerSection label="Route Details"><div className="grid grid-cols-2 gap-3"><FormField label="Lead Time (Weeks) *"><Input type="number" min={1} value={formData.leadTimeWeeks || ""} onChange={(event) => setFormData((current) => ({ ...current, leadTimeWeeks: parseInt(event.target.value, 10) || 0 }))} className="h-8 text-xs tabular-nums" /></FormField><FormField label="Transportation"><Select value={formData.transportMode} onValueChange={(value) => setFormData((current) => ({ ...current, transportMode: value as TransportMode }))}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Company Fleet">Company Fleet</SelectItem><SelectItem value="LTL">LTL</SelectItem></SelectContent></Select></FormField></div><div className="grid grid-cols-2 gap-3"><FormField label="Temperature Controlled"><Select value={formData.tempControlled} onValueChange={(value) => setFormData((current) => ({ ...current, tempControlled: value as TempControlled }))}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent></Select></FormField><FormField label="Route Status"><Select value={formData.routeStatus} onValueChange={(value) => setFormData((current) => ({ ...current, routeStatus: value as RouteStatus }))}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></FormField></div></DrawerSection>
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300"><Package className="h-3 w-3" />Exception Preview</p><p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formData.vendor || "Vendor"} · {formData.merchArea || "Merchandise Area"} · {formData.orderType}</p><p className="mt-1 text-[10px] text-slate-500">{formData.orderDays.length ? formData.orderDays.map((day) => DAY_SHORT[day]).join(" + ") : "No delivery calendar"} · {formData.leadTimeWeeks || "—"} week lead time</p></div>
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40"><Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" /><p className="text-[10px] text-slate-600 dark:text-slate-400">This frontend prototype represents route rules and assignments only. It does not calculate replenishment or generate orders.</p></div>
        </div></ScrollArea><div className="flex justify-end gap-2 border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50"><Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)} className="h-8 text-xs">Cancel</Button><Button size="sm" onClick={handleSaveAssignment} className="h-8 bg-blue-900 px-5 text-xs text-white hover:bg-blue-950"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Save Changes</Button></div></SheetContent></Sheet>
      </div>
    </MainLayout>
  );
}