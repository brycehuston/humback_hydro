import ApplicationSelector from "./components/ApplicationSelector";
import { Arrow } from "./components/Icons";
import SystemExplorer from "./components/SystemExplorer";
import { evidence, roadmap } from "./data";

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
          <p className="eyebrow"><span />Patented Marine Pumped-Hydro Architecture</p>
          <h1><span>Energy</span><span>Re-Engineered</span><span>Around Water.</span></h1>
          <p className="hero-lede">
            Designed to store clean energy gravitationally and dispatch it for grids, industry, AI infrastructure and water systems.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#platform">See the Operating Cycle <Arrow direction="down" /></a>
            <a className="button secondary" href="/partners">Discuss a Pilot</a>
          </div>
        </div>

        <div className="hero-command" data-reveal>
          <div className="command-head"><span><i />SYSTEM MODEL</span><small>HH / 01</small></div>
          <div className="command-cycle" aria-label="Generate, store and dispatch cycle">
            <span><small>01</small>GENERATE</span><i /><span><small>02</small>STORE</span><i /><span><small>03</small>DISPATCH</span>
          </div>
          <div className="command-proof">
            <div><small>DEVELOPMENT STAGE</small><strong>Engineering Validated</strong></div>
            <div><small>INTELLECTUAL PROPERTY</small><strong>U.S. Patent 8823195 B2</strong></div>
          </div>
          <a href="/evidence">Interrogate the Evidence <Arrow /></a>
        </div>

        <div className="hero-side-label">VANCOUVER, BRITISH COLUMBIA <span>49.2827° N / 123.1207° W</span></div>
        <div className="hero-scroll"><span>SCROLL TO DESCEND</span><i /><Arrow direction="down" /></div>
        <span className="concept-tag">CONCEPT VISUALIZATION</span>
      </section>

      <section className="status-rail" aria-label="Humpback Hydro status">
        <div><span>01</span><strong>Patented Architecture</strong><small>U.S. 8823195 B2</small></div>
        <div><span>02</span><strong>Long-Duration Platform</strong><small>Generate. Store. Dispatch.</small></div>
        <div><span>03</span><strong>Pilot Pathway</strong><small>Strategic Partners Sought</small></div>
        <div><span>04</span><strong>Global Mission</strong><small>Energy. Water. Humanity.</small></div>
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
            <p className="eyebrow"><span />One Integrated Operating Cycle</p>
            <h2>Turn Water into Dependable Infrastructure.</h2>
            <p>Patented marine pumped-hydro architecture designed to capture energy, store it gravitationally and return power when demand requires it.</p>
          </div>
          <SystemExplorer />
        </div>
      </section>

      <section className="applications-section section-shell">
        <div className="chapter-label"><span>03</span>THE MARKETS</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Infrastructure Applications</p><h2>One Platform. Multiple Critical Systems.</h2></div>
          <p>Begin with the power bottleneck facing AI infrastructure. Expand through utilities, industry, island systems and water resilience.</p>
        </div>
        <ApplicationSelector />
      </section>

      <section className="evidence-preview">
        <div className="section-shell">
          <div className="chapter-label light"><span>04</span>THE FOUNDATION</div>
          <div className="evidence-lead" data-reveal>
            <p className="eyebrow"><span />Institutional Evidence</p>
            <h2>Belief Is Not Enough.<br />Open the Record.</h2>
            <p>Humpback Hydro is grounded in patented engineering, technical authorship, university evaluation and industry recognition.</p>
          </div>

          <div className="evidence-ledger">
            {evidence.map((item) => {
              const content = <><span>{item.index}</span><small>{item.category}</small><h3>{item.title}</h3><p>{item.status}</p><Arrow /></>;
              return item.href ? <a key={item.index} href={item.href} target="_blank" rel="noreferrer" data-reveal>{content}</a> : <div key={item.index} data-reveal>{content}</div>;
            })}
          </div>
          <a className="button outline-light" href="/evidence">Enter the Evidence Vault <Arrow /></a>
        </div>
      </section>

      <section className="roadmap-section section-shell">
        <div className="chapter-label"><span>05</span>THE PATHWAY</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Planned Deployment Roadmap</p><h2>From First Pilot to Industrialized Scale.</h2></div>
          <p>The approved company teaser sets out a phased manufacturing and deployment pathway. Each phase remains planned and subject to partner and company approval.</p>
        </div>
        <div className="roadmap-line">
          {roadmap.map((item) => (
            <article key={item.phase} data-reveal>
              <div className="roadmap-node"><span>{item.phase}</span><i /></div>
              <small>{item.label}</small><strong>{item.scale}</strong><h3>{item.title}</h3><p>{item.copy}</p>
            </article>
          ))}
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
            <h2>Build the First Deployment.</h2>
            <p>Humpback Hydro is seeking pilot sites, strategic capital, engineering capacity and implementation partners.</p>
            <div className="hero-actions"><a className="button energy" href="/partners">Choose Your Pathway <Arrow /></a><a className="button secondary" href="mailto:info@humpbackenergy.com">Contact the Team</a></div>
          </div>

          <div className="cta-visual" data-reveal>
            <img src="/grid-data-center-night.webp" alt="Concept visualization of a coastal data-center power campus" loading="lazy" decoding="async" />
            <div className="cta-visual-shade" />
            <div className="cta-sonar" aria-hidden="true"><i /><i /><i /><span /></div>
            <div className="cta-visual-status"><small>PILOT PATHWAY</small><strong>Strategic Partners Sought</strong></div>
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
