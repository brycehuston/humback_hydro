"use client";

import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  KeyboardEvent,
  MutableRefObject,
  ReactNode,
  RefObject,
} from "react";
import { Arrow } from "./Icons";
import OpshCalculatorLauncher from "./OpshCalculatorLauncher";
import { ieeeCitation } from "../opsh-data";
import type {
  OpshMotionState,
  OpshStage,
  OpshStageId,
} from "../opsh-data";

const LazyOpshScene = lazy(() => import("./OpshScene"));

type OpshExperienceProps = {
  variant: "guided" | "explorer";
  initialStage?: OpshStageId;
};

/**
 * OpshScene still accepts OpshMotionState, but the procedural scene can also
 * consume these optional runtime fields inside useFrame.
 *
 * This object is never placed in React state. ScrollController mutates it in
 * place and the WebGL loop reads it directly, so continuous motion does not
 * schedule React work.
 */
type OpshRuntimeState = OpshMotionState & {
  targetProgress: number;
  velocity: number;
  documentVisible: boolean;
};

const STAGE_COUNT = 4;

/**
 * These scene-progress stops align the existing procedural animation with the
 * four mechanical states in the supplied Humpback Hydro operating diagram.
 *
 * The page may scroll through 0..1, but the scene receives a separately
 * calibrated targetProgress. That keeps layout geometry and mechanical timing
 * independent.
 */
const SCENE_PROGRESS_STOPS = [0.06, 0.24, 0.42, 0.68] as const;

/**
 * The legacy ids remain in place so existing initialStage props and URLs do not
 * break. The visible labels and copy now follow the correct four-stage
 * mechanical sequence:
 *
 * anatomy  -> Constant Supply
 * store    -> Gravitational Flow
 * generate -> Pumping
 * impact   -> Release
 */
const MECHANICAL_STAGES: readonly OpshStage[] = [
  {
    id: "anatomy",
    number: "01",
    shortLabel: "Constant Supply",
    eyebrow: "Below-Waterline Intake",
    title: "Maintain a Constant Water Supply",
    description:
      "Seawater enters through submerged intakes positioned below the surrounding waterline, providing a consistent source for the operating cycle.",
    detail:
      "Conceptual flow state: intake paths open while the central pump and upper-release paths remain isolated.",
    camera: {
      position: [12.5, 6.5, 15.5],
      target: [0, -1.2, 0],
    },
    highlights: ["structure", "lower-penstock", "lower-reservoir"],
    flowDirections: [
      "Surrounding water → submerged intakes",
      "Intake paths → lower system",
    ],
    waterLevels: { upper: 0.58, lower: 0.52 },
  },
  {
    id: "store",
    number: "02",
    shortLabel: "Gravitational Flow",
    eyebrow: "Lower Turbine Generation",
    title: "Generate Through Gravitational Flow",
    description:
      "Incoming water moves through the paired lower turbines and into the lower reservoir, converting the available hydraulic head into electrical output.",
    detail:
      "Conceptual flow state: intake and lower-turbine paths open while the central pump and upper-release paths remain isolated.",
    camera: {
      position: [9.8, 3.1, 11.5],
      target: [0, -2.7, 0],
    },
    highlights: ["lower-penstock", "lower-turbines", "lower-reservoir"],
    flowDirections: [
      "Submerged intakes → lower turbine pair",
      "Lower turbine pair → lower reservoir",
    ],
    waterLevels: { upper: 0.58, lower: 0.82 },
  },
  {
    id: "generate",
    number: "03",
    shortLabel: "Pumping",
    eyebrow: "Energy Storage Cycle",
    title: "Pump Water to the Upper Reservoir",
    description:
      "When electricity is available for storage, the central pump lifts water from the lower reservoir into the upper reservoir, storing energy as gravitational potential.",
    detail:
      "Conceptual flow state: the central pump riser opens while the intake, lower-turbine, and upper-release paths remain isolated.",
    camera: {
      position: [10.6, 3.8, 11.4],
      target: [0, 0.1, 0],
    },
    highlights: ["lower-reservoir", "pumps", "upper-reservoir"],
    flowDirections: [
      "Lower reservoir → central pump",
      "Central pump → upper reservoir",
    ],
    waterLevels: { upper: 0.9, lower: 0.28 },
  },
  {
    id: "impact",
    number: "04",
    shortLabel: "Release",
    eyebrow: "Upper Turbine Generation",
    title: "Release Stored Water When Needed",
    description:
      "When electricity is needed, stored water descends from the upper reservoir through the paired upper turbines and returns to the surrounding water.",
    detail:
      "Conceptual flow state: upper-release paths open while the central pump and lower-intake paths remain isolated.",
    camera: {
      position: [13.5, 7.4, 16.8],
      target: [0, 1.15, 0],
    },
    highlights: ["upper-reservoir", "upper-penstock", "upper-turbines"],
    flowDirections: [
      "Upper reservoir → upper turbine pair",
      "Upper turbine pair → surrounding water",
    ],
    waterLevels: { upper: 0.25, lower: 0.84 },
  },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampStageIndex(index: number) {
  return Math.min(STAGE_COUNT - 1, Math.max(0, Math.round(index)));
}

function stageIndexFromScroll(progress: number) {
  return Math.min(
    STAGE_COUNT - 1,
    Math.floor(clamp01(progress) * STAGE_COUNT),
  );
}

/**
 * Converts normalized page progress into continuous mechanical progress.
 * Linear interpolation between calibrated stops prevents camera, water-level,
 * rotor, and shader jumps.
 */
function sceneProgressFromScroll(progress: number) {
  const scaled = clamp01(progress) * (STAGE_COUNT - 1);
  const index = Math.min(STAGE_COUNT - 2, Math.floor(scaled));
  const localProgress = scaled - index;
  const from = SCENE_PROGRESS_STOPS[index];
  const to = SCENE_PROGRESS_STOPS[index + 1];

  return from + (to - from) * localProgress;
}

/**
 * ScrollController contains two deliberately separate channels:
 *
 * 1. Continuous channel
 *    Writes progress, targetProgress, and velocity into runtimeRef.
 *    OpshScene reads these values in useFrame.
 *
 * 2. Discrete channel
 *    Publishes only when stageIndex crosses 01/02/03/04.
 *    Accessible DOM components subscribe through useSyncExternalStore.
 *
 * Continuous scroll therefore never calls a React state setter. A stage
 * transition can re-render the small DOM overlay, but the scene is not a
 * subscriber and is isolated behind StableSceneBridge.
 */
class ScrollController {
  private readonly runtimeRef: MutableRefObject<OpshRuntimeState>;
  private readonly listeners = new Set<() => void>();
  private readonly initialIndex: number;
  private activeIndex: number;
  private lastSceneProgress: number;
  private lastTimestamp = 0;
  private velocityResetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    runtimeRef: MutableRefObject<OpshRuntimeState>,
    initialIndex: number,
  ) {
    this.runtimeRef = runtimeRef;
    this.initialIndex = clampStageIndex(initialIndex);
    this.activeIndex = this.initialIndex;
    this.lastSceneProgress = SCENE_PROGRESS_STOPS[this.initialIndex];
  }

  /**
   * Arrow methods retain the controller instance when passed directly to
   * useSyncExternalStore.
   */
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.activeIndex;

  getServerSnapshot = () => this.initialIndex;

  /**
   * GSAP's hot scroll path. It mutates runtimeRef on every update and publishes
   * to the discrete store only if the active quarter actually changes.
   */
  setScrollProgress(progress: number, timestamp?: number) {
    const normalized = clamp01(progress);
    const sceneProgress = sceneProgressFromScroll(normalized);
    const now =
      timestamp
      ?? (typeof performance !== "undefined" ? performance.now() : Date.now());
    const elapsed = this.lastTimestamp > 0
      ? Math.max(16, now - this.lastTimestamp)
      : 16;
    const instantaneousVelocity =
      Math.abs(sceneProgress - this.lastSceneProgress) / (elapsed / 1000);
    const runtime = this.runtimeRef.current;

    runtime.progress = normalized;
    runtime.targetProgress = sceneProgress;
    runtime.velocity = Math.min(
      1,
      runtime.velocity * 0.72 + instantaneousVelocity * 0.28,
    );

    this.lastTimestamp = now;
    this.lastSceneProgress = sceneProgress;
    this.commitStage(stageIndexFromScroll(normalized));
  }

  /**
   * Tabs, keyboard navigation, and mobile IntersectionObserver use this cold
   * path. The scene consumes the change on its next frame without a React prop
   * change.
   */
  selectStage(index: number) {
    const boundedIndex = clampStageIndex(index);
    const sceneProgress = SCENE_PROGRESS_STOPS[boundedIndex];
    const runtime = this.runtimeRef.current;

    runtime.progress = boundedIndex / (STAGE_COUNT - 1);
    runtime.targetProgress = sceneProgress;
    runtime.velocity = runtime.reducedMotion ? 0 : 0.18;
    this.lastSceneProgress = sceneProgress;
    this.lastTimestamp = 0;
    this.commitStage(boundedIndex);
    this.scheduleVelocityReset();
  }

  setReducedMotion(value: boolean) {
    this.runtimeRef.current.reducedMotion = value;
    if (value) this.runtimeRef.current.velocity = 0;
  }

  setDocumentVisible(value: boolean) {
    this.runtimeRef.current.documentVisible = value;
    if (!value) this.runtimeRef.current.velocity = 0;
  }

  dispose() {
    if (this.velocityResetTimer !== null) {
      clearTimeout(this.velocityResetTimer);
      this.velocityResetTimer = null;
    }
    this.listeners.clear();
  }

  private scheduleVelocityReset() {
    if (this.velocityResetTimer !== null) {
      clearTimeout(this.velocityResetTimer);
    }

    this.velocityResetTimer = setTimeout(() => {
      this.runtimeRef.current.velocity = 0;
      this.velocityResetTimer = null;
    }, 180);
  }

  private commitStage(index: number) {
    const boundedIndex = clampStageIndex(index);
    this.runtimeRef.current.stageIndex = boundedIndex;

    if (boundedIndex === this.activeIndex) return;
    this.activeIndex = boundedIndex;
    this.listeners.forEach((listener) => listener());
  }
}

function useActiveStageIndex(controller: ScrollController) {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot,
  );
}

/**
 * OpshScene currently accepts stage as a prop because explorer-mode CameraRig
 * reads stage.id and stage.camera. This stable Proxy preserves that API while
 * resolving the current stage from runtimeRef inside the render loop.
 *
 * Its identity never changes, so a stage transition does not invalidate the
 * scene component tree.
 */
function createRuntimeStageProxy(getStageIndex: () => number): OpshStage {
  return new Proxy(MECHANICAL_STAGES[0], {
    get(_target, property: string | symbol) {
      const index = clampStageIndex(getStageIndex());
      return Reflect.get(MECHANICAL_STAGES[index], property);
    },
  });
}

function StaticOpshFallback({ status }: { status: string }) {
  return (
    <div
      className="opsh-fallback"
      role="img"
      aria-label="Annotated concept model of the four-stage offshore pumped-hydro system"
    >
      <img src="/opsh-static-fallback.png" alt="" />
      <div className="opsh-fallback-shade" />
      <span className="opsh-fallback-status">{status}</span>
      <span className="opsh-fallback-label upper">Upper Reservoir</span>
      <span className="opsh-fallback-label upper-turbines">
        Upper Turbine Pair
      </span>
      <span className="opsh-fallback-label lower-turbines">
        Lower Turbine Pair
      </span>
      <span className="opsh-fallback-label lower">
        Lower Reservoir + Central Pump
      </span>
    </div>
  );
}

function StageCopy({ stage }: { stage: OpshStage }) {
  return (
    <div className="opsh-stage-copy">
      <small>
        {stage.number} / 04 · {stage.eyebrow}
      </small>
      <h3>{stage.title}</h3>
      <p>{stage.description}</p>
      <p className="opsh-stage-detail">{stage.detail}</p>
      <div className="opsh-flow-readout" aria-label="Water flow directions">
        {stage.flowDirections.map((flow) => (
          <span key={flow}>{flow}</span>
        ))}
      </div>
    </div>
  );
}

type SceneBridgeProps = {
  stageProxy: OpshStage;
  runtimeRef: MutableRefObject<OpshRuntimeState>;
  interactive: boolean;
  renderActive: boolean;
  compact: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  fallback: ReactNode;
};

/**
 * OpshScene's memo boundary.
 *
 * Stage changes do not alter stageProxy or runtimeRef identity. The scene does
 * not subscribe to ScrollController's DOM store. Its render loop continues
 * uninterrupted while tabs, copy, HUD, and ARIA content update independently.
 */
const StableSceneBridge = memo(function StableSceneBridge({
  stageProxy,
  runtimeRef,
  interactive,
  renderActive,
  compact,
  reducedMotion,
  resetSignal,
  fallback,
}: SceneBridgeProps) {
  return (
    <Suspense fallback={fallback}>
      <LazyOpshScene
        stage={stageProxy}
        motionRef={runtimeRef as MutableRefObject<OpshMotionState>}
        interactive={interactive}
        renderActive={renderActive}
        compact={compact}
        reducedMotion={reducedMotion}
        resetSignal={resetSignal}
        fallback={fallback}
      />
    </Suspense>
  );
});

type StageNavigationProps = {
  controller: ScrollController;
  variant: OpshExperienceProps["variant"];
  tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  activateStage: (
    index: number,
    options?: {
      focusTab?: boolean;
      scrollPanel?: boolean;
    },
  ) => void;
};

/**
 * Only this small navigation component subscribes to the discrete stage store.
 * It re-renders at most three times during a complete forward pass.
 */
function StageNavigation({
  controller,
  variant,
  tabRefs,
  activateStage,
}: StageNavigationProps) {
  const activeIndex = useActiveStageIndex(controller);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % STAGE_COUNT;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + STAGE_COUNT) % STAGE_COUNT;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = STAGE_COUNT - 1;
    } else {
      return;
    }

    event.preventDefault();
    activateStage(nextIndex, {
      focusTab: true,
      scrollPanel: variant === "guided",
    });
  };

  return (
    <div
      className="opsh-stage-tabs"
      role="tablist"
      aria-label="Four-stage Humpback Hydro operating sequence"
      aria-orientation="horizontal"
    >
      {MECHANICAL_STAGES.map((stage, index) => {
        const active = index === activeIndex;

        return (
          <button
            key={stage.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`opsh-tab-${variant}-${stage.id}`}
            aria-controls={`opsh-panel-${variant}-${stage.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-active={active}
            onClick={() => {
              activateStage(index, {
                scrollPanel: variant === "guided",
              });
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span>{stage.number}</span>
            <strong>{stage.shortLabel}</strong>
          </button>
        );
      })}
    </div>
  );
}

/**
 * HUD and live-region updates are isolated from both the scene and page copy.
 */
function StageHud({ controller }: { controller: ScrollController }) {
  const activeIndex = useActiveStageIndex(controller);
  const stage = MECHANICAL_STAGES[activeIndex];

  return (
    <>
      <div className="opsh-model-hud">
        <span>
          <i />
          {stage.number} · {stage.shortLabel}
        </span>
        <strong>Concept Model — Not to Scale</strong>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Stage {stage.number}: {stage.title}
      </div>
    </>
  );
}

type StagePanelsProps = {
  controller: ScrollController;
  panelRefs: MutableRefObject<Array<HTMLElement | null>>;
};

/**
 * Guided copy remains fully present in document order. data-active changes only
 * at stage boundaries, enabling the existing CSS focus treatment without
 * affecting scene rendering.
 */
function GuidedStagePanels({
  controller,
  panelRefs,
}: StagePanelsProps) {
  const activeIndex = useActiveStageIndex(controller);

  return (
    <div className="opsh-guided-stages">
      {MECHANICAL_STAGES.map((stage, index) => (
        <article
          key={stage.id}
          ref={(element) => {
            panelRefs.current[index] = element;
          }}
          id={`opsh-panel-guided-${stage.id}`}
          role="tabpanel"
          aria-labelledby={`opsh-tab-guided-${stage.id}`}
          data-opsh-stage={index}
          data-active={index === activeIndex}
        >
          <StageCopy stage={stage} />
        </article>
      ))}

      <footer className="opsh-citation">
        <small>Primary Publication</small>
        <p>{ieeeCitation}</p>
        <div>
          <a
            href="https://doi.org/10.1109/EESAT59125.2024.10471215"
            target="_blank"
            rel="noreferrer"
          >
            DOI 10.1109/EESAT59125.2024.10471215
          </a>
          <a
            href="https://ieeexplore.ieee.org/document/10471215"
            target="_blank"
            rel="noreferrer"
          >
            Official IEEE Record <Arrow />
          </a>
        </div>
      </footer>
    </div>
  );
}

/**
 * Explorer copy uses conventional tab-panel semantics. All four panels are
 * server-rendered; only the selected panel is exposed visually and to assistive
 * technology.
 */
function ExplorerStagePanels({
  controller,
  panelRefs,
}: StagePanelsProps) {
  const activeIndex = useActiveStageIndex(controller);

  return (
    <div className="opsh-explorer-copy">
      {MECHANICAL_STAGES.map((stage, index) => {
        const active = index === activeIndex;

        return (
          <article
            key={stage.id}
            ref={(element) => {
              panelRefs.current[index] = element;
            }}
            id={`opsh-panel-explorer-${stage.id}`}
            role="tabpanel"
            aria-labelledby={`opsh-tab-explorer-${stage.id}`}
            aria-hidden={!active}
            data-opsh-stage={index}
            data-active={active}
            hidden={!active}
          >
            <StageCopy stage={stage} />
          </article>
        );
      })}

      <a className="text-link light" href="/evidence">
        Review the Source Record <Arrow />
      </a>
    </div>
  );
}

/**
 * Root data attributes are useful for CSS accents and QA selectors. Their
 * subscriber is a null-rendering leaf component, not OpshExperience itself.
 */
function StageRootMetadata({
  controller,
  rootRef,
}: {
  controller: ScrollController;
  rootRef: RefObject<HTMLElement | null>;
}) {
  const activeIndex = useActiveStageIndex(controller);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.dataset.activeStage = MECHANICAL_STAGES[activeIndex].id;
    root.dataset.activeStageIndex = String(activeIndex);
    root.style.setProperty(
      "--opsh-stage-progress",
      String((activeIndex + 1) / STAGE_COUNT),
    );
  }, [activeIndex, rootRef]);

  return null;
}

export default function OpshExperience({
  variant,
  initialStage = "anatomy",
}: OpshExperienceProps) {
  const initialIndex = Math.max(
    0,
    MECHANICAL_STAGES.findIndex((stage) => stage.id === initialStage),
  );

  /**
   * These state values represent rare lifecycle changes, not stage motion:
   * lazy loading, viewport visibility, browser preferences, and Reset View.
   */
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactRendering, setCompactRendering] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);

  /**
   * The runtime object is created once and never replaced. OpshScene retains
   * this exact ref for its entire mounted lifetime.
   */
  const runtimeRef = useRef<OpshRuntimeState>({
    progress: initialIndex / (STAGE_COUNT - 1),
    targetProgress: SCENE_PROGRESS_STOPS[initialIndex],
    stageIndex: initialIndex,
    velocity: 0,
    reducedMotion: false,
    documentVisible: true,
  });

  /**
   * Controller and Proxy identities remain stable until initialStage itself
   * changes, which is not part of normal interaction.
   */
  const scrollController = useMemo(
    () => new ScrollController(runtimeRef, initialIndex),
    [initialIndex],
  );
  const stageProxy = useMemo(
    () => createRuntimeStageProxy(scrollController.getSnapshot),
    [scrollController],
  );

  useEffect(
    () => () => scrollController.dispose(),
    [scrollController],
  );

  /**
   * Load WebGL before the experience enters view. renderActive pauses the
   * Canvas frameloop after the complete experience leaves the viewport.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSceneEnabled(true);
        loadObserver.disconnect();
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

  /**
   * Browser preferences are low-frequency lifecycle events. React updates here
   * are intentional because Canvas DPR, antialiasing, and frameloop behavior
   * genuinely need to change.
   */
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 1023px)");

    const updatePreferences = () => {
      const prefersReducedMotion = motionQuery.matches;
      scrollController.setReducedMotion(prefersReducedMotion);
      setReducedMotion(prefersReducedMotion);
      setCompactRendering(widthQuery.matches);
    };

    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      scrollController.setDocumentVisible(visible);
      setDocumentVisible(visible);
    };

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
  }, [scrollController]);

  /**
   * Desktop guided mode:
   *
   * GSAP owns pinning and reports normalized progress. The hot onUpdate path
   * contains no setActiveIndex, setState, or React store dispatch.
   */
  useEffect(() => {
    if (variant !== "guided" || reducedMotion || compactRendering) return;

    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;

    let cleanup: () => void = () => undefined;
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
          scrollController.setScrollProgress(progress);
        },
      });

      cleanup = () => trigger.kill();
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    compactRendering,
    reducedMotion,
    scrollController,
    variant,
  ]);

  /**
   * Mobile and reduced-motion guided mode:
   *
   * IntersectionObserver selects discrete cards. It does not drive per-frame
   * animation and never updates React state directly.
   */
  useEffect(() => {
    if (
      variant !== "guided"
      || (!compactRendering && !reducedMotion)
    ) {
      return;
    }

    const cards = panelRefs.current.filter(
      (panel): panel is HTMLElement => panel !== null,
    );
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const index = Number(
          (visible.target as HTMLElement).dataset.opshStage ?? 0,
        );
        scrollController.selectStage(index);
      },
      {
        rootMargin: "-25% 0px -50%",
        threshold: 0.01,
      },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [
    compactRendering,
    reducedMotion,
    scrollController,
    variant,
  ]);

  const activateStage = useCallback((
    index: number,
    options: {
      focusTab?: boolean;
      scrollPanel?: boolean;
    } = {},
  ) => {
    const boundedIndex = clampStageIndex(index);
    scrollController.selectStage(boundedIndex);

    if (options.focusTab) {
      tabRefs.current[boundedIndex]?.focus();
    }

    if (options.scrollPanel && variant === "guided") {
      panelRefs.current[boundedIndex]?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [
    reducedMotion,
    scrollController,
    variant,
  ]);

  const sceneFallback = useMemo(
    () => (
      <StaticOpshFallback
        status={
          sceneEnabled
            ? "WebGL Unavailable — Static Model"
            : "Preparing Interactive Model"
        }
      />
    ),
    [sceneEnabled],
  );

  const visual = (
    <div className="opsh-visual" ref={visualRef}>
      <div className="opsh-model-frame">
        {sceneEnabled ? (
          <StableSceneBridge
            stageProxy={stageProxy}
            runtimeRef={runtimeRef}
            interactive={variant === "explorer"}
            renderActive={isVisible && documentVisible}
            compact={compactRendering}
            reducedMotion={reducedMotion}
            resetSignal={resetSignal}
            fallback={sceneFallback}
          />
        ) : (
          sceneFallback
        )}

        <StageHud controller={scrollController} />

        <div className="opsh-component-key" aria-hidden="true">
          <span>Bilateral Intakes</span>
          <span>Upper Reservoir</span>
          <span>Upper Turbine Pair</span>
          <span>Lower Turbine Pair</span>
          <span>Lower Reservoir + Central Pump</span>
        </div>
      </div>

      <StageNavigation
        controller={scrollController}
        variant={variant}
        tabRefs={tabRefs}
        activateStage={activateStage}
      />

      <OpshCalculatorLauncher />

      {variant === "explorer" && (
        <div className="opsh-explorer-tools">
          <span>Drag to Rotate · Scroll to Zoom</span>
          <button
            type="button"
            onClick={() => setResetSignal((value) => value + 1)}
          >
            Reset View
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "explorer") {
    return (
      <section
        className="opsh-experience opsh-explorer"
        ref={rootRef}
        aria-label="Interactive four-stage offshore pumped-hydro concept"
        data-active-stage={MECHANICAL_STAGES[initialIndex].id}
        data-active-stage-index={initialIndex}
      >
        <StageRootMetadata
          controller={scrollController}
          rootRef={rootRef}
        />
        {visual}
        <ExplorerStagePanels
          controller={scrollController}
          panelRefs={panelRefs}
        />
      </section>
    );
  }

  return (
    <section
      className="opsh-experience opsh-guided"
      ref={rootRef}
      aria-label="Four-stage Humpback Hydro operating sequence"
      data-active-stage={MECHANICAL_STAGES[initialIndex].id}
      data-active-stage-index={initialIndex}
    >
      <StageRootMetadata
        controller={scrollController}
        rootRef={rootRef}
      />
      {visual}
      <GuidedStagePanels
        controller={scrollController}
        panelRefs={panelRefs}
      />
    </section>
  );
}
