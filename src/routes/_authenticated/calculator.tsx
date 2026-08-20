import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  allProducts,
  calculate,
  formatKg,
  unitsForProduct,
  SCOPES,
  type Product,
  type Scope,
} from "@/lib/emission-calculator";
import { saveCalculation } from "@/lib/calculations.functions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  ChevronsUpDown,
  Save,
  Download,
  FileText,
  FileUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadReport } from "@/lib/pdf-report";
import { parseInvoiceFile } from "@/lib/invoice-parser";
import { detectAnomalies } from "@/lib/anomaly-detector";

export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({
    meta: [{ title: "Calculator — clisomumbai" }, { name: "robots", content: "noindex" }],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [scope, setScope] = useState<Scope>("Stationary Combustion");
  const [productName, setProductName] = useState<string>("Gas/Diesel oil");
  const [quantity, setQuantity] = useState<string>("100");
  const [unit, setUnit] = useState<string>("litre");
  const [savedName, setSavedName] = useState("");
  const [facility, setFacility] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  // States for custom categories
  const [customProductName, setCustomProductName] = useState("");
  const [customFactor, setCustomFactor] = useState("1.0");
  const [customMetricType, setCustomMetricType] = useState("Mass");
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
        setScope(item.scope);
        if (item.matchedProduct) {
          setProductName(item.matchedProduct.name);
        }
        setQuantity(item.quantity.toString());
        setUnit(item.unit);
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
    return detectAnomalies(Number(quantity), unit, scope);
  }, [quantity, unit, scope]);

  const products = useMemo(() => allProducts.filter((p) => p.scope === scope), [scope]);
  const product = useMemo(
    () => products.find((p) => p.name === productName) ?? products[0],
    [products, productName],
  );
  const units = useMemo(
    () => (product ? unitsForProduct(product) : unitsForProduct(null, customMetricType)),
    [product, customMetricType],
  );

  // ensure unit valid
  useEffect(() => {
    if (!units.includes(unit)) setUnit(units[0] ?? "");
  }, [product, unit, units]);

  const qty = Number(quantity);
  const customFactNum = Number(customFactor);
  const result = calculate(
    product || null,
    isFinite(qty) ? qty : 0,
    unit,
    isFinite(customFactNum) ? customFactNum : 0,
  );

  const qc = useQueryClient();
  const saveFn = useServerFn(saveCalculation);
  const saveMut = useMutation({
    mutationFn: async () => {
      if (!result || !qty) throw new Error("Enter a quantity");
      const prodName = product ? product.name : customProductName || "Custom Goods/Material";
      const prodCat = product ? product.category : scope;
      const efSource = result.ef_source || "Custom User Input";
      return saveFn({
        data: {
          saved_name: savedName || null,
          scope,
          category: prodCat,
          product_name: prodName,
          quantity: qty,
          unit,
          co2_kg: result.co2_kg,
          ch4_kg: result.ch4_kg,
          n2o_kg: result.n2o_kg,
          co2e_kg: result.co2e_kg,
          ef_source: efSource,
          ef_details: result.ef_details as Record<string, unknown>,
          company: company || null,
          facility: facility || null,
          notes: notes || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Calculation saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function exportPdf() {
    if (!result) return;
    const prodName = product ? product.name : customProductName || "Custom Goods/Material";
    const prodCat = product ? product.category : scope;
    const efSource = result.ef_source || "Custom User Input";
    downloadReport({
      id: crypto.randomUUID(),
      savedName,
      companyName: company,
      facility,
      userName: null,
      reportDate: new Date().toLocaleDateString(),
      product: prodName,
      category: prodCat,
      quantity: qty,
      unit,
      scope,
      efSource: efSource,
      efDetails: result.ef_details as Record<string, unknown>,
      co2: result.co2_kg,
      ch4: result.ch4_kg,
      n2o: result.n2o_kg,
      co2e: result.co2e_kg,
      notes,
    });
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Calculate</p>
        <h1 className="mt-1 font-display text-4xl">Emission calculator</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a scope, a product/fuel, and enter your activity data. Factors are looked up
          automatically from the built-in IPCC & EPA database.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl p-6 lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Activity Calculator</h2>
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
            <div>
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => {
                  const nextScope = v as Scope;
                  const nextProducts = allProducts.filter((p) => p.scope === nextScope);
                  const nextProduct = nextProducts[0];
                  const nextUnits = nextProduct
                    ? unitsForProduct(nextProduct)
                    : unitsForProduct(null);
                  setScope(nextScope);
                  setProductName(nextProduct?.name ?? "");
                  if (nextUnits.length > 0) {
                    setUnit(nextUnits[0]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} ({s.hint})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {products.length > 0 ? (
              <div>
                <Label>Product / Fuel</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      <span className="truncate">{product?.name ?? "Choose"}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search products…" />
                      <CommandList>
                        <CommandEmpty>No product</CommandEmpty>
                        {groupProducts(products).map((g) => (
                          <CommandGroup key={g.category} heading={g.category}>
                            {g.items.map((p) => (
                              <CommandItem
                                key={p.name}
                                value={p.name}
                                onSelect={() => {
                                  setProductName(p.name);
                                  const nextUnits = unitsForProduct(p);
                                  if (nextUnits.length > 0) {
                                    setUnit(nextUnits[0]);
                                  }
                                  setOpen(false);
                                }}
                                className={cn(product?.name === p.name && "bg-accent/50")}
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
                {product && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Category: <span className="text-foreground">{product.category}</span>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={0}
                  step="any"
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
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-2 grid gap-3 rounded-xl border bg-muted/30 p-4 md:grid-cols-3">
              <div>
                <Label>Report name</Label>
                <Input
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  placeholder="e.g. Q3 Boiler diesel"
                  maxLength={120}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Facility</Label>
                <Input
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="md:col-span-3">
                <Label>Notes (optional)</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !qty}>
                <Save className="h-4 w-4" /> {saveMut.isPending ? "Saving…" : "Save calculation"}
              </Button>
              <Button variant="outline" onClick={exportPdf} disabled={!result || !qty}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:col-span-2">
          <ResultCard label="CO₂" value={result?.co2_kg ?? 0} />
          <ResultCard label="CH₄" value={result?.ch4_kg ?? 0} />
          <ResultCard label="N₂O" value={result?.n2o_kg ?? 0} />
          <Card className="rounded-2xl border-primary/40 bg-primary p-5 text-primary-foreground shadow-md">
            <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
              Total CO₂e
            </p>
            <p className="mt-2 font-display text-4xl">{formatKg(result?.co2e_kg ?? 0)}</p>
            <p className="mt-2 text-xs text-primary-foreground/70">
              GWP AR5 100-year: CO₂=1, CH₄=28, N₂O=265
            </p>
          </Card>
          {result && (
            <Card className="rounded-2xl p-4 text-xs text-muted-foreground">
              <p className="mb-1 flex items-center gap-2 text-foreground">
                <FileText className="h-3 w-3" /> Emission factor
              </p>
              <p>{result.ef_source}</p>
              <p className="mt-1">
                {result.ef_details.factor_co2 ?? "—"} {result.ef_details.ef_unit ?? ""}
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ResultCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{formatKg(value)}</p>
    </Card>
  );
}

function groupProducts(products: Product[]) {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const arr = map.get(p.category) ?? [];
    arr.push(p);
    map.set(p.category, arr);
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }));
}
