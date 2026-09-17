import { pageMetadata } from "../page-metadata";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";
import { evidence } from "../data";
import { ieeeCitation, studyEvidence } from "../opsh-data";

export const metadata = pageMetadata("/evidence", "Engineering Foundation", "Review Humpback Hydro's public patent record, IEEE publication and qualified university proof-of-concept study results.");

const evidenceHierarchy = [
  ["01", "Public Patent Record", "An attributable legal record confirming the published patent document and its stated scope."],
  ["02", "Peer-Reviewed IEEE Conference Paper", "The existing IEEE conference paper is peer reviewed; publication remains distinct from validation of an operating facility."],
  ["03", "University Engineering Study", "Academic calculations or design work published with its configuration, assumptions and limitations."],
  ["04", "Company Record in Verification", "Company-supplied information progressing through primary-source confirmation before unqualified publication."],
  ["05", "Independent Third-Party Qualification", "Reserved for completed external review or testing with a defined scope, methodology, limitations and attributable report."],
] as const;

export default function EvidencePage() {
  return (
    <main>
      <RouteHero index="05" eyebrow="Engineering Foundation" title="Evidence Before Scale." copy="A structured view of the public record, modeled study results and the validation pathway supporting engineering and commercial advancement." image="/turbine-macro-approved.jpg" nextHref="#vault" nextLabel="Open the Evidence Vault" />
      <section className="evidence-vault section-shell" id="vault">
        <div className="chapter-label"><span>01</span>CLAIMS REGISTER</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Institutional Diligence</p><h2>The Record Today. The Validation Path Ahead.</h2></div>
          <p>Each item in this register is tied to its current evidence status. Modeled results are informing the engineering validation program and remain distinct from measured operating output or completed independent validation.</p>
        </div>

        <div className="vault-list">
          {evidence.map((item) => (
            <article key={item.index} data-reveal>
              <span>{item.index}</span>
              <div><small className="titanium-microtype titanium-microtype--ink">{item.category}</small><h3>{item.title}</h3><p>{item.description}</p></div>
              <div className={`claim-status ${item.statusTone}`}><i />{item.status}</div>
              {item.href ? (
                <a
                  aria-label={item.action}
                  href={item.href}
                  rel={item.external ? "noreferrer" : undefined}
                  target={item.external ? "_blank" : undefined}
                >
                  <Arrow />
                </a>
              ) : <span className="locked">{item.action}</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="study-record" id="technical-study-record">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>TECHNICAL STUDY RECORD</div>
          <div className="section-intro split inverse" data-reveal>
            <div><p className="eyebrow"><span />Separate Designs, Separate Results</p><h2>Evidence With Its Boundaries Intact.</h2></div>
            <p>The 2015, 2022 and 2024 documents analyze different design iterations. Their dimensions and performance figures are not blended into one claimed facility.</p>
          </div>
          <div className="study-grid">
            {studyEvidence.map((item) => (
              <article key={item.index} data-reveal tabIndex={0}>
                <div className="study-head"><span>{item.index}</span><small className="titanium-microtype">{item.year} · {item.source}</small></div>
                <h3>{item.title}</h3>
                <p>{item.result}</p>
                <div className="study-limit"><small className="titanium-microtype">LIMITATION</small><span>{item.limitation}</span></div>
                {item.href ? (
                  <a className="text-link light" href={item.href} target="_blank" rel="noreferrer">
                    {item.linkLabel} <Arrow />
                  </a>
                ) : <span className="study-summary-label">STATIC-ONLY PUBLIC SUMMARY</span>}
              </article>
            ))}
          </div>
          <div className="ieee-citation" data-reveal>
            <small className="titanium-microtype">COMPLETE IEEE CITATION</small>
            <p>{ieeeCitation}</p>
            <div>
              <a href="https://doi.org/10.1109/EESAT59125.2024.10471215" target="_blank" rel="noreferrer">
                DOI 10.1109/EESAT59125.2024.10471215
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell surface-mineral">
        <div className="chapter-label"><span>03</span>VALIDATION AND ASSURANCE</div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div data-reveal>
            <p className="eyebrow dark"><span />What Comes Next</p>
            <h2 className="section-title mt-7">
              A Roadmap Toward Independent Assurance.
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
          This section presents an assurance pathway; it does not represent an approved standards roadmap or claim ISO, IEC, IEEE, NERC or other certification or compliance status.
        </p>
      </section>

      <section className="claim-policy">
        <div className="section-shell">
          <div className="chapter-label light"><span>04</span>EVIDENCE HIERARCHY</div>
          <div className="claim-policy-grid evidence-spine evidence-hierarchy-sequence" data-reveal>
            {evidenceHierarchy.map(([index, title, copy]) => (
              <article key={index}>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <a className="button outline-light" href="mailto:info@humpbackenergy.com?subject=Humpback%20Hydro%20Technical%20Information">Request Technical Information <Arrow /></a>
        </div>
      </section>
    </main>
  );
}
