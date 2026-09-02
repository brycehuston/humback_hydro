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

export type OpshStudyEvidence = {
  index: string;
  year: string;
  source: string;
  title: string;
  result: string;
  limitation: string;
  href?: string;
  linkLabel?: string;
};

export const studyEvidence: readonly OpshStudyEvidence[] = [
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
];

export const ieeeCitation =
  "Mark R. J. Legacy, Emma Van Wyk, and Joshua Brinkerhoff, “Pumped Hydro Energy Storage: A Multi-Reservoir Continuous Supply Hydroelectric Generation and Storage System,” 2024 IEEE Electrical Energy Storage Application and Technologies Conference (EESAT), pp. 1–4.";
