import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/app-shell";
import { deleteCalculation, listMyCalculations, getMyProfile } from "@/lib/calculations.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Search, Trash2 } from "lucide-react";
import { formatKg, SCOPES } from "@/lib/emission-calculator";
import { downloadReport } from "@/lib/pdf-report";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Climateintel.ai" }, { name: "robots", content: "noindex" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const listFn = useServerFn(listMyCalculations);
  const profileFn = useServerFn(getMyProfile);
  const delFn = useServerFn(deleteCalculation);
  const qc = useQueryClient();

  const { data: rows = [] } = useQuery({
    queryKey: ["me", "calculations"],
    queryFn: () => listFn(),
  });
  const { data: profile } = useQuery({ queryKey: ["me", "profile"], queryFn: () => profileFn() });
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<string>("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (scope !== "all" && r.scope !== scope) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        r.product_name.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        (r.saved_name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, q, scope]);

  const delMut = useMutation({
    mutationFn: async (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">History</p>
          <h1 className="mt-1 font-display text-4xl">Saved calculations</h1>
        </div>
      </div>

      <Card className="rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search product, category, name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scopes</SelectItem>
              {SCOPES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Report</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Scope</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">CO₂e</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b last:border-none">
                  <td className="py-2 pr-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3 font-medium">{r.saved_name || "—"}</td>
                  <td className="py-2 pr-3">{r.product_name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.scope}</td>
                  <td className="py-2 pr-3">
                    {Number(r.quantity).toLocaleString()} {r.unit}
                  </td>
                  <td className="py-2 pr-3 font-medium">{formatKg(Number(r.co2e_kg))}</td>
                  <td className="py-2 pr-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          downloadReport({
                            id: r.id,
                            savedName: r.saved_name,
                            companyName: r.company ?? profile?.company,
                            facility: r.facility ?? profile?.facility,
                            userName: profile?.full_name,
                            reportDate: new Date(r.created_at).toLocaleDateString(),
                            product: r.product_name,
                            category: r.category,
                            quantity: Number(r.quantity),
                            unit: r.unit,
                            scope: r.scope,
                            efSource: r.ef_source ?? "",
                            efDetails: r.ef_details as Record<string, unknown> | null,
                            co2: Number(r.co2_kg),
                            ch4: Number(r.ch4_kg),
                            n2o: Number(r.n2o_kg),
                            co2e: Number(r.co2e_kg),
                            notes: r.notes,
                          })
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => delMut.mutate(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    No calculations match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
