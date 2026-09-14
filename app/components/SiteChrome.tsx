"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { brandmark, navItems } from "../data";
import { Arrow } from "./Icons";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const markRef = useRef<HTMLSpanElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLAnchorElement>(null);

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

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
    };
  }, [pathname]);

  // Logo energy-activation animation
  useEffect(() => {
    const wrap = markRef.current;
    if (!wrap) return;
    // Respect reduced-motion preference — skip animation entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animating = false;
    let idleTimer: ReturnType<typeof setTimeout>;

    function play() {
      if (animating) return;
      animating = true;
      wrap!.classList.add("logo-energise");
    }

    function scheduleIdle() {
      clearTimeout(idleTimer);
      // Cycle every 10–11 s (slight jitter so it never feels mechanical)
      idleTimer = setTimeout(playIdle, 10000 + Math.random() * 1000);
    }

    function playIdle() {
      play();
      scheduleIdle();
    }

    function onAnimationEnd() {
      wrap!.classList.remove("logo-energise");
      animating = false;
    }

    // Hover: play once per enter; does not restart while pointer stays
    function onPointerEnter() { play(); }

    // Keyboard focus replay
    function onFocus() { play(); }

    wrap.addEventListener("animationend", onAnimationEnd);
    // Attach interaction listeners to the parent brand link
    const brand = wrap.closest(".brand");
    brand?.addEventListener("pointerenter", onPointerEnter);
    brand?.addEventListener("focus", onFocus, true);

    // Initial activation — allow the header to finish its entrance first
    const initialTimer = setTimeout(() => { play(); scheduleIdle(); }, 1800);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(idleTimer);
      wrap.removeEventListener("animationend", onAnimationEnd);
      brand?.removeEventListener("pointerenter", onPointerEnter);
      brand?.removeEventListener("focus", onFocus, true);
    };
  }, []);

  // Footer signature animation
  useEffect(() => {
    const signature = signatureRef.current;
    if (!signature) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          timer = setTimeout(() => {
            signature.classList.add("is-active");
          }, 4500);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(signature);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Humpback Hydro home">
          <span className="brandmark-wrap" ref={markRef} aria-hidden="true">
            <img src={brandmark} alt="" />
            <svg className="logo-energy-svg" viewBox="0 0 48 42" aria-hidden="true">
              <circle className="energy-charge charge-l" cx="22.5" cy="40" r="1.5" />
              <circle className="energy-charge charge-r" cx="25.5" cy="40" r="1.5" />
              <path className="energy-path stem-l" d="M 22.5,40 C 22.5,28 18,22 8,16" pathLength="100" />
              <path className="energy-path stem-r" d="M 25.5,40 C 25.5,28 30,22 40,16" pathLength="100" />
              <path className="energy-path curve-l" d="M 8,16 C 4,12 4,6 10,5 C 16,4 20,9 24,14" pathLength="100" />
              <path className="energy-path curve-r" d="M 40,16 C 44,12 44,6 38,5 C 32,4 28,9 24,14" pathLength="100" />
            </svg>
          </span>
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

      <footer className="site-footer">
        <div className="footer-primary">
          <Link className="brand footer-brand" href="/">
            <span className="brandmark-wrap" aria-hidden="true">
              <img src={brandmark} alt="" />
            </span>
            <span><strong>HUMPBACK HYDRO</strong><small>Energy. Water. Humanity.</small></span>
          </Link>
          <p>Industrialized clean-energy infrastructure for the AI era.</p>
          <a className="footer-email" href="mailto:info@humpbackenergy.com">info@humpbackenergy.com</a>
        </div>
        <div className="footer-grid">
          <div><small>EXPLORE</small>{navItems.slice(0, 3).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link data-open-homepage-calculator href="/#economics">Calculator</Link></div>
          <div><small className="invisible hidden md:block" aria-hidden="true">&nbsp;</small>{navItems.slice(3).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
          <div><small>PARTNER</small><Link href="/partners#pilot">Pilot Opportunity</Link><Link href="/partners#pilot">Evaluate a Site</Link><Link href="/partners#investment">Investment</Link></div>
          <div><small>CONNECT</small><Link href="/partners">Contact</Link><a href="https://www.linkedin.com/company/humpback-hydro/" target="_blank" rel="noreferrer">LinkedIn</a></div>
        </div>
        <div className="footer-legal">
          <span>Concept Imagery Does Not Depict Completed Projects · Vancouver, Canada</span>
          <span className="text-balance">HUMPBACK HYDRO © 2026 | SITE BY <a ref={signatureRef} className="huston-shimmer" href="https://www.brycehuston.com/solutions" target="_blank" rel="noreferrer">HUSTON SOLUTION INC.</a></span>
        </div>
      </footer>
    </>
  );
}
