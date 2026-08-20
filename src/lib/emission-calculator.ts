import factorsData from "@/data/emission-factors.json";

// GWP AR5 100-year (used to combine CO2/CH4/N2O for combustion)
export const GWP = { CO2: 1, CH4: 28, N2O: 265 } as const;

export type Scope =
  | "Stationary Combustion"
  | "Mobile Combustion"
  | "Electricity"
  | "Freight"
  | "Business Travel"
  | "Fugitive Emissions"
  // Scope 3 standard categories
  | "Scope 3 - Category 1: Purchased Goods & Services"
  | "Scope 3 - Category 2: Capital Goods"
  | "Scope 3 - Category 3: Fuel & Energy Activities"
  | "Scope 3 - Category 4: Upstream Transportation (Freight)"
  | "Scope 3 - Category 5: Waste Generated in Operations"
  | "Scope 3 - Category 6: Business Travel"
  | "Scope 3 - Category 7: Employee Commuting"
  | "Scope 3 - Category 8: Upstream Leased Assets"
  | "Scope 3 - Category 9: Downstream Transportation"
  | "Scope 3 - Category 10: Processing of Sold Products"
  | "Scope 3 - Category 11: Use of Sold Products"
  | "Scope 3 - Category 12: End-of-Life of Sold Products"
  | "Scope 3 - Category 13: Downstream Leased Assets"
  | "Scope 3 - Category 14: Franchises"
  | "Scope 3 - Category 15: Investments";

export type StationaryFactor = {
  name: string;
  category: string;
  co2_per_kg: number | null;
  ch4_per_kg: number | null;
  n2o_per_kg: number | null;
  co2_per_l: number | null;
  ch4_per_l: number | null;
  n2o_per_l: number | null;
  co2_per_m3: number | null;
  ch4_per_m3: number | null;
  n2o_per_m3: number | null;
  density_l: number | null;
  density_m3: number | null;
  source: string;
  scope: "Stationary Combustion";
};

export type SimpleFactor = {
  name: string;
  category: string;
  ef_value: number;
  ef_unit: string;
  source: string;
  scope: Exclude<Scope, "Stationary Combustion">;
};

const raw = factorsData as unknown as {
  stationary: StationaryFactor[];
  mobile: (Omit<SimpleFactor, "scope"> & { scope: "Mobile Combustion" })[];
  electricity: (Omit<SimpleFactor, "scope"> & { scope: "Electricity" })[];
  freight: (Omit<SimpleFactor, "scope"> & { scope: "Freight" })[];
  travel: (Omit<SimpleFactor, "scope"> & { scope: "Business Travel" })[];
  refrigerant: (Omit<SimpleFactor, "scope"> & { scope: "Fugitive Emissions" })[];
};

export const factors = raw;

// Comprehensive Scope 3 Predefined Emission Factors (DEFRA, GHG Protocol & EPA Guidelines)
const scope3Products: SimpleFactor[] = [
  // Category 1: Purchased Goods & Services
  {
    name: "Primary Steel (BF-BOF)",
    category: "Metals & Mining",
    ef_value: 1.81,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Recycled Steel (EAF)",
    category: "Metals & Mining",
    ef_value: 0.45,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Primary Aluminium",
    category: "Metals & Mining",
    ef_value: 8.85,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Recycled Aluminium",
    category: "Metals & Mining",
    ef_value: 0.62,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Copper (virgin)",
    category: "Metals & Mining",
    ef_value: 3.8,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Plastics — PET",
    category: "Polymers & Synthetics",
    ef_value: 2.15,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Plastics — HDPE",
    category: "Polymers & Synthetics",
    ef_value: 1.9,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Plastics — PVC",
    category: "Polymers & Synthetics",
    ef_value: 2.41,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Concrete & Cement",
    category: "Building Materials",
    ef_value: 0.13,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Paper & Cardboard Packaging",
    category: "Paper & Packaging",
    ef_value: 0.88,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Flat Glass",
    category: "Glass & Ceramics",
    ef_value: 1.22,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Organic Chemicals",
    category: "Chemicals",
    ef_value: 1.95,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Cotton Fabric & Textiles",
    category: "Textiles",
    ef_value: 4.2,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024 / GHG Protocol",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "IT Equipment — Laptop Computer",
    category: "Electronics",
    ef_value: 320.0,
    ef_unit: "kg CO2e/unit",
    source: "GHG Protocol ICT Sector",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "IT Equipment — Enterprise Server",
    category: "Electronics",
    ef_value: 1250.0,
    ef_unit: "kg CO2e/unit",
    source: "GHG Protocol ICT Sector",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Professional & Legal Services",
    category: "Services (Spend-based)",
    ef_value: 0.14,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },
  {
    name: "Marketing & IT Cloud Services",
    category: "Services (Spend-based)",
    ef_value: 0.22,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 1: Purchased Goods & Services",
  },

  // Category 2: Capital Goods
  {
    name: "Industrial Heavy Machinery",
    category: "Capital Equipment",
    ef_value: 0.38,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 2: Capital Goods",
  },
  {
    name: "Commercial HVAC & Chiller Systems",
    category: "Capital Equipment",
    ef_value: 0.45,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 2: Capital Goods",
  },
  {
    name: "Commercial Fleet Vehicles & Trucks",
    category: "Vehicles",
    ef_value: 0.32,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 2: Capital Goods",
  },
  {
    name: "Office Building Construction",
    category: "Infrastructure",
    ef_value: 0.28,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 2: Capital Goods",
  },
  {
    name: "Office IT Hardware & Computers",
    category: "IT Infrastructure",
    ef_value: 0.42,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 2: Capital Goods",
  },

  // Category 3: Fuel & Energy Activities
  {
    name: "Well-to-Tank (WTT) — Grid Electricity",
    category: "Upstream Energy",
    ef_value: 0.048,
    ef_unit: "kg CO2e/kWh",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 3: Fuel & Energy Activities",
  },
  {
    name: "Well-to-Tank (WTT) — Natural Gas",
    category: "Upstream Energy",
    ef_value: 0.024,
    ef_unit: "kg CO2e/kWh",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 3: Fuel & Energy Activities",
  },
  {
    name: "Well-to-Tank (WTT) — Diesel Fuel",
    category: "Upstream Energy",
    ef_value: 0.58,
    ef_unit: "kg CO2e/litre",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 3: Fuel & Energy Activities",
  },
  {
    name: "Transmission & Distribution Grid Losses",
    category: "Grid Losses",
    ef_value: 0.065,
    ef_unit: "kg CO2e/kWh",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 3: Fuel & Energy Activities",
  },

  // Category 5: Waste Generated in Operations
  {
    name: "Municipal Solid Waste — Landfill",
    category: "Waste Disposal",
    ef_value: 0.467,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },
  {
    name: "Municipal Solid Waste — Incineration",
    category: "Waste Disposal",
    ef_value: 0.021,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },
  {
    name: "Recycled Paper & Cardboard",
    category: "Recycling",
    ef_value: 0.021,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },
  {
    name: "Recycled Scrap Metal",
    category: "Recycling",
    ef_value: 0.021,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },
  {
    name: "Recycled Mixed Plastics",
    category: "Recycling",
    ef_value: 0.021,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },
  {
    name: "Industrial Wastewater Treatment",
    category: "Wastewater",
    ef_value: 0.728,
    ef_unit: "kg CO2e/m³",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 5: Waste Generated in Operations",
  },

  // Category 7: Employee Commuting
  {
    name: "Commuter Car — Gasoline / Petrol",
    category: "Road Commute",
    ef_value: 0.171,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },
  {
    name: "Commuter Car — Diesel",
    category: "Road Commute",
    ef_value: 0.165,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },
  {
    name: "Commuter Car — Hybrid",
    category: "Road Commute",
    ef_value: 0.112,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },
  {
    name: "Commuter Car — Electric Vehicle (EV)",
    category: "Road Commute",
    ef_value: 0.053,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },
  {
    name: "Public Bus Commute",
    category: "Transit",
    ef_value: 0.089,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },
  {
    name: "Metro / Subway Commute",
    category: "Transit",
    ef_value: 0.028,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 7: Employee Commuting",
  },

  // Category 8: Upstream Leased Assets
  {
    name: "Leased Commercial Office Space",
    category: "Real Estate",
    ef_value: 35.5,
    ef_unit: "kg CO2e/m²",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 8: Upstream Leased Assets",
  },
  {
    name: "Leased Warehouse & Logistics Hub",
    category: "Real Estate",
    ef_value: 22.4,
    ef_unit: "kg CO2e/m²",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 8: Upstream Leased Assets",
  },
  {
    name: "Leased Data Center Rack Space",
    category: "IT Facilities",
    ef_value: 0.38,
    ef_unit: "kg CO2e/kWh",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 8: Upstream Leased Assets",
  },

  // Category 9: Downstream Transportation
  {
    name: "Delivery Van (Last-mile Local)",
    category: "Road Freight",
    ef_value: 0.218,
    ef_unit: "kg CO2e/km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 9: Downstream Transportation",
  },
  {
    name: "Downstream Road Freight Truck",
    category: "Road Freight",
    ef_value: 0.107,
    ef_unit: "kg CO2e/tonne.km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 9: Downstream Transportation",
  },
  {
    name: "Downstream Sea Cargo Freight",
    category: "Sea Freight",
    ef_value: 0.0161,
    ef_unit: "kg CO2e/tonne.km",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 9: Downstream Transportation",
  },

  // Category 10: Processing of Sold Products
  {
    name: "Metal Machining & Fabrication",
    category: "Manufacturing",
    ef_value: 0.52,
    ef_unit: "kg CO2e/kg",
    source: "GHG Protocol",
    scope: "Scope 3 - Category 10: Processing of Sold Products",
  },
  {
    name: "Chemical Synthesis & Processing",
    category: "Manufacturing",
    ef_value: 0.85,
    ef_unit: "kg CO2e/kg",
    source: "GHG Protocol",
    scope: "Scope 3 - Category 10: Processing of Sold Products",
  },
  {
    name: "Plastic Molding & Extrusion",
    category: "Manufacturing",
    ef_value: 0.42,
    ef_unit: "kg CO2e/kg",
    source: "GHG Protocol",
    scope: "Scope 3 - Category 10: Processing of Sold Products",
  },

  // Category 11: Use of Sold Products
  {
    name: "Direct Electricity Consumption",
    category: "Product Use Phase",
    ef_value: 0.45,
    ef_unit: "kg CO2e/kWh",
    source: "GHG Protocol",
    scope: "Scope 3 - Category 11: Use of Sold Products",
  },
  {
    name: "Fuel Consumption of Sold Equipment",
    category: "Product Use Phase",
    ef_value: 2.68,
    ef_unit: "kg CO2e/litre",
    source: "GHG Protocol",
    scope: "Scope 3 - Category 11: Use of Sold Products",
  },

  // Category 12: End-of-Life of Sold Products
  {
    name: "E-Waste Electronics Recycling",
    category: "End of Life",
    ef_value: 0.085,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 12: End-of-Life of Sold Products",
  },
  {
    name: "Plastic Product Landfill Disposal",
    category: "End of Life",
    ef_value: 0.042,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 12: End-of-Life of Sold Products",
  },
  {
    name: "Packaging Waste Incineration",
    category: "End of Life",
    ef_value: 0.92,
    ef_unit: "kg CO2e/kg",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 12: End-of-Life of Sold Products",
  },

  // Category 13: Downstream Leased Assets
  {
    name: "Downstream Leased Commercial Building",
    category: "Leased Assets",
    ef_value: 35.5,
    ef_unit: "kg CO2e/m²",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 13: Downstream Leased Assets",
  },
  {
    name: "Downstream Leased Retail Outlet",
    category: "Leased Assets",
    ef_value: 48.2,
    ef_unit: "kg CO2e/m²",
    source: "DEFRA 2024",
    scope: "Scope 3 - Category 13: Downstream Leased Assets",
  },

  // Category 14: Franchises
  {
    name: "Franchise Operations Spend",
    category: "Franchises",
    ef_value: 0.35,
    ef_unit: "kg CO2e/USD",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 14: Franchises",
  },
  {
    name: "Franchise Facility Energy Use",
    category: "Franchises",
    ef_value: 0.45,
    ef_unit: "kg CO2e/kWh",
    source: "EPA EEIO v2.0",
    scope: "Scope 3 - Category 14: Franchises",
  },

  // Category 15: Investments
  {
    name: "Equity Investment Portfolio",
    category: "Investments",
    ef_value: 0.22,
    ef_unit: "kg CO2e/USD",
    source: "PCAF Standard / EPA EEIO",
    scope: "Scope 3 - Category 15: Investments",
  },
  {
    name: "Commercial Project Finance",
    category: "Investments",
    ef_value: 0.31,
    ef_unit: "kg CO2e/USD",
    source: "PCAF Standard / EPA EEIO",
    scope: "Scope 3 - Category 15: Investments",
  },
];

export const allProducts = [
  ...raw.stationary.map((f) => ({ ...f, scope: "Stationary Combustion" as const })),
  ...raw.mobile.map((f) => ({ ...f, scope: "Mobile Combustion" as const })),
  ...raw.electricity.map((f) => ({ ...f, scope: "Electricity" as const })),
  ...raw.freight.map((f) => ({ ...f, scope: "Freight" as const })),
  ...raw.travel.map((f) => ({ ...f, scope: "Business Travel" as const })),
  ...raw.refrigerant.map((f) => ({ ...f, scope: "Fugitive Emissions" as const })),
  ...scope3Products,
];

export type Product = (typeof allProducts)[number];

export const SCOPES: { value: Scope; label: string; hint: string }[] = [
  // Scope 1
  { value: "Stationary Combustion", label: "Stationary Combustion", hint: "Scope 1" },
  { value: "Mobile Combustion", label: "Mobile Combustion", hint: "Scope 1" },
  { value: "Fugitive Emissions", label: "Fugitive — Refrigerants & Gases", hint: "Scope 1" },
  // Scope 2
  { value: "Electricity", label: "Purchased Electricity", hint: "Scope 2" },
  // Scope 3
  {
    value: "Scope 3 - Category 1: Purchased Goods & Services",
    label: "Scope 3 - Category 1: Purchased Goods & Services",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 2: Capital Goods",
    label: "Scope 3 - Category 2: Capital Goods",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 3: Fuel & Energy Activities",
    label: "Scope 3 - Category 3: Fuel & Energy Activities",
    hint: "Scope 3",
  },
  {
    value: "Freight",
    label: "Scope 3 - Category 4: Upstream Transportation (Freight)",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 5: Waste Generated in Operations",
    label: "Scope 3 - Category 5: Waste Generated in Operations",
    hint: "Scope 3",
  },
  { value: "Business Travel", label: "Scope 3 - Category 6: Business Travel", hint: "Scope 3" },
  {
    value: "Scope 3 - Category 7: Employee Commuting",
    label: "Scope 3 - Category 7: Employee Commuting",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 8: Upstream Leased Assets",
    label: "Scope 3 - Category 8: Upstream Leased Assets",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 9: Downstream Transportation",
    label: "Scope 3 - Category 9: Downstream Transportation",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 10: Processing of Sold Products",
    label: "Scope 3 - Category 10: Processing of Sold Products",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 11: Use of Sold Products",
    label: "Scope 3 - Category 11: Use of Sold Products",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 12: End-of-Life of Sold Products",
    label: "Scope 3 - Category 12: End-of-Life of Sold Products",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 13: Downstream Leased Assets",
    label: "Scope 3 - Category 13: Downstream Leased Assets",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 14: Franchises",
    label: "Scope 3 - Category 14: Franchises",
    hint: "Scope 3",
  },
  {
    value: "Scope 3 - Category 15: Investments",
    label: "Scope 3 - Category 15: Investments",
    hint: "Scope 3",
  },
];

/**
 * Returns strictly allowed units for a given product or custom metric type.
 * Prevents invalid cross-unit selections (e.g., selecting USD for mass materials).
 */
export function unitsForProduct(p: Product | null, customMetricType?: string): string[] {
  if (!p) {
    if (customMetricType === "Mass") return ["kg", "tonne", "lbs", "g"];
    if (customMetricType === "Volume") return ["litre", "m³"];
    if (customMetricType === "Energy") return ["kWh", "MWh", "GJ"];
    if (customMetricType === "Distance") return ["km", "mile"];
    if (customMetricType === "Freight") return ["tonne.km", "ton-miles"];
    if (customMetricType === "Spend") return ["USD", "INR", "EUR", "GBP"];
    if (customMetricType === "Area") return ["m²", "sqft"];
    if (customMetricType === "Night") return ["night"];
    if (customMetricType === "Unit") return ["unit"];
    return ["kg", "tonne", "USD", "litre", "kWh", "km"];
  }

  if (p.scope === "Stationary Combustion") {
    const s = p as StationaryFactor;
    const units: string[] = [];
    if (s.co2_per_kg != null) units.push("kg", "tonne", "lbs", "g");
    if (s.co2_per_l != null) units.push("litre");
    if (s.co2_per_m3 != null) units.push("m³");
    return units.length ? units : ["kg", "tonne"];
  }

  if (p.scope === "Electricity") return ["kWh", "MWh", "GJ"];
  if (p.scope === "Fugitive Emissions") return ["kg", "g", "tonne", "lbs"];

  const s = p as SimpleFactor;
  const efUnit = (s.ef_unit ?? "").toLowerCase();

  if (
    efUnit.includes("/usd") ||
    efUnit.includes("/inr") ||
    efUnit.includes("/spend") ||
    efUnit.includes("/$")
  ) {
    return ["USD", "INR", "EUR", "GBP"];
  }
  if (efUnit.includes("/tonne.km") || efUnit.includes("/tkm") || efUnit.includes("/ton-mile")) {
    return ["tonne.km", "ton-miles"];
  }
  if (
    efUnit.includes("/km") ||
    efUnit.includes("/mile") ||
    efUnit.includes("/pkm") ||
    efUnit.includes("/passenger.km")
  ) {
    return ["km", "mile"];
  }
  if (
    efUnit.includes("/kg") ||
    efUnit.includes("/tonne") ||
    efUnit.includes("/ton") ||
    efUnit.includes("/g")
  ) {
    return ["kg", "tonne", "lbs", "g"];
  }
  if (
    efUnit.includes("/l") ||
    efUnit.includes("/litre") ||
    efUnit.includes("/m3") ||
    efUnit.includes("/m³")
  ) {
    return ["litre", "m³"];
  }
  if (efUnit.includes("/kwh") || efUnit.includes("/mwh") || efUnit.includes("/gj")) {
    return ["kWh", "MWh", "GJ"];
  }
  if (efUnit.includes("/m2") || efUnit.includes("/m²") || efUnit.includes("/sqft")) {
    return ["m²", "sqft"];
  }
  if (efUnit.includes("/night")) {
    return ["night"];
  }
  if (efUnit.includes("/unit") || efUnit.includes("/item")) {
    return ["unit"];
  }

  const denom = s.ef_unit.split("/")[1]?.trim() || "kg";
  return [denom];
}

export type EmissionResult = {
  co2_kg: number;
  ch4_kg: number;
  n2o_kg: number;
  co2e_kg: number;
  ef_source: string;
  ef_details: {
    scope: string;
    unit: string;
    factor_co2?: number | null;
    factor_ch4?: number | null;
    factor_n2o?: number | null;
    ef_unit?: string;
  };
};

export function calculate(
  product: Product | null,
  quantity: number,
  unit: string,
  customFactor?: number,
): EmissionResult {
  if (!product) {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        co2_kg: 0,
        ch4_kg: 0,
        n2o_kg: 0,
        co2e_kg: 0,
        ef_source: "Custom User Factor",
        ef_details: { scope: "Custom", unit, factor_co2: customFactor, ef_unit: `kg CO2e/${unit}` },
      };
    }

    let multiplier = 1;
    if (unit === "tonne") multiplier = 1000;
    else if (unit === "g") multiplier = 0.001;
    else if (unit === "lbs") multiplier = 0.45359237;
    else if (unit === "MWh") multiplier = 1000;
    else if (unit === "GJ") multiplier = 277.778;
    else if (unit === "mile") multiplier = 1.60934;
    else if (unit === "ton-miles") multiplier = 1.45997;
    else if (unit === "INR") multiplier = 1 / 85;
    else if (unit === "EUR") multiplier = 1.08;
    else if (unit === "GBP") multiplier = 1.28;

    const co2e = quantity * multiplier * (customFactor ?? 0);
    return {
      co2_kg: co2e,
      ch4_kg: 0,
      n2o_kg: 0,
      co2e_kg: co2e,
      ef_source: "Custom User Factor",
      ef_details: { scope: "Custom", unit, factor_co2: customFactor, ef_unit: `kg CO2e/${unit}` },
    };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      co2_kg: 0,
      ch4_kg: 0,
      n2o_kg: 0,
      co2e_kg: 0,
      ef_source: product.source,
      ef_details: { scope: product.scope, unit },
    };
  }

  if (product.scope === "Stationary Combustion") {
    const s = product as StationaryFactor;
    if (unit === "tonne") {
      const qty = quantity * 1000;
      return finalize(
        qty * ((s.co2_per_kg ?? 0) / 1000),
        qty * ((s.ch4_per_kg ?? 0) / 1000),
        qty * ((s.n2o_per_kg ?? 0) / 1000),
        s.source,
        {
          scope: s.scope,
          unit,
          factor_co2: s.co2_per_kg,
          factor_ch4: s.ch4_per_kg,
          factor_n2o: s.n2o_per_kg,
          ef_unit: "kg/tonne",
        },
      );
    }
    if (unit === "kg" || unit === "lbs" || unit === "g") {
      let kgQty = quantity;
      if (unit === "lbs") kgQty = quantity * 0.45359237;
      if (unit === "g") kgQty = quantity / 1000;

      return finalize(
        kgQty * ((s.co2_per_kg ?? 0) / 1000),
        kgQty * ((s.ch4_per_kg ?? 0) / 1000),
        kgQty * ((s.n2o_per_kg ?? 0) / 1000),
        s.source,
        {
          scope: s.scope,
          unit,
          factor_co2: s.co2_per_kg,
          factor_ch4: s.ch4_per_kg,
          factor_n2o: s.n2o_per_kg,
          ef_unit: "kg/tonne",
        },
      );
    }
    if (unit === "litre") {
      return finalize(
        quantity * (s.co2_per_l ?? 0),
        quantity * (s.ch4_per_l ?? 0),
        quantity * (s.n2o_per_l ?? 0),
        s.source,
        {
          scope: s.scope,
          unit,
          factor_co2: s.co2_per_l,
          factor_ch4: s.ch4_per_l,
          factor_n2o: s.n2o_per_l,
          ef_unit: "kg/L",
        },
      );
    }
    if (unit === "m³") {
      return finalize(
        quantity * (s.co2_per_m3 ?? 0),
        quantity * (s.ch4_per_m3 ?? 0),
        quantity * (s.n2o_per_m3 ?? 0),
        s.source,
        {
          scope: s.scope,
          unit,
          factor_co2: s.co2_per_m3,
          factor_ch4: s.ch4_per_m3,
          factor_n2o: s.n2o_per_m3,
          ef_unit: "kg/m³",
        },
      );
    }
    return finalize(0, 0, 0, s.source, {
      scope: s.scope,
      unit,
      factor_co2: 0,
      factor_ch4: 0,
      factor_n2o: 0,
      ef_unit: "unknown",
    });
  }

  if (product.scope === "Electricity") {
    const e = product as SimpleFactor;
    const perKwh = e.ef_value / 1000; // kg CO2 / kWh
    let qty = quantity;
    if (unit === "MWh") qty = quantity * 1000;
    if (unit === "GJ") qty = quantity * 277.778;
    const co2 = qty * perKwh;
    return finalize(co2, 0, 0, e.source, {
      scope: e.scope,
      unit,
      factor_co2: e.ef_value,
      ef_unit: e.ef_unit,
    });
  }

  if (product.scope === "Fugitive Emissions") {
    const r = product as SimpleFactor & { gwp100?: number };
    const gwp = (r as unknown as { gwp100?: number }).gwp100 ?? r.ef_value;
    let kg = quantity;
    if (unit === "g") kg = quantity / 1000;
    if (unit === "tonne") kg = quantity * 1000;
    if (unit === "lbs") kg = quantity * 0.45359237;

    const co2e = kg * gwp;
    return {
      co2_kg: 0,
      ch4_kg: 0,
      n2o_kg: 0,
      co2e_kg: co2e,
      ef_source: r.source,
      ef_details: { scope: r.scope, unit, factor_co2: gwp, ef_unit: "kg CO2e/kg gas" },
    };
  }

  // Mobile / Freight / Travel / Scope 3 SimpleFactors
  const m = product as SimpleFactor;
  const efUnit = m.ef_unit ?? "";

  let multiplier = 1;
  if (unit === "tonne" && efUnit.includes("kg")) multiplier = 1000;
  else if (unit === "g" && efUnit.includes("kg")) multiplier = 0.001;
  else if (unit === "lbs" && efUnit.includes("kg")) multiplier = 0.45359237;
  else if (unit === "MWh" && efUnit.includes("kWh")) multiplier = 1000;
  else if (unit === "GJ" && efUnit.includes("kWh")) multiplier = 277.778;
  else if (unit === "mile" && (efUnit.includes("km") || efUnit.includes("pkm")))
    multiplier = 1.60934;
  else if (unit === "ton-miles" && efUnit.includes("tonne.km")) multiplier = 1.45997;
  else if (unit === "INR" && efUnit.includes("USD")) multiplier = 1 / 85;
  else if (unit === "EUR" && efUnit.includes("USD")) multiplier = 1.08;
  else if (unit === "GBP" && efUnit.includes("USD")) multiplier = 1.28;

  const ef = efUnit.startsWith("g/") ? m.ef_value / 1000 : m.ef_value;
  const co2 = quantity * multiplier * ef;
  return finalize(co2, 0, 0, m.source, {
    scope: m.scope,
    unit,
    factor_co2: m.ef_value,
    ef_unit: m.ef_unit,
  });
}

function finalize(
  co2: number,
  ch4: number,
  n2o: number,
  source: string,
  details: EmissionResult["ef_details"],
): EmissionResult {
  return {
    co2_kg: co2,
    ch4_kg: ch4,
    n2o_kg: n2o,
    co2e_kg: co2 * GWP.CO2 + ch4 * GWP.CH4 + n2o * GWP.N2O,
    ef_source: source,
    ef_details: details,
  };
}

export function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} t`;
  if (kg >= 1) return `${kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
  return `${(kg * 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} g`;
}
