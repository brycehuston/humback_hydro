export const DIGITAL_TWIN_CYCLE_SECONDS = 29;

export const DIGITAL_TWIN_BASE_PLATE = Object.freeze({
  width: 1600,
  height: 900,
  structureTopY: 105,
  structureBaseY: 881,
  ambientWaterlineY: 493,
  externalPipeAngleDegrees: 0,
  embedmentDepthFeet: Object.freeze([30, 50] as const),
});

export type DigitalTwinOperation = "lower" | "charge" | "upper";
export type DigitalTwinSignatureStage =
  | "energy"
  | "store"
  | "generate"
  | "dispatch";

export type DigitalTwinScene =
  | {
      phase: "establish" | "summary";
      progress: number;
      activity: 0;
      cardsVisible: false;
    }
  | {
      phase: DigitalTwinOperation;
      progress: number;
      activity: number;
      cardsVisible: boolean;
    }
  | {
      phase: "handoff";
      from: DigitalTwinOperation;
      to: DigitalTwinOperation | "summary";
      progress: number;
      activity: 0;
      cardsVisible: false;
    };

export type ReservoirLevels = {
  upper: number;
  lower: number;
};

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smoothstep(value: number) {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
}

export function flagBreezeActivityAt(seconds: number) {
  const time =
    ((seconds % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
    DIGITAL_TWIN_CYCLE_SECONDS;
  const pulse = (start: number, end: number) => {
    if (time < start || time > end) return 0;
    return Math.sin(((time - start) / (end - start)) * Math.PI);
  };

  return Math.max(pulse(0, 2.4), pulse(24.5, DIGITAL_TWIN_CYCLE_SECONDS));
}

function operationScene(
  phase: DigitalTwinOperation,
  progress: number,
): DigitalTwinScene {
  const inRamp = smoothstep(progress / 0.16);
  const outRamp = smoothstep((1 - progress) / 0.18);

  return {
    phase,
    progress,
    activity: inRamp * outRamp,
    cardsVisible: progress > 0.13 && progress < 0.87,
  };
}

function handoffScene(
  from: DigitalTwinOperation,
  to: DigitalTwinOperation | "summary",
  progress: number,
): DigitalTwinScene {
  return {
    phase: "handoff",
    from,
    to,
    progress,
    activity: 0,
    cardsVisible: false,
  };
}

export function digitalTwinSceneAt(seconds: number): DigitalTwinScene {
  const time =
    ((seconds % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
    DIGITAL_TWIN_CYCLE_SECONDS;

  if (time < 1) {
    return {
      phase: "establish",
      progress: time,
      activity: 0,
      cardsVisible: false,
    };
  }
  if (time < 4) return operationScene("lower", (time - 1) / 3);
  if (time < 5) return handoffScene("lower", "charge", time - 4);
  if (time < 15) return operationScene("charge", (time - 5) / 10);
  if (time < 16) return handoffScene("charge", "upper", time - 15);
  if (time < 26) return operationScene("upper", (time - 16) / 10);
  if (time < 27) return handoffScene("upper", "summary", time - 26);

  return {
    phase: "summary",
    progress: (time - 27) / 2,
    activity: 0,
    cardsVisible: false,
  };
}

export function digitalTwinSignatureStageAt(
  seconds: number,
): DigitalTwinSignatureStage | null {
  const time =
    ((seconds % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
    DIGITAL_TWIN_CYCLE_SECONDS;

  if (time >= 5 && time < 10) return "energy";
  if (time >= 10 && time < 15) return "store";
  if (time >= 16 && time < 21) return "generate";
  if (time >= 21 && time < 27) return "dispatch";
  return null;
}

export function reservoirLevelsAt(seconds: number): ReservoirLevels {
  const time =
    ((seconds % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
    DIGITAL_TWIN_CYCLE_SECONDS;
  let upper = 0.18;
  let lower = 0.85;

  if (time >= 1 && time < 4) {
    lower = 0.85 - 0.06 * smoothstep((time - 1) / 3);
  } else if (time >= 4 && time < 5) {
    lower = 0.79;
  } else if (time >= 5 && time < 15) {
    const progress = smoothstep((time - 5) / 10);
    lower = 0.79 + 0.06 * progress;
    upper = 0.18 - 0.055 * progress;
  } else if (time >= 15 && time < 16) {
    lower = 0.85;
    upper = 0.125;
  } else if (time >= 16 && time < 26) {
    upper = 0.125 + 0.055 * smoothstep((time - 16) / 10);
  } else if (time >= 26 && time < 27) {
    upper = 0.18;
  }

  return { upper, lower };
}

export function manualReservoirLevels(
  phase: DigitalTwinOperation | "summary",
): ReservoirLevels {
  if (phase === "lower") return { upper: 0.18, lower: 0.82 };
  if (phase === "charge") return { upper: 0.152, lower: 0.822 };
  if (phase === "upper") return { upper: 0.152, lower: 0.85 };
  return { upper: 0.18, lower: 0.85 };
}

export function manualDigitalTwinScene(
  phase: DigitalTwinOperation | "summary",
): DigitalTwinScene {
  if (phase === "summary") {
    return {
      phase: "summary",
      progress: 1,
      activity: 0,
      cardsVisible: false,
    };
  }

  return operationScene(phase, 0.5);
}
