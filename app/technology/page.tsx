import { pageMetadata } from "../page-metadata";
import RouteHero from "../components/RouteHero";
import OpshExperience from "../components/OpshExperience";
import { Arrow } from "../components/Icons";

export const metadata = pageMetadata("/technology", "Technology", "Explore Humpback Hydro's modular energy-transfer platform, integrated hydraulic system and internally created elevation.");

export default function TechnologyPage() {
  return (
    <main className="technology-page">
      <RouteHero index="01" eyebrow="Technology" title="Elevation, Engineered Within." copy="A modular energy-transfer platform that receives, stores, generates and dispatches electricity through an integrated hydraulic system—creating the required elevation internally rather than relying on mountainous terrain." image="/ocean-infrastructure-approved.jpg" nextHref="#operating-cycle" nextLabel="Enter the Operating Cycle" />
      <section className="route-intro section-shell" id="operating-cycle">
        <div className="chapter-label"><span>01</span>OPERATING PRINCIPLE</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Interactive Static Structure</p><h2>Store. Generate. Reset.</h2></div>
          <p>Explore the composite concept model, reveal its internal components and follow the source-supported water paths. The model explains the architecture and is not to scale.</p>
        </div>
        <OpshExperience variant="explorer" />
      </section>

      <section className="technical-anatomy">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>SYSTEM ANATOMY</div>
          <div className="anatomy-grid">
            <div className="anatomy-visual" data-reveal><img src="/turbine-macro.webp" alt="Conceptual technology illustration of reversible hydro machinery" loading="lazy" decoding="async" /><span className="concept-tag">CONCEPTUAL TECHNOLOGY ILLUSTRATION — NOT TO SCALE</span></div>
            <div className="anatomy-list">
              <article data-reveal><span>01</span><div><small>STORAGE</small><h3>Two Engineered Reservoirs</h3><p>Upper and lower reservoirs create vertical separation inside the fixed structure.</p></div></article>
              <article data-reveal><span>02</span><div><small>GENERATION</small><h3>Bilateral Turbine Stages</h3><p>The concept model shows paired upper and lower turbine paths without asserting final equipment count or scale.</p></div></article>
              <article data-reveal><span>03</span><div><small>TRANSFER</small><h3>Dedicated Penstocks</h3><p>Upper and lower hydraulic paths control flow through their respective turbine stages.</p></div></article>
              <article data-reveal><span>04</span><div><small>STORAGE CYCLE</small><h3>Lower Pump Array</h3><p>Pumps return water to the upper reservoir when energy is available for storage.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="principles section-shell">
        <div className="chapter-label"><span>03</span>DESIGN PRINCIPLES</div>
        <div className="principle-list">
          <article data-reveal><span>01</span><h3>Integrated Elevation</h3><p>The modular structure creates the required vertical separation within the hydraulic system.</p></article>
          <article data-reveal><span>02</span><h3>Gravitational Storage</h3><p>Stores energy by lifting water rather than relying on electrochemical storage media.</p></article>
          <article data-reveal><span>03</span><h3>Two-Stage Generation</h3><p>Uses separate upper and lower flow paths to drive two turbine stages during generation.</p></article>
          <article data-reveal><span>04</span><h3>Site-Specific Engineering</h3><p>Materials, intake screening, foundations and environmental performance require detailed site validation.</p></article>
        </div>
        <div className="hero-actions">
          <a className="button primary" href="/evidence">Review the Engineering Foundation <Arrow /></a>
          <a className="text-link" href="/impact">Review Potential Impact <Arrow /></a>
        </div>
      </section>
    </main>
  );
}
