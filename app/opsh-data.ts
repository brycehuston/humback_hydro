export type OpshStageId = "anatomy" | "store" | "generate" | "impact";

export type OpshComponentId =
  | "structure"
  | "upper-reservoir"
  | "lower-reservoir"
  | "upper-turbines"
  | "lower-turbines"
  | "upper-penstock"
  | "lower-penstock"
  | "pumps";

export type OpshStage = {
  id: OpshStageId;
  number: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  camera: {
    position: readonly [number, number, number];
    target: readonly [number, number, number];
  };
  highlights: readonly OpshComponentId[];
  flowDirections: readonly string[];
  waterLevels: {
    upper: number;
    lower: number;
  };
};

export type OpshMotionState = {
  progress: number;
  stageIndex: number;
  reducedMotion: boolean;
};

export const opshStages: readonly OpshStage[] = [
  {
    id: "anatomy",
    number: "01",
    shortLabel: "Anatomy",
    eyebrow: "The Fixed Offshore Structure",
    title: "The Mountain, Rebuilt at Sea.",
    description:
      "Traditional pumped hydro depends on rare elevation and can require major land disruption. This concept creates the required vertical separation inside a fixed offshore structure.",
    detail:
      "A cutaway reveals two engineered reservoirs stacked vertically, two turbine stages, dedicated penstocks and a lower-reservoir pump array.",
    camera: {
      position: [12.5, 6.5, 15.5],
      target: [0, 1.2, 0],
    },
    highlights: ["structure", "upper-reservoir", "lower-reservoir"],
    flowDirections: [],
    waterLevels: { upper: 0.58, lower: 0.58 },
  },
  {
    id: "store",
    number: "02",
    shortLabel: "Store",
    eyebrow: "Low-Demand Cycle",
    title: "Store Energy by Lifting Water.",
    description:
      "When demand is low, pumps move seawater from the lower reservoir into the upper reservoir, storing energy as gravitational potential.",
    detail:
      "The lower pump array and dedicated riser are highlighted as the upper water level rises.",
    camera: {
      position: [9.8, 4.4, 12.2],
      target: [0, 0.6, 0],
    },
    highlights: ["lower-reservoir", "pumps", "upper-reservoir"],
    flowDirections: ["Lower reservoir → pump array → upper reservoir"],
    waterLevels: { upper: 0.86, lower: 0.3 },
  },
  {
    id: "generate",
    number: "03",
    shortLabel: "Generate",
    eyebrow: "High-Demand Cycle",
    title: "Generate Through Two Turbine Stages.",
    description:
      "When demand rises, controlled water flow drives the upper and lower turbine stages before the cycle resets.",
    detail:
      "Upper-reservoir water passes through the upper turbine stage to the ocean while ocean water simultaneously enters through the lower turbine stage.",
    camera: {
      position: [10.6, 2.6, 10.2],
      target: [0, -0.1, 0],
    },
    highlights: [
      "upper-reservoir",
      "upper-penstock",
      "upper-turbines",
      "lower-penstock",
      "lower-turbines",
      "lower-reservoir",
    ],
    flowDirections: [
      "Upper reservoir → upper turbine stage → ocean",
      "Ocean → lower turbine stage → lower reservoir",
    ],
    waterLevels: { upper: 0.28, lower: 0.84 },
  },
  {
    id: "impact",
    number: "04",
    shortLabel: "Evidence",
    eyebrow: "Published and University Studies",
    title: "Studied as Infrastructure, Not Presented as an Operating Plant.",
    description:
      "Published and university studies analyze different configurations of the architecture. Their modeled results are kept separate and shown with limitations.",
    detail:
      "The composite concept model explains the shared architecture. It does not combine the dimensions or performance figures of separate design iterations.",
    camera: {
      position: [13.5, 7.4, 16.8],
      target: [0, 1.2, 0],
    },
    highlights: [
      "structure",
      "upper-reservoir",
      "lower-reservoir",
      "upper-turbines",
      "lower-turbines",
      "pumps",
    ],
    flowDirections: [],
    waterLevels: { upper: 0.58, lower: 0.58 },
  },
] as const;

export const studyEvidence = [
  {
    index: "01",
    year: "2024",
    source: "IEEE EESAT",
    title: "Multi-Reservoir Continuous Supply System",
    result:
      "A 10 MW system was analyzed over a 24-hour discharge cycle.",
    limitation:
      "Published engineering analysis; not measured output from an operating facility.",
    href: "https://ieeexplore.ieee.org/document/10471215",
    linkLabel: "Open Official IEEE Record",
  },
  {
    index: "02",
    year: "2015",
    source: "UBC Capstone",
    title: "Proof-of-Concept Configuration",
    result:
      "A UBC capstone proof-of-concept model calculated a 10 MW configuration with three hours of delivery and a maximum cycle efficiency of 70.2%.",
    limitation:
      "Calculated design result from a university capstone; not measured plant performance.",
  },
  {
    index: "03",
    year: "2022",
    source: "UBC Capstone",
    title: "Two-Stage Static Structure",
    result:
      "A later UBC capstone studied a two-stage static structure designed for 10.6 MW and continuous operation as needed.",
    limitation:
      "Design-study result with stated geotechnical and final-engineering limitations.",
  },
] as const;

export const ieeeCitation =
  "Mark R. J. Legacy, Emma Van Wyk, and Joshua Brinkerhoff, “Pumped Hydro Energy Storage: A Multi-Reservoir Continuous Supply Hydroelectric Generation and Storage System,” 2024 IEEE Electrical Energy Storage Application and Technologies Conference (EESAT), pp. 1–4.";
