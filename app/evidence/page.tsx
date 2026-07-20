import type { Metadata } from "next";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";
import { evidence } from "../data";

export const metadata: Metadata = {
  title: "Engineering Foundation",
  description: "Review Humpback Hydro's public patent record, company-stated engineering foundation and evidence status.",
};

export default function EvidencePage() {
  return (
    <main>
      <RouteHero index="03" eyebrow="Engineering Foundation" title="Evidence Before Scale." copy="The public record, company-stated validation and the information still required before commercial claims can be made." image="/turbine-macro.webp" nextHref="#vault" nextLabel="Open the Evidence Vault" />
      <section className="evidence-vault section-shell" id="vault">
        <div className="chapter-label"><span>01</span>CLAIMS REGISTER</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Institutional Diligence</p><h2>What Is Known. What Still Needs Proof.</h2></div>
          <p>Every material claim is presented according to its current evidence status. Supporting source packages will be added only when approved by Humpback Hydro.</p>
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

      <section className="claim-policy">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>PUBLICATION STANDARD</div>
          <div className="claim-policy-grid">
            <article data-reveal><span>01</span><h3>Verified and Publishable</h3><p>Claims supported by an authoritative public record or approved primary document.</p></article>
            <article data-reveal><span>02</span><h3>Company Stated</h3><p>Information appearing in approved company material that still requires a source package.</p></article>
            <article data-reveal><span>03</span><h3>Excluded</h3><p>Unverified performance, prototype, financial or commercial-readiness claims remain off the public site.</p></article>
          </div>
          <a className="button outline-light" href="mailto:info@humpbackenergy.com?subject=Humpback%20Hydro%20Technical%20Information">Request Technical Information <Arrow /></a>
        </div>
      </section>
    </main>
  );
}
