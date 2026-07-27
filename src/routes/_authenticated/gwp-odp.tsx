import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSTANCES, type Substance, type GasGroup } from "@/lib/gwp-odp-data";
import { downloadGwpOdpReport } from "@/lib/pdf-report";
import { toast } from "sonner";
import {
  Download,
  Trash2,
  Plus,
  Layers,
  Info,
  TrendingUp,
  Wind,
  AlertTriangle,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/gwp-odp")({
  head: () => ({
    meta: [{ title: "GWP-ODP Calculator — Carbonly" }, { name: "robots", content: "noindex" }],
  }),
  component: GwpOdpPage,
});

type Mode = "pure" | "blend";

type BlendComponent = {
  id: string;
  name: string;
  percentage: number; // e.g. 50%
};

function GwpOdpPage() {
  const [mode, setMode] = useState<Mode>("pure");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState("");
  const [facility, setFacility] = useState("");

  // Pure Substance states
  const [selectedSubstanceName, setSelectedSubstanceName] = useState<string>("R-134a");
  const [quantity, setQuantity] = useState<string>("100");
  const [unit, setUnit] = useState<string>("kg");

  // Custom Blend states
  const [blendName, setBlendName] = useState("My Custom Refrigerant Blend");
  const [blendComponents, setBlendComponents] = useState<BlendComponent[]>([]);
  const [newCompName, setNewCompName] = useState<string>("R-32");
  const [newCompPct, setNewCompPct] = useState<string>("50");
  const [blendQuantity, setBlendQuantity] = useState<string>("100");
  const [blendUnit, setBlendUnit] = useState<string>("kg");

  // Multiplier for mass units to convert to kilograms
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

  // Pure Substance Computations
  const activeSubstance = useMemo(() => {
    return SUBSTANCES.find((s) => s.name === selectedSubstanceName) || SUBSTANCES[0];
  }, [selectedSubstanceName]);

  const pureCalculation = useMemo(() => {
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return { odpEq: 0, co2eAR4: 0, co2eAR5: 0, co2eAR6: 0 };

    const kg = massToKg(qtyNum, unit);
    const tonnesSubstance = kg / 1000;

    return {
      odpEq: tonnesSubstance * activeSubstance.odp,
      co2eAR4: tonnesSubstance * activeSubstance.gwpAR4,
      co2eAR5: tonnesSubstance * activeSubstance.gwpAR5,
      co2eAR6: tonnesSubstance * activeSubstance.gwpAR6,
    };
  }, [quantity, unit, activeSubstance]);

  // Blend Builder Computations
  const remainingPercentage = useMemo(() => {
    return 100 - blendComponents.reduce((sum, item) => sum + item.percentage, 0);
  }, [blendComponents]);

  const handleAddComponent = () => {
    const pctNum = Number(newCompPct);
    if (isNaN(pctNum) || pctNum <= 0 || pctNum > remainingPercentage) {
      toast.error(`Please enter a valid percentage between 0% and ${remainingPercentage}%`);
      return;
    }

    const existing = blendComponents.find((c) => c.name === newCompName);
    if (existing) {
      toast.error(`${newCompName} is already in the blend list.`);
      return;
    }

    setBlendComponents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newCompName, percentage: pctNum },
    ]);
    toast.success(`${newCompName} added to blend`);

    // Auto adjust next components input percentage
    const nextPct =
      100 - (blendComponents.reduce((sum, item) => sum + item.percentage, 0) + pctNum);
    setNewCompPct(nextPct > 0 ? nextPct.toString() : "0");
  };

  const handleRemoveComponent = (id: string) => {
    setBlendComponents((prev) => prev.filter((c) => c.id !== id));
    toast.success("Component removed");
  };

  const customBlendSubstance = useMemo<Substance>(() => {
    const totalPct = blendComponents.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPct === 0) {
      return {
        name: "Custom Blend",
        chemicalName: "Custom Mixture",
        formula: "Unknown Composition",
        group: "Custom",
        odp: 0,
        gwpAR4: 0,
        gwpAR5: 0,
        gwpAR6: 0,
      };
    }

    let weightedOdp = 0;
    let weightedAR4 = 0;
    let weightedAR5 = 0;
    let weightedAR6 = 0;

    blendComponents.forEach((item) => {
      const matched = SUBSTANCES.find((s) => s.name === item.name);
      if (matched) {
        const factor = item.percentage / 100;
        weightedOdp += matched.odp * factor;
        weightedAR4 += matched.gwpAR4 * factor;
        weightedAR5 += matched.gwpAR5 * factor;
        weightedAR6 += matched.gwpAR6 * factor;
      }
    });

    // Generate composition label
    const sortedComp = [...blendComponents].sort((a, b) => b.percentage - a.percentage);
    const formulaStr = sortedComp.map((c) => `${c.name} (${c.percentage.toFixed(0)}%)`).join(" / ");

    return {
      name: blendName || "Custom Blend",
      chemicalName: "Refrigerant Blend",
      formula: formulaStr,
      group: "Custom",
      odp: weightedOdp,
      gwpAR4: weightedAR4,
      gwpAR5: weightedAR5,
      gwpAR6: weightedAR6,
    };
  }, [blendComponents, blendName]);

  const blendCalculation = useMemo(() => {
    const qtyNum = Number(blendQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return { odpEq: 0, co2eAR4: 0, co2eAR5: 0, co2eAR6: 0 };

    const kg = massToKg(qtyNum, blendUnit);
    const tonnesSubstance = kg / 1000;

    return {
      odpEq: tonnesSubstance * customBlendSubstance.odp,
      co2eAR4: tonnesSubstance * customBlendSubstance.gwpAR4,
      co2eAR5: tonnesSubstance * customBlendSubstance.gwpAR5,
      co2eAR6: tonnesSubstance * customBlendSubstance.gwpAR6,
    };
  }, [blendQuantity, blendUnit, customBlendSubstance]);

  // Unified active stats based on mode selection
  const results = mode === "pure" ? pureCalculation : blendCalculation;
  const activeSub = mode === "pure" ? activeSubstance : customBlendSubstance;
  const massVal = mode === "pure" ? Number(quantity) : Number(blendQuantity);
  const massUnit = mode === "pure" ? unit : blendUnit;

  // Kigali Amendment Phase-down / Regulatory Insights
  const regulatoryInsight = useMemo(() => {
    const group = activeSub.group;
    const name = activeSub.name;

    if (group === "CFCs") {
      return {
        status: "Phased Out (Global Ban)",
        color: "text-red-500 bg-red-500/10 border-red-200/20",
        message:
          "CFCs have high Ozone Depleting Potential and were globally phased out in 2010 under the Montreal Protocol. Use is strictly prohibited except for essential critical laboratory/medical uses.",
        percentage: 100,
      };
    }
    if (group === "HCFCs") {
      return {
        status: "Active Phase-Out (99.5% reduction)",
        color: "text-amber-500 bg-amber-500/10 border-amber-200/20",
        message:
          "HCFCs (like R-22) are undergoing active phase-out. Developed countries completed phase-out in 2020 (except 0.5% servicing tail). Developing countries will phase them out by 2030.",
        percentage: 90,
      };
    }
    if (
      group === "HFCs" ||
      group === "HFC Blends" ||
      (group === "Custom" && activeSub.gwpAR6 > 150)
    ) {
      const gwp = activeSub.gwpAR6;
      let phaseClass = "";
      let msg = "";

      if (gwp > 2500) {
        phaseClass = "High Impact Phase-down";
        msg =
          "Subject to rapid transition under the Kigali Amendment. High-GWP HFCs face servicing restrictions and strict quota limits globally. Transition to low-GWP alternatives is highly recommended.";
      } else if (gwp > 750) {
        phaseClass = "Medium Impact Phase-down";
        msg =
          "Controlled substance under Kigali. Face progressive quotas and bans in new equipment (e.g. EU F-Gas restrictions for new air conditioning and heat pumps).";
      } else {
        phaseClass = "Low GWP Transition Substance";
        msg =
          "Lower GWP HFCs (like R-32) act as transition agents. Though controlled under Kigali, they are preferred over high-GWP agents due to their reduced climate footprint.";
      }

      return {
        status: phaseClass,
        color: "text-primary bg-primary/10 border-primary/20",
        message: msg,
        percentage: 45,
      };
    }
    return {
      status: "Eco-Friendly / Natural",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-200/20",
      message:
        "Natural refrigerants (CO₂, Ammonia, Propane) have zero ODP and negligible GWP (<3). They are exempt from Montreal/Kigali phase-downs and represent the optimal sustainable choice.",
      percentage: 0,
    };
  }, [activeSub]);

  // Trigger PDF download
  const handleExportPdf = () => {
    if (isNaN(massVal) || massVal <= 0) {
      toast.error("Please enter a valid quantity before downloading the report.");
      return;
    }

    if (mode === "blend" && blendComponents.length === 0) {
      toast.error("Please add at least one component to the blend.");
      return;
    }

    const kgVal = massToKg(massVal, massUnit);

    downloadGwpOdpReport({
      id: crypto.randomUUID(),
      reportName: mode === "pure" ? `Substance Profile: ${activeSub.name}` : blendName,
      substanceName: activeSub.name,
      chemicalName: activeSub.chemicalName,
      formula: activeSub.formula,
      group: activeSub.group,
      quantity: massVal,
      unit: massUnit,
      odp: activeSub.odp,
      gwpAR4: activeSub.gwpAR4,
      gwpAR5: activeSub.gwpAR5,
      gwpAR6: activeSub.gwpAR6,
      odpEquivalent: results.odpEq,
      co2eAR4: results.co2eAR4,
      co2eAR5: results.co2eAR5,
      co2eAR6: results.co2eAR6,
      composition:
        mode === "blend"
          ? blendComponents.map((c) => ({
              name: c.name,
              percentage: c.percentage,
              quantity: (c.percentage / 100) * kgVal,
            }))
          : undefined,
      notes,
      companyName: company,
      facility,
      reportDate: new Date().toLocaleDateString(),
    });
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Specialized Calculators
          </p>
          <h1 className="mt-1 font-display text-4xl">GWP-ODP Refrigerant Calculator</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Evaluate climate impact (Global Warming Potential) and ozone layer depletion (Ozone
            Depletion Potential) for standard gases and custom blends.
          </p>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex gap-2 mb-6 bg-muted/30 p-1.5 rounded-xl max-w-sm">
        <button
          onClick={() => setMode("pure")}
          className={`flex-1 flex justify-center items-center gap-1.5 py-2 px-3 text-sm rounded-lg transition-all ${
            mode === "pure"
              ? "bg-background text-primary font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wind className="h-4 w-4" /> Pure Substance
        </button>
        <button
          onClick={() => setMode("blend")}
          className={`flex-1 flex justify-center items-center gap-1.5 py-2 px-3 text-sm rounded-lg transition-all ${
            mode === "blend"
              ? "bg-background text-primary font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" /> Custom Blend Builder
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Form Column */}
        <div className="grid gap-6 lg:col-span-3">
          {mode === "pure" ? (
            <Card className="rounded-2xl p-6">
              <h2 className="mb-4 font-display text-xl text-primary flex items-center gap-2">
                <Wind className="h-5 w-5" /> Select Substance & Mass
              </h2>

              <div className="grid gap-5">
                <div>
                  <Label>Gas / Refrigerant Substance</Label>
                  <Select value={selectedSubstanceName} onValueChange={setSelectedSubstanceName}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[350px]">
                      {/* Grouping substances in the dropdown */}
                      {Array.from(new Set(SUBSTANCES.map((s) => s.group))).map((grp) => (
                        <div key={grp}>
                          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/20 tracking-wider">
                            {grp}
                          </div>
                          {SUBSTANCES.filter((s) => s.group === grp).map((sub) => (
                            <SelectItem key={sub.name} value={sub.name}>
                              {sub.name} — {sub.chemicalName} ({sub.formula})
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Substance Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mass Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="tonnes">Metric Tonnes (t)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl p-6">
              <h2 className="mb-4 font-display text-xl text-primary flex items-center gap-2">
                <Layers className="h-5 w-5" /> Custom Blend formulation
              </h2>

              <div className="grid gap-5">
                <div>
                  <Label>Custom Blend Name</Label>
                  <Input
                    value={blendName}
                    onChange={(e) => setBlendName(e.target.value)}
                    placeholder="e.g. My Retrofitted AC Blend"
                  />
                </div>

                <div className="border border-dashed border-border/70 rounded-xl p-4 bg-muted/5">
                  <h3 className="text-sm font-semibold mb-3">
                    Add Gas Components ({remainingPercentage}% remaining)
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-1">
                      <Label className="text-xs">Substance</Label>
                      <Select value={newCompName} onValueChange={setNewCompName}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[350px]">
                          {Array.from(
                            new Set(
                              SUBSTANCES.filter((s) => s.group !== "HFC Blends").map(
                                (s) => s.group,
                              ),
                            ),
                          ).map((grp) => (
                            <div key={grp}>
                              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/20 tracking-wider">
                                {grp}
                              </div>
                              {SUBSTANCES.filter((s) => s.group === grp).map((sub) => (
                                <SelectItem key={sub.name} value={sub.name}>
                                  {sub.name} ({sub.formula})
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Percentage composition (%)</Label>
                      <Input
                        type="number"
                        min={0.1}
                        max={remainingPercentage}
                        value={newCompPct}
                        onChange={(e) => setNewCompPct(e.target.value)}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <Button
                      onClick={handleAddComponent}
                      disabled={remainingPercentage <= 0}
                      className="w-full"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add to Blend
                    </Button>
                  </div>
                </div>

                {blendComponents.length > 0 && (
                  <div className="rounded-xl border bg-card/50 overflow-hidden">
                    <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground grid grid-cols-12">
                      <span className="col-span-6">CONSTITUENT</span>
                      <span className="col-span-4 text-center">SHARE (%)</span>
                      <span className="col-span-2 text-right">ACTION</span>
                    </div>
                    <div className="divide-y">
                      {blendComponents.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-2 text-sm grid grid-cols-12 items-center"
                        >
                          <span className="col-span-6 font-medium">{item.name}</span>
                          <span className="col-span-4 text-center">{item.percentage} %</span>
                          <span className="col-span-2 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveComponent(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <Label>Total Blend Weight</Label>
                    <Input
                      type="number"
                      min={0}
                      value={blendQuantity}
                      onChange={(e) => setBlendQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mass Unit</Label>
                    <Select value={blendUnit} onValueChange={setBlendUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="tonnes">Metric Tonnes (t)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Report Setup details Card */}
          <Card className="rounded-2xl p-6 bg-muted/15">
            <h3 className="mb-4 font-display text-lg text-foreground">Report metadata</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Aircon"
                />
              </div>
              <div>
                <Label>Facility / System ID</Label>
                <Input
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Chiller Unit B"
                />
              </div>
              <div className="md:col-span-1">
                <Label>Assessment Date</Label>
                <Input value={new Date().toLocaleDateString()} disabled className="bg-muted/30" />
              </div>
              <div className="md:col-span-3">
                <Label>Assessment Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide system context or leakage details..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Dashboard Results Column */}
        <div className="grid gap-4 lg:col-span-2">
          {/* ODP Impact Card */}
          <Card className="rounded-2xl border-amber-200/50 bg-amber-500/10 p-6 flex flex-col justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-700/80 font-bold flex items-center gap-1.5">
                <Wind className="h-4 w-4" /> Ozone Depletion Impact
              </p>
              <p className="mt-2 font-display text-3xl text-amber-900 font-extrabold">
                {results.odpEq.toFixed(5)} t{" "}
                <span className="text-lg font-normal text-amber-700">CFC-11 eq</span>
              </p>
            </div>
            <p className="text-xs text-amber-700/80">
              Evaluated Ozone Depletion Potential (ODP). CFCs have an ODP of 1.0, HFCs have an ODP
              of 0.
            </p>
          </Card>

          {/* GWP AR6 Climate Impact Card */}
          <Card className="rounded-2xl border-primary/40 bg-primary p-6 text-primary-foreground shadow-md">
            <p className="text-xs uppercase tracking-widest text-primary-foreground/75 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> GWP Climate Impact (AR6)
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold">
              {results.co2eAR6.toFixed(3)} t{" "}
              <span className="text-lg font-normal text-primary-foreground/75">CO₂-eq</span>
            </p>
            <p className="mt-2 text-xs text-primary-foreground/75">
              IPCC 6th Assessment Report GWP-100 values. Equates to emissions generated by burning
              approx. {Math.round(results.co2eAR6 * 110).toLocaleString()} gallons of gasoline.
            </p>
          </Card>

          {/* Substance Details Card */}
          <Card className="rounded-2xl p-5 border border-border/80">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <Info className="h-4 w-4" /> Physical & Chemical Properties
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Chemical Name</span>
                <span className="font-semibold text-right max-w-[200px] truncate">
                  {activeSub.chemicalName}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Chemical Formula</span>
                <span className="font-semibold text-primary">{activeSub.formula}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">ODP Value</span>
                <span
                  className={`font-semibold ${activeSub.odp > 0 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {activeSub.odp.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">IPCC AR4 GWP</span>
                <span className="font-medium">{activeSub.gwpAR4.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">IPCC AR5 GWP</span>
                <span className="font-medium">{activeSub.gwpAR5.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="text-muted-foreground">IPCC AR6 GWP</span>
                <span className="font-semibold text-primary">
                  {activeSub.gwpAR6.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Regulatory & Kigali Amendment Insights Card */}
          <Card className={`rounded-2xl p-5 border ${regulatoryInsight.color}`}>
            <h3 className="text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2">
              <Award className="h-4.5 w-4.5" /> Montreal Protocol Status
            </h3>
            <p className="text-sm font-extrabold mb-1">{regulatoryInsight.status}</p>
            <p className="text-xs leading-relaxed opacity-90">{regulatoryInsight.message}</p>
          </Card>

          {/* IPCC Report comparison progression */}
          <Card className="rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              GWP Version Equivalent Comparison
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>IPCC AR4 (2007)</span>
                  <span className="font-semibold">{results.co2eAR4.toFixed(2)} t CO2e</span>
                </div>
                <Progress
                  value={results.co2eAR6 > 0 ? (results.co2eAR4 / results.co2eAR6) * 100 : 0}
                  className="h-2 bg-muted [&>div]:bg-primary/60"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>IPCC AR5 (2014)</span>
                  <span className="font-semibold">{results.co2eAR5.toFixed(2)} t CO2e</span>
                </div>
                <Progress
                  value={results.co2eAR6 > 0 ? (results.co2eAR5 / results.co2eAR6) * 100 : 0}
                  className="h-2 bg-muted [&>div]:bg-primary/80"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>IPCC AR6 (2021)</span>
                  <span className="font-semibold">{results.co2eAR6.toFixed(2)} t CO2e</span>
                </div>
                <Progress value={100} className="h-2 bg-muted [&>div]:bg-primary" />
              </div>
            </div>
          </Card>

          {/* Action section */}
          <Card className="rounded-2xl p-6 flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={isNaN(massVal) || massVal <= 0}
              className="w-full justify-center border-primary text-primary hover:bg-primary/10"
            >
              <Download className="mr-2 h-4 w-4" /> Export PDF Assessment
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
