import Link from "next/link";
import { Arrow } from "./components/Icons";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="section-shell">
        <div className="not-found-frame">
          <p className="eyebrow"><span />Navigation</p>
          <h1>Page Not Found.</h1>
          <p>The requested page is unavailable or has moved. Return to the public record or begin again from the platform overview.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/">Return Home <Arrow /></Link>
            <Link className="button secondary" href="/evidence">Review the Evidence <Arrow /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
