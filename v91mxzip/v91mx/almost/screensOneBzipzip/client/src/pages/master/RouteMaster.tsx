import { useState, useMemo } from "react";
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Route,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  PowerOff,
  History,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Warehouse,
  MapPin,
  Clock,
  CheckCircle2,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Thermometer,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type StoreStatus = "Open" | "Closed";
type RouteStatus = "Active" | "Inactive";
type RoutePriority = "Primary" | "Secondary";
type TransportMode = "Company Fleet" | "LTL";
type TempControlled = "Yes" | "No";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DeliveryDay = typeof ALL_DAYS[number];

interface RouteRecord {
  id: number;
  warehouseNumber: string;
  warehouse: string;
  warehouseAddress: string;
  property: string;
  storeNumber: string;
  storeName: string;
  state: string;
  city: string;
  storeStatus: StoreStatus;
  category: string;
  merchArea: string;
  leadTimeDays: number;
  transportMode: TransportMode;
  tempControlled: TempControlled;
  deliveryDays: DeliveryDay[];
  routeStatus: RouteStatus;
  routePriority: RoutePriority;
  demandUnits: number;
  demandValue: number;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

// ─────────────────────────────────────────────
// Reference data
// ─────────────────────────────────────────────

const WAREHOUSE_META: Record<string, { number: string; address: string }> = {
  "RDC – Las Vegas": { number: "950", address: "3200 E Sahara Ave, Las Vegas, NV 89104" },
  "RDC – Orlando":   { number: "992", address: "8100 Presidents Dr, Orlando, FL 32809" },
  "RDC – Dallas":    { number: "875", address: "2601 S State Hwy 121, Lewisville, TX 75067" },
  "RDC – Chicago":   { number: "831", address: "1400 S Wolf Rd, Hillside, IL 60162" },
};

const PROPERTIES = [
  "Las Vegas Strip", "Orlando Resort", "Dallas Airport", "Chicago Downtown",
  "Miami Beach", "Tampa Bay", "Houston Galleria", "Austin Domain",
  "Indianapolis Center", "Milwaukee Lakefront",
];

const CATEGORIES = ["Apparel", "Books", "Food", "Gifts", "Travel Essentials"];

const MERCH_AREAS = [
  "Womens Knitwear", "Mens Casual", "Stationery", "Confectionery", "Souvenirs",
  "Footwear", "Accessories", "Travel Snacks", "Reading", "Home & Living",
];

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const MOCK_ROUTES: RouteRecord[] = [
  // RDC – Las Vegas (950)
  { id: 1,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S101", storeName: "Las Vegas Strip",          state: "NV", city: "Las Vegas",       storeStatus: "Open",   category: "Gifts",             merchArea: "Souvenirs",       leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Wed","Fri"], routeStatus: "Active",   routePriority: "Primary",   demandUnits: 540,  demandValue: 8250,  createdBy: "jsmith",  createdDate: "2024-01-15", modifiedBy: "jsmith",  modifiedDate: "2025-03-10" },
  { id: 2,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S102", storeName: "Henderson Galleria",       state: "NV", city: "Henderson",       storeStatus: "Open",   category: "Apparel",           merchArea: "Womens Knitwear", leadTimeDays: 2, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Tue","Thu"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 980,  demandValue: 17500, createdBy: "jsmith",  createdDate: "2024-01-15", modifiedBy: "alopez",  modifiedDate: "2025-05-01" },
  { id: 3,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S103", storeName: "North Las Vegas Center",   state: "NV", city: "North Las Vegas", storeStatus: "Open",   category: "Books",             merchArea: "Reading",         leadTimeDays: 2, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Mon","Thu"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 320,  demandValue: 4800,  createdBy: "jsmith",  createdDate: "2024-01-15", modifiedBy: "jsmith",  modifiedDate: "2025-01-20" },
  { id: 4,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S104", storeName: "Boulder City Outlet",     state: "NV", city: "Boulder City",    storeStatus: "Closed",  category: "Apparel",           merchArea: "Mens Casual",     leadTimeDays: 3, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Wed"],            routeStatus: "Inactive", routePriority: "Secondary", demandUnits: 120,  demandValue: 2140,  createdBy: "jsmith",  createdDate: "2024-02-10", modifiedBy: "mwilson", modifiedDate: "2025-06-15" },
  { id: 5,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S105", storeName: "Summerlin Town Centre",   state: "NV", city: "Las Vegas",       storeStatus: "Open",   category: "Food",              merchArea: "Confectionery",   leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "Yes", deliveryDays: ["Mon","Tue","Wed","Thu","Fri"], routeStatus: "Active",   routePriority: "Primary",   demandUnits: 860,  demandValue: 12400, createdBy: "alopez",  createdDate: "2024-03-01", modifiedBy: "alopez",  modifiedDate: "2025-07-02" },
  { id: 6,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S106", storeName: "Mesquite Crossing",       state: "NV", city: "Mesquite",        storeStatus: "Open",   category: "Travel Essentials", merchArea: "Travel Snacks",   leadTimeDays: 4, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Fri"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 410,  demandValue: 6300,  createdBy: "jsmith",  createdDate: "2024-01-15", modifiedBy: "jsmith",  modifiedDate: "2024-11-30" },
  { id: 7,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S107", storeName: "Reno Meadowood",          state: "NV", city: "Reno",            storeStatus: "Open",   category: "Apparel",           merchArea: "Footwear",        leadTimeDays: 5, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Mon","Thu"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 290,  demandValue: 5100,  createdBy: "mwilson", createdDate: "2024-04-20", modifiedBy: "mwilson", modifiedDate: "2025-02-14" },
  { id: 8,  warehouseNumber: "950", warehouse: "RDC – Las Vegas", warehouseAddress: "3200 E Sahara Ave, Las Vegas, NV 89104", property: "Las Vegas Strip",    storeNumber: "S108", storeName: "Carson City Hub",         state: "NV", city: "Carson City",     storeStatus: "Closed",  category: "Gifts",             merchArea: "Souvenirs",       leadTimeDays: 5, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Wed"],            routeStatus: "Inactive", routePriority: "Secondary", demandUnits: 95,   demandValue: 1420,  createdBy: "jsmith",  createdDate: "2024-01-15", modifiedBy: "jsmith",  modifiedDate: "2025-04-01" },

  // RDC – Orlando (992)
  { id: 9,  warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Orlando Resort",    storeNumber: "S201", storeName: "Orlando International",   state: "FL", city: "Orlando",         storeStatus: "Open",   category: "Travel Essentials", merchArea: "Travel Snacks",   leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "Yes", deliveryDays: ["Mon","Tue","Wed","Thu","Fri","Sat"], routeStatus: "Active",   routePriority: "Primary",   demandUnits: 1240, demandValue: 21800, createdBy: "tchen",   createdDate: "2024-01-20", modifiedBy: "tchen",   modifiedDate: "2025-07-01" },
  { id: 10, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Orlando Resort",    storeNumber: "S202", storeName: "Disney Springs",          state: "FL", city: "Lake Buena Vista", storeStatus: "Open",  category: "Gifts",             merchArea: "Souvenirs",       leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Wed","Fri","Sat"],           routeStatus: "Active",   routePriority: "Primary",   demandUnits: 980,  demandValue: 17500, createdBy: "tchen",   createdDate: "2024-01-20", modifiedBy: "alopez",  modifiedDate: "2025-06-20" },
  { id: 11, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Miami Beach",       storeNumber: "S203", storeName: "Tampa Bay Plaza",         state: "FL", city: "Tampa",           storeStatus: "Open",   category: "Apparel",           merchArea: "Womens Knitwear", leadTimeDays: 3, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Mon","Thu"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 540,  demandValue: 9200,  createdBy: "tchen",   createdDate: "2024-01-20", modifiedBy: "tchen",   modifiedDate: "2025-01-10" },
  { id: 12, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Miami Beach",       storeNumber: "S204", storeName: "Miami Design District",  state: "FL", city: "Miami",           storeStatus: "Open",   category: "Apparel",           merchArea: "Accessories",     leadTimeDays: 4, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Fri"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 360,  demandValue: 6800,  createdBy: "tchen",   createdDate: "2024-02-05", modifiedBy: "mwilson", modifiedDate: "2025-05-22" },
  { id: 13, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Orlando Resort",    storeNumber: "S205", storeName: "Jacksonville Landing",   state: "FL", city: "Jacksonville",    storeStatus: "Open",   category: "Books",             merchArea: "Stationery",      leadTimeDays: 3, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Tue","Thu"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 280,  demandValue: 4200,  createdBy: "tchen",   createdDate: "2024-02-05", modifiedBy: "tchen",   modifiedDate: "2024-12-01" },
  { id: 14, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Miami Beach",       storeNumber: "S206", storeName: "Fort Lauderdale Beach",  state: "FL", city: "Fort Lauderdale", storeStatus: "Closed",  category: "Travel Essentials", merchArea: "Travel Snacks",   leadTimeDays: 4, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Mon"],            routeStatus: "Inactive", routePriority: "Secondary", demandUnits: 120,  demandValue: 2100,  createdBy: "tchen",   createdDate: "2024-03-10", modifiedBy: "tchen",   modifiedDate: "2025-03-15" },
  { id: 15, warehouseNumber: "992", warehouse: "RDC – Orlando",   warehouseAddress: "8100 Presidents Dr, Orlando, FL 32809",  property: "Orlando Resort",    storeNumber: "S207", storeName: "Sarasota Quay",          state: "FL", city: "Sarasota",        storeStatus: "Open",   category: "Food",              merchArea: "Confectionery",   leadTimeDays: 3, transportMode: "Company Fleet", tempControlled: "Yes", deliveryDays: ["Mon","Wed","Fri"],             routeStatus: "Active",   routePriority: "Primary",   demandUnits: 720,  demandValue: 10800, createdBy: "alopez",  createdDate: "2024-04-01", modifiedBy: "alopez",  modifiedDate: "2025-07-10" },

  // RDC – Dallas (875)
  { id: 16, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S301", storeName: "Dallas Galleria",         state: "TX", city: "Dallas",          storeStatus: "Open",   category: "Apparel",           merchArea: "Mens Casual",     leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Tue","Wed","Thu","Fri"],     routeStatus: "Active",   routePriority: "Primary",   demandUnits: 1100, demandValue: 19800, createdBy: "rbrown",  createdDate: "2024-01-10", modifiedBy: "rbrown",  modifiedDate: "2025-06-30" },
  { id: 17, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S302", storeName: "Fort Worth Sundance",     state: "TX", city: "Fort Worth",      storeStatus: "Open",   category: "Books",             merchArea: "Stationery",      leadTimeDays: 2, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Wed","Fri"],             routeStatus: "Active",   routePriority: "Primary",   demandUnits: 480,  demandValue: 7200,  createdBy: "rbrown",  createdDate: "2024-01-10", modifiedBy: "mwilson", modifiedDate: "2025-04-18" },
  { id: 18, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S303", storeName: "Austin Domain",           state: "TX", city: "Austin",          storeStatus: "Open",   category: "Gifts",             merchArea: "Home & Living",   leadTimeDays: 4, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Thu"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 390,  demandValue: 6500,  createdBy: "rbrown",  createdDate: "2024-01-10", modifiedBy: "rbrown",  modifiedDate: "2025-02-28" },
  { id: 19, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S304", storeName: "San Antonio Rivercenter", state: "TX", city: "San Antonio",     storeStatus: "Open",   category: "Food",              merchArea: "Confectionery",   leadTimeDays: 5, transportMode: "Company Fleet", tempControlled: "Yes", deliveryDays: ["Mon","Thu"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 650,  demandValue: 9700,  createdBy: "rbrown",  createdDate: "2024-01-10", modifiedBy: "rbrown",  modifiedDate: "2024-10-05" },
  { id: 20, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S305", storeName: "Houston Westheimer",      state: "TX", city: "Houston",         storeStatus: "Open",   category: "Apparel",           merchArea: "Footwear",        leadTimeDays: 5, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Fri"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 820,  demandValue: 14600, createdBy: "alopez",  createdDate: "2024-02-14", modifiedBy: "alopez",  modifiedDate: "2025-07-05" },
  { id: 21, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S306", storeName: "Plano Legacy West",       state: "TX", city: "Plano",           storeStatus: "Open",   category: "Travel Essentials", merchArea: "Travel Snacks",   leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Wed","Fri"],             routeStatus: "Active",   routePriority: "Secondary", demandUnits: 310,  demandValue: 4900,  createdBy: "rbrown",  createdDate: "2024-01-10", modifiedBy: "rbrown",  modifiedDate: "2025-05-12" },
  { id: 22, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S307", storeName: "Lubbock South Plains",    state: "TX", city: "Lubbock",         storeStatus: "Closed",  category: "Books",             merchArea: "Reading",         leadTimeDays: 7, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Thu"],            routeStatus: "Inactive", routePriority: "Secondary", demandUnits: 80,   demandValue: 1100,  createdBy: "rbrown",  createdDate: "2024-03-01", modifiedBy: "mwilson", modifiedDate: "2025-01-08" },
  { id: 23, warehouseNumber: "875", warehouse: "RDC – Dallas",    warehouseAddress: "2601 S State Hwy 121, Lewisville, TX 75067", property: "Dallas Airport",  storeNumber: "S308", storeName: "El Paso Cielo Vista",     state: "TX", city: "El Paso",         storeStatus: "Open",   category: "Gifts",             merchArea: "Souvenirs",       leadTimeDays: 8, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Mon","Fri"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 220,  demandValue: 3400,  createdBy: "rbrown",  createdDate: "2024-04-05", modifiedBy: "rbrown",  modifiedDate: "2025-03-20" },

  // RDC – Chicago (831)
  { id: 24, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S401", storeName: "Chicago Magnificent Mile", state: "IL", city: "Chicago",         storeStatus: "Open",   category: "Apparel",           merchArea: "Womens Knitwear", leadTimeDays: 1, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Tue","Wed","Thu","Fri"],     routeStatus: "Active",   routePriority: "Primary",   demandUnits: 1380, demandValue: 24500, createdBy: "kpatel",  createdDate: "2024-01-08", modifiedBy: "kpatel",  modifiedDate: "2025-07-08" },
  { id: 25, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S402", storeName: "Oakbrook Center",         state: "IL", city: "Oak Brook",       storeStatus: "Open",   category: "Gifts",             merchArea: "Home & Living",   leadTimeDays: 2, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Wed","Fri"],             routeStatus: "Active",   routePriority: "Primary",   demandUnits: 590,  demandValue: 10200, createdBy: "kpatel",  createdDate: "2024-01-08", modifiedBy: "kpatel",  modifiedDate: "2025-06-14" },
  { id: 26, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S403", storeName: "Woodfield Mall",          state: "IL", city: "Schaumburg",      storeStatus: "Open",   category: "Books",             merchArea: "Stationery",      leadTimeDays: 2, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Thu"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 430,  demandValue: 6400,  createdBy: "kpatel",  createdDate: "2024-01-08", modifiedBy: "mwilson", modifiedDate: "2025-04-30" },
  { id: 27, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S404", storeName: "Indianapolis Circle",     state: "IN", city: "Indianapolis",    storeStatus: "Open",   category: "Apparel",           merchArea: "Mens Casual",     leadTimeDays: 4, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Thu"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 710,  demandValue: 12800, createdBy: "kpatel",  createdDate: "2024-02-20", modifiedBy: "kpatel",  modifiedDate: "2025-02-10" },
  { id: 28, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S405", storeName: "Milwaukee Bayshore",      state: "WI", city: "Milwaukee",       storeStatus: "Open",   category: "Food",              merchArea: "Confectionery",   leadTimeDays: 3, transportMode: "LTL",           tempControlled: "Yes", deliveryDays: ["Mon","Wed","Fri"],             routeStatus: "Active",   routePriority: "Primary",   demandUnits: 890,  demandValue: 13200, createdBy: "kpatel",  createdDate: "2024-01-08", modifiedBy: "alopez",  modifiedDate: "2025-05-18" },
  { id: 29, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S406", storeName: "Mall of America",         state: "MN", city: "Bloomington",     storeStatus: "Open",   category: "Travel Essentials", merchArea: "Travel Snacks",   leadTimeDays: 5, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Fri"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 460,  demandValue: 7100,  createdBy: "kpatel",  createdDate: "2024-03-15", modifiedBy: "kpatel",  modifiedDate: "2025-06-02" },
  { id: 30, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S407", storeName: "Detroit Somerset",        state: "MI", city: "Troy",            storeStatus: "Closed",  category: "Apparel",           merchArea: "Accessories",     leadTimeDays: 4, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Wed"],            routeStatus: "Inactive", routePriority: "Primary",   demandUnits: 110,  demandValue: 1900,  createdBy: "kpatel",  createdDate: "2024-02-01", modifiedBy: "mwilson", modifiedDate: "2025-07-01" },
  { id: 31, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S408", storeName: "Columbus Easton Town",    state: "OH", city: "Columbus",        storeStatus: "Open",   category: "Gifts",             merchArea: "Souvenirs",       leadTimeDays: 5, transportMode: "LTL",           tempControlled: "No",  deliveryDays: ["Tue","Thu"],       routeStatus: "Active",   routePriority: "Secondary", demandUnits: 340,  demandValue: 5700,  createdBy: "kpatel",  createdDate: "2024-04-10", modifiedBy: "kpatel",  modifiedDate: "2025-03-25" },
  { id: 32, warehouseNumber: "831", warehouse: "RDC – Chicago",   warehouseAddress: "1400 S Wolf Rd, Hillside, IL 60162",       property: "Chicago Downtown", storeNumber: "S409", storeName: "St Louis Galleria",       state: "MO", city: "Richmond Heights", storeStatus: "Open",  category: "Books",             merchArea: "Reading",         leadTimeDays: 6, transportMode: "Company Fleet", tempControlled: "No",  deliveryDays: ["Mon","Fri"],       routeStatus: "Active",   routePriority: "Primary",   demandUnits: 510,  demandValue: 8100,  createdBy: "alopez",  createdDate: "2024-05-01", modifiedBy: "alopez",  modifiedDate: "2025-07-10" },
];

// ─────────────────────────────────────────────
// Filter option lists
// ─────────────────────────────────────────────

const WAREHOUSES  = ["All Warehouses", "RDC – Las Vegas", "RDC – Orlando", "RDC – Dallas", "RDC – Chicago"];
const STATES      = ["All States", "NV", "FL", "TX", "IL", "IN", "WI", "MN", "MI", "OH", "MO"];
const STORE_STATUSES   = ["All Statuses", "Open", "Closed"];
const ROUTE_STATUSES   = ["All", "Active", "Inactive"];
const LEAD_TIMES  = ["All Lead Times", "1-2 days", "3-4 days", "5-7 days", "8+ days"];
const PROPERTIES_FILTER = ["All Properties", ...PROPERTIES.filter((p, i, a) => a.indexOf(p) === i)];

// ─────────────────────────────────────────────
// Form defaults
// ─────────────────────────────────────────────

const EMPTY_FORM = {
  warehouseNumber: "",
  warehouse: "",
  warehouseAddress: "",
  property: "",
  storeNumber: "",
  storeName: "",
  state: "",
  city: "",
  storeStatus: "Open" as StoreStatus,
  category: "",
  merchArea: "",
  leadTimeDays: 0,
  transportMode: "Company Fleet" as TransportMode,
  tempControlled: "No" as TempControlled,
  deliveryDays: [] as DeliveryDay[],
  routeStatus: "Active" as RouteStatus,
  routePriority: "Primary" as RoutePriority,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function daysToWeeks(days: number): string {
  if (!days || days <= 0) return "—";
  const w = Math.floor(days / 7);
  const d = days % 7;
  if (w === 0) return "<1 wk";
  if (d === 0) return `${w} wk${w > 1 ? "s" : ""}`;
  return `${w}w ${d}d`;
}

function formatDeliveryDays(days: DeliveryDay[]): string {
  if (!days || days.length === 0) return "—";
  if (days.length === 7) return "Daily";
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(" / ");
}

type SortKey = "storeNumber" | "storeName" | "state" | "city" | "storeStatus" | "leadTimeDays" | "category" | "merchArea";
type SortDir = "asc" | "desc";

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

interface RouteMasterProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function RouteMaster({
  pageTitle = "Route Master",
  pageSubtitle = "Maintain Warehouse to Store routing and lead times used throughout the MerchX planning engine.",
}: RouteMasterProps = {}) {
  const [routes, setRoutes] = useState<RouteRecord[]>(MOCK_ROUTES);

  // Filters
  const [globalSearch,     setGlobalSearch]     = useState("");
  const [filterWarehouse,  setFilterWarehouse]  = useState("all");
  const [filterState,      setFilterState]      = useState("all");
  const [filterStoreStatus,setFilterStoreStatus]= useState("all");
  const [filterRouteStatus,setFilterRouteStatus]= useState("all");
  const [filterLeadTime,   setFilterLeadTime]   = useState("all");
  const [filterProperty,   setFilterProperty]   = useState("all");
  const [filterCategory,   setFilterCategory]   = useState("all");
  const [filterMerchArea,  setFilterMerchArea]  = useState("all");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Edit / Add drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRecord | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // Details panel
  const [detailRoute, setDetailRoute] = useState<RouteRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Validation panel
  const [validationOpen, setValidationOpen] = useState(true);
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  // ── Sorting ──
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  // ── Filtering + sorting ──
  const filteredRoutes = useMemo(() => {
    const q = globalSearch.toLowerCase();
    let result = routes.filter((r) => {
      if (highlightFilter === "duplicate") {
        const key = `${r.warehouse}|${r.storeNumber}`;
        if (routes.filter((x) => `${x.warehouse}|${x.storeNumber}` === key).length < 2) return false;
      }
      if (highlightFilter === "missing-lt"  && r.leadTimeDays > 0)           return false;
      if (highlightFilter === "inactive"    && r.routeStatus !== "Inactive")  return false;
      if (highlightFilter === "recent"      && r.modifiedDate < "2025-07-01") return false;

      if (q && ![r.warehouse, r.warehouseAddress, r.storeNumber, r.storeName].some((f) => f.toLowerCase().includes(q))) return false;

      if (filterWarehouse   !== "all" && r.warehouse   !== filterWarehouse)   return false;
      if (filterState       !== "all" && r.state       !== filterState)        return false;
      if (filterStoreStatus !== "all" && r.storeStatus !== filterStoreStatus)  return false;
      if (filterRouteStatus !== "all" && r.routeStatus !== filterRouteStatus)  return false;
      if (filterProperty    !== "all" && r.property    !== filterProperty)     return false;
      if (filterCategory    !== "all" && r.category    !== filterCategory)     return false;
      if (filterMerchArea   !== "all" && r.merchArea   !== filterMerchArea)    return false;

      if (filterLeadTime !== "all") {
        if (filterLeadTime === "1-2 days" && (r.leadTimeDays < 1 || r.leadTimeDays > 2)) return false;
        if (filterLeadTime === "3-4 days" && (r.leadTimeDays < 3 || r.leadTimeDays > 4)) return false;
        if (filterLeadTime === "5-7 days" && (r.leadTimeDays < 5 || r.leadTimeDays > 7)) return false;
        if (filterLeadTime === "8+ days"  && r.leadTimeDays < 8)                          return false;
      }
      return true;
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let av: string | number = a[sortKey];
        let bv: string | number = b[sortKey];
        if (sortKey === "leadTimeDays") {
          av = a.leadTimeDays; bv = b.leadTimeDays;
        }
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [routes, globalSearch, filterWarehouse, filterState, filterStoreStatus, filterRouteStatus,
      filterLeadTime, filterProperty, filterCategory, filterMerchArea, highlightFilter, sortKey, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE));
  const pagedRoutes = filteredRoutes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const uniqueWh  = new Set(routes.map((r) => r.warehouse)).size;
    const uniqueSt  = new Set(routes.map((r) => r.storeNumber)).size;
    const avgLT     = routes.reduce((s, r) => s + r.leadTimeDays, 0) / routes.length;
    return { total: routes.length, warehouses: uniqueWh, stores: uniqueSt, avgLT };
  }, [routes]);

  // ── Validation counts ──
  const validationItems = useMemo(() => {
    const seen = new Set<string>();
    const dupeKeys = new Set<string>();
    routes.forEach((r) => {
      const k = `${r.warehouse}|${r.storeNumber}`;
      if (seen.has(k)) dupeKeys.add(k);
      seen.add(k);
    });
    const dupeCount  = Array.from(dupeKeys).reduce((n, k) => n + routes.filter((r) => `${r.warehouse}|${r.storeNumber}` === k).length, 0);
    const missingLT  = routes.filter((r) => r.leadTimeDays <= 0).length;
    const inactive   = routes.filter((r) => r.routeStatus === "Inactive").length;
    const recent     = routes.filter((r) => r.modifiedDate >= "2025-07-01").length;
    return { dupeCount, missingLT, inactive, recent };
  }, [routes]);

  // ── Open add/edit ──
  function openAdd() {
    setEditingRoute(null);
    setFormData({ ...EMPTY_FORM });
    setIsDrawerOpen(true);
  }

  function openEdit(r: RouteRecord) {
    setEditingRoute(r);
    setFormData({
      warehouseNumber: r.warehouseNumber,
      warehouse:       r.warehouse,
      warehouseAddress:r.warehouseAddress,
      property:        r.property,
      storeNumber:     r.storeNumber,
      storeName:       r.storeName,
      state:           r.state,
      city:            r.city,
      storeStatus:     r.storeStatus,
      category:        r.category,
      merchArea:       r.merchArea,
      leadTimeDays:    r.leadTimeDays,
      transportMode:   r.transportMode,
      tempControlled:  r.tempControlled,
      deliveryDays:    [...r.deliveryDays],
      routeStatus:     r.routeStatus,
      routePriority:   r.routePriority,
    });
    setIsDrawerOpen(true);
  }

  function handleSave() {
    const now = "2026-08-06";
    if (editingRoute) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === editingRoute.id
            ? { ...r, ...formData, demandUnits: r.demandUnits, demandValue: r.demandValue, modifiedBy: "current.user", modifiedDate: now, id: r.id, createdBy: r.createdBy, createdDate: r.createdDate }
            : r
        )
      );
      showToast("Route updated successfully.");
    } else {
      const newId = Math.max(...routes.map((r) => r.id)) + 1;
      setRoutes((prev) => [
        ...prev,
        { id: newId, ...formData, demandUnits: 0, demandValue: 0, createdBy: "current.user", createdDate: now, modifiedBy: "current.user", modifiedDate: now },
      ]);
      showToast("Route added successfully.");
    }
    setIsDrawerOpen(false);
  }

  function handleDuplicate(r: RouteRecord) {
    const newId = Math.max(...routes.map((x) => x.id)) + 1;
    setRoutes((prev) => [
      ...prev,
      { ...r, id: newId, storeNumber: r.storeNumber + "-COPY", storeName: r.storeName + " (Copy)", createdBy: "current.user", createdDate: "2026-08-06", modifiedBy: "current.user", modifiedDate: "2026-08-06" },
    ]);
    showToast(`Route duplicated: ${r.storeNumber}-COPY`);
  }

  function handleDeactivate(r: RouteRecord) {
    setRoutes((prev) =>
      prev.map((x) => x.id === r.id ? { ...x, routeStatus: "Inactive", modifiedBy: "current.user", modifiedDate: "2026-08-06" } : x)
    );
    showToast(`Route ${r.storeNumber} deactivated.`);
  }

  function resetFilters() {
    setGlobalSearch(""); setFilterWarehouse("all"); setFilterState("all");
    setFilterStoreStatus("all"); setFilterRouteStatus("all"); setFilterLeadTime("all");
    setFilterProperty("all"); setFilterCategory("all"); setFilterMerchArea("all");
    setHighlightFilter(null); setCurrentPage(1);
  }

  function toggleDeliveryDay(day: DeliveryDay) {
    setFormData((f) => {
      const has = f.deliveryDays.includes(day);
      return { ...f, deliveryDays: has ? f.deliveryDays.filter((d) => d !== day) : [...f.deliveryDays, day] };
    });
  }

  // ── Sort header ──
  const SortTH = ({ col, label, className = "" }: { col: SortKey; label: string; className?: string }) => (
    <th
      onClick={() => handleSort(col)}
      className={cn(
        "px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800",
        "bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400",
        "cursor-pointer select-none whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === col ? (
          sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </div>
    </th>
  );

  const TH = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <th className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 whitespace-nowrap text-left", className)}>
      {children}
    </th>
  );

  // ─────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-600 flex-shrink-0">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{pageTitle}</h1>
              <p className="text-xs text-slate-500">{pageSubtitle}</p>
            </div>
          </div>
          <Button onClick={openAdd} className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm active:scale-[0.98]">
            <Plus className="h-4 w-4" />Add Route
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Route className="h-3.5 w-3.5 text-indigo-500" />,   label: "Total Routes",        value: kpis.total,            sub: "Warehouse-to-store mappings" },
            { icon: <Warehouse className="h-3.5 w-3.5 text-blue-500" />, label: "Active Warehouses",   value: kpis.warehouses,       sub: "Regional distribution centres" },
            { icon: <MapPin className="h-3.5 w-3.5 text-emerald-500" />, label: "Active Stores",       value: kpis.stores,           sub: "Unique store locations" },
            { icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,    label: "Avg Lead Time",       value: kpis.avgLT.toFixed(1) + "d", sub: "Across all routes" },
          ].map((k) => (
            <div key={k.label} className="bg-card border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">{k.icon}<span className="text-xs text-muted-foreground font-medium">{k.label}</span></div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{k.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Search Row ── */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search warehouse, store, address…"
            value={globalSearch}
            onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
            className="h-9 pl-8 text-xs"
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── Filter Bar ── */}
        <div>
          <CompactFilterBar
            className="w-full"
            onClear={resetFilters}
            maxVisibleFilters={8}
            fields={[
              { id: "warehouse",   label: "Warehouse",     value: filterWarehouse,   onChange: (v) => { setFilterWarehouse(v);   setCurrentPage(1); }, options: WAREHOUSES.map((w) => ({ value: w === "All Warehouses" ? "all" : w, label: w })) },
              { id: "property",    label: "Property",      value: filterProperty,    onChange: (v) => { setFilterProperty(v);    setCurrentPage(1); }, options: PROPERTIES_FILTER.map((p) => ({ value: p === "All Properties" ? "all" : p, label: p })) },
              { id: "state",       label: "State",         value: filterState,       onChange: (v) => { setFilterState(v);       setCurrentPage(1); }, options: STATES.map((s) => ({ value: s === "All States" ? "all" : s, label: s })) },
              { id: "storestatus", label: "Store Status",  value: filterStoreStatus, onChange: (v) => { setFilterStoreStatus(v); setCurrentPage(1); }, options: STORE_STATUSES.map((s) => ({ value: s === "All Statuses" ? "all" : s, label: s })) },
              { id: "routestatus", label: "Route Status",  value: filterRouteStatus, onChange: (v) => { setFilterRouteStatus(v); setCurrentPage(1); }, options: ROUTE_STATUSES.map((s) => ({ value: s === "All" ? "all" : s, label: s })) },
              { id: "category",    label: "Category",      value: filterCategory,    onChange: (v) => { setFilterCategory(v);    setCurrentPage(1); }, options: [{ value: "all", label: "All Categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))] },
              { id: "merch",       label: "Merch Area",    value: filterMerchArea,   onChange: (v) => { setFilterMerchArea(v);   setCurrentPage(1); }, options: [{ value: "all", label: "All Areas" }, ...MERCH_AREAS.map((m) => ({ value: m, label: m }))] },
              { id: "leadtime",    label: "Lead Time",     value: filterLeadTime,    onChange: (v) => { setFilterLeadTime(v);    setCurrentPage(1); }, options: LEAD_TIMES.map((l) => ({ value: l === "All Lead Times" ? "all" : l, label: l })) },
            ]}
          />
        </div>

        {/* ── Validation Strip ── */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-0 divide-x divide-slate-100 dark:divide-slate-800">
            <button
              onClick={() => setValidationOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/70 transition-colors flex-shrink-0"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">Validation</span>
              {validationOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />}
            </button>

            {validationOpen && (
              <>
                <ValidationItem label="Duplicate Routes"  count={validationItems.dupeCount} active={highlightFilter === "duplicate"}  color="rose"  onClick={() => { setHighlightFilter(highlightFilter === "duplicate"  ? null : "duplicate");  setCurrentPage(1); }} />
                <ValidationItem label="Missing Lead Times" count={validationItems.missingLT} active={highlightFilter === "missing-lt"} color="rose"  onClick={() => { setHighlightFilter(highlightFilter === "missing-lt" ? null : "missing-lt"); setCurrentPage(1); }} />
                <ValidationItem label="Inactive Routes"   count={validationItems.inactive}  active={highlightFilter === "inactive"}   color="amber" onClick={() => { setHighlightFilter(highlightFilter === "inactive"   ? null : "inactive");   setCurrentPage(1); }} />
                <ValidationItem label="Recently Modified" count={validationItems.recent}    active={highlightFilter === "recent"}     color="blue"  onClick={() => { setHighlightFilter(highlightFilter === "recent"     ? null : "recent");     setCurrentPage(1); }} />
                {highlightFilter && (
                  <button
                    onClick={() => { setHighlightFilter(null); setCurrentPage(1); }}
                    className="flex items-center gap-1 px-4 py-2 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                  >
                    <X className="h-3 w-3" />Clear
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Main Table (full width) ── */}
        <div className="flex gap-4 items-start">

          {/* Route Master Table */}
          <Card className="glass-card overflow-hidden rounded-xl border shadow-lg flex-1 min-w-0">
            <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600">
                    <Route className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Route Master</CardTitle>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      {filteredRoutes.length} of {routes.length} routes
                      {highlightFilter && (
                        <button onClick={() => { setHighlightFilter(null); setCurrentPage(1); }} className="ml-2 text-indigo-600 hover:underline">
                          clear highlight
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1800px]">
                  <table className="w-full border-collapse text-[11px]">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        {/* Warehouse group */}
                        <TH className="w-[55px] text-center">WH No.</TH>
                        <TH className="w-[140px]">Warehouse</TH>
                        <TH className="w-[185px]">Warehouse Address</TH>
                        <TH className="w-[130px]">Property</TH>
                        {/* Store group */}
                        <SortTH col="storeNumber" label="Store No."  className="w-[80px] text-center" />
                        <SortTH col="storeName"   label="Store Name" className="w-[155px]" />
                        <SortTH col="state"       label="State"      className="w-[48px] text-center" />
                        <SortTH col="city"        label="City"       className="w-[110px]" />
                        <SortTH col="category"    label="Category"     className="w-[80px]" />
                        <SortTH col="merchArea"   label="Merch Area"   className="w-[120px]" />
                        <SortTH col="storeStatus" label="Store Status" className="w-[80px] text-center" />
                        {/* Routing group */}
                        <SortTH col="leadTimeDays" label="LT (Wks)" className="w-[72px] text-center" />
                        <TH className="w-[110px]">Transport</TH>
                        <TH className="w-[68px] text-center">Temp Ctrl</TH>
                        <TH className="w-[120px]">Delivery Days</TH>
                        <TH className="w-[72px] text-center">Route Status</TH>
                        <TH className="w-[72px] text-center">Priority</TH>
                        {/* Demand group */}
                        <TH className="w-[90px] text-right">Demand (Units)</TH>
                        <TH className="w-[90px] text-right">Demand ($)</TH>
                        {/* Actions */}
                        <TH className="w-[56px] text-center">Actions</TH>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pagedRoutes.length === 0 ? (
                        <tr>
                          <td colSpan={21} className="h-32 text-center text-sm text-slate-400">
                            No routes match the current filters.
                          </td>
                        </tr>
                      ) : (
                        pagedRoutes.map((r) => (
                          <tr
                            key={r.id}
                            className={cn(
                              "h-10 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer",
                              r.routeStatus === "Inactive" && "opacity-70"
                            )}
                            onClick={() => { setDetailRoute(r); setIsDetailOpen(true); }}
                          >
                            {/* WH No */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center font-mono text-slate-500 text-[10px]">{r.warehouseNumber}</td>
                            {/* Warehouse */}
                            <td className="px-3 py-1.5 border-r border-slate-100 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.warehouse}</td>
                            {/* Address */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-500 truncate max-w-[185px]">{r.warehouseAddress}</td>
                            {/* Property */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600 whitespace-nowrap">{r.property}</td>
                            {/* Store Number */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center font-mono text-indigo-600 font-medium">{r.storeNumber}</td>
                            {/* Store Name */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.storeName}</td>
                            {/* State */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center text-slate-600 font-medium">{r.state}</td>
                            {/* City */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600">{r.city}</td>
                            {/* Category */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600 whitespace-nowrap">{r.category}</td>
                            {/* Merch Area */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600 whitespace-nowrap">{r.merchArea}</td>
                            {/* Store Status */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                              <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                                r.storeStatus === "Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                              )}>{r.storeStatus}</Badge>
                            </td>
                            {/* Lead Time Weeks */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center tabular-nums text-slate-500">{daysToWeeks(r.leadTimeDays)}</td>
                            {/* Transport Mode */}
                            <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-slate-600">
                                <Truck className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                {r.transportMode}
                              </div>
                            </td>
                            {/* Temp Controlled */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                              <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                                r.tempControlled === "Yes" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                              )}>
                                {r.tempControlled === "Yes" ? <><Thermometer className="inline h-2.5 w-2.5 mr-0.5" />Yes</> : "No"}
                              </Badge>
                            </td>
                            {/* Delivery Days */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600 whitespace-nowrap text-[10px]">{formatDeliveryDays(r.deliveryDays)}</td>
                            {/* Route Status */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                              <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                                r.routeStatus === "Active" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              )}>{r.routeStatus}</Badge>
                            </td>
                            {/* Route Priority */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                              <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                                r.routePriority === "Primary" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-50 text-slate-500 border-slate-200"
                              )}>{r.routePriority}</Badge>
                            </td>
                            {/* Demand Units */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-right tabular-nums text-slate-700 font-medium">{r.demandUnits.toLocaleString()}</td>
                            {/* Demand $ */}
                            <td className="px-3 py-1.5 border-r border-slate-100 text-right tabular-nums text-slate-700 font-medium">${r.demandValue.toLocaleString()}</td>
                            {/* Actions */}
                            <td className="px-3 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-xs w-40">
                                  <DropdownMenuItem onClick={() => openEdit(r)}>
                                    <Pencil className="h-3.5 w-3.5 mr-2 text-slate-500" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(r)}>
                                    <Copy className="h-3.5 w-3.5 mr-2 text-slate-500" />Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivate(r)}
                                    disabled={r.routeStatus === "Inactive"}
                                    className="text-amber-600 focus:text-amber-600"
                                  >
                                    <PowerOff className="h-3.5 w-3.5 mr-2" />Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => showToast("History view — coming soon.")} className="text-slate-400">
                                    <History className="h-3.5 w-3.5 mr-2" />View History
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t bg-slate-50/30 dark:bg-slate-900/20">
                <p className="text-[11px] text-slate-500">
                  {filteredRoutes.length === 0
                    ? "No results"
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredRoutes.length)} of ${filteredRoutes.length}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-[11px] text-slate-500 px-2">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Add / Edit Route Drawer ── */}
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent side="right" className="w-full sm:w-[460px] p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Route className="h-4 w-4 text-indigo-600" />
                {editingRoute ? "Edit Route" : "Add Route"}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {editingRoute ? `Editing route for ${editingRoute.storeNumber} – ${editingRoute.storeName}` : "Create a new warehouse-to-store routing record."}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 py-5 space-y-5">

                {/* ── Warehouse section ── */}
                <DrawerSection label="Warehouse">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Warehouse No." className="col-span-1">
                      <div className="h-8 flex items-center px-3 rounded-md border bg-muted/30 text-xs font-mono text-muted-foreground">
                        {formData.warehouseNumber || "—"}
                      </div>
                    </FormField>
                    <FormField label="Warehouse *" className="col-span-2">
                      <Select
                        value={formData.warehouse}
                        onValueChange={(v) => setFormData((f) => ({
                          ...f,
                          warehouse: v,
                          warehouseNumber: WAREHOUSE_META[v]?.number ?? "",
                          warehouseAddress: WAREHOUSE_META[v]?.address ?? "",
                        }))}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(WAREHOUSE_META).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <FormField label="Warehouse Address">
                    <Input value={formData.warehouseAddress} onChange={(e) => setFormData((f) => ({ ...f, warehouseAddress: e.target.value }))} className="h-8 text-xs" placeholder="Auto-populated from warehouse" />
                  </FormField>
                </DrawerSection>

                {/* ── Store section ── */}
                <DrawerSection label="Store">
                  <FormField label="Property">
                    <Select value={formData.property} onValueChange={(v) => setFormData((f) => ({ ...f, property: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select property" /></SelectTrigger>
                      <SelectContent>{PROPERTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Store Number *">
                      <Input value={formData.storeNumber} onChange={(e) => setFormData((f) => ({ ...f, storeNumber: e.target.value }))} className="h-8 text-xs font-mono" placeholder="e.g. S101" />
                    </FormField>
                    <FormField label="Store Name">
                      <Input value={formData.storeName} onChange={(e) => setFormData((f) => ({ ...f, storeName: e.target.value }))} className="h-8 text-xs" placeholder="Store name" />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="State">
                      <Select value={formData.state} onValueChange={(v) => setFormData((f) => ({ ...f, state: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
                        <SelectContent>{["NV","FL","TX","IL","IN","WI","MN","MI","OH","MO","CA","AZ","CO","GA","NY"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="City">
                      <Input value={formData.city} onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))} className="h-8 text-xs" placeholder="City" />
                    </FormField>
                  </div>
                  <FormField label="Store Status">
                    <Select value={formData.storeStatus} onValueChange={(v) => setFormData((f) => ({ ...f, storeStatus: v as StoreStatus }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </DrawerSection>

                {/* ── Routing section ── */}
                <DrawerSection label="Routing">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Category">
                      <Select value={formData.category} onValueChange={(v) => setFormData((f) => ({ ...f, category: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Merch Area">
                      <Select value={formData.merchArea} onValueChange={(v) => setFormData((f) => ({ ...f, merchArea: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Merch area" /></SelectTrigger>
                        <SelectContent>{MERCH_AREAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Lead Time (Days) *">
                      <Input type="number" min={0} value={formData.leadTimeDays || ""} onChange={(e) => setFormData((f) => ({ ...f, leadTimeDays: parseInt(e.target.value) || 0 }))} className="h-8 text-xs tabular-nums" placeholder="0" />
                    </FormField>
                    <FormField label="Lead Time (Weeks)">
                      <div className="h-8 flex items-center px-3 rounded-md border bg-muted/30 text-xs text-muted-foreground">
                        {formData.leadTimeDays > 0 ? daysToWeeks(formData.leadTimeDays) : "—"}
                      </div>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Transport Mode">
                      <Select value={formData.transportMode} onValueChange={(v) => setFormData((f) => ({ ...f, transportMode: v as TransportMode }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Company Fleet">Company Fleet</SelectItem>
                          <SelectItem value="LTL">LTL</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Temp Controlled">
                      <Select value={formData.tempControlled} onValueChange={(v) => setFormData((f) => ({ ...f, tempControlled: v as TempControlled }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Delivery Days">
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ALL_DAYS.map((day) => {
                        const selected = formData.deliveryDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDeliveryDay(day)}
                            className={cn(
                              "h-7 px-2.5 rounded-md text-[10px] font-bold border transition-all",
                              selected
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {formData.deliveryDays.length > 0 && (
                      <p className="text-[10px] text-slate-500 mt-1">{formatDeliveryDays(formData.deliveryDays)}</p>
                    )}
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Route Status">
                      <Select value={formData.routeStatus} onValueChange={(v) => setFormData((f) => ({ ...f, routeStatus: v as RouteStatus }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Route Priority">
                      <Select value={formData.routePriority} onValueChange={(v) => setFormData((f) => ({ ...f, routePriority: v as RoutePriority }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </DrawerSection>

                {/* ── Future Hierarchy section ── */}
                <DrawerSection label="Future Hierarchy">
                  <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none select-none">
                    <FormField label={<span className="flex items-center gap-1">Vendor <span className="text-[9px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Future</span></span>}>
                      <Input disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" placeholder="Future enhancement" />
                    </FormField>
                    <FormField label={<span className="flex items-center gap-1">Style / Material <span className="text-[9px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Future</span></span>}>
                      <Input disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" placeholder="Future enhancement" />
                    </FormField>
                  </div>

                  {/* Lead Time Hierarchy visual */}
                  <div className="mt-1 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Lead Time Hierarchy</p>
                    <div className="flex flex-col items-start gap-0.5">
                      {[
                        { label: "Category",                    future: false },
                        { label: "Merchandise Area",            future: false },
                        { label: "Vendor",                      future: true  },
                        { label: "Style / Material Override",   future: true  },
                      ].map((item, i) => (
                        <div key={item.label} className="flex flex-col items-start">
                          <div className={cn(
                            "flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-medium",
                            item.future
                              ? "text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700"
                              : "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900"
                          )}>
                            {item.label}
                            {item.future && <span className="text-[9px] text-slate-400">(Future)</span>}
                          </div>
                          {i < 3 && <span className="text-slate-300 dark:text-slate-600 text-[11px] ml-3 leading-none my-0.5">↓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </DrawerSection>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
                  <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">
                    Lead Time (Weeks) is auto-calculated from Days. Changes apply to mock frontend state only.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!formData.warehouse || !formData.storeNumber || !formData.leadTimeDays}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                {editingRoute ? "Save Changes" : "Add Route"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Route Details Sheet ── */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-slate-500" />Route Details
              </SheetTitle>
              <SheetDescription className="text-xs">
                {detailRoute ? `${detailRoute.storeNumber} – ${detailRoute.storeName}` : ""}
              </SheetDescription>
            </SheetHeader>

            {detailRoute && (
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-5">
                  <DetailSection title="Warehouse Information" icon={<Warehouse className="h-3.5 w-3.5 text-indigo-500" />}>
                    <DetailRow label="Warehouse No."    value={detailRoute.warehouseNumber} mono />
                    <DetailRow label="Warehouse"        value={detailRoute.warehouse} />
                    <DetailRow label="Address"          value={detailRoute.warehouseAddress} />
                  </DetailSection>

                  <DetailSection title="Store Information" icon={<MapPin className="h-3.5 w-3.5 text-emerald-500" />}>
                    <DetailRow label="Property"         value={detailRoute.property} />
                    <DetailRow label="Store Number"     value={detailRoute.storeNumber} mono />
                    <DetailRow label="Store Name"       value={detailRoute.storeName} />
                    <DetailRow label="State"            value={detailRoute.state} />
                    <DetailRow label="City"             value={detailRoute.city} />
                    <DetailRow label="Category"         value={detailRoute.category} />
                    <DetailRow label="Merch Area"       value={detailRoute.merchArea} />
                    <DetailRow label="Store Status"     value={
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                        detailRoute.storeStatus === "Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>{detailRoute.storeStatus}</Badge>
                    } />
                  </DetailSection>

                  <DetailSection title="Routing" icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}>
                    <DetailRow label="Lead Time (Days)"  value={`${detailRoute.leadTimeDays} days`} />
                    <DetailRow label="Lead Time (Weeks)" value={daysToWeeks(detailRoute.leadTimeDays)} />
                    <DetailRow label="Transport Mode"    value={detailRoute.transportMode} />
                    <DetailRow label="Temp Controlled"   value={
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                        detailRoute.tempControlled === "Yes" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                      )}>{detailRoute.tempControlled}</Badge>
                    } />
                    <DetailRow label="Delivery Days"     value={formatDeliveryDays(detailRoute.deliveryDays)} />
                    <DetailRow label="Route Status"      value={
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                        detailRoute.routeStatus === "Active" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>{detailRoute.routeStatus}</Badge>
                    } />
                    <DetailRow label="Route Priority"    value={
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0",
                        detailRoute.routePriority === "Primary" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-50 text-slate-500 border-slate-200"
                      )}>{detailRoute.routePriority}</Badge>
                    } />
                  </DetailSection>

                  <DetailSection title="Current Week Output Demand" icon={<ArrowUpDown className="h-3.5 w-3.5 text-teal-500" />}>
                    <DetailRow label="Units"  value={detailRoute.demandUnits.toLocaleString()} />
                    <DetailRow label="Value"  value={`$${detailRoute.demandValue.toLocaleString()}`} />
                  </DetailSection>

                  <DetailSection title="Audit Information" icon={<History className="h-3.5 w-3.5 text-slate-400" />}>
                    <DetailRow label="Created By"         value={detailRoute.createdBy} mono />
                    <DetailRow label="Created Date"       value={detailRoute.createdDate} />
                    <DetailRow label="Last Modified By"   value={detailRoute.modifiedBy} mono />
                    <DetailRow label="Last Modified Date" value={detailRoute.modifiedDate} />
                  </DetailSection>
                </div>
              </ScrollArea>
            )}

            <div className="px-6 py-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setIsDetailOpen(false); if (detailRoute) openEdit(detailRoute); }}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit Route
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Toast ── */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-4 py-3 shadow-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-medium">{toastMsg}</span>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ValidationItem({ label, count, active, color, onClick }: { label: string; count: number; active: boolean; color: "rose" | "amber" | "blue"; onClick: () => void }) {
  const colorMap = { rose: "text-rose-600", amber: "text-amber-600", blue: "text-blue-600" };
  const bgMap    = { rose: "bg-rose-50 dark:bg-rose-950/30", amber: "bg-amber-50 dark:bg-amber-950/30", blue: "bg-blue-50 dark:bg-blue-950/30" };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex-shrink-0",
        active && bgMap[color]
      )}
    >
      <AlertTriangle className={cn("h-3 w-3 flex-shrink-0", colorMap[color])} />
      <span className={cn("text-[11px] font-medium whitespace-nowrap", active ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400")}>
        {label}
      </span>
      <Badge
        variant="outline"
        className={cn(
          "text-[9px] font-bold px-1.5 py-0 flex-shrink-0",
          count > 0 ? `${colorMap[color]} border-current bg-white dark:bg-transparent` : "text-slate-300 border-slate-200"
        )}
      >
        {count}
      </Badge>
    </button>
  );
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children, className = "" }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
      </div>
      <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-card">
      <span className="text-[10px] text-slate-500 flex-shrink-0 mr-4">{label}</span>
      <span className={cn("text-[11px] font-medium text-slate-800 dark:text-slate-200 text-right", mono && "font-mono")}>{value}</span>
    </div>
  );
}
