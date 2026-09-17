import { pageMetadata } from "../page-metadata";
import ApplicationSelector from "../components/ApplicationSelector";
import RouteHero from "../components/RouteHero";
import { Arrow } from "../components/Icons";

export const metadata = pageMetadata("/applications", "Applications", "Explore potential Humpback Hydro applications across utilities, AI and data centers, industry, island and remote systems, water infrastructure and food systems.");

export default function ApplicationsPage() {
  return (
    <main className="applications-page">
      <RouteHero index="02" eyebrow="Applications" title="Power Where It Matters." copy="A modular energy-transfer platform designed to capture otherwise wasted energy, provide reliable power when needed, and support clean water and food security—strengthening the water–energy–food nexus." image="/ocean-infrastructure-approved.jpg" nextHref="#application-selector" nextLabel="Choose an Application" />
      <section className="route-intro section-shell" id="application-selector">
        <i className="applications-entry-rule" data-reveal aria-hidden="true" />
        <div className="chapter-label"><span>01</span>SELECT A MARKET</div>
        <div className="section-intro split" data-reveal>
          <div><p className="eyebrow dark"><span />Infrastructure Applications</p><h2>Different Missions. One Operating Platform.</h2></div>
          <p>Select an application to see how Humpback Hydro can align with each infrastructure challenge. Every deployment would require site-specific engineering and commercial evaluation.</p>
        </div>
        <ApplicationSelector expanded />
      </section>

      <section className="market-entry">
        <div className="section-shell">
          <div className="chapter-label light"><span>02</span>DEPLOYMENT PRIORITY</div>
          <div className="market-entry-grid">
            <div data-reveal><p className="eyebrow"><span />Utilities and System Operators</p><h2>Start With the Grid. Serve the Systems Around It.</h2></div>
            <div data-reveal><p>Utility integration is the primary deployment context. From that foundation, the same modular platform can be evaluated for AI and data centers, industry, island and remote systems, water infrastructure and food-system resilience.</p><p className="pull-quote">One operating platform. Multiple critical infrastructure mandates.</p><a className="text-link light" href="/partners?interest=utilities">Discuss Utility Integration <Arrow /></a></div>
          </div>
        </div>
      </section>
    </main>
  );
}
