import type { Metadata } from "next";
import RouteHero from "../components/RouteHero";
import { deliveryPartners, leadership } from "../data";

export const metadata: Metadata = {
  title: "Company",
  description: "Meet the Humpback Hydro leadership and delivery network advancing marine clean-energy infrastructure.",
};

export default function CompanyPage() {
  return (
    <main>
      <RouteHero index="04" eyebrow="Company" title="Built to Move Infrastructure." copy="An early-stage Vancouver energy company bringing together invention, operations, advanced materials, electrical engineering and industrial delivery." image="/manufacturing-campus.webp" nextHref="#leadership" nextLabel="Meet the Leadership" />
      <section className="company-story section-shell">
        <div className="chapter-label"><span>01</span>THE MISSION</div>
        <div className="story-statement" data-reveal><p>Ocean-powered infrastructure for</p><h2>Energy Security,<br />Water Security<br /><span>and Climate Resilience.</span></h2></div>
        <div className="story-columns" data-reveal><p>Humpback Hydro began in Vancouver, British Columbia, with a patented approach to marine pumped-hydro infrastructure.</p><p>The company is now seeking the capital, sites, engineering capacity and implementation partners required to advance from engineering validation toward pilot deployment.</p></div>
      </section>

      <section className="leadership-section" id="leadership">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>LEADERSHIP</div>
          <div className="leadership-list">
            {leadership.map((member, index) => (
              <article key={member.name} data-reveal>
                <span>0{index + 1}</span><div className="leader-image"><img src={member.image} alt={member.name} /></div><div><small>{member.role}</small><h3>{member.name}</h3><p>{member.focus}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-network section-shell">
        <div className="chapter-label"><span>03</span>DELIVERY NETWORK</div>
        <div className="section-intro split" data-reveal><div><p className="eyebrow dark"><span />Specialist Capability</p><h2>From Engineered Material to Operating Asset.</h2></div><p>The approved teaser identifies a delivery network spanning construction, advanced materials and electrical engineering.</p></div>
        <div className="network-list">
          {deliveryPartners.map((partner, index) => <article key={partner.name} data-reveal><span>0{index + 1}</span><small>{partner.discipline}</small><h3>{partner.name}</h3><p>{partner.organization}</p></article>)}
        </div>
      </section>
    </main>
  );
}
