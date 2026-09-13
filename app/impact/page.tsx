import { pageMetadata } from "../page-metadata";
import { Arrow, Check, Plus } from "../components/Icons";
import RouteHero from "../components/RouteHero";

export const metadata = pageMetadata("/impact", "Impact", "Review Humpback Hydro's qualified environmental profile, potential SDG alignment, material risks and validation priorities.");

const establishedMechanisms = [
  {
    title: "No On-Site Fuel Combustion",
    summary:
      "The proposed generating process does not require on-site fuel combustion.",
    detail:
      "This is not a lifecycle-emissions claim. Materials, construction, marine operations, maintenance, grid charging and end-of-life impacts require a project-specific greenhouse-gas inventory.",
  },
  {
    title: "Marine and Closed-Loop Siting Options",
    summary:
      "Marine or closed-loop siting may avoid river fragmentation, large terrestrial reservoirs and extensive land disturbance.",
    detail:
      "The actual comparison depends on the selected site, foundations, grid connection, construction method and alternative project being displaced.",
  },
  {
    title: "Habitat-Supporting Design Features",
    summary:
      "Textured surfaces, niches and habitat modules can be incorporated where baseline ecology and permitting support them.",
    detail:
      "This establishes a design mechanism, not an ecological outcome. Artificial-reef, refuge or biodiversity benefits require baseline surveys and long-term monitoring.",
  },
] as const;

const researchHypotheses = [
  {
    title: "Dissolved Oxygen and Mixing",
    summary:
      "Hydraulic flow may influence local circulation, mixing and dissolved oxygen.",
    detail:
      "Direction, magnitude and ecological value are unknown until hydrodynamic modelling and field measurement establish site-specific effects.",
  },
  {
    title: "Biodiversity and Refuge",
    summary:
      "A three-dimensional marine structure may create colonization surfaces, current breaks and refuge habitat.",
    detail:
      "Species composition, ecological value and any net biodiversity change remain hypotheses until measured against a site baseline.",
  },
  {
    title: "Carbon-Cycle Effects",
    summary:
      "Kelp, algae or shellfish colonization could affect local carbon cycling.",
    detail:
      "Net sequestration has not been established and would require defined boundaries, sampling and independent analysis.",
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
        title="Measure Impact From the Baseline."
        copy="A balanced framework for evaluating the proposed environmental profile, potential development alignment and the monitoring required to establish project-level outcomes."
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
              Near-Zero Operation Is the Design Objective.
            </h2>
          </div>
          <div className="self-end">
            <p className="text-base leading-8 text-[#607780]">
              The proposed system is designed to generate without on-site fuel combustion. Project-specific lifecycle analysis will quantify construction materials, marine works, maintenance, electricity used for pumping and end-of-life impacts.
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
              <p className="eyebrow"><span />Design and Research Objective</p>
              <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">
                Net Positive Marine Infrastructure
              </h2>
            </div>
            <p className="self-end text-base leading-8 text-[#a9bbc1]">
              Net Positive Marine Infrastructure is a future design and measurement objective. Opportunities and adverse effects must be evaluated together, with project evidence establishing outcomes beyond design intent, analogous infrastructure and ecological plausibility.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div data-reveal>
              <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#68f5e1] uppercase">Established Design Mechanisms</small>
              <p className="mt-3 mb-5 text-sm leading-7 text-[#78969e]">Mechanisms that can be designed into a project without claiming that a Humpback installation has produced the intended benefit.</p>
              <div className="space-y-3">
              {establishedMechanisms.map((item) => (
                <details className="group border border-[#59acc2]/25 bg-[#082f40]/40 p-5" key={item.title}>
                  <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.025em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#59acc2]">
                    <span className="mr-3 inline-flex h-5 w-5 align-middle text-[#59acc2]"><Check /></span>{item.title}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#b3c8cd]">{item.summary}</p>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-6 text-[#78969e]">{item.detail}</p>
                </details>
              ))}
              </div>
            </div>

            <div data-reveal>
              <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#68f5e1] uppercase">Research Hypotheses</small>
              <p className="mt-3 mb-5 text-sm leading-7 text-[#78969e]">Plausible effects that require pilot-scale measurement and independent environmental study.</p>
              <div className="space-y-3">
              {researchHypotheses.map((item) => (
                <details className="group border border-[#59acc2]/25 bg-[#082f40]/40 p-5" key={item.title}>
                  <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.025em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#59acc2]">
                    <span className="mr-3 inline-flex h-5 w-5 align-middle text-[#59acc2]"><Plus /></span>{item.title}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#b3c8cd]">{item.summary}</p>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-6 text-[#78969e]">{item.detail}</p>
                </details>
              ))}
              </div>
            </div>
          </div>

          <div className="mt-14" data-reveal>
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-amber-200 uppercase">Material Risks Requiring Assessment</small>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
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
              Use the SDGs as a Planning and Measurement Framework.
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
          <div className="chapter-label light"><span>04</span>MONITORING &amp; ADAPTIVE MANAGEMENT</div>
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
