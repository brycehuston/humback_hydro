"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { brandLockupFull, brandLockupNav, navItems } from "../data";
import { Arrow } from "./Icons";
import LogoTrace, { LOGO_TRACE } from "./LogoTrace";

const FOOTER_CHOREOGRAPHY = {
  naturalStartMs: 1000,
  naturalRevealMs: 3500,
  interPhrasePauseMs: 500,
  realRevealMs: 3500,
  postStatementPauseMs: 650,
  headerEntranceMs: 1250,
  logoBreathMs: 1000,
} as const;

const FOOTER_TIMELINE = {
  realStartMs: FOOTER_CHOREOGRAPHY.naturalStartMs
    + FOOTER_CHOREOGRAPHY.naturalRevealMs
    + FOOTER_CHOREOGRAPHY.interPhrasePauseMs,
  headerReturnDelayMs: FOOTER_CHOREOGRAPHY.naturalStartMs
    + FOOTER_CHOREOGRAPHY.naturalRevealMs
    + FOOTER_CHOREOGRAPHY.interPhrasePauseMs
    + FOOTER_CHOREOGRAPHY.realRevealMs
    + FOOTER_CHOREOGRAPHY.postStatementPauseMs,
} as const;

const footerTimingStyle = {
  "--footer-natural-start": `${FOOTER_CHOREOGRAPHY.naturalStartMs}ms`,
  "--footer-natural-reveal": `${FOOTER_CHOREOGRAPHY.naturalRevealMs}ms`,
  "--footer-real-start": `${FOOTER_TIMELINE.realStartMs}ms`,
  "--footer-real-reveal": `${FOOTER_CHOREOGRAPHY.realRevealMs}ms`,
} as CSSProperties;

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoTraceActive, setLogoTraceActive] = useState(false);
  const pathname = usePathname();
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [logoTraceKey, setLogoTraceKey] = useState(0);

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
    // Direction-aware navbar auto-hide
    const header = document.querySelector<HTMLElement>(".site-header");
    let lastScrollY = window.scrollY;

    const updateHide = (currentY: number) => {
      if (!header) return;
      const delta = currentY - lastScrollY;
      const atTop = currentY < 80;
      if (atTop) {
        header.style.transform = "";
      } else if (delta > 4) {
        header.style.transform = "translateY(-100%)";
      } else if (delta < -4) {
        header.style.transform = "";
      }
      lastScrollY = currentY;
    };

    const onHeaderFocusin = () => {
      if (header) header.style.transform = "";
    };
    header?.addEventListener("focusin", onHeaderFocusin);

    const update = () => {
      const currentY = window.scrollY;
      updateHide(currentY);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? currentY / max : 0;
      document.documentElement.style.setProperty("--page-progress", String(progress));
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(currentY * 0.035, 30)}px`);
      document.documentElement.style.setProperty("--depth-shift", `${Math.max(currentY * -0.018, -34)}px`);
      document.documentElement.style.setProperty("--mist-shift", `${Math.min(currentY * 0.01, 14)}px`);
      document.documentElement.style.setProperty("--industrial-shift", `${Math.max(currentY * -0.006, -38)}px`);
      document.body.classList.toggle("is-scrolled", currentY > 24);
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPointerMove = (event: PointerEvent) => {
      if (pointerTicking || reducedMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;
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

    // Chapter-label activation: low threshold, no bottom guard so marker 01
    // (near top of content) fires on first scroll into view like later markers.
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.05 },
    );
    document.querySelectorAll(".chapter-label").forEach((element) => {
      chapterObserver.observe(element);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      header?.removeEventListener("focusin", onHeaderFocusin);
      observer.disconnect();
      chapterObserver.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finalNavPlate = document.querySelector<HTMLElement>(".desktop-nav .roll-link:last-child");
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let started = false;

    const startAfterSettle = () => {
      if (started) return;
      started = true;
      clearTimeout(fallbackTimer);
      settleTimer = setTimeout(() => setLogoTraceActive(true), LOGO_TRACE.startDelayMs);
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === "nav-plate-settle") startAfterSettle();
    };

    finalNavPlate?.addEventListener("animationend", onAnimationEnd);
    const fallbackTimer = setTimeout(startAfterSettle, LOGO_TRACE.fallbackStartMs);

    return () => {
      finalNavPlate?.removeEventListener("animationend", onAnimationEnd);
      clearTimeout(fallbackTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  useEffect(() => {
    if (!footerRef.current) return;
    const timers = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        schedule(() => {
          const header = document.querySelector<HTMLElement>(".site-header");
          if (header) {
            header.classList.add("header-slow-entrance");
            header.style.transform = "";
            schedule(() => {
              header.classList.remove("header-slow-entrance");
              schedule(() => {
                setLogoTraceActive(true);
                setLogoTraceKey((key) => key + 1);
              }, FOOTER_CHOREOGRAPHY.logoBreathMs);
            }, FOOTER_CHOREOGRAPHY.headerEntranceMs);
          }
        }, FOOTER_TIMELINE.headerReturnDelayMs);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(footerRef.current);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <>
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand brand-lockup" href="/" aria-label="Humpback Hydro home">
          <span className="brandmark-wrap" aria-hidden="true">
            <picture>
              <source srcSet="/brand/humpback-hydro-lockup-nav.webp" type="image/webp" />
              <img src={brandLockupNav} alt="" />
            </picture>
            {logoTraceActive ? <LogoTrace key={logoTraceKey} /> : null}
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

      </header>
      <div id="mobile-navigation" ref={menuPanel} className={`mobile-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{item.label}<Arrow />
            </Link>
          ))}
          <Link href="/partners" onClick={() => setMenuOpen(false)}><span>{String(navItems.length + 1).padStart(2, "0")}</span>Explore a Partnership<Arrow /></Link>
        </nav>
        <small>📍 Vancouver, British Columbia, Canada</small>
      </div>


      {children}

      <footer ref={footerRef} className="site-footer footer-reveal-root" data-reveal style={footerTimingStyle}>
        <div className="footer-primary footer-reveal">
          <div className="footer-brand-zone">
            <Link className="brand brand-lockup footer-brand" href="/" aria-label="Humpback Hydro home">
              <span className="brandmark-wrap footer-brandmark" aria-hidden="true">
                <picture>
                  <source srcSet="/brand/humpback-hydro-lockup-full.webp" type="image/webp" />
                  <img src={brandLockupFull} alt="" />
                </picture>

              </span>
            </Link>
          </div>
          <div className="footer-statement">
            <img src="/natural-power-statement.png" alt="Natural Power. Real Impact." className="footer-tagline-img" />
          </div>
          <div className="footer-contact-module">
            <small className="titanium-microtype">CONTACT</small>
            <a className="footer-email" href="mailto:info@humpbackenergy.com">info@humpbackenergy.com</a>
          </div>
        </div>
        <div className="footer-grid footer-reveal">
          <div className="footer-group-explore">
            <small className="titanium-microtype">EXPLORE</small>
            <div className="footer-explore-links">
              <Link href="/technology">Technology</Link>
              <Link href="/applications">Applications</Link>
              <Link href="/impact">Impact</Link>
              <Link data-open-homepage-calculator href="/#economics">Calculator</Link>
              <Link href="/economics">Economics</Link>
              <Link href="/evidence">Evidence</Link>
              <Link href="/company" className="footer-company-link">Company</Link>
            </div>
          </div>
          <div className="footer-group-partner-connect">
            <div className="footer-group">
              <small className="titanium-microtype">PARTNER</small>
              <div className="footer-group-links">
                <Link href="/partners#pilot">Opportunity</Link>
                <Link href="/partners#pilot">Evaluate a Site</Link>
                <Link href="/partners#investment">Investment</Link>
              </div>
            </div>
            <div className="footer-group">
              <small className="titanium-microtype">CONNECT</small>
              <div className="footer-group-links">
                <Link href="/partners">Contact</Link>
                <a href="https://www.linkedin.com/company/humpback-hydro/" target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-legal footer-reveal">
          <span><span>&copy;</span> 2026 HUMPBACK HYDRO</span>
          <span>📍 VANCOUVER, CANADA</span>
          <span>SITE BY <a className="footer-credit-link" href="https://www.brycehuston.com/solutions" target="_blank" rel="noreferrer">HUSTON SOLUTION INC.</a></span>
        </div>
      </footer>
    </>
  );
}
