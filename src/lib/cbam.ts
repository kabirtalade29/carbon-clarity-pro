import { jsPDF } from "jspdf";

export type CbamSector = "iron_steel" | "aluminium" | "fertilizers" | "cement" | "hydrogen";

export type HsnCnMapping = {
  hsnCode: string;
  cnCode: string;
  productName: string;
  sector: CbamSector;
  unit: string;
  defaultEuBenchmarkSEE: number; // EU default factor (tCO2e / tonne)
  typicalIndianSEE: number; // Typical Indian plant factor (tCO2e / tonne)
  precursorRequired: boolean;
  precursorList?: string[];
};

export const HSN_CN_DATABASE: HsnCnMapping[] = [
  // Iron & Steel
  {
    hsnCode: "7207",
    cnCode: "7207 11 00",
    productName: "Semi-finished products of iron or non-alloy steel (Billets / Blooms)",
    sector: "iron_steel",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.15,
    typicalIndianSEE: 1.82,
    precursorRequired: true,
    precursorList: ["Pig Iron (CN 7201)", "Direct Reduced Iron DRI (CN 7203)"],
  },
  {
    hsnCode: "7208",
    cnCode: "7208 51 00",
    productName: "Flat-rolled products of iron/steel, hot-rolled, not in coils (Plates / Sheets)",
    sector: "iron_steel",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.38,
    typicalIndianSEE: 1.95,
    precursorRequired: true,
    precursorList: ["Steel Slabs (CN 7207)"],
  },
  {
    hsnCode: "7214",
    cnCode: "7214 20 00",
    productName: "Bars and rods of iron or non-alloy steel (TMT Rebars / Wire Rods)",
    sector: "iron_steel",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.20,
    typicalIndianSEE: 1.88,
    precursorRequired: true,
    precursorList: ["Steel Billets (CN 7207)"],
  },
  {
    hsnCode: "7304",
    cnCode: "7304 11 00",
    productName: "Tubes, pipes and hollow profiles, seamless, of iron or steel",
    sector: "iron_steel",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.45,
    typicalIndianSEE: 2.05,
    precursorRequired: true,
    precursorList: ["Steel Rounds / Hollow Blooms (CN 7207)"],
  },
  {
    hsnCode: "7308",
    cnCode: "7308 90 00",
    productName: "Structures and parts of structures of iron or steel (Beams / Columns / Towers)",
    sector: "iron_steel",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.50,
    typicalIndianSEE: 2.10,
    precursorRequired: true,
    precursorList: ["Hot-rolled Steel Sections (CN 7216)"],
  },

  // Aluminium
  {
    hsnCode: "7601",
    cnCode: "7601 10 00",
    productName: "Unwrought aluminium, not alloyed (Primary Ingots / Sows)",
    sector: "aluminium",
    unit: "tonne",
    defaultEuBenchmarkSEE: 8.60,
    typicalIndianSEE: 6.80,
    precursorRequired: true,
    precursorList: ["Alumina (CN 2818 20 00)"],
  },
  {
    hsnCode: "7604",
    cnCode: "7604 10 10",
    productName: "Aluminium bars, rods and profiles (Extrusions / Architectural Sections)",
    sector: "aluminium",
    unit: "tonne",
    defaultEuBenchmarkSEE: 9.10,
    typicalIndianSEE: 7.25,
    precursorRequired: true,
    precursorList: ["Aluminium Billets (CN 7601)"],
  },
  {
    hsnCode: "7606",
    cnCode: "7606 11 00",
    productName: "Aluminium plates, sheets and strip, of a thickness exceeding 0.2 mm",
    sector: "aluminium",
    unit: "tonne",
    defaultEuBenchmarkSEE: 9.20,
    typicalIndianSEE: 7.40,
    precursorRequired: true,
    precursorList: ["Aluminium Rolling Slabs (CN 7601)"],
  },

  // Fertilizers
  {
    hsnCode: "2814",
    cnCode: "2814 10 00",
    productName: "Anhydrous ammonia (Liquid Gas)",
    sector: "fertilizers",
    unit: "tonne",
    defaultEuBenchmarkSEE: 2.70,
    typicalIndianSEE: 2.15,
    precursorRequired: false,
  },
  {
    hsnCode: "3102",
    cnCode: "3102 10 00",
    productName: "Urea, whether or not in aqueous solution",
    sector: "fertilizers",
    unit: "tonne",
    defaultEuBenchmarkSEE: 1.95,
    typicalIndianSEE: 1.58,
    precursorRequired: true,
    precursorList: ["Ammonia (CN 2814)"],
  },

  // Cement
  {
    hsnCode: "2523",
    cnCode: "2523 10 00",
    productName: "Cement clinkers",
    sector: "cement",
    unit: "tonne",
    defaultEuBenchmarkSEE: 0.92,
    typicalIndianSEE: 0.78,
    precursorRequired: false,
  },
  {
    hsnCode: "2523",
    cnCode: "2523 29 00",
    productName: "Ordinary Portland Cement (Grey Cement)",
    sector: "cement",
    unit: "tonne",
    defaultEuBenchmarkSEE: 0.78,
    typicalIndianSEE: 0.64,
    precursorRequired: true,
    precursorList: ["Cement Clinker (CN 2523 10 00)"],
  },

  // Hydrogen
  {
    hsnCode: "2804",
    cnCode: "2804 10 00",
    productName: "Hydrogen (Pure compressed or liquefied)",
    sector: "hydrogen",
    unit: "tonne",
    defaultEuBenchmarkSEE: 9.80,
    typicalIndianSEE: 8.50,
    precursorRequired: false,
  },
];

export type CbamQuarterlyDeclaration = {
  id: string;
  quarter: string; // e.g., "Q1 2026"
  year: number;
  declarantName: string;
  declarantEori: string;
  installationName: string;
  installationCountry: string; // "IN"
  installationUnlocode: string; // "INBOM"
  cnCode: string;
  hsnCode: string;
  productName: string;
  quantityTonnes: number;
  productionRoute: string; // e.g. "BF-BOF" or "DRI-EAF" or "Electrolysis"
  directEmissionsTCO2e: number; // Scope 1 direct
  indirectEmissionsTCO2e: number; // Scope 2 electricity
  precursorEmissionsTCO2e: number; // Embedded in precursors
  totalSpecificEmbeddedEmissions: number; // tCO2e / tonne
  carbonPricePaidInOriginInr: number; // Any domestic CCTS/carbon tax paid
  carbonPriceDeductionEur: number; // Converted EUR deduction
  effectiveCbamLiabilityEur: number; // Liability at €69/t
  status: "DRAFT" | "VALIDATED" | "SUBMITTED";
  generatedXml?: string;
  createdAt: string;
};

export const SAMPLE_CBAM_DECLARATIONS: CbamQuarterlyDeclaration[] = [
  {
    id: "cbam-2026-q1-01",
    quarter: "Q1",
    year: 2026,
    declarantName: "EuroSteel Logistics NV",
    declarantEori: "NL123456789012",
    installationName: "Raigad Blast Furnace & Rolling Mills",
    installationCountry: "IN",
    installationUnlocode: "INJNP",
    cnCode: "7208 51 00",
    hsnCode: "7208",
    productName: "Hot-rolled Steel Plates (Non-alloy)",
    quantityTonnes: 8500,
    productionRoute: "Blast Furnace - Basic Oxygen Furnace (BF-BOF)",
    directEmissionsTCO2e: 10625, // 1.25 t/t
    indirectEmissionsTCO2e: 2975, // 0.35 t/t
    precursorEmissionsTCO2e: 2125, // 0.25 t/t
    totalSpecificEmbeddedEmissions: 1.85, // tCO2e / tonne
    carbonPricePaidInOriginInr: 4250000,
    carbonPriceDeductionEur: 47222,
    effectiveCbamLiabilityEur: 1037728, // (8500 * 1.85 * 69) - deduction
    status: "VALIDATED",
    createdAt: "2026-04-10",
  },
  {
    id: "cbam-2026-q1-02",
    quarter: "Q1",
    year: 2026,
    declarantName: "AluVeritas Trading GmbH",
    declarantEori: "DE987654321098",
    installationName: "Pune Precision Aluminium Extrusions",
    installationCountry: "IN",
    installationUnlocode: "INPUN",
    cnCode: "7604 10 10",
    hsnCode: "7604",
    productName: "Aluminium Extruded Architectural Profiles",
    quantityTonnes: 2400,
    productionRoute: "Smelter - Extrusion Press with Renewable PPA",
    directEmissionsTCO2e: 3600, // 1.50 t/t
    indirectEmissionsTCO2e: 9600, // 4.00 t/t
    precursorEmissionsTCO2e: 3840, // 1.60 t/t
    totalSpecificEmbeddedEmissions: 7.10, // tCO2e / tonne
    carbonPricePaidInOriginInr: 1800000,
    carbonPriceDeductionEur: 20000,
    effectiveCbamLiabilityEur: 1155700, // (2400 * 7.10 * 69) - deduction
    status: "DRAFT",
    createdAt: "2026-04-14",
  },
];

/**
 * Computes Specific Embedded Emissions (SEE) for a CBAM shipment
 */
export function calculateCbamMetrics(params: {
  quantityTonnes: number;
  directScope1Tonnes: number;
  electricityMWh: number;
  gridFactorTonnesPerMWh?: number;
  precursorTonnesCO2e?: number;
  carbonPricePaidInr?: number;
  inrToEurRate?: number;
  cbamPricePerTonneEur?: number;
}) {
  const {
    quantityTonnes,
    directScope1Tonnes,
    electricityMWh,
    gridFactorTonnesPerMWh = 0.716, // India CEA Baseline v19
    precursorTonnesCO2e = 0,
    carbonPricePaidInr = 0,
    inrToEurRate = 90, // 1 EUR = 90 INR approx
    cbamPricePerTonneEur = 69,
  } = params;

  const indirectScope2Tonnes = electricityMWh * gridFactorTonnesPerMWh;
  const totalEmissionsTonnes = directScope1Tonnes + indirectScope2Tonnes + precursorTonnesCO2e;
  const specificEmbeddedEmissions = quantityTonnes > 0 ? totalEmissionsTonnes / quantityTonnes : 0;

  const grossLiabilityEur = totalEmissionsTonnes * cbamPricePerTonneEur;
  const carbonPriceDeductionEur = carbonPricePaidInr > 0 ? carbonPricePaidInr / inrToEurRate : 0;
  const netCbamLiabilityEur = Math.max(0, grossLiabilityEur - carbonPriceDeductionEur);
  const netCbamLiabilityInr = netCbamLiabilityEur * inrToEurRate;

  return {
    directScope1Tonnes: Number(directScope1Tonnes.toFixed(2)),
    indirectScope2Tonnes: Number(indirectScope2Tonnes.toFixed(2)),
    precursorTonnesCO2e: Number(precursorTonnesCO2e.toFixed(2)),
    totalEmissionsTonnes: Number(totalEmissionsTonnes.toFixed(2)),
    specificEmbeddedEmissions: Number(specificEmbeddedEmissions.toFixed(3)),
    grossLiabilityEur: Number(grossLiabilityEur.toFixed(2)),
    carbonPriceDeductionEur: Number(carbonPriceDeductionEur.toFixed(2)),
    netCbamLiabilityEur: Number(netCbamLiabilityEur.toFixed(2)),
    netCbamLiabilityInr: Number(netCbamLiabilityInr.toFixed(2)),
  };
}

/**
 * Generates an EU DG TAXUD Schema-Compliant Quarterly CBAM XML Declaration
 */
export function generateCbamQuarterlyXml(decl: CbamQuarterlyDeclaration): string {
  const timestamp = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<CBAMQuarterlyReport xmlns="urn:eu:taxud:cbam:v1" version="1.0">
  <Header>
    <MessageId>CLISO-CBAM-${decl.id}-${Date.now()}</MessageId>
    <Timestamp>${timestamp}</Timestamp>
    <ReportingPeriod>
      <Quarter>${decl.quarter}</Quarter>
      <Year>${decl.year}</Year>
    </ReportingPeriod>
    <SoftwareVendor>
      <Name>clisomumbai (Climate Social Mumbai)</Name>
      <PlatformUrl>https://clisomumbai.com</PlatformUrl>
      <AssuranceStandard>ASSA 5010 / ISO 14064</AssuranceStandard>
    </SoftwareVendor>
  </Header>

  <Declarant>
    <EORI>${decl.declarantEori}</EORI>
    <Name>${escapeXml(decl.declarantName)}</Name>
    <Role>IMPORTER</Role>
  </Declarant>

  <Installation>
    <Name>${escapeXml(decl.installationName)}</Name>
    <Country>${decl.installationCountry}</Country>
    <UNLOCODE>${decl.installationUnlocode}</UNLOCODE>
    <VerificationStatus>PRIMARY_FACTORY_DATA_VERIFIED</VerificationStatus>
  </Installation>

  <GoodsImported>
    <GoodItem itemNumber="1">
      <CNCode>${decl.cnCode.replace(/\s+/g, "")}</CNCode>
      <HSNCode>${decl.hsnCode}</HSNCode>
      <Description>${escapeXml(decl.productName)}</Description>
      <Quantity unit="t">${decl.quantityTonnes}</Quantity>
      <ProductionRoute>${escapeXml(decl.productionRoute)}</ProductionRoute>

      <EmissionsData methodology="ACTUAL_MONITORED_DATA">
        <DirectEmbeddedEmissions unit="tCO2e">${decl.directEmissionsTCO2e}</DirectEmbeddedEmissions>
        <IndirectEmbeddedEmissions unit="tCO2e">${decl.indirectEmissionsTCO2e}</IndirectEmbeddedEmissions>
        <PrecursorEmbeddedEmissions unit="tCO2e">${decl.precursorEmissionsTCO2e}</PrecursorEmbeddedEmissions>
        <SpecificEmbeddedEmissions unit="tCO2e/t">${decl.totalSpecificEmbeddedEmissions}</SpecificEmbeddedEmissions>
      </EmissionsData>

      <CarbonPricePaidInCountryOfOrigin>
        <Paid>true</Paid>
        <Currency>INR</Currency>
        <AmountPaid>${decl.carbonPricePaidInOriginInr}</AmountPaid>
        <EquivalentDeductionEUR>${decl.carbonPriceDeductionEur}</EquivalentDeductionEUR>
        <RegulatoryScheme>India Carbon Credit Trading Scheme (CCTS)</RegulatoryScheme>
      </CarbonPricePaidInCountryOfOrigin>

      <FinancialLiability>
        <CBAMCertificateReferenceRateEUR>69.00</CBAMCertificateReferenceRateEUR>
        <NetPayableLiabilityEUR>${decl.effectiveCbamLiabilityEur}</NetPayableLiabilityEUR>
      </FinancialLiability>
    </GoodItem>
  </GoodsImported>

  <AuditTrace>
    <HashSignature sha256="${generateMockHash(decl.id)}"/>
    <CertifiedBy>clisomumbai Assurance Engine</CertifiedBy>
  </AuditTrace>
</CBAMQuarterlyReport>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateMockHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `SHA256:${Math.abs(hash).toString(16).padStart(16, "0")}${Date.now().toString(16)}`;
}

/**
 * Triggers download of the CBAM XML File
 */
export function downloadCbamXmlFile(decl: CbamQuarterlyDeclaration) {
  const xml = generateCbamQuarterlyXml(decl);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cbam-declaration-${decl.quarter}-${decl.year}-${decl.id}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive CBAM Declaration PDF
 */
export function exportCbamDeclarationPdf(decl: CbamQuarterlyDeclaration) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595.28;
  const H = 841.89;

  // Header Banner
  doc.setFillColor(15, 42, 24); // #0F2A18 deep forest
  doc.rect(0, 0, W, 85, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("clisomumbai", 44, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 230, 200);
  doc.text("EU CBAM QUARTERLY DECLARATION & EMBEDDED EMISSIONS REPORT", 44, 58);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Period: ${decl.quarter} ${decl.year}`, W - 140, 40);
  doc.text(`DG TAXUD Schema v1.0`, W - 140, 55);

  // Metadata block
  doc.setFillColor(245, 248, 246);
  doc.rect(44, 105, W - 88, 65, "F");
  doc.setDrawColor(220, 230, 225);
  doc.rect(44, 105, W - 88, 65, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 45, 30);
  doc.text(`EU Declarant (Importer): ${decl.declarantName} (EORI: ${decl.declarantEori})`, 58, 124);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 100, 90);
  doc.text(`Manufacturing Facility: ${decl.installationName} (UN/LOCODE: ${decl.installationUnlocode})`, 58, 142);
  doc.text(`Production Route: ${decl.productionRoute}`, 58, 158);

  // Key KPI Cards
  const kpis = [
    { label: "Shipment Volume", val: `${decl.quantityTonnes.toLocaleString()} MT`, sub: "Exported to EU" },
    { label: "Specific Emissions (SEE)", val: `${decl.totalSpecificEmbeddedEmissions} t/t`, sub: "tCO2e / tonne product" },
    { label: "Total Embedded CO2e", val: `${Math.round(decl.quantityTonnes * decl.totalSpecificEmbeddedEmissions).toLocaleString()} t`, sub: "Direct + Indirect + Precursor" },
    { label: "Net CBAM Liability", val: `€${decl.effectiveCbamLiabilityEur.toLocaleString()}`, sub: "At €69/t certificate price" },
  ];

  kpis.forEach((k, idx) => {
    const cardW = (W - 88 - 30) / 4;
    const cardX = 44 + idx * (cardW + 10);
    const cardY = 185;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(225, 235, 230);
    doc.roundedRect(cardX, cardY, cardW, 65, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 110, 100);
    doc.text(k.label.toUpperCase(), cardX + 8, cardY + 18);

    doc.setFontSize(12);
    doc.setTextColor(10, 50, 30);
    doc.text(k.val, cardX + 8, cardY + 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 135, 125);
    doc.text(k.sub, cardX + 8, cardY + 54);
  });

  // Table 1: Commodity & Code Alignment
  let currentY = 275;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 25);
  doc.text("1. Commodity Classification & HSN-CN Code Mapping", 44, currentY);

  currentY += 14;
  doc.setFillColor(235, 243, 238);
  doc.rect(44, currentY, W - 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 35);
  doc.text("Product Description", 54, currentY + 13);
  doc.text("Indian HSN", 260, currentY + 13);
  doc.text("EU CN Code", 340, currentY + 13);
  doc.text("Export Quantity", 440, currentY + 13);

  currentY += 20;
  doc.setFillColor(255, 255, 255);
  doc.rect(44, currentY, W - 88, 22, "F");
  doc.setDrawColor(230, 235, 232);
  doc.line(44, currentY + 22, W - 44, currentY + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 40, 30);
  doc.text(decl.productName, 54, currentY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 75, 68);
  doc.text(decl.hsnCode, 260, currentY + 14);
  doc.text(decl.cnCode, 340, currentY + 14);
  doc.text(`${decl.quantityTonnes.toLocaleString()} MT`, 440, currentY + 14);

  // Table 2: Embedded Emissions Breakdown
  currentY += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 25);
  doc.text("2. Embedded Emissions Breakdown (EU Regulation 2023/956 Methodology)", 44, currentY);

  currentY += 14;
  doc.setFillColor(235, 243, 238);
  doc.rect(44, currentY, W - 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 35);
  doc.text("Emissions Component", 54, currentY + 13);
  doc.text("Total Volume (tCO2e)", 260, currentY + 13);
  doc.text("Specific Intensity (tCO2e/t)", 400, currentY + 13);

  currentY += 20;

  const rows = [
    { label: "Direct Emissions (Scope 1 combustion & process)", val: decl.directEmissionsTCO2e, intensity: (decl.directEmissionsTCO2e / decl.quantityTonnes).toFixed(3) },
    { label: "Indirect Electricity Emissions (Scope 2 CEA Baseline)", val: decl.indirectEmissionsTCO2e, intensity: (decl.indirectEmissionsTCO2e / decl.quantityTonnes).toFixed(3) },
    { label: "Precursor Embedded Emissions (Raw materials)", val: decl.precursorEmissionsTCO2e, intensity: (decl.precursorEmissionsTCO2e / decl.quantityTonnes).toFixed(3) },
    { label: "TOTAL SPECIFIC EMBEDDED EMISSIONS (SEE)", val: Math.round(decl.quantityTonnes * decl.totalSpecificEmbeddedEmissions), intensity: decl.totalSpecificEmbeddedEmissions.toFixed(3) },
  ];

  rows.forEach((r, idx) => {
    const isTotal = idx === rows.length - 1;
    doc.setFillColor(isTotal ? 245 : 255, isTotal ? 248 : 255, isTotal ? 246 : 255);
    doc.rect(44, currentY, W - 88, 20, "F");
    doc.setDrawColor(230, 235, 232);
    doc.line(44, currentY + 20, W - 44, currentY + 20);

    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(isTotal ? 15 : 40, isTotal ? 40 : 55, isTotal ? 25 : 45);
    doc.text(r.label, 54, currentY + 13);
    doc.text(r.val.toLocaleString(), 260, currentY + 13);
    doc.text(r.intensity, 400, currentY + 13);

    currentY += 20;
  });

  // Table 3: Carbon Price Paid & Net Liability
  currentY += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 25);
  doc.text("3. Carbon Price Deduction & Net Certificate Liability", 44, currentY);

  currentY += 14;
  doc.setFillColor(255, 255, 255);
  doc.rect(44, currentY, W - 88, 60, "F");
  doc.setDrawColor(220, 230, 225);
  doc.rect(44, currentY, W - 88, 60, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 55, 45);
  doc.text(`Domestic Carbon Price Paid in India (CCTS): ₹${decl.carbonPricePaidInOriginInr.toLocaleString()}`, 58, currentY + 18);
  doc.text(`Converted Article 9 Deduction: €${decl.carbonPriceDeductionEur.toLocaleString()}`, 58, currentY + 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 40, 25);
  doc.text(`Net CBAM Certificate Payable: €${decl.effectiveCbamLiabilityEur.toLocaleString()} (~₹${Math.round(decl.effectiveCbamLiabilityEur * 90).toLocaleString()})`, 58, currentY + 50);

  // Footer
  doc.setFillColor(245, 248, 246);
  doc.rect(44, H - 65, W - 88, 35, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 120, 110);
  doc.text("Generated by clisomumbai (Climate Social Mumbai) — EU CBAM DG TAXUD Verified Reporting Engine.", 54, H - 48);
  doc.text("Compliant with EU Regulation 2023/956, Implementing Regulation 2023/1773, and ISO 14064.", 54, H - 36);

  doc.save(`clisomumbai-cbam-declaration-${decl.id}.pdf`);
}
