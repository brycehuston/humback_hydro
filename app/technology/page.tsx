import type { Metadata } from "next";
import RouteHero from "../components/RouteHero";
import SystemExplorer from "../components/SystemExplorer";
import { Arrow } from "../components/Icons";

export const metadata: Metadata = {
  title: "Technology",
  description: "Explore Humpback Hydro's patented marine pumped-hydro operating architecture and planned modular platform.",
};

export default function TechnologyPage() {
  return (
    <main>
      <RouteHero index="01" eyebrow="Technology" title="Energy Held in Motion." copy="A patented marine pumped-hydro architecture designed to combine generation, long-duration storage and dispatchable power in one modular platform." image="/system-cutaway.webp" nextHref="#operating-cycle" nextLabel="Enter the Operating Cycle" />
      <section className="route-intro section-shell" id="operating-cycle">
        <div className="chapter-label"><span>01</span>OPERATING PRINCIPLE</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />The Complete Cycle</p><h2>Capture. Store. Dispatch. Repeat.</h2></div>
          <p>The system uses water and elevation to store energy as gravitational potential, then returns that energy through a reversible turbine when dependable power is required.</p>
        </div>
        <SystemExplorer />
      </section>

      <section className="technical-anatomy">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>SYSTEM ANATOMY</div>
          <div className="anatomy-grid">
            <div className="anatomy-visual" data-reveal><img src="/turbine-macro.webp" alt="Concept visualization of a reversible hydro turbine" loading="lazy" decoding="async" /><span className="concept-tag">CONCEPT VISUALIZATION</span></div>
            <div className="anatomy-list">
              <article data-reveal><span>01</span><div><small>STORAGE</small><h3>Upper Reservoir</h3><p>Holds elevated water as gravitational potential energy.</p></div></article>
              <article data-reveal><span>02</span><div><small>CONVERSION</small><h3>Reversible Pump Turbine</h3><p>Moves water into storage and returns power during discharge.</p></div></article>
              <article data-reveal><span>03</span><div><small>TRANSFER</small><h3>Engineered Conduit</h3><p>Creates the controlled hydraulic pathway between reservoirs.</p></div></article>
              <article data-reveal><span>04</span><div><small>FOUNDATION</small><h3>Marine Environment</h3><p>Uses an ocean, lake or bay as part of the system architecture.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="principles section-shell">
        <div className="chapter-label"><span>03</span>DESIGN PRINCIPLES</div>
        <div className="principle-list">
          <article data-reveal><span>01</span><h3>Dispatchability</h3><p>Designed to provide power when infrastructure needs it, not only when generation is available.</p></article>
          <article data-reveal><span>02</span><h3>Long Duration</h3><p>Gravitational storage architecture intended for extended energy-management requirements.</p></article>
          <article data-reveal><span>03</span><h3>Modularity</h3><p>A phased delivery concept intended to align infrastructure capacity with customer demand.</p></article>
          <article data-reveal><span>04</span><h3>Industrialization</h3><p>A planned pathway toward repeatable manufacturing and deployment.</p></article>
        </div>
        <a className="button primary" href="/evidence">Review the Engineering Foundation <Arrow /></a>
      </section>
    </main>
  );
}
