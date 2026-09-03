export default function DetailedProfiles() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 mt-16 border-t border-white/15 pt-12 md:mt-24 md:pt-16">
      
      {/* Mark Legacy */}
      <section aria-labelledby="mark-legacy-profile" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20">
          <div className="self-start lg:sticky lg:top-28">
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
              Founder Profile
            </small>
            <h2 id="mark-legacy-profile" className="mt-5 text-[clamp(2.5rem,4vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white">
              Mark Legacy
            </h2>
            <p className="mt-5 text-base leading-7 text-[#83c4d2]">
              Multidisciplinary Inventor and Engineering Innovator
            </p>

            <div className="mt-8 border border-[#59acc2]/25 bg-[#082f40]/45 p-5">
              <small className="font-mono text-[0.64rem] font-semibold tracking-[0.14em] text-[#78969e] uppercase">
                Verified Public Record
              </small>
              <a
                className="mt-2 block text-base font-semibold text-white underline decoration-[#59acc2]/50 underline-offset-4"
                href="https://patents.google.com/patent/US8823195B2/en"
                target="_blank"
                rel="noreferrer"
              >
                U.S. Patent No. 8,823,195 B2
              </a>
            </div>
          </div>

          <div className="grid gap-6 text-base leading-8 text-[#a9bbc1]">
            <p className="m-0">
              Mark has dedicated his career to solving complex infrastructure challenges at the intersection of energy, water, transportation and environmental sustainability. His work integrates practical engineering with multidisciplinary scientific research to develop scalable solutions to climate resilience and long-term human development.
            </p>
            <p className="m-0">
              His experience spans the construction and engineering trades, including carpentry, masonry, welding, metal fabrication, blacksmithing and large-scale building construction. This practical foundation has been complemented by independent research and development across marine engineering, structural engineering, hydrodynamics, aerodynamics, aerospace systems, energy storage, astrophysics, planetary science and advanced infrastructure design.
            </p>
            <p className="m-0">
              His recent work focuses on technologies for marine transportation systems, resilient energy infrastructure, military engineering applications, aerospace concepts and lunar infrastructure capable of supporting long-term human presence beyond Earth.
            </p>
            <p className="m-0">
              Mark&apos;s long-term vision explores how engineering can improve the resilience of civilization on Earth while laying the technological foundations for future ocean-based, Arctic and lunar infrastructure. By integrating practical engineering with multidisciplinary scientific research, he aims to develop technologies that strengthen energy security, water security, transportation, and humanity&apos;s ability to thrive in increasingly challenging environments.
            </p>
          </div>
        </div>
      </section>

      {/* Bryan Green */}
      <section aria-labelledby="bryan-green-profile" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20 border-t border-white/5 pt-12">
          <div className="self-start lg:sticky lg:top-28">
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
              Operations &amp; Infrastructure Profile
            </small>
            <h2 id="bryan-green-profile" className="mt-5 text-[clamp(2.5rem,4vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white">
              Col. Bryan Green (Ret.)
            </h2>
            <p className="mt-5 text-base leading-7 text-[#83c4d2]">
              Operations &amp; Infrastructure Delivery
            </p>
          </div>

          <div className="grid gap-6 text-base leading-8 text-[#a9bbc1]">
            <p className="m-0">
              U.S. Army Corps of Engineers retired colonel and former commander and military laboratory director with more than 30 years of overseas, technology and construction experience across the Gulf, Africa, the Pacific and Asia, including a $22 billion military-city and power-projection construction program on the Korean Peninsula.
            </p>
            <p className="m-0">
              As a senior executive and consultant, Bryan has collaborated with senior stakeholders on nationally significant projects intended to protect lives, energize the economy and improve U.S. national security. His experience includes program building, cross-matrixed teams, innovation integration, technology transfer, commercialization, government contracting and resource management.
            </p>
            <p className="m-0">
              His research and technology-development experience spans flood control, environmental systems, power and utilities, emergency management, civil and military engineering, advanced manufacturing and 3D printing, novel materials, autonomous systems, Engineering With Nature, power resilience, data centers, high-performance computing and megaproject delivery. He has managed laboratories and facilities across the United States involving 3,000 researchers and scientists and budgets exceeding $2 billion.
            </p>
          </div>
        </div>
      </section>

      {/* Bryce Huston */}
      <section aria-labelledby="bryce-huston-profile" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20 border-t border-white/5 pt-12">
          <div className="self-start lg:sticky lg:top-28">
            <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
              Information Systems &amp; Digital Infrastructure
            </small>
            <h2 id="bryce-huston-profile" className="mt-5 text-[clamp(2.5rem,4vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white">
              Bryce Huston
            </h2>
            <p className="mt-5 text-base leading-7 text-[#83c4d2]">
              Information Security, Systems Architecture and Platform Resilience
            </p>
          </div>

          <div className="grid gap-6 text-base leading-8 text-[#a9bbc1]">
            <p className="m-0">
              Bryce Huston focuses on the digital systems architecture required to support resilient modern infrastructure platforms. His work spans information security, systems design, platform reliability, operational tooling and the structured integration of software into real-world infrastructure environments.
            </p>
            <p className="m-0">
              His background includes systems architecture, automation design, technical research workflows and the development of robust digital environments intended to support analysis, coordination, execution and long-term platform resilience. At Humpback Hydro, his role centers on helping shape the company&apos;s information architecture, digital infrastructure posture and technology-support systems.
            </p>
            <p className="m-0">
              Bryce&apos;s contribution supports the secure and scalable digital foundation behind the broader Humpback Hydro platform, with emphasis on clarity, resilience, operational continuity and the disciplined integration of technology into a mission-critical infrastructure company.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
