export const DIGITAL_TWIN_CYCLE_SECONDS = 47;
export const DIGITAL_TWIN_SIGNOFF_START_SECONDS = 38.6;
export const DIGITAL_TWIN_SIGNOFF_END_SECONDS = 46.5;

const DIGITAL_TWIN_TIMELINE = Object.freeze({
  establishEnd: 0.7,
  energyEnd: 9.2,
  energyHandoffEnd: 9.8,
  storeEnd: 16.3,
  storeHandoffEnd: 16.9,
  generateEnd: 25.4,
  generateHandoffEnd: 26,
  dispatchEnd: 33.5,
  dispatchHandoffEnd: 34.1,
  lowerEnd: 38.6,
  lowerHandoffEnd: DIGITAL_TWIN_SIGNOFF_START_SECONDS,
  signoffEnd: DIGITAL_TWIN_SIGNOFF_END_SECONDS,
});

export const DIGITAL_TWIN_BASE_PLATE = Object.freeze({
  width: 1600,
  height: 900,
  structureTopY: 105,
  structureBaseY: 881,
  ambientWaterlineY: 493,
  externalPipeAngleDegrees: 0,
  embedmentDepthFeet: Object.freeze([30, 50] as const),
  signatureSequenceDuration: DIGITAL_TWIN_CYCLE_SECONDS,
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

  return Math.max(
    pulse(DIGITAL_TWIN_TIMELINE.establishEnd, 3.9),
    pulse(
      DIGITAL_TWIN_TIMELINE.dispatchHandoffEnd,
      DIGITAL_TWIN_TIMELINE.signoffEnd,
    ),
  );
}

function operationScene(
  phase: DigitalTwinOperation,
  progress: number,
): DigitalTwinScene {
  const inRamp = smoothstep(progress / 0.09);
  const outRamp = smoothstep((1 - progress) / 0.09);

  return {
    phase,
    progress,
    activity: inRamp * outRamp,
    cardsVisible: progress > 0.075 && progress < 0.925,
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

  if (time < DIGITAL_TWIN_TIMELINE.establishEnd) {
    return {
      phase: "establish",
      progress: time / DIGITAL_TWIN_TIMELINE.establishEnd,
      activity: 0,
      cardsVisible: false,
    };
  }
  if (time < DIGITAL_TWIN_TIMELINE.energyEnd) {
    return operationScene(
      "charge",
      (time - DIGITAL_TWIN_TIMELINE.establishEnd) / 8.5,
    );
  }
  if (time < DIGITAL_TWIN_TIMELINE.energyHandoffEnd) {
    return handoffScene(
      "charge",
      "summary",
      (time - DIGITAL_TWIN_TIMELINE.energyEnd) / 0.6,
    );
  }
  if (time < DIGITAL_TWIN_TIMELINE.storeHandoffEnd) {
    return {
      phase: "summary",
      progress:
        (time - DIGITAL_TWIN_TIMELINE.energyHandoffEnd) /
        (DIGITAL_TWIN_TIMELINE.storeHandoffEnd -
          DIGITAL_TWIN_TIMELINE.energyHandoffEnd),
      activity: 0,
      cardsVisible: false,
    };
  }
  if (time < DIGITAL_TWIN_TIMELINE.generateEnd) {
    return operationScene(
      "upper",
      (time - DIGITAL_TWIN_TIMELINE.storeHandoffEnd) / 8.5,
    );
  }
  if (time < DIGITAL_TWIN_TIMELINE.generateHandoffEnd) {
    return handoffScene(
      "upper",
      "summary",
      (time - DIGITAL_TWIN_TIMELINE.generateEnd) / 0.6,
    );
  }

  if (time < DIGITAL_TWIN_TIMELINE.dispatchHandoffEnd) {
    return {
      phase: "summary",
      progress:
        (time - DIGITAL_TWIN_TIMELINE.generateHandoffEnd) /
        (DIGITAL_TWIN_TIMELINE.dispatchHandoffEnd -
          DIGITAL_TWIN_TIMELINE.generateHandoffEnd),
      activity: 0,
      cardsVisible: false,
    };
  }
  if (time < DIGITAL_TWIN_TIMELINE.lowerEnd) {
    return operationScene(
      "lower",
      (time - DIGITAL_TWIN_TIMELINE.dispatchHandoffEnd) / 3.5,
    );
  }
  if (time < DIGITAL_TWIN_TIMELINE.lowerHandoffEnd) {
    return handoffScene(
      "lower",
      "summary",
      (time - DIGITAL_TWIN_TIMELINE.lowerEnd) / 0.6,
    );
  }

  return {
    phase: "summary",
    progress:
      (time - DIGITAL_TWIN_TIMELINE.lowerHandoffEnd) /
      (DIGITAL_TWIN_CYCLE_SECONDS - DIGITAL_TWIN_TIMELINE.lowerHandoffEnd),
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

  if (
    time >= DIGITAL_TWIN_TIMELINE.establishEnd &&
    time < DIGITAL_TWIN_TIMELINE.energyEnd
  ) return "energy";
  if (
    time >= DIGITAL_TWIN_TIMELINE.energyHandoffEnd &&
    time < DIGITAL_TWIN_TIMELINE.storeEnd
  ) return "store";
  if (
    time >= DIGITAL_TWIN_TIMELINE.storeHandoffEnd &&
    time < DIGITAL_TWIN_TIMELINE.generateEnd
  ) return "generate";
  if (
    time >= DIGITAL_TWIN_TIMELINE.generateHandoffEnd &&
    time < DIGITAL_TWIN_TIMELINE.dispatchEnd
  ) return "dispatch";
  return null;
}

export function reservoirLevelsAt(seconds: number): ReservoirLevels {
  const time =
    ((seconds % DIGITAL_TWIN_CYCLE_SECONDS) + DIGITAL_TWIN_CYCLE_SECONDS) %
    DIGITAL_TWIN_CYCLE_SECONDS;
  let upper = 0.18;
  let lower = 0.73;

  if (
    time >= DIGITAL_TWIN_TIMELINE.establishEnd &&
    time < DIGITAL_TWIN_TIMELINE.energyEnd
  ) {
    const progress = smoothstep(
      (time - (DIGITAL_TWIN_TIMELINE.establishEnd + 1.25)) /
        (DIGITAL_TWIN_TIMELINE.energyEnd -
          DIGITAL_TWIN_TIMELINE.establishEnd -
          2.05),
    );
    lower = 0.73 + 0.05 * progress;
    upper = 0.18 - 0.05 * progress;
  } else if (
    time >= DIGITAL_TWIN_TIMELINE.energyEnd &&
    time < DIGITAL_TWIN_TIMELINE.storeHandoffEnd
  ) {
    lower = 0.78;
    upper = 0.13;
  } else if (
    time >= DIGITAL_TWIN_TIMELINE.storeHandoffEnd + 0.9 &&
    time < DIGITAL_TWIN_TIMELINE.generateEnd
  ) {
    const progress = smoothstep(
      (time - (DIGITAL_TWIN_TIMELINE.storeHandoffEnd + 0.9)) /
        (DIGITAL_TWIN_TIMELINE.generateEnd -
          DIGITAL_TWIN_TIMELINE.storeHandoffEnd -
          1.7),
    );
    lower = 0.78 - 0.05 * progress;
    upper = 0.13 + 0.05 * progress;
  } else if (
    time >= DIGITAL_TWIN_TIMELINE.storeHandoffEnd &&
    time < DIGITAL_TWIN_TIMELINE.storeHandoffEnd + 0.9
  ) {
    lower = 0.78;
    upper = 0.13;
  } else if (
    time >= DIGITAL_TWIN_TIMELINE.generateEnd &&
    time < DIGITAL_TWIN_TIMELINE.dispatchHandoffEnd
  ) {
    lower = 0.73;
    upper = 0.18;
  }

  return { upper, lower };
}

export function manualReservoirLevels(
  phase: DigitalTwinOperation | "summary",
): ReservoirLevels {
  if (phase === "lower") return { upper: 0.18, lower: 0.74 };
  if (phase === "charge") return { upper: 0.152, lower: 0.755 };
  if (phase === "upper") return { upper: 0.152, lower: 0.755 };
  return { upper: 0.18, lower: 0.73 };
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
