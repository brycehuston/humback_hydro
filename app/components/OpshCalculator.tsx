"use client";

import { memo, useId, useMemo, useState } from "react";

export interface OpshCalculatorAssumptions {
  conservativeAnnualRate: number;
  optimisticAnnualRate: number;
  capitalCostPerMw: number;
  annualMwhPerMw: number;
  co2TonsPerMwh: number;
  optimisticIncludesDesalinationRevenue: boolean;
}

export interface OpshCalculatorProps {
  className?: string;
  assumptions?: Partial<OpshCalculatorAssumptions>;
}

export const DEFAULT_OPSH_CALCULATOR_ASSUMPTIONS:
  OpshCalculatorAssumptions = {
    conservativeAnnualRate: 0.08,
    optimisticAnnualRate: 0.125,
    capitalCostPerMw: 5_000_000,
    annualMwhPerMw: 7_884,
    co2TonsPerMwh: 0.35,
    optimisticIncludesDesalinationRevenue: true,
  };

const QUICK_INVESTMENTS = [
  { label: "$10K", value: 10_000 },
  { label: "$50K", value: 50_000 },
  { label: "$250K", value: 250_000 },
] as const;

const MAX_INVESTMENT = 100_000_000;

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
  maximumFractionDigits: 1,
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

function formatInvestmentInput(value: number): string {
  return Math.max(0, Math.round(value)).toLocaleString("en-US");
}

function parseInvestmentInput(value: string): number {
  const numericValue = Number(value.replace(/[^\d]/g, ""));
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(Math.max(numericValue, 0), MAX_INVESTMENT);
}

interface ScenarioCardProps {
  accent: "cyan" | "violet";
  description: string;
  futureValue: number;
  gain: number;
  label: string;
  rate: number;
}

function ScenarioCard({
  accent,
  description,
  futureValue,
  gain,
  label,
  rate,
}: ScenarioCardProps) {
  const styles =
    accent === "cyan"
      ? {
          border: "border-cyan-300/20",
          glow: "bg-cyan-300/10",
          text: "text-cyan-200",
          badge: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
        }
      : {
          border: "border-violet-300/20",
          glow: "bg-violet-400/10",
          text: "text-violet-200",
          badge:
            "border-violet-300/20 bg-violet-400/10 text-violet-100",
        };

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-2xl border ${styles.border} bg-slate-950/55 p-5`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 size-32 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-[0.68rem] font-bold uppercase tracking-[0.22em] ${styles.text}`}
            >
              {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles.badge}`}
          >
            Provisional · {(rate * 100).toFixed(1)}% / yr
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Projected Value
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {formatCompactCurrency(futureValue)}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-sm text-slate-400">Estimated Gain</span>
          <span className={`text-sm font-semibold ${styles.text}`}>
            +{formatCurrency(gain)}
          </span>
        </div>
      </div>
    </article>
  );
}

function OpshCalculator({
  className = "",
  assumptions,
}: OpshCalculatorProps) {
  const investmentInputId = useId();
  const horizonInputId = useId();
  const [investmentInput, setInvestmentInput] = useState("50,000");
  const [timeHorizon, setTimeHorizon] = useState(5);

  const model = useMemo(
    () => ({
      ...DEFAULT_OPSH_CALCULATOR_ASSUMPTIONS,
      ...assumptions,
    }),
    [assumptions],
  );

  const investmentAmount = useMemo(
    () => parseInvestmentInput(investmentInput),
    [investmentInput],
  );

  const projection = useMemo(() => {
    const conservativeFutureValue =
      investmentAmount *
      Math.pow(1 + model.conservativeAnnualRate, timeHorizon);
    const optimisticFutureValue =
      investmentAmount *
      Math.pow(1 + model.optimisticAnnualRate, timeHorizon);
    const enabledCapacityMw =
      model.capitalCostPerMw > 0
        ? investmentAmount / model.capitalCostPerMw
        : 0;
    const annualCleanEnergyMwh =
      enabledCapacityMw * model.annualMwhPerMw;
    const lifetimeCleanEnergyMwh =
      annualCleanEnergyMwh * timeHorizon;
    const estimatedCo2Offset =
      lifetimeCleanEnergyMwh * model.co2TonsPerMwh;

    return {
      conservativeFutureValue,
      conservativeGain:
        conservativeFutureValue - investmentAmount,
      optimisticFutureValue,
      optimisticGain: optimisticFutureValue - investmentAmount,
      enabledCapacityMw,
      annualCleanEnergyMwh,
      lifetimeCleanEnergyMwh,
      estimatedCo2Offset,
    };
  }, [investmentAmount, model, timeHorizon]);

  const sliderProgress = ((timeHorizon - 3) / 7) * 100;

  function updateInvestment(value: string) {
    const digits = value.replace(/[^\d]/g, "").slice(0, 9);
    if (!digits) {
      setInvestmentInput("");
      return;
    }
    setInvestmentInput(
      formatInvestmentInput(
        Math.min(Number(digits), MAX_INVESTMENT),
      ),
    );
  }

  return (
    <section
      aria-labelledby="opsh-calculator-title"
      className={`pointer-events-auto isolate w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-cyan-100/15 bg-[#03141f]/96 text-white shadow-[0_32px_100px_rgba(0,8,18,0.65)] [contain:layout_style_paint] ${className}`}
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,207,231,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(126,92,246,0.12),transparent_40%)]"
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
                  Interactive Scenario Model
                </span>
              </div>

              <h2
                className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl"
                id="opsh-calculator-title"
              >
                Investment &amp; Impact Calculator
              </h2>
              <p
                className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base"
                id="opsh-calculator-description"
              >
                Explore illustrative financial scenarios and potential
                double-bottom-line impact associated with long-duration
                energy infrastructure.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300">
              <span className="text-cyan-300">$</span>
              USD Model
            </div>
          </div>
        </header>

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div>
              <label
                className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
                htmlFor={investmentInputId}
              >
                Investment Amount
              </label>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg font-semibold text-cyan-200">
                  $
                </span>
                <input
                  className="h-14 w-full rounded-xl border border-white/10 bg-slate-950/65 pl-9 pr-16 text-xl font-semibold tracking-[-0.02em] text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15"
                  id={investmentInputId}
                  inputMode="numeric"
                  maxLength={11}
                  onChange={(event) =>
                    updateInvestment(event.target.value)
                  }
                  placeholder="50,000"
                  type="text"
                  value={investmentInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  USD
                </span>
              </div>

              <div
                aria-label="Quick investment amounts"
                className="mt-3 grid grid-cols-3 gap-2"
              >
                {QUICK_INVESTMENTS.map((tier) => (
                  <button
                    aria-pressed={investmentAmount === tier.value}
                    className="min-h-12 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 aria-pressed:border-cyan-300/50 aria-pressed:bg-cyan-300/[0.12] aria-pressed:text-cyan-50"
                    key={tier.value}
                    onClick={() =>
                      setInvestmentInput(
                        formatInvestmentInput(tier.value),
                      )
                    }
                    type="button"
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
                  htmlFor={horizonInputId}
                >
                  Time Horizon
                </label>
                <output
                  className="font-semibold text-cyan-100"
                  htmlFor={horizonInputId}
                >
                  {timeHorizon} Years
                </output>
              </div>
              <input
                aria-label="Time Horizon"
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-cyan-300"
                id={horizonInputId}
                max={10}
                min={3}
                onChange={(event) =>
                  setTimeHorizon(Number(event.target.value))
                }
                style={{
                  background: `linear-gradient(90deg, #67d8eb ${sliderProgress}%, rgba(148,163,184,.18) ${sliderProgress}%)`,
                }}
                type="range"
                value={timeHorizon}
              />
              <div className="mt-2 flex justify-between text-[0.65rem] text-slate-500">
                <span>3 Years</span>
                <span>10 Years</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                Modeled Infrastructure Share
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-sm text-slate-400">
                  Equivalent capacity enabled
                </span>
                <strong className="text-right text-xl text-white">
                  {projection.enabledCapacityMw.toFixed(3)} MW
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ScenarioCard
                accent="cyan"
                description="Illustrative baseline scenario based on grid-energy arbitrage revenue."
                futureValue={projection.conservativeFutureValue}
                gain={projection.conservativeGain}
                label="Conservative"
                rate={model.conservativeAnnualRate}
              />
              <ScenarioCard
                accent="violet"
                description={
                  model.optimisticIncludesDesalinationRevenue
                    ? "Illustrative upside scenario incorporating provisional desalination co-revenue."
                    : "Illustrative upside scenario without desalination co-revenue."
                }
                futureValue={projection.optimisticFutureValue}
                gain={projection.optimisticGain}
                label="Optimistic"
                rate={model.optimisticAnnualRate}
              />
            </div>

            <section className="rounded-2xl border border-emerald-300/15 bg-slate-950/45 p-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-emerald-200">
                Double Bottom Line
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Modeled Environmental Impact
              </h3>

              <div className="mt-5 grid overflow-hidden rounded-xl border border-white/10 sm:grid-cols-2">
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Clean Energy Storage
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-cyan-100">
                    {formatNumber(projection.lifetimeCleanEnergyMwh)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    MWh over {timeHorizon} years
                  </p>
                </div>
                <div className="border-t border-white/10 p-4 sm:border-l sm:border-t-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Estimated CO₂ Offset
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-200">
                    {formatNumber(projection.estimatedCo2Offset)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Metric tons over {timeHorizon} years
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Modeled annual clean-energy throughput:{" "}
                <strong className="text-slate-200">
                  {formatNumber(projection.annualCleanEnergyMwh)} MWh
                </strong>
              </p>
            </section>

            <div className="flex flex-wrap gap-2 text-[0.64rem] text-slate-500">
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Capital basis: {formatCompactCurrency(model.capitalCostPerMw)}/MW
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Energy basis: {formatNumber(model.annualMwhPerMw)} MWh/MW-year
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Carbon factor: {model.co2TonsPerMwh.toFixed(2)} tCO₂/MWh
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Calculation: investment ÷ provisional capital basis = modeled
              capacity; capacity × annual energy basis × years = enabled MWh;
              enabled MWh × provisional carbon factor = estimated CO₂
              displacement.
            </p>

            <p className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-xs leading-5 text-amber-50/70">
              Illustrative scenario model only. This calculator is not an
              offer, investment forecast, valuation, or guarantee. Return
              assumptions, capital allocation, desalination revenue, energy
              throughput, and carbon coefficients must be replaced with
              verified project-specific inputs before public or
              investor-facing use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(OpshCalculator);
