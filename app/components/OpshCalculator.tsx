"use client";

import { memo, useId, useMemo, useState } from "react";
import {
  CAPACITY_PRESETS_MW,
  CAPACITY_STEP_MW,
  calculateProjectScenario,
  ILLUSTRATIVE_PROJECT_ASSUMPTIONS,
  MAX_CAPACITY_MW,
  MAX_OPERATING_HORIZON_YEARS,
  MIN_CAPACITY_MW,
  MIN_OPERATING_HORIZON_YEARS,
  normalizeCapacityMw,
  type ProjectEconomicsAssumptions,
} from "../economics-model";

export type OpshCalculatorAssumptions = ProjectEconomicsAssumptions;

export interface OpshCalculatorProps {
  className?: string;
  assumptions?: Partial<ProjectEconomicsAssumptions>;
}

export const DEFAULT_OPSH_CALCULATOR_ASSUMPTIONS =
  ILLUSTRATIVE_PROJECT_ASSUMPTIONS;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

function OutputMetric({
  label,
  value,
  detail,
  accent = "slate",
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: "cyan" | "emerald" | "violet" | "slate";
}) {
  const accentClass = {
    cyan: "text-cyan-100",
    emerald: "text-emerald-200",
    violet: "text-violet-200",
    slate: "text-white",
  }[accent];

  return (
    <div className="min-w-0 border-b border-white/10 py-4 last:border-b-0">
      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className={`mt-2 break-words text-xl font-semibold tracking-[-0.03em] ${accentClass}`}>
        {value}
      </dd>
      {detail ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      ) : null}
    </div>
  );
}

function OpshCalculator({
  className = "",
  assumptions,
}: OpshCalculatorProps) {
  const capacityInputId = useId();
  const horizonInputId = useId();
  const [capacityInput, setCapacityInput] = useState("100");
  const [operatingHorizon, setOperatingHorizon] = useState(20);

  const model = useMemo<ProjectEconomicsAssumptions>(
    () => ({
      ...ILLUSTRATIVE_PROJECT_ASSUMPTIONS,
      ...assumptions,
    }),
    [assumptions],
  );

  const capacityMw = useMemo(
    () => normalizeCapacityMw(Number(capacityInput)),
    [capacityInput],
  );

  const projection = useMemo(
    () => calculateProjectScenario(capacityMw, operatingHorizon, model),
    [capacityMw, model, operatingHorizon],
  );

  const horizonProgress =
    ((operatingHorizon - MIN_OPERATING_HORIZON_YEARS) /
      (MAX_OPERATING_HORIZON_YEARS - MIN_OPERATING_HORIZON_YEARS)) *
    100;

  function commitCapacity(value: number) {
    setCapacityInput(String(normalizeCapacityMw(value)));
  }

  return (
    <section
      aria-labelledby="opsh-calculator-title"
      className={`pointer-events-auto isolate w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-cyan-100/15 bg-[#03141f]/96 text-white shadow-[0_32px_100px_rgba(0,8,18,0.65)] [contain:layout_style_paint] ${className}`}
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,207,231,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(126,92,246,0.1),transparent_40%)]"
        />

        <header className="relative border-b border-white/10 py-5 pl-5 pr-16 sm:py-6 sm:pl-7 sm:pr-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-300 opacity-40 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-cyan-300" />
                </span>
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-cyan-200">
                  Interactive Infrastructure Scenario
                </span>
              </div>

              <h2
                className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl"
                id="opsh-calculator-title"
              >
                Project Economics &amp; Impact Model
              </h2>
              <p
                className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base"
                id="opsh-calculator-description"
              >
                Explore how one provisional operating case scales with installed
                capacity. Outputs are arithmetic consequences of the visible
                scenario inputs.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300">
              <span className="text-cyan-300">MW</span>
              Project Scale
            </div>
          </div>
        </header>

        <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <div>
              <label
                className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
                htmlFor={capacityInputId}
              >
                Installed Capacity (MW)
              </label>
              <div className="relative mt-3">
                <input
                  className="h-14 w-full rounded-xl border border-white/10 bg-slate-950/65 px-4 pr-16 text-xl font-semibold tracking-[-0.02em] text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15"
                  id={capacityInputId}
                  inputMode="numeric"
                  max={MAX_CAPACITY_MW}
                  min={MIN_CAPACITY_MW}
                  onBlur={() => commitCapacity(Number(capacityInput))}
                  onChange={(event) => setCapacityInput(event.target.value)}
                  step={CAPACITY_STEP_MW}
                  type="number"
                  value={capacityInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  MW
                </span>
              </div>

              <div
                aria-label="Quick installed capacity selections"
                className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2"
              >
                {CAPACITY_PRESETS_MW.map((preset) => (
                  <button
                    aria-pressed={projection.installedCapacityMw === preset}
                    className="min-h-12 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 aria-pressed:border-cyan-300/50 aria-pressed:bg-cyan-300/[0.12] aria-pressed:text-cyan-50"
                    key={preset}
                    onClick={() => commitCapacity(preset)}
                    type="button"
                  >
                    {preset.toLocaleString("en-US")} MW
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Capacity presets: 10 MW, 100 MW, 500 MW and 1,000 MW.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
                  htmlFor={horizonInputId}
                >
                  Operating Horizon
                </label>
                <output
                  className="font-semibold text-cyan-100"
                  htmlFor={horizonInputId}
                >
                  {operatingHorizon} Years
                </output>
              </div>
              <input
                aria-label="Operating Horizon"
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-cyan-300"
                id={horizonInputId}
                max={MAX_OPERATING_HORIZON_YEARS}
                min={MIN_OPERATING_HORIZON_YEARS}
                onChange={(event) => setOperatingHorizon(Number(event.target.value))}
                style={{
                  background: `linear-gradient(90deg, #67d8eb ${horizonProgress}%, rgba(148,163,184,.18) ${horizonProgress}%)`,
                }}
                type="range"
                value={operatingHorizon}
              />
              <div className="mt-2 flex justify-between text-[0.65rem] text-slate-500">
                <span>1 Year</span>
                <span>20 Years</span>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-cyan-200">
                Selected Project Scale
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-sm text-slate-400">Installed capacity</span>
                <strong className="text-right text-2xl text-white">
                  {formatNumber(projection.installedCapacityMw)} MW
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <dl className="grid overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 px-5 sm:grid-cols-2 sm:gap-x-6">
              <OutputMetric
                accent="cyan"
                label="Illustrative Capital Requirement"
                value={formatCurrency(projection.illustrativeCapitalRequirement)}
              />
              <OutputMetric
                label="Annual Modeled Energy Throughput"
                value={`${formatNumber(projection.annualModeledEnergyThroughputMwh)} MWh`}
              />
              <OutputMetric
                label="Gross Electricity Revenue"
                value={formatCurrency(projection.grossElectricityRevenue)}
              />
              <OutputMetric
                label="Total Deductions"
                value={`(${formatCurrency(projection.totalDeductions)})`}
                detail={`Royalty ${formatCompactCurrency(projection.royaltyDeduction)} · O&M ${formatCompactCurrency(projection.operationsAndMaintenanceDeduction)} · Debt service ${formatCompactCurrency(projection.debtServiceDeduction)}`}
              />
              <OutputMetric
                accent="cyan"
                label="Annual Retained Cash Flow"
                value={formatCurrency(projection.annualRetainedCashFlow)}
              />
              <OutputMetric
                accent="violet"
                label="Illustrative Simple Payback"
                value={`${projection.simplePaybackYears.toFixed(1)} Years`}
              />
              <OutputMetric
                accent="cyan"
                label="Post-Debt Retained Cash Flow"
                value={formatCurrency(projection.postDebtRetainedCashFlow)}
                detail="Removes only the modeled debt-service deduction."
              />
              <OutputMetric
                accent="emerald"
                label="Annual Approximate CO₂ Displacement"
                value={`${formatNumber(projection.annualCo2DisplacementTons)} tCO₂`}
                detail="Scenario-dependent; not a verified carbon offset."
              />
            </dl>

            <section className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.045] p-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-violet-200">
                {projection.operatingHorizonYears}-Year Cumulative View
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <small className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                    Cumulative Retained Cash Flow With the Debt-Service Input Applied
                  </small>
                  <strong className="mt-2 block text-lg text-white">
                    {formatCompactCurrency(projection.cumulativeRetainedCashFlow)}
                  </strong>
                </div>
                <div>
                  <small className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                    Energy Throughput
                  </small>
                  <strong className="mt-2 block text-lg text-cyan-100">
                    {formatNumber(projection.cumulativeEnergyThroughputMwh)} MWh
                  </strong>
                </div>
                <div>
                  <small className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                    CO₂ Displacement
                  </small>
                  <strong className="mt-2 block text-lg text-emerald-200">
                    {formatNumber(projection.cumulativeCo2DisplacementTons)} tCO₂
                  </strong>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Cumulative retained cash flow uses simple multiplication with the
                debt-service input applied throughout the selected horizon. It
                does not compound or switch to the post-debt case.
              </p>
            </section>
          </div>
        </div>

        <section className="relative border-t border-white/10 px-5 py-6 sm:px-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-200">
            Provisional Scenario Inputs
          </p>
          <dl className="mt-4 grid gap-x-5 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-slate-500">Electricity Price</dt><dd className="mt-1 font-semibold text-slate-200">US$120/MWh</dd></div>
            <div><dt className="text-slate-500">Capacity Factor</dt><dd className="mt-1 font-semibold text-slate-200">90%</dd></div>
            <div><dt className="text-slate-500">Annual Hours</dt><dd className="mt-1 font-semibold text-slate-200">8,760</dd></div>
            <div><dt className="text-slate-500">Royalty Input</dt><dd className="mt-1 font-semibold text-slate-200">US$8.80/MWh</dd></div>
            <div><dt className="text-slate-500">O&amp;M Input</dt><dd className="mt-1 font-semibold text-slate-200">US$15/MWh</dd></div>
            <div><dt className="text-slate-500">Debt-Service Input</dt><dd className="mt-1 font-semibold text-slate-200">US$30/MWh</dd></div>
            <div><dt className="text-slate-500">Capital-Cost Input</dt><dd className="mt-1 font-semibold text-slate-200">US$5M/MW</dd></div>
            <div><dt className="text-slate-500">Carbon Factor</dt><dd className="mt-1 font-semibold text-slate-200">0.35 tCO₂/MWh</dd></div>
          </dl>
          <p className="mt-5 text-xs leading-5 text-slate-400">
            These values are visible, replaceable scenario inputs—not offered
            commercial terms or verified forecasts. Calculations are simplified,
            pre-tax and exclude project-specific financing, construction,
            interconnection, insurance and site costs.
          </p>
          <p className="mt-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-xs leading-5 text-amber-50/70">
            Potential water, desalination and industrial co-location value is
            excluded from this model. Any such value requires separate technical,
            environmental and commercial validation using project-specific inputs.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Illustrative scenario model only. Outputs are not measured operating
            performance, an approved forecast, financial advice, an offering or a
            guarantee of future results. Independent technical, legal and financial
            diligence is required.
          </p>
        </section>
      </div>
    </section>
  );
}

export default memo(OpshCalculator);
