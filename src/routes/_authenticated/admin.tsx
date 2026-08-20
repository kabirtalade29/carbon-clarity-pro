import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app/app-shell";
import { adminOverview, amIAdmin } from "@/lib/calculations.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allProducts, formatKg, SCOPES } from "@/lib/emission-calculator";
import { downloadReport } from "@/lib/pdf-report";
import {
  Building2,
  Users,
  Layers,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Database,
  Briefcase,
  Activity,
  FileText,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — clisomumbai" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: async () => {
    try {
      const res = await amIAdmin();
      if (!res.isAdmin) throw redirect({ to: "/dashboard" });
    } catch {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage,
});

interface AdminProfile {
  id: string;
  full_name: string | null;
  company: string | null;
  facility: string | null;
  created_at: string;
}

interface AdminCalculation {
  id: string;
  user_id: string;
  saved_name: string | null;
  scope: string;
  category: string;
  product_name: string;
  quantity: number;
  unit: string;
  co2_kg: number;
  ch4_kg: number;
  n2o_kg: number;
  co2e_kg: number;
  ef_source: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ef_details: any;
  company: string | null;
  facility: string | null;
  notes: string | null;
  created_at: string;
}

type CompanyData = {
  name: string;
  users: AdminProfile[];
  calculations: AdminCalculation[];
  totalCo2e: number;
  lastActive: string | null;
};

function AdminPage() {
  const fn = useServerFn(adminOverview);
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fn() });

  const profiles = useMemo<AdminProfile[]>(() => data?.profiles ?? [], [data?.profiles]);
  const calcs = useMemo<AdminCalculation[]>(() => data?.calculations ?? [], [data?.calculations]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"companies" | "calculations" | "library">("companies");

  // Search & Filter States
  const [companySearch, setCompanySearch] = useState("");
  const [calcSearch, setCalcSearch] = useState("");
  const [calcScopeFilter, setCalcScopeFilter] = useState("all");
  const [libSearch, setLibSearch] = useState("");

  // Expander States
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);

  // Group everything by company
  const companyData = useMemo<CompanyData[]>(() => {
    const map = new Map<string, CompanyData>();

    const getCompanyEntry = (name: string): CompanyData => {
      const cleanName = name.trim();
      const key = cleanName.toLowerCase();
      let entry = map.get(key);
      if (!entry) {
        entry = {
          name: cleanName,
          users: [],
          calculations: [],
          totalCo2e: 0,
          lastActive: null,
        };
        map.set(key, entry);
      }
      return entry;
    };

    // Allocate profiles
    profiles.forEach((p) => {
      const cName = p.company?.trim() || "Individual / Unassigned";
      const entry = getCompanyEntry(cName);
      entry.users.push(p);
    });

    // Allocate calculations
    calcs.forEach((c) => {
      let cName = c.company?.trim();
      if (!cName) {
        const userProfile = profiles.find((p) => p.id === c.user_id);
        cName = userProfile?.company?.trim();
      }
      cName = cName || "Individual / Unassigned";
      const entry = getCompanyEntry(cName);

      // Prevent duplicates in users list if they are in calculations but not in profiles
      const hasUser = entry.users.some((u) => u.id === c.user_id);
      if (!hasUser) {
        const userProfile = profiles.find((p) => p.id === c.user_id);
        if (userProfile) {
          entry.users.push(userProfile);
        } else {
          entry.users.push({
            id: c.user_id,
            full_name: "Deleted User",
            company: cName,
            facility: null,
            created_at: c.created_at,
          });
        }
      }

      entry.calculations.push(c);
      entry.totalCo2e += Number(c.co2e_kg || 0);

      if (c.created_at) {
        const cDate = new Date(c.created_at);
        if (!entry.lastActive || cDate > new Date(entry.lastActive)) {
          entry.lastActive = c.created_at;
        }
      }
    });

    // Convert map to sorted array
    return Array.from(map.values()).sort((a, b) => b.totalCo2e - a.totalCo2e);
  }, [profiles, calcs]);

  // Compute Platform Metrics
  const metrics = useMemo(() => {
    const activeCompanies = companyData.filter((c) => c.name !== "Individual / Unassigned").length;
    const totalCO2e = calcs.reduce((s, r) => s + Number(r.co2e_kg || 0), 0);
    return {
      totalCompanies: activeCompanies,
      totalUsers: profiles.length,
      totalCalculations: calcs.length,
      totalCO2e,
    };
  }, [companyData, profiles, calcs]);

  // Filtered Company List
  const filteredCompanies = useMemo(() => {
    return companyData.filter((c) => c.name.toLowerCase().includes(companySearch.toLowerCase()));
  }, [companyData, companySearch]);

  // Filtered master calculations log
  const filteredCalcs = useMemo(() => {
    return calcs.filter((c) => {
      // Scope filter
      if (calcScopeFilter !== "all" && c.scope !== calcScopeFilter) return false;

      if (!calcSearch) return true;
      const searchLower = calcSearch.toLowerCase();
      const user = profiles.find((p) => p.id === c.user_id);
      const userName = user?.full_name?.toLowerCase() || "";
      const cName = c.company?.toLowerCase() || user?.company?.toLowerCase() || "";
      const sName = (c.saved_name ?? "").toLowerCase();

      return (
        c.product_name.toLowerCase().includes(searchLower) ||
        cName.includes(searchLower) ||
        userName.includes(searchLower) ||
        sName.includes(searchLower)
      );
    });
  }, [calcs, calcSearch, calcScopeFilter, profiles]);

  // Filtered library search
  const filteredLibrary = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(libSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(libSearch.toLowerCase()) ||
        p.scope.toLowerCase().includes(libSearch.toLowerCase()),
    );
  }, [libSearch]);

  // Trigger individual calculation PDF download
  const handleDownloadReport = (c: AdminCalculation) => {
    const userProfile = profiles.find((p) => p.id === c.user_id);
    downloadReport({
      id: c.id,
      savedName: c.saved_name || "Emission Calculation",
      companyName: c.company || userProfile?.company,
      facility: c.facility || userProfile?.facility,
      userName: userProfile?.full_name || "Platform User",
      reportDate: new Date(c.created_at).toLocaleDateString(),
      product: c.product_name,
      category: c.category || c.scope,
      quantity: Number(c.quantity || 0),
      unit: c.unit || "kg",
      scope: c.scope,
      efSource: c.ef_source || "Database Lookup",
      efDetails: c.ef_details,
      co2: Number(c.co2_kg || 0),
      ch4: Number(c.ch4_kg || 0),
      n2o: Number(c.n2o_kg || 0),
      co2e: Number(c.co2e_kg || 0),
      notes: c.notes,
    });
  };

  const getScopeBadgeClass = (scope: string) => {
    if (scope.includes("Scope 1")) {
      return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
    }
    if (scope.includes("Scope 2")) {
      return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
    }
    return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
  };

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-4xl">Platform overview</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Audit platform calculations, monitor registered companies, and search the emission
          database.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Registered Companies"
          value={String(metrics.totalCompanies)}
          icon={<Building2 className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Platform Users"
          value={String(metrics.totalUsers)}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Total Calculations"
          value={String(metrics.totalCalculations)}
          icon={<Activity className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          label="Total CO₂e Audited"
          value={formatKg(metrics.totalCO2e)}
          icon={<Layers className="h-5 w-5 text-emerald-600" />}
          accent
        />
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 border-b flex gap-6">
        <button
          onClick={() => setActiveTab("companies")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "companies"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Companies & Users
        </button>
        <button
          onClick={() => setActiveTab("calculations")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "calculations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Calculations Log
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Emission Factor Library
        </button>
      </div>

      <div className="mt-6">
        {/* COMPANIES TAB */}
        {activeTab === "companies" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by company name…"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="rounded-2xl overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 w-8"></th>
                      <th className="p-4">Company Name</th>
                      <th className="p-4">Registered Users</th>
                      <th className="p-4">Runs</th>
                      <th className="p-4">Emissions (CO₂e)</th>
                      <th className="p-4">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((c) => {
                      const isExpanded = expandedCompany === c.name.toLowerCase();
                      return (
                        <>
                          <tr
                            key={c.name}
                            className="border-b last:border-none hover:bg-muted/10 cursor-pointer transition-all"
                            onClick={() =>
                              setExpandedCompany(isExpanded ? null : c.name.toLowerCase())
                            }
                          >
                            <td className="p-4 text-center">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="p-4 font-semibold text-foreground">{c.name}</td>
                            <td className="p-4">{c.users.length} users</td>
                            <td className="p-4">{c.calculations.length} runs</td>
                            <td className="p-4 font-medium text-emerald-600">
                              {formatKg(c.totalCo2e)}
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">
                              {c.lastActive ? new Date(c.lastActive).toLocaleDateString() : "—"}
                            </td>
                          </tr>

                          {/* Expanded detail subtable */}
                          {isExpanded && (
                            <tr className="bg-muted/15 border-b">
                              <td colSpan={6} className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                  {/* User List under Company */}
                                  <div>
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                      <Users className="h-3.5 w-3.5" /> Registered Users (
                                      {c.users.length})
                                    </h4>
                                    <Card className="rounded-xl p-3 max-h-60 overflow-y-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="border-b text-left text-muted-foreground pb-2">
                                            <th className="pb-2">Name</th>
                                            <th className="pb-2">Facility</th>
                                            <th className="pb-2 text-right">Joined</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {c.users.map((u) => (
                                            <tr key={u.id} className="border-b last:border-none">
                                              <td className="py-2 font-medium">
                                                {u.full_name || "—"}
                                              </td>
                                              <td className="py-2 text-muted-foreground">
                                                {u.facility || "—"}
                                              </td>
                                              <td className="py-2 text-muted-foreground text-right">
                                                {u.created_at
                                                  ? new Date(u.created_at).toLocaleDateString()
                                                  : "—"}
                                              </td>
                                            </tr>
                                          ))}
                                          {c.users.length === 0 && (
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="py-4 text-center text-muted-foreground"
                                              >
                                                No users registered.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </Card>
                                  </div>

                                  {/* Company Calculation List */}
                                  <div>
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                      <Briefcase className="h-3.5 w-3.5" /> Recent Calculations (
                                      {c.calculations.length})
                                    </h4>
                                    <Card className="rounded-xl p-3 max-h-60 overflow-y-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="border-b text-left text-muted-foreground pb-2">
                                            <th className="pb-2">Product</th>
                                            <th className="pb-2">Emissions</th>
                                            <th className="pb-2 text-right">Date</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {c.calculations.slice(0, 15).map((calc) => (
                                            <tr key={calc.id} className="border-b last:border-none">
                                              <td className="py-2 font-medium truncate max-w-[150px]">
                                                {calc.product_name}
                                              </td>
                                              <td className="py-2 text-emerald-600 font-semibold">
                                                {formatKg(calc.co2e_kg)}
                                              </td>
                                              <td className="py-2 text-muted-foreground text-right">
                                                {calc.created_at
                                                  ? new Date(calc.created_at).toLocaleDateString()
                                                  : "—"}
                                              </td>
                                            </tr>
                                          ))}
                                          {c.calculations.length === 0 && (
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="py-4 text-center text-muted-foreground"
                                              >
                                                No calculations run yet.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </Card>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2"
                        >
                          <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                          No companies match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* MASTER CALCULATIONS LOG TAB */}
        {activeTab === "calculations" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search calculations by company, user, product, or report name…"
                  value={calcSearch}
                  onChange={(e) => setCalcSearch(e.target.value)}
                />
              </div>
              <Select value={calcScopeFilter} onValueChange={setCalcScopeFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Filter by scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  {SCOPES.slice(0, 4).map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="Scope 3">Scope 3 Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="rounded-2xl overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 w-8"></th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Product / Activity</th>
                      <th className="p-4">Scope</th>
                      <th className="p-4">Emissions</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalcs.map((c) => {
                      const isExpanded = expandedCalc === c.id;
                      const user = profiles.find((p) => p.id === c.user_id);
                      const cName = c.company || user?.company || "Individual / Unassigned";
                      return (
                        <>
                          <tr
                            key={c.id}
                            className="border-b hover:bg-muted/10 transition-all cursor-pointer"
                            onClick={() => setExpandedCalc(isExpanded ? null : c.id)}
                          >
                            <td className="p-4 text-center">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-semibold">{cName}</td>
                            <td className="p-4 text-muted-foreground">{user?.full_name || "—"}</td>
                            <td className="p-4">
                              <div className="font-medium">{c.product_name}</div>
                              {c.saved_name && (
                                <div className="text-xs text-muted-foreground font-normal">
                                  {c.saved_name}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getScopeBadgeClass(c.scope)}`}
                              >
                                {c.scope}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-primary">{formatKg(c.co2e_kg)}</td>
                            <td className="p-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadReport(c);
                                }}
                                className="h-7 px-2 text-xs border-primary/45 hover:bg-primary/5"
                              >
                                <Download className="mr-1 h-3.5 w-3.5" /> PDF
                              </Button>
                            </td>
                          </tr>

                          {/* Expanded Calculation Details Drawer */}
                          {isExpanded && (
                            <tr className="bg-muted/10 border-b">
                              <td colSpan={8} className="p-5">
                                <div className="grid gap-4 md:grid-cols-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground">
                                      ACTIVITY DETAILS
                                    </div>
                                    <div>
                                      Quantity:{" "}
                                      <span className="font-bold">
                                        {c.quantity.toLocaleString()} {c.unit}
                                      </span>
                                    </div>
                                    {c.facility && (
                                      <div>
                                        Facility: <span className="font-medium">{c.facility}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground font-display flex items-center gap-1">
                                      <Database className="h-3 w-3" /> EMISSION FACTOR
                                    </div>
                                    <div className="truncate max-w-[250px]">{c.ef_source}</div>
                                    <div className="text-muted-foreground">
                                      CO₂: {c.co2_kg} kg | CH₄: {c.ch4_kg} kg | N₂O: {c.n2o_kg} kg
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> NOTES
                                    </div>
                                    <p className="text-muted-foreground italic truncate max-w-[300px]">
                                      {c.notes || "No notes provided."}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {filteredCalcs.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2"
                        >
                          <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                          No calculation logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* EMISSION FACTOR LIBRARY TAB */}
        {activeTab === "library" && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search standard library by product name, category, scope…"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
              />
            </div>

            <Card className="rounded-2xl p-5">
              <p className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" /> Read-only database contains{" "}
                {allProducts.length} factors (IPCC / EPA / UK Defra).
              </p>
              <div className="max-h-[460px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground sticky top-0 bg-background border-b z-10 pb-2">
                    <tr>
                      <th className="py-2">Product Name</th>
                      <th className="py-2">Scope</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLibrary.map((p) => (
                      <tr key={`${p.scope}-${p.name}`} className="border-b hover:bg-muted/5">
                        <td className="py-2 pr-3 font-medium text-xs">{p.name}</td>
                        <td className="py-2 pr-3 text-muted-foreground text-xs">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${getScopeBadgeClass(p.scope)}`}
                          >
                            {p.scope}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground text-xs">{p.category}</td>
                        <td className="py-2 pr-3 text-muted-foreground text-xs">{p.source}</td>
                      </tr>
                    ))}
                    {filteredLibrary.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No database factors match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="card-elevated rounded-2xl p-5 flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p
          className={`font-display text-2xl ${accent ? "text-emerald-600 font-bold" : "text-foreground"}`}
        >
          {value}
        </p>
      </div>
      <div className="p-2 rounded-xl bg-muted">{icon}</div>
    </Card>
  );
}
