import factorsData from "@/data/emission-factors.json";

// GWP AR5 100-year
export const GWP = { CO2: 1, CH4: 28, N2O: 265 } as const;

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

export type MobileFactor = {
  name: string;
  category: string;
  ef_value: number;
  ef_unit: string;
  source: string;
  scope: "Mobile Combustion";
};

export type ElectricityFactor = {
  name: string;
  category: string;
  ef_value: number; // kg CO2e/MWh
  ef_unit: string;
  source: string;
  scope: "Electricity";
};

const raw = factorsData as unknown as {
  stationary: StationaryFactor[];
  mobile: MobileFactor[];
  electricity: ElectricityFactor[];
};

export const factors = raw;

export const allProducts = [
  ...raw.stationary.map((f) => ({ ...f, scope: "Stationary Combustion" as const })),
  ...raw.mobile.map((f) => ({ ...f, scope: "Mobile Combustion" as const })),
  ...raw.electricity.map((f) => ({ ...f, scope: "Electricity" as const })),
];

export type Product = (typeof allProducts)[number];

export function unitsForProduct(p: Product): string[] {
  if (p.scope === "Stationary Combustion") {
    const s = p as StationaryFactor;
    const units: string[] = [];
    if (s.co2_per_kg != null) units.push("kg", "tonne");
    if (s.co2_per_l != null) units.push("litre");
    if (s.co2_per_m3 != null) units.push("m³");
    return units.length ? units : ["kg"];
  }
  if (p.scope === "Mobile Combustion") {
    const u = (p as MobileFactor).ef_unit.split("/")[1] || "L";
    return [u];
  }
  return ["kWh", "MWh"];
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
    let co2f = 0, ch4f = 0, n2of = 0;
    let qty = quantity;
    if (unit === "tonne") {
      qty = quantity * 1000;
      co2f = s.co2_per_kg ?? 0; ch4f = s.ch4_per_kg ?? 0; n2of = s.n2o_per_kg ?? 0;
      return finalize(qty * (co2f / 1000), qty * (ch4f / 1000), qty * (n2of / 1000), s.source, { scope: s.scope, unit, factor_co2: s.co2_per_kg, factor_ch4: s.ch4_per_kg, factor_n2o: s.n2o_per_kg, ef_unit: "kg/tonne" });
      // factors above are kg gas per tonne; qty in kg → divide by 1000
    }
    if (unit === "kg") {
      co2f = (s.co2_per_kg ?? 0) / 1000;
      ch4f = (s.ch4_per_kg ?? 0) / 1000;
      n2of = (s.n2o_per_kg ?? 0) / 1000;
      return finalize(qty * co2f, qty * ch4f, qty * n2of, s.source, { scope: s.scope, unit, factor_co2: s.co2_per_kg, factor_ch4: s.ch4_per_kg, factor_n2o: s.n2o_per_kg, ef_unit: "kg/tonne" });
    }
    if (unit === "litre") {
      co2f = s.co2_per_l ?? 0; ch4f = s.ch4_per_l ?? 0; n2of = s.n2o_per_l ?? 0;
      return finalize(qty * co2f, qty * ch4f, qty * n2of, s.source, { scope: s.scope, unit, factor_co2: co2f, factor_ch4: ch4f, factor_n2o: n2of, ef_unit: "kg/L" });
    }
    if (unit === "m³") {
      co2f = s.co2_per_m3 ?? 0; ch4f = s.ch4_per_m3 ?? 0; n2of = s.n2o_per_m3 ?? 0;
      return finalize(qty * co2f, qty * ch4f, qty * n2of, s.source, { scope: s.scope, unit, factor_co2: co2f, factor_ch4: ch4f, factor_n2o: n2of, ef_unit: "kg/m³" });
    }
  }
  if (product.scope === "Mobile Combustion") {
    const m = product as MobileFactor;
    // EF given in kg or g per unit
    const ef = m.ef_unit.startsWith("g/") ? m.ef_value / 1000 : m.ef_value;
    const co2 = quantity * ef;
    return finalize(co2, 0, 0, m.source, { scope: m.scope, unit, factor_co2: m.ef_value, ef_unit: m.ef_unit });
  }
  // Electricity
  const e = product as ElectricityFactor;
  const perKwh = e.ef_value / 1000; // kg CO2 / kWh
  const qty = unit === "MWh" ? quantity * 1000 : quantity;
  const co2 = qty * perKwh;
  return finalize(co2, 0, 0, e.source, { scope: e.scope, unit, factor_co2: e.ef_value, ef_unit: e.ef_unit });
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
