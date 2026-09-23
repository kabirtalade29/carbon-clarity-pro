import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  PieChart as PieIcon,
  Percent,
  Plus,
  Trash2,
  Download,
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/joint-ventures")({
  head: () => ({
    meta: [
      { title: "Joint Venture Hub — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JointVenturesPage,
});

type ConsolidationBoundary = "equity" | "operational" | "financial";

type JointVentureEntity = {
  id: string;
  name: string;
  partnerName: string;
  location: string;
  equityPercentage: number; // 0 to 100
  isOperator: boolean;
  hasFinancialControl: boolean;
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
};

const INITIAL_ENTITIES: JointVentureEntity[] = [
  {
    id: "jv-1",
    name: "Mumbai Clean Energy Consortium",
    partnerName: "Tata Power & CliSo Partner",
    location: "Trombay, Mumbai",
    equityPercentage: 40,
    isOperator: true,
    hasFinancialControl: false,
    scope1Tonnes: 620,
    scope2Tonnes: 1100,
    scope3Tonnes: 450,
  },
  {
    id: "jv-2",
    name: "Maharashtra Logistics & Depot Hub",
    partnerName: "Mahindra Logistics JV",
    location: "Bhiwandi, Maharashtra",
    equityPercentage: 50,
    isOperator: false,
    hasFinancialControl: true,
    scope1Tonnes: 850,
    scope2Tonnes: 240,
    scope3Tonnes: 380,
  },
  {
    id: "jv-3",
    name: "Western Region Data & Cloud Infra",
    partnerName: "Equinix Asia JV",
    location: "Navi Mumbai",
    equityPercentage: 25,
    isOperator: false,
    hasFinancialControl: false,
    scope1Tonnes: 120,
    scope2Tonnes: 1850,
    scope3Tonnes: 290,
  },
  {
    id: "jv-4",
    name: "Thane Industrial Fabrication Facility",
    partnerName: "Wholly Owned Subsidiary",
    location: "Thane, Maharashtra",
    equityPercentage: 100,
    isOperator: true,
    hasFinancialControl: true,
    scope1Tonnes: 1250,
    scope2Tonnes: 680,
    scope3Tonnes: 820,
  },
];

const COLORS = ["#1F4F3A", "#D97706", "#2563EB", "#7C3AED", "#059669"];

function JointVenturesPage() {
  const [boundary, setBoundary] = useState<ConsolidationBoundary>("equity");
  const [entities, setEntities] = useState<JointVentureEntity[]>(INITIAL_ENTITIES);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for new JV
  const [newName, setNewName] = useState("");
  const [newPartner, setNewPartner] = useState("");
  const [newLocation, setNewLocation] = useState("Mumbai, India");
  const [newEquity, setNewEquity] = useState(50);
  const [newS1, setNewS1] = useState("500");
  const [newS2, setNewS2] = useState("300");
  const [newS3, setNewS3] = useState("200");
  const [newIsOperator, setNewIsOperator] = useState(true);

  const handleEquityChange = (id: string, newPct: number) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, equityPercentage: newPct } : e)),
    );
  };

  const handleAddEntity = () => {
    if (!newName.trim() || !newPartner.trim()) {
      toast.error("Please fill in entity name and partner");
      return;
    }
    const created: JointVentureEntity = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      partnerName: newPartner.trim(),
      location: newLocation.trim(),
      equityPercentage: newEquity,
      isOperator: newIsOperator,
      hasFinancialControl: newEquity >= 50,
      scope1Tonnes: parseFloat(newS1) || 0,
      scope2Tonnes: parseFloat(newS2) || 0,
      scope3Tonnes: parseFloat(newS3) || 0,
    };
    setEntities((prev) => [...prev, created]);
    setIsAddOpen(false);
    setNewName("");
    setNewPartner("");
    toast.success(`Added ${created.name} to Joint Venture Portfolio`);
  };

  const handleDeleteEntity = (id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entity removed");
  };

  // Calculations per entity based on active boundary
  const summaryData = useMemo(() => {
    let totalGrossT = 0;
    let totalAttributedT = 0;
    let totalS1Attributed = 0;
    let totalS2Attributed = 0;
    let totalS3Attributed = 0;

    const rows = entities.map((ent) => {
      const grossTotal = ent.scope1Tonnes + ent.scope2Tonnes + ent.scope3Tonnes;
      let multiplier = 1;

      if (boundary === "equity") {
        multiplier = ent.equityPercentage / 100;
      } else if (boundary === "operational") {
        multiplier = ent.isOperator ? 1 : 0;
      } else if (boundary === "financial") {
        multiplier = ent.hasFinancialControl ? 1 : 0;
      }

      const attrTotal = grossTotal * multiplier;
      const attrS1 = ent.scope1Tonnes * multiplier;
      const attrS2 = ent.scope2Tonnes * multiplier;
      const attrS3 = ent.scope3Tonnes * multiplier;

      totalGrossT += grossTotal;
      totalAttributedT += attrTotal;
      totalS1Attributed += attrS1;
      totalS2Attributed += attrS2;
      totalS3Attributed += attrS3;

      return {
        ...ent,
        grossTotal,
        multiplier,
        attrTotal,
        attrS1,
        attrS2,
        attrS3,
      };
    });

    return {
      rows,
      totalGrossT,
      totalAttributedT,
      totalS1Attributed,
      totalS2Attributed,
      totalS3Attributed,
    };
  }, [entities, boundary]);

  // Chart data
  const chartData = summaryData.rows.map((r) => ({
    name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name,
    Attributed: Math.round(r.attrTotal),
    Gross: Math.round(r.grossTotal),
    EquityPct: r.equityPercentage,
  }));

  const pieData = summaryData.rows.map((r) => ({
    name: r.name,
    value: Math.round(r.attrTotal),
  }));

  const exportJvPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
    doc.setFillColor(31, 79, 58);
    doc.rect(0, 0, 595, 96, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("clisomumbai", 48, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Climate Social Mumbai — Joint Venture & Multi-Entity Consolidation (${boundary.toUpperCase()} SHARE)`, 48, 62);
    doc.setFontSize(8);
    doc.setTextColor("#A5D6A7");
    doc.text("GHG PROTOCOL CHAPTER 3 & IFRS S2 / AASB S2 ALIGNED", 48, 80);

    let y = 130;
    doc.setTextColor("#1F2937");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Consolidated Organization Portfolio Summary", 48, y);

    y += 24;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Gross Portfolio Footprint: ${summaryData.totalGrossT.toLocaleString()} t CO₂e`, 48, y);
    y += 18;
    doc.text(`Attributed Corporate Footprint: ${summaryData.totalAttributedT.toLocaleString()} t CO₂e (${boundary.toUpperCase()} BASIS)`, 48, y);
    y += 18;
    doc.text(`Scope 1 Attributed: ${summaryData.totalS1Attributed.toLocaleString()} t | Scope 2: ${summaryData.totalS2Attributed.toLocaleString()} t | Scope 3: ${summaryData.totalS3Attributed.toLocaleString()} t`, 48, y);

    y += 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Entity Breakdown", 48, y);

    y += 18;
    doc.setFontSize(9);
    doc.text("Entity Name", 48, y);
    doc.text("Ownership", 220, y);
    doc.text("Operator", 290, y);
    doc.text("Gross Footprint", 370, y);
    doc.text("Attributed Share", 460, y);

    y += 8;
    doc.setDrawColor(200);
    doc.line(48, y, 547, y);

    doc.setFont("helvetica", "normal");
    summaryData.rows.forEach((r) => {
      y += 18;
      doc.text(r.name.substring(0, 26), 48, y);
      doc.text(`${r.equityPercentage}%`, 220, y);
      doc.text(r.isOperator ? "Yes (Operating)" : "No (Non-operating)", 290, y);
      doc.text(`${Math.round(r.grossTotal).toLocaleString()} t`, 370, y);
      doc.text(`${Math.round(r.attrTotal).toLocaleString()} t`, 460, y);
    });

    // Footer
    doc.setDrawColor(210);
    doc.line(48, 800, 547, 800);
    doc.setTextColor("#6B7280");
    doc.setFontSize(8);
    doc.text("Generated by clisomumbai (Climate Social Mumbai). Verified multi-entity equity allocation engine.", 48, 815);

    doc.save("clisomumbai-joint-venture-consolidation.pdf");
    toast.success("Exported Joint Venture Consolidation PDF");
  };

  return (
    <AppShell>
      {/* Top Banner */}
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4 border-b pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Enterprise Governance & Consolidation
          </p>
          <h1 className="mt-1 font-display text-4xl">Joint Venture & Multi-Entity Hub</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Manage multi-organization equity shares, joint ventures, and subsidiaries. Apportion
            Scope 1, 2, and 3 emissions across ownership boundaries in compliance with GHG Protocol &
            IFRS S2 standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 text-xs">
                <Plus className="h-4 w-4" /> Add JV / Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add Joint Venture or Subsidiary</DialogTitle>
                <DialogDescription className="text-xs">
                  Enter facility ownership details and baseline emissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-3 text-xs">
                <div>
                  <Label>Entity / Facility Name</Label>
                  <Input
                    placeholder="e.g. Pune Manufacturing Consortium"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Partner Organization</Label>
                  <Input
                    placeholder="e.g. Reliance Energy & CliSo Partner"
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Equity Ownership ({newEquity}%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newEquity}
                      onChange={(e) => setNewEquity(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Scope 1 (t CO₂e)</Label>
                    <Input value={newS1} onChange={(e) => setNewS1(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Scope 2 (t CO₂e)</Label>
                    <Input value={newS2} onChange={(e) => setNewS2(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Scope 3 (t CO₂e)</Label>
                    <Input value={newS3} onChange={(e) => setNewS3(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isOp"
                    checked={newIsOperator}
                    onChange={(e) => setNewIsOperator(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isOp" className="cursor-pointer">
                    Organization exercises Operational Control (Direct Operator)
                  </Label>
                </div>
                <Button onClick={handleAddEntity} className="mt-2 w-full">
                  Save Entity
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportJvPdf} className="gap-2 text-xs">
            <Download className="h-4 w-4" /> Export Report (PDF)
          </Button>
        </div>
      </div>

      {/* Consolidation Boundary Tab Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <span className="font-semibold text-sm block">Consolidation Boundary Lens</span>
            <span className="text-xs text-muted-foreground">
              Determines how joint venture emissions are aggregated for disclosure.
            </span>
          </div>
        </div>
        <Tabs value={boundary} onValueChange={(v) => setBoundary(v as ConsolidationBoundary)}>
          <TabsList>
            <TabsTrigger value="equity" className="gap-1.5 text-xs">
              <Percent className="h-3.5 w-3.5" /> Equity Share Basis
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Operational Control
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-1.5 text-xs">
              <PieIcon className="h-3.5 w-3.5" /> Financial Control
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl p-5 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Attributed Corporate Baseline ({boundary.toUpperCase()})
          </p>
          <p className="mt-2 font-display text-3xl text-primary font-bold">
            {Math.round(summaryData.totalAttributedT).toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e/yr</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            From {summaryData.totalGrossT.toLocaleString()} t gross portfolio footprint
          </p>
        </Card>

        <Card className="rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Scope 1 (Direct Share)</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {Math.round(summaryData.totalS1Attributed).toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {summaryData.totalAttributedT > 0
              ? ((summaryData.totalS1Attributed / summaryData.totalAttributedT) * 100).toFixed(1)
              : 0}
            % of attributed portfolio
          </p>
        </Card>

        <Card className="rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Scope 2 (Electricity Share)</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {Math.round(summaryData.totalS2Attributed).toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {summaryData.totalAttributedT > 0
              ? ((summaryData.totalS2Attributed / summaryData.totalAttributedT) * 100).toFixed(1)
              : 0}
            % of attributed portfolio
          </p>
        </Card>

        <Card className="rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Scope 3 (Value Chain Share)</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {Math.round(summaryData.totalS3Attributed).toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">t CO₂e</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {summaryData.totalAttributedT > 0
              ? ((summaryData.totalS3Attributed / summaryData.totalAttributedT) * 100).toFixed(1)
              : 0}
            % of attributed portfolio
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">
            Gross vs. Attributed Emissions by Joint Venture Asset
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#888888" />
                <YAxis fontSize={11} stroke="#888888" />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} t CO₂e`, ""]}
                  contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Gross" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Gross Asset Total" />
                <Bar dataKey="Attributed" fill="#1F4F3A" radius={[4, 4, 0, 0]} name="Attributed Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Portfolio Emission Share</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} t CO₂e`, ""]}
                  contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Interactive Entity Table with Ownership Sliders */}
      <Card className="rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Entity Portfolio & Equity Allocation</h3>
            <p className="text-xs text-muted-foreground">
              Adjust ownership sliders to simulate restructuring or divestment impacts on corporate GHG disclosures.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity & Partners</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-48">Equity Share (%)</TableHead>
                <TableHead>Control Rights</TableHead>
                <TableHead>Gross Baseline</TableHead>
                <TableHead className="font-bold text-primary">Attributed Emissions</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.partnerName}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {r.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[r.equityPercentage]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => handleEquityChange(r.id, val[0])}
                        className="w-24"
                      />
                      <span className="text-xs font-bold w-9">{r.equityPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {r.isOperator ? (
                        <Badge variant="outline" className="text-[10px] w-fit bg-emerald-50 text-emerald-700 border-emerald-300">
                          Operator
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] w-fit text-muted-foreground">
                          Non-Operator
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{Math.round(r.grossTotal).toLocaleString()} t</div>
                    <div className="text-[10px] text-muted-foreground">
                      S1: {r.scope1Tonnes}t | S2: {r.scope2Tonnes}t
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary text-sm">
                    {Math.round(r.attrTotal).toLocaleString()} t CO₂e
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteEntity(r.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AppShell>
  );
}
