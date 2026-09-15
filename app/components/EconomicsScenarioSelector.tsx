"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

const scenarios = [
  {
    id: "generation",
    label: "Generation",
    title: "Generation Sensitivity",
    copy: "The public tool performs conditional arithmetic from scenario generating capacity and explicit visitor-supplied assumptions.",
    points: [
      "Scenario generating capacity",
      "Annual utilization assumption",
      "Gross sale-price sensitivity",
    ],
    boundary: "The result is not project generation, storage deliverability, net export or a profitability forecast.",
  },
  {
    id: "storage",
    label: "Storage",
    title: "Project-Specific Storage Economics",
    copy: "Project-specific storage economics require usable MWh, duration and cycling, charging profile and cost, and conversion efficiency.",
    points: [
      "Charging source and price",
      "Usable MWh and storage duration",
      "Efficiency, dispatch profile and market spread",
    ],
    boundary: "No numeric storage or arbitrage output is published until those inputs and a dispatch boundary are defined.",
  },
  {
    id: "integrated",
    label: "Integrated",
    title: "Generation, Storage & Dispatch",
    copy: "Combined generation and storage economics require a defined energy balance and a complete project-cost boundary.",
    points: [
      "Defined charging and discharge balance",
      "Project-specific operating profile",
      "Complete cost and revenue boundary",
    ],
    boundary: "No invented numeric output is shown for an integrated project scenario.",
  },
] as const;

export default function EconomicsScenarioSelector() {
  const baseId = useId();
  const [activeId, setActiveId] = useState<(typeof scenarios)[number]["id"]>(
    "generation",
  );
  const activeIndex = scenarios.findIndex((scenario) => scenario.id === activeId);
  const activeScenario = scenarios[activeIndex];

  function selectScenario(index: number) {
    const next = scenarios[(index + scenarios.length) % scenarios.length];
    setActiveId(next.id);
    document.getElementById(`${baseId}-${next.id}-tab`)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectScenario(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectScenario(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectScenario(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectScenario(scenarios.length - 1);
    }
  }

  return (
    <div className="mt-12 border border-[#061c28]/15 bg-white/55" data-economics-scenario-selector>
      <div
        aria-label="Scenario Type"
        className="grid border-b border-[#061c28]/15 sm:grid-cols-3"
        role="tablist"
      >
        {scenarios.map((scenario) => {
          const selected = scenario.id === activeId;
          return (
            <button
              aria-controls={`${baseId}-${scenario.id}-panel`}
              aria-selected={selected}
              className="min-h-14 border-b border-[#061c28]/15 px-5 py-4 text-left font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-[#607780] uppercase transition hover:bg-[#168da8]/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#168da8] aria-selected:bg-[#061c28] aria-selected:text-white sm:border-r sm:border-b-0 sm:last:border-r-0"
              id={`${baseId}-${scenario.id}-tab`}
              key={scenario.id}
              onClick={() => setActiveId(scenario.id)}
              onKeyDown={handleKeyDown}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${baseId}-${activeScenario.id}-tab`}
        className="grid gap-8 p-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:p-9"
        id={`${baseId}-${activeScenario.id}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        <div>
          <small className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-[#168da8] uppercase">
            Scenario Type
          </small>
          <h3 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[#061c28]">
            {activeScenario.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[#607780]">
            {activeScenario.copy}
          </p>
        </div>
        <div>
          <ul className="grid gap-3 text-sm text-[#46636c] sm:grid-cols-3">
            {activeScenario.points.map((point) => (
              <li className="border-l-2 border-[#168da8] pl-4" key={point}>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-[#061c28]/10 pt-5 text-sm leading-7 text-[#607780]">
            {activeScenario.boundary}
          </p>
        </div>
      </div>
    </div>
  );
}
