import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TrendingDown,
  Zap,
  Sun,
  Truck,
  Wind,
  Plus,
  Trash2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Award,
  Download,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  Factory,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/decarbonization")({
  head: () => ({
    meta: [
      { title: "Decarbonization Planner — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DecarbonizationPage,
});

type Category =
  | "Energy Efficiency"
  | "Renewable Energy"
  | "Fleet Transition"
  | "Refrigerants"
  | "Supply Chain"
  | "Process & Heat";

type Initiative = {
  id: string;
  name: string;
  category: Category;
  abatementTons: number; // tCO2e / yr
  capexUSD: number; // USD investment
  annualSavingsUSD: number; // USD / yr
  targetYear: number;
  enabled: boolean;
  notes?: string;
};

const DEFAULT_INITIATIVES: Initiative[] = [
  {
    id: "init-1",
    name: "Rooftop Solar PV Installation (500 kW)",
    category: "Renewable Energy",
    abatementTons: 420,
    capexUSD: 350000,
    annualSavingsUSD: 62000,
    targetYear: 2027,
    enabled: true,
    notes: "Replaces 680,000 kWh of grid electricity with zero-carbon solar generation.",
  },
  {
    id: "init-2",
    name: "Commercial Vehicle Fleet EV Transition",
    category: "Fleet Transition",
    abatementTons: 280,
    capexUSD: 240000,
    annualSavingsUSD: 38000,
    targetYear: 2028,
    enabled: true,
    notes: "Transitions 15 diesel delivery vans to 100% electric vehicle technology.",
  },
  {
    id: "init-3",
    name: "HVAC Retrofit (R-410A to Low-GWP R-454B Heat Pumps)",
    category: "Refrigerants",
    abatementTons: 310,
    capexUSD: 85000,
    annualSavingsUSD: 14000,
    targetYear: 2026,
    enabled: true,
    notes: "Eliminates high-GWP refrigerant leakage under Kigali Amendment roadmap.",
  },
  {
    id: "init-4",
    name: "Industrial Facility High-Efficiency LED Upgrade",
    category: "Energy Efficiency",
    abatementTons: 110,
    capexUSD: 45000,
    annualSavingsUSD: 18000,
    targetYear: 2026,
    enabled: true,
    notes: "Fast 2.5-year payback project replacing fluorescent factory bay lighting.",
  },
  {
    id: "init-5",
    name: "Industrial Boiler Fuel Switch (Diesel to Green Biomass)",
    category: "Process & Heat",
    abatementTons: 650,
    capexUSD: 420000,
    annualSavingsUSD: 48000,
    targetYear: 2029,
    enabled: false,
    notes:
      "Converts primary thermal boiler from diesel oil to certified agricultural biomass pellets.",
  },
  {
    id: "init-6",
    name: "Supplier Recycled Steel & Aluminium EAF Certification",
    category: "Supply Chain",
    abatementTons: 540,
    capexUSD: 20000,
    annualSavingsUSD: 5000,
    targetYear: 2030,
    enabled: false,
    notes: "Scope 3 Category 1 reduction via electric arc furnace (EAF) steel sourcing.",
  },
];

const PRESET_LIBRARY: Omit<Initiative, "id" | "enabled">[] = [
  {
    name: "Waste Heat Recovery System (Organic Rankine Cycle)",
    category: "Energy Efficiency",
    abatementTons: 390,
    capexUSD: 290000,
    annualSavingsUSD: 52000,
    targetYear: 2028,
    notes: "Captures furnace exhaust heat to generate 150 kW on-site electricity.",
  },
  {
    name: "Wastewater Anaerobic Digester Methane Biogas Capture",
    category: "Process & Heat",
    abatementTons: 480,
    capexUSD: 310000,
    annualSavingsUSD: 41000,
    targetYear: 2029,
    notes: "Captures fugitive methane from effluent treatment and uses it for plant heating.",
  },
  {
    name: "Green Power Purchase Agreement (PPA 2 MW Wind-Solar Hybrid)",
    category: "Renewable Energy",
    abatementTons: 1200,
    capexUSD: 50000,
    annualSavingsUSD: 110000,
    targetYear: 2027,
    notes: "Off-site PPA providing 75% renewable energy coverage for manufacturing facilities.",
  },
];

function DecarbonizationPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>(DEFAULT_INITIATIVES);
  const [baselineEmissions, setBaselineEmissions] = useState<number>(4650); // tCO2e baseline
  const [targetYear, setTargetYear] = useState<number>(2030);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Exchange rate USD to INR multiplier (83.5)
  const rate = currency === "INR" ? 83.5 : 1;
  const currSymbol = currency === "INR" ? "₹" : "$";

  // Form state
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Category>("Energy Efficiency");
  const [newAbatement, setNewAbatement] = useState("150");
  const [newCapex, setNewCapex] = useState("4000000"); // INR default
  const [newSavings, setNewSavings] = useState("800000"); // INR default
  const [newTargetYear, setNewTargetYear] = useState("2028");

  const toggleInitiative = (id: string) => {
    setInitiatives((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const handleAddInitiative = () => {
    if (!newName.trim()) {
      toast.error("Please enter project name");
      return;
    }
    const ab = Number(newAbatement);
    const capInput = Number(newCapex);
    const savInput = Number(newSavings);
    const yr = Number(newTargetYear);

    if (isNaN(ab) || ab <= 0) {
      toast.error("Enter valid carbon abatement tonnes");
      return;
    }

    // Store in USD base internally
    const capexUSD = currency === "INR" ? capInput / 83.5 : capInput;
    const savingsUSD = currency === "INR" ? savInput / 83.5 : savInput;

    setInitiatives((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newName,
        category: newCat,
        abatementTons: ab,
        capexUSD,
        annualSavingsUSD: savingsUSD,
        targetYear: isNaN(yr) ? 2028 : yr,
        enabled: true,
      },
    ]);
    toast.success(`Project "${newName}" added to Decarbonization Plan`);

    setNewName("");
    setNewAbatement("150");
    setNewCapex("4000000");
    setNewSavings("800000");
  };

  const handleAddPreset = (preset: Omit<Initiative, "id" | "enabled">) => {
    setInitiatives((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...preset,
        enabled: true,
      },
    ]);
    toast.success(`Added preset "${preset.name}"`);
  };

  const handleRemoveInitiative = (id: string) => {
    setInitiatives((prev) => prev.filter((item) => item.id !== id));
    toast.success("Initiative removed");
  };

  // Computations
  const filteredInitiatives = useMemo(() => {
    if (categoryFilter === "All") return initiatives;
    return initiatives.filter((i) => i.category === categoryFilter);
  }, [initiatives, categoryFilter]);

  const activeInitiatives = useMemo(() => initiatives.filter((i) => i.enabled), [initiatives]);
  const totalAbatement = useMemo(
    () => activeInitiatives.reduce((sum, item) => sum + item.abatementTons, 0),
    [activeInitiatives],
  );
  const totalCapexUSD = useMemo(
    () => activeInitiatives.reduce((sum, item) => sum + item.capexUSD, 0),
    [activeInitiatives],
  );
  const totalSavingsUSD = useMemo(
    () => activeInitiatives.reduce((sum, item) => sum + item.annualSavingsUSD, 0),
    [activeInitiatives],
  );

  const totalCapexDisp = totalCapexUSD * rate;
  const totalSavingsDisp = totalSavingsUSD * rate;

  const projectedEmissions = Math.max(0, baselineEmissions - totalAbatement);
  const reductionPercentage = Math.min(100, Math.round((totalAbatement / baselineEmissions) * 100));
  const paybackYears = totalSavingsUSD > 0 ? (totalCapexUSD / totalSavingsUSD).toFixed(1) : "N/A";

  // MACC ranking (Marginal Abatement Cost = (Capex - Lifetime Savings) / (Abatement * 10))
  const sortedMacc = useMemo(() => {
    return [...activeInitiatives].sort((a, b) => {
      const macA = (a.capexUSD - a.annualSavingsUSD * 5) / (a.abatementTons * 5);
      const macB = (b.capexUSD - b.annualSavingsUSD * 5) / (b.abatementTons * 5);
      return macA - macB;
    });
  }, [activeInitiatives]);

  // Export PDF Business Case
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
    doc.setFillColor(31, 79, 58); // Dark emerald
    doc.rect(0, 0, 595, 90, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("clisomumbai", 48, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Climate Social Mumbai — Decarbonization Business Case & Net-Zero Roadmap", 48, 62);

    let y = 120;
    doc.setTextColor("#1F2937");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Decarbonization Summary", 48, y);

    y += 24;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Current Emissions Baseline: ${baselineEmissions.toLocaleString()} t CO₂e/yr`, 48, y);
    y += 18;
    doc.text(
      `Active Abatement Volume: -${totalAbatement.toLocaleString()} t CO₂e/yr (${reductionPercentage}% Reduction)`,
      48,
      y,
    );
    y += 18;
    doc.text(`Projected 2030 Baseline: ${projectedEmissions.toLocaleString()} t CO₂e/yr`, 48, y);
    y += 18;
    doc.text(
      `Total CAPEX Investment Required: ${currSymbol}${Math.round(totalCapexDisp).toLocaleString()}`,
      48,
      y,
    );
    y += 18;
    doc.text(
      `Annual Energy Cost Savings: ${currSymbol}${Math.round(totalSavingsDisp).toLocaleString()}/yr`,
      48,
      y,
    );
    y += 18;
    doc.text(`Financial Payback Period: ${paybackYears} Years`, 48, y);

    y += 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Active Decarbonization Projects", 48, y);

    y += 18;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Project Name", 48, y);
    doc.text("Category", 260, y);
    doc.text("Abatement", 370, y);
    doc.text("CAPEX", 450, y);
    doc.text("Payback", 520, y);

    y += 8;
    doc.setDrawColor(200);
    doc.line(48, y, 547, y);

    doc.setFont("helvetica", "normal");
    activeInitiatives.forEach((item) => {
      y += 18;
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      const cap = item.capexUSD * rate;
      const sav = item.annualSavingsUSD * rate;
      const pb = sav > 0 ? (cap / sav).toFixed(1) + " yrs" : "N/A";

      doc.text(item.name.substring(0, 32), 48, y);
      doc.text(item.category, 260, y);
      doc.text(`-${item.abatementTons} t`, 370, y);
      doc.text(`${currSymbol}${Math.round(cap).toLocaleString()}`, 450, y);
      doc.text(pb, 520, y);
    });

    doc.save("clisomumbai-decarbonization-roadmap.pdf");
    toast.success("Exported Decarbonization Business Case PDF");
  };

  return (
    <AppShell>
      {/* Top Banner & Currency Switch */}
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4 border-b pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Decarbonization & Net-Zero Strategy
          </p>
          <h1 className="mt-1 font-display text-4xl flex items-center gap-3 font-extrabold text-foreground">
            <TrendingDown className="h-9 w-9 text-emerald-600" /> Decarbonization Planner & ROI
            Simulator
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            Model reduction initiatives, rank projects by Marginal Abatement Cost (MACC), calculate
            energy bill savings, and map 2030 Science-Based Target pathways.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currency === "INR"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇮🇳 INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌐 USD ($)
            </button>
          </div>

          <Button onClick={exportPDF} variant="outline" className="gap-2 border-primary/40 text-xs">
            <Download className="h-4 w-4 text-primary" /> Export Business Case PDF
          </Button>
        </div>
      </div>

      {/* Baseline & KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="p-5 rounded-2xl border-primary/20 bg-primary/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Baseline
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-foreground">
            {baselineEmissions.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e/yr</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Audit-verified facility inventory</p>
        </Card>

        <Card className="p-5 rounded-2xl border-emerald-500/30 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-extrabold">
            Active Abatement
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-emerald-950">
            -{totalAbatement.toLocaleString()}{" "}
            <span className="text-sm font-normal text-emerald-800">t CO₂e/yr</span>
          </p>
          <p className="mt-1 text-xs text-emerald-800 font-bold">
            -{reductionPercentage}% GHG reduction achieved
          </p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Projected 2030 Baseline
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-primary">
            {projectedEmissions.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e/yr</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Net emissions post-initiatives</p>
        </Card>

        <Card className="p-5 rounded-2xl border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-extrabold">
            Financial ROI Payback
          </p>
          <p className="mt-2 text-3xl font-display font-extrabold text-amber-700">
            {paybackYears} <span className="text-sm font-normal text-muted-foreground">Years</span>
          </p>
          <p className="mt-1 text-xs text-amber-800 font-medium">
            {currSymbol}
            {Math.round(totalSavingsDisp).toLocaleString()}/yr energy savings
          </p>
        </Card>
      </div>

      {/* Target Progress Bar */}
      <Card className="p-6 rounded-2xl mb-8 border-primary/20">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" /> {targetYear} Science-Based Target
            Trajectory (SBTi Aligned)
          </span>
          <span className="text-sm font-extrabold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            {reductionPercentage}% Reduction Target Reached
          </span>
        </div>
        <Progress value={reductionPercentage} className="h-3.5 bg-muted [&>div]:bg-emerald-600" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2.5 font-medium">
          <span>Current Baseline: {baselineEmissions.toLocaleString()} t CO₂e</span>
          <span>Active Abatement: -{totalAbatement.toLocaleString()} t</span>
          <span>Target 2030: Net-Zero (0 t)</span>
        </div>
      </Card>

      {/* Main Tabs: Projects vs MACC Visualizer vs Quick Presets */}
      <Tabs defaultValue="projects" className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="projects" className="gap-2 text-xs font-semibold">
              <Zap className="h-4 w-4 text-amber-500" /> Active Initiatives ({initiatives.length})
            </TabsTrigger>
            <TabsTrigger value="macc" className="gap-2 text-xs font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> MACC Abatement Curve
            </TabsTrigger>
            <TabsTrigger value="presets" className="gap-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Pre-built Levers Library
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="text-xs rounded-lg border bg-background px-3 py-1.5 font-medium"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Energy Efficiency">Energy Efficiency</option>
              <option value="Renewable Energy">Renewable Energy</option>
              <option value="Fleet Transition">Fleet Transition</option>
              <option value="Refrigerants">Refrigerants & Fugitive</option>
              <option value="Process & Heat">Process & Heat</option>
              <option value="Supply Chain">Supply Chain</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Active Projects List & Add Form */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Initiatives List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" /> Decarbonization Projects
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {activeInitiatives.length} of {initiatives.length} Active Toggle
                  </span>
                </div>

                <div className="divide-y border rounded-xl overflow-hidden">
                  {filteredInitiatives.map((item) => {
                    const cap = item.capexUSD * rate;
                    const sav = item.annualSavingsUSD * rate;
                    const net5yr = sav * 5 - cap;
                    const isProfitable = net5yr > 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-4.5 flex flex-wrap items-center justify-between gap-4 transition-all ${
                          item.enabled ? "bg-card" : "bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3 max-w-sm">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => toggleInitiative(item.id)}
                            className="mt-1 h-4.5 w-4.5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                {item.category}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Target Completion: {item.targetYear}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-right">
                          <div>
                            <p className="font-extrabold text-emerald-600 text-sm">
                              -{item.abatementTons} t CO₂e/yr
                            </p>
                            <p className="text-muted-foreground font-medium">
                              {currSymbol}
                              {Math.round(sav).toLocaleString()}/yr saved
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold text-foreground">
                              {currSymbol}
                              {Math.round(cap).toLocaleString()} CAPEX
                            </p>
                            <p
                              className={`text-[11px] font-bold ${isProfitable ? "text-emerald-700" : "text-amber-700"}`}
                            >
                              {isProfitable ? "Net Positive 5yr ROI" : "Net Investment"}
                            </p>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveInitiative(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Add Custom Project Form */}
            <Card className="p-6 rounded-2xl h-fit">
              <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-primary font-bold">
                <Plus className="h-5 w-5" /> Add Decarbonization Initiative
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    placeholder="e.g. Solar Rooftop Phase 2"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Project Category</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as Category)}
                  >
                    <option value="Energy Efficiency">Energy Efficiency</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Fleet Transition">Fleet Transition</option>
                    <option value="Refrigerants">Refrigerants & Fugitive</option>
                    <option value="Process & Heat">Process & Heat</option>
                    <option value="Supply Chain">Supply Chain</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Abatement (t CO₂e/yr)</Label>
                    <Input
                      type="number"
                      value={newAbatement}
                      onChange={(e) => setNewAbatement(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Target Year</Label>
                    <Input
                      type="number"
                      value={newTargetYear}
                      onChange={(e) => setNewTargetYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>CAPEX ({currSymbol})</Label>
                    <Input
                      type="number"
                      value={newCapex}
                      onChange={(e) => setNewCapex(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Annual Savings ({currSymbol}/yr)</Label>
                    <Input
                      type="number"
                      value={newSavings}
                      onChange={(e) => setNewSavings(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddInitiative} className="w-full font-bold">
                  <Plus className="mr-2 h-4 w-4" /> Add Initiative
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Marginal Abatement Cost Curve (MACC) Visualizer */}
        <TabsContent value="macc">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-display text-xl mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Marginal Abatement Cost Curve (MACC)
              Ranks
            </h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-2xl">
              Projects ranked from highest net financial savings to capital investments per tonne of
              carbon cut.
            </p>

            <div className="space-y-4">
              {sortedMacc.map((item, idx) => {
                const cap = item.capexUSD * rate;
                const sav = item.annualSavingsUSD * rate;
                const netPerTon = (cap - sav * 5) / (item.abatementTons * 5);
                const isSavings = netPerTon < 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border bg-card flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category} • Cuts {item.abatementTons} t CO₂e/yr
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-right">
                      <div>
                        <p className="text-muted-foreground font-medium">5-Year Energy Savings</p>
                        <p className="font-extrabold text-emerald-600">
                          {currSymbol}
                          {Math.round(sav * 5).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Marginal Abatement Cost</p>
                        <p
                          className={`font-extrabold text-sm ${isSavings ? "text-emerald-700" : "text-amber-700"}`}
                        >
                          {isSavings
                            ? `Net Savings (${currSymbol}${Math.abs(Math.round(netPerTon))}/t)`
                            : `${currSymbol}${Math.round(netPerTon)}/t CO₂e`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Pre-built Levers Quick Library */}
        <TabsContent value="presets">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-display text-xl mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Industry Abatement Levers Library
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              One-click add pre-engineered decarbonization projects with industry benchmarked
              abatement values.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {PRESET_LIBRARY.map((preset) => {
                const cap = preset.capexUSD * rate;
                const sav = preset.annualSavingsUSD * rate;

                return (
                  <div
                    key={preset.name}
                    className="p-5 rounded-2xl border bg-card flex flex-col justify-between hover:border-primary/50 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {preset.category}
                      </span>
                      <h4 className="font-bold text-sm mt-2">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {preset.notes}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-xs">
                        <p className="font-extrabold text-emerald-600">
                          -{preset.abatementTons} t CO₂e/yr
                        </p>
                        <p className="text-muted-foreground">
                          {currSymbol}
                          {Math.round(cap).toLocaleString()} CAPEX
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddPreset(preset)}
                        className="text-xs gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Project
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
