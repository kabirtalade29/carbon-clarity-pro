import jsPDF from "jspdf";

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

function drawBar(doc: jsPDF, x: number, y: number, w: number, h: number, value: number, max: number, color: string, name: string) {
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

function drawPie(doc: jsPDF, cx: number, cy: number, r: number, parts: { value: number; color: string }[]) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total <= 0) {
    doc.setDrawColor(210); doc.circle(cx, cy, r);
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
        cx, cy,
        cx + r * Math.cos(s), cy + r * Math.sin(s),
        cx + r * Math.cos(e), cy + r * Math.sin(e),
        "F",
      );
    }
    a0 = a1;
  });
}

export function buildReport(data: ReportData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Header band
  doc.setFillColor(GREEN);
  doc.rect(0, 0, 595, 96, "F");
  doc.setTextColor("#F7F3EA");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Carbonly", 48, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("GHG Emissions Report", 48, 62);
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
  line(doc, y); y += 24;

  // Calculation details
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(GREEN);
  doc.text("Calculation Details", 48, y); y += 18;
  label(doc, 48, y, "Scope", data.scope);
  label(doc, 220, y, "Category", data.category);
  label(doc, 400, y, "Product / Fuel", data.product);
  y += 44;
  label(doc, 48, y, "Quantity", `${data.quantity.toLocaleString()} ${data.unit}`);
  label(doc, 220, y, "Unit", data.unit);
  label(doc, 400, y, "Emission Factor", data.efSource);
  y += 44;
  line(doc, y); y += 24;

  // Results
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(GREEN);
  doc.text("Emission Results", 48, y); y += 18;

  const cards = [
    { label: "CO₂", value: data.co2, color: "#1F4F3A" },
    { label: "CH₄", value: data.ch4, color: "#5B7A45" },
    { label: "N₂O", value: data.n2o, color: "#8A5A2A" },
    { label: "Total CO₂e", value: data.co2e, color: "#2F6F52" },
  ];
  const cw = 120, gap = 12;
  cards.forEach((c, i) => {
    const x = 48 + i * (cw + gap);
    doc.setFillColor(BONE); doc.roundedRect(x, y, cw, 76, 6, 6, "F");
    doc.setFontSize(9); doc.setTextColor(MUTED); doc.text(c.label, x + 12, y + 20);
    doc.setFontSize(16); doc.setTextColor(c.color); doc.setFont("helvetica", "bold");
    doc.text(c.value.toFixed(3), x + 12, y + 46);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(MUTED);
    doc.text("kg", x + 12, y + 60);
  });
  y += 100;

  // Charts (pie + bar)
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(GREEN);
  doc.text("Gas breakdown", 48, y); y += 8;
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
    doc.setFillColor(l.c); doc.rect(200, y + 30 + i * 18, 10, 10, "F");
    doc.setTextColor(INK); doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(l.t, 216, y + 40 + i * 18);
  });

  // Bar chart
  const max = Math.max(data.co2, data.ch4, data.n2o, 0.0001);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(GREEN);
  doc.text("Emissions by gas (kg)", 340, y);
  drawBar(doc, 340, y + 22, 150, 12, data.co2, max, "#1F4F3A", "CO₂");
  drawBar(doc, 340, y + 56, 150, 12, data.ch4, max, "#5B7A45", "CH₄");
  drawBar(doc, 340, y + 90, 150, 12, data.n2o, max, "#8A5A2A", "N₂O");
  y += 160;

  line(doc, y); y += 18;
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(GREEN);
  doc.text("Methodology", 48, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(INK);
  const method = doc.splitTextToSize(
    `Emission factor source: ${data.efSource}. CO₂e computed using IPCC AR5 100-year GWP (CO₂=1, CH₄=28, N₂O=265). Direct multiplication method: activity × emission factor.`,
    500,
  );
  doc.text(method, 48, y);
  y += method.length * 12 + 14;

  if (data.notes) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("Notes", 48, y); y += 12;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const notes = doc.splitTextToSize(data.notes, 500);
    doc.text(notes, 48, y); y += notes.length * 12;
  }

  // Footer
  doc.setDrawColor(210); doc.line(48, 800, 547, 800);
  doc.setTextColor(MUTED); doc.setFontSize(8);
  doc.text("Generated by Carbonly. This report is for informational purposes; verify against IPCC/GHG Protocol before disclosure.", 48, 815);
  doc.text(`Page 1`, 547, 815, { align: "right" });
  return doc;
}

export function downloadReport(data: ReportData) {
  const doc = buildReport(data);
  doc.save(`carbonly-report-${data.id.slice(0, 8)}.pdf`);
}

export function printReport(data: ReportData) {
  const doc = buildReport(data);
  doc.autoPrint();
  const blob = doc.output("bloburl");
  window.open(blob, "_blank");
}
