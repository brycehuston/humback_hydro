import type { Metadata } from "next";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";
import { evidence } from "../data";
import { ieeeCitation, studyEvidence } from "../opsh-data";

export const metadata: Metadata = {
  title: "Engineering Foundation",
  description: "Review Humpback Hydro's public patent record, IEEE publication and qualified university proof-of-concept study results.",
};

export default function EvidencePage() {
  return (
    <main>
      <RouteHero index="05" eyebrow="Engineering Foundation" title="Evidence Before Scale." copy="The public record, modeled study results and the limitations that still apply before operating or commercial claims can be made." image="/turbine-macro.webp" nextHref="#vault" nextLabel="Open the Evidence Vault" />
      <section className="evidence-vault section-shell" id="vault">
        <div className="chapter-label"><span>01</span>CLAIMS REGISTER</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Institutional Diligence</p><h2>What Is Known. What Still Needs Proof.</h2></div>
          <p>Every material claim is presented according to its current evidence status. Modeled results are not represented as measured output, an operating facility or independent engineering validation.</p>
        </div>

        <div className="vault-list">
          {evidence.map((item) => (
            <article key={item.index} data-reveal>
              <span>{item.index}</span>
              <div><small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p></div>
              <div className={`claim-status ${item.status.toLowerCase().includes("pending") ? "pending" : "verified"}`}><i />{item.status}</div>
              {item.href ? <a href={item.href} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}><Arrow /></a> : <span className="locked">SOURCE PENDING</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="study-record">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>TECHNICAL STUDY RECORD</div>
          <div className="section-intro split inverse" data-reveal>
            <div><p className="eyebrow"><span />Separate Designs, Separate Results</p><h2>Evidence With Its Boundaries Intact.</h2></div>
            <p>The 2015, 2022 and 2024 documents analyze different design iterations. Their dimensions and performance figures are not blended into one claimed facility.</p>
          </div>
          <div className="study-grid">
            {studyEvidence.map((item) => (
              <article key={item.index} data-reveal>
                <div className="study-head"><span>{item.index}</span><small>{item.year} · {item.source}</small></div>
                <h3>{item.title}</h3>
                <p>{item.result}</p>
                <div className="study-limit"><small>LIMITATION</small><span>{item.limitation}</span></div>
                {item.href ? (
                  <a className="text-link light" href={item.href} target="_blank" rel="noreferrer">
                    {item.linkLabel} <Arrow />
                  </a>
                ) : <span className="study-summary-label">STATIC-ONLY PUBLIC SUMMARY</span>}
              </article>
            ))}
          </div>
          <div className="ieee-citation" data-reveal>
            <small>COMPLETE IEEE CITATION</small>
            <p>{ieeeCitation}</p>
            <div>
              <a href="https://doi.org/10.1109/EESAT59125.2024.10471215" target="_blank" rel="noreferrer">
                DOI 10.1109/EESAT59125.2024.10471215
              </a>
              <a href="https://ieeexplore.ieee.org/document/10471215" target="_blank" rel="noreferrer">
                Official IEEE Record <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[var(--ice)]">
        <div className="chapter-label"><span>03</span>VALIDATION AND ASSURANCE</div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark"><span />What Comes Next</p>
            <h2 className="text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.06em] text-[#061c28]">
              A Roadmap for Assurance, Not a Claim of Compliance.
            </h2>
            <p className="mt-7 text-base leading-8 text-[#607780]">
              Applicable standards, regulatory requirements and design criteria must be determined by qualified engineers, authorities and system operators for each jurisdiction and site.
            </p>
          </div>
          <div className="border-t border-[#061c28]/15" data-reveal>
            {[
              ["01", "Independent Engineering", "Structural, hydraulic, mechanical, electrical and constructability review with defined scope, assumptions and limitations."],
              ["02", "Site and Environmental Baseline", "Geotechnical, hydrodynamic, biological and lifecycle assessment before project-level impact claims."],
              ["03", "Grid and Operational Integration", "Interconnection, controls, protection, cybersecurity and market-service requirements determined for the actual system."],
              ["04", "Project and Commercial Diligence", "Validated capital, operating, financing, schedule and risk inputs before forecast or commercial-readiness claims."],
            ].map(([index, title, copy]) => (
              <article className="grid gap-4 border-b border-[#061c28]/15 py-6 sm:grid-cols-[42px_1fr]" key={index}>
                <span className="font-mono text-xs font-semibold text-[#168da8]">{index}</span>
                <div><h3 className="text-xl font-medium tracking-[-0.03em] text-[#061c28]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#607780]">{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-10 border-l-2 border-[#168da8] pl-5 text-sm leading-7 text-[#607780]" data-reveal>
          No standards roadmap is represented as approved. No ISO, IEC, IEEE, NERC or other certification or compliance status is claimed by this section.
        </p>
      </section>

      <section className="claim-policy">
        <div className="section-shell">
          <div className="chapter-label light"><span>04</span>PUBLICATION STANDARD</div>
          <div className="claim-policy-grid">
            <article data-reveal><span>01</span><h3>Verified and Publishable</h3><p>Claims supported by an authoritative public record or approved primary document.</p></article>
            <article data-reveal><span>02</span><h3>Provisional</h3><p>Qualified modeled results and company information that still require confirmation or independent review.</p></article>
            <article data-reveal><span>03</span><h3>Internal Only</h3><p>Unapproved performance, prototype, financial and commercial-readiness claims remain off the public site.</p></article>
          </div>
          <a className="button outline-light" href="mailto:info@humpbackenergy.com?subject=Humpback%20Hydro%20Technical%20Information">Request Technical Information <Arrow /></a>
        </div>
      </section>
    </main>
  );
}
