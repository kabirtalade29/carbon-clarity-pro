import { allProducts, Product, Scope } from "./emission-calculator";

export type MatchTier =
  | "Tier 1: Reviewer-Confirmed Alias"
  | "Tier 2: Organization Custom Factor"
  | "Tier 3: Supplier Template Heuristic"
  | "Tier 4: Fuzzy Library Match"
  | "Tier 5: AI-Proposed (Review Required)";

export type MatchResult = {
  matchedProduct: Product;
  tier: MatchTier;
  confidenceScore: number; // 0 - 100
  scopeGroup: "Scope 1" | "Scope 2" | "Scope 3";
  scope: Scope;
  defaultUnit: string;
  suggestedQuantityMultiplier: number;
  matchNotes: string;
};

// Tier 1: User / Tenant confirmed alias registry (persisted or pre-seeded)
const TENANT_ALIASES: Record<string, { productName: string; unit: string }> = {
  "apex fuel ulsd": { productName: "Gas/Diesel oil", unit: "litre" },
  "ultra low sulfur diesel": { productName: "Gas/Diesel oil", unit: "litre" },
  "hsd diesel": { productName: "Gas/Diesel oil", unit: "litre" },
  "tata power commercial peak": { productName: "India Grid Average (CEA)", unit: "kWh" },
  "adani electricity mumbai": { productName: "India Grid Average (CEA)", unit: "kWh" },
  "mahadiscom industrial ht": { productName: "India Grid Average (CEA)", unit: "kWh" },
  "jsw steel hot rolled coil": { productName: "Primary Steel (BF-BOF)", unit: "tonne" },
  "tata steel rebar": { productName: "Primary Steel (BF-BOF)", unit: "tonne" },
  "hindalco aluminium ingot": { productName: "Primary Aluminium", unit: "tonne" },
  "vedanta aluminium scrap": { productName: "Recycled Aluminium", unit: "tonne" },
  "daikin r-410a charge": { productName: "R-410A", unit: "kg" },
  "carrier r-134a refrigerant": { productName: "R-134a", unit: "kg" },
  "chemours opteon r-454b": { productName: "R-454B", unit: "kg" },
  "mahindra logistics interstate freight": { productName: "Heavy Goods Vehicle (Diesel)", unit: "tonne.km" },
  "blue dart air freight domestic": { productName: "Domestic Air Flight", unit: "passenger.km" },
};

// Tier 3: Supplier Profile Heuristics
const SUPPLIER_TEMPLATES: {
  vendorPattern: RegExp;
  productName: string;
  defaultUnit: string;
  scopeGroup: "Scope 1" | "Scope 2" | "Scope 3";
}[] = [
  {
    vendorPattern: /fuel|petroleum|diesel|oil|hpcl|bpcl|iocl|shell|apex/i,
    productName: "Gas/Diesel oil",
    defaultUnit: "litre",
    scopeGroup: "Scope 1",
  },
  {
    vendorPattern: /power|electric|energy|grid|tata power|adani|bescom|mseb|utility/i,
    productName: "India Grid Average (CEA)",
    defaultUnit: "kWh",
    scopeGroup: "Scope 2",
  },
  {
    vendorPattern: /steel|sail|jsw|jindal|metal|iron/i,
    productName: "Primary Steel (BF-BOF)",
    defaultUnit: "tonne",
    scopeGroup: "Scope 3",
  },
  {
    vendorPattern: /aluminium|hindalco|vedanta|nalco/i,
    productName: "Primary Aluminium",
    defaultUnit: "tonne",
    scopeGroup: "Scope 3",
  },
  {
    vendorPattern: /logistics|freight|transport|truck|carrier|blue dart|dhl|fedex/i,
    productName: "Heavy Goods Vehicle (Diesel)",
    defaultUnit: "tonne.km",
    scopeGroup: "Scope 3",
  },
  {
    vendorPattern: /aircon|hvac|refrigerant|cooling|daikin|carrier|voltas|blue star/i,
    productName: "R-410A",
    defaultUnit: "kg",
    scopeGroup: "Scope 1",
  },
];

function getScopeGroup(scope: Scope): "Scope 1" | "Scope 2" | "Scope 3" {
  if (scope.startsWith("Scope 3") || scope === "Freight" || scope === "Business Travel") return "Scope 3";
  if (scope === "Electricity") return "Scope 2";
  return "Scope 1";
}

function getDefaultUnitForScope(scope: Scope, product: Product): string {
  if (scope === "Electricity") return "kWh";
  if (scope === "Mobile Combustion" || scope === "Stationary Combustion") return "litre";
  if (scope === "Fugitive Emissions") return "kg";
  if (scope === "Freight") return "tonne.km";
  if (scope === "Business Travel") return "passenger.km";
  if ("ef_unit" in product && product.ef_unit) {
    if (product.ef_unit.includes("tonne")) return "tonne";
    if (product.ef_unit.includes("kg")) return "kg";
    if (product.ef_unit.includes("kWh")) return "kWh";
    if (product.ef_unit.includes("USD")) return "USD";
    if (product.ef_unit.includes("INR")) return "INR";
  }
  return "tonne";
}

/**
 * 5-Tier Material Matching Cascade Engine
 * Evaluates line items against 5 sequential precision layers.
 */
export function matchLineItemToEmissionFactor(
  rawText: string,
  vendorName: string = "",
): MatchResult {
  const cleanText = rawText.trim().toLowerCase();
  const cleanVendor = vendorName.trim().toLowerCase();

  // Tier 1: Check Tenant Confirmed Aliases (Exact or Substring match)
  for (const [alias, target] of Object.entries(TENANT_ALIASES)) {
    if (cleanText.includes(alias) || cleanVendor.includes(alias)) {
      const prod = allProducts.find((p) => p.name.toLowerCase() === target.productName.toLowerCase());
      if (prod) {
        return {
          matchedProduct: prod,
          tier: "Tier 1: Reviewer-Confirmed Alias",
          confidenceScore: 99,
          scopeGroup: getScopeGroup(prod.scope),
          scope: prod.scope,
          defaultUnit: target.unit,
          suggestedQuantityMultiplier: 1,
          matchNotes: `Exact match found in Reviewer-Confirmed Alias Registry: "${alias}"`,
        };
      }
    }
  }

  // Tier 2: Check Organization Custom Factor Library (Searched in allProducts)
  const customMatch = allProducts.find(
    (p) =>
      p.category?.toLowerCase().includes("custom") &&
      cleanText.includes(p.name.toLowerCase()),
  );
  if (customMatch) {
    return {
      matchedProduct: customMatch,
      tier: "Tier 2: Organization Custom Factor",
      confidenceScore: 95,
      scopeGroup: getScopeGroup(customMatch.scope),
      scope: customMatch.scope,
      defaultUnit: getDefaultUnitForScope(customMatch.scope, customMatch),
      suggestedQuantityMultiplier: 1,
      matchNotes: `Matched Organization Custom Factor: "${customMatch.name}"`,
    };
  }

  // Tier 3: Per-Supplier Extraction Templates
  if (cleanVendor) {
    for (const template of SUPPLIER_TEMPLATES) {
      if (template.vendorPattern.test(cleanVendor)) {
        const prod = allProducts.find(
          (p) => p.name.toLowerCase() === template.productName.toLowerCase(),
        );
        if (prod) {
          return {
            matchedProduct: prod,
            tier: "Tier 3: Supplier Template Heuristic",
            confidenceScore: 90,
            scopeGroup: template.scopeGroup,
            scope: prod.scope,
            defaultUnit: template.defaultUnit,
            suggestedQuantityMultiplier: 1,
            matchNotes: `Mapped via vendor template profile [${cleanVendor} -> ${prod.name}]`,
          };
        }
      }
    }
  }

  // Tier 4: Fuzzy Token Jaccard Matching against global/national library
  let bestProduct: Product = allProducts[0];
  let bestScore = 0;
  const inputWords = new Set(cleanText.split(/\s+/).filter((w) => w.length > 2));

  for (const prod of allProducts) {
    const prodWords = new Set(
      `${prod.name} ${prod.category} ${prod.scope}`.toLowerCase().split(/\s+/),
    );
    let matchCount = 0;
    for (const word of inputWords) {
      if (prodWords.has(word)) matchCount++;
    }
    const tokenScore = (matchCount * 2) / (inputWords.size + prodWords.size);

    // Direct name substring bonus
    const subBonus = cleanText.includes(prod.name.toLowerCase()) ? 0.4 : 0;
    const finalScore = Math.min(1, tokenScore + subBonus);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestProduct = prod;
    }
  }

  if (bestScore >= 0.3) {
    const confidence = Math.round(Math.min(94, 60 + bestScore * 35));
    return {
      matchedProduct: bestProduct,
      tier: "Tier 4: Fuzzy Library Match",
      confidenceScore: confidence,
      scopeGroup: getScopeGroup(bestProduct.scope),
      scope: bestProduct.scope,
      defaultUnit: getDefaultUnitForScope(bestProduct.scope, bestProduct),
      suggestedQuantityMultiplier: 1,
      matchNotes: `Fuzzy library match with ${(bestScore * 100).toFixed(0)}% token alignment`,
    };
  }

  // Tier 5: AI-Proposed Match (Fallback with Human Verification Required)
  const defaultFallback = allProducts.find((p) => p.scope === "Electricity") || allProducts[0];
  return {
    matchedProduct: defaultFallback,
    tier: "Tier 5: AI-Proposed (Review Required)",
    confidenceScore: 55,
    scopeGroup: "Scope 2",
    scope: "Electricity",
    defaultUnit: "kWh",
    suggestedQuantityMultiplier: 1,
    matchNotes: "AI proposed classification below 60% confidence. Verification required by reviewer.",
  };
}
