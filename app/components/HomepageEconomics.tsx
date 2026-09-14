"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Arrow } from "./Icons";
import OpshCalculator from "./OpshCalculator";

const ECONOMICS_HASH = "#economics";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const modelSteps = [
  {
    label: "Energy In",
    copy: "Available electrical energy can be supplied to the system from compatible sources and configurations.",
  },
  {
    label: "Store",
    copy: "Energy is converted into stored gravitational potential energy.",
  },
  {
    label: "Generate",
    copy: "Stored hydraulic energy can be converted back into electricity through hydroelectric generation.",
  },
  {
    label: "Dispatch",
    copy: "Power can then be dispatched according to system demand and operating configuration.",
  },
];

export default function HomepageEconomics() {
  const [expanded, setExpanded] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const explainerTriggerRef = useRef<HTMLButtonElement>(null);
  const explainerDialogRef = useRef<HTMLDivElement>(null);
  const explainerCloseRef = useRef<HTMLButtonElement>(null);

  const openCalculator = useCallback(() => setExpanded(true), []);

  const collapseCalculator = useCallback(() => {
    setExpanded(false);
    if (window.location.hash === ECONOMICS_HASH) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    window.requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }));
  }, []);

  const closeExplainer = useCallback(() => setExplainerOpen(false), []);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === ECONOMICS_HASH) openCalculator();
    };

    const handleCalculatorLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[data-open-homepage-calculator]");
      if (!link || window.location.pathname !== "/") return;

      event.preventDefault();
      if (window.location.hash !== ECONOMICS_HASH) {
        window.history.pushState(null, "", ECONOMICS_HASH);
      }
      openCalculator();
      document.getElementById("economics")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("popstate", openFromHash);
    document.addEventListener("click", handleCalculatorLink, true);

    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("popstate", openFromHash);
      document.removeEventListener("click", handleCalculatorLink, true);
    };
  }, [openCalculator]);

  useEffect(() => {
    if (!explainerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const focusReturnTarget = explainerTriggerRef.current;
    const background = Array.from(
      document.querySelectorAll<HTMLElement>(".site-header, main, .site-footer"),
    );
    const inertState = background.map((element) => element.inert);
    document.body.style.overflow = "hidden";
    background.forEach((element) => { element.inert = true; });

    const focusFrame = window.requestAnimationFrame(() => {
      explainerCloseRef.current?.focus();
    });

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExplainer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = inertState[index]; });
      window.requestAnimationFrame(() => {
        focusReturnTarget?.focus({ preventScroll: true });
      });
    };
  }, [closeExplainer, explainerOpen]);

  function trapExplainerFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const dialog = explainerDialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => element.offsetParent !== null);
    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  const explainer =
    typeof document !== "undefined" && explainerOpen
      ? createPortal(
          <div
            className="model-explainer-overlay"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) closeExplainer();
            }}
          >
            <div
              aria-labelledby="model-explainer-title"
              aria-modal="true"
              className="model-explainer-panel"
              id="homepage-model-explainer"
              onKeyDown={trapExplainerFocus}
              ref={explainerDialogRef}
              role="dialog"
              tabIndex={-1}
            >
              <button
                aria-label="Close how this model works"
                className="model-explainer-close"
                onClick={closeExplainer}
                ref={explainerCloseRef}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
              <p className="eyebrow"><span />Conceptual Guide</p>
              <h2 id="model-explainer-title">How This Model Works</h2>
              <div className="model-explainer-sequence" data-explainer-media-region>
                {modelSteps.map((step, index) => (
                  <article key={step.label}>
                    <small>0{index + 1}</small>
                    <h3>{step.label}</h3>
                    <p>{step.copy}</p>
                  </article>
                ))}
              </div>
              <div className="model-explainer-boundary">
                <p>The calculator is an illustrative scenario model intended to demonstrate potential project scale, modeled generation and economics under selected assumptions.</p>
                <p>Actual project performance, charging requirements, storage duration, usable capacity, efficiency, operating configuration, project costs, revenues and economics remain project-specific and subject to feasibility, engineering and validation.</p>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section
      aria-labelledby="home-economics-title"
      className="home-economics-section"
      data-homepage-economics-root
      id="economics"
    >
      <div className="section-shell home-economics-shell">
        <div className="chapter-label light"><span>03</span>THE ECONOMICS</div>
        <div className="home-economics-teaser">
          <div>
            <p className="eyebrow"><span />Model the Economics</p>
            <h2 id="home-economics-title">Explore illustrative generation, storage and project economics.</h2>
            <p className="home-economics-modes">Generation · Storage · Integrated</p>
          </div>
          <button
            aria-controls="homepage-economics-calculator"
            aria-expanded={expanded}
            className="home-calculator-toggle"
            onClick={() => expanded ? collapseCalculator() : openCalculator()}
            ref={toggleRef}
            type="button"
          >
            {expanded ? "Close Calculator" : "Open Calculator"} <Arrow direction={expanded ? "up" : "down"} />
          </button>
        </div>

        <div className="home-economics-calculator" hidden={!expanded} id="homepage-economics-calculator">
          <OpshCalculator
            displayMode="embedded"
            headerActions={
              <>
                <button
                  aria-controls="homepage-model-explainer"
                  aria-expanded={explainerOpen}
                  aria-haspopup="dialog"
                  className="calculator-explainer-trigger"
                  onClick={() => setExplainerOpen(true)}
                  ref={explainerTriggerRef}
                  type="button"
                >
                  How This Model Works <Arrow />
                </button>
                <button className="calculator-collapse-trigger" onClick={collapseCalculator} type="button">
                  Collapse
                </button>
              </>
            }
          />
        </div>

        <div className="home-economics-more">
          <a className="text-link light" href="/economics">Explore Full Economics <Arrow /></a>
        </div>
      </div>
      {explainer}
    </section>
  );
}
