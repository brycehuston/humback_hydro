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
  animationKey,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: "cyan" | "emerald" | "violet" | "slate";
  animationKey?: number;
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
      <dd key={animationKey} className={`mt-2 break-words text-xl font-semibold tracking-[-0.03em] ${accentClass} animate-flash rounded-sm`}>
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
  const [capacityInput, setCapacityInput] = useState("420");
  const [operatingHorizon, setOperatingHorizon] = useState(11);

  const [highlightCap, setHighlightCap] = useState(0);
  const [highlightHor, setHighlightHor] = useState(0);

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

  function handleCapacityInputChange(value: string) {
    setCapacityInput(value);
    setHighlightCap(prev => prev + 1);
  }

  function commitCapacity(value: number) {
    setCapacityInput(String(normalizeCapacityMw(value)));
    setHighlightCap(prev => prev + 1);
  }

  function handleHorizonChange(value: number) {
    setOperatingHorizon(value);
    setHighlightHor(prev => prev + 1);
  }

  return (
    <section
      aria-labelledby="opsh-calculator-title"
      className={`pointer-events-auto isolate w-full h-full flex flex-col overflow-hidden rounded-[1.75rem] border border-[#1d2833] bg-[#020b10] text-white shadow-[0_32px_100px_rgba(0,8,18,0.65)] [contain:layout_style_paint] ${className}`}
    >
      <div className="relative flex flex-col flex-1 min-h-0 h-full">
        <header className="relative flex shrink-0 flex-col justify-between border-b border-[#1d2833] bg-[#031016] p-[clamp(1rem,2vh,1.5rem)] px-[clamp(1.25rem,2vw,1.75rem)] sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-cyan-400" />
              </span>
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                Interactive Infrastructure Scenario
              </span>
            </div>
            <h2
              className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl"
              id="opsh-calculator-title"
            >
              Project Economics &amp; Impact Model
            </h2>
            <p className="mt-1 text-xs text-slate-400">Model results update based on your scenario inputs.</p>
          </div>
        </header>

        <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-contain p-[clamp(1rem,2.5vh,1.75rem)]">

          {/* Top Control Panel */}
          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] shrink-0 rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              {/* Capacity Section */}
              <div className="flex-1 lg:border-r lg:border-[#1d2833] lg:pr-8">
                <label
                  className="flex items-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400"
                  htmlFor={capacityInputId}
                >
                  Project Scale (MW)
                </label>
                <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-36">
                    <input
                      className="h-[clamp(2.5rem,5vh,3rem)] w-full rounded-lg border border-cyan-400/20 bg-black/40 px-4 pr-12 text-xl font-semibold tracking-[-0.02em] text-white outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                      id={capacityInputId}
                      inputMode="numeric"
                      max={MAX_CAPACITY_MW}
                      min={MIN_CAPACITY_MW}
                      onBlur={() => commitCapacity(Number(capacityInput))}
                      onChange={(event) => handleCapacityInputChange(event.target.value)}
                      step={CAPACITY_STEP_MW}
                      type="number"
                      value={capacityInput}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-400">
                      MW
                    </span>
                  </div>

                  <div className="flex-1 px-2">
                    <input
                      aria-label="Capacity Slider"
                      className="h-1 w-full cursor-pointer appearance-none rounded-full accent-cyan-400 bg-[#1d2833]"
                      max={MAX_CAPACITY_MW}
                      min={MIN_CAPACITY_MW}
                      onChange={(event) => handleCapacityInputChange(event.target.value)}
                      step={CAPACITY_STEP_MW}
                      style={{
                        background: `linear-gradient(90deg, #22d3ee ${((Number(capacityInput) - MIN_CAPACITY_MW) / (MAX_CAPACITY_MW - MIN_CAPACITY_MW)) * 100}%, #1d2833 ${((Number(capacityInput) - MIN_CAPACITY_MW) / (MAX_CAPACITY_MW - MIN_CAPACITY_MW)) * 100}%)`,
                      }}
                      type="range"
                      value={Number(capacityInput)}
                    />
                    <div className="mt-2.5 flex justify-between text-[0.55rem] font-medium tracking-widest uppercase text-slate-500">
                      <span>10 MW</span>
                      <span>1,000 MW</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {CAPACITY_PRESETS_MW.map((preset) => (
                      <button
                        aria-pressed={projection.installedCapacityMw === preset}
                        className="flex h-[clamp(2.5rem,5vh,3rem)] flex-col items-center justify-center rounded-lg border border-[#1d2833] bg-black/20 px-3 min-w-[3.5rem] transition hover:border-cyan-400/40 aria-pressed:border-cyan-400/80 aria-pressed:bg-cyan-400/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                        key={preset}
                        onClick={() => commitCapacity(preset)}
                        type="button"
                      >
                        <span className="text-sm font-semibold text-slate-200">{preset.toLocaleString("en-US")}</span>
                        <span className="text-[0.5rem] uppercase tracking-widest text-slate-500">MW</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Horizon Section */}
              <div className="w-full lg:w-80 lg:pl-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400"
                    htmlFor={horizonInputId}
                  >
                    Operating Horizon
                  </label>
                  <output
                    className="font-semibold text-cyan-400 text-sm"
                    htmlFor={horizonInputId}
                  >
                    {operatingHorizon} <span className="text-[0.65rem]">YRS</span>
                  </output>
                </div>
                <div className="mt-4 px-2">
                  <input
                    aria-label="Operating Horizon"
                    className="h-1 w-full cursor-pointer appearance-none rounded-full accent-cyan-400 bg-[#1d2833]"
                    id={horizonInputId}
                    max={MAX_OPERATING_HORIZON_YEARS}
                    min={MIN_OPERATING_HORIZON_YEARS}
                    onChange={(event) => handleHorizonChange(Number(event.target.value))}
                    style={{
                      background: `linear-gradient(90deg, #22d3ee ${horizonProgress}%, #1d2833 ${horizonProgress}%)`,
                    }}
                    type="range"
                    value={operatingHorizon}
                  />
                  <div className="mt-2.5 flex justify-between text-[0.55rem] font-medium tracking-widest uppercase text-slate-500">
                    <span>1 Year</span>
                    <span>20 Years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Primary Metric Area */}
          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] grid min-h-0 shrink-0 gap-[clamp(0.75rem,2vh,1rem)] lg:grid-cols-12">
            {/* Annual Retained Cash Flow */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:col-span-5">
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/20 to-transparent" />
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Annual Retained Cash Flow</h3>
                </div>
                <div className="mt-6">
                  <strong key={highlightCap} className="block text-[clamp(2rem,5vh,3rem)] font-semibold tracking-[-0.03em] text-white animate-flash rounded-sm">
                    {formatCurrency(projection.annualRetainedCashFlow)}
                  </strong>
                  <span className="mt-2 block text-sm text-slate-400">Per Year</span>
                </div>
              </div>
              <div className="relative z-10 mt-12 flex items-center gap-3 rounded-lg border border-[#1d2833] bg-black/30 p-3">
                 <svg className="size-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 <div>
                   <span className="block text-xs font-medium text-slate-200">Strong annual cash generation</span>
                   <span className="block text-[0.65rem] text-slate-500">Drives long-term project value</span>
                 </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="flex flex-col gap-[clamp(0.75rem,2vh,1rem)] lg:col-span-3">
              {/* Capital Requirement */}
              <div className="flex flex-1 flex-col justify-center rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                    <span className="text-xs font-bold">$</span>
                  </div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Illustrative Capital Requirement</h3>
                </div>
                <div className="mt-4">
                  <strong key={highlightCap} className="block text-[clamp(1.5rem,3.5vh,1.875rem)] font-semibold tracking-[-0.02em] text-white animate-flash rounded-sm">
                    {formatCurrency(projection.illustrativeCapitalRequirement)}
                  </strong>
                  <span className="mt-1 block text-[0.7rem] text-slate-400">Total Estimated</span>
                </div>
              </div>

              {/* Simple Payback */}
              <div className="flex flex-1 flex-col justify-center rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-md border border-violet-400/30 bg-violet-400/10 text-violet-400">
                    <span className="text-xs font-bold">C</span>
                  </div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Simple Payback</h3>
                </div>
                <div className="mt-4">
                  <strong key={highlightCap} className="block text-[clamp(1.5rem,3.5vh,1.875rem)] font-semibold tracking-[-0.02em] text-white animate-flash rounded-sm">
                    {projection.simplePaybackYears.toFixed(1)} <span className="text-xl font-medium text-slate-400">Years</span>
                  </strong>
                  <span className="mt-1 block text-[0.7rem] text-slate-400">Estimated Payback Period</span>
                </div>
              </div>
            </div>

            {/* Annual Energy Throughput */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:col-span-4">
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-tl-full bg-cyan-900/10 blur-2xl" />
              <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-400">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Annual Modeled Energy Throughput</h3>
              </div>
              <div className="mt-6">
                  <strong key={highlightCap} className="block text-[clamp(2rem,5vh,2.5rem)] font-semibold tracking-[-0.03em] text-white animate-flash rounded-sm">
                    {formatNumber(projection.annualModeledEnergyThroughputMwh)} <span className="text-2xl font-medium text-slate-400">MWh</span>
                  </strong>
                  <span className="mt-2 block text-sm text-slate-400">Per Year</span>
              </div>
            </div>
          </div>

          {/* Cumulative / Selected-Horizon Strip */}
          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] grid shrink-0 gap-[clamp(0.5rem,1vh,1rem)] rounded-2xl border border-[#1d2833] bg-[#06141c] p-2 sm:grid-cols-3">
             <div className="flex items-center justify-between rounded-xl p-[clamp(0.5rem,1.5vh,1rem)] transition hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                    <span className="font-bold">$</span>
                  </div>
                  <div>
                    <h4 className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-400">Cumulative Retained Cash Flow</h4>
                    <strong key={highlightCap + highlightHor} className="mt-1 block text-lg font-semibold text-white animate-flash rounded-sm">{formatCompactCurrency(projection.cumulativeRetainedCashFlow)}</strong>
                    <span className="block text-[0.65rem] text-slate-500">{operatingHorizon}-Year Outlook</span>
                  </div>
                </div>
                <svg className="size-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </div>

             <div className="flex items-center justify-between rounded-xl p-[clamp(0.5rem,1.5vh,1rem)] transition hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10 text-blue-400">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-400">Cumulative Energy Throughput</h4>
                    <strong key={highlightCap + highlightHor} className="mt-1 block text-lg font-semibold text-white animate-flash rounded-sm">{formatNumber(projection.cumulativeEnergyThroughputMwh)} <span className="text-xs font-normal text-slate-400">MWh</span></strong>
                    <span className="block text-[0.65rem] text-slate-500">{operatingHorizon}-Year Outlook</span>
                  </div>
                </div>
                <svg className="size-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </div>

             <div className="flex items-center justify-between rounded-xl p-[clamp(0.5rem,1.5vh,1rem)] transition hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                    <span className="text-xs font-bold tracking-tighter">CO₂</span>
                  </div>
                  <div>
                    <h4 className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-400">Approximate CO₂ Displacement</h4>
                    <strong key={highlightCap + highlightHor} className="mt-1 block text-lg font-semibold text-white animate-flash rounded-sm">{formatNumber(projection.cumulativeCo2DisplacementTons)} <span className="text-xs font-normal text-slate-400">tCO₂</span></strong>
                    <span className="block text-[0.65rem] text-slate-500">Cumulative ({operatingHorizon} Years)</span>
                  </div>
                </div>
                <svg className="size-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </div>
          </div>

          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] flex shrink-0 flex-col items-center justify-between gap-4 border-t border-[#1d2833] pt-[clamp(0.5rem,1.5vh,1rem)] sm:flex-row">
            <p className="flex items-center gap-2 text-[0.7rem] text-slate-400">
              <svg className="size-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              All values are illustrative model results based on scenario inputs and assumptions.
            </p>
            <div className="flex items-center gap-3 text-[0.7rem] text-slate-500">
              <span>Scenario: <strong className="text-cyan-400">Custom</strong></span>
            </div>
          </div>

          {/* Details Drawer */}
          <div className="shrink-0">
            <details className="group overflow-hidden rounded-xl border border-slate-700/50 bg-black/20 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-[clamp(1.25rem,2vw,1.75rem)] py-[clamp(0.75rem,2vh,1rem)] text-left text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/[0.02] hover:text-white focus-visible:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
                MODEL DETAILS &amp; ASSUMPTIONS
                <svg aria-hidden="true" className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-slate-800/80 p-[clamp(1rem,2.5vh,1.75rem)] space-y-[clamp(1.5rem,3vh,2rem)]">

                <section>
                  <h4 className="mb-4 border-b border-white/5 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-slate-400">Revenue &amp; Deductions</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <OutputMetric label="Gross Electricity Revenue" value={formatCurrency(projection.grossElectricityRevenue)} animationKey={highlightCap} />
                    <OutputMetric label="Total Deductions" value={`(${formatCurrency(projection.totalDeductions)})`} animationKey={highlightCap} />
                    <OutputMetric label="Post-Debt Retained Cash Flow" value={formatCurrency(projection.postDebtRetainedCashFlow)} accent="cyan" detail="Removes only the modeled debt-service deduction." animationKey={highlightCap} />
                  </div>
                  <div className="mt-4 grid gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 sm:grid-cols-3">
                    <div>
                      <span className="block text-[0.6rem] uppercase tracking-widest text-slate-500">Royalty</span>
                      <strong key={highlightCap} className="mt-1 block text-base font-semibold text-slate-200 animate-flash rounded-sm">{formatCompactCurrency(projection.royaltyDeduction)}</strong>
                    </div>
                    <div>
                      <span className="block text-[0.6rem] uppercase tracking-widest text-slate-500">O&amp;M</span>
                      <strong key={highlightCap} className="mt-1 block text-base font-semibold text-slate-200 animate-flash rounded-sm">{formatCompactCurrency(projection.operationsAndMaintenanceDeduction)}</strong>
                    </div>
                    <div>
                      <span className="block text-[0.6rem] uppercase tracking-widest text-slate-500">Debt Service</span>
                      <strong key={highlightCap} className="mt-1 block text-base font-semibold text-slate-200 animate-flash rounded-sm">{formatCompactCurrency(projection.debtServiceDeduction)}</strong>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="mb-4 border-b border-white/5 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-slate-400">Environmental Method</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <OutputMetric accent="emerald" label="Annual Approximate CO₂ Displacement" value={`${formatNumber(projection.annualCo2DisplacementTons)} tCO₂`} animationKey={highlightCap} />
                    <OutputMetric label="Carbon Factor" value="0.35 tCO₂/MWh" />
                  </div>
                </section>

                <section>
                  <h4 className="mb-4 border-b border-white/5 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-slate-400">Scenario Inputs</h4>
                  <dl className="grid gap-x-5 gap-y-4 text-[0.75rem] sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="text-slate-500">Electricity Price</dt><dd className="mt-1 font-semibold text-slate-200">US$120/MWh</dd></div>
                    <div><dt className="text-slate-500">Capacity Factor</dt><dd className="mt-1 font-semibold text-slate-200">90%</dd></div>
                    <div><dt className="text-slate-500">Annual Hours</dt><dd className="mt-1 font-semibold text-slate-200">8,760</dd></div>
                    <div><dt className="text-slate-500">Royalty Input</dt><dd className="mt-1 font-semibold text-slate-200">US$8.80/MWh</dd></div>
                    <div><dt className="text-slate-500">O&amp;M Input</dt><dd className="mt-1 font-semibold text-slate-200">US$15/MWh</dd></div>
                    <div><dt className="text-slate-500">Debt-Service Input</dt><dd className="mt-1 font-semibold text-slate-200">US$30/MWh</dd></div>
                    <div><dt className="text-slate-500">Capital-Cost Input</dt><dd className="mt-1 font-semibold text-slate-200">US$5M/MW</dd></div>
                  </dl>
                </section>

                <section>
                  <h4 className="mb-4 border-b border-white/5 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-slate-400">Exclusions &amp; Limitations</h4>
                  <div className="space-y-4">
                    <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4 text-[0.7rem] leading-5 text-amber-100/70">
                      <strong className="mb-1 block text-amber-200">Co-Location Exclusion:</strong> Potential water, desalination and industrial co-location value is
                      excluded from this model. Any such value requires separate technical,
                      environmental and commercial validation using project-specific inputs.
                    </p>
                    <p className="text-[0.7rem] leading-5 text-slate-400">
                      These values are visible, replaceable scenario inputs—not offered
                      commercial terms or verified forecasts. Calculations are simplified,
                      pre-tax and exclude project-specific financing, construction,
                      interconnection, insurance and site costs.
                    </p>
                    <p className="text-[0.7rem] leading-5 text-slate-500">
                      Illustrative scenario model only. Outputs are not measured operating
                      performance, an approved forecast, financial advice, an offering or a
                      guarantee of future results. Independent technical, legal and financial
                      diligence is required.
                    </p>
                  </div>
                </section>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(OpshCalculator);
