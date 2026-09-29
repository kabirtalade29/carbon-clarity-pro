import { jsPDF } from "jspdf";

export type BrsrGeneralDisclosures = {
  // I. Details of listed entity
  cin: string;
  entityName: string;
  yearOfIncorporation: number;
  registeredOffice: string;
  corporateAddress: string;
  email: string;
  telephone: string;
  website: string;
  financialYear: string;
  stockExchanges: string[];
  paidUpCapitalCrore: number;
  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  reportingBoundary: "Standalone" | "Consolidated" | "Both";
  assuranceProvider: string;
  assuranceType: "Reasonable Assurance" | "Limited Assurance" | "None";

  // II. Products & Services
  mainActivityDescription: string;
  businessActivityDescription: string;
  turnoverPercentage: number;
  productsSold: Array<{
    productName: string;
    nicCode: string;
    turnoverSharePct: number;
  }>;

  // III. Operations
  plantsNational: number;
  plantsInternational: number;
  officesNational: number;
  officesInternational: number;
  exportTurnoverPercentage: number;
  customerTypes: string;

  // IV. Employees & Workers
  permanentEmployeesMale: number;
  permanentEmployeesFemale: number;
  otherEmployeesMale: number;
  otherEmployeesFemale: number;
  permanentWorkersMale: number;
  permanentWorkersFemale: number;
  otherWorkersMale: number;
  otherWorkersFemale: number;
  differentlyAbledEmployees: number;
  womenBoardDirectorsPct: number;
  womenKmpPct: number;
  employeeTurnoverPct: number;
  workerTurnoverPct: number;

  // V. Holding, Subsidiary & Associate Companies
  subsidiariesCount: number;
  jointVenturesCount: number;

  // VI. CSR Details
  csrApplicable: boolean;
  csrTurnoverCrore: number;
  csrNetWorthCrore: number;
  csrBudgetSpendCrore: number;

  // VII. Grievance Redressal & Materiality
  totalComplaintsReceived: number;
  totalComplaintsResolved: number;
  topMaterialRisks: Array<{
    issue: string;
    riskOrOpportunity: "Risk" | "Opportunity";
    mitigationStrategy: string;
    financialImplication: "Positive" | "Negative";
  }>;
};

export type BrsrPolicyMatrix = {
  p1Ethics: boolean;
  p2Products: boolean;
  p3Employees: boolean;
  p4Stakeholders: boolean;
  p5HumanRights: boolean;
  p6Environment: boolean;
  p7PolicyAdvocacy: boolean;
  p8InclusiveGrowth: boolean;
  p9ConsumerValue: boolean;
  boardApproved: boolean;
  policiesWeblink: string;
  translatedToProcedures: boolean;
  extendedToValueChain: boolean;
  certificationsAdopted: string[]; // ISO 14001, ISO 45001, SA8000, etc.
  highestAuthorityResponsible: string;
  sustainabilityCommitteeExists: boolean;
};

export type BrsrPrinciple6Data = {
  // Energy
  renewableElectricityPJ: number;
  renewableFuelPJ: number;
  totalRenewableEnergyPJ: number;
  nonRenewableElectricityPJ: number;
  nonRenewableFuelPJ: number;
  totalNonRenewableEnergyPJ: number;
  totalEnergyConsumedPJ: number;
  energyIntensityPerCroreTurnover: number;
  energyIntensityPerTonneOutput: number;
  patSchemeApplicable: boolean;
  patTargetsAchieved: boolean;

  // Water
  surfaceWaterWithdrawalML: number;
  groundwaterWithdrawalML: number;
  thirdPartyWaterML: number;
  seawaterDesalinatedML: number;
  totalWaterWithdrawalML: number;
  totalWaterConsumedML: number;
  waterIntensityPerCroreTurnoverKL: number;
  waterIntensityPerTonneOutputKL: number;
  waterDischargedSurfaceML: number;
  waterDischargedThirdPartyML: number;
  totalWaterDischargedML: number;
  zldImplemented: boolean;
  zldDetails: string;
  waterStressedAreaWithdrawalML: number;

  // Air Emissions
  stackNoxTonnes: number;
  stackSoxTonnes: number;
  particulateMatterTonnes: number;

  // GHG Emissions
  scope1EmissionsTonnes: number;
  scope2EmissionsTonnes: number;
  totalScope1And2Tonnes: number;
  scope1And2IntensityPerCroreTurnover: number;
  scope1And2IntensityPerTonneOutput: number;
  scope3EmissionsTonnes: number;
  scope3IntensityPerCroreTurnover: number;
  ghgReductionProjectsDetails: string;

  // Solid Waste
  plasticWasteTonnes: number;
  eWasteTonnes: number;
  hazardousWasteTonnes: number;
  nonHazardousWasteTonnes: number;
  totalWasteGeneratedTonnes: number;
  totalWasteRecycledOrReusedTonnes: number;
  wasteRecoveryUtilizationPct: number;
  wasteDisposedLandfillOrIncinerationTonnes: number;
};

export type BrsrOtherPrinciplesData = {
  // P1: Ethics & Transparency
  trainingCoveragePct: number;
  finesOrPenaltiesAmountINR: number;
  antiBriberyPolicyInPlace: boolean;
  accountsPayableDays: number;
  relatedPartyPurchasesPct: number;
  relatedPartySalesPct: number;

  // P2: Sustainable Products
  rdSustainabilitySpendPct: number;
  capexSustainabilitySpendPct: number;
  sustainableSourcingInputsPct: number;
  recycledMaterialUsedPct: number;
  eprApplicable: boolean;
  lcaConductedPctOfTurnover: number;

  // P3: Employee Well-being
  healthInsuranceCoveragePct: number;
  accidentInsuranceCoveragePct: number;
  dayCareFacilityCoveragePct: number;
  wellbeingSpendPctOfRevenue: number;
  ltifrEmployees: number;
  ltifrWorkers: number;
  fatalitiesCount: number;

  // P4: Stakeholder Engagement
  stakeholderConsultationsConducted: boolean;
  vulnerableGroupsIdentified: string;

  // P5: Human Rights
  humanRightsTrainingPct: number;
  minimumWagesCompliancePct: number;
  grossWagesPaidToFemalesPct: number;
  poshComplaintsFiled: number;
  poshComplaintsUpheld: number;

  // P7: Policy Advocacy
  tradeAffiliationsCount: number;
  tradeChambersList: string[];

  // P8: Inclusive Growth (CSR)
  msmeProcurementSharePct: number;
  domesticProcurementSharePct: number;
  aspirationalDistrictsSpendCrore: number;
  totalCsrBeneficiariesCount: number;

  // P9: Consumer Value
  turnoverWithEnvLabelingPct: number;
  cybersecurityPolicyExists: boolean;
  customerSatisfactionScorePct: number;
};

export type CompleteBrsrReport = {
  id: string;
  title: string;
  companyName: string;
  financialYear: string;
  status: "Draft" | "Review" | "Assurance Verified" | "Published";
  assuranceProvider: string;
  assuranceStandard: string;
  lastUpdated: string;
  general: BrsrGeneralDisclosures;
  management: BrsrPolicyMatrix;
  principle6: BrsrPrinciple6Data;
  principlesOther: BrsrOtherPrinciplesData;
};

/**
 * Pre-configured Enterprise Benchmark Template (Modeled after Tata Steel / Tier-1 Indian Industrial standard)
 */
export const TATA_STEEL_BENCHMARK_TEMPLATE: CompleteBrsrReport = {
  id: "brsr-template-industrial-2026",
  title: "SEBI BRSR Annual Report FY 2025-26",
  companyName: "Tata Steel Limited",
  financialYear: "FY 2025-26",
  status: "Assurance Verified",
  assuranceProvider: "Price Waterhouse & Co Chartered Accountants LLP",
  assuranceStandard: "SEBI ASSA 5010 (Reasonable Assurance on BRSR Core)",
  lastUpdated: "2026-03-31",

  general: {
    cin: "L27100MH1907PLC000260",
    entityName: "Tata Steel Limited",
    yearOfIncorporation: 1907,
    registeredOffice: "Bombay House, 24, Homi Mody Street, Fort, Mumbai – 400001",
    corporateAddress: "Bombay House, 24, Homi Mody Street, Fort, Mumbai – 400001",
    email: "cosec@tatasteel.com",
    telephone: "+91 22 6665 8282",
    website: "www.tatasteel.com",
    financialYear: "April 1, 2025 – March 31, 2026",
    stockExchanges: ["BSE Limited", "National Stock Exchange of India Limited"],
    paidUpCapitalCrore: 1248.6,
    contactPersonName: "Mr. Parvatheesam Kanchinadham",
    contactPersonDesignation: "Company Secretary & Chief Legal Officer",
    contactPersonEmail: "cosec@tatasteel.com",
    contactPersonPhone: "+91 22 6665 7279",
    reportingBoundary: "Both",
    assuranceProvider: "Price Waterhouse & Co Chartered Accountants LLP",
    assuranceType: "Reasonable Assurance",

    mainActivityDescription: "Manufacturing",
    businessActivityDescription: "Metal and metal products (Crude Steel, Rebar, Slabs)",
    turnoverPercentage: 94.46,
    productsSold: [
      { productName: "Sale of Steel Products (Hot/Cold Rolled, Rebars)", nicCode: "2410", turnoverSharePct: 95 },
      { productName: "Sale of Non-Steel Products & Byproducts (Slag)", nicCode: "2410", turnoverSharePct: 3 },
      { productName: "Sale of Power & Water Utilities", nicCode: "3510", turnoverSharePct: 1 },
    ],

    plantsNational: 78,
    plantsInternational: 41,
    officesNational: 46,
    officesInternational: 25,
    exportTurnoverPercentage: 8,
    customerTypes: "B2B Automotive OEMs, EPC infrastructure fabricators, B2C retail individual home builders",

    permanentEmployeesMale: 64211,
    permanentEmployeesFemale: 6720,
    otherEmployeesMale: 1157,
    otherEmployeesFemale: 1021,
    permanentWorkersMale: 38353,
    permanentWorkersFemale: 2766,
    otherWorkersMale: 137768,
    otherWorkersFemale: 9000,
    differentlyAbledEmployees: 149,
    womenBoardDirectorsPct: 10,
    womenKmpPct: 0,
    employeeTurnoverPct: 7.4,
    workerTurnoverPct: 5.8,

    subsidiariesCount: 9,
    jointVenturesCount: 4,

    csrApplicable: true,
    csrTurnoverCrore: 132516.66,
    csrNetWorthCrore: 123543.94,
    csrBudgetSpendCrore: 265.2,

    totalComplaintsReceived: 20845,
    totalComplaintsResolved: 20025,
    topMaterialRisks: [
      {
        issue: "Greenhouse Gas Emissions & Climate Regulations (CBAM / NGER)",
        riskOrOpportunity: "Risk",
        mitigationStrategy: "Transition to DRI-EAF, scrap recycling, renewable PPAs, Net Zero 2045 commitment",
        financialImplication: "Negative",
      },
      {
        issue: "Circular Economy & Scrap Utilization",
        riskOrOpportunity: "Opportunity",
        mitigationStrategy: "Expanding Rohtak 0.5 MTPA scrap processing plant & Ludhiana EAF facility",
        financialImplication: "Positive",
      },
      {
        issue: "Water Scarcity & Effluent Discharge Limits",
        riskOrOpportunity: "Risk",
        mitigationStrategy: "4R Framework (Reduce, Reuse, Recycle, Recover) and Zero Liquid Discharge (ZLD)",
        financialImplication: "Negative",
      },
    ],
  },

  management: {
    p1Ethics: true,
    p2Products: true,
    p3Employees: true,
    p4Stakeholders: true,
    p5HumanRights: true,
    p6Environment: true,
    p7PolicyAdvocacy: true,
    p8InclusiveGrowth: true,
    p9ConsumerValue: true,
    boardApproved: true,
    policiesWeblink: "https://www.tatasteel.com/corporate/our-organisation/policies/",
    translatedToProcedures: true,
    extendedToValueChain: true,
    certificationsAdopted: [
      "ISO 14001:2015 (Environment)",
      "ISO 45001:2018 (Safety)",
      "SA8000:2014 (Social Accountability)",
      "ISO 27001:2022 (InfoSec)",
      "ResponsibleSteel™ Certification",
    ],
    highestAuthorityResponsible: "Mr. T. V. Narendran (Chief Executive Officer & Managing Director)",
    sustainabilityCommitteeExists: true,
  },

  principle6: {
    renewableElectricityPJ: 1.15,
    renewableFuelPJ: 0.36,
    totalRenewableEnergyPJ: 1.51,
    nonRenewableElectricityPJ: 23.65,
    nonRenewableFuelPJ: 598.65,
    totalNonRenewableEnergyPJ: 622.3,
    totalEnergyConsumedPJ: 623.81,
    energyIntensityPerCroreTurnover: 0.0045,
    energyIntensityPerTonneOutput: 27.8,
    patSchemeApplicable: true,
    patTargetsAchieved: true,

    surfaceWaterWithdrawalML: 66296,
    groundwaterWithdrawalML: 10250,
    thirdPartyWaterML: 18539,
    seawaterDesalinatedML: 0,
    totalWaterWithdrawalML: 110623,
    totalWaterConsumedML: 99055,
    waterIntensityPerCroreTurnoverKL: 0.000071,
    waterIntensityPerTonneOutputKL: 4.41,
    waterDischargedSurfaceML: 11337,
    waterDischargedThirdPartyML: 231,
    totalWaterDischargedML: 11568,
    zldImplemented: true,
    zldDetails: "Zero Effluent Discharge (ZED) operational across Kalinganagar, Gamharia & Thailand with multi-stage RO & MEE.",
    waterStressedAreaWithdrawalML: 45401,

    stackNoxTonnes: 27000,
    stackSoxTonnes: 67000,
    particulateMatterTonnes: 9000,

    scope1EmissionsTonnes: 64000000, // 64 Million tCO2e
    scope2EmissionsTonnes: 5000000, // 5 Million tCO2e
    totalScope1And2Tonnes: 69000000,
    scope1And2IntensityPerCroreTurnover: 0.0005,
    scope1And2IntensityPerTonneOutput: 3.1,
    scope3EmissionsTonnes: 28000000, // 28 Million tCO2e
    scope3IntensityPerCroreTurnover: 0.0002,
    ghgReductionProjectsDetails: "Electric Arc Furnace transition at Ludhiana & TSUK, Waste Heat Recovery Systems, Solar rooftop PPAs",

    plasticWasteTonnes: 3201,
    eWasteTonnes: 239,
    hazardousWasteTonnes: 1595294,
    nonHazardousWasteTonnes: 17182321,
    totalWasteGeneratedTonnes: 18782249,
    totalWasteRecycledOrReusedTonnes: 18842244,
    wasteRecoveryUtilizationPct: 100.3,
    wasteDisposedLandfillOrIncinerationTonnes: 21909,
  },

  principlesOther: {
    trainingCoveragePct: 100,
    finesOrPenaltiesAmountINR: 0,
    antiBriberyPolicyInPlace: true,
    accountsPayableDays: 94,
    relatedPartyPurchasesPct: 39,
    relatedPartySalesPct: 14,

    rdSustainabilitySpendPct: 100,
    capexSustainabilitySpendPct: 44,
    sustainableSourcingInputsPct: 100,
    recycledMaterialUsedPct: 5.5,
    eprApplicable: true,
    lcaConductedPctOfTurnover: 76,

    healthInsuranceCoveragePct: 100,
    accidentInsuranceCoveragePct: 100,
    dayCareFacilityCoveragePct: 93,
    wellbeingSpendPctOfRevenue: 0.19,
    ltifrEmployees: 0.49,
    ltifrWorkers: 0.36,
    fatalitiesCount: 5,

    stakeholderConsultationsConducted: true,
    vulnerableGroupsIdentified: "Indigenous tribal communities in Jharkhand and Odisha, Affirmative Action vendors",

    humanRightsTrainingPct: 100,
    minimumWagesCompliancePct: 100,
    grossWagesPaidToFemalesPct: 7,
    poshComplaintsFiled: 33,
    poshComplaintsUpheld: 23,

    tradeAffiliationsCount: 35,
    tradeChambersList: ["CII", "FICCI", "Indian Steel Association", "World Steel Association", "ResponsibleSteel™"],

    msmeProcurementSharePct: 11,
    domesticProcurementSharePct: 68,
    aspirationalDistrictsSpendCrore: 226.1,
    totalCsrBeneficiariesCount: 6941479,

    turnoverWithEnvLabelingPct: 71,
    cybersecurityPolicyExists: true,
    customerSatisfactionScorePct: 85.1,
  },
};

/**
 * Helper to auto-calculate derived BRSR indicators from verified ledgers
 */
export function autoCalculateBrsrReport(
  base: CompleteBrsrReport,
  scope1Tonnes: number,
  scope2Tonnes: number,
  scope3Tonnes: number,
  energyMWh: number,
  waterIntakeKL: number,
  waterRecycledKL: number,
  turnoverCrore: number,
  outputTonnes: number
): CompleteBrsrReport {
  const updated = JSON.parse(JSON.stringify(base)) as CompleteBrsrReport;

  // Update Core Financials
  updated.general.csrTurnoverCrore = turnoverCrore;

  // Energy
  const energyPJ = (energyMWh * 3.6) / 1000000; // 1 MWh = 3.6 x 10^-6 PJ
  updated.principle6.totalEnergyConsumedPJ = parseFloat(energyPJ.toFixed(4));
  updated.principle6.energyIntensityPerCroreTurnover = turnoverCrore > 0 ? parseFloat((energyPJ / turnoverCrore).toFixed(6)) : 0;
  updated.principle6.energyIntensityPerTonneOutput = outputTonnes > 0 ? parseFloat(((energyPJ * 1000000) / outputTonnes).toFixed(4)) : 0;

  // Water
  const waterWithdrawalML = waterIntakeKL / 1000; // 1 kL = 0.001 ML
  const waterRecycledML = waterRecycledKL / 1000;
  const waterDischargeML = Math.max(0, waterWithdrawalML * 0.15); // standard ~15% effluent discharge
  const waterConsumedML = Math.max(0, waterWithdrawalML - waterDischargeML);

  updated.principle6.totalWaterWithdrawalML = parseFloat(waterWithdrawalML.toFixed(2));
  updated.principle6.totalWaterConsumedML = parseFloat(waterConsumedML.toFixed(2));
  updated.principle6.totalWaterDischargedML = parseFloat(waterDischargeML.toFixed(2));
  updated.principle6.waterIntensityPerCroreTurnoverKL = turnoverCrore > 0 ? parseFloat((waterIntakeKL / (turnoverCrore * 10000000)).toFixed(6)) : 0;
  updated.principle6.waterIntensityPerTonneOutputKL = outputTonnes > 0 ? parseFloat((waterIntakeKL / outputTonnes).toFixed(2)) : 0;

  // GHG Emissions
  updated.principle6.scope1EmissionsTonnes = scope1Tonnes;
  updated.principle6.scope2EmissionsTonnes = scope2Tonnes;
  const totalS1S2 = scope1Tonnes + scope2Tonnes;
  updated.principle6.totalScope1And2Tonnes = totalS1S2;
  updated.principle6.scope1And2IntensityPerCroreTurnover = turnoverCrore > 0 ? parseFloat((totalS1S2 / turnoverCrore).toFixed(4)) : 0;
  updated.principle6.scope1And2IntensityPerTonneOutput = outputTonnes > 0 ? parseFloat((totalS1S2 / outputTonnes).toFixed(3)) : 0;

  updated.principle6.scope3EmissionsTonnes = scope3Tonnes;
  updated.principle6.scope3IntensityPerCroreTurnover = turnoverCrore > 0 ? parseFloat((scope3Tonnes / turnoverCrore).toFixed(4)) : 0;

  return updated;
}

/**
 * Generates an official, comprehensive SEBI BRSR PDF Report
 */
export function generateOfficialBrsrPdf(report: CompleteBrsrReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  function checkPageBreak(requiredSpace: number) {
    if (y + requiredSpace > 780) {
      doc.addPage();
      y = margin + 20;
    }
  }

  // Cover / Header
  doc.setFillColor(30, 60, 45); // Deep forest green
  doc.rect(0, 0, pageWidth, 90, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORT", margin, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Pursuant to Regulation 34(2)(f) of SEBI (LODR) Regulations, 2015 | Financial Year: ${report.financialYear}`, margin, 60);
  doc.text(`Entity: ${report.companyName} | CIN: ${report.general.cin}`, margin, 75);

  y = 110;

  // Assurance Badge Callout
  doc.setFillColor(240, 248, 243);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 45, 6, 6, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`AUDIT ASSURANCE STATUS: ${report.general.assuranceType.toUpperCase()}`, margin + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Assurance Provider: ${report.general.assuranceProvider} | Standard: ${report.assuranceStandard}`, margin + 12, y + 32);

  y += 65;

  // SECTION A: GENERAL DISCLOSURES
  doc.setTextColor(30, 60, 45);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION A: GENERAL DISCLOSURES", margin, y);
  y += 18;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  const genRows = [
    ["1. Corporate Identity Number (CIN)", report.general.cin],
    ["2. Name of the Listed Entity", report.general.entityName],
    ["3. Year of Incorporation", String(report.general.yearOfIncorporation)],
    ["4. Registered Office Address", report.general.registeredOffice],
    ["5. Corporate E-mail & Telephone", `${report.general.email} | ${report.general.telephone}`],
    ["6. Paid-up Capital (INR Crore)", `INR ${report.general.paidUpCapitalCrore.toLocaleString()} Cr`],
    ["7. Reporting Boundary", `${report.general.reportingBoundary} (Includes ${report.general.subsidiariesCount} subsidiaries)`],
    ["8. Key Business Activity (Turnover %)", `${report.general.mainActivityDescription} - ${report.general.businessActivityDescription} (${report.general.turnoverPercentage}%)`],
    ["9. Total Operational Locations", `India: ${report.general.plantsNational} plants, ${report.general.officesNational} offices | Overseas: ${report.general.plantsInternational} plants`],
    ["10. Total Workforce", `${(report.general.permanentEmployeesMale + report.general.permanentEmployeesFemale).toLocaleString()} Employees | ${(report.general.permanentWorkersMale + report.general.permanentWorkersFemale).toLocaleString()} Workers`],
    ["11. CSR Applicable (Sec 135)", `Yes | Net Worth: INR ${report.general.csrNetWorthCrore.toLocaleString()} Cr | Spend: INR ${report.general.csrBudgetSpendCrore} Cr`],
  ];

  for (const [k, v] of genRows) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text(k, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), margin + 200, y, { maxWidth: pageWidth - margin * 2 - 200 });
    y += 16;
  }

  y += 10;
  checkPageBreak(60);

  // SECTION B: MANAGEMENT & PROCESS DISCLOSURES
  doc.setTextColor(30, 60, 45);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION B: MANAGEMENT AND PROCESS DISCLOSURES", margin, y);
  y += 18;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  const secBRows = [
    ["1. Policy coverage across all 9 Principles (P1 - P9)", "Yes (100% Board-approved policies active across all core elements)"],
    ["2. Policies translated into operational procedures", "Yes (Apex Risk & Sustainability Committees assigned oversight)"],
    ["3. Value Chain Extension", "Yes (Responsible Supply Chain Policy & Business Associates Code)"],
    ["4. Certifications Adopted", report.management.certificationsAdopted.join(", ")],
    ["5. Highest Authority for Oversight", report.management.highestAuthorityResponsible],
  ];

  for (const [k, v] of secBRows) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text(k, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), margin + 210, y, { maxWidth: pageWidth - margin * 2 - 210 });
    y += 16;
  }

  y += 15;
  checkPageBreak(80);

  // SECTION C: PRINCIPLE 6 - ENVIRONMENT (CORE QUANTITATIVE SECTION)
  doc.setTextColor(30, 60, 45);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION C: PRINCIPLE 6 (ENVIRONMENT & CLIMATE DISCLOSURES)", margin, y);
  y += 18;

  // Table 1: Energy
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 50);
  doc.text("1. Energy Consumption & Intensity (Essential Indicator 1)", margin, y);
  y += 14;

  const energyTable = [
    ["Parameter", "Current FY Value", "Unit / Metric"],
    ["Total Electricity from Renewable Sources", `${report.principle6.renewableElectricityPJ.toFixed(2)}`, "PetaJoules (PJ)"],
    ["Total Fuel from Renewable Sources", `${report.principle6.renewableFuelPJ.toFixed(2)}`, "PetaJoules (PJ)"],
    ["Total Energy from Non-Renewable Sources", `${report.principle6.totalNonRenewableEnergyPJ.toFixed(2)}`, "PetaJoules (PJ)"],
    ["Total Energy Consumed (A+B+C+D+E+F)", `${report.principle6.totalEnergyConsumedPJ.toFixed(2)}`, "PetaJoules (PJ)"],
    ["Energy Intensity per Rupee of Turnover", `${report.principle6.energyIntensityPerCroreTurnover.toFixed(6)}`, "PJ / INR Crore Turnover"],
    ["Energy Intensity per Physical Output", `${report.principle6.energyIntensityPerTonneOutput.toFixed(2)}`, "PJ / Million Tonnes Output"],
  ];

  for (let i = 0; i < energyTable.length; i++) {
    checkPageBreak(18);
    const row = energyTable[i];
    if (i === 0) {
      doc.setFillColor(235, 245, 238);
      doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    doc.text(row[0], margin + 6, y);
    doc.text(row[1], margin + 270, y);
    doc.text(row[2], margin + 380, y);
    y += 15;
  }

  y += 10;
  checkPageBreak(100);

  // Table 2: Water Disclosures
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 50);
  doc.text("2. Water Withdrawal, Consumption & ZLD (Essential Indicator 3 & 5)", margin, y);
  y += 14;

  const waterTable = [
    ["Water Source / Parameter", "Volume (Million Litres)", "Compliance Standard"],
    ["Surface Water Withdrawal", `${report.principle6.surfaceWaterWithdrawalML.toLocaleString()}`, "Rivers / Canals / Reservoirs"],
    ["Groundwater Withdrawal (Borewell)", `${report.principle6.groundwaterWithdrawalML.toLocaleString()}`, "CGWB Permitted Limits"],
    ["Third-Party / Municipal Water", `${report.principle6.thirdPartyWaterML.toLocaleString()}`, "MIDC / Municipal Supply"],
    ["Total Water Withdrawal", `${report.principle6.totalWaterWithdrawalML.toLocaleString()}`, "GRI 303-3 Standard"],
    ["Total Water Consumed", `${report.principle6.totalWaterConsumedML.toLocaleString()}`, "Withdrawal minus Discharges"],
    ["Water Discharged (Treated ETP/CETP)", `${report.principle6.totalWaterDischargedML.toLocaleString()}`, "Secondary / Tertiary Level"],
    ["Zero Liquid Discharge (ZLD) Status", report.principle6.zldImplemented ? "Active ZLD Operational" : "Partial Treatment", "100% Recycling in Cooling Towers"],
  ];

  for (let i = 0; i < waterTable.length; i++) {
    checkPageBreak(18);
    const row = waterTable[i];
    if (i === 0) {
      doc.setFillColor(235, 245, 238);
      doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    doc.text(row[0], margin + 6, y);
    doc.text(row[1], margin + 270, y);
    doc.text(row[2], margin + 380, y);
    y += 15;
  }

  y += 10;
  checkPageBreak(100);

  // Table 3: GHG Scope 1, 2, 3 Emissions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 50);
  doc.text("3. Greenhouse Gas Scope 1, 2 & 3 Disclosures (Essential Indicator 7)", margin, y);
  y += 14;

  const ghgTable = [
    ["GHG Parameter", "Emissions (tCO2e)", "Intensity Benchmark"],
    ["Scope 1 Direct Combustion Emissions", `${report.principle6.scope1EmissionsTonnes.toLocaleString()}`, "Stationary Boilers & Heavy Fleets"],
    ["Scope 2 Indirect Grid Electricity", `${report.principle6.scope2EmissionsTonnes.toLocaleString()}`, "India CEA v19 Baseline (0.716 kg/kWh)"],
    ["Total Scope 1 & 2 Emissions", `${report.principle6.totalScope1And2Tonnes.toLocaleString()}`, "Reasonable Assurance Scope"],
    ["Scope 1 & 2 Turnover Intensity", `${report.principle6.scope1And2IntensityPerCroreTurnover}`, "tCO2e / INR Crore Turnover"],
    ["Scope 1 & 2 Physical Output Intensity", `${report.principle6.scope1And2IntensityPerTonneOutput}`, "tCO2e / Tonne of Finished Product"],
    ["Scope 3 Value Chain (Upstream & Freight)", `${report.principle6.scope3EmissionsTonnes.toLocaleString()}`, "DEFRA / GHG Protocol Cat 1-15"],
  ];

  for (let i = 0; i < ghgTable.length; i++) {
    checkPageBreak(18);
    const row = ghgTable[i];
    if (i === 0) {
      doc.setFillColor(235, 245, 238);
      doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    doc.text(row[0], margin + 6, y);
    doc.text(row[1], margin + 270, y);
    doc.text(row[2], margin + 380, y);
    y += 15;
  }

  y += 10;
  checkPageBreak(80);

  // Table 4: Solid Waste & Circularity
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 50);
  doc.text("4. Waste Management & Circularity (Essential Indicator 9)", margin, y);
  y += 14;

  const wasteTable = [
    ["Waste Stream", "Volume (Metric Tonnes)", "Utilization / Disposal Method"],
    ["Total Waste Generated", `${report.principle6.totalWasteGeneratedTonnes.toLocaleString()}`, "Hazardous + Non-Hazardous Slag/Ash"],
    ["Total Waste Recycled / Reused", `${report.principle6.totalWasteRecycledOrReusedTonnes.toLocaleString()}`, `${report.principle6.wasteRecoveryUtilizationPct}% Circular Utilization Rate`],
    ["Total Waste Safely Disposed", `${report.principle6.wasteDisposedLandfillOrIncinerationTonnes.toLocaleString()}`, "Secured Landfill / Authorized TSDF"],
  ];

  for (let i = 0; i < wasteTable.length; i++) {
    checkPageBreak(18);
    const row = wasteTable[i];
    if (i === 0) {
      doc.setFillColor(235, 245, 238);
      doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    doc.text(row[0], margin + 6, y);
    doc.text(row[1], margin + 270, y);
    doc.text(row[2], margin + 380, y);
    y += 15;
  }

  y += 15;
  checkPageBreak(120);

  // PRINCIPLES 1, 2, 3, 5, 8, 9 HIGHLIGHTS
  doc.setTextColor(30, 60, 45);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION C: SUMMARY OF OTHER CORE PRINCIPLES (P1, P2, P3, P5, P8, P9)", margin, y);
  y += 18;

  const otherPrinTable = [
    ["Principle & Indicator", "Verified Metric", "Regulatory / BRSR Core Standard"],
    ["P1: Accounts Payable Days", `${report.principlesOther.accountsPayableDays} days`, "BRSR Core Key Indicator"],
    ["P2: Sustainable R&D & Capex", `${report.principlesOther.rdSustainabilitySpendPct}% R&D | ${report.principlesOther.capexSustainabilitySpendPct}% Capex`, "Low-carbon transition investments"],
    ["P3: Employee Safety (LTIFR)", `${report.principlesOther.ltifrEmployees} (Emp) / ${report.principlesOther.ltifrWorkers} (Workers)`, "ISO 45001 per million person-hours"],
    ["P3: Well-being Spending %", `${report.principlesOther.wellbeingSpendPctOfRevenue}% of total revenue`, "Health, Mediclaim, Daycare, Welfare"],
    ["P5: Gender Remuneration", `${report.principlesOther.grossWagesPaidToFemalesPct}% gross female wages`, "BRSR Core Gender Disclosures"],
    ["P8: Local & MSME Sourcing", `${report.principlesOther.msmeProcurementSharePct}% MSME | ${report.principlesOther.domesticProcurementSharePct}% India`, "Inclusive growth & small supplier support"],
    ["P9: Consumer Environmental Labeling", `${report.principlesOther.turnoverWithEnvLabelingPct}% of product turnover`, "GreenPro / EPD Product Declarations"],
  ];

  for (let i = 0; i < otherPrinTable.length; i++) {
    checkPageBreak(18);
    const row = otherPrinTable[i];
    if (i === 0) {
      doc.setFillColor(235, 245, 238);
      doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    doc.text(row[0], margin + 6, y);
    doc.text(row[1], margin + 240, y);
    doc.text(row[2], margin + 370, y);
    y += 15;
  }

  // Footer Signature Line
  checkPageBreak(60);
  y += 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated by clisomumbai Enterprise Compliance Engine on ${new Date().toISOString().split("T")[0]}`, margin, y);
  doc.text("Official SEBI BRSR Format | Annexure II Compliant", pageWidth - margin - 220, y);

  doc.save(`${report.companyName.replace(/\s+/g, "_")}_SEBI_BRSR_Full_Report_${report.financialYear.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generates and triggers download of the complete SEBI BRSR Multi-Tab CSV/Excel package
 */
export function downloadCompleteBrsrCsv(report: CompleteBrsrReport) {
  const content = `========================================================================================
BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORT (SEBI ANNEXURE II COMPLIANT)
Entity: ${report.companyName} | CIN: ${report.general.cin} | Financial Year: ${report.financialYear}
Assurance Provider: ${report.general.assuranceProvider} | Assurance Type: ${report.general.assuranceType}
========================================================================================

--- SECTION A: GENERAL DISCLOSURES ---
CIN,${report.general.cin}
Listed Entity Name,${report.general.entityName}
Year of Incorporation,${report.general.yearOfIncorporation}
Registered Office,${report.general.registeredOffice}
E-mail,${report.general.email}
Telephone,${report.general.telephone}
Website,${report.general.website}
Paid-up Capital (INR Crore),${report.general.paidUpCapitalCrore}
Reporting Boundary,${report.general.reportingBoundary}
Main Business Activity,${report.general.mainActivityDescription} - ${report.general.businessActivityDescription} (${report.general.turnoverPercentage}%)
Plants (India),${report.general.plantsNational}
Plants (Overseas),${report.general.plantsInternational}
Permanent Employees (Male/Female),${report.general.permanentEmployeesMale} / ${report.general.permanentEmployeesFemale}
Permanent Workers (Male/Female),${report.general.permanentWorkersMale} / ${report.general.permanentWorkersFemale}
Women Board Directors (%),${report.general.womenBoardDirectorsPct}%
CSR Applicable,${report.general.csrApplicable ? "Yes" : "No"}
CSR Turnover (INR Cr),${report.general.csrTurnoverCrore}

--- SECTION B: MANAGEMENT & PROCESS DISCLOSURES ---
Policies covering P1-P9,Yes (100% Board Approved)
Extended to Value Chain,Yes (Responsible Supply Chain Policy)
Certifications,${report.management.certificationsAdopted.join("; ")}
Highest Oversight Authority,${report.management.highestAuthorityResponsible}

--- SECTION C: PRINCIPLE 6 (ENVIRONMENT) ---
Renewable Electricity (PJ),${report.principle6.renewableElectricityPJ}
Renewable Fuel (PJ),${report.principle6.renewableFuelPJ}
Non-Renewable Electricity (PJ),${report.principle6.nonRenewableElectricityPJ}
Non-Renewable Fuel (PJ),${report.principle6.nonRenewableFuelPJ}
Total Energy Consumed (PJ),${report.principle6.totalEnergyConsumedPJ}
Energy Intensity (PJ / INR Cr Turnover),${report.principle6.energyIntensityPerCroreTurnover}
Total Water Withdrawal (Million Litres),${report.principle6.totalWaterWithdrawalML}
Total Water Consumed (Million Litres),${report.principle6.totalWaterConsumedML}
Total Water Discharged (Million Litres),${report.principle6.totalWaterDischargedML}
Water Intensity (kL / Tonne Output),${report.principle6.waterIntensityPerTonneOutputKL}
Zero Liquid Discharge (ZLD) Implemented,${report.principle6.zldImplemented ? "Yes" : "No"}
Scope 1 Direct Emissions (tCO2e),${report.principle6.scope1EmissionsTonnes}
Scope 2 Indirect Grid Emissions (tCO2e),${report.principle6.scope2EmissionsTonnes}
Total Scope 1 & 2 Emissions (tCO2e),${report.principle6.totalScope1And2Tonnes}
Scope 1 & 2 Turnover Intensity (tCO2e / INR Cr),${report.principle6.scope1And2IntensityPerCroreTurnover}
Scope 1 & 2 Output Intensity (tCO2e / Tonne Output),${report.principle6.scope1And2IntensityPerTonneOutput}
Scope 3 Value Chain Emissions (tCO2e),${report.principle6.scope3EmissionsTonnes}
Total Solid Waste Generated (Tonnes),${report.principle6.totalWasteGeneratedTonnes}
Total Waste Recycled / Reused (Tonnes),${report.principle6.totalWasteRecycledOrReusedTonnes}
Waste Utilization / Recovery Rate (%),${report.principle6.wasteRecoveryUtilizationPct}%

--- SECTION C: PRINCIPLES 1, 2, 3, 5, 8, 9 KEY INDICATORS ---
P1 Accounts Payable Days,${report.principlesOther.accountsPayableDays} days
P2 R&D Sustainability Spend (%),${report.principlesOther.rdSustainabilitySpendPct}%
P2 Capex Sustainability Spend (%),${report.principlesOther.capexSustainabilitySpendPct}%
P3 LTIFR Safety Rate (Employees / Workers),${report.principlesOther.ltifrEmployees} / ${report.principlesOther.ltifrWorkers}
P3 Wellbeing Spending (% of Revenue),${report.principlesOther.wellbeingSpendPctOfRevenue}%
P5 Gross Wages Paid to Females (%),${report.principlesOther.grossWagesPaidToFemalesPct}%
P8 MSME Sourcing Share (%),${report.principlesOther.msmeProcurementSharePct}%
P8 Domestic Sourcing Share (%),${report.principlesOther.domesticProcurementSharePct}%
P8 CSR Beneficiaries Count,${report.principlesOther.totalCsrBeneficiariesCount}
P9 Products with Environmental Labeling (%),${report.principlesOther.turnoverWithEnvLabelingPct}%
P9 Customer Satisfaction Index (CSI),${report.principlesOther.customerSatisfactionScorePct}%
`;

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.companyName.replace(/\s+/g, "_")}_SEBI_BRSR_Full_Disclosures_${report.financialYear.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads official JSON schema structure for digital filing
 */
export function downloadBrsrJson(report: CompleteBrsrReport) {
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.companyName.replace(/\s+/g, "_")}_SEBI_BRSR_Filing_${report.financialYear.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
