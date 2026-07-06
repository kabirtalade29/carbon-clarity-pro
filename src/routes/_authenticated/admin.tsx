import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/app-shell";
import { adminOverview, amIAdmin } from "@/lib/calculations.functions";
import { Card } from "@/components/ui/card";
import { allProducts } from "@/lib/emission-calculator";
import { formatKg } from "@/lib/emission-calculator";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Carbonly" }, { name: "robots", content: "noindex" }] }),
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

function AdminPage() {
  const fn = useServerFn(adminOverview);
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fn() });
  const profiles = data?.profiles ?? [];
  const calcs = data?.calculations ?? [];
  const totalCO2e = calcs.reduce((s, r) => s + Number(r.co2e_kg), 0);
  const topProducts = countBy(calcs, "product_name").slice(0, 8);

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-4xl">Platform overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Users" value={String(profiles.length)} />
        <Stat label="Calculations" value={String(calcs.length)} />
        <Stat label="Total CO₂e" value={formatKg(totalCO2e)} accent />
        <Stat label="Emission factors" value={String(allProducts.length)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-5">
          <p className="mb-4 font-display text-lg">Top products</p>
          <ul className="space-y-2 text-sm">
            {topProducts.map((r) => (
              <li key={r.key} className="flex items-center justify-between border-b pb-2">
                <span>{r.key}</span>
                <span className="text-muted-foreground">{r.count} runs</span>
              </li>
            ))}
            {!topProducts.length && <li className="text-muted-foreground">No data yet.</li>}
          </ul>
        </Card>

        <Card className="rounded-2xl p-5">
          <p className="mb-4 font-display text-lg">Users</p>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Name</th><th className="py-2">Company</th><th className="py-2">Joined</th></tr>
              </thead>
              <tbody>
                {profiles.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.full_name ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{u.company ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl p-5">
        <p className="mb-4 font-display text-lg">Emission factor library ({allProducts.length})</p>
        <p className="mb-3 text-xs text-muted-foreground">Read-only in v1 — Excel re-upload UI ships next.</p>
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Product</th><th className="py-2">Scope</th><th className="py-2">Category</th><th className="py-2">Source</th></tr>
            </thead>
            <tbody>
              {allProducts.map((p) => (
                <tr key={`${p.scope}-${p.name}`} className="border-b">
                  <td className="py-2 pr-3">{p.name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.scope}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.category}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="card-elevated rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent ? "text-accent" : ""}`}>{value}</p>
    </Card>
  );
}

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = String(r[key]);
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return [...m.entries()].map(([k, c]) => ({ key: k, count: c })).sort((a, b) => b.count - a.count);
}
