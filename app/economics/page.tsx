import { pageMetadata } from "../page-metadata";
import EconomicsScenarioSelector from "../components/EconomicsScenarioSelector";
import OpshCalculator from "../components/OpshCalculator";
import RouteHero from "../components/RouteHero";
import { ILLUSTRATIVE_PROJECT_ASSUMPTIONS } from "../economics-model";

export const metadata = pageMetadata("/economics", "Economics", "Explore how Humpback Hydro's generation, storage and dispatch functions are evaluated through transparent illustrative scenarios.");

const model = ILLUSTRATIVE_PROJECT_ASSUMPTIONS;

const assumptions = [
  ["Electricity Sale Price", `US$${model.electricityPricePerMwh.toFixed(2)}/MWh`],
  ["Royalty Scenario Input", `US$${model.royaltyPerMwh.toFixed(2)}/MWh`],
  ["O&M Scenario Input", `US$${model.operationsAndMaintenancePerMwh.toFixed(2)}/MWh`],
  ["Debt-Service Scenario Input", `US$${model.debtServicePerMwh.toFixed(2)}/MWh`],
  ["Total Deductions", `US$${(model.royaltyPerMwh + model.operationsAndMaintenancePerMwh + model.debtServicePerMwh).toFixed(2)}/MWh`],
  ["Modeled Post-Debt Retained Value", `US$${(model.electricityPricePerMwh - model.royaltyPerMwh - model.operationsAndMaintenancePerMwh - model.debtServicePerMwh).toFixed(2)}/MWh`],
  ["Capacity Factor", `${(model.capacityFactor * 100).toFixed(0)}%`],
  ["Annual Hours", model.annualHours.toLocaleString("en-US")],
  ["Modeled Annual Generation", `${(model.annualHours * model.capacityFactor).toLocaleString("en-US")} MWh/MW`],
  ["Storage Duration", "Project-Specific"],
  ["Conversion Efficiency", "Project-Specific; not applied"],
  ["Illustrative Capital-Cost Assumption", `US$${(model.capitalCostPerMw / 1_000_000).toFixed(1)}M/MW`],
  ["Carbon-Displacement Factor", `${model.co2TonsPerMwh.toFixed(2)} tCO₂/MWh`],
] as const;

const revenueStreams = [
  {
    index: "01",
    title: "Energy",
    copy: "Potential value from electricity generation and delivery depends on the applicable market, dispatch profile and offtake structure.",
  },
  {
    index: "02",
    title: "Storage & Arbitrage",
    copy: "Energy shifting and arbitrage depend on charging cost, market spread, usable storage capacity, operating strategy and project-specific efficiency.",
  },
  {
    index: "03",
    title: "Capacity",
    copy: "Potential capacity and resource-adequacy value depends on demonstrated availability, duration, market rules and contracted obligations.",
  },
  {
    index: "04",
    title: "Grid Services",
    copy: "Potential balancing, frequency and ancillary-service value depends on equipment capability, interconnection approval and market eligibility.",
  },
  {
    index: "05",
    title: "Renewable Integration",
    copy: "Potential value may arise from absorbing compatible surplus or curtailed electricity and firming variable renewable generation.",
  },
  {
    index: "06",
    title: "Resilience",
    copy: "Energy security and system-flexibility value must be defined against the site, operating configuration and resilience requirements.",
  },
] as const;

const perMwEconomics = [
  ["Gross Electricity Revenue", "US$946,080"],
  ["Less Royalty", "(US$69,379)"],
  ["Less O&M", "(US$118,260)"],
  ["Less Debt Service", "(US$236,520)"],
  ["Total Deductions", "(US$424,159)"],
  ["Post-Debt Cash Retained by Client", "US$521,921"],
] as const;

const facilityComparison = [
  {
    label: "Electricity Sales",
    hundredMw: "US$94.61M",
    thousandMw: "US$946.08M",
    emphasis: false,
  },
  {
    label: "Royalty",
    hundredMw: "(US$6.94M)",
    thousandMw: "(US$69.38M)",
    emphasis: false,
  },
  {
    label: "O&M",
    hundredMw: "(US$11.83M)",
    thousandMw: "(US$118.26M)",
    emphasis: false,
  },
  {
    label: "Debt Service",
    hundredMw: "(US$23.65M)",
    thousandMw: "(US$236.52M)",
    emphasis: false,
  },
  {
    label: "Post-Debt Retained",
    hundredMw: "US$52.19M/year",
    thousandMw: "US$521.92M/year",
    emphasis: true,
  },
] as const;

const twentyYearEconomics = [
  ["Gross Electricity Revenue", "US$18.92B"],
  ["Royalty", "(US$1.39B)"],
  ["O&M", "(US$2.37B)"],
  ["Debt Service", "(US$4.73B)"],
  ["Post-Debt Retained by Client", "US$10.44B"],
] as const;

function MetricList({
  rows,
  emphasizeLast = false,
}: {
  rows: readonly (readonly [string, string])[];
  emphasizeLast?: boolean;
}) {
  return (
    <dl className="divide-y divide-[#061c28]/10 border-y border-[#061c28]/15">
      {rows.map(([label, value], index) => {
        const emphasized = emphasizeLast && index === rows.length - 1;

        return (
          <div
            key={label}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4 ${
              emphasized ? "text-[#0a6178]" : ""
            }`}
          >
            <dt
              className={`text-sm leading-6 ${
                emphasized
                  ? "font-semibold text-[#061c28]"
                  : "text-[#607780]"
              }`}
            >
              {label}
            </dt>
            <dd
              className={`text-right font-mono text-sm tabular-nums ${
                emphasized
                  ? "font-bold text-[#0a6178]"
                  : "font-semibold text-[#061c28]"
              }`}
            >
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default function EconomicsPage() {
  return (
    <main>
      <RouteHero
        index="04"
        eyebrow="Economics"
        title="Generation. Storage. Dispatch."
        copy="One modular infrastructure platform with multiple grid functions—presented through transparent illustrative scenarios and project-specific engineering boundaries."
        image="/grid-data-center-night.webp"
        nextHref="#economics-model"
        nextLabel="Review the Scenario"
      />

      <section
        id="economics-model"
        className="section-shell bg-[var(--ice)]"
      >
        <div className="chapter-label">
          <span>01</span>PLATFORM AND MODEL BOUNDARY
        </div>

        <div className="grid gap-10 border-b border-[#061c28]/15 pb-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20" data-reveal>
          <div>
            <p className="eyebrow dark"><span />Integrated Energy Management</p>
            <h2 className="mt-7 max-w-3xl text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#061c28]">
              Energy In → Store → Generate → Dispatch
            </h2>
            <p className="mt-7 text-xl font-medium text-[#0a6178]">
              One Modular Infrastructure Platform. Multiple Grid Functions.
            </p>
          </div>
          <div className="self-end">
            <p className="max-w-2xl text-base leading-8 text-[#607780]">
              Humpback is designed to accept compatible electrical input, store energy as gravitational potential energy, generate electricity through hydroelectric conversion and dispatch power according to system demand and operating requirements.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#607780]">
              Pumping energy may be supplied by available grid electricity, renewable generation or other compatible sources, including otherwise curtailed or surplus energy. Internal energy recovery may reduce external requirements in some configurations, while system losses require make-up energy defined through project-specific engineering.
            </p>
          </div>
        </div>

        <EconomicsScenarioSelector />

        <div className="chapter-label mt-20">
          <span>02</span>ILLUSTRATIVE GENERATION SCENARIO
        </div>

        <div
          className="grid gap-10 border-b border-[#061c28]/15 pb-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20"
          data-reveal
        >
          <div>
            <p className="eyebrow dark">
              <span />
              Transparent Scenario Model
            </p>
            <h2 className="mt-7 max-w-3xl text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#061c28]">
              One Generation Case. Two Facility Scales.
            </h2>
          </div>

          <div className="self-end">
            <p className="max-w-2xl text-base leading-8 text-[#607780]">
              The generation-output scenario applies the same company-supplied electricity price,
              royalty, O&M, debt-service and capacity-factor inputs at both
              scales. All figures are stated in U.S. dollars.
            </p>
            <div className="mt-8 rounded-sm border border-[#168da8]/25 bg-[#168da8]/[0.06] p-5">
              <p className="m-0 text-sm leading-6 text-[#46636c]">
                Illustrative scenario based entirely on provisional assumptions.
                Inputs require company validation; calculated outputs are
                arithmetic consequences of those inputs, not measured operating
                performance, an approved forecast, financial advice, an
                investment offering or a guarantee of future results.
                {" "}Storage economics—including charging-energy price, usable
                storage capacity, storage duration, project-specific round-trip
                efficiency and market spread—are evaluated during feasibility and
                detailed engineering and are excluded from this headline model.
                The emissions calculation excludes charging electricity and lifecycle impacts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-16 lg:grid-cols-2">
          <article
            className="border border-[#061c28]/15 bg-white/60 p-6 md:p-9"
            data-reveal
          >
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">
                  Model Inputs
                </small>
                <h3 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[#061c28]">
                  Provisional Inputs
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold text-[#168da8]">
                90% CF
              </span>
            </div>
            <MetricList rows={assumptions} />
          </article>

          <article
            className="border border-[#061c28]/15 bg-white/60 p-6 md:p-9"
            data-reveal
          >
            <div className="mb-8">
              <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">
                  Calculated Annual Outputs
              </small>
              <h3 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[#061c28]">
                Generation Economics per Installed MW
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#607780]">
                7,884 MWh × US$120/MWh produces US$946,080 in annual gross
                electricity revenue per installed megawatt.
              </p>
            </div>
            <MetricList rows={perMwEconomics} emphasizeLast />
          </article>
        </div>
      </section>

      <section className="bg-[#020d14] text-white">
        <div className="section-shell">
          <div className="chapter-label light">
            <span>03</span>INTERACTIVE PROJECT MODEL
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-20" data-reveal>
            <div>
              <p className="eyebrow"><span />Controlled Scenario Exploration</p>
              <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">
                Change Project Scale. Keep the Assumptions Visible.
              </h2>
            </div>
            <div>
              <p className="mb-7 max-w-2xl text-base leading-8 text-[#a9bbc1]">
                Explore installed capacity from 10 MW to 1,000 MW using the same provisional generation-output case documented on this page. The model calculates project-level arithmetic, not storage margin, securities ownership or direct investor returns.
              </p>
            </div>
          </div>
          <div className="mt-14" data-economics-calculator>
            <OpshCalculator displayMode="embedded" />
          </div>
        </div>
      </section>

      <section className="bg-[#031721] text-white">
        <div className="section-shell">
          <div className="chapter-label light">
            <span>04</span>FACILITY COMPARISON
          </div>

          <div className="mb-12 max-w-4xl" data-reveal>
            <p className="eyebrow">
              <span />
              Annual Project Value
            </p>
            <h2 className="mt-7 text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em]">
              Read the Scale in One View.
            </h2>
          </div>

          <div
            className="overflow-x-auto border border-white/15 bg-black/10"
            role="region"
            aria-label="Illustrative economics comparison"
            tabIndex={0}
            data-reveal
          >
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                Annual comparison for illustrative 100 MW and 1,000 MW
                facilities
              </caption>
              <thead>
                <tr className="border-b border-white/15">
                  <th
                    scope="col"
                    className="px-6 py-5 font-mono text-[0.68rem] tracking-[0.15em] text-[#83c4d2] uppercase"
                  >
                    Annual Value
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-5 text-right font-mono text-[0.68rem] tracking-[0.15em] text-[#83c4d2] uppercase"
                  >
                    100 MW Facility
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-5 text-right font-mono text-[0.68rem] tracking-[0.15em] text-[#83c4d2] uppercase"
                  >
                    1,000 MW Facility
                  </th>
                </tr>
              </thead>
              <tbody>
                {facilityComparison.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-white/10 last:border-b-0 ${
                      row.emphasis ? "bg-[#168da8]/15" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className={`px-6 py-5 text-sm ${
                        row.emphasis
                          ? "font-semibold text-white"
                          : "font-medium text-[#a9bbc1]"
                      }`}
                    >
                      {row.label}
                    </th>
                    <td
                      className={`px-6 py-5 text-right font-mono text-sm tabular-nums ${
                        row.emphasis
                          ? "font-bold text-[#83c4d2]"
                          : "text-[#d7e5e7]"
                      }`}
                    >
                      {row.hundredMw}
                    </td>
                    <td
                      className={`px-6 py-5 text-right font-mono text-sm tabular-nums ${
                        row.emphasis
                          ? "font-bold text-[#83c4d2]"
                          : "text-[#d7e5e7]"
                      }`}
                    >
                      {row.thousandMw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[var(--ice)]">
        <div className="chapter-label">
          <span>05</span>POTENTIAL PROJECT VALUE STREAMS
        </div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark"><span />Multiple Grid Functions</p>
            <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em] text-[#061c28]">
              Value Is Quantified Function by Function.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#607780]">
              Potential value streams are shown for context and are not included in the financial results above unless specifically identified. Availability and compensation vary by market, jurisdiction, project configuration and operating capability.
            </p>
          </div>
          <div className="border-t border-[#061c28]/15" data-reveal>
            {revenueStreams.map((stream) => (
              <article className="grid gap-4 border-b border-[#061c28]/15 py-6 sm:grid-cols-[42px_1fr]" key={stream.index}>
                <span className="font-mono text-xs font-semibold text-[#168da8]">{stream.index}</span>
                <div>
                  <h3 className="text-xl font-medium tracking-[-0.03em] text-[#061c28]">{stream.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#607780]">{stream.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <details className="mt-14 border border-[#061c28]/15 bg-white/50 p-6 md:p-8" data-reveal>
          <summary className="cursor-pointer text-xl font-semibold tracking-[-0.025em] text-[#061c28] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168da8]">
            What a Project-Specific Model Must Test
          </summary>
          <div className="mt-6 grid gap-7 border-t border-[#061c28]/10 pt-6 text-sm leading-7 text-[#607780] md:grid-cols-2">
            <p>Electricity price, dispatch profile, capacity factor, capital cost, operating cost, construction contingency, equipment replacement, curtailment and degradation.</p>
            <p>Financing terms, interest rates, taxes, insurance, interconnection, site costs and market eligibility before calculating NPV, IRR, DSCR, LCOE or LCOS.</p>
          </div>
        </details>
      </section>

      <section className="section-shell bg-[var(--ice)]">
        <div className="chapter-label">
          <span>06</span>LONG-TERM VALUE
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark">
              <span />
              20-Year Operating Period
            </p>
            <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em] text-[#061c28]">
              The Post-Debt Scenario Changes the Value Equation.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#607780]">
              This calculated operating-period view assumes debt service remains
              US$30/MWh throughout the full 20 years. The period and every
              financial input remain provisional.
            </p>
          </div>

          <article
            className="self-start border border-[#061c28]/15 bg-white/60 p-6 md:p-10"
            data-reveal
          >
            <MetricList rows={twentyYearEconomics} emphasizeLast />
          </article>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020d14] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 78% 38%, rgba(67,182,204,.22), transparent 32%), linear-gradient(120deg, transparent 20%, rgba(22,141,168,.08))",
          }}
        />

        <div className="section-shell relative">
          <div className="chapter-label light">
          <span>07</span>ILLUSTRATIVE PAYBACK
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article
              className="flex min-h-[360px] flex-col justify-between border border-[#59acc2]/30 bg-[#082f40]/45 p-7 backdrop-blur-sm md:p-10"
              data-reveal
            >
              <div>
                <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
                  Illustrative Simple Payback
                </small>
                <p className="mt-6 font-mono text-[clamp(4.8rem,10vw,9rem)] font-semibold leading-none tracking-[-0.08em] text-white tabular-nums">
                  9.6
                </p>
                <p className="mt-2 text-2xl font-medium text-[#83c4d2]">
                  Years
                </p>
              </div>
              <p className="mt-10 max-w-xl text-sm leading-7 text-[#a9bbc1]">
                Based on a US$5.0B illustrative capital-cost assumption and approximately
                US$521.92M in annual client-retained cash after royalty, O&M and
                debt servicing. This ratio is not an IRR, NPV or project-finance return.
              </p>
            </article>

            <article
              className="flex min-h-[360px] flex-col justify-between border border-[#59acc2]/30 bg-[#082f40]/45 p-7 backdrop-blur-sm md:p-10"
              data-reveal
            >
              <div>
                <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
                  Illustrative Pre-Debt Retained Cash Flow
                </small>
                <p className="mt-6 font-mono text-[clamp(3.8rem,8vw,7.5rem)] font-semibold leading-none tracking-[-0.08em] text-white tabular-nums">
                  $758.4M
                </p>
                <p className="mt-4 text-xl font-medium text-[#83c4d2]">
                  Per Year
                </p>
              </div>
              <p className="mt-10 max-w-xl text-sm leading-7 text-[#a9bbc1]">
                Once the modeled US$30/MWh debt-service deduction ends, annual
                retained cash flow increases by approximately US$236.5M without
                adding generating capacity.
              </p>
            </article>
          </div>

          <div
            className="mt-6 border border-white/15 bg-white/[0.035] p-7 md:p-10"
            data-reveal
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]">
              <h3 className="text-3xl font-medium leading-tight tracking-[-0.04em]">
                The Post-Debt Infrastructure Advantage
              </h3>
              <p className="m-0 text-base leading-8 text-[#a9bbc1]">
                If operations continue after the modeled debt service ends,
                retiring the financing moves calculated retained annual cash
                flow from approximately US$521.92M to US$758.44M under the
                provisional inputs. Facility life, financing terms and actual
                cash flow require company and project-specific validation.
              </p>
            </div>
          </div>

          <aside className="mt-10 border-l-2 border-[#59acc2] pl-5 text-xs leading-6 text-[#78969e]">
            This is a simplified, pre-tax scenario rather than an IRR, equity
            return, investment offer or financial forecast. It excludes the
            time value of money, financing fees, construction contingencies,
            taxes, curtailment, degradation, insurance, interconnection,
            site-specific costs and other project variables. Independent
            technical, legal and financial diligence is required.
          </aside>
        </div>
      </section>
    </main>
  );
}
