import { pageMetadata } from "../page-metadata";
import EconomicsScenarioSelector from "../components/EconomicsScenarioSelector";
import OpshCalculator from "../components/OpshCalculator";
import RouteHero from "../components/RouteHero";

export const metadata = pageMetadata(
  "/economics",
  "Economics",
  "Explore Humpback Hydro through a transparent user-driven generation sensitivity and project-specific storage boundaries.",
);

const readinessItems = [
  {
    index: "01",
    title: "Generation",
    copy: "The public tool shows conditional annual-energy and gross electricity-sale arithmetic from a scenario capacity and explicit visitor inputs.",
  },
  {
    index: "02",
    title: "Storage",
    copy: "Usable MWh, duration and cycling, charging profile and cost, conversion efficiency, and dispatch constraints are required before project-specific storage economics can be quantified.",
  },
  {
    index: "03",
    title: "Integrated",
    copy: "Combined generation and storage economics require a defined energy balance, operating profile, and complete project cost and revenue boundary.",
  },
] as const;

export default function EconomicsPage() {
  return (
    <main>
      <RouteHero
        index="04"
        eyebrow="Economics"
        title="Generation. Storage. Dispatch."
        copy="A transparent user-driven sensitivity for generation arithmetic, with storage and integrated economics held to project-specific engineering boundaries."
        image="/grid-data-center-night.webp"
        nextHref="#economics-model"
        nextLabel="Review the Sensitivity"
      />

      <section className="section-shell bg-[var(--ice)]" id="economics-model">
        <div className="chapter-label"><span>01</span>ENERGY AND MODEL BOUNDARY</div>
        <div className="grid gap-10 border-b border-[#061c28]/15 pb-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20" data-reveal>
          <div>
            <p className="eyebrow dark"><span />Conceptual Architecture</p>
            <h2 className="mt-7 max-w-3xl text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#061c28]">
              Energy In → Store → Generate → Dispatch
            </h2>
          </div>
          <div className="self-end">
            <p className="max-w-2xl text-base leading-8 text-[#607780]">
              Compatible external electricity enters the pumping path, pumping raises water into the upper reservoir, stored water is released through the upper generation path, and electrical output leaves toward the connected grid or load.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#607780]">
              Humpback&apos;s lower-stage ambient-flow generation is a separate architecture path. A future configuration may route some generated electricity to pumping; no recovery fraction is assumed here, and system losses mean external energy remains required.
            </p>
          </div>
        </div>

        <EconomicsScenarioSelector />
      </section>

      <section className="bg-[#020d14] text-white">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>USER-DRIVEN SENSITIVITY</div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-20" data-reveal>
            <div>
              <p className="eyebrow"><span />Conditional Arithmetic</p>
              <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">
                Supply the Assumptions. See Only the Bounded Result.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#a9bbc1]">
              Annual energy is calculated only after a visitor enters an annual utilization assumption. Gross electricity-sale sensitivity appears only after the visitor also enters a sale-price assumption. Neither input is a Humpback default, forecast, benchmark or offtake price.
            </p>
          </div>
          <div className="mt-14" data-economics-calculator>
            <OpshCalculator displayMode="embedded" />
          </div>
        </div>
      </section>

      <section className="section-shell bg-[var(--ice)]">
        <div className="chapter-label"><span>03</span>PROJECT-SPECIFIC READINESS</div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark"><span />What the Public Tool Does Not Quantify</p>
            <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em] text-[#061c28]">
              Define the Project Before Defining the Economics.
            </h2>
          </div>
          <div className="border-t border-[#061c28]/15" data-reveal>
            {readinessItems.map((item) => (
              <article className="grid gap-4 border-b border-[#061c28]/15 py-6 sm:grid-cols-[42px_1fr]" key={item.index}>
                <span className="font-mono text-xs font-semibold text-[#168da8]">{item.index}</span>
                <div>
                  <h3 className="text-xl font-medium tracking-[-0.03em] text-[#061c28]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#607780]">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="mt-14 border border-[#061c28]/15 bg-white/55 p-6 md:p-8" data-reveal>
          <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Emissions Boundary</small>
          <h3 className="mt-3 text-2xl font-medium text-[#061c28]">Net Impact Requires a Defined Operating Case.</h3>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#607780]">
            Net emissions impact depends on actual charging mix, conversion losses, displaced marginal generation, operating profile and lifecycle boundary. No operating Humpback installation has demonstrated a quantified avoided-emissions benefit.
          </p>
        </aside>
      </section>
    </main>
  );
}
