export default function MarkLegacyBio() {
  return (
    <section
      className="mt-16 border-t border-white/15 pt-12 md:mt-24 md:pt-16"
      aria-labelledby="mark-legacy-profile"
      data-reveal
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:gap-20">
        <div className="self-start lg:sticky lg:top-28">
          <small className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-[#83c4d2] uppercase">
            Founder Profile
          </small>
          <h2
            id="mark-legacy-profile"
            className="mt-5 text-[clamp(3rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.06em] text-white"
          >
            Mark Legacy
          </h2>
          <p className="mt-5 text-base leading-7 text-[#83c4d2]">
            Multidisciplinary Inventor and Engineering Innovator
          </p>

          <div className="mt-8 border border-[#59acc2]/25 bg-[#082f40]/45 p-5">
            <small className="font-mono text-[0.64rem] font-semibold tracking-[0.14em] text-[#78969e] uppercase">
              Public Patent Record
            </small>
            <a
              className="mt-2 block text-base font-semibold text-white underline decoration-[#59acc2]/50 underline-offset-4"
              href="https://patents.google.com/patent/US8823195B2/en"
              target="_blank"
              rel="noreferrer"
            >
              U.S. Patent No. 8,823,195 B2
            </a>
            <span className="mt-1 block text-sm text-[#83c4d2]">
              Patent Number and Public Record Only
            </span>
          </div>
        </div>

        <div className="grid gap-6 text-[0.95rem] leading-8 text-[#a9bbc1]">
          <p className="m-0">
            A multidisciplinary inventor and engineering innovator, Mark has
            dedicated his career to solving complex infrastructure challenges
            at the intersection of energy, water, transportation and
            environmental sustainability. His work is driven by the belief
            that practical engineering can provide scalable solutions to
            climate resilience, environmental stewardship and long-term human
            development.
          </p>

          <p className="m-0">
            His experience spans the construction and engineering trades,
            including carpentry, masonry, welding, metal fabrication,
            blacksmithing and large-scale building construction. This practical
            foundation has been complemented by decades of independent
            research and development across multiple engineering and scientific
            disciplines, including marine engineering, structural engineering,
            hydrodynamics, aerodynamics, aerospace systems, energy storage,
            astrophysics, planetary science and advanced infrastructure design.
          </p>

          <p className="m-0">
            His work has increasingly focused on developing technologies for
            marine transportation systems, resilient energy infrastructure,
            military engineering applications, aerospace concepts and future
            lunar infrastructure capable of supporting long-term human presence
            beyond Earth.
          </p>

          <p className="m-0">
            The verified public record identifies U.S. Patent No. 8,823,195 B2.
            Humpback Hydro is described as a modular, long-duration pumped-hydro
            energy-storage technology. The architecture is also documented in
            the 2024 IEEE EESAT paper authored by Mark R. J. Legacy, Emma Van
            Wyk and Joshua Brinkerhoff.
          </p>

          <p className="m-0">
            Mark&apos;s long-term vision extends beyond renewable energy. His
            research explores how engineering can improve the resilience of
            civilization on Earth while laying the technological foundations
            for future ocean-based, Arctic and lunar infrastructure. By
            integrating practical engineering with multidisciplinary scientific
            research, he seeks to develop technologies that strengthen energy
            security, water security, transportation, environmental
            sustainability and humanity&apos;s ability to thrive in increasingly
            challenging environments.
          </p>
        </div>
      </div>
    </section>
  );
}
