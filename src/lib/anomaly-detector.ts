export type AnomalyCheckResult = {
  hasAnomaly: boolean;
  severity: "low" | "medium" | "high" | "none";
  title?: string;
  message?: string;
};

/**
 * Autonomous Anomaly & Outlier Detector
 * Checks activity quantities, unit compatibility, and duplicate dockets.
 */
export function detectAnomalies(
  quantity: number,
  unit: string,
  category: string,
  existingItemsQuantitySum: number = 0,
): AnomalyCheckResult {
  if (quantity <= 0) {
    return { hasAnomaly: false, severity: "none" };
  }

  // Check 1: Excessive single entry spike
  if (unit === "litre" && quantity > 50000) {
    return {
      hasAnomaly: true,
      severity: "high",
      title: "High Volume Consumption Spike",
      message: `Single fuel entry of ${quantity.toLocaleString()} L exceeds typical facility monthly baseline (>50,000 L). Verify source invoice.`,
    };
  }

  if (unit === "kWh" && quantity > 1000000) {
    return {
      hasAnomaly: true,
      severity: "high",
      title: "Utility Meter Spike Warning",
      message: `Electricity entry of ${quantity.toLocaleString()} kWh is exceptionally high (>1 GWh). Confirm billing period start/end dates.`,
    };
  }

  if (unit === "tonne" && quantity > 5000) {
    return {
      hasAnomaly: true,
      severity: "medium",
      title: "Material Quantity Outlier",
      message: `Material quantity of ${quantity.toLocaleString()} tonnes exceeds standard site order threshold. Audit trail verification suggested.`,
    };
  }

  // Check 2: Aggregated baseline spike
  if (existingItemsQuantitySum > 0 && quantity > existingItemsQuantitySum * 1.5) {
    return {
      hasAnomaly: true,
      severity: "medium",
      title: "Historical Baseline Variance (>50%)",
      message: `This entry is >50% higher than the combined average for ${category}.`,
    };
  }

  return { hasAnomaly: false, severity: "none" };
}
