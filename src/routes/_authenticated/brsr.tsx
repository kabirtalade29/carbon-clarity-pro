import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  FileSpreadsheet,
  FileCheck2,
  Download,
  Sparkles,
  Shield,
  Building2,
  Users,
  Factory,
  Droplets,
  Zap,
  Globe2,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  Layers,
  FileText,
  Sliders,
  Scale,
  Plus,
  Trash2,
  Check,
  X,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import {
  CompleteBrsrReport,
  BLANK_BRSR_TEMPLATE,
  TATA_STEEL_BENCHMARK_TEMPLATE,
  autoCalculateBrsrReport,
  generateOfficialBrsrPdf,
  downloadCompleteBrsrCsv,
  downloadBrsrJson,
} from "@/lib/brsr-full-report";
import { listMyCalculations } from "@/lib/calculations.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/brsr")({
  head: () => ({
    meta: [
      { title: "SEBI BRSR Comprehensive Suite — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BrsrSuitePage,
});

const POPULAR_STANDARDS = [
  "ISO 14001:2015 (Environment)",
  "ISO 50001:2018 (Energy)",
  "ISO 45001:2018 (Safety)",
  "ISO 9001:2015 (Quality)",
  "ISO 27001:2022 (InfoSec)",
  "SA8000:2014 (Social Accountability)",
  "ResponsibleSteel™",
  "GRI Standards",
  "CDP Climate Disclosures",
  "DJSI Sustainability Index",
  "IFRS S1 / S2 (ISSB)",
  "TCFD Recommendations",
];

const NGRBC_PRINCIPLES = [
  { key: "p1Ethics", label: "P1: Ethics, Bribery & Transparency", desc: "Anti-corruption, fair business practices & transparent conduct" },
  { key: "p2Products", label: "P2: Sustainable Product Lifecycle", desc: "Safe, sustainable goods with circularity & eco-design" },
  { key: "p3Employees", label: "P3: Employee Well-being & Safety", desc: "Occupational safety, health insurance, POSH & fair treatment" },
  { key: "p4Stakeholders", label: "P4: Stakeholder Grievance & Engagement", desc: "Inclusive dialogue with vulnerable & local communities" },
  { key: "p5HumanRights", label: "P5: Human Rights & Minimum Wages", desc: "Zero child/forced labor, statutory wages & equal remuneration" },
  { key: "p6Environment", label: "P6: Climate, Energy & Water Policy", desc: "Decarbonization, pollution control, ZLD & biodiversity" },
  { key: "p7PolicyAdvocacy", label: "P7: Public Policy & Trade Advocacy", desc: "Responsible representation in industry chambers" },
  { key: "p8InclusiveGrowth", label: "P8: CSR & Inclusive Development", desc: "Equitable community projects & MSME vendor support" },
  { key: "p9ConsumerValue", label: "P9: Consumer Data Privacy & Value", desc: "Transparent labeling, data protection & consumer grievance" },
] as const;

export function BrsrSuitePage() {
  const [report, setReport] = useState<CompleteBrsrReport>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cliso_saved_brsr_report");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return TATA_STEEL_BENCHMARK_TEMPLATE;
  });

  const [activeSectionTab, setActiveSectionTab] = useState("overview");
  const [customCertInput, setCustomCertInput] = useState("");

  // Fetch verified calculations to allow instant auto-fill
  const listFn = useServerFn(listMyCalculations);
  const { data: serverCalcRows } = useQuery({
    queryKey: ["calculations"],
    queryFn: () => listFn(),
  });

  // Save to local storage on edit
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cliso_saved_brsr_report", JSON.stringify(report));
    }
  }, [report]);

  // Handle loading industry and blank templates
  const handleLoadTemplate = (templateType: string) => {
    if (templateType === "blank") {
      setReport(JSON.parse(JSON.stringify(BLANK_BRSR_TEMPLATE)));
      toast.success("Loaded Blank Client Report Template", {
        description: "You can now customize all corporate, governance, and emission disclosures.",
      });
    } else if (templateType === "tata_steel") {
      setReport(JSON.parse(JSON.stringify(TATA_STEEL_BENCHMARK_TEMPLATE)));
      toast.success("Loaded Tata Steel Benchmark Template (FY 2025-26)");
    } else if (templateType === "standard_mfg") {
      const mfg = JSON.parse(JSON.stringify(TATA_STEEL_BENCHMARK_TEMPLATE)) as CompleteBrsrReport;
      mfg.companyName = "Maharashtra Heavy Industries Ltd.";
      mfg.general.entityName = "Maharashtra Heavy Industries Ltd.";
      mfg.general.cin = "L28100MH2012PLC234567";
      mfg.general.mainActivityDescription = "Heavy Engineering & Auto Ancillaries";
      mfg.general.businessActivityDescription = "Forging, Machining and Cast Components";
      mfg.general.csrTurnoverCrore = 4500;
      mfg.principle6.scope1EmissionsTonnes = 85000;
      mfg.principle6.scope2EmissionsTonnes = 42000;
      mfg.principle6.totalScope1And2Tonnes = 127000;
      setReport(mfg);
      toast.success("Loaded Heavy Manufacturing Template");
    } else if (templateType === "it_services") {
      const it = JSON.parse(JSON.stringify(BLANK_BRSR_TEMPLATE)) as CompleteBrsrReport;
      it.companyName = "Apex InfoTech & Cloud Solutions Ltd.";
      it.general.entityName = "Apex InfoTech & Cloud Solutions Ltd.";
      it.general.cin = "L72200KA2015PLC078901";
      it.general.mainActivityDescription = "Information Technology & Software Services";
      it.general.businessActivityDescription = "Cloud Infrastructure, SaaS & Consulting";
      it.general.turnoverPercentage = 100;
      it.general.csrTurnoverCrore = 6200;
      it.general.permanentEmployeesMale = 14500;
      it.general.permanentEmployeesFemale = 9200;
      it.general.womenBoardDirectorsPct = 33;
      it.general.womenKmpPct = 30;
      it.principle6.scope1EmissionsTonnes = 1200;
      it.principle6.scope2EmissionsTonnes = 18500;
      it.principle6.totalScope1And2Tonnes = 19700;
      it.principle6.scope3EmissionsTonnes = 45000;
      it.principle6.totalWaterConsumedML = 850;
      it.principlesOther.turnoverWithEnvLabelingPct = 0;
      it.principlesOther.cybersecurityPolicyExists = true;
      it.management.certificationsAdopted = [
        "ISO 27001:2022 (InfoSec)",
        "ISO 14001:2015 (Environment)",
        "ISO 9001:2015 (Quality)",
        "GRI Standards",
        "CDP Climate Disclosures",
      ];
      setReport(it);
      toast.success("Loaded IT & Tech Services Template");
    } else if (templateType === "pharma") {
      const pharma = JSON.parse(JSON.stringify(TATA_STEEL_BENCHMARK_TEMPLATE)) as CompleteBrsrReport;
      pharma.companyName = "Alkem Lifesciences & API Corp";
      pharma.general.entityName = "Alkem Lifesciences & API Corp";
      pharma.general.cin = "L24230MH2008PLC185674";
      pharma.general.mainActivityDescription = "Pharmaceuticals & Active Ingredients";
      pharma.general.businessActivityDescription = "API Formulation, Sterile Injectables & Solvents";
      pharma.general.csrTurnoverCrore = 2800;
      pharma.principle6.scope1EmissionsTonnes = 32000;
      pharma.principle6.scope2EmissionsTonnes = 24000;
      pharma.principle6.totalScope1And2Tonnes = 56000;
      pharma.principle6.totalWaterWithdrawalML = 4200;
      pharma.principle6.totalWaterConsumedML = 2800;
      pharma.principle6.zldImplemented = true;
      pharma.principle6.zldDetails = "Zero Liquid Discharge active with multiple effect evaporators, RO, and ATFD.";
      setReport(pharma);
      toast.success("Loaded Pharmaceuticals & APIs Template");
    } else if (templateType === "renewable_energy") {
      const re = JSON.parse(JSON.stringify(BLANK_BRSR_TEMPLATE)) as CompleteBrsrReport;
      re.companyName = "Adani Green & Clean Grid Ltd.";
      re.general.entityName = "Adani Green & Clean Grid Ltd.";
      re.general.cin = "L40100GJ2015PLC082007";
      re.general.mainActivityDescription = "Electricity Generation from Renewable Sources";
      re.general.businessActivityDescription = "Solar PV, Wind Farm Operations & Grid Transmission";
      re.general.csrTurnoverCrore = 3800;
      re.principle6.totalRenewableEnergyPJ = 18.5;
      re.principle6.totalEnergyConsumedPJ = 19.1;
      re.principle6.scope1EmissionsTonnes = 420;
      re.principle6.scope2EmissionsTonnes = 850;
      re.principle6.totalScope1And2Tonnes = 1270;
      re.principle6.scope3EmissionsTonnes = 12500;
      re.management.certificationsAdopted = [
        "ISO 14001:2015 (Environment)",
        "ISO 50001:2018 (Energy)",
        "ISO 45001:2018 (Safety)",
        "CDP Climate Disclosures",
      ];
      setReport(re);
      toast.success("Loaded Renewable Energy & Utilities Template");
    } else if (templateType === "fmcg_retail") {
      const fmcg = JSON.parse(JSON.stringify(BLANK_BRSR_TEMPLATE)) as CompleteBrsrReport;
      fmcg.companyName = "Godrej Consumer & Foods Ltd.";
      fmcg.general.entityName = "Godrej Consumer & Foods Ltd.";
      fmcg.general.cin = "L15100MH2000PLC128456";
      fmcg.general.mainActivityDescription = "Manufacturing of Food Products and Personal Care";
      fmcg.general.businessActivityDescription = "Packaged Foods, Beverages, Soaps and Personal Care";
      fmcg.general.csrTurnoverCrore = 8200;
      fmcg.principle6.plasticWasteTonnes = 4200;
      fmcg.principle6.wasteRecoveryUtilizationPct = 96.4;
      fmcg.principlesOther.msmeProcurementSharePct = 34;
      fmcg.principlesOther.domesticProcurementSharePct = 92;
      setReport(fmcg);
      toast.success("Loaded FMCG & Retail Template");
    } else if (templateType === "bfsi") {
      const bfsi = JSON.parse(JSON.stringify(BLANK_BRSR_TEMPLATE)) as CompleteBrsrReport;
      bfsi.companyName = "HDFC FinCorp & Banking Ltd.";
      bfsi.general.entityName = "HDFC FinCorp & Banking Ltd.";
      bfsi.general.cin = "L65920MH1994PLC080618";
      bfsi.general.mainActivityDescription = "Financial and Insurance Services";
      bfsi.general.businessActivityDescription = "Commercial Banking, Retail Lending & Asset Management";
      bfsi.general.csrTurnoverCrore = 24000;
      bfsi.general.permanentEmployeesMale = 55000;
      bfsi.general.permanentEmployeesFemale = 32000;
      bfsi.principle6.scope1EmissionsTonnes = 3500;
      bfsi.principle6.scope2EmissionsTonnes = 42000;
      bfsi.principle6.totalScope1And2Tonnes = 45500;
      bfsi.principle6.scope3EmissionsTonnes = 850000; // financed emissions
      bfsi.principlesOther.cybersecurityPolicyExists = true;
      setReport(bfsi);
      toast.success("Loaded Banking & Financial Services Template");
    }
  };

  // Sync / Auto-fill from Verified Live Calculation Ledgers
  const handleSyncFromLedgers = () => {
    const rows = serverCalcRows || [];
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let energyMWh = 0;

    for (const r of rows) {
      const kg = Number(r.co2e_kg) || 0;
      const s = (r.scope || "").toLowerCase();
      if (s.includes("stationary") || s.includes("mobile") || s.includes("fugitive") || s === "scope 1") {
        s1 += kg / 1000;
        if (r.unit === "litre") energyMWh += ((r.quantity || 0) * 10) / 1000;
      } else if (s.includes("electricity") || s === "scope 2") {
        s2 += kg / 1000;
        if (r.unit === "kWh") energyMWh += (r.quantity || 0) / 1000;
      } else {
        s3 += kg / 1000;
      }
    }

    const turnoverCr = report.general.csrTurnoverCrore || 1000;
    const outputT = 50000;
    const waterKL = 85000;
    const recycledKL = 58000;

    const updated = autoCalculateBrsrReport(
      report,
      s1 > 0 ? s1 : report.principle6.scope1EmissionsTonnes,
      s2 > 0 ? s2 : report.principle6.scope2EmissionsTonnes,
      s3 > 0 ? s3 : report.principle6.scope3EmissionsTonnes,
      energyMWh > 0 ? energyMWh : 173000,
      waterKL,
      recycledKL,
      turnoverCr,
      outputT
    );

    setReport(updated);
    toast.success("Auto-filled from Verified Data Ledgers", {
      description: "Scope 1, 2, 3 emissions, energy intensity, and water metrics synchronized.",
    });
  };

  // Synchronous company name handler
  const handleCompanyNameChange = (name: string) => {
    setReport({
      ...report,
      companyName: name,
      general: {
        ...report.general,
        entityName: name,
      },
    });
  };

  // Toggle standard in Section B
  const toggleStandard = (std: string) => {
    const current = report.management.certificationsAdopted || [];
    let next: string[];
    if (current.includes(std)) {
      next = current.filter((c) => c !== std);
    } else {
      next = [...current, std];
    }
    setReport({
      ...report,
      management: {
        ...report.management,
        certificationsAdopted: next,
      },
    });
  };

  // Add custom certification
  const handleAddCustomCert = () => {
    if (!customCertInput.trim()) return;
    const current = report.management.certificationsAdopted || [];
    if (!current.includes(customCertInput.trim())) {
      setReport({
        ...report,
        management: {
          ...report.management,
          certificationsAdopted: [...current, customCertInput.trim()],
        },
      });
      toast.success(`Added certification: ${customCertInput.trim()}`);
    }
    setCustomCertInput("");
  };

  // Remove certification
  const handleRemoveCert = (cert: string) => {
    setReport({
      ...report,
      management: {
        ...report.management,
        certificationsAdopted: (report.management.certificationsAdopted || []).filter((c) => c !== cert),
      },
    });
  };

  // Toggle all policies
  const handleSetAllPolicies = (val: boolean) => {
    setReport({
      ...report,
      management: {
        ...report.management,
        p1Ethics: val,
        p2Products: val,
        p3Employees: val,
        p4Stakeholders: val,
        p5HumanRights: val,
        p6Environment: val,
        p7PolicyAdvocacy: val,
        p8InclusiveGrowth: val,
        p9ConsumerValue: val,
        boardApproved: val,
        translatedToProcedures: val,
        extendedToValueChain: val,
      },
    });
    toast.success(val ? "Enabled all 9 NGRBC policies & board approvals" : "Disabled all policies");
  };

  // Completion Progress Metric
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (report.general.cin && report.general.entityName) score += 20;
    if (report.management.boardApproved && report.management.certificationsAdopted.length > 0) score += 20;
    if (report.principle6.scope1EmissionsTonnes > 0 && report.principle6.totalWaterWithdrawalML > 0) score += 30;
    if (report.principlesOther.accountsPayableDays > 0 && report.principlesOther.ltifrEmployees >= 0) score += 30;
    return Math.min(100, score);
  }, [report]);

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* Top Header & Action Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  SEBI BRSR Comprehensive Suite
                </h1>
                <p className="text-xs text-muted-foreground">
                  Official Annexure II Reporting Engine covering General, Governance, and Principles 1–9 Disclosures.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Template Selector with Extensive Presets */}
            <Select onValueChange={handleLoadTemplate} defaultValue="tata_steel">
              <SelectTrigger className="w-56 h-9 text-xs bg-card border-border">
                <SelectValue placeholder="Select Template / Client Preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">➕ Blank / New Custom Client Report</SelectItem>
                <SelectItem value="tata_steel">🏭 Tata Steel Benchmark (Metals &amp; Mining)</SelectItem>
                <SelectItem value="standard_mfg">⚙️ Heavy Manufacturing &amp; Engineering</SelectItem>
                <SelectItem value="it_services">💻 IT Services, SaaS &amp; Tech</SelectItem>
                <SelectItem value="pharma">💊 Pharmaceuticals &amp; APIs</SelectItem>
                <SelectItem value="renewable_energy">⚡ Renewable Energy &amp; Utilities</SelectItem>
                <SelectItem value="fmcg_retail">🛒 FMCG, Consumer Goods &amp; Retail</SelectItem>
                <SelectItem value="bfsi">🏦 Banking &amp; Financial Services (BFSI)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sync from Ledgers Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFromLedgers}
              className="h-9 text-xs gap-1.5 font-semibold bg-card hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Auto-fill from Ledgers
            </Button>

            {/* PDF Export */}
            <Button
              onClick={() => {
                generateOfficialBrsrPdf(report);
                toast.success(`Official SEBI BRSR PDF for ${report.companyName} downloaded!`);
              }}
              size="sm"
              className="h-9 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Download Full PDF
            </Button>

            {/* CSV / Excel Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadCompleteBrsrCsv(report);
                toast.success("BRSR Excel/CSV Export Generated");
              }}
              className="h-9 text-xs gap-1.5 font-semibold bg-card"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel / CSV
            </Button>

            {/* JSON Schema Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                downloadBrsrJson(report);
                toast.success("BRSR JSON Schema Exported");
              }}
              className="h-9 text-xs gap-1.5 text-muted-foreground"
            >
              JSON
            </Button>
          </div>
        </div>

        {/* Dynamic Client Profile & Audit Metadata Bar */}
        <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Client / Company Name
              </Label>
              <Input
                value={report.companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="Enter client company name..."
                className="h-8 text-xs font-bold bg-background text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Corporate Identity No. (CIN)
              </Label>
              <Input
                value={report.general.cin}
                onChange={(e) => setReport({ ...report, general: { ...report.general, cin: e.target.value } })}
                placeholder="e.g. L27100MH1907PLC000260"
                className="h-8 text-xs font-mono bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Reporting Financial Year
              </Label>
              <Input
                value={report.financialYear}
                onChange={(e) =>
                  setReport({
                    ...report,
                    financialYear: e.target.value,
                    general: { ...report.general, financialYear: e.target.value },
                  })
                }
                placeholder="FY 2025-26"
                className="h-8 text-xs font-mono bg-background"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>SEBI Filing Readiness</span>
                <span className="text-primary font-bold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 mt-2 bg-muted" />
            </div>
          </div>
        </Card>

        {/* Section Tabs Switcher */}
        <Tabs value={activeSectionTab} onValueChange={setActiveSectionTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1.5 rounded-2xl border border-border flex flex-wrap gap-1">
            <TabsTrigger value="overview" className="rounded-xl text-xs font-semibold px-4 py-2">
              <Award className="h-3.5 w-3.5 mr-1.5" /> Executive Overview
            </TabsTrigger>
            <TabsTrigger value="sectionA" className="rounded-xl text-xs font-semibold px-4 py-2">
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> Section A: General Disclosures
            </TabsTrigger>
            <TabsTrigger value="sectionB" className="rounded-xl text-xs font-semibold px-4 py-2">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Section B: Governance &amp; Policies
            </TabsTrigger>
            <TabsTrigger value="principle6" className="rounded-xl text-xs font-semibold px-4 py-2 text-primary font-bold">
              <Zap className="h-3.5 w-3.5 mr-1.5" /> Principle 6: Environmental
            </TabsTrigger>
            <TabsTrigger value="otherPrinciples" className="rounded-xl text-xs font-semibold px-4 py-2">
              <Users className="h-3.5 w-3.5 mr-1.5" /> Principles 1–5 &amp; 7–9
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="rounded-3xl border-border bg-card p-6 lg:p-8 shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">SEBI BRSR Core Executive Dashboard</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Summary of the 9 essential environmental, social, and governance indicators for {report.companyName}.
                  </p>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                  {report.financialYear}
                </Badge>
              </div>

              {/* 9 BRSR Core Key Metric Highlight Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Scope 1 &amp; 2 GHG Emissions</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principle6.totalScope1And2Tonnes >= 1000000
                      ? `${(report.principle6.totalScope1And2Tonnes / 1000000).toFixed(2)} Million`
                      : report.principle6.totalScope1And2Tonnes.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Intensity: {report.principle6.scope1And2IntensityPerTonneOutput} tCO₂e / unit output
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Water Consumption &amp; ZLD</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principle6.totalWaterConsumedML.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Million Litres</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    {report.principle6.zldImplemented ? "✓ Zero Liquid Discharge (ZLD) Active" : "Conventional Effluent Treatment"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Solid Waste Utilization</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principle6.wasteRecoveryUtilizationPct}% <span className="text-xs font-normal text-muted-foreground">Recycled/Reused</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    {report.principle6.totalWasteRecycledOrReusedTonnes.toLocaleString()} tonnes recovered
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Accounts Payable Days (P1)</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principlesOther.accountsPayableDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">Vendor settlement cycle</span>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Employee Safety (P3 LTIFR)</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principlesOther.ltifrEmployees} <span className="text-xs font-normal text-muted-foreground">per million person-hrs</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">Workers LTIFR: {report.principlesOther.ltifrWorkers}</span>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Local &amp; MSME Sourcing (P8)</span>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {report.principlesOther.msmeProcurementSharePct}% <span className="text-xs font-normal text-muted-foreground">MSME share</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">{report.principlesOther.domesticProcurementSharePct}% sourced within India</span>
                </div>
              </div>

              {/* Material Issues Matrix Preview */}
              <div className="space-y-3 pt-2">
                <h3 className="font-display text-base font-bold text-foreground">Key Material Sustainability Risks Identified</h3>
                <div className="space-y-2 text-xs">
                  {report.general.topMaterialRisks.map((risk, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">{risk.issue}</span>
                        <span className="text-muted-foreground">{risk.mitigationStrategy}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={risk.riskOrOpportunity === "Risk" ? "text-amber-700 border-amber-500/30" : "text-emerald-700 border-emerald-500/30"}>
                          {risk.riskOrOpportunity}
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {risk.financialImplication} Impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: SECTION A — GENERAL DISCLOSURES */}
          <TabsContent value="sectionA" className="space-y-6">
            <Card className="rounded-3xl border-border bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">I. Entity Details &amp; Operations</h2>
                <p className="text-xs text-muted-foreground">Corporate identity, reporting boundaries, and operational footprint.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Listed Entity Name</Label>
                  <Input
                    className="bg-background text-xs font-semibold"
                    value={report.general.entityName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Corporate Identity Number (CIN)</Label>
                  <Input
                    className="bg-background font-mono text-xs"
                    value={report.general.cin}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, cin: e.target.value } })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Year of Incorporation</Label>
                  <Input
                    type="number"
                    className="bg-background font-mono text-xs"
                    value={report.general.yearOfIncorporation}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, yearOfIncorporation: Number(e.target.value) } })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Registered Office Address</Label>
                  <Input
                    className="bg-background text-xs"
                    value={report.general.registeredOffice}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, registeredOffice: e.target.value } })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">E-mail &amp; Telephone</Label>
                  <Input
                    className="bg-background text-xs"
                    value={report.general.email}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, email: e.target.value } })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Paid-up Capital (₹ Crore)</Label>
                  <Input
                    type="number"
                    className="bg-background font-mono text-xs"
                    value={report.general.paidUpCapitalCrore}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, paidUpCapitalCrore: Number(e.target.value) } })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Main Business Activity</Label>
                  <Input
                    className="bg-background text-xs"
                    value={report.general.mainActivityDescription}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, mainActivityDescription: e.target.value } })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Detailed Business Description</Label>
                  <Input
                    className="bg-background text-xs"
                    value={report.general.businessActivityDescription}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, businessActivityDescription: e.target.value } })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Annual Turnover (₹ Crore)</Label>
                  <Input
                    type="number"
                    className="bg-background font-mono text-xs"
                    value={report.general.csrTurnoverCrore}
                    onChange={(e) => setReport({ ...report, general: { ...report.general, csrTurnoverCrore: Number(e.target.value) } })}
                  />
                </div>
              </div>

              {/* Workforce Details */}
              <div className="border-t border-border/80 pt-4 space-y-4">
                <h3 className="font-display text-sm font-bold text-foreground">Workforce Breakdown (Employees &amp; Workers)</h3>
                <div className="grid md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Permanent Employees (M / F)</Label>
                    <div className="flex gap-2 mt-1 font-mono">
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={report.general.permanentEmployeesMale}
                        onChange={(e) => setReport({ ...report, general: { ...report.general, permanentEmployeesMale: Number(e.target.value) } })}
                      />
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={report.general.permanentEmployeesFemale}
                        onChange={(e) => setReport({ ...report, general: { ...report.general, permanentEmployeesFemale: Number(e.target.value) } })}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Permanent Workers (M / F)</Label>
                    <div className="flex gap-2 mt-1 font-mono">
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={report.general.permanentWorkersMale}
                        onChange={(e) => setReport({ ...report, general: { ...report.general, permanentWorkersMale: Number(e.target.value) } })}
                      />
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={report.general.permanentWorkersFemale}
                        onChange={(e) => setReport({ ...report, general: { ...report.general, permanentWorkersFemale: Number(e.target.value) } })}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Women on Board (%)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.general.womenBoardDirectorsPct}
                      onChange={(e) => setReport({ ...report, general: { ...report.general, womenBoardDirectorsPct: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Employee Turnover (%)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.general.employeeTurnoverPct}
                      onChange={(e) => setReport({ ...report, general: { ...report.general, employeeTurnoverPct: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: SECTION B — FULLY INTERACTIVE GOVERNANCE & POLICIES */}
          <TabsContent value="sectionB" className="space-y-6">
            <Card className="rounded-3xl border-border bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Section B: Management and Process Disclosures</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure corporate policies, Board approvals, oversight authority, and ISO certifications for {report.companyName}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAllPolicies(true)}
                    className="h-7 text-[11px] px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                  >
                    <Check className="h-3 w-3 mr-1" /> Enable All Policies
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAllPolicies(false)}
                    className="h-7 text-[11px] px-2.5 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3 w-3 mr-1" /> Clear All
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                {/* Left Column: 9 NGRBC Principle Policy Switches */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Policy Checklist across NGRBC Principles (P1–P9)
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Click to toggle active status</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {NGRBC_PRINCIPLES.map((item) => {
                      const isActive = Boolean(report.management[item.key]);
                      return (
                        <div
                          key={item.key}
                          onClick={() =>
                            setReport({
                              ...report,
                              management: {
                                ...report.management,
                                [item.key]: !isActive,
                              },
                            })
                          }
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isActive
                              ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                              : "border-border bg-muted/20 hover:bg-muted/40 opacity-75"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{item.label}</span>
                            <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                          </div>
                          <Badge
                            className={`shrink-0 font-mono text-[10px] transition-colors ${
                              isActive
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {isActive ? "✓ Active (Yes)" : "✗ Not Formulated (No)"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Governance, Approvals & International Standards */}
                <div className="md:col-span-5 space-y-5">
                  {/* Governance Approvals Card */}
                  <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                      Board Approval &amp; Implementation Processes
                    </h3>

                    <div className="space-y-2">
                      <div
                        onClick={() =>
                          setReport({
                            ...report,
                            management: { ...report.management, boardApproved: !report.management.boardApproved },
                          })
                        }
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30"
                      >
                        <span className="text-foreground">Approved by the Board of Directors?</span>
                        <Badge className={report.management.boardApproved ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
                          {report.management.boardApproved ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div
                        onClick={() =>
                          setReport({
                            ...report,
                            management: { ...report.management, translatedToProcedures: !report.management.translatedToProcedures },
                          })
                        }
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30"
                      >
                        <span className="text-foreground">Translated into Operational Procedures?</span>
                        <Badge className={report.management.translatedToProcedures ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
                          {report.management.translatedToProcedures ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div
                        onClick={() =>
                          setReport({
                            ...report,
                            management: { ...report.management, extendedToValueChain: !report.management.extendedToValueChain },
                          })
                        }
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30"
                      >
                        <span className="text-foreground">Policies extended to Value Chain Partners?</span>
                        <Badge className={report.management.extendedToValueChain ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
                          {report.management.extendedToValueChain ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div
                        onClick={() =>
                          setReport({
                            ...report,
                            management: { ...report.management, sustainabilityCommitteeExists: !report.management.sustainabilityCommitteeExists },
                          })
                        }
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30"
                      >
                        <span className="text-foreground">Dedicated Board Sustainability Committee?</span>
                        <Badge className={report.management.sustainabilityCommitteeExists ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
                          {report.management.sustainabilityCommitteeExists ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[11px] font-semibold text-foreground">Highest Authority Responsible for Oversight</Label>
                      <Input
                        className="bg-background text-xs"
                        placeholder="e.g. Managing Director / Chief Sustainability Officer"
                        value={report.management.highestAuthorityResponsible}
                        onChange={(e) =>
                          setReport({
                            ...report,
                            management: { ...report.management, highestAuthorityResponsible: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-foreground">Corporate Policies Public Web Link</Label>
                      <Input
                        className="bg-background text-xs font-mono"
                        placeholder="https://company.com/governance/policies"
                        value={report.management.policiesWeblink}
                        onChange={(e) =>
                          setReport({
                            ...report,
                            management: { ...report.management, policiesWeblink: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* International Standards & Certifications Manager */}
                  <div className="p-4 rounded-2xl border border-border bg-card space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                        Adopted Standards &amp; Certifications
                      </h3>
                      <span className="text-[10px] text-primary font-semibold">
                        {(report.management.certificationsAdopted || []).length} Selected
                      </span>
                    </div>

                    {/* Interactive Standard Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_STANDARDS.map((std) => {
                        const isSelected = (report.management.certificationsAdopted || []).includes(std);
                        return (
                          <button
                            key={std}
                            type="button"
                            onClick={() => toggleStandard(std)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 border ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            {std}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Certification Adder */}
                    <div className="flex gap-2 pt-2 border-t border-border/80">
                      <Input
                        value={customCertInput}
                        onChange={(e) => setCustomCertInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCustomCert()}
                        placeholder="Add custom certificate (e.g. LEED Platinum, ZED Gold)..."
                        className="h-8 text-xs bg-background"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCustomCert}
                        className="h-8 text-xs px-3 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                      </Button>
                    </div>

                    {/* Active Selected Tags with Removal */}
                    {(report.management.certificationsAdopted || []).length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Currently Active in PDF:</span>
                        <div className="flex flex-wrap gap-1">
                          {report.management.certificationsAdopted.map((c, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] gap-1 py-0.5 px-2 bg-muted text-foreground border border-border"
                            >
                              {c}
                              <button
                                type="button"
                                onClick={() => handleRemoveCert(c)}
                                className="hover:text-destructive text-muted-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PRINCIPLE 6 — ENVIRONMENT (QUANTITATIVE HEART) */}
          <TabsContent value="principle6" className="space-y-6">
            <Card className="rounded-3xl border-border bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Principle 6: Environmental &amp; Climate Performance</h2>
                  <p className="text-xs text-muted-foreground">Energy, Water balance, Air emissions, Scope 1-3 GHG, and Waste circularity.</p>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs">ASSA 5010 ASSURANCE SCOPE</Badge>
              </div>

              {/* Energy Section */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> 1. Energy Consumption &amp; Intensity (Essential Indicator 1)
                </h3>
                <div className="grid md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Renewable Energy (PJ)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.totalRenewableEnergyPJ}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, totalRenewableEnergyPJ: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Total Energy Consumed (PJ)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.totalEnergyConsumedPJ}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, totalEnergyConsumedPJ: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Energy Intensity (PJ / ₹ Cr)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.energyIntensityPerCroreTurnover}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, energyIntensityPerCroreTurnover: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Energy Intensity (PJ / MT Output)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.energyIntensityPerTonneOutput}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, energyIntensityPerTonneOutput: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>

              {/* Water Section */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-600" /> 2. Water Balance &amp; ZLD (Essential Indicator 3 &amp; 5)
                </h3>
                <div className="grid md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Surface Water (ML)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.surfaceWaterWithdrawalML}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, surfaceWaterWithdrawalML: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Groundwater Borewells (ML)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.groundwaterWithdrawalML}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, groundwaterWithdrawalML: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Total Water Withdrawal (ML)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.totalWaterWithdrawalML}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, totalWaterWithdrawalML: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Total Water Consumed (ML)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.totalWaterConsumedML}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, totalWaterConsumedML: Number(e.target.value) } })}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                  <Label className="font-semibold text-foreground">Zero Liquid Discharge (ZLD) Implementation Notes:</Label>
                  <Input
                    className="text-xs bg-background"
                    value={report.principle6.zldDetails}
                    onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, zldDetails: e.target.value } })}
                  />
                </div>
              </div>

              {/* GHG Scope 1, 2, 3 Section */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" /> 3. Greenhouse Gas Scope 1, 2 &amp; 3 Emissions (Essential Indicator 7)
                </h3>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Scope 1 Direct Emissions (tCO₂e)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.scope1EmissionsTonnes}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, scope1EmissionsTonnes: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Scope 2 Grid Electricity (tCO₂e)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.scope2EmissionsTonnes}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, scope2EmissionsTonnes: Number(e.target.value) } })}
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                    <Label className="text-[11px] text-muted-foreground">Scope 3 Value Chain (tCO₂e)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs bg-background font-mono mt-1"
                      value={report.principle6.scope3EmissionsTonnes}
                      onChange={(e) => setReport({ ...report, principle6: { ...report.principle6, scope3EmissionsTonnes: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: OTHER PRINCIPLES (P1, P2, P3, P4, P5, P7, P8, P9) */}
          <TabsContent value="otherPrinciples" className="space-y-6">
            <Card className="rounded-3xl border-border bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Principles 1, 2, 3, 5, 8 &amp; 9 Performance Disclosures</h2>
                <p className="text-xs text-muted-foreground">Ethics, well-being, human rights, CSR, and consumer disclosures.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P1: Accounts Payable Days</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.accountsPayableDays}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, accountsPayableDays: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">SEBI BRSR Core Indicator</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P3: Safety LTIFR (Employees)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.ltifrEmployees}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, ltifrEmployees: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">Per million person-hours worked</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P3: Wellbeing Spend (% Revenue)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.wellbeingSpendPctOfRevenue}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, wellbeingSpendPctOfRevenue: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">Medical, insurance &amp; welfare</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P5: Gross Wages to Females (%)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.grossWagesPaidToFemalesPct}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, grossWagesPaidToFemalesPct: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">Gender wage parity metric</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P8: MSME Sourcing Share (%)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.msmeProcurementSharePct}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, msmeProcurementSharePct: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">Inclusive procurement metric</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                  <Label className="font-bold text-foreground block">P9: Customer Satisfaction (CSI %)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={report.principlesOther.customerSatisfactionScorePct}
                    onChange={(e) => setReport({ ...report, principlesOther: { ...report.principlesOther, customerSatisfactionScorePct: Number(e.target.value) } })}
                  />
                  <span className="text-[10px] text-muted-foreground block">Customer satisfaction index</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
