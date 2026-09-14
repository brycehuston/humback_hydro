export interface ProjectEconomicsAssumptions {
  electricityPricePerMwh: number;
  capacityFactor: number;
  annualHours: number;
  royaltyPerMwh: number;
  operationsAndMaintenancePerMwh: number;
  debtServicePerMwh: number;
  capitalCostPerMw: number;
  co2TonsPerMwh: number;
}

export interface ProjectScenarioResult {
  installedCapacityMw: number;
  operatingHorizonYears: number;
  illustrativeCapitalRequirement: number;
  modeledAnnualGenerationMwh: number;
  grossElectricityRevenue: number;
  royaltyDeduction: number;
  operationsAndMaintenanceDeduction: number;
  debtServiceDeduction: number;
  totalDeductions: number;
  annualPostDebtRetainedCashFlow: number;
  simplePaybackYears: number;
  preDebtRetainedCashFlow: number;
  annualCo2DisplacementTons: number;
  cumulativeRetainedCashFlow: number;
  cumulativeEnergyThroughputMwh: number;
  cumulativeCo2DisplacementTons: number;
}

export const CAPACITY_PRESETS_MW = [10, 100, 500, 1_000] as const;
export const MIN_CAPACITY_MW = 10;
export const MAX_CAPACITY_MW = 1_000;
export const CAPACITY_STEP_MW = 10;
export const MIN_OPERATING_HORIZON_YEARS = 1;
export const MAX_OPERATING_HORIZON_YEARS = 20;

export const ILLUSTRATIVE_PROJECT_ASSUMPTIONS = {
  electricityPricePerMwh: 120,
  capacityFactor: 0.9,
  annualHours: 8_760,
  royaltyPerMwh: 8.8,
  operationsAndMaintenancePerMwh: 15,
  debtServicePerMwh: 30,
  capitalCostPerMw: 5_000_000,
  co2TonsPerMwh: 0.35,
} satisfies ProjectEconomicsAssumptions;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeCapacityMw(value: number): number {
  if (!Number.isFinite(value)) return MIN_CAPACITY_MW;
  const stepped = Math.round(value / CAPACITY_STEP_MW) * CAPACITY_STEP_MW;
  return clamp(stepped, MIN_CAPACITY_MW, MAX_CAPACITY_MW);
}

export function normalizeOperatingHorizon(value: number): number {
  if (!Number.isFinite(value)) return MIN_OPERATING_HORIZON_YEARS;
  return clamp(
    Math.round(value),
    MIN_OPERATING_HORIZON_YEARS,
    MAX_OPERATING_HORIZON_YEARS,
  );
}

export function calculateProjectScenario(
  capacityMw: number,
  operatingHorizonYears: number,
  assumptions: ProjectEconomicsAssumptions =
    ILLUSTRATIVE_PROJECT_ASSUMPTIONS,
): ProjectScenarioResult {
  const installedCapacityMw = normalizeCapacityMw(capacityMw);
  const horizon = normalizeOperatingHorizon(operatingHorizonYears);
  const modeledAnnualGenerationMwh =
    installedCapacityMw * assumptions.annualHours * assumptions.capacityFactor;
  const illustrativeCapitalRequirement = roundCurrency(
    installedCapacityMw * assumptions.capitalCostPerMw,
  );
  const grossElectricityRevenue = roundCurrency(
    modeledAnnualGenerationMwh * assumptions.electricityPricePerMwh,
  );
  const royaltyDeduction = roundCurrency(
    modeledAnnualGenerationMwh * assumptions.royaltyPerMwh,
  );
  const operationsAndMaintenanceDeduction = roundCurrency(
    modeledAnnualGenerationMwh *
      assumptions.operationsAndMaintenancePerMwh,
  );
  const debtServiceDeduction = roundCurrency(
    modeledAnnualGenerationMwh * assumptions.debtServicePerMwh,
  );
  const totalDeductions = roundCurrency(
    royaltyDeduction +
      operationsAndMaintenanceDeduction +
      debtServiceDeduction,
  );
  const annualPostDebtRetainedCashFlow = roundCurrency(
    grossElectricityRevenue - totalDeductions,
  );
  const simplePaybackYears =
    annualPostDebtRetainedCashFlow > 0
      ? illustrativeCapitalRequirement / annualPostDebtRetainedCashFlow
      : Number.POSITIVE_INFINITY;
  const preDebtRetainedCashFlow = roundCurrency(
    grossElectricityRevenue -
      royaltyDeduction -
      operationsAndMaintenanceDeduction,
  );
  const annualCo2DisplacementTons =
    modeledAnnualGenerationMwh * assumptions.co2TonsPerMwh;

  return {
    installedCapacityMw,
    operatingHorizonYears: horizon,
    illustrativeCapitalRequirement,
    modeledAnnualGenerationMwh,
    grossElectricityRevenue,
    royaltyDeduction,
    operationsAndMaintenanceDeduction,
    debtServiceDeduction,
    totalDeductions,
    annualPostDebtRetainedCashFlow,
    simplePaybackYears,
    preDebtRetainedCashFlow,
    annualCo2DisplacementTons,
    cumulativeRetainedCashFlow: roundCurrency(
      annualPostDebtRetainedCashFlow * horizon,
    ),
    cumulativeEnergyThroughputMwh:
      modeledAnnualGenerationMwh * horizon,
    cumulativeCo2DisplacementTons: annualCo2DisplacementTons * horizon,
  };
}
