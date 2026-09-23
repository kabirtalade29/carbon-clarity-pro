import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Save,
  Download,
  ChevronsUpDown,
  Trash2,
  Plus,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Upload,
  FileUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Archive,
  FileSpreadsheet,
} from "lucide-react";
import {
  allProducts,
  calculate,
  formatKg,
  Scope,
  SCOPES,
  unitsForProduct,
  Product,
} from "@/lib/emission-calculator";
import { saveCalculation } from "@/lib/calculations.functions";
import { downloadConsolidatedReport } from "@/lib/pdf-report";
import { generateAuditEvidencePack } from "@/lib/evidence-pack";
import { calculateBrsrMetrics, downloadBrsrCoreCsv } from "@/lib/brsr-export";
import { parseInvoiceFile } from "@/lib/invoice-parser";
import { detectAnomalies } from "@/lib/anomaly-detector";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [{ title: "Report Builder — clisomumbai" }, { name: "robots", content: "noindex" }],
  }),
  component: ReportsPage,
});

type ReportItem = {
  id: string;
  category: Scope;
  productName: string;
  quantity: number;
  unit: string;
  co2: number;
  ch4: number;
  n2o: number;
  co2e: number;
  source: string;
  efDetails: Record<string, unknown> | null | undefined;
};

function ReportsPage() {
  const [scopeGroup, setScopeGroup] = useState<"Scope 1" | "Scope 2" | "Scope 3">("Scope 1");
  const [reportName, setReportName] = useState("Consolidated Emissions Report");
  const [company, setCompany] = useState("");
  const [facility, setFacility] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReportItem[]>([]);

  // Item Form States
  const [category, setCategory] = useState<Scope>("Stationary Combustion");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("litre");
  const [customProductName, setCustomProductName] = useState("");
  const [customFactor, setCustomFactor] = useState("1.0");
  const [customMetricType, setCustomMetricType] = useState("Mass");
  const [open, setOpen] = useState(false);

  // Document AI OCR states
  const [isParsingInvoice, setIsParsingInvoice] = useState(false);
  const [lastOcrInfo, setLastOcrInfo] = useState<{ vendor: string; confidence: number } | null>(
    null,
  );

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingInvoice(true);
    try {
      const parsedItems = await parseInvoiceFile(file);
      if (parsedItems.length > 0) {
        const item = parsedItems[0];
        setScopeGroup(item.scopeGroup);
        setTimeout(() => {
          setCategory(item.scope);
          if (item.matchedProduct) {
            setProductName(item.matchedProduct.name);
          }
          setQuantity(item.quantity.toString());
          setUnit(item.unit);
        }, 50);
        setLastOcrInfo({ vendor: item.vendorName, confidence: item.confidenceScore });
        toast.success(
          `AI Document Engine extracted physical activity from ${file.name} (${item.confidenceScore}% confidence)`,
        );
      }
    } catch {
      toast.error("Failed to extract data from file");
    } finally {
      setIsParsingInvoice(false);
    }
  };

  const anomaly = useMemo(() => {
    return detectAnomalies(Number(quantity), unit, category);
  }, [quantity, unit, category]);

  // Available categories under selected scope group
  const availableCategories = useMemo(() => {
    return SCOPES.filter((s) => s.hint === scopeGroup);
  }, [scopeGroup]);

  // Reset category and products when Scope Group changes
  useEffect(() => {
    if (availableCategories.length > 0) {
      const defaultCat = availableCategories[0].value;
      setCategory(defaultCat);

      const catProds = allProducts.filter((p) => p.scope === defaultCat);
      if (catProds.length > 0) {
        setProductName(catProds[0].name);
        const unts = unitsForProduct(catProds[0]);
        setUnit(unts[0] ?? "");
      } else {
        setProductName("");
        const unts = unitsForProduct(null, customMetricType);
        setUnit(unts[0] ?? "");
      }
    }
  }, [scopeGroup, availableCategories, customMetricType]);

  const catProducts = useMemo(() => {
    return allProducts.filter((p) => p.scope === category);
  }, [category]);

  const activeProduct = useMemo(() => {
    return catProducts.find((p) => p.name === productName) ?? catProducts[0];
  }, [catProducts, productName]);

  const activeUnits = useMemo(() => {
    return activeProduct ? unitsForProduct(activeProduct) : unitsForProduct(null, customMetricType);
  }, [activeProduct, customMetricType]);

  useEffect(() => {
    if (!activeUnits.includes(unit)) {
      setUnit(activeUnits[0] ?? "");
    }
  }, [activeUnits, unit]);

  // Add Item to session report
  const handleAddItem = () => {
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    const isCustom = catProducts.length === 0;
    const cfNum = Number(customFactor);

    const result = calculate(
      activeProduct || null,
      qtyNum,
      unit,
      isCustom && Number.isFinite(cfNum) ? cfNum : 0,
    );

    const pName = activeProduct ? activeProduct.name : customProductName || "Custom Goods/Material";
    const pCat = activeProduct ? activeProduct.category : category;

    const newItem: ReportItem = {
      id: crypto.randomUUID(),
      category: pCat as Scope,
      productName: pName,
      quantity: qtyNum,
      unit,
      co2: result.co2_kg,
      ch4: result.ch4_kg,
      n2o: result.n2o_kg,
      co2e: result.co2e_kg,
      source: result.ef_source,
      efDetails: result.ef_details,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success("Item added to report");

    // Reset quantity and custom values
    setQuantity("100");
    setCustomProductName("");
    setCustomFactor("1.0");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast.success("Item removed");
  };

  // Computations
  const totalCo2e = useMemo(() => items.reduce((s, it) => s + it.co2e, 0), [items]);
  const totalCo2 = useMemo(() => items.reduce((s, it) => s + it.co2, 0), [items]);
  const totalCh4 = useMemo(() => items.reduce((s, it) => s + it.ch4, 0), [items]);
  const totalN2o = useMemo(() => items.reduce((s, it) => s + it.n2o, 0), [items]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      map.set(it.category, (map.get(it.category) || 0) + it.co2e);
    });
    return [...map.entries()]
      .map(([name, co2e]) => ({
        name,
        co2e,
        pct: totalCo2e > 0 ? (co2e / totalCo2e) * 100 : 0,
      }))
      .sort((a, b) => b.co2e - a.co2e);
  }, [items, totalCo2e]);

  const highestCategory = useMemo(() => {
    return categoryTotals[0] || { name: "None", co2e: 0, pct: 0 };
  }, [categoryTotals]);

  const highestProduct = useMemo(() => {
    let maxVal = 0;
    let maxName = "None";
    items.forEach((it) => {
      if (it.co2e > maxVal) {
        maxVal = it.co2e;
        maxName = it.productName;
      }
    });
    return { name: maxName, value: maxVal };
  }, [items]);

  const qc = useQueryClient();
  const saveFn = useServerFn(saveCalculation);
  const saveMut = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("No items in report");
      await Promise.all(
        items.map((it) =>
          saveFn({
            data: {
              saved_name: reportName || "Consolidated Report Item",
              scope: it.category,
              category: it.category,
              product_name: it.productName,
              quantity: it.quantity,
              unit: it.unit,
              co2_kg: it.co2,
              ch4_kg: it.ch4,
              n2o_kg: it.n2o,
              co2e_kg: it.co2e,
              ef_source: it.source,
              ef_details: it.efDetails as Record<string, unknown>,
              company: company || null,
              facility: facility || null,
              notes: notes || null,
            },
          }),
        ),
      );
    },
    onSuccess: () => {
      toast.success("All calculations saved to history successfully!");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const exportPdf = () => {
    if (items.length === 0) {
      toast.error("Please add at least one item to generate a report");
      return;
    }

    const uniqueScopes = Array.from(
      new Set(
        items.map((it) => {
          const refScope =
            it.efDetails?.scope === "Custom" ? it.category : (it.efDetails?.scope as string);
          const match = SCOPES.find((s) => s.value === refScope);
          return match ? match.hint : null;
        }),
      ),
    )
      .filter(Boolean)
      .sort();
    const scopeStr = uniqueScopes.length > 0 ? uniqueScopes.join(", ") : scopeGroup;

    downloadConsolidatedReport({
      id: crypto.randomUUID(),
      reportName,
      companyName: company,
      facility: facility,
      reportDate: new Date().toLocaleDateString(),
      scope: scopeStr,
      totalCo2e,
      highestCategory: {
        name: highestCategory.name,
        value: highestCategory.co2e,
        pct: highestCategory.pct,
      },
      highestProduct: {
        name: highestProduct.name,
        value: highestProduct.value,
      },
      items: items.map((it) => {
        const refScope =
          it.efDetails?.scope === "Custom" ? it.category : (it.efDetails?.scope as string);
        const match = SCOPES.find((s) => s.value === refScope);
        const sGroup = match ? (match.hint as "Scope 1" | "Scope 2" | "Scope 3") : "Scope 3";

        return {
          category: it.category,
          productName: it.productName,
          quantity: it.quantity,
          unit: it.unit,
          co2e: it.co2e,
          scopeGroup: sGroup,
        };
      }),
      categoryBreakdown: categoryTotals,
      notes,
    });
  };

  const exportEvidencePack = async () => {
    if (items.length === 0) {
      toast.error("Add items to your report before generating Evidence Pack");
      return;
    }
    try {
      const uniqueScopes = Array.from(
        new Set(
          items.map((it) => {
            const refScope =
              it.efDetails?.scope === "Custom" ? it.category : (it.efDetails?.scope as string);
            const match = SCOPES.find((s) => s.value === refScope);
            return match ? match.hint : null;
          }),
        ),
      )
        .filter(Boolean)
        .sort();
      const scopeStr = uniqueScopes.length > 0 ? uniqueScopes.join(", ") : scopeGroup;

      const reportData = {
        id: crypto.randomUUID(),
        reportName,
        companyName: company,
        facility: facility,
        reportDate: new Date().toLocaleDateString(),
        scope: scopeStr,
        totalCo2e,
        highestCategory: {
          name: highestCategory.name,
          value: highestCategory.co2e,
          pct: highestCategory.pct,
        },
        highestProduct: {
          name: highestProduct.name,
          value: highestProduct.value,
        },
        items: items.map((it) => {
          const refScope =
            it.efDetails?.scope === "Custom" ? it.category : (it.efDetails?.scope as string);
          const match = SCOPES.find((s) => s.value === refScope);
          const sGroup = match ? (match.hint as "Scope 1" | "Scope 2" | "Scope 3") : "Scope 3";
          return {
            category: it.category,
            productName: it.productName,
            quantity: it.quantity,
            unit: it.unit,
            co2e: it.co2e,
            scopeGroup: sGroup,
          };
        }),
        categoryBreakdown: categoryTotals,
        notes,
      };

      await generateAuditEvidencePack({
        reportData,
        companyName: company || "Climate Social Mumbai",
        facilityName: facility || "Main Operations",
      });
      toast.success("Downloaded ASSA 5010 Audit Evidence Pack (.ZIP)");
    } catch {
      toast.error("Failed to generate Evidence Pack");
    }
  };

  const exportBrsr = () => {
    if (items.length === 0) {
      toast.error("Add items to your report before generating SEBI BRSR Core export");
      return;
    }
    const mockRows = items.map((it, idx) => ({
      id: `calc-${idx + 1}`,
      user_id: "user",
      saved_name: it.productName,
      scope: it.category,
      category: it.category,
      product_name: it.productName,
      quantity: it.quantity,
      unit: it.unit,
      co2_kg: it.co2,
      ch4_kg: it.ch4,
      n2o_kg: it.n2o,
      co2e_kg: it.co2e,
      ef_source: it.source,
      ef_details: it.efDetails as Record<string, unknown>,
      company: company || "Climate Social Mumbai",
      facility: facility || "Main Facility",
      notes: notes || null,
      created_at: new Date().toISOString(),
    }));

    const metrics = calculateBrsrMetrics(mockRows, 150, 6500);
    downloadBrsrCoreCsv(metrics);
    toast.success("Exported SEBI BRSR Principle 6 Core Metrics (.CSV)");
  };

  function groupProducts(products: Product[]) {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return [...map.entries()].map(([category, items]) => ({ category, items }));
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Custom Reports</p>
          <h1 className="mt-1 font-display text-4xl">Multi-product report builder</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Choose a Scope, add multiple products and activities across standard categories, and
            analyze your consolidated value chain.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Add Form & Report Settings */}
        <div className="grid gap-6 lg:col-span-3">
          <Card className="rounded-2xl p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h2 className="font-display text-xl text-primary flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add activities to report
              </h2>

              {/* AI Invoice Document Dropzone Trigger */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                  className="hidden"
                  onChange={handleInvoiceUpload}
                  disabled={isParsingInvoice}
                />
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                  {isParsingInvoice ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Parsing Document AI...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-3.5 w-3.5" />
                      <span>AI Invoice Extract</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {lastOcrInfo && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Physical Data Extracted from
                  Supplier Invoice ({lastOcrInfo.vendor})
                </span>
                <span className="font-bold text-emerald-700">
                  {lastOcrInfo.confidence}% Confidence
                </span>
              </div>
            )}

            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scope Group</Label>
                  <Select
                    value={scopeGroup}
                    onValueChange={(v: "Scope 1" | "Scope 2" | "Scope 3") => setScopeGroup(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scope 1">Scope 1 (Direct)</SelectItem>
                      <SelectItem value="Scope 2">Scope 2 (Electricity)</SelectItem>
                      <SelectItem value="Scope 3">Scope 3 (Value Chain)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sub-Category</Label>
                  <Select value={category} onValueChange={(v: Scope) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {catProducts.length > 0 ? (
                <div>
                  <Label>Product / Fuel</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate">
                          {activeProduct?.name ?? "Choose product..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search products…" />
                        <CommandList>
                          <CommandEmpty>No product</CommandEmpty>
                          {groupProducts(catProducts).map((g) => (
                            <CommandGroup key={g.category} heading={g.category}>
                              {g.items.map((p) => (
                                <CommandItem
                                  key={p.name}
                                  value={p.name}
                                  onSelect={() => {
                                    setProductName(p.name);
                                    setOpen(false);
                                  }}
                                  className={cn(activeProduct?.name === p.name && "bg-accent/50")}
                                >
                                  {p.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {activeProduct && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Category Source:{" "}
                      <span className="text-foreground">{activeProduct.category}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Item / Material Description</Label>
                    <Input
                      placeholder="e.g. Purchased Steel, Office Paper"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Emission Factor (kg CO₂e per unit)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="e.g. 1.25"
                      value={customFactor}
                      onChange={(e) => setCustomFactor(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeUnits.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {anomaly.hasAnomaly && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{anomaly.title}</p>
                    <p className="text-amber-800/90">{anomaly.message}</p>
                  </div>
                </div>
              )}

              <Button onClick={handleAddItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Item to Report
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl p-6 bg-muted/15">
            <h3 className="mb-4 font-display text-lg">Report details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Report name</Label>
                <Input value={reportName} onChange={(e) => setReportName(e.target.value)} />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <Label>Facility / Site</Label>
                <Input
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Main Plant"
                />
              </div>
              <div className="md:col-span-3">
                <Label>Report Notes (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide context about this report..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Key Indicators & Visual Rankings */}
        <div className="grid gap-4 lg:col-span-2">
          {/* Main KPI Card */}
          <Card className="rounded-2xl border-primary/40 bg-primary p-6 text-primary-foreground shadow-md">
            <p className="text-xs uppercase tracking-widest text-primary-foreground/75 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" /> Total emissions
            </p>
            <p className="mt-2 font-display text-4xl">{formatKg(totalCo2e)}</p>
            <p className="mt-2 text-xs text-primary-foreground/75">
              Consolidated {scopeGroup} totals based on {items.length} items.
            </p>
          </Card>

          {/* Highest Category Ranking */}
          <Card className="rounded-2xl p-5 flex items-start gap-4 border-amber-200/50 bg-amber-500/10">
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Highest Category source
              </p>
              <p className="mt-1.5 font-display text-lg text-foreground truncate max-w-[240px]">
                {highestCategory.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {highestCategory.co2e > 0
                  ? `Contributes ${formatKg(highestCategory.co2e)} (${highestCategory.pct.toFixed(1)}% of total)`
                  : "No categories added yet"}
              </p>
            </div>
          </Card>

          {/* Highest Product Ranking */}
          <Card className="rounded-2xl p-5 flex items-start gap-4 border-emerald-200/50 bg-emerald-500/10">
            <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Highest Product source
              </p>
              <p className="mt-1.5 font-display text-lg text-foreground truncate max-w-[240px]">
                {highestProduct.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {highestProduct.value > 0
                  ? `Contributes ${formatKg(highestProduct.value)}`
                  : "No products added yet"}
              </p>
            </div>
          </Card>

          {/* Save / Export Section */}
          <Card className="rounded-2xl p-6 flex flex-col gap-2.5">
            <Button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || items.length === 0}
              className="w-full justify-center"
            >
              <Save className="mr-2 h-4 w-4" />{" "}
              {saveMut.isPending ? "Saving items..." : "Save all to History"}
            </Button>
            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={items.length === 0}
              className="w-full justify-center border-primary text-primary hover:bg-primary/10"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF Report
            </Button>
            <Button
              variant="secondary"
              onClick={exportEvidencePack}
              disabled={items.length === 0}
              className="w-full justify-center gap-2 text-xs font-semibold"
            >
              <Archive className="h-4 w-4 text-primary" /> Audit Evidence Pack (.ZIP)
            </Button>
            <Button
              variant="ghost"
              onClick={exportBrsr}
              disabled={items.length === 0}
              className="w-full justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> SEBI BRSR Core Disclosures (.CSV)
            </Button>
          </Card>
        </div>
      </div>

      {/* Categories Breakdown Charts */}
      {items.length > 0 && (
        <Card className="rounded-2xl p-6 mt-6">
          <h3 className="mb-4 font-display text-xl">Category contribution analysis</h3>
          <div className="grid gap-4">
            {categoryTotals.map((ct) => (
              <div key={ct.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{ct.name}</span>
                  <span className="text-muted-foreground">
                    {formatKg(ct.co2e)} ({ct.pct.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={ct.pct} className="h-2.5 bg-muted [&>div]:bg-primary" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Item List Table */}
      <Card className="rounded-2xl p-6 mt-6">
        <h3 className="mb-4 font-display text-xl">Added items ({items.length})</h3>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Product / Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Emissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {item.category}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{item.productName}</TableCell>
                    <TableCell>
                      {item.quantity.toLocaleString()} {item.unit}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatKg(item.co2e)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
            <p>Your report is currently empty.</p>
            <p className="text-xs">Add items using the form above to build your scope report.</p>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
