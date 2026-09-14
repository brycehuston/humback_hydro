import ApplicationSelector from "./components/ApplicationSelector";
import { pageMetadata } from "./page-metadata";
import { Arrow } from "./components/Icons";
import HomepageEconomics from "./components/HomepageEconomics";
import PremiumDigitalTwin from "./components/PremiumDigitalTwin";
import {
  engineeringPillars,
  evidence,
  roadmap,
  standards,
  standardsRoadmap,
} from "./data";

export const metadata = pageMetadata("/", "Modular Hydroelectric Infrastructure", "A Canadian energy technology company developing modular hydroelectric generation and long-duration energy storage infrastructure.");

export default function Home() {
  return (
    <main>
      <section className="home-hero" id="top">
        <img className="home-hero-image" src="/hero-ai-power-campus.webp" alt="Concept visualization of a coastal data-center and marine energy campus" fetchPriority="high" />
        <div className="hero-atmosphere" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-depth-rings" aria-hidden="true"><i /><i /><i /><span /></div>
        <div className="hero-water-scan" aria-hidden="true"><i /><i /></div>
        <div className="hero-copy" data-reveal>
          <p className="eyebrow"><span />Marine Pumped-Hydro Infrastructure</p>
          <h1 className="home-positioning-title"><span>Hydropower.</span>{" "}<span>Reimagined.</span></h1>
          <p className="hero-platform-line">Generation • Storage • Automated Dispatch</p>
          <p className="hero-lede">
            A Canadian energy technology company developing modular hydroelectric generation and long-duration energy storage infrastructure.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#platform">See the Operating Cycle <Arrow direction="down" /></a>
            <a className="button secondary" data-open-homepage-calculator href="#economics">Open Calculator <Arrow direction="down" /></a>
          </div>
        </div>

        <div className="hero-command" data-reveal>
          <div className="command-head"><span><i />SYSTEM MODEL</span><small>HH / 01</small></div>
          <div className="command-cycle" aria-label="Generate, store and dispatch cycle">
            <span><small>01</small>GENERATE</span><i /><span><small>02</small>STORE</span><i /><span><small>03</small>DISPATCH</span>
          </div>
          <div className="command-proof">
            <div><small>TECHNICAL FOUNDATION</small><strong>IEEE-Published Architecture</strong></div>
            <div><small>PUBLIC PATENT RECORD</small><strong>U.S. Patent 8823195 B2</strong></div>
          </div>
          <a href="/evidence">Review the Evidence <Arrow /></a>
        </div>

        <div className="hero-side-label">VANCOUVER, BRITISH COLUMBIA <span>49.2827° N / 123.1207° W</span></div>
        <div className="hero-scroll"><span>SCROLL TO DESCEND</span><i /><Arrow direction="down" /></div>
        <span className="concept-tag">CONCEPT VISUALIZATION</span>
      </section>

      <section className="status-rail" aria-label="Humpback Hydro status">
        <div><span>01</span><strong>Public Patent Record</strong><small>U.S. 8823195 B2</small></div>
        <div><span>02</span><strong>Long-Duration Platform</strong><small>Generate. Store. Dispatch.</small></div>
        <div><span>03</span><strong>Validation &amp; Pilot Pathway</strong><small>Partner Engagement Pathway</small></div>
        <div><span>04</span><strong>Evidence-Led Development</strong><small>Validate Before Scale</small></div>
      </section>

      <section className="thesis-section section-shell">
        <div className="chapter-label"><span>01</span>THE CONSTRAINT</div>
        <div className="thesis-grid">
          <div data-reveal>
            <p className="eyebrow dark"><span />The Speed-to-Power Problem</p>
            <h2>The AI Race Is Becoming a Power Race.</h2>
          </div>
          <div className="thesis-copy" data-reveal>
            <p>
              Compute campuses are being designed faster than transmission and interconnection infrastructure can be delivered. Reliable power is no longer a utility detail. It is a strategic constraint.
            </p>
            <a className="text-link" href="/applications">See Where Humpback Fits <Arrow /></a>
          </div>
        </div>

        <div className="constraint-sequence">
          <article data-reveal><span>DEMAND</span><h3>AI Infrastructure Expands</h3><p>High-density compute creates persistent, mission-critical power requirements.</p></article>
          <i aria-hidden="true" />
          <article data-reveal><span>FRICTION</span><h3>Grid Timelines Stretch</h3><p>Interconnection queues and transmission constraints slow deployment.</p></article>
          <i aria-hidden="true" />
          <article data-reveal><span>RESPONSE</span><h3>Power Moves Closer</h3><p>Modular generation and storage create a new infrastructure pathway.</p></article>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>THE PLATFORM</div>
          <div className="section-intro inverse" data-reveal>
            <p className="eyebrow"><span />Static Offshore Pumped Hydro</p>
            <h2>See the Complete Water Cycle.</h2>
            <p>A fixed offshore structure places two engineered reservoirs vertically inside one cutaway system. Follow how it stores energy and generates through two turbine stages.</p>
          </div>
          <PremiumDigitalTwin />
        </div>
      </section>

      <HomepageEconomics />

      <section className="applications-section section-shell">
        <div className="chapter-label"><span>04</span>THE MARKETS</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Infrastructure Applications</p><h2>One Platform. Multiple Critical Systems.</h2></div>
          <p>Begin with the power bottleneck facing AI infrastructure. Expand through utilities, industry, island systems and water resilience.</p>
        </div>
        <ApplicationSelector />
      </section>

      <section className="evidence-preview">
        <div className="section-shell">
          <div className="chapter-label light"><span>05</span>THE FOUNDATION</div>
          <div className="evidence-lead" data-reveal>
            <p className="eyebrow"><span />Institutional Evidence</p>
            <h2>Evidence You Can Examine.<br />Open the Record.</h2>
            <p>Humpback Hydro&apos;s public foundation includes a patent record, an IEEE-published architecture and university proof-of-concept studies. Modeled results are presented within their source-specific boundaries.</p>
          </div>

          <div className="evidence-ledger">
            {evidence.map((item) => {
              const content = <><span>{item.index}</span><small>{item.category}</small><h3>{item.title}</h3><p>{item.status}</p><Arrow /></>;
              return item.href ? <a key={item.index} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} data-reveal>{content}</a> : <div key={item.index} data-reveal>{content}</div>;
            })}
          </div>
          <a className="button outline-light" href="/evidence">Review the Evidence <Arrow /></a>
        </div>
      </section>

      <section className="roadmap-section section-shell">
        <div className="chapter-label"><span>06</span>THE PATHWAY</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Evidence-Controlled Development</p><h2>Engineering &amp; Operational Roadmap</h2></div>
          <p>Humpback Hydro is advancing from its documented patent, publication and study foundation toward independent engineering validation and pilot deployment. An approved roadmap and supporting technical basis will define commercial scale, manufacturing configuration and timing.</p>
        </div>
        <div className="roadmap-line">
          {roadmap.map((item) => (
            <article key={item.phase} data-reveal>
              <div className="roadmap-node"><span>{item.phase}</span><i /></div>
              <small>{item.label}</small><strong>{item.status}</strong><h3>{item.title}</h3><p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="standards-section">
        <div className="section-shell">
          <div className="chapter-label light"><span>07</span>INSTITUTIONAL READINESS</div>
          <div className="section-intro split inverse" data-reveal>
            <div><p className="eyebrow"><span />Proposed Framework</p><h2>Standards Roadmap</h2></div>
            <div>
              <p>This source-defined roadmap is a proposal and has not been formally approved. It does not represent current compliance, implemented management systems or certification.</p>
              <p className="standards-source-note">The source labels Phase 1 as “Current.” That label is preserved for fidelity to the proposal and is not evidence that its activities are underway.</p>
            </div>
          </div>

          <div className="standards-roadmap" data-reveal>
            {standardsRoadmap.map((item) => (
              <article key={item.phase}>
                <small>{item.phase} · {item.sourceLabel}</small>
                <h3>{item.title}</h3>
                <ul>
                  {item.actions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <div className="standards-register" data-reveal>
            <div>
              <small>Standards Named in the Proposal</small>
              <div className="standards-list">
                {standards.map((standard) => <span key={standard}>{standard}</span>)}
              </div>
            </div>
            <div>
              <small>Core Engineering Pillars</small>
              <ol className="pillars-list">
                {engineeringPillars.map((pillar) => <li key={pillar}>{pillar}</li>)}
              </ol>
              <p className="standards-source-note">The pillars are source-defined organizing concepts, not evidence of formal adoption or conformity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="industrial-break">
        <img src="/manufacturing-campus.webp" alt="Concept visualization of modular hydro infrastructure manufacturing" loading="lazy" decoding="async" />
        <div className="industrial-overlay" />
        <div className="industrial-copy" data-reveal>
          <p className="eyebrow"><span />Designed for Industrialization</p>
          <h2>The Invention Is Only the Beginning.</h2>
          <p>The ambition is a repeatable infrastructure platform supported by engineering, manufacturing and deployment partners.</p>
          <a className="text-link light" href="/company">Meet the Delivery Network <Arrow /></a>
        </div>
        <span className="concept-tag">CONCEPT VISUALIZATION</span>
      </section>

      <section className="final-cta">
        <div className="final-cta-main">
          <div className="final-cta-copy" data-reveal>
            <p className="eyebrow"><span />The Next Operating Chapter</p>
            <h2>Advance the First Pilot.</h2>
            <p>Humpback Hydro is engaging strategic partners for validation and pilot deployment across pilot sites, capital, engineering and independent review.</p>
            <div className="hero-actions"><a className="button energy" href="/partners">Choose Your Pathway <Arrow /></a><a className="button secondary" href="mailto:info@humpbackenergy.com">Contact the Team</a></div>
          </div>

          <div className="cta-visual" data-reveal>
            <img src="/grid-data-center-night.webp" alt="Concept visualization of a coastal data-center power campus" loading="lazy" decoding="async" />
            <div className="cta-visual-shade" />
            <div className="cta-sonar" aria-hidden="true"><i /><i /><i /><span /></div>
            <div className="cta-visual-status"><small>VALIDATION &amp; PILOT PATHWAY</small><strong>Qualified Partner Engagement</strong></div>
            <span className="concept-tag">CONCEPT VISUALIZATION</span>
          </div>
        </div>

        <div className="cta-pathways" aria-label="Partnership pathways">
          <a href="/partners#pilot"><span>01</span><div><small>PILOT & SITES</small><strong>Build an Operating Reference</strong></div><Arrow /></a>
          <a href="/partners#investment"><span>02</span><div><small>STRATEGIC CAPITAL</small><strong>Fund the Next Operating Chapter</strong></div><Arrow /></a>
          <a href="/partners#engineering"><span>03</span><div><small>ENGINEERING</small><strong>Industrialize the Platform</strong></div><Arrow /></a>
        </div>
      </section>
    </main>
  );
}
