import type { CSSProperties } from "react";

/* ============================================================================
   LOGO ELECTRICITY TUNING

   Timing: smaller stage values = faster. speedMultiplier > 1 = faster overall.
   Appearance: larger widths/strengths/brightness = stronger or brighter.
   Flicker: smaller speed = faster; larger intensity = more contrast.
   ============================================================================ */
export const LOGO_TRACE = {
  // Trigger timing after the homepage structural line finishes.
  startDelayMs: 250,
  fallbackStartMs: 5500,

  // Route timing.
  // Sequence: down -> lower hold -> up -> split to tips -> tiny tip hold -> release down.
  speedMultiplier: 2.4,

  stageDownMs: 1000,
  stageUpMs: 450,
  stageExitMs: 900,

  stageOverlapMs: 0,

  pauseAfterDownMs: 575,
  pauseAfterUpMs: 0,
  pauseAtTipsMs: 130,

  // First share of stageExitMs = center -> upper tips.
  // Remaining share = upper tips -> lower outside exits.
  exitTurnShare: 0.45,

  // Electrical trail and head sizes.
  trailLength: 0.13,
  coreTrailRatio: 0.46,

  coreWidth: 18,
  cyanWidth: 26,
  trailWidth: 45,
  glowWidth: 115,

  headCoreRadius: 14,
  headCyanRadius: 29,
  headGlowRadius: 72,

  // Electrical appearance.
  brightness: 4.8,

  coreStrength: 1,
  trailStrength: 0.95,
  glowStrength: 0.68,

  headGlowStrength: 1,
  headCyanStrength: 1,

  coreColor: "#ffffff",
  cyanColor: "#33efff",
  headCyanColor: "#c8fbff",

  glowColor: "30, 223, 255",

  microArcColor: "#bffaff",
  exitColor: "#d9fcff",

  // Electrical micro-motion.
  flickerSpeedMs: 32,
  coreFlickerSpeedMs: 25,

  flickerIntensity: 0.4,
  coreFlickerIntensity: 0.5,

  // Moving turbulence.
  // This makes the electrical channel crawl/zap side-to-side
  // instead of looking like one fixed distorted line.
  turbulenceMotionMs: 90,

  turbulenceDriftXMs: 78,
  turbulenceDriftYMs: 103,
  turbulenceDriftPx: 10,

  turbulenceFrequencyLow: 0.075,
  turbulenceFrequencyMid: 0.12,
  turbulenceFrequencyHigh: 0.15,

  displacementMotionMs: 75,

  displacementMin: 7,
  displacementMid: 13,
  displacementMax: 18,

  // Micro arcs around the moving electrical head.
  microArcWidth: 4.5,

  microArcOneMs: 75,
  microArcTwoMs: 92,
  microArcTwoDelayMs: 21,

  microArcOneStrength: 0.95,
  microArcTwoStrength: 0.85,

  // Head-localized high-voltage micro-forks.
  sparkEnabled: true,

  sparkCount: 7,
  sparkFrequencyMs: 28,
  sparkLifetimeMs: 60,

  sparkMinLength: 35,
  sparkMaxLength: 78,

  sparkOpacity: 0.95,
  sparkWidth: 4,

  sparkSpreadDeg: 100,
  sparkIrregularity: 0.65,

  sparkSideOffsetRatio: 0.42,
  sparkOriginRadius: 18,

  sparkKinkPosition: 0.46,
  sparkKinkOffset: 0.2,

  sparkForkRatio: 0.34,
  sparkForkOffset: 0.34,

  sparkColor: "#f4feff",

  // Junction and terminal discharge effects.
  junctionPulseMs: 300,
  junctionLeadMs: 100,

  exitPulseMs: 340,
  exitPulseLeadMs: 120,

  pulseStrength: 1,

  junctionStartScale: 0.3,
  junctionPeakScale: 1.15,
  junctionEndScale: 1.8,

  exitStartScale: 0.35,
  exitPeakScale: 1.05,
  exitEndScale: 1.65,

  junctionRadius: 42,
  upperJunctionRadius: 48,

  exitGlowRadius: 42,
  exitArcWidth: 5,
} as const;

type Stage = {
  delayMs: number;
  durationMs: number;
  left: string;
  right: string;
};

const scaledMs = (milliseconds: number) =>
  milliseconds / LOGO_TRACE.speedMultiplier;

const overlapMs = scaledMs(LOGO_TRACE.stageOverlapMs);

const stageDownMs = scaledMs(LOGO_TRACE.stageDownMs);

const stageUpMs = scaledMs(LOGO_TRACE.stageUpMs);

const stageExitTipMs = scaledMs(
  LOGO_TRACE.stageExitMs * LOGO_TRACE.exitTurnShare,
);

const stageExitDownMs = scaledMs(
  LOGO_TRACE.stageExitMs * (1 - LOGO_TRACE.exitTurnShare),
);

const stages: Stage[] = [
  // -------------------------------------------------------------------------
  // 1. Upper outside tips -> lower junction
  // -------------------------------------------------------------------------
  {
    delayMs: 0,

    durationMs: stageDownMs,

    left:
      "M104 147 C93 207 79 278 108 356 C151 472 305 500 394 615 C461 702 493 843 535 918",

    right:
      "M991 147 C1002 207 1016 278 987 356 C944 472 790 500 701 615 C634 702 602 843 560 918",
  },

  // -------------------------------------------------------------------------
  // 2. Lower junction -> upper center
  // -------------------------------------------------------------------------
  {
    delayMs:
      stageDownMs -
      overlapMs +
      LOGO_TRACE.pauseAfterDownMs,

    durationMs: stageUpMs,

    left:
      "M535 918 C535 800 532 666 517 590 C508 544 519 520 547 518",

    right:
      "M560 918 C560 800 563 666 578 590 C587 544 576 520 547 518",
  },

  // -------------------------------------------------------------------------
  // 3. Upper center -> actual outer upper tips
  //
  // No center pause. The charge reaches the center and immediately
  // splits outward toward both tips.
  // -------------------------------------------------------------------------
  {
    delayMs:
      stageDownMs +
      stageUpMs -
      overlapMs * 2 +
      LOGO_TRACE.pauseAfterDownMs +
      LOGO_TRACE.pauseAfterUpMs,

    durationMs: stageExitTipMs,

    left:
      "M547 518 C485 468 414 414 334 350 C252 284 174 214 104 147",

    right:
      "M547 518 C610 468 681 414 761 350 C843 284 921 214 991 147",
  },

  // -------------------------------------------------------------------------
  // 4. Tiny hold at upper tips -> downward outside discharge
  // -------------------------------------------------------------------------
  {
    delayMs:
      stageDownMs +
      stageUpMs +
      stageExitTipMs -
      overlapMs * 3 +
      LOGO_TRACE.pauseAfterDownMs +
      LOGO_TRACE.pauseAfterUpMs +
      LOGO_TRACE.pauseAtTipsMs,

    durationMs: stageExitDownMs,

    left:
      "M104 147 C74 242 84 360 149 474 C195 555 207 633 174 714 C149 776 118 839 86 878",

    right:
      "M991 147 C1021 242 1011 360 946 474 C900 555 888 633 921 714 C946 776 977 839 1009 878",
  },
];

const routeEndMs =
  stages[3].delayMs +
  stages[3].durationMs;

const logoTraceStyle = {
  "--logo-brightness":
    LOGO_TRACE.brightness,

  "--logo-trail-length":
    LOGO_TRACE.trailLength,

  "--logo-core-trail-length":
    LOGO_TRACE.trailLength *
    LOGO_TRACE.coreTrailRatio,

  "--logo-core-width":
    LOGO_TRACE.coreWidth,

  "--logo-cyan-width":
    LOGO_TRACE.cyanWidth,

  "--logo-trail-width":
    LOGO_TRACE.trailWidth,

  "--logo-glow-width":
    LOGO_TRACE.glowWidth,

  "--logo-core-strength":
    LOGO_TRACE.coreStrength,

  "--logo-trail-strength":
    LOGO_TRACE.trailStrength,

  "--logo-glow-strength":
    LOGO_TRACE.glowStrength,

  "--logo-core-color":
    LOGO_TRACE.coreColor,

  "--logo-cyan-color":
    LOGO_TRACE.cyanColor,

  "--logo-head-cyan-color":
    LOGO_TRACE.headCyanColor,

  "--logo-glow-color":
    LOGO_TRACE.glowColor,

  "--logo-micro-arc-color":
    LOGO_TRACE.microArcColor,

  "--logo-exit-color":
    LOGO_TRACE.exitColor,

  "--logo-flicker-speed":
    `${LOGO_TRACE.flickerSpeedMs}ms`,

  "--logo-core-flicker-speed":
    `${LOGO_TRACE.coreFlickerSpeedMs}ms`,

  "--logo-flicker-low":
    1 - LOGO_TRACE.flickerIntensity,

  "--logo-flicker-mid":
    1 - LOGO_TRACE.flickerIntensity / 2,

  "--logo-core-flicker-low":
    1 - LOGO_TRACE.coreFlickerIntensity,

  "--logo-micro-arc-width":
    LOGO_TRACE.microArcWidth,

  "--logo-micro-arc-one-speed":
    `${LOGO_TRACE.microArcOneMs}ms`,

  "--logo-micro-arc-two-speed":
    `${LOGO_TRACE.microArcTwoMs}ms`,

  "--logo-micro-arc-two-delay":
    `${LOGO_TRACE.microArcTwoDelayMs}ms`,

  "--logo-micro-arc-one-strength":
    LOGO_TRACE.microArcOneStrength,

  "--logo-micro-arc-two-strength":
    LOGO_TRACE.microArcTwoStrength,

  "--logo-spark-lifetime":
    `${LOGO_TRACE.sparkLifetimeMs}ms`,

  "--logo-spark-opacity":
    LOGO_TRACE.sparkOpacity,

  "--logo-spark-width":
    LOGO_TRACE.sparkWidth,

  "--logo-spark-color":
    LOGO_TRACE.sparkColor,

  "--logo-junction-pulse-speed":
    `${scaledMs(LOGO_TRACE.junctionPulseMs)}ms`,

  "--logo-lower-junction-delay":
    `${Math.max(
      0,
      stageDownMs -
      scaledMs(LOGO_TRACE.junctionLeadMs),
    )}ms`,

  "--logo-upper-junction-delay":
    `${Math.max(
      0,
      stages[2].delayMs -
      scaledMs(LOGO_TRACE.junctionLeadMs),
    )}ms`,

  "--logo-exit-pulse-speed":
    `${scaledMs(LOGO_TRACE.exitPulseMs)}ms`,

  "--logo-exit-pulse-delay":
    `${Math.max(
      0,
      routeEndMs -
      scaledMs(LOGO_TRACE.exitPulseLeadMs),
    )}ms`,

  "--logo-pulse-strength":
    LOGO_TRACE.pulseStrength,

  "--logo-junction-start-scale":
    LOGO_TRACE.junctionStartScale,

  "--logo-junction-peak-scale":
    LOGO_TRACE.junctionPeakScale,

  "--logo-junction-end-scale":
    LOGO_TRACE.junctionEndScale,

  "--logo-exit-start-scale":
    LOGO_TRACE.exitStartScale,

  "--logo-exit-peak-scale":
    LOGO_TRACE.exitPeakScale,

  "--logo-exit-end-scale":
    LOGO_TRACE.exitEndScale,

  "--logo-exit-arc-width":
    LOGO_TRACE.exitArcWidth,
} as CSSProperties;

type TraceSide =
  | "left"
  | "right";

const rounded = (value: number) =>
  Number(value.toFixed(2));

function sparkPath(index: number) {
  const progress =
    LOGO_TRACE.sparkCount <= 1
      ? 0.5
      : index /
      (LOGO_TRACE.sparkCount - 1);

  const length =
    LOGO_TRACE.sparkMinLength +
    (
      LOGO_TRACE.sparkMaxLength -
      LOGO_TRACE.sparkMinLength
    ) *
    progress;

  const direction =
    index % 2 === 0
      ? -1
      : 1;

  const startX =
    LOGO_TRACE.sparkOriginRadius;

  const kinkX =
    startX +
    length *
    LOGO_TRACE.sparkKinkPosition;

  const kinkY =
    direction *
    length *
    LOGO_TRACE.sparkKinkOffset;

  const endX =
    startX +
    length;

  const forkX =
    kinkX +
    length *
    LOGO_TRACE.sparkForkRatio;

  const forkY =
    kinkY -
    direction *
    length *
    LOGO_TRACE.sparkForkOffset;

  return `M${rounded(startX)} 0 L${rounded(kinkX)} ${rounded(kinkY)} L${rounded(endX)} 0 M${rounded(kinkX)} ${rounded(kinkY)} L${rounded(forkX)} ${rounded(forkY)}`;
}

function sparkAngle(
  index: number,
  side: TraceSide,
) {
  const progress =
    LOGO_TRACE.sparkCount <= 1
      ? 0.5
      : index /
      (LOGO_TRACE.sparkCount - 1);

  const spreadOffset =
    (progress - 0.5) *
    LOGO_TRACE.sparkSpreadDeg;

  const hemisphere =
    index % 2 === 0
      ? -90
      : 90;

  const angle =
    hemisphere +
    spreadOffset;

  return side === "left"
    ? angle
    : -angle;
}

function sparkStyle(
  index: number,
  stage: Stage,
  side: TraceSide,
) {
  const irregularity =
    index % 2 === 0
      ? 1
      : 1 +
      LOGO_TRACE.sparkIrregularity;

  const sideOffset =
    side === "right"
      ? LOGO_TRACE.sparkFrequencyMs *
      LOGO_TRACE.sparkSideOffsetRatio
      : 0;

  const delayMs =
    stage.delayMs +
    index *
    LOGO_TRACE.sparkFrequencyMs *
    irregularity +
    sideOffset;

  return {
    "--logo-spark-delay":
      `${delayMs}ms`,
  } as CSSProperties;
}

function HeadSparks({
  stage,
  side,
}: {
  stage: Stage;
  side: TraceSide;
}) {
  if (!LOGO_TRACE.sparkEnabled) {
    return null;
  }

  return (
    <g className="logo-current-sparks">
      {Array.from(
        {
          length:
            LOGO_TRACE.sparkCount,
        },
        (_, index) => (
          <g
            className="logo-current-spark"
            key={index}
            style={sparkStyle(
              index,
              stage,
              side,
            )}
            transform={`rotate(${sparkAngle(
              index,
              side,
            )})`}
          >
            <path
              d={sparkPath(index)}
            />
          </g>
        ),
      )}
    </g>
  );
}

function timingStyle(
  stage: Stage,
) {
  return {
    "--logo-current-delay":
      `${stage.delayMs}ms`,

    "--logo-current-duration":
      `${stage.durationMs}ms`,
  } as CSSProperties;
}

function CurrentPath({
  path,
  stage,
  side,
}: {
  path: string;
  stage: Stage;
  side: TraceSide;
}) {
  const begin =
    `${stage.delayMs}ms`;

  const duration =
    `${stage.durationMs}ms`;

  return (
    <g
      className="logo-current-stage"
      style={timingStyle(stage)}
    >
      <path
        className="logo-current-path logo-current-path--bloom"
        d={path}
        pathLength="1"
      />

      <path
        className="logo-current-path logo-current-path--trail"
        d={path}
        pathLength="1"
      />

      <path
        className="logo-current-path logo-current-path--body"
        d={path}
        pathLength="1"
      />

      <path
        className="logo-current-path logo-current-path--core"
        d={path}
        pathLength="1"
      />

      <g className="logo-current-head">
        <circle
          className="logo-current-head__bloom"
          r={
            LOGO_TRACE.headGlowRadius
          }
        />

        <circle
          className="logo-current-head__body"
          r={
            LOGO_TRACE.headCyanRadius
          }
        />

        <circle
          className="logo-current-head__core"
          r={
            LOGO_TRACE.headCoreRadius
          }
        />

        <path
          className="logo-current-head__arc logo-current-head__arc--one"
          d="M-42 -8 Q-29 -29 -14 -13"
        />

        <path
          className="logo-current-head__arc logo-current-head__arc--two"
          d="M16 11 Q31 30 43 7"
        />

        <HeadSparks
          stage={stage}
          side={side}
        />

        <animateMotion
          begin={begin}
          dur={duration}
          fill="freeze"
          path={path}
        />
      </g>
    </g>
  );
}

export default function LogoTrace() {
  return (
    <svg
      className="logo-trace-svg"
      viewBox="0 0 466 349"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={logoTraceStyle}
    >
      <defs>
        <radialGradient id="logo-current-radial">
          <stop
            offset="0"
            stopColor={
              LOGO_TRACE.coreColor
            }
            stopOpacity={
              LOGO_TRACE.headGlowStrength
            }
          />

          <stop
            offset=".2"
            stopColor={
              LOGO_TRACE.headCyanColor
            }
            stopOpacity={
              LOGO_TRACE.headCyanStrength
            }
          />

          <stop
            offset="1"
            stopColor={
              LOGO_TRACE.cyanColor
            }
            stopOpacity="0"
          />
        </radialGradient>

        <filter
          id="logo-current-noise"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={
              LOGO_TRACE.turbulenceFrequencyLow
            }
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values={`${LOGO_TRACE.turbulenceFrequencyLow};${LOGO_TRACE.turbulenceFrequencyHigh};${LOGO_TRACE.turbulenceFrequencyMid};${LOGO_TRACE.turbulenceFrequencyLow}`}
              dur={`${LOGO_TRACE.turbulenceMotionMs}ms`}
              repeatCount="indefinite"
            />
          </feTurbulence>

          <feOffset
            in="noise"
            dx="0"
            dy="0"
            result="movingNoise"
          >
            <animate
              attributeName="dx"
              values={`${-LOGO_TRACE.turbulenceDriftPx};${LOGO_TRACE.turbulenceDriftPx};${-LOGO_TRACE.turbulenceDriftPx * 0.6};${LOGO_TRACE.turbulenceDriftPx * 0.8};${-LOGO_TRACE.turbulenceDriftPx}`}
              dur={`${LOGO_TRACE.turbulenceDriftXMs}ms`}
              repeatCount="indefinite"
            />

            <animate
              attributeName="dy"
              values={`${LOGO_TRACE.turbulenceDriftPx * 0.5};${-LOGO_TRACE.turbulenceDriftPx * 0.7};${LOGO_TRACE.turbulenceDriftPx * 0.8};${-LOGO_TRACE.turbulenceDriftPx * 0.4};${LOGO_TRACE.turbulenceDriftPx * 0.5}`}
              dur={`${LOGO_TRACE.turbulenceDriftYMs}ms`}
              repeatCount="indefinite"
            />
          </feOffset>

          <feDisplacementMap
            in="SourceGraphic"
            in2="movingNoise"
            scale={
              LOGO_TRACE.displacementMid
            }
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              values={`${LOGO_TRACE.displacementMin};${LOGO_TRACE.displacementMax};${LOGO_TRACE.displacementMid};${LOGO_TRACE.displacementMax};${LOGO_TRACE.displacementMin}`}
              dur={`${LOGO_TRACE.displacementMotionMs}ms`}
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>
      </defs>

      <g transform="translate(-33.3 -56.5) scale(.491 .432)">
        {stages.flatMap(
          (stage, index) => [
            <CurrentPath
              key={`left-${index}`}
              path={stage.left}
              stage={stage}
              side="left"
            />,

            <CurrentPath
              key={`right-${index}`}
              path={stage.right}
              stage={stage}
              side="right"
            />,
          ],
        )}

        <g className="logo-current-junction logo-current-junction--lower">
          <circle
            cx="535"
            cy="918"
            r={
              LOGO_TRACE.junctionRadius
            }
          />

          <circle
            cx="560"
            cy="918"
            r={
              LOGO_TRACE.junctionRadius
            }
          />
        </g>

        <circle
          className="logo-current-junction logo-current-junction--upper"
          cx="547"
          cy="518"
          r={
            LOGO_TRACE.upperJunctionRadius
          }
        />

        <g transform="translate(86 878)">
          <g className="logo-current-exit logo-current-exit--left">
            <circle
              r={
                LOGO_TRACE.exitGlowRadius
              }
            />

            <path d="M-8 0 L-42 17 M-4 -7 L-29 -24" />
          </g>
        </g>

        <g transform="translate(1009 878)">
          <g className="logo-current-exit logo-current-exit--right">
            <circle
              r={
                LOGO_TRACE.exitGlowRadius
              }
            />

            <path d="M8 0 L42 17 M4 -7 L29 -24" />
          </g>
        </g>
      </g>
    </svg>
  );
}