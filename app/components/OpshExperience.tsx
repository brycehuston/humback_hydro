"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent,
  MutableRefObject,
  ReactNode,
} from "react";
import { Arrow } from "./Icons";
import {
  ieeeCitation,
  opshStages,
  studyEvidence,
} from "../opsh-data";
import type {
  OpshMotionState,
  OpshStageId,
} from "../opsh-data";

const LazyOpshScene = lazy(() => import("./OpshScene"));

type OpshExperienceProps = {
  variant: "guided" | "explorer";
  initialStage?: OpshStageId;
};

function StaticOpshFallback({ status }: { status: string }) {
  return (
    <div className="opsh-fallback" role="img" aria-label="Annotated concept model of the fixed offshore pumped-hydro structure">
      <img src="/opsh-static-fallback.png" alt="" />
      <div className="opsh-fallback-shade" />
      <span className="opsh-fallback-status">{status}</span>
      <span className="opsh-fallback-label upper">Upper Reservoir</span>
      <span className="opsh-fallback-label upper-turbines">Upper Turbine Stage</span>
      <span className="opsh-fallback-label lower-turbines">Lower Turbine Stage</span>
      <span className="opsh-fallback-label lower">Lower Reservoir + Pumps</span>
    </div>
  );
}

function EvidenceNotes() {
  return (
    <div className="opsh-evidence-notes">
      {studyEvidence.map((item) => (
        <article key={item.index}>
          <div><span>{item.year}</span><small>{item.source}</small></div>
          <p>{item.result}</p>
          <small>{item.limitation}</small>
        </article>
      ))}
    </div>
  );
}

function StageCopy({
  index,
  active,
  children,
}: {
  index: number;
  active: boolean;
  children?: ReactNode;
}) {
  const stage = opshStages[index];
  return (
    <div className="opsh-stage-copy">
      <small>{stage.number} / 04 · {stage.eyebrow}</small>
      <h3>{stage.title}</h3>
      <p>{stage.description}</p>
      <p className="opsh-stage-detail">{stage.detail}</p>
      {stage.flowDirections.length > 0 && (
        <div className="opsh-flow-readout" aria-label="Water flow directions">
          {stage.flowDirections.map((flow) => <span key={flow}>{flow}</span>)}
        </div>
      )}
      {children}
      <span className="sr-only">{active ? "Current model state" : ""}</span>
    </div>
  );
}

export default function OpshExperience({
  variant,
  initialStage = "anatomy",
}: OpshExperienceProps) {
  const initialIndex = Math.max(0, opshStages.findIndex((stage) => stage.id === initialStage));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactRendering, setCompactRendering] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const motionRef = useRef<OpshMotionState>({
    progress: initialIndex / (opshStages.length - 1),
    stageIndex: initialIndex,
    reducedMotion: false,
  });
  const activeStage = opshStages[activeIndex];

  const setStage = useCallback((index: number, focus = false) => {
    const boundedIndex = Math.max(0, Math.min(opshStages.length - 1, index));
    motionRef.current.stageIndex = boundedIndex;
    motionRef.current.progress = boundedIndex / (opshStages.length - 1);
    setActiveIndex(boundedIndex);
    if (focus) tabRefs.current[boundedIndex]?.focus();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneEnabled(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.02 },
    );

    loadObserver.observe(root);
    visibilityObserver.observe(root);
    return () => {
      loadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 1023px)");
    const updatePreferences = () => {
      motionRef.current.reducedMotion = motionQuery.matches;
      setReducedMotion(motionQuery.matches);
      setCompactRendering(widthQuery.matches);
    };
    const handleVisibility = () => setDocumentVisible(document.visibilityState === "visible");

    updatePreferences();
    handleVisibility();
    motionQuery.addEventListener("change", updatePreferences);
    widthQuery.addEventListener("change", updatePreferences);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      motionQuery.removeEventListener("change", updatePreferences);
      widthQuery.removeEventListener("change", updatePreferences);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (variant !== "guided" || reducedMotion || compactRendering) return;
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;

    let cleanup = () => undefined;
    let cancelled = false;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, scrollModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const trigger = ScrollTrigger.create({
        trigger: root,
        pin: visual,
        pinSpacing: false,
        start: "top 96px",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const index = Math.min(
            opshStages.length - 1,
            Math.floor(progress * opshStages.length),
          );
          motionRef.current.progress = progress;
          motionRef.current.stageIndex = index;
          setActiveIndex((current) => current === index ? current : index);
        },
      });
      cleanup = () => trigger.kill();
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [compactRendering, reducedMotion, variant]);

  useEffect(() => {
    if (variant !== "guided" || (!compactRendering && !reducedMotion)) return;
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-opsh-stage]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.opshStage ?? 0);
        setStage(index);
      },
      { rootMargin: "-25% 0px -50%", threshold: [0.2, 0.5, 0.8] },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [compactRendering, reducedMotion, setStage, variant]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % opshStages.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + opshStages.length) % opshStages.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = opshStages.length - 1;
    else return;
    event.preventDefault();
    setStage(nextIndex, true);
  };

  const sceneFallback = useMemo(
    () => <StaticOpshFallback status={sceneEnabled ? "WebGL Unavailable — Static Model" : "Preparing Interactive Model"} />,
    [sceneEnabled],
  );

  const stageTabs = (
    <div className="opsh-stage-tabs" role="tablist" aria-label="Static system stages">
      {opshStages.map((stage, index) => (
        <button
          key={stage.id}
          ref={(element) => { tabRefs.current[index] = element; }}
          type="button"
          role="tab"
          id={`opsh-tab-${variant}-${stage.id}`}
          aria-controls={`opsh-panel-${variant}`}
          aria-selected={activeIndex === index}
          tabIndex={activeIndex === index ? 0 : -1}
          onClick={() => setStage(index)}
          onKeyDown={(event) => handleTabKeyDown(event, index)}
        >
          <span>{stage.number}</span>
          <strong>{stage.shortLabel}</strong>
        </button>
      ))}
    </div>
  );

  const visual = (
    <div className="opsh-visual" ref={visualRef}>
      <div className="opsh-model-frame">
        {sceneEnabled ? (
          <Suspense fallback={sceneFallback}>
            <LazyOpshScene
              stage={activeStage}
              motionRef={motionRef as MutableRefObject<OpshMotionState>}
              interactive={variant === "explorer"}
              renderActive={isVisible && documentVisible}
              compact={compactRendering}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              fallback={sceneFallback}
            />
          </Suspense>
        ) : sceneFallback}
        <div className="opsh-model-hud">
          <span><i />Fixed Structure</span>
          <strong>Concept Model — Not to Scale</strong>
        </div>
        <div className="opsh-component-key" aria-hidden="true">
          <span>Upper Reservoir</span>
          <span>Upper Turbines</span>
          <span>Lower Turbines</span>
          <span>Lower Reservoir + Pumps</span>
        </div>
      </div>
      {stageTabs}
      {variant === "explorer" && (
        <div className="opsh-explorer-tools">
          <span>Drag to rotate · Scroll to zoom</span>
          <button type="button" onClick={() => setResetSignal((value) => value + 1)}>
            Reset View
          </button>
        </div>
      )}
      <div className="sr-only" aria-live="polite">{activeStage.title}</div>
    </div>
  );

  if (variant === "explorer") {
    return (
      <section className="opsh-experience opsh-explorer" ref={rootRef} aria-label="Interactive static offshore pumped-hydro concept">
        {visual}
        <div
          className="opsh-explorer-copy"
          id={`opsh-panel-${variant}`}
          role="tabpanel"
          aria-labelledby={`opsh-tab-${variant}-${activeStage.id}`}
        >
          <StageCopy index={activeIndex} active>
            {activeStage.id === "impact" && <EvidenceNotes />}
          </StageCopy>
          <a className="text-link light" href="/evidence">Review the Source Record <Arrow /></a>
        </div>
      </section>
    );
  }

  return (
    <section className="opsh-experience opsh-guided" ref={rootRef} aria-label="How the static offshore system works">
      {visual}
      <div className="opsh-guided-stages" id={`opsh-panel-${variant}`}>
        {opshStages.map((stage, index) => (
          <article
            key={stage.id}
            data-opsh-stage={index}
            data-active={activeIndex === index}
            aria-labelledby={`opsh-tab-${variant}-${stage.id}`}
          >
            <StageCopy index={index} active={activeIndex === index}>
              {stage.id === "impact" && <EvidenceNotes />}
            </StageCopy>
          </article>
        ))}
        <footer className="opsh-citation">
          <small>Primary Publication</small>
          <p>{ieeeCitation}</p>
          <div>
            <a href="https://doi.org/10.1109/EESAT59125.2024.10471215" target="_blank" rel="noreferrer">
              DOI 10.1109/EESAT59125.2024.10471215
            </a>
            <a href="https://ieeexplore.ieee.org/document/10471215" target="_blank" rel="noreferrer">
              Official IEEE Record <Arrow />
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
