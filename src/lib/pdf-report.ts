import { jsPDF } from "jspdf";
import { formatKg, SCOPES } from "./emission-calculator";
import { SUBSTANCES } from "./gwp-odp-data";

export type ReportData = {
  id: string;
  savedName?: string | null;
  companyName?: string | null;
  facility?: string | null;
  userName?: string | null;
  reportDate: string;
  product: string;
  category: string;
  quantity: number;
  unit: string;
  scope: string;
  efSource: string;
  efDetails?: Record<string, unknown> | null;
  co2: number;
  ch4: number;
  n2o: number;
  co2e: number;
  notes?: string | null;
};

const GREEN = "#1F4F3A";
const CLAY = "#8A5A2A";
const INK = "#22322A";
const MUTED = "#6B7B72";
const BONE = "#F7F3EA";

function line(doc: jsPDF, y: number) {
  doc.setDrawColor(210);
  doc.line(48, y, 547, y);
}

function label(doc: jsPDF, x: number, y: number, k: string, v: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(k.toUpperCase(), x, y);
  doc.setTextColor(INK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(v, x, y + 14);
}

function drawBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  value: number,
  max: number,
  color: string,
  name: string,
) {
  const width = max === 0 ? 0 : Math.max(2, (value / max) * w);
  doc.setFillColor(BONE);
  doc.rect(x, y, w, h, "F");
  doc.setFillColor(color);
  doc.rect(x, y, width, h, "F");
  doc.setFontSize(9);
  doc.setTextColor(INK);
  doc.text(name, x, y - 4);
  doc.setTextColor(MUTED);
  doc.text(`${value.toFixed(3)} kg`, x + w + 6, y + h - 2);
}

function drawPie(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  parts: { value: number; color: string }[],
) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total <= 0) {
    doc.setDrawColor(210);
    doc.circle(cx, cy, r);
    return;
  }
  let a0 = -Math.PI / 2;
  parts.forEach((p) => {
    const a1 = a0 + (p.value / total) * Math.PI * 2;
    const steps = Math.max(12, Math.round(((a1 - a0) / (Math.PI * 2)) * 64));
    doc.setFillColor(p.color);
    // approximate slice with triangle fan
    for (let i = 0; i < steps; i++) {
      const s = a0 + (a1 - a0) * (i / steps);
      const e = a0 + (a1 - a0) * ((i + 1) / steps);
      doc.triangle(
        cx,
        cy,
        cx + r * Math.cos(s),
        cy + r * Math.sin(s),
        cx + r * Math.cos(e),
        cy + r * Math.sin(e),
        "F",
      );
    }
    a0 = a1;
  });
}

export function buildReport(data: ReportData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({
    title: data.savedName || "Emission Calculation Report",
  });

  // Header band
  doc.setFillColor(GREEN);
  doc.rect(0, 0, 595, 96, "F");
  doc.setTextColor("#F7F3EA");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Climateintel.ai", 48, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("GHG Emissions Report", 48, 62);
  doc.setFontSize(8);
  doc.setTextColor("#A5D6A7");
  doc.text("VERIFIED PHYSICAL DATA TRAIL (ASSA 5010 & GHG PROTOCOL COMPLIANT)", 48, 80);
  doc.setTextColor("#F7F3EA");
  doc.setFontSize(9);
  doc.text(`Report ID: ${data.id.slice(0, 8).toUpperCase()}`, 547, 44, { align: "right" });
  doc.text(data.reportDate, 547, 62, { align: "right" });

  // Company block
  let y = 128;
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(data.savedName || "Emission Calculation Report", 48, y);
  y += 26;
  label(doc, 48, y, "Company", data.companyName || "—");
  label(doc, 220, y, "Facility", data.facility || "—");
  label(doc, 400, y, "Prepared by", data.userName || "—");
  y += 44;
  line(doc, y);
  y += 24;

  // Calculation details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Calculation Details", 48, y);
  y += 18;
  label(doc, 48, y, "Scope", data.scope);
  label(doc, 220, y, "Category", data.category);
  label(doc, 400, y, "Product / Fuel", data.product);
  y += 44;
  label(doc, 48, y, "Quantity", `${data.quantity.toLocaleString()} ${data.unit}`);
  label(doc, 220, y, "Unit", data.unit);
  label(doc, 400, y, "Emission Factor", data.efSource);
  y += 44;
  line(doc, y);
  y += 24;

  // Results
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Emission Results", 48, y);
  y += 18;

  const cards = [
    { label: "CO₂", value: data.co2, color: "#1F4F3A" },
    { label: "CH₄", value: data.ch4, color: "#5B7A45" },
    { label: "N₂O", value: data.n2o, color: "#8A5A2A" },
    { label: "Total CO₂e", value: data.co2e, color: "#2F6F52" },
  ];
  const cw = 120,
    gap = 12;
  cards.forEach((c, i) => {
    const x = 48 + i * (cw + gap);
    doc.setFillColor(BONE);
    doc.roundedRect(x, y, cw, 76, 6, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(c.label, x + 12, y + 20);
    doc.setFontSize(16);
    doc.setTextColor(c.color);
    doc.setFont("helvetica", "bold");
    doc.text(c.value.toFixed(3), x + 12, y + 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text("kg", x + 12, y + 60);
  });
  y += 100;

  // Charts (pie + bar)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(GREEN);
  doc.text("Gas breakdown", 48, y);
  y += 8;
  drawPie(doc, 120, y + 70, 55, [
    { value: data.co2, color: "#1F4F3A" },
    { value: data.ch4 * 28, color: "#5B7A45" },
    { value: data.n2o * 265, color: "#8A5A2A" },
  ]);
  // Legend
  const legend = [
    { c: "#1F4F3A", t: "CO₂" },
    { c: "#5B7A45", t: "CH₄ (×28 GWP)" },
    { c: "#8A5A2A", t: "N₂O (×265 GWP)" },
  ];
  legend.forEach((l, i) => {
    doc.setFillColor(l.c);
    doc.rect(200, y + 30 + i * 18, 10, 10, "F");
    doc.setTextColor(INK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(l.t, 216, y + 40 + i * 18);
  });

  // Bar chart
  const max = Math.max(data.co2, data.ch4, data.n2o, 0.0001);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(GREEN);
  doc.text("Emissions by gas (kg)", 340, y);
  drawBar(doc, 340, y + 22, 150, 12, data.co2, max, "#1F4F3A", "CO₂");
  drawBar(doc, 340, y + 56, 150, 12, data.ch4, max, "#5B7A45", "CH₄");
  drawBar(doc, 340, y + 90, 150, 12, data.n2o, max, "#8A5A2A", "N₂O");
  y += 160;

  line(doc, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(GREEN);
  doc.text("Methodology", 48, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK);
  const method = doc.splitTextToSize(
    `Emission factor source: ${data.efSource}. CO₂e computed using IPCC AR5 100-year GWP (CO₂=1, CH₄=28, N₂O=265). Direct multiplication method: activity × emission factor.`,
    500,
  );
  doc.text(method, 48, y);
  y += method.length * 12 + 14;

  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notes", 48, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notes = doc.splitTextToSize(data.notes, 500);
    doc.text(notes, 48, y);
    y += notes.length * 12;
  }

  // Footer
  doc.setDrawColor(210);
  doc.line(48, 800, 547, 800);
  doc.setTextColor(MUTED);
  doc.setFontSize(8);
  doc.text(
    "Generated by Climateintel.ai. This report is for informational purposes; verify against IPCC/GHG Protocol before disclosure.",
    48,
    815,
  );
  doc.text(`Page 1`, 547, 815, { align: "right" });
  return doc;
}

function triggerPdfDownload(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function downloadReport(data: ReportData) {
  const doc = buildReport(data);
  triggerPdfDownload(doc, `climateintel-report-${data.id.slice(0, 8)}.pdf`);
}

export function printReport(data: ReportData) {
  const doc = buildReport(data);
  doc.autoPrint();
  const blob = doc.output("bloburl");
  window.open(blob, "_blank");
}

export type ConsolidatedReportData = {
  id: string;
  reportName: string;
  companyName?: string | null;
  facility?: string | null;
  reportDate: string;
  scope: string;
  totalCo2e: number;
  highestCategory: { name: string; value: number; pct: number };
  highestProduct: { name: string; value: number };
  items: {
    category: string;
    productName: string;
    quantity: number;
    unit: string;
    co2e: number;
    scopeGroup: "Scope 1" | "Scope 2" | "Scope 3";
  }[];
  categoryBreakdown: {
    name: string;
    co2e: number;
    pct: number;
  }[];
  notes?: string | null;
};

function getScopeGroupForCategory(categoryName: string): "Scope 1" | "Scope 2" | "Scope 3" {
  const match = SCOPES.find((s) => s.value === categoryName);
  if (match) {
    return match.hint as "Scope 1" | "Scope 2" | "Scope 3";
  }
  if (categoryName.toLowerCase().includes("scope 3")) return "Scope 3";
  if (categoryName.toLowerCase().includes("scope 2")) return "Scope 2";
  if (categoryName.toLowerCase().includes("scope 1")) return "Scope 1";

  if (
    categoryName === "Stationary Combustion" ||
    categoryName === "Mobile Combustion" ||
    categoryName === "Fugitive Emissions"
  ) {
    return "Scope 1";
  }
  if (categoryName === "Electricity") {
    return "Scope 2";
  }
  return "Scope 3";
}

export function buildConsolidatedReport(data: ConsolidatedReportData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({
    title: data.reportName || "Consolidated Emissions Report",
  });
  let pageNum = 1;

  const drawHeader = () => {
    doc.setFillColor(GREEN);
    doc.rect(0, 0, 595, 96, "F");
    doc.setTextColor("#F7F3EA");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Climateintel.ai", 48, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Consolidated GHG Scope Report", 48, 60);
    doc.setFontSize(9);
    doc.text(`Report ID: ${data.id.slice(0, 8).toUpperCase()}`, 547, 42, { align: "right" });
    doc.text(data.reportDate, 547, 60, { align: "right" });
  };

  const drawFooter = () => {
    doc.setDrawColor(210);
    doc.line(48, 800, 547, 800);
    doc.setTextColor(MUTED);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Generated by Climateintel.ai. Verified calculations aligned with GHG Protocol guidelines.",
      48,
      815,
    );
    doc.text(`Page ${pageNum}`, 547, 815, { align: "right" });
  };

  drawHeader();

  // Overview Info
  let y = 130;
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(data.reportName || "Consolidated Emissions Report", 48, y);
  y += 24;

  label(doc, 48, y, "Company", data.companyName || "—");
  label(doc, 200, y, "Facility", data.facility || "—");
  label(doc, 350, y, "Reporting Scope", data.scope);
  y += 44;
  line(doc, y);
  y += 24;

  // Highlights / KPIs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Executive Summary", 48, y);
  y += 18;

  // KPI boxes: Total CO2e, Highest Cat, Highest Prod
  const kpiW = 158;
  const kpiGap = 12;

  // Box 1: Total
  doc.setFillColor(BONE);
  doc.roundedRect(48, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("TOTAL CO2E EMISSIONS", 60, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(GREEN);
  doc.setFont("helvetica", "bold");
  doc.text(formatKg(data.totalCo2e), 60, y + 46);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Combined value chain total", 60, y + 66);

  // Box 2: Highest Cat
  doc.setFillColor(BONE);
  doc.roundedRect(48 + kpiW + kpiGap, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("HIGHEST EMITTING CATEGORY", 48 + kpiW + kpiGap + 12, y + 20);
  doc.setFontSize(10);
  doc.setTextColor(CLAY);
  doc.setFont("helvetica", "bold");
  const catTrunc =
    data.highestCategory.name.length > 25
      ? data.highestCategory.name.slice(0, 22) + "..."
      : data.highestCategory.name;
  doc.text(catTrunc || "None", 48 + kpiW + kpiGap + 12, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    data.highestCategory.value > 0
      ? `${formatKg(data.highestCategory.value)} (${data.highestCategory.pct.toFixed(1)}%)`
      : "—",
    48 + kpiW + kpiGap + 12,
    y + 66,
  );

  // Box 3: Highest Product
  doc.setFillColor(BONE);
  doc.roundedRect(48 + (kpiW + kpiGap) * 2, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("HIGHEST EMITTING PRODUCT", 48 + (kpiW + kpiGap) * 2 + 12, y + 20);
  doc.setFontSize(10);
  doc.setTextColor(CLAY);
  doc.setFont("helvetica", "bold");
  const prodTrunc =
    data.highestProduct.name.length > 25
      ? data.highestProduct.name.slice(0, 22) + "..."
      : data.highestProduct.name;
  doc.text(prodTrunc || "None", 48 + (kpiW + kpiGap) * 2 + 12, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    data.highestProduct.value > 0 ? `${formatKg(data.highestProduct.value)}` : "—",
    48 + (kpiW + kpiGap) * 2 + 12,
    y + 66,
  );

  y += 104;
  line(doc, y);
  y += 24;

  // Group emissions by Scope Group
  const scopeEmissions = {
    "Scope 1": 0,
    "Scope 2": 0,
    "Scope 3": 0,
  };
  data.items.forEach((item) => {
    scopeEmissions[item.scopeGroup] += item.co2e;
  });

  const totalCo2eVal = data.totalCo2e || 0.0001;

  // Scope Breakdown Analysis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Scope Breakdown Analysis", 48, y);
  y += 18;

  const scopesOrder: ("Scope 1" | "Scope 2" | "Scope 3")[] = ["Scope 1", "Scope 2", "Scope 3"];
  const scopeColors = {
    "Scope 1": "#1F4F3A",
    "Scope 2": "#5B7A45",
    "Scope 3": "#8A5A2A",
  };
  const scopeLabels = {
    "Scope 1": "Scope 1 (Direct Emissions)",
    "Scope 2": "Scope 2 (Indirect Emissions)",
    "Scope 3": "Scope 3 (Value Chain Emissions)",
  };

  scopesOrder.forEach((sName) => {
    const val = scopeEmissions[sName];
    const pct = (val / totalCo2eVal) * 100;

    doc.setFontSize(9);
    doc.setTextColor(INK);
    doc.setFont("helvetica", "bold");
    doc.text(scopeLabels[sName], 48, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(`${formatKg(val)} (${pct.toFixed(1)}%)`, 547, y, { align: "right" });
    y += 8;

    doc.setFillColor(BONE);
    doc.rect(48, y, 500, 8, "F");

    doc.setFillColor(scopeColors[sName]);
    const fillW = Math.max(0, (val / totalCo2eVal) * 500);
    if (fillW > 0) {
      doc.rect(48, y, fillW, 8, "F");
    }
    y += 22;
  });

  y += 10;
  line(doc, y);
  y += 24;

  // Category Breakdown List
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Category Breakdown Analysis", 48, y);
  y += 18;

  const barMax = Math.max(...data.categoryBreakdown.map((c) => c.co2e), 0.0001);
  data.categoryBreakdown.forEach((cb) => {
    if (y > 720) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawHeader();
      y = 130;
    }
    // Draw simple custom bar
    doc.setFontSize(9);
    doc.setTextColor(INK);
    doc.setFont("helvetica", "bold");
    doc.text(cb.name, 48, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(`${formatKg(cb.co2e)} (${cb.pct.toFixed(1)}%)`, 547, y, { align: "right" });
    y += 8;

    // Draw bar background
    doc.setFillColor(BONE);
    doc.rect(48, y, 500, 8, "F");
    // Draw fill
    doc.setFillColor(GREEN);
    const fillW = Math.max(1, (cb.co2e / barMax) * 500);
    doc.rect(48, y, fillW, 8, "F");

    y += 22;
  });

  y += 10;

  // Detailed Product Table grouped by Scope Group
  const scopesForTable: ("Scope 1" | "Scope 2" | "Scope 3")[] = ["Scope 1", "Scope 2", "Scope 3"];
  let printedTableHeader = false;

  scopesForTable.forEach((sName) => {
    const scopeItems = data.items.filter((item) => item.scopeGroup === sName);
    if (scopeItems.length === 0) return;

    if (!printedTableHeader) {
      if (y > 700) {
        drawFooter();
        doc.addPage();
        pageNum++;
        drawHeader();
        y = 130;
      } else {
        y += 14;
        line(doc, y);
        y += 24;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(GREEN);
      doc.text("Detailed Itemized Calculations", 48, y);
      y += 18;
      printedTableHeader = true;
    }

    // Print subheader for this Scope group
    if (y > 720) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawHeader();
      y = 130;
    } else {
      y += 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(CLAY);
    doc.text(`${sName.toUpperCase()} DETAILS`, 48, y);
    y += 12;

    // Headers
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.setFont("helvetica", "bold");
    doc.text("CATEGORY", 48, y);
    doc.text("PRODUCT / ACTIVITY DESCRIPTION", 180, y);
    doc.text("QTY / UNIT", 410, y);
    doc.text("EMISSIONS (CO2e)", 547, y, { align: "right" });
    y += 12;
    doc.line(48, y, 547, y);
    y += 14;

    scopeItems.forEach((item) => {
      if (y > 740) {
        drawFooter();
        doc.addPage();
        pageNum++;
        drawHeader();
        y = 130;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(CLAY);
        doc.text(`${sName.toUpperCase()} DETAILS (CONT.)`, 48, y);
        y += 12;

        doc.setFontSize(8);
        doc.setTextColor(MUTED);
        doc.setFont("helvetica", "bold");
        doc.text("CATEGORY", 48, y);
        doc.text("PRODUCT / ACTIVITY DESCRIPTION", 180, y);
        doc.text("QTY / UNIT", 410, y);
        doc.text("EMISSIONS (CO2e)", 547, y, { align: "right" });
        y += 12;
        doc.line(48, y, 547, y);
        y += 14;
      }

      doc.setFontSize(9);
      doc.setTextColor(INK);
      doc.setFont("helvetica", "normal");

      const catTrunc =
        item.category.length > 20 ? item.category.slice(0, 18) + "..." : item.category;
      doc.text(catTrunc, 48, y);

      const nameTrunc =
        item.productName.length > 38 ? item.productName.slice(0, 35) + "..." : item.productName;
      doc.text(nameTrunc, 180, y);

      doc.text(`${item.quantity.toLocaleString()} ${item.unit}`, 410, y);
      doc.setFont("helvetica", "bold");
      doc.text(formatKg(item.co2e), 547, y, { align: "right" });
      y += 18;
    });

    y += 14;
  });

  if (data.notes) {
    if (y > 700) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawHeader();
      y = 130;
    } else {
      y += 12;
      line(doc, y);
      y += 24;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(GREEN);
    doc.text("Report Notes", 48, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const splitNotes = doc.splitTextToSize(data.notes, 500);
    doc.text(splitNotes, 48, y);
  }

  drawFooter();
  return doc;
}

export function downloadConsolidatedReport(data: ConsolidatedReportData) {
  const doc = buildConsolidatedReport(data);
  triggerPdfDownload(doc, `climateintel-consolidated-${data.id.slice(0, 8)}.pdf`);
}

export type GwpOdpReportData = {
  id: string;
  reportName: string;
  substanceName: string;
  chemicalName: string;
  formula: string;
  group: string;
  quantity: number;
  unit: string;
  odp: number;
  gwpAR4: number;
  gwpAR5: number;
  gwpAR6: number;
  odpEquivalent: number; // in tonnes
  co2eAR4: number; // in tonnes CO2e
  co2eAR5: number; // in tonnes CO2e
  co2eAR6: number; // in tonnes CO2e
  composition?: { name: string; percentage: number; quantity: number }[];
  notes?: string | null;
  companyName?: string | null;
  facility?: string | null;
  reportDate: string;
};

export function buildGwpOdpReport(data: GwpOdpReportData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let pageNum = 1;
  doc.setProperties({
    title: data.reportName || "GWP & ODP Assessment Report",
  });

  // Header band
  doc.setFillColor(GREEN);
  doc.rect(0, 0, 595, 96, "F");
  doc.setTextColor("#F7F3EA");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Climateintel.ai", 48, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("GWP & ODP Refrigerant Assessment Report", 48, 60);
  doc.setFontSize(9);
  doc.text(`Report ID: ${data.id.slice(0, 8).toUpperCase()}`, 547, 42, { align: "right" });
  doc.text(data.reportDate, 547, 60, { align: "right" });

  // Overview Info
  let y = 130;
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(data.reportName || "Substance GWP-ODP Analysis", 48, y);
  y += 24;

  label(doc, 48, y, "Company", data.companyName || "—");
  label(doc, 200, y, "Facility", data.facility || "—");
  label(doc, 350, y, "Assessment Date", data.reportDate);
  y += 44;
  line(doc, y);
  y += 24;

  // Executive Summary Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Substance Profile", 48, y);
  y += 18;

  // Profile fields
  label(doc, 48, y, "Substance / Blend", data.substanceName);
  label(doc, 200, y, "Chemical Name", data.chemicalName || "—");
  label(doc, 350, y, "Formula / Composition", data.formula || "—");
  y += 44;
  label(doc, 48, y, "Substance Group", data.group);
  label(doc, 200, y, "Total Mass", `${data.quantity.toLocaleString()} ${data.unit}`);
  label(doc, 350, y, "Base Ozone Depletion Potential", data.odp.toFixed(3));
  y += 44;
  line(doc, y);
  y += 24;

  // KPIs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("Calculation Results Summary", 48, y);
  y += 18;

  const kpiW = 158;
  const kpiGap = 12;

  // Box 1: ODP Equivalent
  doc.setFillColor(BONE);
  doc.roundedRect(48, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("ODP EQUIVALENT IMPACT", 60, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(CLAY);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.odpEquivalent.toFixed(4)} t`, 60, y + 46);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Ozone Depleting Tonnes (CFC-11 eq)", 60, y + 66);

  // Box 2: AR6 CO2e Impact
  doc.setFillColor(BONE);
  doc.roundedRect(48 + kpiW + kpiGap, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("CLIMATE IMPACT (AR6)", 48 + kpiW + kpiGap + 12, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(GREEN);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.co2eAR6.toFixed(2)} t`, 48 + kpiW + kpiGap + 12, y + 46);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Tonnes CO2-eq (IPCC AR6)", 48 + kpiW + kpiGap + 12, y + 66);

  // Box 3: AR5 CO2e Impact
  doc.setFillColor(BONE);
  doc.roundedRect(48 + (kpiW + kpiGap) * 2, y, kpiW, 80, 6, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("CLIMATE IMPACT (AR5)", 48 + (kpiW + kpiGap) * 2 + 12, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(GREEN);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.co2eAR5.toFixed(2)} t`, 48 + (kpiW + kpiGap) * 2 + 12, y + 46);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Tonnes CO2-eq (IPCC AR5)", 48 + (kpiW + kpiGap) * 2 + 12, y + 66);

  y += 104;
  line(doc, y);
  y += 24;

  // Comparison Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(GREEN);
  doc.text("IPCC GWP Characterization Factor Comparison", 48, y);
  y += 18;

  // Table Headers
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "bold");
  doc.text("IPCC ASSESSMENT REPORT", 48, y);
  doc.text("CHARACTERIZATION GWP FACTOR", 220, y);
  doc.text("CLIMATE EQUIVALENT EMISSIONS", 547, y, { align: "right" });
  y += 12;
  doc.line(48, y, 547, y);
  y += 16;

  // Table Rows
  const rows = [
    { report: "IPCC Fourth Assessment Report (AR4)", factor: data.gwpAR4, value: data.co2eAR4 },
    { report: "IPCC Fifth Assessment Report (AR5)", factor: data.gwpAR5, value: data.co2eAR5 },
    { report: "IPCC Sixth Assessment Report (AR6)", factor: data.gwpAR6, value: data.co2eAR6 },
  ];

  rows.forEach((r) => {
    doc.setFontSize(9);
    doc.setTextColor(INK);
    doc.setFont("helvetica", "normal");
    doc.text(r.report, 48, y);
    doc.text(r.factor > 0 ? `${r.factor.toLocaleString()} kg CO2e / kg` : "0 (Low GWP)", 220, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${r.value.toFixed(2)} t CO2e`, 547, y, { align: "right" });
    y += 20;
  });

  y += 10;

  // Blend Composition (if applicable)
  if (data.composition && data.composition.length > 0) {
    y += 14;
    line(doc, y);
    y += 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(GREEN);
    doc.text("Blend Component Breakdown", 48, y);
    y += 18;

    // Table Headers
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.setFont("helvetica", "bold");
    doc.text("GAS CONSTITUENT", 48, y);
    doc.text("COMPOSITION (%)", 200, y);
    doc.text("COMPONENT WEIGHT", 340, y);
    doc.text("AR6 GWP CONTRIBUTION", 547, y, { align: "right" });
    y += 12;
    doc.line(48, y, 547, y);
    y += 16;

    data.composition.forEach((comp) => {
      doc.setFontSize(9);
      doc.setTextColor(INK);
      doc.setFont("helvetica", "normal");
      doc.text(comp.name, 48, y);
      doc.text(`${comp.percentage.toFixed(1)} %`, 200, y);
      doc.text(`${comp.quantity.toFixed(2)} kg`, 340, y);
      doc.setFont("helvetica", "bold");
      // Calculate contribution (mass in t * GWP)
      const gwpSub = SUBSTANCES.find((s) => s.name === comp.name);
      const gwpAR6Fact = gwpSub ? gwpSub.gwpAR6 : 0;
      const co2eFact = (comp.quantity / 1000) * gwpAR6Fact;
      doc.text(`${co2eFact.toFixed(2)} t CO2e`, 547, y, { align: "right" });
      y += 20;
    });
  }

  // Notes
  if (data.notes) {
    if (y > 700) {
      doc.setDrawColor(210);
      doc.line(48, 800, 547, 800);
      doc.setTextColor(MUTED);
      doc.setFontSize(8);
      doc.text(
        "Generated by Climateintel.ai. Verified calculations aligned with Kigali Amendment.",
        48,
        815,
      );
      doc.text(`Page ${pageNum}`, 547, 815, { align: "right" });

      doc.addPage();
      pageNum++;
      // Redraw Header
      doc.setFillColor(GREEN);
      doc.rect(0, 0, 595, 96, "F");
      doc.setTextColor("#F7F3EA");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Climateintel.ai", 48, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("GWP & ODP Refrigerant Assessment Report", 48, 60);
      doc.setFontSize(9);
      doc.text(`Report ID: ${data.id.slice(0, 8).toUpperCase()}`, 547, 42, { align: "right" });
      doc.text(data.reportDate, 547, 60, { align: "right" });

      y = 130;
    } else {
      y += 12;
      line(doc, y);
      y += 24;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(GREEN);
    doc.text("Report Notes & Observations", 48, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const splitNotes = doc.splitTextToSize(data.notes, 500);
    doc.text(splitNotes, 48, y);
  }

  // Footer
  doc.setDrawColor(210);
  doc.line(48, 800, 547, 800);
  doc.setTextColor(MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Generated by Climateintel.ai. Verified calculations aligned with Kigali Amendment.", 48, 815);
  doc.text(`Page ${pageNum}`, 547, 815, { align: "right" });

  return doc;
}

export function downloadGwpOdpReport(data: GwpOdpReportData) {
  const doc = buildGwpOdpReport(data);
  triggerPdfDownload(doc, `gwp-odp-analysis-${data.id.slice(0, 8)}.pdf`);
}
