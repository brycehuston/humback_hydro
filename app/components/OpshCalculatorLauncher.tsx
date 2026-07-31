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
              className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[1.75rem] outline-none lg:max-h-[calc(100dvh-3rem)] lg:w-[min(760px,calc(100vw-3rem))] lg:rounded-[1.75rem]"
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
                  className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-[#071b25] text-slate-200 shadow-lg transition hover:border-cyan-200/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
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
      <div className="border-t border-cyan-100/15 bg-[#03141f]/95 p-3">
        <button
          aria-controls="opsh-calculator-dialog"
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-cyan-200/25 bg-cyan-200/[0.07] px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-cyan-50 transition hover:border-cyan-200/45 hover:bg-cyan-200/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03141f]"
          data-opsh-calculator-trigger
          onClick={openCalculator}
          ref={triggerRef}
          type="button"
        >
          <span>
            Open Project Economics &amp; Impact Model
            <small className="mt-1 block text-[0.62rem] font-medium normal-case tracking-normal text-slate-400">
              Explore a provisional 10–1,000 MW infrastructure scenario
            </small>
          </span>

          <svg
            aria-hidden="true"
            className="size-4 shrink-0 text-cyan-200"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 12h14m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      {dialog}
    </>
  );
}
