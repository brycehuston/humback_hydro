"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

const scenarios = [
  {
    id: "generation",
    label: "Generation",
    title: "Illustrative Generation & Delivery",
    copy: "The public calculator models installed capacity, annual electricity output, gross electricity sales and the listed provisional deductions.",
    points: [
      "Modeled annual generation",
      "Gross electricity sales",
      "Provisional per-MWh deductions",
    ],
    boundary: "Charging-energy cost and storage-market revenue are outside this generation-output scenario.",
  },
  {
    id: "storage",
    label: "Storage",
    title: "Project-Specific Storage Economics",
    copy: "Storage economics require a defined charging source, electricity price, usable storage capacity, operating schedule and project-specific round-trip efficiency.",
    points: [
      "Charging source and price",
      "Usable MWh and storage duration",
      "Efficiency, dispatch profile and market spread",
    ],
    boundary: "No storage or arbitrage revenue is monetized in the public calculator.",
  },
  {
    id: "integrated",
    label: "Integrated",
    title: "Generation, Storage & Dispatch",
    copy: "Humpback is designed as one modular infrastructure platform with multiple grid functions. Potential value streams are identified separately without assigning unsupported revenue.",
    points: [
      "Hydroelectric generation and delivery",
      "Energy storage and renewable firming",
      "Capacity, grid services and resilience",
    ],
    boundary: "Each function is quantified only when site, engineering, operating and market assumptions are defined.",
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
