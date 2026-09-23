import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  Droplets,
  Shield,
  Gauge,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Building2,
  Sliders,
  ChevronRight,
  TrendingDown,
  FileCheck2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Factory,
  Globe2,
  Flame,
  Scale,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Calculator,
  Compass,
  Play,
  RotateCcw,
  Cpu,
  Fingerprint,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "clisomumbai — Enterprise Carbon & Resource Intelligence Platform" },
      {
        name: "description",
        content:
          "Audit-defensible Scope 1-3 GHG calculations, SEBI BRSR Core Principle 6, EU CBAM DG TAXUD XML exports, and GRI 303 Water Stewardship for Indian industrial enterprises.",
      },
      { property: "og:title", content: "clisomumbai — Enterprise Carbon & Resource Intelligence" },
      {
        property: "og:description",
        content:
          "Activity-based GHG Protocol accounting, CEA Grid Baseline v19, EU CBAM XML generation, and cryptographic SHA-256 audit packs.",
      },
    ],
  }),
  component: LandingPage,
});

export function LandingPage() {
  const navigate = useNavigate();

  // Navigation / Interactive Showcase State
  const [activeTab, setActiveTab] = useState<"ledger" | "cbam" | "water" | "decarb" | "audit">("ledger");
  const [solutionsView, setSolutionsView] = useState<"role" | "industry">("role");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Interactive Live Demo States in Showcase Tabs
  const [extraFuelSim, setExtraFuelSim] = useState(0);
  const [selectedHsn, setSelectedHsn] = useState("72081000");
  const [waterRecycleRate, setWaterRecycleRate] = useState(68);
  const [simulatedHash, setSimulatedHash] = useState("634fab86e04d7c1a93e8201fa4b79c3d441e89");
  const [isHashing, setIsHashing] = useState(false);

  // Interactive Estimator State
  const [sector, setSector] = useState("steel");
  const [turnover, setTurnover] = useState(150);
  const [powerUnitsMWh, setPowerUnitsMWh] = useState(3500);
  const [fuelLitres, setFuelLitres] = useState(48000);
  const [euExportsTonnes, setEuExportsTonnes] = useState(10000);

  // Computed Values for Real-time Estimator
  const scope1Est = useMemo(() => Math.round(((fuelLitres + extraFuelSim) * 2.68) / 1000), [fuelLitres, extraFuelSim]);
  const scope2Est = useMemo(() => Math.round(powerUnitsMWh * 0.716), [powerUnitsMWh]);
  const totalGhg = scope1Est + scope2Est;
  const cbamRiskPenaltyEur = useMemo(() => Math.round(euExportsTonnes * 1.82 * 69), [euExportsTonnes]);
  const brsrScore = useMemo(() => Math.min(99, Math.round(78 + (turnover > 100 ? 14 : 8))), [turnover]);
  const waterEstKL = useMemo(() => Math.round(turnover * 220), [turnover]);

  // Dynamic Chart Data for Estimator
  const chartData = useMemo(() => [
    { name: "Scope 1 Direct", value: scope1Est, fill: "var(--primary)" },
    { name: "Scope 2 Grid", value: scope2Est, fill: "oklch(0.46 0.078 155)" },
    { name: "Abatement Potential", value: Math.round(totalGhg * 0.35), fill: "oklch(0.68 0.13 55)" },
  ], [scope1Est, scope2Est, totalGhg]);

  const handleLaunchDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("demo_user_session", "true");
    }
    toast.success("Demo Workspace Initialized", {
      description: "You have full access to clisomumbai audit ledgers and tools.",
    });
    navigate({ to: "/dashboard" });
  };

  const handleSimulateHash = () => {
    setIsHashing(true);
    setTimeout(() => {
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setSimulatedHash(randomHex);
      setIsHashing(false);
      toast.success("SHA-256 Checksum Re-calculated", {
        description: `Evidence Package stamped: ${randomHex.slice(0, 16)}...`,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* 1. TOP LIVE TICKER / REGULATORY MARQUEE */}
      <div className="relative overflow-hidden border-b border-border/80 bg-muted/40 py-2 text-xs font-medium">
        <div className="flex animate-marquee items-center gap-8 whitespace-nowrap text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
            <strong className="text-foreground">SEBI BRSR Core:</strong> 9 Essential Indicators &amp; Reasonable Assurance
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <strong className="text-foreground">EU CBAM Reg 2023/956:</strong> Definitive Transition XML Ready
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-foreground">India CEA v19 Baseline:</strong> 0.716 kg CO₂/kWh Factor
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-foreground">ASSA 5010 Alignment:</strong> Cryptographic SHA-256 Lineage
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <strong className="text-foreground">GRI 303 &amp; ZLD:</strong> Zero Liquid Discharge Ledger
          </span>
        </div>
      </div>

      {/* 2. ENTERPRISE HEADER WITH GROWW-STYLE MEGA MENUS */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
            >
              <Leaf className="h-5 w-5" />
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-foreground">clisomumbai</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">Enterprise</span>
              </div>
              <span className="text-[10px] font-sans text-muted-foreground -mt-0.5 tracking-tight">
                Climate Social Mumbai
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none py-2 cursor-pointer">
                Solutions <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[520px] p-4 grid grid-cols-2 gap-4 bg-popover border-border shadow-xl rounded-2xl animate-rise">
                <div>
                  <DropdownMenuLabel className="text-[11px] font-bold text-primary tracking-wider uppercase">
                    By Executive Role
                  </DropdownMenuLabel>
                  <div className="space-y-1 mt-1">
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("role")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" /> CFO &amp; Finance Directors
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">Audit-defensible sign-off under Sec 180</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("role")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Factory className="h-3.5 w-3.5 text-emerald-600" /> Sustainability Leads &amp; EHS
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">Reclaim time spent chasing plant dockets</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("role")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-sky-600" /> ESG Consultants &amp; Advisors
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">Multi-tenant client accounts &amp; white-label packs</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("role")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-amber-600" /> Board &amp; Audit Committee
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">Tamper-evident verification dossier</span>
                      </a>
                    </DropdownMenuItem>
                  </div>
                </div>

                <div className="border-l border-border/60 pl-3">
                  <DropdownMenuLabel className="text-[11px] font-bold text-primary tracking-wider uppercase">
                    By Heavy Industry
                  </DropdownMenuLabel>
                  <div className="space-y-1 mt-1">
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("industry")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground">Steel &amp; Metallurgy</span>
                        <span className="text-[11px] text-muted-foreground font-normal">Blast furnace, DRI &amp; CBAM chapter 72</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("industry")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground">Aluminium &amp; Non-Ferrous</span>
                        <span className="text-[11px] text-muted-foreground font-normal">Electrolysis anode PFCs &amp; energy intensity</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("industry")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground">Chemicals &amp; Pharma</span>
                        <span className="text-[11px] text-muted-foreground font-normal">Solvents, steam &amp; zero liquid discharge</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#solutions" onClick={() => setSolutionsView("industry")} className="cursor-pointer flex flex-col items-start p-2 rounded-xl hover:bg-muted/60 transition-colors">
                        <span className="font-semibold text-xs text-foreground">Textiles &amp; Commercial Infra</span>
                        <span className="text-[11px] text-muted-foreground font-normal">GRI 303 water stress &amp; Scope 2 PPA</span>
                      </a>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none py-2 cursor-pointer">
                Features <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[360px] p-2 bg-popover border-border shadow-xl rounded-2xl animate-rise">
                <DropdownMenuItem onClick={() => setActiveTab("ledger")} asChild>
                  <a href="#showcase" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Direct Scope 1-2-3 Ledger</div>
                      <div className="text-[11px] text-muted-foreground">CEA v19, IPCC 2006 &amp; DEFRA</div>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("cbam")} asChild>
                  <a href="#showcase" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 grid place-items-center">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">EU CBAM DG TAXUD XML</div>
                      <div className="text-[11px] text-muted-foreground">HSN-to-CN mapping engine</div>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("water")} asChild>
                  <a href="#showcase" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-600 grid place-items-center">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Water Stewardship (GRI 303)</div>
                      <div className="text-[11px] text-muted-foreground">Circularity, ZLD &amp; CGWB aquifers</div>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("audit")} asChild>
                  <a href="#showcase" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 grid place-items-center">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">SHA-256 Audit Evidence Pack</div>
                      <div className="text-[11px] text-muted-foreground">ASSA 5010 cryptographic lineage</div>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* How It Works Link */}
            <a href="#how-it-works" className="hover:text-foreground transition-colors py-2">
              How It Works
            </a>

            {/* Free Tools */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none py-2 text-primary font-bold cursor-pointer">
                <Sparkles className="h-3.5 w-3.5 animate-pulse-subtle" /> Free Tools <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[320px] p-2 bg-popover border-border shadow-xl rounded-2xl animate-rise">
                <DropdownMenuItem asChild>
                  <Link to="/cbam-checker" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <Calculator className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">EU CBAM Exposure Screener</div>
                      <div className="text-[11px] text-muted-foreground">Check your HSN tariff risk</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#estimator" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                    <Sliders className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">ESG &amp; Carbon Liability Estimator</div>
                      <div className="text-[11px] text-muted-foreground">Real-time facility simulation</div>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#benchmark" className="hover:text-foreground transition-colors py-2">
              Benchmark
            </a>

            <a href="#pricing" className="hover:text-foreground transition-colors py-2">
              Pricing
            </a>

            <a href="#about" className="hover:text-foreground transition-colors py-2">
              About
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 hidden sm:inline-block"
            >
              Sign in
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleLaunchDemo}
                size="sm"
                className="font-semibold text-xs px-4 h-9 shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                Open Workspace <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (GROWW + CARBONLY MOTION DESIGN) */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Animated Fluid Ambient Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 30, 0],
              y: [0, 40, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-48 right-10 w-[400px] h-[300px] bg-sky-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
              BUILT FOR SEBI BRSR CORE &amp; EU CBAM 2026 MANDATES
            </motion.div>

            {/* Headline with Staggered Kinetic Motion */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.1]"
            >
              Your Corporate Carbon Reporting. <br />
              <span className="italic font-serif text-primary bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text">
                Done. Verified. Audit-Proof.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Stop relying on spend-based approximations that fail assurance under <span className="text-foreground font-semibold">ASSA 5010</span>. 
              <strong> clisomumbai</strong> converts factory weighbridge slips, fuel dockets, electricity bills, and invoices into verifiable Scope 1-3 GHG ledgers, EU CBAM XML filings, and GRI 303 water disclosures.
            </motion.p>

            {/* Primary Action Row with Motion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={handleLaunchDemo}
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 font-semibold text-sm gap-2 shadow-lg bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" /> Launch Demo Workspace <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/cbam-checker"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-border bg-card hover:bg-muted/70 text-sm font-semibold transition-all shadow-xs gap-2 text-foreground"
                >
                  <Calculator className="h-4 w-4 text-primary" /> Check EU CBAM Exposure
                </Link>
              </motion.div>
            </motion.div>

            {/* Key Trust Signals Bar with Groww-style Tilt Hover */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left"
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-xs"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                  <span>India CEA v19</span>
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">0.716 kg</div>
                <div className="text-[11px] text-muted-foreground">CO₂e per kWh Grid Factor</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-xs"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                  <span>EU CBAM Penalty</span>
                  <Globe2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="font-display text-2xl font-bold text-primary mt-1">€69 / tonne</div>
                <div className="text-[11px] text-muted-foreground">Default Fine Protection</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-xs"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                  <span>Audit Standard</span>
                  <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">ASSA 5010</div>
                <div className="text-[11px] text-muted-foreground">Limited/Reasonable Assurance</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-xs"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                  <span>Cryptographic Proof</span>
                  <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="font-display text-2xl font-bold text-emerald-700 mt-1">SHA-256</div>
                <div className="text-[11px] text-muted-foreground">Tamper-Proof Dossier ZIP</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. GROWW-STYLE TABBED INTERACTIVE PRODUCT SHOWCASE (WITH MOTION & LIVE ACTIONS) */}
      <section id="showcase" className="py-24 border-y border-border bg-muted/20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Live Interactive Engines
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1 font-normal">
              Everything Your Enterprise Needs in One Ledger
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a module below to test real-time activity calculations, XML validation, and cryptographic hash lineage.
            </p>

            {/* Groww-style Segmented Tabs with Spring layoutId indicator */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl border border-border bg-card shadow-sm">
              {[
                { id: "ledger", label: "Scope 1-2-3 Direct Ledger", icon: Zap },
                { id: "cbam", label: "EU CBAM XML Declarant", icon: Globe2 },
                { id: "water", label: "Water & ZLD (GRI 303)", icon: Droplets },
                { id: "decarb", label: "Decarbonization MACC", icon: TrendingDown },
                { id: "audit", label: "SHA-256 Audit Evidence", icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeShowcaseTab"
                        className="absolute inset-0 bg-primary rounded-xl shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 ${isSelected ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}>
                      <Icon className="h-4 w-4" /> {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Tab Content Display Card */}
          <div className="rounded-3xl border border-border bg-card p-6 lg:p-10 shadow-xl overflow-hidden min-h-[460px]">
            <AnimatePresence mode="wait">
              {activeTab === "ledger" && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-mono text-xs">
                      EMISSION FACTOR ENGINE
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                      Physical activity data, not spend estimates.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Capture kilowatt-hours, litres of diesel, tonnes of coal, and refrigerant top-ups directly from factory telemetry and invoice lines. Automatically mapped against India CEA Baseline v19 and IPCC 2006 tables.
                    </p>
                    <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Full Scope 1 (Stationary, Mobile &amp; Fugitive) calculations
                      </li>
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Scope 2 Location-based &amp; Market-based (Green Tariffs)
                      </li>
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Upstream Category 1-8 Scope 3 physical material cascade
                      </li>
                    </ul>

                    {/* Interactive Simulator Trigger */}
                    <div className="pt-3 flex items-center gap-3">
                      <Button onClick={handleLaunchDemo} className="gap-2 font-semibold">
                        Open Direct Ledger <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExtraFuelSim((prev) => prev + 5000);
                          toast.success("Simulated 5,000L Fuel Docket Ingested", {
                            description: "Ledger recalculating with CEA v19 factor...",
                          });
                        }}
                        className="text-xs gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> + Ingest Test Docket
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <span className="text-xs font-semibold text-muted-foreground">INVENTORY LINE ITEMS (FY 2026-27)</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">CEA v19 VERIFIED</Badge>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="font-semibold text-foreground block">Facility Grid Power (Maharashtra MSEDCL)</span>
                            <span className="text-[11px] text-muted-foreground">{powerUnitsMWh.toLocaleString()} MWh × 0.716 kg CO₂/kWh</span>
                          </div>
                          <span className="font-mono font-bold text-foreground text-sm">{scope2Est.toLocaleString()} tCO₂e</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="font-semibold text-foreground block">Heavy Machinery Diesel (HSD)</span>
                            <span className="text-[11px] text-muted-foreground">{(fuelLitres + extraFuelSim).toLocaleString()} Litres × 2.68 kg CO₂/L</span>
                          </div>
                          <span className="font-mono font-bold text-primary text-sm">{scope1Est.toLocaleString()} tCO₂e</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="font-semibold text-foreground block">Chiller Refrigerant Top-up (R-134a)</span>
                            <span className="text-[11px] text-muted-foreground">12 kg × 1,430 GWP factor</span>
                          </div>
                          <span className="font-mono font-bold text-foreground text-sm">17.2 tCO₂e</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "cbam" && (
                <motion.div
                  key="cbam"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="outline" className="bg-sky-500/10 text-sky-700 border-sky-500/20 font-mono text-xs">
                      EU REGULATION 2023/956
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                      Automated Indian HSN to EU CN Mapping &amp; XML Export.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Avoid devastating €69/tonne default carbon tax penalties. Map chapter 72/73 steel, aluminium, and fertilizer exports into the official DG TAXUD transitional XML format in 1 click.
                    </p>
                    <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
                      <Label className="text-xs font-semibold">Select Export HSN Code to Test:</Label>
                      <Select value={selectedHsn} onValueChange={setSelectedHsn}>
                        <SelectTrigger className="bg-card text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="72081000">7208.10.00 — Flat-rolled steel coils</SelectItem>
                          <SelectItem value="72071100">7207.11.00 — Semi-finished steel billets</SelectItem>
                          <SelectItem value="76011000">7601.10.00 — Unwrought primary aluminium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-2">
                      <Link to="/cbam-checker">
                        <Button className="gap-2 font-semibold">
                          Run Full CBAM Screener <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <span className="text-xs font-semibold text-muted-foreground">DG TAXUD XML SPECIFICATION</span>
                        <Badge className="bg-emerald-600 text-white font-mono text-[10px]">XSD v1.2 VALID</Badge>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                        <div className="flex justify-between font-mono">
                          <span className="text-muted-foreground">HSN {selectedHsn} → CN {selectedHsn.slice(0, 4)} {selectedHsn.slice(4, 6)} {selectedHsn.slice(6)}</span>
                          <span className="text-primary font-bold">1.82 tCO₂e / t</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-[11px]">
                          <span>Direct Embedded: 1.42 t</span>
                          <span>Indirect Embedded: 0.40 t</span>
                        </div>
                        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-sky-600 rounded-full"
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-border/80 bg-card/60 text-xs font-mono text-muted-foreground">
                        &lt;cbam:Declaration xmlns:cbam=&quot;http://ec.europa.eu/taxud/cbam/v1&quot;&gt;
                        <br />&nbsp;&nbsp;&lt;cbam:GoodsItem CNCode=&quot;{selectedHsn}&quot; NetMassTonnes=&quot;{euExportsTonnes}&quot; /&gt;
                        <br />&nbsp;&nbsp;&lt;cbam:SpecificEmbeddedEmissions Direct=&quot;1.42&quot; Indirect=&quot;0.40&quot; /&gt;
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "water" && (
                <motion.div
                  key="water"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 border-cyan-500/20 font-mono text-xs">
                      GRI 303 &amp; SEBI PRINCIPLE 6
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                      Complete Water Circularity &amp; Zero Liquid Discharge.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Track groundwater withdrawal against Central Ground Water Board (CGWB) aquifer stress categories. Monitor RO recovery, MEE evaporation, and Zero Liquid Discharge (ZLD) ratios.
                    </p>
                    <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Simulate RO Recycling Efficiency:</span>
                        <span className="text-cyan-700 font-mono">{waterRecycleRate}%</span>
                      </div>
                      <Slider
                        value={[waterRecycleRate]}
                        max={98}
                        min={30}
                        step={1}
                        onValueChange={(val) => setWaterRecycleRate(val[0])}
                      />
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleLaunchDemo} className="gap-2 font-semibold">
                        View Water Accounting <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <span className="text-xs font-semibold text-muted-foreground">FACILITY WATER BALANCE (kL/yr)</span>
                        <Badge variant="outline" className="text-cyan-700 border-cyan-500/30 text-[10px] font-mono">ZLD CERTIFIED</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-4 rounded-xl border border-border bg-card">
                          <span className="text-muted-foreground text-[11px] block">Freshwater Intake</span>
                          <span className="font-display text-2xl font-bold text-foreground mt-0.5 block">{waterEstKL.toLocaleString()} kL</span>
                          <span className="text-[10px] text-muted-foreground">Borewell + Municipal</span>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card">
                          <span className="text-muted-foreground text-[11px] block">Recycled &amp; Reused</span>
                          <span className="font-display text-2xl font-bold text-cyan-700 mt-0.5 block">
                            {Math.round((waterEstKL * waterRecycleRate) / 100).toLocaleString()} kL
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">{waterRecycleRate}% Circularity Index</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "decarb" && (
                <motion.div
                  key="decarb"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-mono text-xs">
                      NET ZERO ROADMAP ENGINE
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                      Marginal Abatement Cost Curves (MACC) &amp; ROI.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Prioritize capital allocation across rooftop solar, waste heat recovery systems (WHRS), variable frequency drives (VFD), and biomass boilers with precise IRR and payback timelines.
                    </p>
                    <div className="p-3.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold block text-foreground">Total Abatement Pipeline:</span>
                        <span className="text-muted-foreground">4 prioritized capital projects</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold text-base">-1,840 tCO₂e</span>
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleLaunchDemo} className="gap-2 font-semibold">
                        Explore Decarbonization Planner <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/80">
                        <span className="text-xs font-semibold text-muted-foreground">ABATEMENT INITIATIVES</span>
                        <span className="text-xs text-emerald-700 font-bold">Total Potential: -1,840 tCO₂e</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl border border-border bg-card flex justify-between items-center shadow-2xs">
                          <div>
                            <span className="font-semibold text-foreground">Rooftop Solar 1.2 MW PPA</span>
                            <span className="text-[11px] text-muted-foreground block">Capex: ₹4.2 Cr • Payback: 3.4 yrs</span>
                          </div>
                          <Badge variant="secondary" className="font-mono text-emerald-700">-860 tCO₂e</Badge>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl border border-border bg-card flex justify-between items-center shadow-2xs">
                          <div>
                            <span className="font-semibold text-foreground">Waste Heat Recovery (WHRS)</span>
                            <span className="text-[11px] text-muted-foreground block">Capex: ₹2.8 Cr • Payback: 2.1 yrs</span>
                          </div>
                          <Badge variant="secondary" className="font-mono text-emerald-700">-620 tCO₂e</Badge>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "audit" && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 font-mono text-xs">
                      ASSA 5010 ASSURANCE
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                      Cryptographic SHA-256 Audit Evidence Pack.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Download an immutable ZIP bundle containing calculation lineage JSON, raw invoice metadata, verifier certificates, and digital hash signatures ready for Big-4 assurance interviews.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <Button onClick={handleLaunchDemo} className="gap-2 font-semibold">
                        Generate Live Pack <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSimulateHash}
                        disabled={isHashing}
                        className="text-xs gap-1.5"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 ${isHashing ? "animate-spin" : ""}`} />
                        {isHashing ? "Hashing..." : "Re-Calculate Hash"}
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-border/80">
                        <span className="text-muted-foreground">EVIDENCE DOSSIER BUNDLE</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-500/30 text-[10px]">
                          {isHashing ? "HASHING..." : "SHA-256 VERIFIED"}
                        </Badge>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-[11px]">
                        <div className="flex items-center gap-2 text-foreground">
                          <FileCheck2 className="h-4 w-4 text-primary" /> 01_Executive_Summary.pdf
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> 02_Scope1_Scope2_Ledger.xlsx
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Layers className="h-4 w-4 text-sky-600" /> 03_Methodology_and_Lineage.json
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-border/60 truncate font-mono">
                          Digital Seal: {simulatedHash}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. "HOW IT WORKS" 3-STAGE PIPELINE (INSPIRED BY CARBONLY.AI) */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              The 3-Step Operating Workflow
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1 font-normal">
              The Work is Already Done When You Log In
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From raw factory receipts to auditor sign-off in three seamless, automated phases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-border bg-card p-8 relative flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
            >
              <div>
                <div className="text-3xl font-display font-bold text-primary/30 mb-4">01</div>
                <h3 className="font-display text-xl font-semibold text-foreground">Collect &amp; Ingest</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Fuel receipts, electricity meter logs, weighbridge slips, and ERP records flow in automatically. Zero tedious manual spreadsheet entry from factory floor managers.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Automated ERP &amp; Tally Connectors</div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Invoice OCR &amp; Docket Ingestion</div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-border bg-card p-8 relative flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
            >
              <div>
                <div className="text-3xl font-display font-bold text-primary/30 mb-4">02</div>
                <h3 className="font-display text-xl font-semibold text-foreground">Verify &amp; Compute</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  5-tier factor matching matches physical quantities (kWh, litres, tonnes) against CEA v19 and IPCC databases. Automated anomaly checks detect data gaps instantly.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> CEA 0.716 kg/kWh baseline integration</div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Outlier &amp; double-counting detector</div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border-2 border-primary/60 bg-card p-8 relative flex flex-col justify-between shadow-md"
            >
              <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                Audit Ready
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-primary mb-4">03</div>
                <h3 className="font-display text-xl font-semibold text-foreground">Assure &amp; Submit</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Pre-populated SEBI BRSR Core tables, EU CBAM XML filings, and cryptographic SHA-256 evidence dossiers ready for board sign-off and assurance interviews.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 1-Click SEBI Principle 6 Export</div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> DG TAXUD XML Validation</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. SOLUTIONS MATRIX: BY ROLE & BY INDUSTRY (WITH ANIMATED SWITCHER) */}
      <section id="solutions" className="py-24 border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Tailored Enterprise Solutions
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1 font-normal">
              Built for Your Exact Stakeholder Requirements
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose the view tailored to your executive role or specific manufacturing sector.
            </p>

            <div className="mt-6 inline-flex rounded-2xl border border-border bg-card p-1 shadow-xs">
              <button
                onClick={() => setSolutionsView("role")}
                className={`relative px-5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  solutionsView === "role" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {solutionsView === "role" && (
                  <motion.div
                    layoutId="solutionsTabBg"
                    className="absolute inset-0 bg-primary rounded-xl shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Solutions by Role</span>
              </button>
              <button
                onClick={() => setSolutionsView("industry")}
                className={`relative px-5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  solutionsView === "industry" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {solutionsView === "industry" && (
                  <motion.div
                    layoutId="solutionsTabBg"
                    className="absolute inset-0 bg-primary rounded-xl shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Solutions by Industry</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {solutionsView === "role" ? (
              <motion.div
                key="role-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">CFOs &amp; Finance</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Personal sign-off under Section 180 requires audit-proof numbers that survive limited and reasonable assurance on Day 1.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-primary font-semibold flex items-center justify-between">
                    <span>Explore CFO Suite</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-4">
                      <Factory className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Sustainability Leads</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Reclaim 2 days every week spent chasing plant engineers for meter readings, diesel chits, and waste transfer notes.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                    <span>Explore EHS Suite</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 grid place-items-center mb-4">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">ESG Consultants</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Scale your advisory practice from 3 clients to 30 with dedicated multi-tenant workspaces and white-label client reports.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-sky-700 font-semibold flex items-center justify-between">
                    <span>Explore Advisor Hub</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center mb-4">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Audit Committees</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Fulfill governance obligations with complete cryptographic SHA-256 data lineage for every Scope 1-3 metric.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-amber-700 font-semibold flex items-center justify-between">
                    <span>Explore Governance</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="industry-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                      <Flame className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Steel &amp; Metallurgy</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      BF-BOF, DRI, and electric arc furnace specific carbon intensity with EU CBAM chapter 72 export declarations.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-primary font-semibold flex items-center justify-between">
                    <span>View Steel Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-4">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Aluminium &amp; Metals</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Electrolytic smelting, direct emissions, and anode PFC tracking for primary ingots and billets under CBAM chapter 76.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                    <span>View Aluminium Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 grid place-items-center mb-4">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Chemicals &amp; Pharma</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Process solvents, batch reactor energy, and Zero Liquid Discharge (ZLD) effluent water compliance.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-sky-700 font-semibold flex items-center justify-between">
                    <span>View Pharma Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 grid place-items-center mb-4">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Textiles &amp; Infra</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      High water footprint management, CGWB aquifer stress, green tariff Scope 2 PPA, and supply chain Scope 3.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border/70 mt-6 text-xs text-cyan-700 font-semibold flex items-center justify-between">
                    <span>View Textile Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 7. REAL-TIME REGULATORY & ESG LIABILITY ESTIMATOR (WITH DYNAMIC CHART) */}
      <section id="estimator" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Live Interactive Simulation
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1 font-normal">
              Regulatory Exposure &amp; ESG Estimator
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust facility operational parameters to watch emissions and potential CBAM risk calculate in real time.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Input Card */}
            <Card className="lg:col-span-6 rounded-3xl border-border bg-card shadow-sm flex flex-col justify-between p-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" /> Facility Operational Sliders
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">LIVE SYNC</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Industry Sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steel">Steel &amp; Metallurgy</SelectItem>
                        <SelectItem value="aluminium">Aluminium Smelters</SelectItem>
                        <SelectItem value="chemicals">Chemicals &amp; Pharma</SelectItem>
                        <SelectItem value="textiles">Textiles &amp; Apparel</SelectItem>
                        <SelectItem value="tech">Corporate Campuses / IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Turnover (₹ Cr):</span>
                      <span className="font-mono text-primary">₹{turnover} Cr</span>
                    </div>
                    <Slider
                      value={[turnover]}
                      min={10}
                      max={1000}
                      step={10}
                      onValueChange={(val) => setTurnover(val[0])}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Grid Electricity:</span>
                      <span className="font-mono text-foreground">{powerUnitsMWh.toLocaleString()} MWh / yr</span>
                    </div>
                    <Slider
                      value={[powerUnitsMWh]}
                      min={500}
                      max={20000}
                      step={500}
                      onValueChange={(val) => setPowerUnitsMWh(val[0])}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Diesel / Fuel Consumption:</span>
                      <span className="font-mono text-foreground">{fuelLitres.toLocaleString()} Litres / yr</span>
                    </div>
                    <Slider
                      value={[fuelLitres]}
                      min={5000}
                      max={250000}
                      step={5000}
                      onValueChange={(val) => setFuelLitres(val[0])}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>EU Export Volume (Tonnes / yr):</span>
                      <span className="font-mono text-primary">{euExportsTonnes.toLocaleString()} MT</span>
                    </div>
                    <Slider
                      value={[euExportsTonnes]}
                      min={0}
                      max={50000}
                      step={1000}
                      onValueChange={(val) => setEuExportsTonnes(val[0])}
                    />
                    <p className="text-[11px] text-muted-foreground">EU Regulation 2023/956 default penalty threshold: €69/tonne.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Calculated Results Card with Live Recharts Bar Chart */}
            <Card className="lg:col-span-6 rounded-3xl border-border bg-card shadow-sm flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="text-sm font-semibold text-foreground">Calculated Liability &amp; Footprint</span>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">REAL-TIME</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    key={`ghg-${totalGhg}`}
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    className="p-3.5 rounded-2xl border border-border/80 bg-muted/20"
                  >
                    <span className="text-xs text-muted-foreground block">Scope 1 &amp; 2 Footprint</span>
                    <span className="font-display text-2xl font-bold text-foreground mt-0.5 block">
                      {totalGhg.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">CEA Factor 0.716 t/MWh</span>
                  </motion.div>

                  <motion.div
                    key={`cbam-${cbamRiskPenaltyEur}`}
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    className="p-3.5 rounded-2xl border border-border/80 bg-muted/20"
                  >
                    <span className="text-xs text-muted-foreground block">EU CBAM Penalty Risk</span>
                    <span className="font-display text-2xl font-bold text-primary mt-0.5 block">
                      €{cbamRiskPenaltyEur.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Without verified XML filing</span>
                  </motion.div>
                </div>

                {/* Real-time Dynamic Chart */}
                <div className="h-36 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <Button onClick={handleLaunchDemo} className="w-full h-11 font-semibold text-xs mt-3 gap-2">
                Open Full Audit Dossier in Demo Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. MARKET BENCHMARK COMPARISON TABLE */}
      <section id="benchmark" className="py-20 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Market Benchmark
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-1 font-normal">
              Why Indian Leaders Standardize on clisomumbai
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comparison across regulatory assurance, CBAM automation, and total cost of ownership.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6 font-semibold">Capability</th>
                  <th className="p-4 font-bold text-primary bg-primary/10">clisomumbai</th>
                  <th className="p-4 font-medium">NetZerra</th>
                  <th className="p-4 font-medium">Tatva6</th>
                  <th className="p-4 font-medium">Greenio</th>
                  <th className="p-4 pr-6 font-medium">Big-4 Firms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">SEBI BRSR Core (Principle 6)</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Full 9 Attributes</td>
                  <td className="p-4 text-muted-foreground">✗ (CBAM only)</td>
                  <td className="p-4 text-foreground">✓ Partial</td>
                  <td className="p-4 text-foreground">✓ Standard</td>
                  <td className="p-4 text-muted-foreground">Manual Excel</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">Water Stewardship (GRI 303 &amp; ZLD)</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Dedicated Module</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-foreground">✓ Present</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">Manual Excel</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">EU CBAM DG TAXUD XML Export</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Automated + HSN Map</td>
                  <td className="p-4 text-foreground">✓ Automated</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">₹5,00,000+</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">Kigali ODP / GWP Refrigerants</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ 50+ Substances</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">Basic</td>
                  <td className="p-4 text-muted-foreground">Separate fee</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">Cryptographic Audit Pack (ZIP)</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ SHA-256 Verified</td>
                  <td className="p-4 text-muted-foreground">XML only</td>
                  <td className="p-4 text-muted-foreground">PDF only</td>
                  <td className="p-4 text-muted-foreground">PDF only</td>
                  <td className="p-4 text-muted-foreground">Paper binders</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-foreground">Pricing Structure</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">Transparent Tiered</td>
                  <td className="p-4 text-foreground">₹1,50,000 / yr</td>
                  <td className="p-4 text-foreground">Quote-based</td>
                  <td className="p-4 text-foreground">₹2.9k - ₹49.9k/mo</td>
                  <td className="p-4 text-muted-foreground">₹5L - ₹20L+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. TRANSPARENT PRICING GRID */}
      <section id="pricing" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Pricing Plans
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1 font-normal">
              Transparent, Scalable Investment
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start free on our MSME tier and upgrade seamlessly as your facility compliance scales.
            </p>

            {/* Annual / Monthly Toggle with Spring layoutId */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative rounded-full px-5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {billingCycle === "monthly" && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 bg-primary rounded-full shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Monthly Billing</span>
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`relative rounded-full px-5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {billingCycle === "annual" && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 bg-primary rounded-full shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  Annual Billing <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-bold">Save 17%</span>
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starter / MSME</div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">₹0</span>
                </div>
                <div className="text-xs text-muted-foreground">Free forever for single facility</div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Scope 1 &amp; Scope 2 direct ledger
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 4 verified PDF reports per year
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> CEA Grid Baseline v19 factors
                  </li>
                </ul>
              </div>

              <Button onClick={handleLaunchDemo} variant="outline" className="w-full mt-8 text-xs font-semibold">
                Start Free
              </Button>
            </motion.div>

            {/* Growth */}
            <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Growth</div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹2,499" : "₹2,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">For growing manufacturing units</div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Starter
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Scope 1, 2 &amp; 3 Value Chain
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Water Accounting &amp; GRI 303
                  </li>
                </ul>
              </div>

              <Button onClick={handleLaunchDemo} variant="outline" className="w-full mt-8 text-xs font-semibold">
                Choose Growth
              </Button>
            </motion.div>

            {/* Pro - Most Popular */}
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="rounded-3xl border-2 border-primary bg-card flex flex-col justify-between p-6 relative shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                Most Popular
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">Pro Enterprise</div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹4,999" : "₹5,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">Full SEBI BRSR &amp; Decarbonization</div>

                <ul className="space-y-2.5 text-xs text-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Growth
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> SEBI BRSR Principle 6 Core exports
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Kigali GWP/ODP Refrigerant Suite
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Decarbonization ROI Roadmaps
                  </li>
                </ul>
              </div>

              <Button onClick={handleLaunchDemo} className="w-full mt-8 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                Choose Pro
              </Button>
            </motion.div>

            {/* Enterprise / Exporter */}
            <motion.div whileHover={{ y: -6 }} className="rounded-3xl border border-border bg-card flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exporter / Custom</div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹39,999" : "₹49,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">EU CBAM &amp; Multi-Facility Conglomerates</div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Pro
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> EU CBAM XML Export Engine
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Indian HSN ↔ EU CN Code Engine
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> SHA-256 Audit Evidence Pack ZIP
                  </li>
                </ul>
              </div>

              <Button onClick={handleLaunchDemo} variant="outline" className="w-full mt-8 text-xs font-semibold">
                Talk to Sales
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. ABOUT US & STORY */}
      <section id="about" className="py-20 border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <Badge variant="outline" className="text-primary border-primary/30 text-xs font-bold uppercase tracking-wider">
                OUR STORY &amp; HERITAGE
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
                Born in Mumbai&apos;s Industrial Corridor for Global Compliance.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>clisomumbai (Climate Social Mumbai)</strong> was founded to solve a fundamental truth: carbon accounting software built for Silicon Valley SaaS companies breaks when dropped onto an Indian factory floor.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Indian heavy industry runs on weighbridge slips, mixed-fuel boilers, and complex water recycling setups. We built our engine from the ground up around India CEA grid factors, SEBI BRSR Principle 6 Core attributes, and European CBAM tariff rules.
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs text-muted-foreground">
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">15+</div>
                  <div>Years Heavy Industry Domain</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">100%</div>
                  <div>Sovereign Data Residency</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">ASSA 5010</div>
                  <div>Assurance Standard Built-in</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-5">
                <h3 className="font-display text-xl font-medium text-foreground">Our Core Guarantees</h3>
                <div className="space-y-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">Zero Spend-Based Guesswork</strong>
                      Every calculation must originate from physical units (litres, kWh, MT) traced to a primary invoice or docket.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0 mt-0.5">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">Cryptographic Verification</strong>
                      Every audit evidence pack is sealed with a SHA-256 cryptographic checksum for undisputed authenticity.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 grid place-items-center shrink-0 mt-0.5">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">Global Export Defense</strong>
                      Direct integration with EU DG TAXUD XML formats ensures your export shipments are protected against punitive carbon fines.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. INTERACTIVE FAQ ACCORDION */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Got Questions?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-1 font-normal">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-border rounded-2xl px-5 bg-card">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Why does spend-based carbon accounting fail SEBI &amp; EU audits?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                The GHG Protocol Scope 3 hierarchy ranks spend-based EEIO data at the lowest level of reliability. Under ASSA 5010 assurance standards, auditors require physical activity data (such as litres of fuel, kWh, or tonnes of steel) traced to source documents, which clisomumbai automates directly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-2xl px-5 bg-card">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                How does clisomumbai generate EU CBAM XML filings?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Our engine automatically maps 8-digit Indian HSN codes to 8-digit European Combined Nomenclature (CN) codes, computes direct and indirect specific embedded emissions (SEE) per tonne, and outputs compliant DG TAXUD XML files matching official XSD v1.2 specifications.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-2xl px-5 bg-card">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Is our facility data stored within India?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. All tenant databases and document stores are hosted with 100% sovereign data residency in certified Indian cloud data centers with end-to-end AES-256 encryption.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-2xl px-5 bg-card">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Can we integrate with our existing ERP (SAP, Oracle, Tally)?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. We provide pre-built connectors and REST APIs for SAP S/4HANA, TallyPrime, Oracle NetSuite, and CSV/Excel batch uploaders for rapid onboarding.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-muted/30 to-background border-t border-border relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl font-normal text-foreground">
            Ready to Experience Audit-Grade Carbon Intelligence?
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of forward-thinking Indian industrial leaders automating compliance and eliminating carbon tariff penalties today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                onClick={handleLaunchDemo}
                size="lg"
                className="h-12 px-8 font-semibold text-sm gap-2 shadow-xl bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer"
              >
                Open Live Demo Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/cbam-checker"
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground shadow-xs"
              >
                Check CBAM Risk
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 13. RICH MULTI-COLUMN DIRECTORY FOOTER */}
      <footer className="border-t border-border bg-card py-16 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border/80">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">clisomumbai</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Enterprise Carbon &amp; Resource Intelligence Platform. Audit-defensible GHG calculations, SEBI BRSR Core, EU CBAM, and Water Stewardship for forward-thinking enterprises.
              </p>
              <div className="text-[11px] text-muted-foreground">
                © 2026 Climate Social Mumbai. All rights reserved.
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">Solutions</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#solutions" className="hover:text-foreground">CFOs &amp; Finance</a></li>
                <li><a href="#solutions" className="hover:text-foreground">Sustainability Leads</a></li>
                <li><a href="#solutions" className="hover:text-foreground">ESG Consultants</a></li>
                <li><a href="#solutions" className="hover:text-foreground">Audit Committees</a></li>
                <li><a href="#solutions" className="hover:text-foreground">Steel &amp; Metallurgy</a></li>
                <li><a href="#solutions" className="hover:text-foreground">Aluminium &amp; Non-Ferrous</a></li>
              </ul>
            </div>

            {/* Col 3: Features */}
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">Features</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#showcase" onClick={() => setActiveTab("ledger")} className="hover:text-foreground">Scope 1-2-3 Ledger</a></li>
                <li><a href="#showcase" onClick={() => setActiveTab("cbam")} className="hover:text-foreground">EU CBAM Declarant</a></li>
                <li><a href="#showcase" onClick={() => setActiveTab("water")} className="hover:text-foreground">Water &amp; ZLD (GRI 303)</a></li>
                <li><a href="#showcase" onClick={() => setActiveTab("decarb")} className="hover:text-foreground">Decarbonization MACC</a></li>
                <li><a href="#showcase" onClick={() => setActiveTab("audit")} className="hover:text-foreground">SHA-256 Audit Pack</a></li>
              </ul>
            </div>

            {/* Col 4: Resources */}
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">Free Tools</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cbam-checker" className="hover:text-foreground text-primary font-medium">CBAM Exposure Tool</Link></li>
                <li><a href="#estimator" className="hover:text-foreground">ESG Liability Estimator</a></li>
                <li><a href="#benchmark" className="hover:text-foreground">Market Benchmark</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing Calculator</a></li>
                <li><a href="#about" className="hover:text-foreground">About clisomumbai</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <span>IPCC 2006</span>
              <span>•</span>
              <span>GHG Protocol</span>
              <span>•</span>
              <span>India CEA Baseline v19</span>
              <span>•</span>
              <span>ASSA 5010</span>
              <span>•</span>
              <span>GRI 303</span>
              <span>•</span>
              <span>EU CBAM 2023/956</span>
            </div>
            <div>
              Built in Mumbai, India for global enterprise assurance.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
