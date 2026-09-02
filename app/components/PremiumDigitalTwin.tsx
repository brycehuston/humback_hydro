"use client";

import { useEffect, useRef, useState } from "react";
import {
  digitalTwinSceneAt,
  manualDigitalTwinScene,
  manualReservoirLevels,
  reservoirLevelsAt,
} from "../digital-twin";
import type {
  DigitalTwinOperation,
  DigitalTwinScene,
  ReservoirLevels,
} from "../digital-twin";

type TwinAction = "auto" | DigitalTwinOperation | "summary";
type Point = readonly [number, number];
type PathMetrics = {
  segments: Array<{
    a: [number, number];
    b: [number, number];
    length: number;
    start: number;
  }>;
  total: number;
};

type ControlApi = {
  select: (action: TwinAction) => void;
  togglePause: () => boolean;
};

const phaseCopy = {
  establish: {
    index: "00",
    title: "SYSTEM READY",
    route: "THREE-STAGE STORAGE CYCLE",
    energy: "ALL ROUTES ISOLATED",
  },
  lower: {
    index: "01",
    title: "LOWER GENERATION",
    route: "AMBIENT TO LOWER STORAGE",
    energy: "GENERATOR  >  GRID",
  },
  charge: {
    index: "02",
    title: "CHARGING",
    route: "LOWER TO UPPER STORAGE",
    energy: "GRID / RENEWABLES  >  PUMP",
  },
  upper: {
    index: "03",
    title: "UPPER GENERATION",
    route: "UPPER STORAGE TO AMBIENT",
    energy: "GENERATOR  >  GRID",
  },
  handoff: {
    index: "··",
    title: "SETTLING / HANDOFF",
    route: "FLOW STABILIZING FOR NEXT PROCESS",
    energy: "MACHINERY COASTING TO IDLE",
  },
  summary: {
    index: "04",
    title: "CYCLE COMPLETE",
    route: "WATER RETURNED TO AMBIENT",
    energy: "READY FOR NEXT CYCLE",
  },
} as const;

const educationCards = [
  {
    number: "1",
    phase: "lower",
    title: "Constant Water Supply",
    copy: "Seawater is drawn in from below the surface of the ocean or a lake through an intake. The below-surface intake provides cooler, cleaner water.",
  },
  {
    number: "2",
    phase: "lower",
    title: "Gravitational Flow to Generate Power",
    copy: "Water from the intake flows by gravity down through the lower turbine to generate electricity.",
  },
  {
    number: "3",
    phase: "charge",
    title: "Pump to Upper Reservoir",
    copy: "During off-peak times, the pump moves water from the lower reservoir to the upper reservoir for storage.",
  },
  {
    number: "4",
    phase: "upper",
    title: "Release When Needed",
    copy: "When energy is needed, water is released from the upper reservoir through the upper turbine to generate power and return to the exterior reservoir (ocean or lake).",
  },
] as const;

const actions: ReadonlyArray<{ action: TwinAction; label: string }> = [
  { action: "auto", label: "Auto Cycle" },
  { action: "lower", label: "Lower Generation" },
  { action: "charge", label: "Charging" },
  { action: "upper", label: "Upper Generation" },
  { action: "summary", label: "Cycle Summary" },
];

function isOperation(value: string): value is DigitalTwinOperation {
  return value === "lower" || value === "charge" || value === "upper";
}

export default function PremiumDigitalTwin() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlApiRef = useRef<ControlApi | null>(null);
  const [selectedAction, setSelectedAction] = useState<TwinAction>("auto");
  const [paused, setPaused] = useState(false);
  const [visiblePhase, setVisiblePhase] = useState<DigitalTwinOperation | null>(
    null,
  );
  const [announcedPhase, setAnnouncedPhase] = useState("System Ready");

  useEffect(() => {
    const root = rootRef.current;
    const canvasElement = canvasRef.current;
    if (!root || !canvasElement) return;
    const context = canvasElement.getContext("2d");
    if (!context) return;

    const ctx = context;
    const canvas = canvasElement;
    const image = new Image();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const routeMetrics = new Map<readonly Point[], PathMetrics>();
    const machinery = {
      lower: 0,
      charge: 0,
      upper: 0,
      lowerAngle: 0,
      chargeAngle: 0,
      upperAngle: 0,
    };
    const routes: Record<DigitalTwinOperation, readonly (readonly Point[])[]> = {
      lower: [
        [[0.01, 0.83], [0.22, 0.83], [0.35, 0.76], [0.39, 0.86], [0.5, 0.86], [0.5, 0.78]],
        [[0.99, 0.83], [0.78, 0.83], [0.65, 0.76], [0.61, 0.86], [0.5, 0.86], [0.5, 0.78]],
      ],
      charge: [
        [[0.5, 0.8], [0.5, 0.7], [0.5, 0.59], [0.5, 0.44], [0.5, 0.31], [0.5, 0.2]],
      ],
      upper: [
        [[0.43, 0.2], [0.4, 0.34], [0.36, 0.48], [0.23, 0.52], [0.01, 0.52]],
        [[0.57, 0.2], [0.6, 0.34], [0.64, 0.48], [0.77, 0.52], [0.99, 0.52]],
      ],
    };

    let forcedPhase: Exclude<TwinAction, "auto"> | null = null;
    let manuallyPaused = false;
    let pauseAt = 0;
    let start = performance.now();
    let lastFrame = 0;
    let animationFrame: number | null = null;
    let documentVisible = !document.hidden;
    let inViewport = true;
    let automaticSuspensionStarted: number | null = null;
    let reducedMotion = motionQuery.matches;
    let renderedUiPhase = "";
    let renderedAnnouncement = "";
    let disposed = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(640, Math.round(rect.width * dpr));
      const height = Math.round((width * 9) / 16);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        routeMetrics.clear();
      }
    }

    function linePath(
      points: readonly Point[],
      width: number,
      color: string,
      glow = 0,
    ) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      ctx.save();
      ctx.beginPath();
      points.forEach(([x, y], index) => {
        if (index) ctx.lineTo(x * canvasWidth, y * canvasHeight);
        else ctx.moveTo(x * canvasWidth, y * canvasHeight);
      });
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = (width * canvasWidth) / 1600;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = (glow * canvasWidth) / 1600;
      ctx.stroke();
      ctx.restore();
    }

    function pathMetrics(points: readonly Point[]) {
      const cached = routeMetrics.get(points);
      if (cached) return cached;
      const segments: PathMetrics["segments"] = [];
      let total = 0;
      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const a: [number, number] = [
          previous[0] * canvas.width,
          previous[1] * canvas.height,
        ];
        const b: [number, number] = [
          current[0] * canvas.width,
          current[1] * canvas.height,
        ];
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segments.push({ a, b, length, start: total });
        total += length;
      }
      const metrics = { segments, total };
      routeMetrics.set(points, metrics);
      return metrics;
    }

    function pointOn(points: readonly Point[], fraction: number) {
      const metrics = pathMetrics(points);
      const distance = (((fraction % 1) + 1) % 1) * metrics.total;
      const segment =
        metrics.segments.find(
          (candidate) => distance <= candidate.start + candidate.length,
        ) ?? metrics.segments[metrics.segments.length - 1];
      const progress = (distance - segment.start) / segment.length;
      return [
        segment.a[0] + (segment.b[0] - segment.a[0]) * progress,
        segment.a[1] + (segment.b[1] - segment.a[1]) * progress,
      ] as const;
    }

    function drawFlow(
      points: readonly Point[],
      seconds: number,
      strength: number,
      direction = 1,
    ) {
      const accent = "#68f5e1";
      linePath(points, 10, `rgba(34,225,210,${0.085 * strength})`, 18);
      linePath(points, 2, `rgba(104,245,225,${0.44 * strength})`, 8);
      const count = Math.round(9 + 6 * strength);
      for (let index = 0; index < count; index += 1) {
        const fraction =
          index * 0.61803398875 + direction * seconds * 0.078;
        const [x, y] = pointOn(points, fraction);
        const pulse = 0.62 + 0.38 * Math.sin(index * 2.17 + seconds * 2.1);
        ctx.save();
        ctx.fillStyle = accent;
        ctx.globalAlpha = strength * (0.3 + 0.42 * pulse);
        ctx.shadowColor = accent;
        ctx.shadowBlur = (10 * canvas.width) / 1600;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          ((1.8 + 1.25 * pulse) * canvas.width) / 1600,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      }
    }

    function drawRotor(
      cx: number,
      cy: number,
      radius: number,
      angle: number,
      strength: number,
      blades = 6,
    ) {
      const x = cx * canvas.width;
      const y = cy * canvas.height;
      const rotorRadius = radius * canvas.width;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.24 + 0.71 * strength;
      ctx.strokeStyle =
        strength > 0.08 ? "#bafff6" : "rgba(180,220,220,.6)";
      ctx.fillStyle = `rgba(104,245,225,${0.1 + 0.18 * strength})`;
      ctx.shadowColor = "#68f5e1";
      ctx.shadowBlur = strength * rotorRadius * 0.7;
      ctx.lineWidth = Math.max(1.2, canvas.width / 1100);
      for (let index = 0; index < blades; index += 1) {
        ctx.rotate((Math.PI * 2) / blades);
        ctx.beginPath();
        ctx.moveTo(rotorRadius * 0.18, 0);
        ctx.quadraticCurveTo(
          rotorRadius * 0.72,
          -rotorRadius * 0.18,
          rotorRadius,
          0,
        );
        ctx.quadraticCurveTo(
          rotorRadius * 0.67,
          rotorRadius * 0.2,
          rotorRadius * 0.18,
          rotorRadius * 0.12,
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, rotorRadius * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = "#d8fffb";
      ctx.fill();
      ctx.restore();
    }

    function easeToward(value: number, target: number, delta: number) {
      const response = target > value ? 0.34 : 0.72;
      return value + (target - value) * (1 - Math.exp(-delta / response));
    }

    function updateMachinery(scene: DigitalTwinScene, delta: number) {
      const targets = {
        lower: scene.phase === "lower" ? scene.activity : 0,
        charge: scene.phase === "charge" ? scene.activity : 0,
        upper: scene.phase === "upper" ? scene.activity : 0,
      };
      (["lower", "charge", "upper"] as const).forEach((key) => {
        machinery[key] = reducedMotion
          ? targets[key]
          : easeToward(machinery[key], targets[key], delta);
      });
      if (!reducedMotion) {
        machinery.lowerAngle += machinery.lower * 5.2 * delta;
        machinery.chargeAngle += machinery.charge * 5.8 * delta;
        machinery.upperAngle += machinery.upper * 5.2 * delta;
      }
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

    function smallTag(
      label: string,
      x: number,
      y: number,
      side: "left" | "right" = "left",
    ) {
      const pointX = x * canvas.width;
      const pointY = y * canvas.height;
      const direction = side === "left" ? -1 : 1;
      ctx.save();
      ctx.strokeStyle = "rgba(104,245,225,.55)";
      ctx.lineWidth = Math.max(1, canvas.width / 1600);
      ctx.beginPath();
      ctx.arc(pointX, pointY, (4 * canvas.width) / 1600, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pointX + (direction * 8 * canvas.width) / 1600, pointY);
      ctx.lineTo(pointX + (direction * 26 * canvas.width) / 1600, pointY);
      ctx.stroke();
      ctx.restore();
      textLabel(
        label,
        x + direction * 0.022,
        y + 0.005,
        12,
        "#c7e5e4",
        side === "left" ? "right" : "left",
      );
    }

    function drawLevels(levels: ReservoirLevels, activity: number) {
      ctx.save();
      ctx.strokeStyle = `rgba(104,245,225,${0.48 + 0.37 * activity})`;
      ctx.lineWidth = (2 * canvas.width) / 1600;
      ctx.shadowColor = "#68f5e1";
      ctx.shadowBlur = ((4 + 4 * activity) * canvas.width) / 1600;
      ctx.beginPath();
      ctx.moveTo(0.395 * canvas.width, levels.upper * canvas.height);
      ctx.lineTo(0.605 * canvas.width, levels.upper * canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0.34 * canvas.width, levels.lower * canvas.height);
      ctx.lineTo(0.66 * canvas.width, levels.lower * canvas.height);
      ctx.stroke();
      ctx.restore();
      textLabel(
        "UPPER LEVEL",
        0.61,
        levels.upper + 0.004,
        10,
        "rgba(205,240,239,.8)",
      );
      textLabel(
        "LOWER LEVEL",
        0.665,
        levels.lower + 0.004,
        10,
        "rgba(205,240,239,.8)",
      );
    }

    function clipPolygon(points: readonly Point[]) {
      ctx.beginPath();
      points.forEach(([x, y], index) => {
        if (index) ctx.lineTo(x * canvas.width, y * canvas.height);
        else ctx.moveTo(x * canvas.width, y * canvas.height);
      });
      ctx.closePath();
      ctx.clip();
    }

    function drawOceanSurface(seconds: number) {
      if (reducedMotion) return;
      const regions: readonly (readonly Point[])[] = [
        [[0, 0.335], [0.354, 0.335], [0.329, 0.407], [0, 0.407]],
        [[0.646, 0.335], [1, 0.335], [1, 0.407], [0.671, 0.407]],
      ];
      regions.forEach((region) => {
        ctx.save();
        clipPolygon(region);
        for (let band = 0; band < 5; band += 1) {
          const yStart = (0.344 + band * 0.0125) * canvas.height;
          const phase = seconds * (0.22 + band * 0.037) + band * 1.87;
          ctx.beginPath();
          for (let step = 0; step <= 36; step += 1) {
            const x = (step / 36) * canvas.width;
            const y =
              yStart +
              (Math.sin((x / canvas.width) * 15.2 + phase) * 1.7 +
                Math.sin((x / canvas.width) * 31.7 - phase * 0.61) * 0.8) *
                (canvas.width / 1600);
            if (step) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
          ctx.strokeStyle = `rgba(226,255,252,${0.02 + band * 0.006})`;
          ctx.lineWidth = ((1 + band * 0.12) * canvas.width) / 1600;
          ctx.stroke();
        }
        const sheen = ctx.createLinearGradient(
          0,
          0.34 * canvas.height,
          0,
          0.41 * canvas.height,
        );
        sheen.addColorStop(0, "rgba(194,255,250,.018)");
        sheen.addColorStop(
          0.5,
          `rgba(225,255,252,${0.018 + 0.008 * Math.sin(seconds * 0.31)})`,
        );
        sheen.addColorStop(1, "rgba(120,228,230,0)");
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0.335 * canvas.height, canvas.width, 0.075 * canvas.height);
        ctx.restore();
      });
    }

    function drawFlagBreeze(seconds: number) {
      if (reducedMotion) return;
      const poleX = 0.501 * canvas.width;
      const top = 0.036 * canvas.height;
      const flagWidth = 0.066 * canvas.width;
      const flagHeight = 0.075 * canvas.height;
      const primary =
        Math.sin(seconds * 0.43) + 0.36 * Math.sin(seconds * 0.79 + 0.9);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(poleX, top);
      ctx.lineTo(
        poleX + flagWidth,
        top + (primary * 0.42 * canvas.width) / 1600,
      );
      ctx.lineTo(
        poleX + flagWidth,
        top + flagHeight + (primary * 0.7 * canvas.width) / 1600,
      );
      ctx.lineTo(poleX, top + flagHeight);
      ctx.closePath();
      ctx.clip();
      for (let fold = 0; fold < 3; fold += 1) {
        const travel =
          (seconds * (0.018 + fold * 0.002) + fold * 0.31) % 1;
        const x = poleX + (0.18 + travel * 0.82) * flagWidth;
        const width = (0.09 + fold * 0.015) * flagWidth;
        const shade = ctx.createLinearGradient(x - width, 0, x + width, 0);
        shade.addColorStop(0, "rgba(255,255,255,0)");
        shade.addColorStop(0.42, "rgba(255,255,255,.045)");
        shade.addColorStop(0.58, "rgba(0,22,42,.040)");
        shade.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shade;
        ctx.fillRect(
          x - width,
          top,
          width * 2,
          flagHeight + (3 * canvas.width) / 1600,
        );
      }
      ctx.restore();
    }

    function drawHud(scene: DigitalTwinScene) {
      const phase = phaseCopy[scene.phase];
      panel(0.027, 0.04, 0.205, 0.102);
      textLabel("HUMPBACK HYDRO", 0.045, 0.074, 11, "#68f5e1", "left", true);
      textLabel("OPERATING MODEL", 0.045, 0.104, 20, "#eefdfc");
      textLabel(
        "ILLUSTRATIVE DIGITAL TWIN",
        0.045,
        0.128,
        10,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );

      panel(0.76, 0.04, 0.213, 0.102);
      ctx.save();
      ctx.fillStyle = "#68f5e1";
      ctx.shadowColor = "#68f5e1";
      ctx.shadowBlur = (10 * canvas.width) / 1600;
      ctx.beginPath();
      ctx.arc(
        0.782 * canvas.width,
        0.073 * canvas.height,
        (4 * canvas.width) / 1600,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
      textLabel(
        "SYSTEM STATUS",
        0.797,
        0.077,
        10,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );
      const systemStatus =
        scene.phase === "establish"
          ? "READY"
          : scene.phase === "summary"
            ? "CYCLE COMPLETE"
            : scene.phase === "handoff"
              ? "SETTLING / TRANSFER"
              : "ACTIVE / NOMINAL";
      textLabel(systemStatus, 0.797, 0.107, 18, "#eefdfc");
      textLabel(
        "QUALITATIVE DISPLAY — NOT TO SCALE",
        0.797,
        0.13,
        9,
        "#68f5e1",
        "left",
        true,
      );

      panel(0.027, 0.825, 0.262, 0.128);
      textLabel(phase.index, 0.062, 0.907, 22, "#68f5e1", "center", true);
      ctx.save();
      ctx.strokeStyle = "rgba(104,245,225,.52)";
      ctx.lineWidth = (2 * canvas.width) / 1600;
      ctx.beginPath();
      ctx.arc(
        0.062 * canvas.width,
        0.885 * canvas.height,
        (27 * canvas.width) / 1600,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
      textLabel(
        "ACTIVE SEQUENCE",
        0.105,
        0.868,
        10,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );
      textLabel(phase.title, 0.105, 0.905, 18, "#eefdfc");

      panel(0.715, 0.815, 0.258, 0.138);
      textLabel(
        "FLOW STATE",
        0.74,
        0.853,
        10,
        "rgba(196,226,225,.72)",
        "left",
        true,
      );
      textLabel(phase.route, 0.74, 0.888, 16, "#eefdfc");
      textLabel(phase.energy, 0.74, 0.92, 10, "#68f5e1", "left", true);

      const machinePhase = isOperation(scene.phase)
        ? scene.phase
        : scene.phase === "handoff"
          ? scene.from
          : null;
      if (machinePhase && machinery[machinePhase] > 0.035) {
        const anchor =
          machinePhase === "lower"
            ? [0.355, 0.76]
            : machinePhase === "charge"
              ? [0.5, 0.59]
              : [0.645, 0.48];
        const box =
          machinePhase === "lower"
            ? [0.4, 0.66]
            : machinePhase === "charge"
              ? [0.56, 0.58]
              : [0.58, 0.38];
        panel(box[0], box[1], 0.148, 0.11, 0.58 + 0.16 * scene.activity);
        ctx.save();
        ctx.strokeStyle = "rgba(104,245,225,.48)";
        ctx.lineWidth = canvas.width / 1600;
        ctx.beginPath();
        ctx.moveTo(anchor[0] * canvas.width, anchor[1] * canvas.height);
        ctx.lineTo(box[0] * canvas.width, box[1] * canvas.height);
        ctx.stroke();
        ctx.restore();
        const machine =
          machinePhase === "lower"
            ? "LOWER TURBINE PAIR"
            : machinePhase === "charge"
              ? "CENTRAL MOTOR–PUMP"
              : "UPPER TURBINE PAIR";
        textLabel(machine, box[0] + 0.014, box[1] + 0.029, 9, "#68f5e1", "left", true);
        const machineStatus =
          scene.phase === "handoff"
            ? "COASTING"
            : scene.progress < 0.16
              ? "RAMPING"
              : scene.progress > 0.82
                ? "COASTING"
                : "ONLINE";
        textLabel(machineStatus, box[0] + 0.014, box[1] + 0.06, 16, "#eefdfc");
        textLabel(
          machinePhase === "charge"
            ? "LOWER ↓   UPPER ↑"
            : machinePhase === "lower"
              ? "LOWER LEVEL ↑"
              : "UPPER LEVEL ↓",
          box[0] + 0.014,
          box[1] + 0.088,
          10,
          "rgba(196,226,225,.82)",
          "left",
          true,
        );
      }

      smallTag("ELEVATED UPPER STORAGE", 0.61, 0.145, "right");
      smallTag("AMBIENT OCEAN / LAKE", 0.115, 0.375, "right");
      smallTag("INTERNAL LOWER STORAGE", 0.665, 0.79, "right");

      const timelineY = 0.975;
      const positions = [0.31, 0.43, 0.56, 0.69];
      const timelinePhase =
        scene.phase === "handoff" ? scene.from : scene.phase;
      ctx.save();
      ctx.strokeStyle = "rgba(164,205,203,.35)";
      ctx.lineWidth = canvas.width / 1600;
      ctx.beginPath();
      ctx.moveTo(positions[0] * canvas.width, timelineY * canvas.height);
      ctx.lineTo(positions[3] * canvas.width, timelineY * canvas.height);
      ctx.stroke();
      positions.forEach((x, index) => {
        const active =
          index === ["lower", "charge", "upper", "summary"].indexOf(timelinePhase);
        ctx.fillStyle = active ? "#68f5e1" : "rgba(180,215,214,.45)";
        ctx.beginPath();
        ctx.arc(
          x * canvas.width,
          timelineY * canvas.height,
          ((active ? 5 : 3) * canvas.width) / 1600,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });
      ctx.restore();
    }

    function syncPhaseUi(scene: DigitalTwinScene) {
      const nextVisiblePhase =
        scene.cardsVisible && isOperation(scene.phase) ? scene.phase : "";
      if (nextVisiblePhase !== renderedUiPhase) {
        renderedUiPhase = nextVisiblePhase;
        setVisiblePhase(nextVisiblePhase || null);
      }

      const announcement = phaseCopy[scene.phase].title.replace(" / ", " and ");
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
      const elapsed = (manuallyPaused ? pauseAt : now - start) / 1000;
      const scene = forcedPhase
        ? manualDigitalTwinScene(forcedPhase)
        : reducedMotion
          ? manualDigitalTwinScene("summary")
          : digitalTwinSceneAt(elapsed);
      const motionTime = reducedMotion ? 0 : elapsed;
      const levels = forcedPhase
        ? manualReservoirLevels(forcedPhase)
        : reservoirLevelsAt(elapsed);
      updateMachinery(scene, delta);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const push =
        1.006 + (reducedMotion ? 0 : 0.0018 * Math.sin(motionTime * 0.075));
      const drawWidth = width * push;
      const drawHeight = height * push;
      ctx.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      drawOceanSurface(motionTime);
      drawFlagBreeze(motionTime);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        width * 0.15,
        width * 0.5,
        height * 0.48,
        width * 0.72,
      );
      vignette.addColorStop(0, "rgba(0,20,24,.018)");
      vignette.addColorStop(1, "rgba(0,8,14,.54)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(1,19,26,.08)";
      ctx.fillRect(0, 0, width, height);

      const routeStrength = {
        lower: machinery.lower,
        charge: machinery.charge,
        upper: machinery.upper,
      };
      (Object.entries(routes) as Array<
        [DigitalTwinOperation, readonly (readonly Point[])[]]
      >).forEach(([key, paths]) => {
        paths.forEach((points) => {
          const strength = routeStrength[key];
          linePath(
            points,
            1.1,
            strength > 0.02
              ? `rgba(90,240,226,${0.12 + 0.28 * strength})`
              : "rgba(112,176,177,.13)",
            strength > 0.02 ? 5 + 5 * strength : 0,
          );
        });
      });
      (["lower", "charge", "upper"] as const).forEach((key) => {
        if (routeStrength[key] > 0.025) {
          routes[key].forEach((points, index) =>
            drawFlow(points, motionTime + index * 0.17, routeStrength[key]),
          );
        }
      });

      drawRotor(0.355, 0.48, 0.022, machinery.upperAngle, machinery.upper);
      drawRotor(0.645, 0.48, 0.022, -machinery.upperAngle, machinery.upper);
      drawRotor(0.355, 0.76, 0.022, machinery.lowerAngle, machinery.lower);
      drawRotor(0.645, 0.76, 0.022, -machinery.lowerAngle, machinery.lower);
      drawRotor(0.5, 0.59, 0.022, machinery.chargeAngle, machinery.charge, 5);
      drawLevels(levels, scene.activity);

      if (!reducedMotion && scene.activity > 0.08 && isOperation(scene.phase)) {
        const activeAnchor =
          scene.phase === "lower"
            ? [0.355, 0.76]
            : scene.phase === "charge"
              ? [0.5, 0.59]
              : [0.645, 0.48];
        ctx.save();
        ctx.globalAlpha = 0.22 * scene.activity;
        ctx.strokeStyle = "rgba(104,245,225,.62)";
        ctx.lineWidth = width / 1600;
        for (let index = 1; index <= 2; index += 1) {
          ctx.beginPath();
          ctx.arc(
            activeAnchor[0] * width,
            activeAnchor[1] * height,
            ((32 + index * 25) * width) / 1600 +
              Math.sin(motionTime * 1.15 + index) * 2,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      drawHud(scene);
      syncPhaseUi(scene);
    }

    function shouldAnimate() {
      return !manuallyPaused && !reducedMotion && documentVisible && inViewport;
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
        forcedPhase = action === "auto" ? null : action;
        if (action === "auto") {
          if (manuallyPaused) pauseAt = 0;
          else start = performance.now();
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
        inViewport = entry?.isIntersecting ?? true;
        syncAutomaticSuspension();
      },
      { rootMargin: "120px" },
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
    image.src = "/digital-twin/humpback-digital-twin-v4-premium.jpg";
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
    };
  }, []);

  const selectAction = (action: TwinAction) => {
    controlApiRef.current?.select(action);
    setSelectedAction(action);
  };

  const togglePause = () => {
    const nextPaused = controlApiRef.current?.togglePause() ?? !paused;
    setPaused(nextPaused);
  };

  return (
    <div
      className="premium-digital-twin"
      ref={rootRef}
      data-v4-twin
      data-selected-action={selectedAction}
      data-paused={paused}
    >
      <div className="premium-twin-stage">
        <canvas
          ref={canvasRef}
          aria-label="Animated Humpback Hydro digital twin showing lower generation, charging, and upper generation in sequence"
        />
        <section
          className="premium-twin-education"
          aria-label="How the operating cycle works"
        >
          {educationCards.map((card) => {
            const active = visiblePhase === card.phase;
            return (
              <article
                className={`premium-twin-card step-${card.number}${active ? " is-visible" : ""}`}
                key={card.number}
                aria-hidden={!active}
              >
                <span className="premium-twin-step" aria-hidden="true">
                  {card.number}
                </span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <div className="premium-twin-status">
        <span>Illustrative Operating Model</span>
        <strong>{announcedPhase}</strong>
        <small>Concept Model — Not to Scale</small>
      </div>

      <div className="premium-twin-controls" aria-label="Digital twin controls">
        {actions.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            aria-pressed={selectedAction === action}
            className={selectedAction === action ? "is-selected" : undefined}
            onClick={() => selectAction(action)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="pause-control"
          aria-pressed={paused}
          onClick={togglePause}
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Digital twin phase: {announcedPhase}.
      </p>
    </div>
  );
}
