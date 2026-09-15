"use client";

import { memo, useId, useMemo, useState, type ReactNode } from "react";
import {
  CAPACITY_PRESETS_MW,
  CAPACITY_STEP_MW,
  calculateProjectScenario,
  ILLUSTRATIVE_PROJECT_ASSUMPTIONS,
  MAX_CAPACITY_MW,
  MIN_CAPACITY_MW,
  normalizeCapacityMw,
  type ProjectEconomicsAssumptions,
} from "../economics-model";

export type OpshCalculatorAssumptions = ProjectEconomicsAssumptions;

export interface OpshCalculatorProps {
  className?: string;
  assumptions?: Partial<ProjectEconomicsAssumptions>;
  displayMode?: "dialog" | "embedded";
  headerActions?: ReactNode;
}

export const DEFAULT_OPSH_CALCULATOR_ASSUMPTIONS =
  ILLUSTRATIVE_PROJECT_ASSUMPTIONS;

const wholeNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatUsd(value: number): string {
  return `US$${wholeNumberFormatter.format(value)}`;
}

function formatCompactUsd(value: number): string {
  return `US$${compactNumberFormatter.format(value)}`;
}

function parseRequiredNumber(value: string, minimum: number, maximum = Number.POSITIVE_INFINITY) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function OpshCalculator({
  className = "",
  assumptions,
  displayMode = "dialog",
  headerActions,
}: OpshCalculatorProps) {
  const capacityInputId = useId();
  const utilizationInputId = useId();
  const salePriceInputId = useId();
  const [capacityInput, setCapacityInput] = useState("420");
  const [utilizationInput, setUtilizationInput] = useState("");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [highlight, setHighlight] = useState(0);

  const model = useMemo<ProjectEconomicsAssumptions>(
    () => ({ ...ILLUSTRATIVE_PROJECT_ASSUMPTIONS, ...assumptions }),
    [assumptions],
  );
  const capacityMw = useMemo(
    () => normalizeCapacityMw(Number(capacityInput)),
    [capacityInput],
  );
  const utilizationPercent = useMemo(
    () => parseRequiredNumber(utilizationInput, 0, 100),
    [utilizationInput],
  );
  const salePricePerMwh = useMemo(
    () => parseRequiredNumber(salePriceInput, 0),
    [salePriceInput],
  );
  const projection = useMemo(
    () => calculateProjectScenario(
      capacityMw,
      utilizationPercent,
      salePricePerMwh,
      model,
    ),
    [capacityMw, model, salePricePerMwh, utilizationPercent],
  );

  function updateInput(setter: (value: string) => void, value: string) {
    setter(value);
    setHighlight((current) => current + 1);
  }

  function commitCapacity(value: number) {
    setCapacityInput(String(normalizeCapacityMw(value)));
    setHighlight((current) => current + 1);
  }

  return (
    <section
      aria-labelledby="opsh-calculator-title"
      className={`pointer-events-auto isolate flex w-full flex-col rounded-[1.75rem] border border-[#1d2833] bg-[#020b10] text-white shadow-[0_32px_100px_rgba(0,8,18,0.65)] ${displayMode === "embedded" ? "h-auto overflow-visible" : "h-full overflow-hidden [contain:layout_style_paint]"} ${className}`}
      data-opsh-calculator={displayMode}
    >
      <div className={`relative flex flex-col ${displayMode === "embedded" ? "h-auto" : "h-full min-h-0 flex-1"}`}>
        <header className="relative flex shrink-0 flex-col justify-between gap-5 border-b border-[#1d2833] bg-[#031016] p-[clamp(1rem,2vh,1.5rem)] px-[clamp(1.25rem,2vw,1.75rem)] sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
              User-Driven Scenario
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl" id="opsh-calculator-title">
              Generation Sensitivity Tool
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
              Conditional arithmetic from visitor-supplied utilization and sale-price assumptions. No project profitability or storage deliverability is calculated.
            </p>
          </div>
          {headerActions ? <div className="calculator-header-actions">{headerActions}</div> : null}
        </header>

        <div className={`relative flex flex-1 flex-col p-[clamp(1rem,2.5vh,1.75rem)] ${displayMode === "embedded" ? "overflow-visible" : "overflow-y-auto overscroll-contain"}`}>
          <div className="grid gap-5 rounded-2xl border border-[#1d2833] bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:grid-cols-3">
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400" htmlFor={capacityInputId}>
                Scenario Generating Capacity
              </label>
              <div className="relative mt-3 w-full">
                <input
                  className="h-12 w-full rounded-lg border border-cyan-400/20 bg-black/40 px-4 pr-12 text-xl font-semibold text-white outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                  id={capacityInputId}
                  inputMode="numeric"
                  max={MAX_CAPACITY_MW}
                  min={MIN_CAPACITY_MW}
                  onBlur={() => commitCapacity(Number(capacityInput))}
                  onChange={(event) => updateInput(setCapacityInput, event.target.value)}
                  step={CAPACITY_STEP_MW}
                  type="number"
                  value={capacityInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-400">MW</span>
              </div>
              <input
                aria-label="Scenario Generating Capacity Slider"
                className="mt-5 h-1 w-full cursor-pointer appearance-none rounded-full bg-[#1d2833] accent-cyan-400"
                max={MAX_CAPACITY_MW}
                min={MIN_CAPACITY_MW}
                onChange={(event) => updateInput(setCapacityInput, event.target.value)}
                step={CAPACITY_STEP_MW}
                type="range"
                value={capacityMw}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {CAPACITY_PRESETS_MW.map((preset) => (
                  <button
                    aria-pressed={projection.installedCapacityMw === preset}
                    className="min-h-11 min-w-14 rounded-lg border border-[#1d2833] bg-black/20 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 aria-pressed:border-cyan-400/80 aria-pressed:bg-cyan-400/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                    key={preset}
                    onClick={() => commitCapacity(preset)}
                    type="button"
                  >
                    {preset.toLocaleString("en-US")} MW
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[0.68rem] leading-5 text-slate-500">
                10–1,000 MW are scenario UI bounds, not an engineered or validated Humpback deployment range.
              </p>
            </div>

            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400" htmlFor={utilizationInputId}>
                User-Supplied Annual Utilization Assumption
              </label>
              <div className="relative mt-3">
                <input
                  aria-describedby={`${utilizationInputId}-boundary`}
                  className="h-12 w-full rounded-lg border border-cyan-400/20 bg-black/40 px-4 pr-12 text-xl font-semibold text-white outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                  id={utilizationInputId}
                  inputMode="decimal"
                  max="100"
                  min="0"
                  onChange={(event) => updateInput(setUtilizationInput, event.target.value)}
                  required
                  step="0.1"
                  type="number"
                  value={utilizationInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-cyan-400">%</span>
              </div>
              <p className="mt-3 text-[0.68rem] leading-5 text-slate-400" id={`${utilizationInputId}-boundary`}>
                A user scenario assumption—not measured, modeled or forecast Humpback performance. A real project value must reflect duration, charging, cycling, conversion losses, availability, outages and dispatch constraints.
              </p>
            </div>

            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400" htmlFor={salePriceInputId}>
                User-Supplied Sale-Price Assumption
              </label>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-cyan-400">US$</span>
                <input
                  aria-describedby={`${salePriceInputId}-boundary`}
                  className="h-12 w-full rounded-lg border border-cyan-400/20 bg-black/40 px-14 pr-20 text-xl font-semibold text-white outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                  id={salePriceInputId}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateInput(setSalePriceInput, event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={salePriceInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.62rem] font-semibold text-slate-500">/MWh</span>
              </div>
              <p className="mt-3 text-[0.68rem] leading-5 text-slate-400" id={`${salePriceInputId}-boundary`}>
                Not a market benchmark, forecast or offtake price.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-12">
            <article className="rounded-2xl border border-cyan-400/20 bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:col-span-5">
              <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Annual Energy Sensitivity</h3>
              {projection.annualEnergySensitivityMwh === null ? (
                <p className="mt-5 text-lg font-medium text-slate-500">Enter annual utilization to calculate.</p>
              ) : (
                <output className="mt-5 block text-[clamp(2rem,5vw,3.2rem)] font-semibold tracking-[-0.04em] text-white animate-flash" key={highlight}>
                  {wholeNumberFormatter.format(projection.annualEnergySensitivityMwh)} <span className="text-base font-medium text-cyan-200">MWh/year</span>
                </output>
              )}
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-cyan-100/75">
                User-input sensitivity only. Not a forecast of Humpback project generation, storage duration, deliverable energy or net export.
              </p>
            </article>

            <article className="rounded-2xl border border-cyan-400/20 bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:col-span-5">
              <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Gross Electricity-Sale Sensitivity</h3>
              <p className="mt-2 text-sm font-semibold text-amber-100">Before Charging Energy and All Project Costs</p>
              {projection.grossElectricitySaleSensitivity === null ? (
                <p className="mt-5 text-lg font-medium text-slate-500">Enter annual utilization and sale price to calculate.</p>
              ) : (
                <output className="mt-5 block text-[clamp(2rem,5vw,3.2rem)] font-semibold tracking-[-0.04em] text-white animate-flash" key={highlight}>
                  {formatUsd(projection.grossElectricitySaleSensitivity)} <span className="text-base font-medium text-cyan-200">/year</span>
                </output>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#06141c] p-[clamp(1rem,2vh,1.5rem)] lg:col-span-2">
              <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Illustrative Capital-Cost Arithmetic</h3>
              <p className="mt-5 text-2xl font-semibold text-slate-200">{formatCompactUsd(projection.illustrativeCapitalRequirement)}</p>
              <p className="mt-3 text-[0.68rem] leading-5 text-slate-500">Scenario capacity × US$5M/MW. Illustrative input only; not an EPC estimate.</p>
            </article>
          </div>

          <details className="mt-5 rounded-xl border border-[#1d2833] bg-black/20 p-5">
            <summary className="cursor-pointer text-[0.68rem] font-bold uppercase tracking-[0.16em] text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              Model Details &amp; Assumptions
            </summary>
            <div className="mt-5 grid gap-5 border-t border-white/10 pt-5 text-xs leading-6 text-slate-400 md:grid-cols-2">
              <p><strong className="block text-slate-200">Annual Energy Formula</strong>Scenario generating capacity × 8,760 hours/year × user-supplied annual utilization assumption.</p>
              <p><strong className="block text-slate-200">Gross Sale Formula</strong>Annual Energy Sensitivity × user-supplied sale-price assumption.</p>
              <p><strong className="block text-slate-200">Excluded From Gross Sale</strong>Charging electricity and every project cost, including development, construction, interconnection, operation, maintenance, financing, tax, insurance and replacement costs.</p>
              <p><strong className="block text-slate-200">No Return or Carbon Result</strong>The tool does not calculate project profitability, payback, financing returns or avoided emissions. Independent technical, legal and financial diligence is required.</p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

export default memo(OpshCalculator);
