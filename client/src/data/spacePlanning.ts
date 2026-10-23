export interface MerchArea {
  id: string;
  code: string;
  name: string;
  department: string;
  category: string;
  subcategory: string;
}

export interface PlanningBlock {
  id: string;
  code: string;
  name: string;
  areaIds: string[];
  status: "Active" | "Draft" | "Review";
}

export interface StoreFormat {
  id: string;
  name: string;
  code: string;
}

export interface FormatPlanningBlock extends PlanningBlock {
  formatId: string;
}

export interface Fixture {
  code: string;
  name: string;
  type: string;
  subtype: string;
  parentTypeId?: string;
  dimensions: string;
  eft: number;
  status: "Active" | "Review";
  imageUrl?: string;
  applicableFormatIds?: string[];
}

export interface FixtureType {
  id: string;
  name: string;
  status: "Active" | "Review";
}

export interface FixtureCompatibility {
  fixtureCode: string;
  blockId: string;
  areaId: string;
  slots: number;
  status: "Active" | "Review";
}

export interface FixtureBlockAllocation {
  fixtureCode: string;
  blockId: string;
  eftShare: number;
}

export interface StoreInventory {
  id: string;
  storeId: string;
  fixtureCode: string;
  quantity: number;
  change: "Existing" | "Added" | "Removed";
  assignmentSource?: "Bulk rule" | "Store override";
  bulkRuleId?: string;
}

export interface PlanningStore {
  id: string;
  name: string;
  format: string;
  storeFormatId: string;
  channel: string;
  property: string;
  state: string;
  region: string;
  eftByBlock: Record<string, number>;
  currentGradeByBlock: Record<string, string>;
}

export interface PlanningSku {
  id: string;
  code: string;
  description: string;
  areaId: string;
  brand: string;
  widthMm: number;
  heightMm: number;
  packageType: "bottle" | "can" | "carton" | "box" | "pouch" | "blister";
  sales?: number;
  units?: number;
}

export interface PlanogramShelf {
  clearHeightMm: number;
}

export interface FixturePlanogramLayout {
  usableWidthMm: number;
  shelves: PlanogramShelf[];
}

export interface FacingAssignment {
  id: string;
  storeId: string;
  blockId: string;
  areaId: string;
  fixtureCode: string;
  skuId: string;
  facings: number;
  shelfIndex?: number;
  shelfOrder?: number;
}

type MerchAreaSeed = Pick<MerchArea, "id" | "name" | "department">;

const coreMerchAreas: MerchAreaSeed[] = [
  { id: "water", name: "Water", department: "Beverages" },
  { id: "soft-drinks", name: "Soft Drinks", department: "Beverages" },
  { id: "juice", name: "Juice", department: "Beverages" },
  { id: "energy", name: "Energy Drinks", department: "Beverages" },
  { id: "hot-drinks", name: "Hot Drinks", department: "Beverages" },
  { id: "pillow-tube", name: "Pillow Tube", department: "Travel Comfort" },
  { id: "travel-accessories", name: "Travel Accessories", department: "Travel" },
  { id: "personal-audio", name: "Personal Audio", department: "Electronics" },
  { id: "mobile-accessories", name: "Mobile Accessories", department: "Electronics" },
  { id: "chargers", name: "Chargers & Cables", department: "Electronics" },
  { id: "headphones", name: "Headphones", department: "Electronics" },
  { id: "writing", name: "Writing Instruments", department: "Stationery" },
  { id: "paper", name: "Paper & Notebooks", department: "Stationery" },
  { id: "greeting-cards", name: "Greeting Cards", department: "Stationery" },
  { id: "confectionery", name: "Confectionery", department: "Food & Drink" },
  { id: "snacks", name: "Snacks", department: "Food & Drink" },
  { id: "books", name: "Books", department: "Books & News" },
  { id: "newspapers", name: "Newspapers & Magazines", department: "Books & News" },
];

const additionalMerchAreaNames: [name: string, department: string][] = [
  ["Sports Drinks", "Beverages"],
  ["Ready-to-Drink Coffee", "Beverages"],
  ["Ready-to-Drink Tea", "Beverages"],
  ["Flavored Water", "Beverages"],
  ["Protein Drinks", "Beverages"],
  ["Neck Pillows", "Travel Comfort"],
  ["Eye Masks", "Travel Comfort"],
  ["Ear Plugs", "Travel Comfort"],
  ["Travel Blankets", "Travel Comfort"],
  ["Luggage Tags", "Travel"],
  ["Travel Organizers", "Travel"],
  ["Passport Holders", "Travel"],
  ["Travel Wallets", "Travel"],
  ["Umbrellas", "Travel"],
  ["Power Adapters", "Electronics"],
  ["Portable Chargers", "Electronics"],
  ["Phone Cases", "Electronics"],
  ["Screen Protection", "Electronics"],
  ["Bluetooth Speakers", "Electronics"],
  ["Audio Adapters", "Electronics"],
  ["Pens", "Stationery"],
  ["Pencils", "Stationery"],
  ["Journals", "Stationery"],
  ["Office Supplies", "Stationery"],
  ["Art Supplies", "Stationery"],
  ["Candy", "Food & Drink"],
  ["Chocolate", "Food & Drink"],
  ["Gum & Mints", "Food & Drink"],
  ["Protein Snacks", "Food & Drink"],
  ["Cookies & Crackers", "Food & Drink"],
  ["Chips & Savory Snacks", "Food & Drink"],
  ["Fresh Food", "Food & Drink"],
  ["Packaged Meals", "Food & Drink"],
  ["Best Sellers", "Books & News"],
  ["Fiction", "Books & News"],
  ["Nonfiction", "Books & News"],
  ["Children's Books", "Books & News"],
  ["Puzzles & Activity Books", "Books & News"],
  ["Comics & Graphic Novels", "Books & News"],
  ["Reference Books", "Books & News"],
  ["Skincare", "Health & Beauty"],
  ["Personal Care", "Health & Beauty"],
  ["Pain Relief", "Health & Beauty"],
  ["First Aid", "Health & Beauty"],
  ["Travel Health", "Health & Beauty"],
  ["Board Games", "Toys & Games"],
  ["Card Games", "Toys & Games"],
  ["Plush Toys", "Toys & Games"],
  ["Travel Games", "Toys & Games"],
  ["Collectibles", "Toys & Games"],
  ["Sunglasses", "Apparel & Accessories"],
  ["Socks", "Apparel & Accessories"],
  ["Hats", "Apparel & Accessories"],
  ["Scarves", "Apparel & Accessories"],
  ["Fashion Accessories", "Apparel & Accessories"],
  ["Gift Bags", "Gifts"],
  ["Gift Wrap", "Gifts"],
  ["Greeting Gift Sets", "Gifts"],
  ["Souvenirs", "Gifts"],
  ["Travel Gifts", "Gifts"],
  ["Granola & Breakfast Bars", "Grocery"],
  ["Nuts & Trail Mix", "Grocery"],
  ["Dried Fruit", "Grocery"],
  ["Shelf-Stable Meals", "Grocery"],
  ["Condiments", "Grocery"],
  ["Holiday Confectionery", "Seasonal"],
  ["Seasonal Gifts", "Seasonal"],
  ["Summer Essentials", "Seasonal"],
  ["Winter Essentials", "Seasonal"],
  ["Local Interest", "Regional Products"],
  ["Regional Snacks", "Regional Products"],
  ["Regional Gifts", "Regional Products"],
  ["Local Publications", "Regional Products"],
  ["Regional Beverages", "Regional Products"],
  ["Gift Cards", "Services & Convenience"],
  ["Phone Charging", "Services & Convenience"],
  ["Travel Information", "Services & Convenience"],
  ["Convenience Essentials", "Services & Convenience"],
];

const merchAreaCategoryByDepartment: Record<string, string> = {
  Beverages: "Food & Beverage",
  "Food & Drink": "Food & Beverage",
  Grocery: "Food & Beverage",
  "Travel Comfort": "Travel & Convenience",
  Travel: "Travel & Convenience",
  "Services & Convenience": "Travel & Convenience",
  Electronics: "Technology",
  Stationery: "Books, Stationery & Gifts",
  "Books & News": "Books, Stationery & Gifts",
  Gifts: "Books, Stationery & Gifts",
  "Health & Beauty": "Health & Lifestyle",
  "Toys & Games": "Health & Lifestyle",
  "Apparel & Accessories": "Health & Lifestyle",
  Seasonal: "Seasonal & Local",
  "Regional Products": "Seasonal & Local",
};

export const merchAreas: MerchArea[] = [
  ...coreMerchAreas,
  ...additionalMerchAreaNames.map(([name, department], index) => ({
    id: `area-${String(index + coreMerchAreas.length + 1).padStart(3, "0")}`,
    name,
    department,
  })),
].map((area, index) => {
  const category = merchAreaCategoryByDepartment[area.department];
  if (!category) throw new Error(`No product category configured for merchandise department "${area.department}".`);
  return {
    ...area,
    code: `MA-${String(index + 1).padStart(3, "0")}`,
    category,
    subcategory: area.department,
  };
});

export const merchAreaCategories = Array.from(new Set(merchAreas.map(area => area.category))).sort();

export const initialBlocks: PlanningBlock[] = [
  { id: "beverage", code: "BLK-001", name: "Beverage Block", areaIds: ["water", "soft-drinks", "juice", "energy", "hot-drinks"], status: "Active" },
  { id: "pillow", code: "BLK-002", name: "Pillow Tube", areaIds: ["pillow-tube"], status: "Active" },
  { id: "travel", code: "BLK-003", name: "Travel Essentials", areaIds: ["travel-accessories"], status: "Active" },
  { id: "electronics", code: "BLK-004", name: "Personal Technology", areaIds: ["personal-audio", "mobile-accessories", "chargers", "headphones"], status: "Active" },
  { id: "stationery", code: "BLK-005", name: "Stationery", areaIds: ["writing", "paper", "greeting-cards"], status: "Active" },
  { id: "food", code: "BLK-006", name: "Food to Go", areaIds: ["confectionery", "snacks"], status: "Review" },
  { id: "books", code: "BLK-007", name: "Books & News", areaIds: ["books", "newspapers"], status: "Active" },
];

export const storeFormats: StoreFormat[] = [
  { id: "legacy", name: "Legacy", code: "LEG" },
  { id: "inmotion", name: "InMotion", code: "INM" },
  { id: "tech-express", name: "Tech Express", code: "TEX" },
  { id: "bookshop", name: "The Bookshop by WHSmith", code: "BKS" },
  { id: "curio-city", name: "curi.o.city", code: "CUR" },
  { id: "funky-pigeon", name: "Funky Pigeon", code: "FPG" },
  { id: "fresh-plus", name: "Fresh+", code: "FRH" },
];

export const fixtureImageCredits: Partial<Record<string, { title: string; artist: string; license: string; sourceUrl: string }>> = {
  "/fixtures/cooler-familymart.jpg": {
    title: "Cold beverage refrigerator at FamilyMart Beijie Store",
    artist: "Hoia Saerda Mea 28",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cold_beverage_refrigerator_at_FamilyMart_Beijie_Store_20190810.jpg",
  },
  "/fixtures/cooler-doors-santorin.jpg": {
    title: "Supermarket in Akrotiri, Santorini",
    artist: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Santorin_(GR),_Akrotiri,_Supermarkt_--_2017_--_2877-83.jpg",
  },
  "/fixtures/store-shelving.jpg": {
    title: "Shelving in an Aldi store in Australia",
    artist: "Bidgee",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Shelving_in_an_Aldi_store_in_Australia.jpg",
  },
  "/fixtures/gondola-spar.jpg": {
    title: "SPAR supermarket interior, Son Moro Cala Millor Mallorca",
    artist: "Steffen Mokosch",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:SPAR_supermarket_interior_Son_Moro_Cala_Millor_Mallorca.jpg",
  },
  "/fixtures/cash-registers.jpg": {
    title: "Cash Registers",
    artist: "Marlith",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cash_Registers.JPG",
  },
};

const formatBlockSeeds: Record<string, string[]> = {
  legacy: ["beverage", "electronics", "stationery", "food", "books"],
  inmotion: ["electronics", "beverage", "travel", "food"],
  "tech-express": ["electronics", "travel", "stationery"],
  bookshop: ["books", "stationery", "food"],
  "curio-city": ["travel", "beverage", "food", "books"],
  "funky-pigeon": ["stationery", "books", "travel"],
  "fresh-plus": ["food", "beverage", "stationery"],
};

export const initialFormatBlocks: Record<string, FormatPlanningBlock[]> = Object.fromEntries(
  storeFormats.map(format => [
    format.id,
    (formatBlockSeeds[format.id] ?? []).flatMap((blockId, index) => {
      const source = initialBlocks.find(block => block.id === blockId);
      if (!source) return [];
      return [{
        ...source,
        id: `${format.id}-${source.id}`,
        formatId: format.id,
        code: `MB-${format.code}-${String(index + 1).padStart(3, "0")}`,
        areaIds: [...source.areaIds],
      }];
    }),
  ]),
);

export const fixtures: Fixture[] = [
  { code: "IC-01", name: "Island Cooler", type: "Cooler", subtype: "Four-sided island", parentTypeId: "cooler", dimensions: "1,200 × 900 × 1,850 mm", eft: 6.4, status: "Active", imageUrl: "/fixtures/cooler-familymart.jpg", applicableFormatIds: storeFormats.map(format => format.id) },
  { code: "CW-04", name: "Cooler Wall 4S", type: "Cooler", subtype: "Four-shelf wall", parentTypeId: "cooler", dimensions: "1,200 × 650 × 2,100 mm", eft: 5.2, status: "Active", imageUrl: "/fixtures/cooler-familymart.jpg", applicableFormatIds: ["legacy", "inmotion", "fresh-plus"] },
  { code: "CW-05", name: "Cooler Wall 5S", type: "Cooler", subtype: "Five-shelf wall", parentTypeId: "cooler", dimensions: "1,200 × 650 × 2,250 mm", eft: 6.1, status: "Active", imageUrl: "/fixtures/cooler-doors-santorin.jpg", applicableFormatIds: ["legacy", "curio-city", "fresh-plus"] },
  { code: "CW-06", name: "Cooler Wall 6S", type: "Cooler", subtype: "Six-shelf wall", parentTypeId: "cooler", dimensions: "1,200 × 650 × 2,400 mm", eft: 7, status: "Review", imageUrl: "/fixtures/cooler-doors-santorin.jpg", applicableFormatIds: ["inmotion", "tech-express"] },
  { code: "SC-SL", name: "Standalone Cooler Slim", type: "Cooler", subtype: "Single-door slimline", parentTypeId: "cooler", dimensions: "650 × 700 × 2,050 mm", eft: 3.4, status: "Active", imageUrl: "/fixtures/cooler-doors-santorin.jpg", applicableFormatIds: ["inmotion", "tech-express", "curio-city"] },
  { code: "WB-12", name: "Wall Bay 1200", type: "Wall Bay", subtype: "Standard wall bay", parentTypeId: "wall-bay", dimensions: "1,200 × 450 × 2,100 mm", eft: 2.9, status: "Active", imageUrl: "/fixtures/store-shelving.jpg", applicableFormatIds: storeFormats.map(format => format.id) },
  { code: "TU-06", name: "Till Unit", type: "Till Unit", subtype: "", dimensions: "1,800 × 500 × 950 mm", eft: 1.8, status: "Active", imageUrl: "/fixtures/cash-registers.jpg", applicableFormatIds: ["legacy", "funky-pigeon", "fresh-plus"] },
  { code: "GON-09", name: "Gondola 900", type: "Gondola", subtype: "Double-sided gondola", parentTypeId: "gondola", dimensions: "900 × 900 × 1,800 mm", eft: 4.2, status: "Active", imageUrl: "/fixtures/gondola-spar.jpg", applicableFormatIds: ["legacy", "inmotion", "tech-express", "bookshop", "curio-city"] },
];

export const fixturePlanogramLayouts: Record<string, FixturePlanogramLayout> = {
  "IC-01": { usableWidthMm: 1_080, shelves: Array.from({ length: 4 }, () => ({ clearHeightMm: 360 })) },
  "CW-04": { usableWidthMm: 1_080, shelves: Array.from({ length: 4 }, () => ({ clearHeightMm: 390 })) },
  "CW-05": { usableWidthMm: 1_080, shelves: Array.from({ length: 5 }, () => ({ clearHeightMm: 340 })) },
  "CW-06": { usableWidthMm: 1_080, shelves: Array.from({ length: 6 }, () => ({ clearHeightMm: 310 })) },
  "SC-SL": { usableWidthMm: 560, shelves: Array.from({ length: 5 }, () => ({ clearHeightMm: 330 })) },
  "WB-12": { usableWidthMm: 1_080, shelves: Array.from({ length: 5 }, () => ({ clearHeightMm: 360 })) },
  "GON-09": { usableWidthMm: 810, shelves: Array.from({ length: 4 }, () => ({ clearHeightMm: 350 })) },
  "TU-06": { usableWidthMm: 1_620, shelves: Array.from({ length: 3 }, () => ({ clearHeightMm: 260 })) },
};

export const compatibilityFixtureExamples: Fixture[] = [
  { code: "CS-06", name: "Countertop Chiller", type: "Cooler", subtype: "Six-canopy countertop", parentTypeId: "cooler", dimensions: "600 × 600 × 900 mm", eft: 1.2, status: "Active" },
  { code: "VC-02", name: "Vertical Cooler", type: "Cooler", subtype: "Two-door vertical", parentTypeId: "cooler", dimensions: "1,250 × 750 × 2,050 mm", eft: 5.8, status: "Active" },
  { code: "VC-03", name: "Vertical Cooler", type: "Cooler", subtype: "Three-door vertical", parentTypeId: "cooler", dimensions: "1,850 × 750 × 2,050 mm", eft: 8.1, status: "Active" },
  { code: "FC-01", name: "Chest Freezer", type: "Cooler", subtype: "Single-lid chest", parentTypeId: "cooler", dimensions: "1,500 × 700 × 900 mm", eft: 3.0, status: "Review" },
  { code: "FC-02", name: "Chest Freezer", type: "Cooler", subtype: "Double-lid chest", parentTypeId: "cooler", dimensions: "1,800 × 800 × 900 mm", eft: 4.1, status: "Active" },
  { code: "RB-04", name: "Refrigerated Bakery Case", type: "Cooler", subtype: "Four-tier serve-over", parentTypeId: "cooler", dimensions: "1,200 × 800 × 1,250 mm", eft: 3.8, status: "Active" },
  { code: "RW-12", name: "Refrigerated Wall Bay", type: "Cooler", subtype: "Open-front 1,200 mm", parentTypeId: "cooler", dimensions: "1,200 × 750 × 2,100 mm", eft: 5.6, status: "Active" },
  { code: "RW-18", name: "Refrigerated Wall Bay", type: "Cooler", subtype: "Open-front 1,800 mm", parentTypeId: "cooler", dimensions: "1,800 × 750 × 2,100 mm", eft: 7.8, status: "Active" },
  { code: "SG-09", name: "Standard Gondola", type: "Gondola", subtype: "Double-sided 900 mm", parentTypeId: "gondola", dimensions: "900 × 900 × 1,800 mm", eft: 4.2, status: "Active" },
  { code: "SG-12", name: "Standard Gondola", type: "Gondola", subtype: "Double-sided 1,200 mm", parentTypeId: "gondola", dimensions: "1,200 × 900 × 1,800 mm", eft: 5.4, status: "Active" },
  { code: "EG-09", name: "End Gondola", type: "Gondola", subtype: "Single-sided 900 mm", parentTypeId: "gondola", dimensions: "900 × 450 × 1,800 mm", eft: 2.4, status: "Active" },
  { code: "WG-09", name: "Wall Gondola", type: "Gondola", subtype: "Single-sided 900 mm", parentTypeId: "gondola", dimensions: "900 × 450 × 1,800 mm", eft: 2.6, status: "Active" },
  { code: "NG-12", name: "Nested Gondola", type: "Gondola", subtype: "Three-basket floor unit", parentTypeId: "gondola", dimensions: "1,200 × 600 × 1,500 mm", eft: 3.1, status: "Review" },
  { code: "WB-06", name: "Wall Bay 600", type: "Wall Bay", subtype: "Four-shelf narrow bay", parentTypeId: "wall-bay", dimensions: "600 × 450 × 2,000 mm", eft: 1.8, status: "Active" },
  { code: "WB-09", name: "Wall Bay 900", type: "Wall Bay", subtype: "Five-shelf standard bay", parentTypeId: "wall-bay", dimensions: "900 × 450 × 2,100 mm", eft: 2.3, status: "Active" },
  { code: "WB-18", name: "Wall Bay 1800", type: "Wall Bay", subtype: "Five-shelf wide bay", parentTypeId: "wall-bay", dimensions: "1,800 × 450 × 2,100 mm", eft: 4.1, status: "Active" },
  { code: "PB-09", name: "Pegboard Bay", type: "Wall Bay", subtype: "Slatwall accessory bay", parentTypeId: "wall-bay", dimensions: "900 × 350 × 2,000 mm", eft: 1.7, status: "Active" },
  { code: "SB-09", name: "Slatwall Bay", type: "Wall Bay", subtype: "Accessory display bay", parentTypeId: "wall-bay", dimensions: "900 × 300 × 2,000 mm", eft: 1.5, status: "Active" },
  { code: "SH-06", name: "Shelf Unit", type: "Wall Bay", subtype: "Six-tier bookcase", parentTypeId: "wall-bay", dimensions: "900 × 350 × 1,800 mm", eft: 1.9, status: "Active" },
  { code: "TU-12", name: "Till Unit", type: "Till Unit", subtype: "Double checkout counter", dimensions: "2,400 × 700 × 950 mm", eft: 3.6, status: "Active" },
  { code: "TU-08", name: "Till Unit", type: "Till Unit", subtype: "Compact checkout counter", dimensions: "1,600 × 650 × 950 mm", eft: 2.2, status: "Active" },
  { code: "QK-01", name: "Queue Fixture", type: "Till Unit", subtype: "Impulse queue rack", dimensions: "1,200 × 400 × 1,300 mm", eft: 1.4, status: "Active" },
  { code: "CS-01", name: "Counter Display", type: "Till Unit", subtype: "Acrylic countertop tier", dimensions: "450 × 350 × 500 mm", eft: 0.4, status: "Active" },
  { code: "PD-01", name: "Dump Bin", type: "Gondola", subtype: "Wire basket floor unit", dimensions: "600 × 600 × 800 mm", eft: 1.1, status: "Active" },
  { code: "PD-02", name: "Dump Bin", type: "Gondola", subtype: "Cardboard promotional bin", dimensions: "500 × 500 × 750 mm", eft: 0.8, status: "Review" },
  { code: "MD-04", name: "Magazine Display", type: "Wall Bay", subtype: "Four-pocket waterfall rack", dimensions: "600 × 350 × 1,700 mm", eft: 1.2, status: "Active" },
  { code: "BC-08", name: "Bookcase", type: "Wall Bay", subtype: "Eight-shelf bookcase", dimensions: "900 × 350 × 1,900 mm", eft: 2.0, status: "Active" },
  { code: "SC-04", name: "Spinning Card Rack", type: "Gondola", subtype: "Four-sided greeting card spinner", dimensions: "500 × 500 × 1,650 mm", eft: 0.9, status: "Active" },
  { code: "TR-06", name: "Travel Accessory Tower", type: "Gondola", subtype: "Six-face hanging tower", dimensions: "600 × 600 × 1,700 mm", eft: 1.3, status: "Active" },
  { code: "PR-12", name: "Power Accessory Rack", type: "Wall Bay", subtype: "Twelve-hook counter rack", dimensions: "400 × 250 × 600 mm", eft: 0.5, status: "Active" },
  { code: "SN-06", name: "Snack Rack", type: "Gondola", subtype: "Six-tier impulse rack", dimensions: "500 × 450 × 1,600 mm", eft: 1.0, status: "Active" },
  { code: "CH-08", name: "Confectionery Counter", type: "Till Unit", subtype: "Eight-bin sweet display", dimensions: "800 × 350 × 250 mm", eft: 0.6, status: "Active" },
];

export const compatibilityFixtureRules: FixtureCompatibility[] = compatibilityFixtureExamples.flatMap((fixture, index) => {
  const primaryBlock = initialBlocks[index % initialBlocks.length];
  const compatibleBlocks = index % 4 === 0
    ? [primaryBlock, initialBlocks[(index + 3) % initialBlocks.length]]
    : [primaryBlock];
  return compatibleBlocks.flatMap((block, blockIndex) => block.areaIds.map((areaId, areaIndex) => ({
    fixtureCode: fixture.code,
    blockId: block.id,
    areaId,
    slots: 16 + ((index * 3 + areaIndex * 5 + blockIndex * 7) % 29),
    status: "Active" as const,
  })));
});

export const fixtureTypes: FixtureType[] = [
  { id: "cooler", name: "Cooler", status: "Active" },
  { id: "wall-bay", name: "Wall Bay", status: "Active" },
  { id: "gondola", name: "Gondola", status: "Active" },
];

export const fixtureCompatibility: FixtureCompatibility[] = [
  { fixtureCode: "IC-01", blockId: "beverage", areaId: "water", slots: 48, status: "Active" },
  { fixtureCode: "IC-01", blockId: "beverage", areaId: "soft-drinks", slots: 44, status: "Active" },
  { fixtureCode: "IC-01", blockId: "beverage", areaId: "juice", slots: 36, status: "Active" },
  { fixtureCode: "CW-04", blockId: "beverage", areaId: "soft-drinks", slots: 38, status: "Active" },
  { fixtureCode: "CW-05", blockId: "beverage", areaId: "water", slots: 52, status: "Active" },
  { fixtureCode: "CW-05", blockId: "beverage", areaId: "juice", slots: 42, status: "Active" },
  { fixtureCode: "CW-06", blockId: "beverage", areaId: "energy", slots: 56, status: "Review" },
  { fixtureCode: "SC-SL", blockId: "beverage", areaId: "soft-drinks", slots: 24, status: "Active" },
  { fixtureCode: "WB-12", blockId: "pillow", areaId: "pillow-tube", slots: 30, status: "Active" },
  { fixtureCode: "WB-12", blockId: "electronics", areaId: "personal-audio", slots: 40, status: "Active" },
  { fixtureCode: "WB-12", blockId: "electronics", areaId: "chargers", slots: 44, status: "Active" },
  { fixtureCode: "GON-09", blockId: "electronics", areaId: "mobile-accessories", slots: 52, status: "Active" },
  { fixtureCode: "GON-09", blockId: "stationery", areaId: "paper", slots: 60, status: "Active" },
  { fixtureCode: "TU-06", blockId: "food", areaId: "confectionery", slots: 28, status: "Active" },
  { fixtureCode: "TU-06", blockId: "food", areaId: "snacks", slots: 24, status: "Review" },
  { fixtureCode: "GON-09", blockId: "books", areaId: "books", slots: 44, status: "Active" },
];

export const fixtureBlockAllocations: FixtureBlockAllocation[] = [
  { fixtureCode: "IC-01", blockId: "beverage", eftShare: 1 },
  { fixtureCode: "CW-04", blockId: "beverage", eftShare: 1 },
  { fixtureCode: "CW-05", blockId: "beverage", eftShare: 1 },
  { fixtureCode: "CW-06", blockId: "beverage", eftShare: 1 },
  { fixtureCode: "SC-SL", blockId: "beverage", eftShare: 1 },
  { fixtureCode: "WB-12", blockId: "pillow", eftShare: 0.35 },
  { fixtureCode: "WB-12", blockId: "electronics", eftShare: 0.65 },
  { fixtureCode: "TU-06", blockId: "food", eftShare: 1 },
  { fixtureCode: "GON-09", blockId: "electronics", eftShare: 1 / 3 },
  { fixtureCode: "GON-09", blockId: "stationery", eftShare: 1 / 3 },
  { fixtureCode: "GON-09", blockId: "books", eftShare: 1 / 3 },
];

const storeRoster = [
  ["0876", "Seattle Airport Concourse B", "Destination", "Washington", "Pacific", "Seattle–Tacoma International Airport", "Travel Retail"],
  ["1489", "Chicago O'Hare Terminal 3", "Destination", "Illinois", "Midwest", "O'Hare International Airport", "Travel Retail"],
  ["1024", "New York Midtown Transit", "Transit", "New York", "Northeast", "Midtown Manhattan", "Transit"],
  ["0542", "Dallas Central Market", "Flagship", "Texas", "South", "Downtown Dallas", "High Street"],
  ["0931", "Los Angeles Union Terminal", "Transit", "California", "West", "Union Station", "Transit"],
  ["0219", "Denver Airport Concourse A", "Destination", "Colorado", "Mountain", "Denver International Airport", "Travel Retail"],
  ["1105", "Atlanta Downtown Exchange", "Transit", "Georgia", "Southeast", "Downtown Atlanta", "Transit"],
  ["0348", "San Francisco Market Street", "Flagship", "California", "West", "Market Street", "High Street"],
  ["0762", "Boston Harbor Transit", "Transit", "Massachusetts", "Northeast", "Boston Harbor", "Transit"],
  ["1502", "Miami International Concourse D", "Destination", "Florida", "Southeast", "Miami International Airport", "Travel Retail"],
  ["0112", "Portland Commuter Center", "Community", "Oregon", "Pacific", "Downtown Portland", "Community"],
  ["0645", "Phoenix Sky Harbor Terminal 4", "Destination", "Arizona", "Southwest", "Phoenix Sky Harbor International Airport", "Travel Retail"],
  ["0821", "Minneapolis North Loop", "Community", "Minnesota", "Midwest", "North Loop", "Community"],
  ["0493", "Nashville Central Station", "Transit", "Tennessee", "South", "Downtown Nashville", "Transit"],
  ["0714", "Washington Union Concourse", "Transit", "District of Columbia", "Northeast", "Union Station", "Transit"],
  ["0916", "Charlotte Airport Atrium", "Destination", "North Carolina", "Southeast", "Charlotte Douglas International Airport", "Travel Retail"],
  ["0326", "Seattle Downtown Market", "Flagship", "Washington", "Pacific", "Downtown Seattle", "High Street"],
  ["0519", "Austin Convention District", "Community", "Texas", "South", "Convention District", "Community"],
  ["0148", "San Diego Airport Terminal 2", "Destination", "California", "West", "San Diego International Airport", "Travel Retail"],
  ["1234", "Newark Airport Terminal A", "Destination", "New Jersey", "Northeast", "Newark Liberty International Airport", "Travel Retail"],
].map(([id, name, format, state, region, property, channel]) => ({
  id,
  name,
  format,
  channel,
  property,
  state,
  region,
}));

// Preserve the roster's store-segment field while mapping mock stores to the seven existing merchandising formats.
const storeFormatByStoreId: Record<string, string> = {
  "0876": "legacy",
  "1489": "curio-city",
  "1024": "inmotion",
  "0542": "legacy",
  "0931": "inmotion",
  "0219": "legacy",
  "1105": "inmotion",
  "0348": "bookshop",
  "0762": "funky-pigeon",
  "1502": "fresh-plus",
  "0112": "tech-express",
  "0645": "tech-express",
  "0821": "curio-city",
  "0493": "legacy",
  "0714": "inmotion",
  "0916": "tech-express",
  "0326": "bookshop",
  "0519": "inmotion",
  "0148": "fresh-plus",
  "1234": "funky-pigeon",
};

export const skus: PlanningSku[] = ([
  { id: "sku-101", code: "501482", description: "SoundPod wireless earbuds", areaId: "personal-audio", brand: "SoundPod" },
  { id: "sku-102", code: "501510", description: "SoundPod USB-C earphones", areaId: "personal-audio", brand: "SoundPod" },
  { id: "sku-103", code: "619882", description: "Braided USB-C cable 1m", areaId: "chargers", brand: "Connect" },
  { id: "sku-104", code: "734201", description: "Volt 20W wall charger", areaId: "chargers", brand: "Volt" },
  { id: "sku-105", code: "734218", description: "Universal travel adapter", areaId: "mobile-accessories", brand: "GoWorld" },
  { id: "sku-106", code: "619906", description: "Powerbank 10,000mAh", areaId: "mobile-accessories", brand: "Volt" },
  { id: "sku-107", code: "810044", description: "Still water 500ml", areaId: "water", brand: "WHSmith" },
  { id: "sku-108", code: "810102", description: "Sparkling water 500ml", areaId: "water", brand: "Northstar Springs" },
  { id: "sku-109", code: "821310", description: "Orange juice 330ml", areaId: "juice", brand: "Orchard Press" },
  { id: "sku-110", code: "841201", description: "Classic cola 500ml", areaId: "soft-drinks", brand: "Coca-Cola" },
  { id: "sku-111", code: "841222", description: "Lemon & lime 500ml", areaId: "soft-drinks", brand: "Sprite" },
  { id: "sku-112", code: "903112", description: "Travel pillow tube", areaId: "pillow-tube", brand: "Wayfinder" },
  { id: "sku-113", code: "810205", description: "Still water 750ml", areaId: "water", brand: "Northstar Springs" },
  { id: "sku-114", code: "822014", description: "Cloudy apple juice 330ml", areaId: "juice", brand: "Orchard Press" },
  { id: "sku-115", code: "841305", description: "Orange soda 500ml", areaId: "soft-drinks", brand: "Fanta" },
  { id: "sku-116", code: "845100", description: "Energy drink 250ml", areaId: "energy", brand: "Pulse" },
  { id: "sku-117", code: "845120", description: "Sugar-free energy drink", areaId: "energy", brand: "Pulse" },
  { id: "sku-118", code: "850011", description: "Ready-to-drink iced coffee", areaId: "hot-drinks", brand: "Roast & Go" },
  { id: "sku-119", code: "850024", description: "Breakfast tea 20 bags", areaId: "hot-drinks", brand: "Northstar Tea" },
  { id: "sku-120", code: "903125", description: "Memory foam travel pillow", areaId: "pillow-tube", brand: "Wayfinder" },
  { id: "sku-121", code: "741008", description: "USB-C fast charge cable", areaId: "chargers", brand: "Connect" },
  { id: "sku-122", code: "620115", description: "Noise-isolating travel headphones", areaId: "headphones", brand: "SoundPod" },
  { id: "sku-123", code: "620128", description: "Fold-flat wireless headset", areaId: "headphones", brand: "SoundPod" },
]).map((sku, index) => ({
  ...sku,
  widthMm: [68, 72, 62, 88, 94, 102, 66, 68, 62, 70, 70, 138, 74, 64, 70, 58, 58, 72, 94, 148, 66, 112, 126][index] ?? 80,
  heightMm: [92, 104, 158, 132, 148, 166, 218, 218, 178, 220, 220, 250, 252, 178, 220, 158, 158, 168, 142, 264, 162, 176, 184][index] ?? 160,
  packageType: (["blister", "blister", "blister", "box", "box", "box", "bottle", "bottle", "bottle", "bottle", "bottle", "pouch", "bottle", "bottle", "bottle", "can", "can", "can", "box", "pouch", "blister", "blister", "blister"] as const)[index] ?? "box",
  sales: Math.round((0.4 + ((index * 7) % 38) / 10) * 10) / 10,
  units: 3500 + ((index * 1279) % 24000),
}));

export const initialInventory: StoreInventory[] = [
  { id: "inv-1", storeId: "0876", fixtureCode: "IC-01", quantity: 1, change: "Existing" },
  { id: "inv-2", storeId: "0876", fixtureCode: "CW-05", quantity: 2, change: "Existing" },
  { id: "inv-3", storeId: "0876", fixtureCode: "WB-12", quantity: 4, change: "Existing" },
  { id: "inv-4", storeId: "0876", fixtureCode: "GON-09", quantity: 2, change: "Existing" },
  { id: "inv-5", storeId: "1489", fixtureCode: "IC-01", quantity: 2, change: "Existing" },
  { id: "inv-6", storeId: "1489", fixtureCode: "CW-05", quantity: 3, change: "Existing" },
  { id: "inv-7", storeId: "1489", fixtureCode: "SC-SL", quantity: 2, change: "Added" },
  { id: "inv-8", storeId: "1024", fixtureCode: "CW-04", quantity: 2, change: "Existing" },
  { id: "inv-9", storeId: "1024", fixtureCode: "WB-12", quantity: 3, change: "Existing" },
  { id: "inv-10", storeId: "0542", fixtureCode: "IC-01", quantity: 1, change: "Existing" },
  { id: "inv-11", storeId: "0542", fixtureCode: "TU-06", quantity: 2, change: "Existing" },
  { id: "inv-12", storeId: "0931", fixtureCode: "CW-04", quantity: 1, change: "Existing" },
  { id: "inv-13", storeId: "0931", fixtureCode: "GON-09", quantity: 2, change: "Removed" },
  { id: "inv-14", storeId: "0112", fixtureCode: "SC-SL", quantity: 1, change: "Existing" },
  { id: "inv-15", storeId: "0112", fixtureCode: "WB-12", quantity: 2, change: "Existing" },
  ...["0219", "1105", "0348", "0762", "1502", "0645", "0821", "0493", "0714", "0916", "0326", "0519", "0148", "1234"].map((storeId, index) => ({
    id: `inv-extra-${index}`,
    storeId,
    fixtureCode: index % 3 === 0 ? "IC-01" : index % 3 === 1 ? "WB-12" : "GON-09",
    quantity: index % 2 + 1,
    change: "Existing" as const,
  })),
];

const gradeForEft = (eft: number) => eft < 3 ? "XS" : eft < 5 ? "S" : eft < 7 ? "M" : eft < 9 ? "L" : eft < 12 ? "XL" : "Mega";

export const initialStores: PlanningStore[] = storeRoster.map(store => {
  const eftByBlock = Object.fromEntries(initialBlocks.map(block => {
    const eft = initialInventory
      .filter(row => row.storeId === store.id && row.change !== "Removed" && row.quantity > 0 && fixtureCompatibility.some(rule => rule.fixtureCode === row.fixtureCode && rule.blockId === block.id))
      .reduce((sum, row) => {
        const fixture = fixtures.find(item => item.code === row.fixtureCode);
        const allocation = fixtureBlockAllocations.find(item => item.fixtureCode === row.fixtureCode && item.blockId === block.id);
        return sum + row.quantity * (fixture?.eft ?? 0) * (allocation?.eftShare ?? 0);
      }, 0);
    return [block.id, eft];
  }));
  return {
    ...store,
    storeFormatId: storeFormatByStoreId[store.id] ?? storeFormats[0].id,
    eftByBlock,
    currentGradeByBlock: Object.fromEntries(Object.entries(eftByBlock).map(([blockId, eft]) => [blockId, gradeForEft(Number(eft))])),
  };
});

export const initialAssignments: FacingAssignment[] = [
  { id: "as-1", storeId: "0876", blockId: "electronics", areaId: "personal-audio", fixtureCode: "WB-12", skuId: "sku-101", facings: 3 },
  { id: "as-2", storeId: "0876", blockId: "electronics", areaId: "personal-audio", fixtureCode: "WB-12", skuId: "sku-102", facings: 2 },
  { id: "as-3", storeId: "0876", blockId: "electronics", areaId: "chargers", fixtureCode: "WB-12", skuId: "sku-103", facings: 3 },
  { id: "as-4", storeId: "0876", blockId: "electronics", areaId: "chargers", fixtureCode: "WB-12", skuId: "sku-104", facings: 2 },
  { id: "as-5", storeId: "0876", blockId: "electronics", areaId: "mobile-accessories", fixtureCode: "GON-09", skuId: "sku-105", facings: 2 },
  { id: "as-6", storeId: "0876", blockId: "electronics", areaId: "mobile-accessories", fixtureCode: "GON-09", skuId: "sku-106", facings: 2 },
  { id: "as-7", storeId: "0876", blockId: "beverage", areaId: "water", fixtureCode: "IC-01", skuId: "sku-107", facings: 4 },
  { id: "as-8", storeId: "0876", blockId: "beverage", areaId: "water", fixtureCode: "IC-01", skuId: "sku-108", facings: 3 },
  { id: "as-9", storeId: "0876", blockId: "beverage", areaId: "juice", fixtureCode: "IC-01", skuId: "sku-109", facings: 2 },
  { id: "as-10", storeId: "1489", blockId: "beverage", areaId: "soft-drinks", fixtureCode: "CW-05", skuId: "sku-110", facings: 4 },
  { id: "as-11", storeId: "1489", blockId: "beverage", areaId: "soft-drinks", fixtureCode: "CW-05", skuId: "sku-111", facings: 3 },
];
