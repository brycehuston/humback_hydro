import type { CSSProperties } from "react";
import type { Metadata } from "next";
import MarkLegacyBio from "../components/MarkLegacyBio";
import RouteHero from "../components/RouteHero";
import { deliveryPartners, leadership } from "../data";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Meet the Humpback Hydro leadership and delivery network advancing marine clean-energy infrastructure.",
};

const publishedLeadership = leadership.filter(
  (member) =>
    member.publicationStatus === "published-qualified" ||
    member.publicationStatus === "confirmed",
);

function initials(name: string) {
  return name
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CompanyPage() {
  return (
    <main>
      <RouteHero
        index="06"
        eyebrow="Company"
        title="Built to Move Infrastructure."
        copy="Founded in Vancouver, British Columbia, Humpback Hydro is a Canadian energy infrastructure technology company advancing a hydroelectric generation and long-duration energy-storage architecture documented in U.S. Patent No. 8,823,195 B2."
        image="/manufacturing-campus.webp"
        nextHref="#leadership"
        nextLabel="Meet the Leadership"
      />

      <section className="company-story section-shell">
        <div className="chapter-label">
          <span>01</span>POSITIONING
        </div>
        <div className="story-statement" data-reveal>
          <p>Purpose</p>
          <h2>
            Engineering Infrastructure
            <br /><span>That Powers Humanity.</span>
          </h2>
        </div>
        <div className="mt-12 border border-[#061c28]/15 bg-white/55 p-6 md:p-8" data-reveal>
          <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Development Stage</small>
          <p className="mt-3 text-xl font-medium leading-8 text-[#061c28]">Advancing Toward Independent Engineering Validation and Pilot Deployment.</p>
        </div>
        <div className="story-columns" data-reveal>
          <div>
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Mission</small>
            <p className="mt-4">
              To advance reliable, dispatchable hydroelectric infrastructure that strengthens energy security, supports water resilience and improves climate resilience through engineering excellence, strategic partnerships and long-term operational stewardship.
            </p>
          </div>
          <div>
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#168da8] uppercase">Vision</small>
            <p className="mt-4">
              A future in which communities and critical infrastructure can access reliable clean energy and resilient water systems.
            </p>
          </div>
        </div>
      </section>

      <section className="leadership-section" id="leadership">
        <div className="section-shell">
          <div className="chapter-label light">
            <span>02</span>LEADERSHIP
          </div>

          <p className="mb-10 max-w-3xl border-l-2 border-[#59acc2] pl-5 text-sm leading-7 text-[#8ca7af]" data-reveal>
            Leadership titles, roles and career summaries are company supplied and remain subject to source confirmation unless linked to a verified public record. Production renders published profiles only.
          </p>

          <div className="leadership-list">
            {publishedLeadership.map((member, index) => (
              <article key={member.name} data-reveal>
                <span>0{index + 1}</span>
                <div className="leader-image">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.imageAlt}
                      style={{ objectPosition: member.imagePosition }}
                    />
                  ) : (
                    <span
                      className="leader-monogram"
                      role="img"
                      aria-label={`Portrait placeholder for ${member.name}`}
                    >
                      {member.initials ?? initials(member.name)}
                    </span>
                  )}
                </div>
                <div>
                  <small className="uppercase tracking-wider">{member.role}</small>
                  <h3 className="tracking-widest">{member.name}</h3>
                  <p>{member.focus}</p>
                </div>
              </article>
            ))}
          </div>

          <MarkLegacyBio />
        </div>
      </section>

      <section className="delivery-network section-shell">
        <div className="chapter-label">
          <span>03</span>DELIVERY NETWORK
        </div>
        <div className="section-intro split" data-reveal>
          <div>
            <p className="eyebrow dark">
              <span />
              Specialist Capability
            </p>
            <h2>From Engineered Material to Operating Asset.</h2>
          </div>
          <p>
            Company-supplied materials identify specialist capability spanning
            construction, advanced materials and electrical engineering. Names,
            roles, organizations and public-use approval remain subject to
            confirmation.
          </p>
        </div>
        <div className="network-list">
          {deliveryPartners.map((partner, index) => (
            <article key={partner.name} data-reveal>
              <span>0{index + 1}</span>
              <small>{partner.discipline}</small>
              <div className="network-portrait">
                {partner.image ? (
                  <img
                    src={partner.image}
                    alt={partner.imageAlt}
                    style={
                      { objectPosition: partner.imagePosition } as CSSProperties
                    }
                  />
                ) : (
                  <span
                    className="leader-monogram"
                    role="img"
                    aria-label={`Portrait placeholder for ${partner.name}`}
                  >
                    {partner.initials ?? initials(partner.name)}
                  </span>
                )}
              </div>
              <h3>{partner.name}</h3>
              <p>{partner.organization}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
