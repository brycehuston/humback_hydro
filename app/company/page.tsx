import { pageMetadata } from "../page-metadata";
import CompanyBiography from "../components/CompanyBiography";
import MarkLegacyBio from "../components/MarkLegacyBio";
import RouteHero from "../components/RouteHero";
import { deliveryCapabilities, deliveryPartners, leadership } from "../data";

export const metadata = pageMetadata("/company", "Company", "Meet the Humpback Hydro leadership and the capability pathway supporting marine energy-infrastructure development.");

const publishedLeadership = leadership.filter(
  (member) =>
    member.publicationStatus === "published-qualified" ||
    member.publicationStatus === "confirmed",
);

const bryanGreen = leadership.find((member) => member.name.includes("Bryan Green"));
const bryceHuston = leadership.find((member) => member.name === "Bryce Huston");

function LeadershipName({ name }: { name: string }) {
  if (name === "Col. Bryan Green (Ret.)") {
    return (
      <span className="leadership-name-inline">
        Col. Bryan Green{" "}
        <span className="leadership-name-suffix">(Ret.)</span>
      </span>
    );
  }

  return name;
}

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
        title="Built by People Who Build Infrastructure"
        copy="Founded in Vancouver, British Columbia, Humpback Hydro brings practical construction, engineering, operations and digital-infrastructure experience to a modular hydroelectric generation and energy-storage technology."
        image="/company/humpback-team-vancouver.webp"
        imagePosition="80% center"
        imageAlt="Humpback Hydro team members meeting in Vancouver beside the British Columbia flag"
        mediaLabel="PROJECT PHOTOGRAPH"
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
            Published leadership profiles use company-supplied titles, roles and career summaries. Verified public records are linked where available, and publication remains governed by the project&apos;s evidence controls.
          </p>

          <div className="leadership-list">
            {publishedLeadership.map((member, index) => (
              <article key={member.name} data-reveal>
                <span>0{index + 1}</span>
                <div className="leader-image" style={{ "--leader-bg": member.imageBg || "radial-gradient(circle at 50% 35%, #164658, #08232f 70%)" } as React.CSSProperties}>
                  {member.image ? (
                    <img
                      src={member.image}
                      loading="lazy"
                      decoding="async"
                      alt={member.imageAlt}
                      style={{
                        objectPosition: member.imagePosition,
                        "--base-scale": member.imageScale || 0.88,
                        "--hover-scale": member.imageHoverScale || 0.90
                      } as React.CSSProperties}
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
                  <h3 className="tracking-widest">
                    <LeadershipName name={member.name} />
                  </h3>
                  <p>{member.focus}</p>
                </div>
              </article>
            ))}
          </div>

          {bryanGreen?.biography ? (
            <section className="mt-16 border-t border-white/15 pt-12 md:mt-24 md:pt-16" aria-labelledby="bryan-green-profile" data-reveal>
              <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20">
                <div className="self-start lg:sticky lg:top-28">
                  <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">Operations &amp; Infrastructure Profile</small>
                  <h2 className="mt-5 text-[clamp(3rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.06em] text-white" id="bryan-green-profile">
                    <LeadershipName name="Col. Bryan Green (Ret.)" />
                  </h2>
                  <div className="mt-8 border border-[#59acc2]/25 bg-[#082f40]/45 p-5">
                    <small className="font-mono text-[0.64rem] font-semibold tracking-[0.14em] text-[#78969e] uppercase">
                      Former Command
                    </small>
                    <span className="mt-2 block text-base font-semibold text-white">
                      U.S. Army Corps of Engineers
                    </span>
                    <span className="mt-1 block text-sm text-[#83c4d2]">
                      Retired Colonel and Former Commander
                    </span>
                  </div>
                </div>
                <CompanyBiography id="bryan-green-biography" paragraphs={bryanGreen.biography} className="grid gap-6 text-[0.95rem] leading-8 text-[#a9bbc1]" />
              </div>
            </section>
          ) : null}

          {bryceHuston?.biography ? (
            <section className="bryce-profile mt-16 border-t border-white/15 pt-12 md:mt-24 md:pt-16" aria-labelledby="bryce-huston-profile" data-reveal>
              <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20">
                <div className="self-start lg:sticky lg:top-28">
                  <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">{bryceHuston.profileLabel}</small>
                  <h2 className="mt-5 text-[clamp(3rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.06em] text-white" id="bryce-huston-profile">{bryceHuston.name}</h2>
                  <p className="mt-5 text-base leading-7 text-[#83c4d2]">{bryceHuston.specialty}</p>
                  <div className="mt-8 border border-[#59acc2]/25 bg-[#082f40]/45 p-5">
                    <small className="font-mono text-[0.64rem] font-semibold tracking-[0.14em] text-[#78969e] uppercase">
                      {bryceHuston.credentialLabel}
                    </small>
                    <div className="mt-3.5 flex flex-wrap gap-2.5 -ml-3">
                      {(Array.isArray(bryceHuston.credentialValue) ? bryceHuston.credentialValue : [bryceHuston.credentialValue]).map((company, index) => {
                        if (company === "Alpha Alerts") {
                          return (
                            <a
                              key={index}
                              href="https://alphaalerts.dev/"
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[0.85rem] font-medium text-[#9caeb4] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-[#d3e3e8] outline-none focus-visible:ring-2 focus-visible:ring-[#59acc2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#082f40]"
                            >
                              {company}
                            </a>
                          );
                        }
                        if (company === "FruxLabs") {
                          return (
                            <span key={index} className="relative overflow-hidden flex items-center rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[0.85rem] font-medium text-[#9caeb4]">
                              <span className="relative z-10">{company}</span>
                              <span className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#59acc2]/15 to-transparent motion-safe:animate-frux-shimmer" aria-hidden="true"></span>
                            </span>
                          );
                        }
                        if (company === "HUSTON SOLUTION Inc.") {
                          return (
                            <a
                              key={index}
                              href="https://www.brycehuston.com/solutions"
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[0.85rem] font-medium text-[#9caeb4] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-[#d3e3e8] outline-none focus-visible:ring-2 focus-visible:ring-[#59acc2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#082f40]"
                            >
                              {company}
                            </a>
                          );
                        }
                        return (
                          <span key={index} className="rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[0.85rem] font-medium text-[#9caeb4]">
                            {company}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <CompanyBiography id="bryce-huston-biography" paragraphs={bryceHuston.biography} className="leadership-biography grid gap-6 text-[0.95rem] leading-8 text-[#a9bbc1]" />
              </div>
            </section>
          ) : null}


          <MarkLegacyBio />
        </div>
      </section>

      <section className="delivery-network section-shell">
        <div className="chapter-label">
          <span>03</span>PROJECT DELIVERY NETWORK
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
            The company&apos;s delivery network brings together specialist capability
            spanning construction, advanced materials and electrical engineering.
            Public descriptions remain company supplied and follow the project&apos;s
            source-confirmation controls.
          </p>
        </div>
        <div className="network-list">
          {deliveryPartners.map((partner, index) => (
            <article key={partner.name} data-reveal>
              <span>0{index + 1}</span>
              <div>
                <small>{partner.discipline}</small>
                <span className="network-relationship">{partner.relationship}</span>
              </div>
              <div className="network-portrait">
                {partner.image ? (
                  <img
                    src={partner.image}
                    loading="eager"
                    decoding="async"
                    alt={partner.imageAlt}
                    style={{ objectPosition: partner.imagePosition }}
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

        <div className="delivery-capabilities-block mt-20 pt-16 border-t border-[#061c28]/15" data-reveal>
          <div className="section-intro split">
            <div>
              <p className="eyebrow dark">
                <span />
                Delivery Capabilities
              </p>
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#061c28]">
                Capabilities Required From Engineering to Delivery.
              </h3>
            </div>
            <p>
              These categories describe the specialist capabilities Humpback expects
              to engage through its partner pathway. They do not represent named firms,
              current agreements or completed delivery appointments.
            </p>
          </div>
          <div className="network-capabilities-list">
            {deliveryCapabilities.map((capability, index) => (
              <article key={capability.discipline} className="capability-row">
                <span>0{index + 1}</span>
                <small>Capability Category</small>
                <h4>{capability.discipline}</h4>
                <p>{capability.scope}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
