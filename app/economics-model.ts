export interface ProjectEconomicsAssumptions {
  annualHours: number;
  capitalCostPerMw: number;
}

export interface ProjectScenarioResult {
  installedCapacityMw: number;
  annualUtilizationPercent: number | null;
  salePricePerMwh: number | null;
  illustrativeCapitalRequirement: number;
  annualEnergySensitivityMwh: number | null;
  grossElectricitySaleSensitivity: number | null;
}

export const CAPACITY_PRESETS_MW = [10, 100, 500, 1_000] as const;
export const MIN_CAPACITY_MW = 10;
export const MAX_CAPACITY_MW = 1_000;
export const CAPACITY_STEP_MW = 10;

export const ILLUSTRATIVE_PROJECT_ASSUMPTIONS = {
  annualHours: 8_760,
  capitalCostPerMw: 5_000_000,
} satisfies ProjectEconomicsAssumptions;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validAnnualUtilization(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
}

function validSalePrice(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function normalizeCapacityMw(value: number): number {
  if (!Number.isFinite(value)) return MIN_CAPACITY_MW;
  const stepped = Math.round(value / CAPACITY_STEP_MW) * CAPACITY_STEP_MW;
  return clamp(stepped, MIN_CAPACITY_MW, MAX_CAPACITY_MW);
}

export function calculateProjectScenario(
  capacityMw: number,
  annualUtilizationPercent: number | null | undefined,
  salePricePerMwh: number | null | undefined,
  assumptions: ProjectEconomicsAssumptions = ILLUSTRATIVE_PROJECT_ASSUMPTIONS,
): ProjectScenarioResult {
  const installedCapacityMw = normalizeCapacityMw(capacityMw);
  const utilization = validAnnualUtilization(annualUtilizationPercent);
  const salePrice = validSalePrice(salePricePerMwh);
  const annualEnergySensitivityMwh = utilization === null
    ? null
    : installedCapacityMw * assumptions.annualHours * (utilization / 100);

  return {
    installedCapacityMw,
    annualUtilizationPercent: utilization,
    salePricePerMwh: salePrice,
    illustrativeCapitalRequirement: roundCurrency(
      installedCapacityMw * assumptions.capitalCostPerMw,
    ),
    annualEnergySensitivityMwh,
    grossElectricitySaleSensitivity:
      annualEnergySensitivityMwh === null || salePrice === null
        ? null
        : roundCurrency(annualEnergySensitivityMwh * salePrice),
  };
}
