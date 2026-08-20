import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SUBSTANCES, type Substance, type GasGroup } from "@/lib/gwp-odp-data";
import {
  downloadGwpOdpReport,
  type GwpOdpItem,
  type GwpOdpFamilySummary,
  type MultiGwpOdpReportData,
} from "@/lib/pdf-report";
import { toast } from "sonner";
import { Download, Trash2, Plus, Layers, Wind, Filter, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/gwp-odp")({
  head: () => ({
    meta: [
      { title: "GWP-ODP Calculator — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GwpOdpPage,
});

type BlendComponent = {
  id: string;
  name: string;
  percentage: number;
};

// Mass unit helper to convert to kilograms
const massToKg = (q: number, u: string): number => {
  switch (u) {
    case "g":
      return q / 1000;
    case "lbs":
      return q * 0.45359237;
    case "tonnes":
      return q * 1000;
    default:
      return q; // kg
  }
};

function GwpOdpPage() {
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState("");
  const [facility, setFacility] = useState("");

  // Multi-substance Assessment Inventory List
  const [inventoryItems, setInventoryItems] = useState<GwpOdpItem[]>([
    {
      id: "init-1",
      name: "R-134a",
      chemicalName: "1,1,1,2-Tetrafluoroethane",
      formula: "CH2FCF3",
      group: "HFCs",
      quantity: 500,
      unit: "kg",
      odp: 0,
      gwpAR4: 1430,
      gwpAR5: 1300,
      gwpAR6: 1530,
      odpEquivalent: 0,
      co2eAR4: 0.715,
      co2eAR5: 0.65,
      co2eAR6: 0.765,
    },
    {
      id: "init-2",
      name: "R-22 (HCFC-22)",
      chemicalName: "Chlorodifluoromethane",
      formula: "CHClF2",
      group: "HCFCs",
      quantity: 1.2,
      unit: "tonnes",
      odp: 0.055,
      gwpAR4: 1810,
      gwpAR5: 1760,
      gwpAR6: 1960,
      odpEquivalent: 0.066,
      co2eAR4: 2.172,
      co2eAR5: 2.112,
      co2eAR6: 2.352,
    },
  ]);

  // Pure Substance selector states
  const [selectedSubstanceName, setSelectedSubstanceName] = useState<string>("R-134a");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [pureQuantity, setPureQuantity] = useState<string>("100");
  const [pureUnit, setPureUnit] = useState<string>("kg");

  // Custom Blend Builder states
  const [blendName, setBlendName] = useState("Custom R-454B Replacement Blend");
  const [blendComponents, setBlendComponents] = useState<BlendComponent[]>([
    { id: "1", name: "R-32", percentage: 68.9 },
    { id: "2", name: "HFO-1234yf", percentage: 31.1 },
  ]);
  const [newCompName, setNewCompName] = useState<string>("R-125");
  const [newCompPct, setNewCompPct] = useState<string>("0");
  const [blendQuantity, setBlendQuantity] = useState<string>("250");
  const [blendUnit, setBlendUnit] = useState<string>("kg");

  // Filter pure substances dynamically
  const filteredSubstances = useMemo(() => {
    return SUBSTANCES.filter((sub) => {
      const matchesGroup = selectedGroup === "All" || sub.group === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.chemicalName.toLowerCase().includes(q) ||
        sub.formula.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [selectedGroup, searchQuery]);

  // Keep selectedSubstanceName in sync with filtered list
  useEffect(() => {
    if (filteredSubstances.length > 0) {
      const exists = filteredSubstances.some((s) => s.name === selectedSubstanceName);
      if (!exists) {
        setSelectedSubstanceName(filteredSubstances[0].name);
      }
    }
  }, [filteredSubstances, selectedSubstanceName]);

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    const matching = SUBSTANCES.filter((sub) => group === "All" || sub.group === group);
    if (matching.length > 0) {
      setSelectedSubstanceName(matching[0].name);
    }
  };

  const activeSubstance = useMemo(() => {
    return (
      filteredSubstances.find((s) => s.name === selectedSubstanceName) ||
      filteredSubstances[0] ||
      SUBSTANCES[0]
    );
  }, [filteredSubstances, selectedSubstanceName]);

  // Add Pure Substance to Inventory
  const handleAddPureToInventory = () => {
    const qtyNum = Number(pureQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    const targetSubstance = activeSubstance;
    const kg = massToKg(qtyNum, pureUnit);
    const tonnes = kg / 1000;

    const newItem: GwpOdpItem = {
      id: crypto.randomUUID(),
      name: targetSubstance.name,
      chemicalName: targetSubstance.chemicalName,
      formula: targetSubstance.formula,
      group: targetSubstance.group,
      quantity: qtyNum,
      unit: pureUnit,
      odp: targetSubstance.odp,
      gwpAR4: targetSubstance.gwpAR4,
      gwpAR5: targetSubstance.gwpAR5,
      gwpAR6: targetSubstance.gwpAR6,
      odpEquivalent: tonnes * targetSubstance.odp,
      co2eAR4: tonnes * targetSubstance.gwpAR4,
      co2eAR5: tonnes * targetSubstance.gwpAR5,
      co2eAR6: tonnes * targetSubstance.gwpAR6,
    };

    setInventoryItems((prev) => [...prev, newItem]);
    toast.success(`Added ${targetSubstance.name} (${qtyNum} ${pureUnit}) to Assessment Inventory`);
  };

  // Blend Builder Calculations
  const remainingPercentage = useMemo(() => {
    return Math.max(0, 100 - blendComponents.reduce((sum, item) => sum + item.percentage, 0));
  }, [blendComponents]);

  const handleAddBlendComponent = () => {
    const pctNum = Number(newCompPct);
    if (isNaN(pctNum) || pctNum <= 0 || pctNum > remainingPercentage) {
      toast.error(`Please enter valid percentage between 0% and ${remainingPercentage}%`);
      return;
    }

    if (blendComponents.some((c) => c.name === newCompName)) {
      toast.error(`${newCompName} is already in the blend list.`);
      return;
    }

    setBlendComponents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newCompName, percentage: pctNum },
    ]);
    toast.success(`${newCompName} added to blend`);
    setNewCompPct("0");
  };

  const handleRemoveBlendComponent = (id: string) => {
    setBlendComponents((prev) => prev.filter((c) => c.id !== id));
    toast.success("Component removed");
  };

  const customBlendComputed = useMemo(() => {
    const totalPct = blendComponents.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPct === 0) {
      return { odp: 0, gwpAR4: 0, gwpAR5: 0, gwpAR6: 0 };
    }

    let odp = 0,
      gwpAR4 = 0,
      gwpAR5 = 0,
      gwpAR6 = 0;
    blendComponents.forEach((comp) => {
      const frac = comp.percentage / totalPct;
      const sub = SUBSTANCES.find((s) => s.name === comp.name);
      if (sub) {
        odp += sub.odp * frac;
        gwpAR4 += sub.gwpAR4 * frac;
        gwpAR5 += sub.gwpAR5 * frac;
        gwpAR6 += sub.gwpAR6 * frac;
      }
    });

    return { odp, gwpAR4, gwpAR5, gwpAR6, totalPct };
  }, [blendComponents]);

  // Add Custom Blend to Inventory
  const handleAddBlendToInventory = () => {
    const qtyNum = Number(blendQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid quantity for the custom blend");
      return;
    }
    if (blendComponents.length === 0) {
      toast.error("Please add at least 1 component to your blend");
      return;
    }

    const kg = massToKg(qtyNum, blendUnit);
    const tonnes = kg / 1000;

    const newItem: GwpOdpItem = {
      id: crypto.randomUUID(),
      name: blendName || "Custom Refrigerant Blend",
      chemicalName: "Multi-Substance Custom Blend",
      formula: blendComponents.map((c) => `${c.name} (${c.percentage}%)`).join(" + "),
      group: "Custom Blend",
      quantity: qtyNum,
      unit: blendUnit,
      odp: customBlendComputed.odp,
      gwpAR4: Math.round(customBlendComputed.gwpAR4),
      gwpAR5: Math.round(customBlendComputed.gwpAR5),
      gwpAR6: Math.round(customBlendComputed.gwpAR6),
      odpEquivalent: tonnes * customBlendComputed.odp,
      co2eAR4: tonnes * customBlendComputed.gwpAR4,
      co2eAR5: tonnes * customBlendComputed.gwpAR5,
      co2eAR6: tonnes * customBlendComputed.gwpAR6,
      composition: blendComponents.map((c) => ({
        name: c.name,
        percentage: c.percentage,
        quantity: kg * (c.percentage / 100),
      })),
    };

    setInventoryItems((prev) => [...prev, newItem]);
    toast.success(`Added "${newItem.name}" (${qtyNum} ${blendUnit}) to Assessment Inventory`);
  };

  const handleRemoveInventoryItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed from inventory");
  };

  // 3-TIER REPORTING COMPUTATIONS
  // Tier 1: Single Substance-Wise List (inventoryItems)

  // Tier 2: Gas Family-Wise Aggregated Summary
  const familySummaries = useMemo<GwpOdpFamilySummary[]>(() => {
    const map = new Map<string, GwpOdpFamilySummary>();

    inventoryItems.forEach((item) => {
      const fam = item.group;
      const kg = massToKg(item.quantity, item.unit);

      const existing = map.get(fam) || {
        family: fam,
        itemCount: 0,
        totalQuantityKg: 0,
        totalOdpEq: 0,
        totalCo2eAR4: 0,
        totalCo2eAR5: 0,
        totalCo2eAR6: 0,
      };

      existing.itemCount += 1;
      existing.totalQuantityKg += kg;
      existing.totalOdpEq += item.odpEquivalent;
      existing.totalCo2eAR4 += item.co2eAR4;
      existing.totalCo2eAR5 += item.co2eAR5;
      existing.totalCo2eAR6 += item.co2eAR6;

      map.set(fam, existing);
    });

    return Array.from(map.values());
  }, [inventoryItems]);

  // Tier 3: Overall Consolidated Totals
  const overallTotals = useMemo(() => {
    let totalQuantityKg = 0;
    let totalOdpEq = 0;
    let totalCo2eAR4 = 0;
    let totalCo2eAR5 = 0;
    let totalCo2eAR6 = 0;

    inventoryItems.forEach((item) => {
      totalQuantityKg += massToKg(item.quantity, item.unit);
      totalOdpEq += item.odpEquivalent;
      totalCo2eAR4 += item.co2eAR4;
      totalCo2eAR5 += item.co2eAR5;
      totalCo2eAR6 += item.co2eAR6;
    });

    return {
      totalItems: inventoryItems.length,
      totalQuantityKg,
      totalOdpEq,
      totalCo2eAR4,
      totalCo2eAR5,
      totalCo2eAR6,
    };
  }, [inventoryItems]);

  // Download PDF Report
  const handleDownloadPDF = async () => {
    if (inventoryItems.length === 0) {
      toast.error("Please add at least one gas item to your inventory first");
      return;
    }

    const reportData: MultiGwpOdpReportData = {
      id: crypto.randomUUID(),
      reportName: "Multi-Gas Refrigerant GWP & ODP Assessment",
      companyName: company || "Corporate Operations",
      facility: facility || "Main Facility Site",
      userName: "Sustainability Manager",
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      notes:
        notes ||
        "3-Tier GWP-ODP assessment report generated under Kigali Amendment & Montreal Protocol standards.",
      items: inventoryItems,
      familySummaries,
      overall: overallTotals,
    };

    try {
      await downloadGwpOdpReport(reportData);
      toast.success("Downloaded 3-Tier GWP-ODP Assessment Report PDF");
    } catch {
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4 border-b pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Refrigerants & Fugitive Gases Assessment
          </p>
          <h1 className="mt-1 font-display text-4xl flex items-center gap-3 font-extrabold text-foreground">
            <Wind className="h-9 w-9 text-sky-600" /> Multi-Substance GWP-ODP Calculator
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            Add unlimited pure substances & custom blends across all gas families (CFCs, HCFCs,
            HFCs, PFCs, HFOs, Naturals). Generate 3-tier reports: Single Substance-Wise,
            Family-Wise, and Overall Consolidated.
          </p>
        </div>

        <Button
          onClick={handleDownloadPDF}
          disabled={inventoryItems.length === 0}
          className="gap-2 font-bold"
        >
          <Download className="h-4 w-4" /> Download 3-Tier Report PDF
        </Button>
      </div>

      {/* OVERALL CONSOLIDATED SUMMARY CARDS (TIER 3) */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="p-5 rounded-2xl border-primary/20 bg-primary/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Inventory Gas Mass
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-foreground">
            {(overallTotals.totalQuantityKg / 1000).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-normal text-muted-foreground">Tonnes</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {overallTotals.totalQuantityKg.toLocaleString()} kg total mass
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-amber-500/30 bg-amber-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-extrabold">
            Total ODP Impact
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-amber-950">
            {overallTotals.totalOdpEq.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            <span className="text-sm font-normal text-amber-800">t ODP eq</span>
          </p>
          <p className="mt-1 text-xs text-amber-800 font-medium">
            Montreal Protocol Ozone Equivalent
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-emerald-500/30 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-extrabold">
            Total Global Warming (AR5)
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-emerald-950">
            {overallTotals.totalCo2eAR5.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
            <span className="text-sm font-normal text-emerald-800">t CO₂e</span>
          </p>
          <p className="mt-1 text-xs text-emerald-800 font-medium">
            AR6:{" "}
            {overallTotals.totalCo2eAR6.toLocaleString(undefined, { maximumFractionDigits: 2 })} t
            CO₂e
          </p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Active Gases
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-primary">
            {overallTotals.totalItems}{" "}
            <span className="text-sm font-normal text-muted-foreground">Substances</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {familySummaries.length} Gas Families Covered
          </p>
        </Card>
      </div>

      {/* MAIN GAS ENTRY TABS */}
      <Tabs defaultValue="add-pure" className="space-y-6 mb-8">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="add-pure" className="gap-2 text-xs font-semibold">
            <Wind className="h-4 w-4 text-sky-600" /> Add Pure Substance (CFCs, HCFCs, HFCs, PFCs,
            Naturals)
          </TabsTrigger>
          <TabsTrigger value="add-blend" className="gap-2 text-xs font-semibold">
            <Layers className="h-4 w-4 text-purple-600" /> Add Custom Blend Builder
          </TabsTrigger>
          <TabsTrigger value="assessment-report" className="gap-2 text-xs font-semibold">
            <FileText className="h-4 w-4 text-primary" /> View 3-Tier Assessment Report (
            {inventoryItems.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ADD PURE SUBSTANCES */}
        <TabsContent value="add-pure">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2 font-bold text-primary">
              <Plus className="h-5 w-5" /> Select Pure Substance & Add Mass to Inventory
            </h2>

            {/* Quick Family Filter Badges */}
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Family Filter:
              </span>
              {["All", "CFCs", "HCFCs", "HFCs", "PFCs", "HFC Blends", "Naturals & Others"].map(
                (g) => (
                  <button
                    key={g}
                    onClick={() => handleGroupSelect(g)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                      selectedGroup === g
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {g}
                  </button>
                ),
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-5">
              <div className="md:col-span-2">
                <Label>Search Gas / Refrigerant (by R-Number, Chemical Name, or Formula)</Label>
                <Input
                  placeholder="e.g. R-134a, R-22, PFC-14, CH2FCF3..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Label>Select Substance ({filteredSubstances.length} Available)</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedSubstanceName}
                  onChange={(e) => setSelectedSubstanceName(e.target.value)}
                >
                  {filteredSubstances.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.chemicalName}) — {s.group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Substance Quick Preview Card */}
            {activeSubstance && (
              <div className="p-4 rounded-xl bg-muted/40 border mb-5 grid gap-4 md:grid-cols-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold">Formula:</span>
                  <p className="font-bold text-sm text-foreground">{activeSubstance.formula}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Gas Family:</span>
                  <p className="font-bold text-sm text-primary">{activeSubstance.group}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">ODP Factor:</span>
                  <p className="font-bold text-sm text-amber-700">{activeSubstance.odp}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">GWP (AR5 100yr):</span>
                  <p className="font-bold text-sm text-emerald-700">
                    {activeSubstance.gwpAR5} × CO₂
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div>
                <Label>Quantity / Mass</Label>
                <Input
                  type="number"
                  min="0"
                  value={pureQuantity}
                  onChange={(e) => setPureQuantity(e.target.value)}
                />
              </div>

              <div>
                <Label>Mass Unit</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={pureUnit}
                  onChange={(e) => setPureUnit(e.target.value)}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tonnes">Metric Tonnes (t)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="g">Grams (g)</option>
                </select>
              </div>

              <Button onClick={handleAddPureToInventory} className="font-bold">
                <Plus className="mr-2 h-4 w-4" /> Add Pure Substance to Inventory
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: ADD CUSTOM BLENDS */}
        <TabsContent value="add-blend">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2 font-bold text-primary">
              <Layers className="h-5 w-5 text-purple-600" /> Custom Refrigerant Blend Builder
            </h2>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <Label>Custom Blend Name</Label>
                <Input
                  placeholder="e.g. Facility Chiller Custom Mixture B"
                  value={blendName}
                  onChange={(e) => setBlendName(e.target.value)}
                />
              </div>

              <div>
                <Label>Add Component Substance</Label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                  >
                    {SUBSTANCES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.group})
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="%"
                    value={newCompPct}
                    onChange={(e) => setNewCompPct(e.target.value)}
                  />
                  <Button onClick={handleAddBlendComponent} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Blend Component Badges */}
            <div className="p-4 rounded-xl border bg-muted/20 mb-5">
              <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                <span>Blend Chemical Composition ({blendComponents.length} Components)</span>
                <span
                  className={
                    remainingPercentage === 0 ? "text-emerald-700 font-bold" : "text-amber-700"
                  }
                >
                  {remainingPercentage === 0
                    ? "✓ 100% Complete"
                    : `${remainingPercentage}% Remaining`}
                </span>
              </div>

              {blendComponents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No components added yet. Add components above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blendComponents.map((c) => (
                    <span
                      key={c.id}
                      className="px-3 py-1 rounded-lg bg-card border text-xs font-bold flex items-center gap-2"
                    >
                      {c.name}: {c.percentage}%
                      <button
                        onClick={() => handleRemoveBlendComponent(c.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div>
                <Label>Blend Mass Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={blendQuantity}
                  onChange={(e) => setBlendQuantity(e.target.value)}
                />
              </div>

              <div>
                <Label>Mass Unit</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={blendUnit}
                  onChange={(e) => setBlendUnit(e.target.value)}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tonnes">Metric Tonnes (t)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="g">Grams (g)</option>
                </select>
              </div>

              <Button
                onClick={handleAddBlendToInventory}
                className="font-bold bg-purple-700 hover:bg-purple-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Custom Blend to Inventory
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: VIEW 3-TIER ASSESSMENT REPORT */}
        <TabsContent value="assessment-report" className="space-y-6">
          {/* TIER 1: SINGLE SUBSTANCE-WISE BREAKDOWN TABLE */}
          <Card className="p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-5 w-5" /> 1. Single Substance-Wise Detailed Breakdown
              </h2>
              <span className="text-xs font-semibold text-muted-foreground">
                {inventoryItems.length} Substances Registered
              </span>
            </div>

            {inventoryItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No substances in assessment inventory. Use the tabs above to add pure gases or
                custom blends.
              </p>
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y font-medium">
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="p-3 font-bold text-foreground">{item.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {item.group}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 text-right text-amber-700">{item.odp}</td>
                        <td className="p-3 text-right font-bold text-amber-900">
                          {item.odpEquivalent.toFixed(4)} t
                        </td>
                        <td className="p-3 text-right font-bold">{item.gwpAR5}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-600">
                          {item.co2eAR5.toLocaleString(undefined, { maximumFractionDigits: 2 })} t
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveInventoryItem(item.id)}
                            className="text-red-500 hover:text-red-700 h-7 w-7"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* TIER 2: GAS FAMILY-WISE AGGREGATED SUMMARY */}
          <Card className="p-6 rounded-2xl">
            <h2 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5" /> 2. Gas Family-Wise Aggregated Summary
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              {familySummaries.map((fam) => (
                <div key={fam.family} className="p-4 rounded-xl border bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {fam.family}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {fam.itemCount} Items
                    </span>
                  </div>
                  <div className="space-y-1 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Mass:</span>
                      <span className="font-bold">{fam.totalQuantityKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total ODP Eq:</span>
                      <span className="font-bold text-amber-700">
                        {fam.totalOdpEq.toFixed(4)} t ODP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total CO₂e (AR5):</span>
                      <span className="font-extrabold text-emerald-600">
                        {fam.totalCo2eAR5.toLocaleString(undefined, { maximumFractionDigits: 2 })} t
                        CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
