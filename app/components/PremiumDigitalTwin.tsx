"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import {
  DIGITAL_TWIN_CYCLE_SECONDS,
  DIGITAL_TWIN_SIGNOFF_END_SECONDS,
  DIGITAL_TWIN_SIGNOFF_START_SECONDS,
  digitalTwinSignatureStageAt,
  digitalTwinSceneAt,
  manualDigitalTwinScene,
  manualReservoirLevels,
  reservoirLevelsAt,
} from "../digital-twin";
import type {
  DigitalTwinOperation,
  DigitalTwinScene,
  DigitalTwinSignatureStage,
  ReservoirLevels,
} from "../digital-twin";

type TwinAction = "auto" | "lower" | DigitalTwinSignatureStage;
type TwinCallout = "upper" | "turbine" | "penstock" | "lower";
type WildlifeEvent = {
  kind: "fish" | "ray";
  startedAt: number;
  direction: 1 | -1;
};

type FlowVectorRoute = {
  operation: DigitalTwinOperation;
  d: string;
  className: string;
};

type ControlApi = {
  select: (action: TwinAction) => void;
  togglePause: () => boolean;
};

const phaseCopy = {
  establish: {
    index: "00",
    title: "SEQUENCE OVERVIEW",
    route: "ILLUSTRATED ARCHITECTURE",
    energy: "EXTERNAL INPUT AND OUTPUT SHOWN",
  },
  lower: {
    index: "S1",
    title: "LOWER GENERATION",
    route: "AMBIENT TO LOWER STORAGE",
    energy: "ILLUSTRATED OUTPUT  >  GRID / LOAD",
  },
  charge: {
    index: "02",
    title: "CHARGING",
    route: "LOWER TO UPPER STORAGE",
    energy: "EXTERNAL ENERGY IN  >  PUMP",
  },
  upper: {
    index: "03",
    title: "UPPER GENERATION",
    route: "UPPER STORAGE TO AMBIENT",
    energy: "ELECTRICAL OUTPUT  >  GRID / LOAD",
  },
  handoff: {
    index: "··",
    title: "STATE TRANSITION",
    route: "BETWEEN ILLUSTRATED STATES",
    energy: "QUALITATIVE SEQUENCE",
  },
  summary: {
    index: "04",
    title: "SEQUENCE ILLUSTRATED",
    route: "EXTERNAL INPUT REQUIRED FOR STORAGE",
    energy: "LOSSES REQUIRE MAKE-UP ENERGY",
  },
} as const;

const signatureSteps = [
  {
    id: "energy",
    label: "Energy In",
    rail: "External power to pump",
    duration: "8.5s",
    operation: "charge",
    copy: "External electricity enters the pumping path.",
    route: "External input → motor–pump",
    state: "Pump path energized",
    direction: "Supply → pump",
  },
  {
    id: "store",
    label: "Store",
    rail: "Water held at elevation",
    duration: "6.5s",
    operation: null,
    copy: "Water is held in elevated storage as gravitational potential energy; pumping is stopped.",
    route: "Elevated storage → held state",
    state: "Hydraulic paths static",
    direction: "No active hydraulic flow",
  },
  {
    id: "generate",
    label: "Generate",
    rail: "Stored water through turbines",
    duration: "8.5s",
    operation: "upper",
    copy: "Stored water is released through the upper generation path.",
    route: "Upper storage → turbine–generator",
    state: "Upper generation path active",
    direction: "Water moving downward",
  },
  {
    id: "dispatch",
    label: "Dispatch",
    rail: "Output to grid / load",
    duration: "7.5s",
    operation: null,
    copy: "Electrical output leaves toward the connected grid/load.",
    route: "Generator → connected grid / load",
    state: "Output path active",
    direction: "Electrical energy outward",
  },
] as const satisfies ReadonlyArray<{
  id: DigitalTwinSignatureStage;
  label: string;
  rail: string;
  duration: string;
  operation: DigitalTwinOperation | null;
  copy: string;
  route: string;
  state: string;
  direction: string;
}>;

const signaturePhaseCopy = Object.fromEntries(
  signatureSteps.map((step, index) => [
    step.id,
    {
      index: `0${index + 1}`,
      title: step.label.toUpperCase(),
      route: step.route.toUpperCase(),
      energy: `DIRECTION  ${step.direction.toUpperCase()}`,
    },
  ]),
) as Record<DigitalTwinSignatureStage, {
  index: string;
  title: string;
  route: string;
  energy: string;
}>;

const flowVectorRoutes: readonly FlowVectorRoute[] = [
  {
    operation: "lower",
    className: "lower-left",
    d: "M 365 660 H 550 C 561 660 570 669 570 680 V 698 C 570 709 579 718 590 718 H 780",
  },
  {
    operation: "lower",
    className: "lower-right",
    d: "M 1235 660 H 1022 C 1011 660 1002 669 1002 680 V 698 C 1002 709 993 718 982 718 H 820",
  },
  {
    operation: "charge",
    className: "charge-center",
    d: "M 780 720 V 250",
  },
  {
    operation: "upper",
    className: "upper-left",
    d: "M 650 250 V 320 C 650 386 604 420 570 432 H 365",
  },
  {
    operation: "upper",
    className: "upper-right",
    d: "M 950 250 V 320 C 950 386 968 420 1002 432 H 1235",
  },
] as const;

function FlowVectorLayer() {
  return (
    <svg
      className="premium-twin-flow-vectors"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="premium-twin-electrical-route is-input" data-electrical-route="input">
        <path className="electrical-line" d="M 70 610 H 675 C 720 610 745 575 775 545" />
        <path className="electrical-signal" pathLength="1" d="M 70 610 H 675 C 720 610 745 575 775 545" />
        <circle className="external-terminal" cx="70" cy="610" r="3.2" />
        <circle className="machine-terminal" cx="775" cy="545" r="4" />
        <text x="86" y="582">EXTERNAL ENERGY IN</text>
        <text x="86" y="598" className="route-sub">External Supply → Pumping System</text>
      </g>
      <g className="premium-twin-electrical-route is-output" data-electrical-route="output">
        <path className="electrical-line" d="M 1030 420 H 1525" />
        <path className="electrical-signal" pathLength="1" d="M 1030 420 H 1525" />
        <circle className="machine-terminal" cx="1030" cy="420" r="4" />
        <circle className="external-terminal" cx="1525" cy="420" r="3.2" />
        <text x="1230" y="394">ELECTRICAL OUTPUT</text>
        <text x="1230" y="410" className="route-sub">Generator → Grid / Load</text>
      </g>
      {flowVectorRoutes.map((route) => (
        <g
          className={`premium-twin-flow-group is-${route.operation} ${route.className}`}
          data-flow-vector-route
          data-operation={route.operation}
          key={route.className}
        >
          <path className="premium-twin-water-volume" data-flow-path d={route.d} />
          <g className="premium-twin-water-direction">
            {Array.from(
              { length: route.operation === "charge" ? 7 : 6 },
              (_, index) => (
                <path
                  data-water-direction
                  d="M -10 -4.5 L 0 0 L -10 4.5"
                  key={index}
                />
              ),
            )}
          </g>
        </g>
      ))}
    </svg>
  );
}

function isOperation(value: string): value is DigitalTwinOperation {
  return value === "lower" || value === "charge" || value === "upper";
}

function isSignatureStage(value: string): value is DigitalTwinSignatureStage {
  return signatureSteps.some((step) => step.id === value);
}

function calloutForScene(
  signatureStage: DigitalTwinSignatureStage | null,
  phase: DigitalTwinScene["phase"],
): TwinCallout | null {
  if (signatureStage === "energy") return "turbine";
  if (signatureStage === "store") return "upper";
  if (signatureStage === "generate") return "penstock";
  return phase === "lower" ? "lower" : null;
}

function manualSceneForSignature(stage: DigitalTwinSignatureStage) {
  if (stage === "energy") return manualDigitalTwinScene("charge");
  if (stage === "generate") return manualDigitalTwinScene("upper");
  return manualDigitalTwinScene("summary");
}

function manualLevelsForSignature(
  stage: DigitalTwinSignatureStage,
): ReservoirLevels {
  if (stage === "energy") return { upper: 0.15, lower: 0.755 };
  if (stage === "store") return { upper: 0.13, lower: 0.78 };
  if (stage === "generate") return { upper: 0.155, lower: 0.755 };
  return { upper: 0.18, lower: 0.73 };
}

export default function PremiumDigitalTwin() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const controlApiRef = useRef<ControlApi | null>(null);
  const [selectedAction, setSelectedAction] = useState<TwinAction>("auto");
  const [paused, setPaused] = useState(false);
  const [visibleStage, setVisibleStage] =
    useState<DigitalTwinSignatureStage | null>("energy");
  const [exitingCallout, setExitingCallout] = useState<TwinCallout | null>(null);
  const [announcedPhase, setAnnouncedPhase] = useState("Energy In");

  useEffect(() => {
    const root = rootRef.current;
    const canvasElement = canvasRef.current;
    if (!root || !canvasElement) return;
    const context = canvasElement.getContext("2d");
    if (!context) return;

    const rootElement = root;
    const ctx = context;
    const canvas = canvasElement;
    const image = new Image();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const machinery = {
      lower: 0,
      charge: 0,
      upper: 0,
    };
    const machineryAngles = {
      lower: 0,
      charge: 0,
      upper: 0,
    };
    const displayedLevels: ReservoirLevels = { upper: 0.18, lower: 0.73 };
    let levelsInitialized = false;
    const vectorRoutes = Array.from(
      root.querySelectorAll<SVGGElement>("[data-flow-vector-route]"),
    ).flatMap((group) => {
      const operation = group.dataset.operation;
      const path = group.querySelector<SVGPathElement>("[data-flow-path]");
      if (!operation || !isOperation(operation) || !path) return [];
      return [{
        group,
        operation,
        path,
        length: path.getTotalLength(),
        directions: Array.from(
          group.querySelectorAll<SVGPathElement>("[data-water-direction]"),
        ),
      }];
    });

    let forcedAction: Exclude<TwinAction, "auto"> | null = null;
    let manuallyPaused = false;
    let pauseAt = 0;
    let start = performance.now();
    let lastFrame = 0;
    let animationFrame: number | null = null;
    let documentVisible = !document.hidden;
    let inViewport = false;
    let sequenceStarted = false;
    let entryStartTimer: number | null = null;
    let automaticSuspensionStarted: number | null = null;
    let reducedMotion = motionQuery.matches;
    let renderedUiPhase = "";
    let renderedAnnouncement = "";
    let renderedCallout: TwinCallout | null = "turbine";
    let calloutExitTimer: number | null = null;
    let wildlifeStage: DigitalTwinSignatureStage | null = "energy";
    let transitionCount = 0;
    let wildlifeEvents: WildlifeEvent[] = [];
    let disposed = false;
    rootElement.dataset.animationSuspended = "true";

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(640, Math.round(rect.width * dpr));
      const height = Math.round((width * 9) / 16);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function updateFlowVectors(
      scene: DigitalTwinScene,
      signatureStage: DigitalTwinSignatureStage | null,
      seconds: number,
    ) {
      const activeOperation = isOperation(scene.phase) ? scene.phase : null;
      if (activeOperation) rootElement.dataset.activeOperation = activeOperation;
      else delete rootElement.dataset.activeOperation;
      if (signatureStage) {
        rootElement.dataset.activeSignatureStage = signatureStage;
      } else {
        delete rootElement.dataset.activeSignatureStage;
      }
      vectorRoutes.forEach(({ group, operation, path, length, directions }) => {
        let strength = 0;
        if (scene.phase === operation) {
          if (signatureStage === "energy" && operation === "charge") {
            strength = motionEnvelope(scene.progress, 0.16, 0.92, 0.14) * 0.76;
          } else if (signatureStage === "generate" && operation === "upper") {
            strength = motionEnvelope(scene.progress, 0.12, 0.93, 0.14) * 0.86;
          } else if (operation === "lower") {
            strength = motionEnvelope(scene.progress, 0.1, 0.92, 0.18) * 0.72;
          } else {
            strength = scene.activity;
          }
        }
        group.style.setProperty(
          "--flow-opacity",
          strength > 0.015 ? String(0.12 + strength * 0.82) : "0",
        );
        const speed = operation === "charge" ? 0.09 : operation === "upper" ? 0.084 : 0.078;
        directions.forEach((direction, index) => {
          const fraction = reducedMotion
            ? (index + 0.5) / directions.length
            : (seconds * speed * 1.12 + index / directions.length) % 1;
          const distance = fraction * length;
          const point = path.getPointAtLength(distance);
          const nextPoint = path.getPointAtLength(Math.min(length, distance + 2));
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const magnitude = Math.max(0.001, Math.hypot(dx, dy));
          const lane = index % 2 === 0 ? -2.2 : 2.2;
          const x = point.x + (-dy / magnitude) * lane;
          const y = point.y + (dx / magnitude) * lane;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          direction.setAttribute(
            "transform",
            `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
          );
          direction.style.opacity = String(0.42 + strength * 0.52);
        });
      });
    }

    function smoothUnit(value: number) {
      const bounded = Math.max(0, Math.min(1, value));
      return bounded * bounded * (3 - 2 * bounded);
    }

    function motionEnvelope(
      progress: number,
      start: number,
      end: number,
      edge: number,
    ) {
      return (
        smoothUnit((progress - start) / edge) *
        smoothUnit((end - progress) / edge)
      );
    }

    function easeToward(
      value: number,
      target: number,
      delta: number,
      riseResponse = 0.34,
      fallResponse = 0.72,
    ) {
      const response = target > value ? riseResponse : fallResponse;
      return value + (target - value) * (1 - Math.exp(-delta / response));
    }

    function updateMachinery(
      scene: DigitalTwinScene,
      signatureStage: DigitalTwinSignatureStage | null,
      delta: number,
    ) {
      const targets = {
        lower:
          scene.phase === "lower"
            ? motionEnvelope(scene.progress, 0.08, 0.91, 0.17) * 0.62
            : 0,
        charge:
          scene.phase === "charge"
            ? motionEnvelope(scene.progress, 0.07, 0.93, 0.15)
            : signatureStage === "store"
              ? smoothUnit((0.82 - scene.progress) / 0.28) * 0.1
              : 0,
        upper:
          scene.phase === "upper"
            ? motionEnvelope(scene.progress, 0.05, 0.93, 0.16)
            : signatureStage === "dispatch"
              ? smoothUnit((0.88 - scene.progress) / 0.3) * 0.28
              : 0,
      };
      (["lower", "charge", "upper"] as const).forEach((key) => {
        machinery[key] = reducedMotion
          ? targets[key]
          : easeToward(machinery[key], targets[key], delta, 1.05, 1.34);
        if (!reducedMotion) {
          const angularVelocity = key === "charge" ? 2.62 : key === "upper" ? 2.34 : 1.76;
          const direction = key === "upper" ? -1 : 1;
          machineryAngles[key] += direction * machinery[key] * angularVelocity * delta;
        }
      });
    }

    function updateDisplayedLevels(levels: ReservoirLevels, delta: number) {
      if (!levelsInitialized || reducedMotion) {
        displayedLevels.upper = levels.upper;
        displayedLevels.lower = levels.lower;
        levelsInitialized = true;
        return displayedLevels;
      }
      if (manuallyPaused) return displayedLevels;
      displayedLevels.upper = easeToward(
        displayedLevels.upper,
        levels.upper,
        delta,
        1.08,
        1.16,
      );
      displayedLevels.lower = easeToward(
        displayedLevels.lower,
        levels.lower,
        delta,
        1.08,
        1.16,
      );
      return displayedLevels;
    }

    function panel(
      x: number,
      y: number,
      width: number,
      height: number,
      alpha = 0.78,
    ) {
      ctx.save();
      ctx.fillStyle = `rgba(3,18,25,${alpha})`;
      ctx.strokeStyle = "rgba(111,224,217,.30)";
      ctx.lineWidth = Math.max(1, canvas.width / 1600);
      ctx.fillRect(
        x * canvas.width,
        y * canvas.height,
        width * canvas.width,
        height * canvas.height,
      );
      ctx.strokeRect(
        x * canvas.width,
        y * canvas.height,
        width * canvas.width,
        height * canvas.height,
      );
      ctx.restore();
    }

    function font(size: number, weight = 500, mono = false) {
      const family = mono
        ? "Consolas, ui-monospace, monospace"
        : "Bahnschrift, Segoe UI, sans-serif";
      return `${weight} ${Math.round((size * canvas.width) / 1600)}px ${family}`;
    }

    function textLabel(
      text: string,
      x: number,
      y: number,
      size: number,
      color = "#d9f4f3",
      align: CanvasTextAlign = "left",
      mono = false,
      weight = 500,
    ) {
      ctx.save();
      ctx.font = font(size, weight, mono);
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, x * canvas.width, y * canvas.height);
      ctx.restore();
    }

    function drawReservoirWater(
      startX: number,
      endX: number,
      levelY: number,
      bottomY: number,
      intensity: number,
      motionTime: number,
      fillStrength: number,
    ) {
      const left = startX * canvas.width;
      const right = endX * canvas.width;
      const surface = levelY * canvas.height;
      const bottom = bottomY * canvas.height;
      const depth = Math.max(1, bottom - surface);
      const surfaceAmplitude = Math.max(
        0.8,
        (canvas.width / 1600) * (1.8 + intensity),
      );
      const surfacePhase = motionTime * 0.42;
      const traceWaterSurface = (offset = 0) => {
        const segments = 5;
        const segmentWidth = (right - left) / segments;
        const contour = [0.18, -0.26, 0.31, -0.14, 0.09, -0.04];
        ctx.moveTo(
          left,
          surface +
            (contour[0] + Math.sin(surfacePhase) * 0.16) * surfaceAmplitude +
            offset,
        );
        for (let index = 0; index < segments; index += 1) {
          const endX = left + segmentWidth * (index + 1);
          const endY =
            surface +
            (contour[index + 1] +
              Math.sin(surfacePhase + index * 0.91) * 0.14) *
              surfaceAmplitude +
            offset;
          const controlY =
            surface +
            (contour[index] * 0.65 +
              Math.sin(surfacePhase * 0.78 + index * 1.47 + 0.65) * 0.42) *
              surfaceAmplitude +
            offset;
          ctx.quadraticCurveTo(
            endX - segmentWidth * 0.5,
            controlY,
            endX,
            endY,
          );
        }
      };

      ctx.save();
      ctx.beginPath();
      traceWaterSurface();
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.clip();

      const waterFill = ctx.createLinearGradient(0, surface, 0, bottom);
      waterFill.addColorStop(0, `rgba(20,128,166,${fillStrength + intensity * 0.025})`);
      waterFill.addColorStop(0.42, `rgba(8,88,124,${fillStrength * 0.88})`);
      waterFill.addColorStop(1, `rgba(2,48,74,${fillStrength * 1.08})`);
      ctx.fillStyle = waterFill;
      ctx.fillRect(
        left,
        surface - surfaceAmplitude * 2,
        right - left,
        depth + surfaceAmplitude * 2,
      );
      const edgeShade = ctx.createLinearGradient(left, 0, right, 0);
      edgeShade.addColorStop(0, "rgba(1,17,27,.62)");
      edgeShade.addColorStop(0.14, "rgba(1,17,27,0)");
      edgeShade.addColorStop(0.86, "rgba(1,17,27,0)");
      edgeShade.addColorStop(1, "rgba(1,17,27,.62)");
      ctx.fillStyle = edgeShade;
      ctx.fillRect(
        left,
        surface - surfaceAmplitude * 2,
        right - left,
        depth + surfaceAmplitude * 2,
      );

      const surfaceBand = ctx.createLinearGradient(0, surface, 0, surface + depth * 0.2);
      surfaceBand.addColorStop(0, `rgba(128,219,226,${0.11 + intensity * 0.035})`);
      surfaceBand.addColorStop(1, "rgba(45,141,169,0)");
      ctx.fillStyle = surfaceBand;
      ctx.fillRect(
        left,
        surface - surfaceAmplitude * 2,
        right - left,
        depth * 0.2 + surfaceAmplitude * 2,
      );

      const refraction = ctx.createLinearGradient(left, surface, right, bottom);
      refraction.addColorStop(0, "rgba(185,238,239,.015)");
      refraction.addColorStop(0.38, `rgba(185,238,239,${0.045 + intensity * 0.025})`);
      refraction.addColorStop(0.52, "rgba(185,238,239,.008)");
      refraction.addColorStop(0.78, `rgba(91,176,193,${0.035 + intensity * 0.018})`);
      refraction.addColorStop(1, "rgba(91,176,193,0)");
      ctx.fillStyle = refraction;
      ctx.fillRect(
        left,
        surface - surfaceAmplitude * 2,
        right - left,
        depth + surfaceAmplitude * 2,
      );

      ctx.globalCompositeOperation = "screen";
      for (let index = 0; index < 18; index += 1) {
        const direction = index % 2 === 0 ? 1 : -1;
        const drift = motionTime * (0.0045 + (index % 4) * 0.0012) * direction;
        const position = ((index * 0.137 + drift) % 1 + 1) % 1;
        const x = left + position * (right - left);
        const y = surface + depth * (0.1 + (index % 7) * 0.125);
        const length = (right - left) * (0.035 + (index % 5) * 0.01);
        const bend = ((index % 3) - 1) * Math.max(1, depth * 0.012);
        ctx.beginPath();
        ctx.moveTo(Math.max(left, x - length * 0.5), y);
        ctx.quadraticCurveTo(x, y + bend, Math.min(right, x + length * 0.5), y);
        if (index % 3 === 0) {
          ctx.moveTo(x, y + bend * 0.35);
          ctx.lineTo(
            Math.min(right, x + length * 0.18),
            y + depth * 0.045,
          );
        }
        ctx.strokeStyle = `rgba(164,230,234,${0.05 + intensity * 0.045})`;
        ctx.lineWidth = Math.max(0.55, (0.72 * canvas.width) / 1600);
        ctx.stroke();
      }

      for (let index = 0; index < 10; index += 1) {
        const drift = motionTime * (0.0024 + (index % 3) * 0.0007);
        const xFraction = ((index * 0.173 + drift) % 1 + 1) % 1;
        const yFraction = ((index * 0.219 - drift * 0.48) % 1 + 1) % 1;
        const x = left + xFraction * (right - left);
        const y = surface + depth * (0.12 + yFraction * 0.78);
        ctx.beginPath();
        ctx.ellipse(
          x,
          y,
          Math.max(0.55, canvas.width / 2200),
          Math.max(0.35, canvas.width / 3600),
          index * 0.37,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(190,230,230,${0.035 + intensity * 0.025})`;
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = `rgba(174,235,236,${0.64 + intensity * 0.12})`;
      ctx.lineWidth = Math.max(1, (1.35 * canvas.width) / 1600);
      ctx.beginPath();
      traceWaterSurface();
      ctx.stroke();
      for (let index = 0; index < 4; index += 1) {
        const position = ((index * 0.29 + motionTime * 0.006) % 1 + 1) % 1;
        const segmentX = left + position * (right - left);
        const segmentLength = (right - left) * (0.055 + index * 0.008);
        ctx.beginPath();
        const shimmerY = surface + surfaceAmplitude * 0.55;
        ctx.moveTo(segmentX, shimmerY);
        ctx.quadraticCurveTo(
          segmentX + segmentLength * 0.5,
          shimmerY - surfaceAmplitude * 0.35,
          Math.min(right, segmentX + segmentLength),
          shimmerY,
        );
        ctx.strokeStyle = `rgba(221,247,246,${0.11 + intensity * 0.055})`;
        ctx.lineWidth = Math.max(0.75, (1.05 * canvas.width) / 1600);
        ctx.stroke();
      }
      if (intensity > 0.06) {
        const disturbanceX = (left + right) * 0.5;
        ctx.globalAlpha = Math.min(0.28, intensity * 0.24);
        for (let index = 0; index < 2; index += 1) {
          const spread =
            (right - left) *
            (0.045 + index * 0.035 + ((motionTime * 0.018) % 0.025));
          ctx.beginPath();
          ctx.ellipse(
            disturbanceX,
            surface + surfaceAmplitude * 0.35,
            spread,
            surfaceAmplitude * (0.5 + index * 0.2),
            0,
            Math.PI,
            Math.PI * 2,
          );
          ctx.strokeStyle = "rgba(205,241,241,.42)";
          ctx.lineWidth = Math.max(0.7, canvas.width / 1800);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawMachineryCue(
      cx: number,
      cy: number,
      radiusRatio: number,
      angle: number,
      strength: number,
    ) {
      if (strength < 0.025) return;
      const x = cx * canvas.width;
      const y = cy * canvas.height;
      const radius = radiusRatio * canvas.width;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();

      const housingShade = ctx.createRadialGradient(0, 0, radius * 0.26, 0, 0, radius);
      housingShade.addColorStop(0, "rgba(2,10,13,.03)");
      housingShade.addColorStop(0.62, "rgba(2,10,13,.12)");
      housingShade.addColorStop(1, "rgba(1,6,9,.38)");
      ctx.fillStyle = housingShade;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

      ctx.rotate(angle);
      ctx.lineCap = "round";
      const bladeCount = 7;
      for (let index = 0; index < bladeCount; index += 1) {
        ctx.save();
        ctx.rotate((index / bladeCount) * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(radius * 0.02, -radius * 0.12);
        ctx.quadraticCurveTo(
          radius * 0.44,
          -radius * 0.3,
          radius * 0.67,
          -radius * 0.1,
        );
        ctx.quadraticCurveTo(
          radius * 0.48,
          radius * 0.02,
          radius * 0.16,
          radius * 0.12,
        );
        ctx.closePath();
        const bladeMetal = ctx.createLinearGradient(
          -radius * 0.08,
          -radius * 0.25,
          radius * 0.62,
          0,
        );
        bladeMetal.addColorStop(0, `rgba(35,70,76,${0.5 + strength * 0.18})`);
        bladeMetal.addColorStop(0.52, `rgba(224,233,229,${0.56 + strength * 0.28})`);
        bladeMetal.addColorStop(1, `rgba(70,126,130,${0.44 + strength * 0.2})`);
        ctx.fillStyle = bladeMetal;
        ctx.fill();
        ctx.strokeStyle = `rgba(224,236,232,${0.48 + strength * 0.28})`;
        ctx.lineWidth = Math.max(0.75, (1.15 * canvas.width) / 1600);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.075 + strength * 0.085;
      ctx.lineWidth = Math.max(1.4, (3.1 * canvas.width) / 1600);
      ctx.strokeStyle = "rgba(178,226,224,.72)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.59, -1.55, -0.45);
      ctx.stroke();
      ctx.restore();

      const metallicSweep = ctx.createConicGradient(-0.45, 0, 0);
      metallicSweep.addColorStop(0, "rgba(185,210,207,0)");
      metallicSweep.addColorStop(0.09, `rgba(185,210,207,${0.11 + strength * 0.15})`);
      metallicSweep.addColorStop(0.2, "rgba(185,210,207,0)");
      metallicSweep.addColorStop(0.62, "rgba(99,155,156,0)");
      metallicSweep.addColorStop(0.7, `rgba(99,155,156,${0.06 + strength * 0.09})`);
      metallicSweep.addColorStop(0.79, "rgba(99,155,156,0)");
      metallicSweep.addColorStop(1, "rgba(185,210,207,0)");
      ctx.fillStyle = metallicSweep;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.84, 0, Math.PI * 2);
      ctx.fill();

      const hubMetal = ctx.createRadialGradient(
        -radius * 0.08,
        -radius * 0.1,
        radius * 0.04,
        0,
        0,
        radius * 0.24,
      );
      hubMetal.addColorStop(0, `rgba(211,225,222,${0.25 + strength * 0.12})`);
      hubMetal.addColorStop(0.48, `rgba(96,137,140,${0.27 + strength * 0.11})`);
      hubMetal.addColorStop(1, "rgba(20,49,54,.72)");
      ctx.fillStyle = hubMetal;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(189,222,219,${0.28 + strength * 0.24})`;
      ctx.lineWidth = Math.max(0.8, (1.25 * canvas.width) / 1600);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2, true);
      ctx.fillStyle = `rgba(136,164,162,${0.025 + strength * 0.045})`;
      ctx.fill("evenodd");

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.69, -0.42, 0.62);
      ctx.strokeStyle = `rgba(188,207,204,${0.1 + strength * 0.16})`;
      ctx.lineWidth = Math.max(1, (2.6 * canvas.width) / 1600);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.43, Math.PI * 0.78, Math.PI * 1.58);
      ctx.strokeStyle = `rgba(111,174,176,${0.07 + strength * 0.12})`;
      ctx.lineWidth = Math.max(0.8, (1.55 * canvas.width) / 1600);
      ctx.stroke();

      const edgeOcclusion = ctx.createRadialGradient(0, 0, radius * 0.48, 0, 0, radius);
      edgeOcclusion.addColorStop(0, "rgba(1,7,10,0)");
      edgeOcclusion.addColorStop(0.72, "rgba(1,7,10,.04)");
      edgeOcclusion.addColorStop(1, "rgba(1,7,10,.34)");
      ctx.fillStyle = edgeOcclusion;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }

    function drawMachineryMotion() {
      drawMachineryCue(0.364, 0.48, 0.027, machineryAngles.charge, machinery.charge);
      drawMachineryCue(0.617, 0.48, 0.027, -machineryAngles.charge, machinery.charge);
      drawMachineryCue(0.486, 0.555, 0.024, machineryAngles.charge * 0.92, machinery.charge * 0.9);
      drawMachineryCue(0.364, 0.48, 0.027, machineryAngles.upper, machinery.upper);
      drawMachineryCue(0.617, 0.48, 0.027, -machineryAngles.upper, machinery.upper);
      drawMachineryCue(0.364, 0.735, 0.026, machineryAngles.lower, machinery.lower);
      drawMachineryCue(0.626, 0.735, 0.026, -machineryAngles.lower, machinery.lower);
    }

    function drawFish(x: number, y: number, size: number, direction: 1 | -1, alpha: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(7,37,45,.88)";
      ctx.strokeStyle = "rgba(111,177,181,.3)";
      ctx.lineWidth = Math.max(0.7, canvas.width / 2400);
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-size * 0.82, 0);
      ctx.lineTo(-size * 1.38, -size * 0.48);
      ctx.lineTo(-size * 1.26, size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawStingray(x: number, y: number, size: number, direction: 1 | -1, alpha: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(5,29,38,.9)";
      ctx.strokeStyle = "rgba(111,177,181,.34)";
      ctx.lineWidth = Math.max(0.8, canvas.width / 2200);
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.quadraticCurveTo(size * 0.22, -size * 0.7, -size * 0.88, -size * 0.12);
      ctx.quadraticCurveTo(-size * 0.2, size * 0.62, size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-size * 0.72, 0);
      ctx.quadraticCurveTo(-size * 1.45, size * 0.16, -size * 2.05, size * 0.42);
      ctx.stroke();
      ctx.restore();
    }

    function drawMarineWildlife(elapsed: number) {
      if (reducedMotion || wildlifeEvents.length === 0) return;
      wildlifeEvents = wildlifeEvents.filter((event) => {
        const duration = event.kind === "ray" ? 7.4 : 5.8;
        const age = elapsed - event.startedAt;
        if (age < 0 || age > duration) return false;
        const progress = age / duration;
        const fade = Math.min(1, age / 0.8, (duration - age) / 0.9);
        if (event.kind === "ray") {
          const excursion = Math.sin(progress * Math.PI) * 0.2;
          const xFraction = event.direction === 1
            ? -0.035 + excursion
            : 1.035 - excursion;
          drawStingray(
            xFraction * canvas.width,
            canvas.height * (0.59 + Math.sin(progress * Math.PI) * 0.012),
            canvas.width * 0.018,
            event.direction,
            fade * 0.27,
          );
        } else {
          // Wildlife is peripheral ambience only. Keep each school inside the
          // open-water margins so it can never pass over the structure.
          const edgeTravel = smoothUnit(progress);
          const xFraction = event.direction === 1
            ? 0.05 + edgeTravel * 0.12
            : 0.95 - edgeTravel * 0.12;
          const x = xFraction * canvas.width;
          for (let index = 0; index < 3; index += 1) {
            drawFish(
              x - event.direction * index * canvas.width * 0.024,
              canvas.height * (0.61 + index * 0.026 + Math.sin(progress * 8 + index) * 0.006),
              canvas.width * (0.0072 - index * 0.0007),
              event.direction,
              fade * (0.3 - index * 0.045),
            );
          }
        }
        return true;
      });
    }

    function drawLevels(
      levels: ReservoirLevels,
      activity: number,
      motionTime: number,
    ) {
      ctx.save();
      const upperVoid = ctx.createLinearGradient(
        0,
        0.11 * canvas.height,
        0,
        levels.upper * canvas.height,
      );
      upperVoid.addColorStop(0, "rgba(2,11,16,.84)");
      upperVoid.addColorStop(1, "rgba(3,18,24,.64)");
      ctx.fillStyle = upperVoid;
      ctx.fillRect(
        0.395 * canvas.width,
        0.11 * canvas.height,
        0.21 * canvas.width,
        Math.max(0, levels.upper - 0.11) * canvas.height,
      );
      const lowerVoid = ctx.createLinearGradient(
        0,
        0.64 * canvas.height,
        0,
        levels.lower * canvas.height,
      );
      lowerVoid.addColorStop(0, "rgba(2,11,16,.78)");
      lowerVoid.addColorStop(1, "rgba(3,18,24,.58)");
      ctx.fillStyle = lowerVoid;
      ctx.fillRect(
        0.405 * canvas.width,
        0.64 * canvas.height,
        0.19 * canvas.width,
        Math.max(0, levels.lower - 0.64) * canvas.height,
      );
      ctx.restore();

      drawReservoirWater(
        0.395,
        0.605,
        levels.upper,
        0.285,
        activity,
        motionTime,
        0.19,
      );
      drawReservoirWater(
        0.405,
        0.595,
        levels.lower,
        0.865,
        activity * 0.72,
        motionTime + 1.8,
        0.22,
      );
      textLabel(
        "UPPER LEVEL",
        0.565,
        levels.upper + 0.004,
        10,
        "rgba(205,240,239,.8)",
      );
      textLabel(
        "LOWER LEVEL",
        0.605,
        levels.lower + 0.004,
        10,
        "rgba(205,240,239,.8)",
      );
    }

    function drawHud(
      scene: DigitalTwinScene,
      signatureStage: DigitalTwinSignatureStage | null,
    ) {
      if (window.innerWidth <= 760) return;
      const phase = signatureStage ? signaturePhaseCopy[signatureStage] : phaseCopy[scene.phase];
      const elapsed = manuallyPaused ? pauseAt / 1000 : (performance.now() - start) / 1000;
      const t = elapsed % DIGITAL_TWIN_CYCLE_SECONDS;
      if (t >= DIGITAL_TWIN_SIGNOFF_START_SECONDS && !forcedAction) return;

      panel(0.025, 0.035, 0.19, 0.09, 0.7);
      textLabel("HUMPBACK HYDRO", 0.042, 0.066, 10, "#70d9e8", "left", true);
      textLabel("SIGNATURE TECHNOLOGY", 0.042, 0.097, 17, "#f3fbfd");
      textLabel(
        "CONCEPTUAL MARINE ARCHITECTURE",
        0.042,
        0.117,
        8,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );

      panel(0.795, 0.042, 0.18, 0.112, 0.7);
      textLabel(
        "ILLUSTRATED STATE  /  " + phase.index,
        0.812,
        0.073,
        8,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );
      textLabel(phase.title, 0.812, 0.108, 16, "#f3fbfd");
      textLabel(
        "PROCESS STATE / QUALITATIVE",
        0.812,
        0.134,
        8,
        "#70d9e8",
        "left",
        true,
      );
    }

    function syncPhaseUi(
      scene: DigitalTwinScene,
      signatureStage: DigitalTwinSignatureStage | null,
    ) {
      const nextVisibleStage = signatureStage ?? "";
      if (nextVisibleStage !== renderedUiPhase) {
        renderedUiPhase = nextVisibleStage;
        setVisibleStage(signatureStage);
      }

      const nextCallout = calloutForScene(signatureStage, scene.phase);
      if (nextCallout !== renderedCallout) {
        const departingCallout = renderedCallout;
        renderedCallout = nextCallout;
        if (departingCallout) {
          if (calloutExitTimer !== null) window.clearTimeout(calloutExitTimer);
          setExitingCallout(departingCallout);
          calloutExitTimer = window.setTimeout(() => {
            setExitingCallout(null);
            calloutExitTimer = null;
          }, departingCallout === "lower"
            ? 1180
            : departingCallout === "upper" || departingCallout === "penstock"
              ? 1080
              : 980);
        }
      }

      const announcement = signatureStage
        ? signatureSteps.find((step) => step.id === signatureStage)?.label ??
          phaseCopy[scene.phase].title
        : scene.phase === "lower"
          ? "Lower Generation — Separate Architecture Path"
          : phaseCopy[scene.phase].title.replace(" / ", " and ");
      if (announcement !== renderedAnnouncement) {
        renderedAnnouncement = announcement;
        setAnnouncedPhase(announcement);
      }
    }

    function drawFrame(now: number) {
      resize();
      if (!image.complete || image.naturalWidth === 0) return;
      const delta =
        manuallyPaused || !lastFrame
          ? 0
          : Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
      if (!manuallyPaused) lastFrame = now;
      const elapsed = sequenceStarted
        ? (manuallyPaused ? pauseAt : now - start) / 1000
        : 0;
      const signatureStage = forcedAction && isSignatureStage(forcedAction)
        ? forcedAction
        : forcedAction === "lower"
            ? null
            : reducedMotion
              ? "energy"
              : digitalTwinSignatureStageAt(elapsed);
      const scene = forcedAction && isSignatureStage(forcedAction)
        ? manualSceneForSignature(forcedAction)
        : forcedAction === "lower"
          ? manualDigitalTwinScene("lower")
          : reducedMotion
            ? manualSceneForSignature("energy")
            : digitalTwinSceneAt(elapsed);
      const motionTime = reducedMotion ? 0 : elapsed;
      if (!forcedAction && signatureStage && signatureStage !== wildlifeStage) {
        wildlifeStage = signatureStage;
        transitionCount += 1;
        const direction: 1 | -1 = transitionCount % 2 === 0 ? -1 : 1;
        if (transitionCount % 3 === 0) {
          wildlifeEvents.push({ kind: "fish", startedAt: elapsed, direction });
        }
        if (transitionCount % 10 === 0) {
          wildlifeEvents.push({
            kind: "ray",
            startedAt: elapsed,
            direction: direction === 1 ? -1 : 1,
          });
        }
      }
      const levels = forcedAction && isSignatureStage(forcedAction)
        ? manualLevelsForSignature(forcedAction)
        : forcedAction === "lower"
          ? manualReservoirLevels("lower")
        : reducedMotion
          ? manualLevelsForSignature("energy")
          : reservoirLevelsAt(elapsed);
      const cycleTime =
        ((elapsed % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
        DIGITAL_TWIN_CYCLE_SECONDS;
      const cycleComplete =
        !forcedAction &&
        cycleTime >= DIGITAL_TWIN_SIGNOFF_START_SECONDS &&
        cycleTime < DIGITAL_TWIN_SIGNOFF_END_SECONDS;
      if (cycleComplete) {
        rootElement.dataset.cycleSignoff = "true";
      } else {
        delete rootElement.dataset.cycleSignoff;
      }
      if (!forcedAction && sequenceStarted && elapsed >= DIGITAL_TWIN_SIGNOFF_END_SECONDS) {
        rootElement.dataset.sequenceComplete = "true";
      }
      updateMachinery(scene, signatureStage, delta);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const sceneScale = 1;
      ctx.save();
      ctx.fillStyle = "#021019";
      ctx.fillRect(0, 0, width, height);
      ctx.translate(
        ((1 - sceneScale) * width) / 2,
        ((1 - sceneScale) * height) / 2,
      );
      ctx.scale(sceneScale, sceneScale);
      ctx.filter = "saturate(.9) brightness(.76) contrast(1.1)";
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        width,
        height,
      );
      ctx.filter = "none";
      ctx.fillStyle = "rgba(1,14,23,.07)";
      ctx.fillRect(0, 0, width, height);

      const underwaterTone = ctx.createLinearGradient(
        0,
        height * 0.43,
        0,
        height,
      );
      underwaterTone.addColorStop(0, "rgba(8,44,56,.08)");
      underwaterTone.addColorStop(1, "rgba(5,34,47,.14)");
      ctx.fillStyle = underwaterTone;
      ctx.fillRect(0, height * 0.43, width, height * 0.57);

      const waterMotionTime = motionTime * (
        signatureStage === "energy" ||
        signatureStage === "generate" ||
        scene.phase === "lower"
          ? 1
          : 0.16
      );
      drawLevels(
        updateDisplayedLevels(levels, delta),
        scene.activity,
        waterMotionTime,
      );
      drawMarineWildlife(motionTime);
      drawMachineryMotion();
      ctx.restore();

      updateFlowVectors(scene, signatureStage, motionTime);

      drawHud(scene, signatureStage);
      syncPhaseUi(scene, signatureStage);
    }

    function shouldAnimate() {
      return sequenceStarted && !manuallyPaused && !reducedMotion && documentVisible && inViewport;
    }

    function scheduleFrame() {
      if (disposed || animationFrame !== null) return;
      animationFrame = requestAnimationFrame((now) => {
        animationFrame = null;
        drawFrame(now);
        if (shouldAnimate()) scheduleFrame();
      });
    }

    function syncAutomaticSuspension() {
      const active = documentVisible && inViewport;
      const now = performance.now();
      if (!sequenceStarted) {
        rootElement.dataset.animationSuspended = "true";
        if (active && !reducedMotion && entryStartTimer === null) {
          entryStartTimer = window.setTimeout(() => {
            entryStartTimer = null;
            if (disposed || !documentVisible || !inViewport) return;
            sequenceStarted = true;
            start = performance.now();
            lastFrame = start;
            automaticSuspensionStarted = null;
            delete rootElement.dataset.animationSuspended;
            scheduleFrame();
          }, 1500);
        } else if (!active && entryStartTimer !== null) {
          window.clearTimeout(entryStartTimer);
          entryStartTimer = null;
        }
        scheduleFrame();
        return;
      }
      if (active) delete rootElement.dataset.animationSuspended;
      else rootElement.dataset.animationSuspended = "true";
      if (!active && automaticSuspensionStarted === null) {
        automaticSuspensionStarted = now;
      } else if (active && automaticSuspensionStarted !== null) {
        if (!manuallyPaused) start += now - automaticSuspensionStarted;
        automaticSuspensionStarted = null;
        lastFrame = now;
      }
      if (active) scheduleFrame();
    }

    controlApiRef.current = {
      select(action) {
        forcedAction = action === "auto" ? null : action;
        if (action === "auto") {
          if (manuallyPaused) pauseAt = 0;
          else start = performance.now() - 700;
        }
        lastFrame = performance.now();
        scheduleFrame();
      },
      togglePause() {
        const now = performance.now();
        manuallyPaused = !manuallyPaused;
        if (manuallyPaused) pauseAt = now - start;
        else start = now - pauseAt;
        lastFrame = now;
        scheduleFrame();
        return manuallyPaused;
      },
    };

    const resizeObserver = new ResizeObserver(() => scheduleFrame());
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.18);
        syncAutomaticSuspension();
      },
      { rootMargin: "0px", threshold: [0, 0.18] },
    );
    intersectionObserver.observe(root);

    const handleVisibility = () => {
      documentVisible = !document.hidden;
      syncAutomaticSuspension();
    };
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      machinery.lower = 0;
      machinery.charge = 0;
      machinery.upper = 0;
      scheduleFrame();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);

    image.onload = () => scheduleFrame();
    image.src = "/digital-twin/humpback-digital-twin-approved-dusk-no-rays.png";
    if (image.complete) scheduleFrame();

    return () => {
      disposed = true;
      controlApiRef.current = null;
      image.onload = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      if (calloutExitTimer !== null) window.clearTimeout(calloutExitTimer);
      if (entryStartTimer !== null) window.clearTimeout(entryStartTimer);
    };
  }, []);

  const selectAction = (action: TwinAction) => {
    controlApiRef.current?.select(action);
    setSelectedAction(action);
    if (isSignatureStage(action)) {
      setVisibleStage(action);
      setAnnouncedPhase(
        signatureSteps.find((step) => step.id === action)?.label ?? action,
      );
    } else if (action === "lower") {
      setVisibleStage(null);
      setAnnouncedPhase("Lower Generation — Separate Architecture Path");
    } else {
      setVisibleStage("energy");
      setAnnouncedPhase("Energy In");
    }
  };

  const togglePause = () => {
    const nextPaused = controlApiRef.current?.togglePause() ?? !paused;
    setPaused(nextPaused);
  };

  const activeStep = signatureSteps.find((step) => step.id === visibleStage);

  const handleSignatureKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % signatureSteps.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + signatureSteps.length) % signatureSteps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = signatureSteps.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    const nextStep = signatureSteps[nextIndex];
    signatureButtonRefs.current[nextIndex]?.focus();
    selectAction(nextStep.id);
  };

  return (
    <div
      className="premium-digital-twin"
      ref={rootRef}
      data-v4-twin
      data-selected-action={selectedAction}
      data-paused={paused}
      data-active-signature-stage={visibleStage ?? undefined}
      data-exiting-callout={exitingCallout ?? undefined}
      style={{
        "--active-stage-duration": activeStep?.duration ?? "8.5s",
      } as CSSProperties}
    >
      <div className="premium-twin-stage">
        <canvas
          ref={canvasRef}
          aria-label="Animated Humpback Hydro operating model showing external energy input, storage, generation, and electrical dispatch; lower-stage generation is shown as a separate architecture path"
        />
        <FlowVectorLayer />
        <div className="premium-twin-annotations" aria-hidden="true">
          <svg viewBox="0 0 1600 900" preserveAspectRatio="none">
            <g data-leader="upper"><circle className="callout-anchor-ring" cx="900" cy="190" r="11" /><circle className="callout-anchor-dot" cx="900" cy="190" r="4" /><path pathLength="1" d="M 1024 155 H 960 L 900 190" /></g>
            <g data-leader="turbine"><circle className="callout-anchor-ring" cx="572" cy="474" r="11" /><circle className="callout-anchor-dot" cx="572" cy="474" r="4" /><path pathLength="1" d="M 319 411 H 485 L 572 474" /></g>
            <g data-leader="penstock"><circle className="callout-anchor-ring" cx="1013" cy="487" r="11" /><circle className="callout-anchor-dot" cx="1013" cy="487" r="4" /><path pathLength="1" d="M 1278 431 H 1120 L 1013 487" /></g>
            <g data-leader="lower"><circle className="callout-anchor-ring" cx="933" cy="724" r="11" /><circle className="callout-anchor-dot" cx="933" cy="724" r="4" /><path pathLength="1" d="M 1265 653 H 1112 L 933 724" /></g>
          </svg>
          <div className="premium-twin-callout is-upper" data-callout="upper">
            <strong>Upper Reservoir</strong><span>Stored Water at Elevation</span>
            <svg className="premium-twin-callout-trace" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect className="premium-twin-callout-base" x=".6" y=".6" width="98.8" height="98.8" />
              <path className="premium-twin-callout-progress" pathLength="1" d="M .6 50 V .6 H 99.4 V 99.4 H .6 V 50" />
            </svg>
          </div>
          <div className="premium-twin-callout is-turbine" data-callout="turbine">
            <strong>Reversible Machinery</strong><span>Conceptual Pump / Generate Path</span>
            <svg className="premium-twin-callout-trace" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect className="premium-twin-callout-base" x=".6" y=".6" width="98.8" height="98.8" />
              <path className="premium-twin-callout-progress" pathLength="1" d="M 99.4 50 V .6 H .6 V 99.4 H 99.4 V 50" />
            </svg>
          </div>
          <div className="premium-twin-callout is-penstock" data-callout="penstock">
            <strong>Penstock System</strong><span>Illustrative Hydraulic Route</span>
            <svg className="premium-twin-callout-trace" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect className="premium-twin-callout-base" x=".6" y=".6" width="98.8" height="98.8" />
              <path className="premium-twin-callout-progress" pathLength="1" d="M .6 50 V .6 H 99.4 V 99.4 H .6 V 50" />
            </svg>
          </div>
          <div className="premium-twin-callout is-lower" data-callout="lower">
            <strong>Lower Reservoir</strong><span>Integrated in Marine Structure</span>
            <svg className="premium-twin-callout-trace" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect className="premium-twin-callout-base" x=".6" y=".6" width="98.8" height="98.8" />
              <path className="premium-twin-callout-progress" pathLength="1" d="M .6 50 V .6 H 99.4 V 99.4 H .6 V 50" />
            </svg>
          </div>
        </div>
        <div className="premium-twin-cycle-signoff" aria-hidden="true">
          <i />
          <strong>
            <span>Ocean Energy</span>
            <span>For A Stronger</span>
            <span>Tomorrow</span>
          </strong>
        </div>
        <div className="premium-twin-frame-label" aria-hidden="true">
          <span>Illustrated State</span>
          <strong>Conceptual Model · Not To Scale</strong>
        </div>
        <div className="premium-twin-continue-cue" aria-hidden="true">
          <span>Continue</span>
          <svg viewBox="0 0 20 20">
            <path d="M 4 7 L 10 13 L 16 7" />
          </svg>
        </div>
      </div>
      <div className="premium-twin-exhibit-rail">
          <div className="premium-twin-rail-label">
            <small>Operating Sequence</small>
          </div>
          <span className="sr-only">Energy In → Store → Generate → Dispatch</span>
          <div className="premium-twin-sequence" role="group" aria-label="Select an operating stage">
            {signatureSteps.map((step, index) => {
              const active = visibleStage === step.id;
              return (
                <button
                  ref={(button) => { signatureButtonRefs.current[index] = button; }}
                  type="button"
                  className="premium-twin-sequence-step"
                  data-active={active}
                  aria-label={step.label}
                  aria-current={active ? "step" : undefined}
                  aria-pressed={selectedAction === step.id}
                  onClick={() => selectAction(step.id)}
                  onKeyDown={(event) => handleSignatureKeyDown(event, index)}
                  key={step.id}
                >
                  <span className="premium-twin-step-orbit">0{index + 1}</span>
                  <span className="premium-twin-step-copy">
                    <strong>{step.label}</strong>
                    <small>{step.rail}</small>
                  </span>
                  <i className="premium-twin-step-connector" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <section className="premium-twin-signature" aria-labelledby="premium-twin-signature-title" data-signature-rail>
            <h3 className="sr-only" id="premium-twin-signature-title">Energy In, Store, Generate and Dispatch Operating Sequence</h3>
            <div className="premium-twin-utility">
              <p className="premium-twin-utility-note">
                <span>External Electricity Powers Pumping • System Losses Require Make-Up Energy</span>
              </p>
              <button
                type="button"
                className="premium-twin-secondary-path"
                aria-label="Lower-Stage Generation"
                aria-pressed={selectedAction === "lower"}
                data-active={selectedAction === "lower"}
                onClick={() => selectAction("lower")}
              >
                <small>Secondary Path</small>
                <strong>Lower-Stage Generation</strong>
              </button>
              <div className="premium-twin-mode-controls" aria-label="Sequence playback controls">
                <button
                  type="button"
                  aria-pressed={selectedAction === "auto"}
                  className={selectedAction === "auto" ? "is-selected" : undefined}
                  onClick={() => selectAction("auto")}
                >
                  Auto Cycle
                </button>
                <button
                  type="button"
                  className="pause-control"
                  aria-pressed={paused}
                  onClick={togglePause}
                >
                  {paused ? "Play" : "Pause"}
                </button>
              </div>
            </div>
          </section>
        </div>
      <div className="premium-twin-mobile-state" aria-hidden="true">
        <span data-mobile-stage="energy">External Energy In → Pump</span>
        <span data-mobile-stage="store">Elevated Storage · Flow Stopped</span>
        <span data-mobile-stage="generate">Stored Water → Generation</span>
        <span data-mobile-stage="dispatch">Electrical Output → Grid / Load</span>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Digital twin phase: {announcedPhase}.
      </p>
    </div>
  );
}
