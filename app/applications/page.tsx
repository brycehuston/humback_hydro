import type { Metadata } from "next";
import ApplicationSelector from "../components/ApplicationSelector";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";

export const metadata: Metadata = {
  title: "Applications",
  description: "Explore potential Humpback Hydro applications across data centers, utilities, industry, island systems and water infrastructure.",
};

export default function ApplicationsPage() {
  return (
    <main>
      <RouteHero index="02" eyebrow="Applications" title="Power Where It Matters." copy="A modular platform designed for AI infrastructure first, with broader potential across utilities, industry, island systems and water resilience." image="/grid-data-center-night.webp" nextHref="#application-selector" nextLabel="Choose an Application" />
      <section className="route-intro section-shell" id="application-selector">
        <div className="chapter-label"><span>01</span>SELECT A MARKET</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Infrastructure Applications</p><h2>Different Missions. One Operating Platform.</h2></div>
          <p>Select an application to see how Humpback Hydro can align with each infrastructure challenge. Every deployment would require site-specific engineering and commercial evaluation.</p>
        </div>
        <ApplicationSelector expanded />
      </section>

      <section className="market-entry">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>THE ENTRY MARKET</div>
          <div className="market-entry-grid">
            <div data-reveal><p className="eyebrow"><span />AI and Data Centers</p><h2>When Power Determines the Deployment Timeline.</h2></div>
            <div data-reveal><p>Data-center growth is increasing demand for dependable electricity while interconnection and transmission infrastructure can take years to expand.</p><p className="pull-quote">Speed-to-power is becoming a competitive infrastructure advantage.</p><a className="text-link light" href="/partners?interest=data-centers">Discuss a Data-Center Opportunity <Arrow /></a></div>
          </div>
        </div>
      </section>
    </main>
  );
}
