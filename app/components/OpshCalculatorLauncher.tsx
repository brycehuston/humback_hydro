"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

const LazyOpshCalculator = lazy(() => import("./OpshCalculator"));

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function CalculatorLoadingState() {
  return (
    <div
      className="flex min-h-72 items-center justify-center rounded-[1.75rem] border border-cyan-100/15 bg-[#03141f] px-8 text-center text-sm text-slate-400"
      role="status"
    >
      Preparing the project-scale scenario model…
    </div>
  );
}

export default function OpshCalculatorLauncher() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closeCalculator = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      const focusReturnTarget =
        previousFocusRef.current ?? triggerRef.current;

      if (focusReturnTarget?.isConnected) {
        focusReturnTarget.focus({ preventScroll: true });
      }
    }, 0);
  }, []);

  const openCalculator = useCallback(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const focusReturnTarget =
      previousFocusRef.current ?? triggerRef.current;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeCalculator();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => {
        if (focusReturnTarget?.isConnected) {
          focusReturnTarget.focus({ preventScroll: true });
        }
      });
    };
  }, [closeCalculator, open]);

  function trapDialogFocus(
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(
      (element) =>
        element.getAttribute("aria-hidden") !== "true" &&
        element.offsetParent !== null,
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  const dialog =
    typeof document !== "undefined" && open
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-end justify-center overflow-hidden bg-[#01070c]/80 p-0 lg:items-center lg:justify-end lg:p-6"
            data-opsh-calculator-overlay
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) {
                closeCalculator();
              }
            }}
          >
            <div
              aria-describedby="opsh-calculator-description"
              aria-labelledby="opsh-calculator-title"
              aria-modal="true"
              className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-none outline-none lg:h-[min(920px,calc(100dvh-16px))] lg:max-h-[calc(100dvh-16px)] lg:w-[min(1500px,calc(100vw-24px))] lg:rounded-[1.75rem]"
              data-opsh-calculator-dialog
              id="opsh-calculator-dialog"
              onKeyDown={trapDialogFocus}
              ref={dialogRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="sticky top-3 z-30 flex h-0 justify-end pr-3">
                <button
                  aria-label="Close Project Economics and Impact Model"
                  autoFocus
                  className="flex size-11 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0a202d] text-cyan-200 shadow-lg transition hover:bg-[#0b2434] hover:text-white hover:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  onClick={closeCalculator}
                  ref={closeButtonRef}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m7 7 10 10M17 7 7 17"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.9"
                    />
                  </svg>
                </button>
              </div>

              <Suspense fallback={<CalculatorLoadingState />}>
                <LazyOpshCalculator />
              </Suspense>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="border-t border-cyan-100/15 bg-[#03141f] px-4 py-6 lg:px-8">
        <div className="mx-auto w-full max-w-[min(1160px,94vw)]">
          <button
            aria-controls="opsh-calculator-dialog"
            aria-expanded={open}
            aria-haspopup="dialog"
            className="group relative flex w-full flex-row items-center justify-between gap-4 overflow-hidden rounded-xl border border-cyan-400/40 bg-[#081d2a] p-4 text-left transition-colors duration-300 hover:border-cyan-300 hover:bg-[#0b2434] focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03141f] sm:p-5 lg:p-6"
            data-opsh-calculator-trigger
            onClick={openCalculator}
            ref={triggerRef}
            type="button"
          >
            <div className="relative flex flex-col items-start gap-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Project Economics
              </span>

              <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Explore the Interactive Model
              </span>

              <span className="text-[0.7rem] font-medium tracking-widest text-slate-300 uppercase">
                10–1,000 MW live scenario
              </span>
            </div>

            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition-colors group-hover:border-cyan-400/50 group-hover:bg-cyan-400/20">
              <svg
                aria-hidden="true"
                className="size-5 transition-transform duration-300 group-hover:translate-x-[4px]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 12h14m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {dialog}
    </>
  );
}
