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

          <p className="mt-6 border-l-2 border-[#59acc2] pl-4 text-xs leading-6 text-[#78969e]">
            Career and research descriptions are based on a company-supplied
            biography and require source confirmation unless linked to a
            verified public record.
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
            <span className="mt-1 block text-sm text-[#83c4d2]">
              Patent Number and Public Record Only
            </span>
          </div>
        </div>

        <div className="grid gap-6 text-[0.95rem] leading-8 text-[#a9bbc1]">
          <p className="m-0">
            The company-supplied biography describes Mark as a multidisciplinary
            inventor and engineering innovator focused on infrastructure
            challenges at the intersection of energy, water, transportation and
            environmental sustainability. It presents his work as driven by the
            belief that practical engineering can support climate resilience,
            environmental stewardship and long-term human development.
          </p>

          <p className="m-0">
            The supplied biography describes experience spanning construction
            and engineering trades,
            including carpentry, masonry, welding, metal fabrication,
            blacksmithing and large-scale building construction. This practical
            foundation is complemented by decades of independent research and
            development across marine and structural engineering,
            hydrodynamics, aerodynamics, aerospace systems, energy storage,
            astrophysics, planetary science and advanced infrastructure design.
          </p>

          <p className="m-0">
            It also describes research focused on technologies for marine
            transportation, resilient energy infrastructure, military
            engineering applications, aerospace concepts and future lunar
            infrastructure capable of supporting a long-term human presence
            beyond Earth.
          </p>

          <p className="m-0">
            The verified public record identifies U.S. Patent No. 8,823,195 B2.
            The supplied biography characterizes Humpback Hydro as a modular,
            long-duration pumped-hydro energy-storage technology and describes
            continued research and development across energy, transportation,
            aerospace and infrastructure. Mark&apos;s authorship of the 2024 IEEE
            EESAT paper is separately supported by the public citation; broader
            review, development and intellectual-property claims require
            confirmation.
          </p>

          <p className="m-0">
            The supplied biography describes Mark&apos;s long-term vision as
            extending beyond renewable energy to future ocean-based, Arctic and
            lunar infrastructure. It frames that work around energy security,
            water security, transportation, environmental sustainability and
            resilience in increasingly challenging environments.
          </p>
        </div>
      </div>
    </section>
  );
}
