import factorsData from "@/data/emission-factors.json";

// GWP AR5 100-year (used to combine CO2/CH4/N2O for combustion)
export const GWP = { CO2: 1, CH4: 28, N2O: 265 } as const;

export type Scope =
  | "Stationary Combustion"
  | "Mobile Combustion"
  | "Electricity"
  | "Freight"
  | "Business Travel"
  | "Fugitive Emissions";

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

export const allProducts = [
  ...raw.stationary.map((f) => ({ ...f, scope: "Stationary Combustion" as const })),
  ...raw.mobile.map((f) => ({ ...f, scope: "Mobile Combustion" as const })),
  ...raw.electricity.map((f) => ({ ...f, scope: "Electricity" as const })),
  ...raw.freight.map((f) => ({ ...f, scope: "Freight" as const })),
  ...raw.travel.map((f) => ({ ...f, scope: "Business Travel" as const })),
  ...raw.refrigerant.map((f) => ({ ...f, scope: "Fugitive Emissions" as const })),
];

export type Product = (typeof allProducts)[number];

export const SCOPES: { value: Scope; label: string; hint: string }[] = [
  { value: "Stationary Combustion", label: "Stationary Combustion", hint: "Scope 1" },
  { value: "Mobile Combustion", label: "Mobile Combustion", hint: "Scope 1" },
  { value: "Fugitive Emissions", label: "Fugitive — Refrigerants & Gases", hint: "Scope 1" },
  { value: "Electricity", label: "Purchased Electricity", hint: "Scope 2" },
  { value: "Freight", label: "Freight & Logistics", hint: "Scope 3" },
  { value: "Business Travel", label: "Business Travel & Commuting", hint: "Scope 3" },
];

export function unitsForProduct(p: Product): string[] {
  if (p.scope === "Stationary Combustion") {
    const s = p as StationaryFactor;
    const units: string[] = [];
    if (s.co2_per_kg != null) units.push("kg", "tonne");
    if (s.co2_per_l != null) units.push("litre");
    if (s.co2_per_m3 != null) units.push("m³");
    return units.length ? units : ["kg"];
  }
  if (p.scope === "Electricity") return ["kWh", "MWh"];
  if (p.scope === "Fugitive Emissions") return ["kg", "g"];
  // Mobile / Freight / Travel — unit is the denominator of ef_unit
  const denom = (p as SimpleFactor).ef_unit.split("/")[1]?.trim() || "L";
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

export function calculate(product: Product, quantity: number, unit: string): EmissionResult {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      co2_kg: 0, ch4_kg: 0, n2o_kg: 0, co2e_kg: 0,
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
        { scope: s.scope, unit, factor_co2: s.co2_per_kg, factor_ch4: s.ch4_per_kg, factor_n2o: s.n2o_per_kg, ef_unit: "kg/tonne" },
      );
    }
    if (unit === "kg") {
      return finalize(
        quantity * ((s.co2_per_kg ?? 0) / 1000),
        quantity * ((s.ch4_per_kg ?? 0) / 1000),
        quantity * ((s.n2o_per_kg ?? 0) / 1000),
        s.source,
        { scope: s.scope, unit, factor_co2: s.co2_per_kg, factor_ch4: s.ch4_per_kg, factor_n2o: s.n2o_per_kg, ef_unit: "kg/tonne" },
      );
    }
    if (unit === "litre") {
      return finalize(
        quantity * (s.co2_per_l ?? 0),
        quantity * (s.ch4_per_l ?? 0),
        quantity * (s.n2o_per_l ?? 0),
        s.source,
        { scope: s.scope, unit, factor_co2: s.co2_per_l, factor_ch4: s.ch4_per_l, factor_n2o: s.n2o_per_l, ef_unit: "kg/L" },
      );
    }
    if (unit === "m³") {
      return finalize(
        quantity * (s.co2_per_m3 ?? 0),
        quantity * (s.ch4_per_m3 ?? 0),
        quantity * (s.n2o_per_m3 ?? 0),
        s.source,
        { scope: s.scope, unit, factor_co2: s.co2_per_m3, factor_ch4: s.ch4_per_m3, factor_n2o: s.n2o_per_m3, ef_unit: "kg/m³" },
      );
    }
  }

  if (product.scope === "Electricity") {
    const e = product as SimpleFactor;
    const perKwh = e.ef_value / 1000; // kg CO2 / kWh
    const qty = unit === "MWh" ? quantity * 1000 : quantity;
    const co2 = qty * perKwh;
    return finalize(co2, 0, 0, e.source, { scope: e.scope, unit, factor_co2: e.ef_value, ef_unit: e.ef_unit });
  }

  if (product.scope === "Fugitive Emissions") {
    const r = product as SimpleFactor & { gwp100?: number };
    const gwp = (r as unknown as { gwp100?: number }).gwp100 ?? r.ef_value;
    const kg = unit === "g" ? quantity / 1000 : quantity;
    const co2e = kg * gwp;
    return {
      co2_kg: 0, ch4_kg: 0, n2o_kg: 0, co2e_kg: co2e,
      ef_source: r.source,
      ef_details: { scope: r.scope, unit, factor_co2: gwp, ef_unit: "kg CO2e/kg gas" },
    };
  }

  // Mobile / Freight / Travel — single-gas EF applied directly to quantity
  const m = product as SimpleFactor;
  const ef = m.ef_unit.startsWith("g/") ? m.ef_value / 1000 : m.ef_value;
  const co2 = quantity * ef;
  return finalize(co2, 0, 0, m.source, { scope: m.scope, unit, factor_co2: m.ef_value, ef_unit: m.ef_unit });
}

function finalize(co2: number, ch4: number, n2o: number, source: string, details: EmissionResult["ef_details"]): EmissionResult {
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
