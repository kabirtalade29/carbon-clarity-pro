import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  Sparkles,
  BarChart3,
  ShieldCheck,
  FileText,
  ArrowRight,
  Check,
  Factory,
  Building2,
  Trees,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Climateintel.ai — Enterprise Carbon Emission Calculator" },
      {
        name: "description",
        content:
          "IPCC-grade GHG calculations, live dashboards and audit-ready PDF reports for sustainability teams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <Stats />
      <Features />
      <Preview />
      <WhyUs />
      <About />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Climateintel.ai</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#preview" className="hover:text-foreground">
            Calculator
          </a>
          <a href="#about" className="hover:text-foreground">
            About
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
          <a href="#contact" className="hover:text-foreground">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-secondary)_60%,transparent)_0%,transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" /> IPCC 2006 · GHG Protocol
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-balance md:text-6xl">
            Measure emissions with <span className="italic text-primary">precision.</span> Report
            with confidence.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            A professional carbon accounting workspace for sustainability teams, ESG consultants and
            manufacturers. Live emission factors, defensible math, audit-ready PDFs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Open the dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#preview">See the calculator</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free during beta · No credit card required
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <Card className="card-elevated relative overflow-hidden rounded-2xl border-border/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Q3 · Facility A
                </p>
                <p className="mt-1 font-display text-3xl">
                  1,284.7 <span className="text-lg text-muted-foreground">t CO₂e</span>
                </p>
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                −12% vs Q2
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { l: "Diesel", v: "412.3 t" },
                { l: "Natural Gas", v: "587.1 t" },
                { l: "Grid Elec.", v: "285.3 t" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border bg-background p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
                  <p className="mt-1 font-display text-lg">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 h-32 rounded-xl border bg-gradient-to-b from-secondary/40 to-transparent p-3">
              <div className="flex h-full items-end gap-2">
                {[42, 68, 51, 79, 63, 88, 74, 92, 81].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          </Card>
          <div className="absolute -left-8 -bottom-6 hidden rotate-[-4deg] rounded-xl border bg-card px-4 py-3 shadow-lg md:block">
            <p className="text-xs text-muted-foreground">Report ready</p>
            <p className="font-display text-sm">Q3-Facility-A.pdf</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { n: "119+", l: "Emission factors from IPCC & EPA" },
    { n: "3 gases", l: "CO₂ · CH₄ · N₂O with AR5 GWP" },
    { n: "Scope 1 & 2", l: "Stationary, mobile & purchased electricity" },
    { n: "<2 min", l: "From activity data to audit-ready PDF" },
  ];
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-4 md:px-8">
        {items.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <p className="font-display text-4xl text-primary">{s.n}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: BarChart3,
      t: "Live dashboards",
      d: "Monthly trends, gas breakdowns and product-wise emissions in one place.",
    },
    {
      icon: ShieldCheck,
      t: "Audit-grade math",
      d: "IPCC 2006 factors with AR5 100-year GWP. Every calculation is traceable.",
    },
    {
      icon: FileText,
      t: "Branded PDFs",
      d: "Company, facility and methodology captured for every report.",
    },
    {
      icon: Factory,
      t: "Multi-scope ready",
      d: "Stationary combustion today. Mobile, freight and refrigerants next.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">What's inside</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">
          Everything an ESG team needs, nothing they don't.
        </h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <Card
            key={f.t}
            className="group h-full rounded-2xl border-border/60 p-6 transition-shadow hover:shadow-lg"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <p className="mt-5 font-display text-xl">{f.t}</p>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Preview() {
  return (
    <section id="preview" className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">The calculator</p>
          <h2 className="mt-2 font-display text-4xl">Pick a fuel. Enter a quantity. Done.</h2>
          <p className="mt-4 text-muted-foreground">
            Emission factors are looked up automatically from the built-in IPCC & EPA database.
            Results show CO₂, CH₄, N₂O and total CO₂e — with the exact factor and unit used, so
            anyone can audit the number.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Litres · kg · tonnes · m³ · MWh",
              "GWP AR5 100-year",
              "Save & tag by facility, export to PDF",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild>
              <Link to="/auth">
                Try the calculator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <Card className="card-elevated rounded-2xl border-border/60 p-6">
          <div className="grid gap-3">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Fuel</p>
              <p className="font-medium">Diesel (Gas/Diesel oil)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium">12,500</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium">litre</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[
                { l: "CO₂", v: "36,375 kg", c: "text-primary" },
                { l: "CH₄", v: "4.9 kg", c: "text-primary/80" },
                { l: "N₂O", v: "0.3 kg", c: "text-primary/80" },
                { l: "CO₂e", v: "36.6 t", c: "text-accent" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border bg-background p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
                  <p className={`mt-1 font-display ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    {
      t: "Defensible",
      d: "Public IPCC/EPA sources cited on every report — no hidden assumptions.",
    },
    { t: "Fast", d: "Sub-second lookup and calculation. Reports in under two minutes." },
    { t: "Extensible", d: "Add mobile combustion, freight, refrigerants and Scope 3 as you grow." },
    { t: "Secure", d: "Row-level security, role-based admin, and audit trail on every save." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Why teams choose Climateintel.ai
        </p>
        <h2 className="mt-2 font-display text-4xl">Built by people who've filed CDP reports.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.t} className="rounded-2xl border bg-card p-6">
            <p className="font-display text-xl">{i.t}</p>
            <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="border-y bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">About</p>
          <h2 className="mt-2 font-display text-4xl">
            A quiet, capable workbench for climate teams.
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Climateintel.ai starts where most spreadsheets stall — a shared source of emission factors, a
            clean audit trail, and reports that don't need a design pass before you can share them.
          </p>
          <p>
            We use the IPCC 2006 Guidelines for stationary combustion, EPA eGRID for US electricity,
            and national factors for major grids. Every number on your report links back to its
            source.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-foreground">
            <div className="flex items-center gap-2">
              <Trees className="h-4 w-4 text-primary" /> IPCC 2006
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> GHG Protocol
            </div>
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" /> EPA eGRID
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "What emission factors do you use?",
      a: "IPCC 2006 Guidelines for stationary and mobile fuel combustion, US EPA eGRID for US grid electricity, and national published factors for China, UK, Brazil, Taiwan, and Thailand. Every report cites the exact source and factor value.",
    },
    {
      q: "Which gases are calculated?",
      a: "CO₂, CH₄ and N₂O. CO₂-equivalent is computed with IPCC AR5 100-year Global Warming Potentials (CO₂=1, CH₄=28, N₂O=265).",
    },
    {
      q: "Can I export reports?",
      a: "Yes — every calculation generates a branded PDF with company, facility, methodology and charts. You can also print directly from the browser.",
    },
    {
      q: "Is my data secure?",
      a: "All calculations are scoped to your account by row-level security. Only you (and admins in your workspace) can see your data.",
    },
    {
      q: "What's coming next?",
      a: "Mobile combustion by distance, freight, refrigerants, Scope 3 categories, multi-facility rollup, and a lightweight API.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-24 md:px-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">FAQ</p>
      <h2 className="mt-2 font-display text-4xl">Questions we hear a lot.</h2>
      <Accordion type="single" collapsible className="mt-10">
        {items.map((i) => (
          <AccordionItem key={i.q} value={i.q}>
            <AccordionTrigger className="text-left font-medium">{i.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{i.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-24 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Contact</p>
          <h2 className="mt-2 font-display text-4xl">Talk to the team.</h2>
          <p className="mt-4 text-muted-foreground">
            Enterprise pilot, custom emission factors, on-prem deployment — tell us what you need.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email · </span>hello@climateintel.ai
            </p>
            <p>
              <span className="text-muted-foreground">Support · </span>support@climateintel.ai
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Thanks — we'll be in touch.");
          }}
          className="grid gap-3 rounded-2xl border bg-card p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input required placeholder="Name" name="name" maxLength={100} />
            <Input required placeholder="Company" name="company" maxLength={120} />
          </div>
          <Input required type="email" placeholder="Work email" name="email" maxLength={200} />
          <Textarea required placeholder="How can we help?" name="msg" maxLength={1000} rows={4} />
          <Button type="submit" disabled={sent}>
            {sent ? "Sent ✓" : "Send message"}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-foreground text-primary">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-xl">Climateintel.ai</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-primary-foreground/70">
            Precise carbon accounting for teams that need defensible numbers.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Calculator", "#preview"],
            ["Features", "#features"],
            ["FAQ", "#faq"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About", "#about"],
            ["Contact", "#contact"],
          ]}
        />
        <FooterCol
          title="Methodology"
          links={[
            [
              "IPCC 2006",
              "https://www.ipcc.ch/report/2006-ipcc-guidelines-for-national-greenhouse-gas-inventories/",
            ],
            ["EPA eGRID", "https://www.epa.gov/egrid"],
            ["GHG Protocol", "https://ghgprotocol.org/"],
          ]}
        />
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-primary-foreground/60 md:px-8">
          <p>© {new Date().getFullYear()} Climateintel.ai. Beta.</p>
          <p>Made for climate teams.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
        {links.map(([l, h]) => (
          <li key={l}>
            <a className="hover:text-primary-foreground" href={h}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
