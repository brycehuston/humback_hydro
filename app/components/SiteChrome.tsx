"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { brandmark, navItems } from "../data";
import { Arrow } from "./Icons";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    let pointerTicking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--page-progress", String(progress));
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.035, 30)}px`);
      document.documentElement.style.setProperty("--depth-shift", `${Math.max(window.scrollY * -0.018, -34)}px`);
      document.documentElement.style.setProperty("--mist-shift", `${Math.min(window.scrollY * 0.01, 14)}px`);
      document.documentElement.style.setProperty("--industrial-shift", `${Math.max(window.scrollY * -0.006, -38)}px`);
      document.body.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onPointerMove = (event: PointerEvent) => {
      if (pointerTicking || !window.matchMedia("(pointer: fine)").matches) return;
      pointerTicking = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth) * 100}%`);
        document.documentElement.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight) * 100}%`);
        pointerTicking = false;
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -7%" },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Humpback Hydro home">
          <img src={brandmark} alt="" />
          <span>
            <strong>HUMPBACK HYDRO</strong>
            <small>Energy. Water. Humanity.</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="header-cta" href="/partners">
          Partner With Us <Arrow />
        </Link>

        <button
          className="menu-trigger"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>

        <div className={`mobile-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
          <nav aria-label="Mobile navigation">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                <span>0{index + 1}</span>{item.label}<Arrow />
              </Link>
            ))}
            <Link href="/partners" onClick={() => setMenuOpen(false)}><span>05</span>Partner With Us<Arrow /></Link>
          </nav>
          <small>Vancouver, British Columbia, Canada</small>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="footer-primary">
          <Link className="brand footer-brand" href="/">
            <img src={brandmark} alt="" />
            <span><strong>HUMPBACK HYDRO</strong><small>Energy. Water. Humanity.</small></span>
          </Link>
          <p>Industrialized clean-energy infrastructure for the AI era.</p>
          <a className="footer-email" href="mailto:info@humpbackenergy.com">info@humpbackenergy.com</a>
        </div>
        <div className="footer-grid">
          <div><small>EXPLORE</small>{navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
          <div><small>PARTNER</small><Link href="/partners#pilot">Pilot Opportunity</Link><Link href="/partners#pilot">Evaluate a Site</Link><Link href="/partners#investment">Investment</Link></div>
          <div><small>CONNECT</small><a href="https://www.linkedin.com/company/humpback-hydro/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.humpbackenergy.com/" target="_blank" rel="noreferrer">Current Website</a><span>Vancouver, Canada</span></div>
        </div>
        <div className="footer-legal">
          <span>Private Design Concept</span>
          <span>Concept Imagery Does Not Depict Completed Projects</span>
          <span>© 2026 HUMPBACK HYDRO | SITE BY <a href="https://www.brycehuston.com/solutions" target="_blank" rel="noreferrer">HUSTON SOLUTIONS</a></span>
        </div>
      </footer>
    </>
  );
}
