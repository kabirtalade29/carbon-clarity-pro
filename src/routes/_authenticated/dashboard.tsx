import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/app-shell";
import { getMyStats, getMyProfile } from "@/lib/calculations.functions";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { formatKg } from "@/lib/emission-calculator";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — clisomumbai" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const statsFn = useServerFn(getMyStats);
  const profileFn = useServerFn(getMyProfile);
  const { data: rows = [] } = useQuery({ queryKey: ["me", "stats"], queryFn: () => statsFn() });
  const { data: profile } = useQuery({ queryKey: ["me", "profile"], queryFn: () => profileFn() });

  const total = rows.reduce((s, r) => s + Number(r.co2e_kg), 0);
  const co2 = rows.reduce((s, r) => s + Number(r.co2_kg), 0);
  const ch4 = rows.reduce((s, r) => s + Number(r.ch4_kg), 0);
  const n2o = rows.reduce((s, r) => s + Number(r.n2o_kg), 0);

  const byMonth = groupByMonth(rows);
  const byProduct = groupBy(rows, "product_name").slice(0, 6);
  const gases = [
    { name: "CO₂", value: co2, fill: "var(--chart-1)" },
    { name: "CH₄ (×28)", value: ch4 * 28, fill: "var(--chart-2)" },
    { name: "N₂O (×265)", value: n2o * 265, fill: "var(--chart-4)" },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="mt-1 font-display text-4xl">
            Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
          </h1>
        </div>
        <Button asChild>
          <Link to="/calculator">
            New calculation <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total calculations" value={String(rows.length)} />
        <StatCard label="Total CO₂e" value={formatKg(total)} accent />
        <StatCard label="CO₂" value={formatKg(co2)} />
        <StatCard label="CH₄ + N₂O (as CO₂e)" value={formatKg(ch4 * 28 + n2o * 265)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg">Monthly CO₂e</p>
            <p className="text-xs text-muted-foreground">Last 12 months · kg</p>
          </div>
          <div className="h-64">
            {byMonth.length ? (
              <ResponsiveContainer>
                <LineChart data={byMonth}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <p className="mb-3 font-display text-lg">Gas mix (CO₂e)</p>
          <div className="h-64">
            {total > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={gases}
                    dataKey="value"
                    innerRadius={44}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {gases.map((g, i) => (
                      <Cell key={i} fill={g.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {gases.map((g) => (
              <div key={g.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: g.fill }} /> {g.name}
                </span>
                <span>{formatKg(g.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 lg:col-span-2">
          <p className="mb-3 font-display text-lg">Emissions by product</p>
          <div className="h-64">
            {byProduct.length ? (
              <ResponsiveContainer>
                <BarChart data={byProduct} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis
                    type="category"
                    dataKey="key"
                    tick={{ fontSize: 11 }}
                    width={140}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </Card>
        <Card className="rounded-2xl p-5">
          <p className="mb-3 font-display text-lg">Recent</p>
          <ul className="space-y-2 text-sm">
            {rows.slice(0, 6).map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-b pb-2 last:border-none"
              >
                <span className="truncate pr-2">{r.product_name}</span>
                <span className="whitespace-nowrap font-medium">{formatKg(Number(r.co2e_kg))}</span>
              </li>
            ))}
            {!rows.length && (
              <li className="rounded-lg border bg-muted/40 p-4 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-4 w-4" />
                <p className="mt-2">No calculations yet. Run your first one.</p>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="card-elevated rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent ? "text-accent" : ""}`}>{value}</p>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
      Data appears after your first calculation.
    </div>
  );
}

function groupByMonth(rows: { created_at: string; co2e_kg: number | string }[]) {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(r.co2e_kg));
  });
  return [...map.entries()].map(([k, v]) => ({
    label: new Date(k + "-01").toLocaleString(undefined, { month: "short" }),
    value: Math.round(v * 100) / 100,
  }));
}

function groupBy(rows: { co2e_kg: number | string; product_name: string }[], key: "product_name") {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r[key], (map.get(r[key]) ?? 0) + Number(r.co2e_kg)));
  return [...map.entries()]
    .map(([k, v]) => ({ key: k, value: Math.round(v * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}
