import type { Metadata } from "next";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";
import PartnerForm from "../components/PartnerForm";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "Explore pilot, investment, engineering and validation partnerships with Humpback Hydro.",
};

const pathways = [
  { id: "pilot", index: "01", label: "Pilot & Site Partners", title: "Create the First Operating Reference.", copy: "For utilities, governments, First Nations, data centers and land or marine-site partners prepared to evaluate a pilot opportunity.", subject: "Pilot or Site Opportunity" },
  { id: "investment", index: "02", label: "Capital Partners", title: "Fund the Transition from Engineering to Infrastructure.", copy: "For strategic investors, infrastructure funds, climate-finance organizations and project-finance partners.", subject: "Investment Partnership" },
  { id: "engineering", index: "03", label: "Engineering & Delivery", title: "Industrialize the Platform.", copy: "For engineering firms, manufacturers, EPC organizations, materials specialists and renewable-energy developers.", subject: "Engineering Partnership" },
  { id: "validation", index: "04", label: "Research & Validation", title: "Strengthen the Evidence Base.", copy: "For academic institutions, laboratories, technical advisors and independent validation organizations.", subject: "Technical Validation Partnership" },
];

export default function PartnersPage() {
  return (
    <main>
      <RouteHero index="05" eyebrow="Partnerships" title="Choose Your Role in What Comes Next." copy="Humpback Hydro is seeking the specific capital, sites, engineering resources and institutional partners required to advance toward pilot deployment." image="/island-energy-water.webp" nextHref="#pathways" nextLabel="Select a Partnership Pathway" />
      <section className="partner-pathways section-shell" id="pathways">
        <div className="chapter-label"><span>01</span>PARTNERSHIP PATHWAYS</div>
        <div className="section-intro split" data-reveal><div><p className="eyebrow dark"><span />The Next Operating Chapter</p><h2>A Different Conversation for Every Partner.</h2></div><p>Select the pathway that best matches your organization. Each action opens a direct, pre-addressed conversation with the Humpback Hydro team.</p></div>
        <div className="pathway-list">
          {pathways.map((pathway) => (
            <article key={pathway.id} id={pathway.id} data-reveal>
              <span>{pathway.index}</span><small>{pathway.label}</small><h3>{pathway.title}</h3><p>{pathway.copy}</p><a href={`mailto:info@humpbackenergy.com?subject=Humpback%20Hydro%20${encodeURIComponent(pathway.subject)}`}>Start This Conversation <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-terminal">
        <div className="section-shell">
          <div data-reveal><p className="eyebrow"><span />Direct Contact</p><h2>Bring the Right People into the Room.</h2><p>Share your organization, mandate, potential site or investment interest and the Humpback Hydro team can direct the conversation appropriately.</p><div className="terminal-data"><span>VANCOUVER, BC</span><span>ENERGY INFRASTRUCTURE</span><span>ENGINEERING VALIDATED</span><span>PILOT PARTNERS SOUGHT</span></div></div>
          <PartnerForm />
        </div>
      </section>
    </main>
  );
}
