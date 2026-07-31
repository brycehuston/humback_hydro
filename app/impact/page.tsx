import type { Metadata } from "next";
import { Arrow } from "../components/Icons";
import RouteHero from "../components/RouteHero";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Review Humpback Hydro's qualified environmental profile, potential SDG alignment, material risks and validation priorities.",
};

const opportunities = [
  {
    title: "Operational Emissions Profile",
    summary:
      "Near-zero operational emissions are a design objective because the proposed system would not use on-site fuel combustion.",
    detail:
      "This is not a lifecycle-emissions claim. Materials, construction, marine operations, maintenance, grid charging and end-of-life impacts require a project-specific greenhouse-gas inventory.",
  },
  {
    title: "Potential Siting Advantages",
    summary:
      "Marine or closed-loop siting may avoid river fragmentation, large terrestrial reservoirs and extensive land disturbance.",
    detail:
      "The actual comparison depends on the selected site, foundations, grid connection, construction method and alternative project being displaced.",
  },
  {
    title: "Potential Habitat Features",
    summary:
      "Site-specific textures, niches or habitat modules could support marine colonization where ecologically appropriate.",
    detail:
      "Artificial-reef, refuge or biodiversity outcomes cannot be assumed. Baseline surveys, ecological design, permitting and long-term monitoring would be required.",
  },
  {
    title: "Potential Mixing and Water Quality",
    summary:
      "Intake and discharge design may influence local circulation, mixing and dissolved oxygen.",
    detail:
      "Direction, magnitude and ecological value are unknown until hydrodynamic modelling and field measurement establish site-specific effects.",
  },
] as const;

const risks = [
  {
    title: "Construction Noise and Turbidity",
    detail:
      "Vessel activity, excavation or piling may disturb sediment and expose marine fauna to underwater noise. Construction method, timing and mitigation require environmental review.",
  },
  {
    title: "Intake and Species Interaction",
    detail:
      "Eggs, larvae, juvenile fish and other organisms may be vulnerable to entrainment or impingement. Intake velocity, screening and placement require biological and hydraulic validation.",
  },
  {
    title: "Currents, Sediment and Scour",
    detail:
      "A large submerged structure can alter local currents, sediment transport and seabed scour. Site-specific hydrodynamic and geotechnical modelling is required.",
  },
  {
    title: "Biofouling and Invasive Species",
    detail:
      "Marine growth may create habitat while also affecting hydraulic performance or supporting invasive organisms. Inspection and adaptive management would be necessary.",
  },
  {
    title: "Marine Mammals and Electromagnetic Fields",
    detail:
      "Interactions with marine mammals and fields from subsea electrical infrastructure require species, cable, shielding and route-specific assessment.",
  },
] as const;

const primarySdgs = [
  ["07", "Affordable and Clean Energy", "Core conceptual alignment through clean-energy generation, storage and dispatch objectives."],
  ["09", "Industry, Innovation and Infrastructure", "Core alignment through infrastructure engineering and potential industrial delivery."],
  ["13", "Climate Action", "Core potential alignment, conditional on verified lifecycle and displaced-generation performance."],
] as const;

const enablingSdgs = [
  ["06", "Clean Water and Sanitation", "Potential where separately validated water infrastructure is co-located."],
  ["08", "Decent Work and Economic Growth", "Potential project and supply-chain effects require local economic assessment."],
  ["11", "Sustainable Cities and Communities", "Potential contribution through resilient energy infrastructure."],
  ["17", "Partnerships for the Goals", "Direct relevance to the required utility, government, engineering and research collaboration."],
] as const;

const secondarySdgs = [
  ["01", "No Poverty"],
  ["02", "Zero Hunger"],
  ["03", "Good Health and Well-Being"],
  ["04", "Quality Education"],
  ["05", "Gender Equality"],
  ["10", "Reduced Inequalities"],
  ["12", "Responsible Consumption and Production"],
  ["15", "Life on Land"],
  ["16", "Peace, Justice and Strong Institutions"],
] as const;

const monitoringPriorities = [
  "Lifecycle greenhouse-gas inventory and displaced-generation scenario",
  "Intake hydraulics, screening and entrainment assessment",
  "Underwater noise and marine-mammal baseline",
  "Hydrodynamic, sediment-transport and scour modelling",
  "Dissolved oxygen, temperature and water-quality baseline",
  "Biodiversity and environmental-DNA monitoring",
  "Subsea-cable electromagnetic-field assessment",
  "Biofouling, invasive-species and adaptive-management plan",
] as const;

export default function ImpactPage() {
  return (
    <main>
      <RouteHero
        index="03"
        eyebrow="Impact"
        title="Impact Must Be Measured."
        copy="A balanced view of the proposed environmental profile, potential development alignment and the monitoring required before project-level benefits can be claimed."
        image="/island-energy-water.webp"
        nextHref="#impact-boundary"
        nextLabel="Review the Impact Framework"
      />

      <section className="section-shell bg-[var(--ice)]" id="impact-boundary">
        <div className="chapter-label"><span>01</span>LIFECYCLE BOUNDARY</div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24" data-reveal>
          <div>
            <p className="eyebrow dark"><span />Operational Profile</p>
            <h2 className="text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#061c28]">
              Near-Zero Operation Is an Objective, Not a Lifecycle Claim.
            </h2>
          </div>
          <div className="self-end">
            <p className="text-base leading-8 text-[#607780]">
              The proposed system would generate without on-site fuel combustion. Its construction materials, marine works, maintenance, electricity used for pumping and end-of-life impacts have not yet been quantified for a Humpback project.
            </p>
            <p className="mt-6 border-l-2 border-[#168da8] pl-5 text-sm leading-7 text-[#46636c]">
              No operating Humpback installation has demonstrated an emissions, biodiversity, oxygenation, water-quality or habitat benefit. Avoided emissions depend on the actual charging mix, displaced generation and operating profile.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#031721] text-white">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>OPPORTUNITIES AND RISKS</div>
          <div className="mb-14 grid gap-8 lg:grid-cols-2 lg:gap-20" data-reveal>
            <div>
              <p className="eyebrow"><span />Potential Opportunities</p>
              <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">
                Design for Benefit. Validate Every Outcome.
              </h2>
            </div>
            <p className="self-end text-base leading-8 text-[#a9bbc1]">
              Opportunities and adverse effects must be evaluated together. Design intent, experience from analogous infrastructure and ecological plausibility are not substitutes for project evidence.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3" data-reveal>
              {opportunities.map((item) => (
                <details className="group border border-[#59acc2]/25 bg-[#082f40]/40 p-5" key={item.title}>
                  <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.025em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#59acc2]">
                    <span className="mr-3 text-[#59acc2]">+</span>{item.title}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#b3c8cd]">{item.summary}</p>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-6 text-[#78969e]">{item.detail}</p>
                </details>
              ))}
            </div>
            <div className="space-y-3" data-reveal>
              {risks.map((item) => (
                <details className="group border border-amber-100/15 bg-amber-100/[0.035] p-5" key={item.title}>
                  <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.025em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200">
                    <span className="mr-3 text-amber-200">!</span>{item.title}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#b3c8cd]">{item.detail}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[var(--ice)]">
        <div className="chapter-label"><span>03</span>POTENTIAL SDG ALIGNMENT</div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark"><span />Development Context</p>
            <h2 className="text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em] text-[#061c28]">
              Alignment Is Not the Same as Measured Impact.
            </h2>
            <p className="mt-7 text-base leading-8 text-[#607780]">
              The goals provide a useful planning lens. Real contribution must be established through project delivery, monitoring and independently supportable outcomes.
            </p>
          </div>
          <div className="space-y-9" data-reveal>
            <div>
              <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Core Conceptual Alignment</small>
              <div className="mt-4 border-t border-[#061c28]/15">
                {primarySdgs.map(([number, title, copy]) => (
                  <article className="grid gap-4 border-b border-[#061c28]/15 py-5 sm:grid-cols-[42px_1fr]" key={number}>
                    <span className="font-mono text-xs font-bold text-[#168da8]">{number}</span>
                    <div><h3 className="text-lg font-medium text-[#061c28]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#607780]">{copy}</p></div>
                  </article>
                ))}
              </div>
            </div>
            <div>
              <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Enabling Alignment</small>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {enablingSdgs.map(([number, title, copy]) => (
                  <article className="border border-[#061c28]/15 bg-white/55 p-5" key={number}>
                    <span className="font-mono text-xs font-bold text-[#168da8]">SDG {number}</span>
                    <h3 className="mt-3 text-base font-semibold text-[#061c28]">{title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[#607780]">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border border-[#061c28]/15 bg-white/50 p-6 md:p-8 lg:grid-cols-[0.38fr_0.62fr]" data-reveal>
          <div>
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Conditional Alignment</small>
            <h3 className="mt-3 text-2xl font-medium text-[#061c28]">SDG 14 · Life Below Water</h3>
            <p className="mt-3 text-sm leading-7 text-[#607780]">Potential alignment depends entirely on avoiding adverse effects and demonstrating site-specific ecological outcomes.</p>
          </div>
          <div>
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#607780] uppercase">Secondary Planning Lens</small>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
              {secondarySdgs.map(([number, title]) => (
                <span className="border-b border-[#061c28]/10 pb-2 text-xs leading-5 text-[#607780]" key={number}><strong className="mr-2 text-[#168da8]">{number}</strong>{title}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#020d14] text-white">
        <div className="section-shell">
          <div className="chapter-label light"><span>04</span>MONITORING BEFORE CLAIMS</div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
            <div data-reveal>
              <p className="eyebrow"><span />Research and Validation</p>
              <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">
                Establish the Baseline. Measure the Change.
              </h2>
              <p className="mt-8 text-base leading-8 text-[#a9bbc1]">
                Monitoring priorities must be adapted to the site, jurisdiction, species and final engineering design.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2" data-reveal>
              {monitoringPriorities.map((priority, index) => (
                <li className="flex gap-4 border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-[#b4c9ce]" key={priority}>
                  <span className="font-mono text-xs font-semibold text-[#59acc2]">{String(index + 1).padStart(2, "0")}</span>
                  {priority}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-14 flex flex-col gap-5 border-t border-white/15 pt-10 sm:flex-row sm:items-center" data-reveal>
            <a className="button energy" href="/partners#validation">Contribute to Independent Validation <Arrow /></a>
            <a className="text-link light" href="/evidence">Review the Evidence <Arrow /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
