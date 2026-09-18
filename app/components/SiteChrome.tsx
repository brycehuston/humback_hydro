"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { brandLockupFull, brandLockupNav, navItems } from "../data";
import { Arrow } from "./Icons";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(document.querySelectorAll<HTMLElement>("main, .site-footer"));
    const inertState = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    const links = Array.from(menuPanel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const controls = [menuTrigger.current, ...links].filter((element): element is HTMLButtonElement | HTMLAnchorElement => element !== null);
    const focusFrame = requestAnimationFrame(() => links[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuTrigger.current?.focus();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const current = controls.indexOf(document.activeElement as HTMLAnchorElement);
        controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1101px)").matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusFrame);
      background.forEach((element, index) => { element.inert = inertState[index]; });
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

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
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      observer.observe(element);
      // Server-rendered content stays visible if JavaScript cannot initialize.
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add("reveal-ready");
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>(".eyebrow > span").forEach((element) => {
        element.classList.add("accent-rule-ready");
        observer.observe(element);
      });
    }

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
        <Link className="brand brand-lockup" href="/" aria-label="Humpback Hydro home">
          <span className="brandmark-wrap" aria-hidden="true">
            <img src={brandLockupNav} alt="" />
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="roll-link" aria-label={item.label}>
              <span className="roll-viewport" aria-hidden="true"><span className="roll-text" data-text={item.label}>{item.label}</span></span>
            </Link>
          ))}
        </nav>

        <Link className="header-cta" href="/partners">
          Explore a Partnership <Arrow />
        </Link>

        <button
          className="menu-trigger"
          ref={menuTrigger}
          aria-controls="mobile-navigation"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>

        <div id="mobile-navigation" ref={menuPanel} className={`mobile-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
          <nav aria-label="Mobile navigation">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                <span>0{index + 1}</span>{item.label}<Arrow />
              </Link>
            ))}
            <Link href="/partners" onClick={() => setMenuOpen(false)}><span>{String(navItems.length + 1).padStart(2, "0")}</span>Explore a Partnership<Arrow /></Link>
          </nav>
          <small>Vancouver, British Columbia, Canada</small>
        </div>
      </header>



      {children}

      <footer className="site-footer footer-reveal-root" data-reveal>
        <div className="footer-primary footer-reveal">
          <div className="footer-brand-zone">
            <Link className="brand brand-lockup footer-brand" href="/" aria-label="Humpback Hydro home">
              <span className="brandmark-wrap footer-brandmark" aria-hidden="true">
                <img src={brandLockupFull} alt="" />
              </span>
            </Link>
          </div>
          <p className="footer-statement brand-chrome">NATURAL POWER. REAL IMPACT.</p>
          <a className="footer-email" href="mailto:info@humpbackenergy.com">info@humpbackenergy.com</a>
        </div>
        <div className="footer-reveal flex flex-wrap gap-x-16 md:gap-x-28 lg:gap-x-40 gap-y-12 mt-16 md:mt-24 text-sm">
          <div className="flex flex-col gap-5">
            <small className="titanium-microtype opacity-50 mb-2">EXPLORE</small>
            {navItems.slice(0, 3).map((item) => <Link key={item.href} href={item.href} className="hover:text-white transition-colors">{item.label}</Link>)}
            <Link data-open-homepage-calculator href="/#economics" className="hover:text-white transition-colors">Calculator</Link>
          </div>
          <div className="flex flex-col gap-5">
            <small className="titanium-microtype opacity-0 hidden md:block pointer-events-none select-none mb-2" aria-hidden="true">EXPLORE</small>
            {navItems.slice(3).map((item) => <Link key={item.href} href={item.href} className="hover:text-white transition-colors">{item.label}</Link>)}
          </div>
          <div className="flex flex-col gap-5">
            <small className="titanium-microtype opacity-50 mb-2">PARTNER</small>
            <Link href="/partners#pilot" className="hover:text-white transition-colors">Pilot Opportunity</Link>
            <Link href="/partners#evaluate" className="hover:text-white transition-colors">Evaluate a Site</Link>
            <Link href="/partners#investment" className="hover:text-white transition-colors">Investment</Link>
          </div>
          <div className="flex flex-col gap-5">
            <small className="titanium-microtype opacity-50 mb-2">CONNECT</small>
            <Link href="/partners" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://www.linkedin.com/company/humpback-hydro/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
        <div className="footer-reveal flex flex-col md:flex-row justify-between items-center w-full mt-24 pt-8 border-t border-white/10 titanium-microtype gap-4 md:gap-0">
          <span>2026 © HUMPBACK HYDRO</span>
          <span className="flex items-center gap-2">📍 VANCOUVER, CANADA</span>
          <span>SITE BY <a className="footer-credit-link hover:text-white transition-colors" href="https://www.brycehuston.com/solutions" target="_blank" rel="noreferrer">HUSTON SOLUTION INC.</a></span>
        </div>
      </footer>
    </>
  );
}
