export const brandmark = "/brandmark.webp";

export type LeadershipPublicationStatus =
  | "published-qualified"
  | "confirmed"
  | "review-only";

export interface LeadershipProfile {
  name: string;
  role: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  initials?: string;
  focus: string;
  biography?: readonly string[];
  publicationStatus: LeadershipPublicationStatus;
}

export interface DeliveryPartnerProfile {
  name: string;
  discipline: string;
  organization: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  initials?: string;
}

export const navItems = [
  { label: "Technology", href: "/technology" },
  { label: "Applications", href: "/applications" },
  { label: "Impact", href: "/impact" },
  { label: "Economics", href: "/economics" },
  { label: "Evidence", href: "/evidence" },
  { label: "Company", href: "/company" },
];

export const leadership: readonly LeadershipProfile[] = [
  {
    name: "Mark Legacy",
    role: "Founder & Chief Executive Officer",
    image: "/team/mark-legacy.jpg",
    imageAlt: "Portrait of Mark Legacy",
    imagePosition: "50% 28%",
    focus: "Company founder; patent and IEEE public records are linked below",
    publicationStatus: "published-qualified",
  },
  {
    name: "Col. Bryan Green (Ret.)",
    role: "Operations & Infrastructure Delivery",
    image: "/team/col-bryan-green.jpg",
    imageAlt: "Portrait of Col. Bryan Green (Ret.)",
    imagePosition: "50% 28%",
    focus: "Former USACE operations commander and infrastructure delivery leader",
    biography: [
      "U.S. Army Corps of Engineers retired colonel and former commander and military laboratory director with more than 30 years of overseas, technology and construction experience across the Gulf, Africa, the Pacific and Asia, including a $22 billion military-city and power-projection construction program on the Korean Peninsula.",
      "As a senior executive and consultant, Bryan has collaborated with senior stakeholders on nationally significant projects intended to protect lives, energize the economy and improve U.S. national security. His experience includes program building, cross-matrixed teams, innovation integration, technology transfer, commercialization, government contracting and resource management.",
      "His research and technology-development experience spans flood control, environmental systems, power and utilities, emergency management, civil and military engineering, advanced manufacturing and 3D printing, novel materials, autonomous systems, Engineering With Nature, power resilience, data centers, high-performance computing and megaproject delivery. He has managed laboratories and facilities across the United States involving 3,000 researchers and scientists and budgets exceeding $2 billion.",
    ],
    publicationStatus: "published-qualified",
  },
  {
    name: "Bryce Huston",
    role: "Chief Information Security Officer, Humpback Hydro",
    image: "/team/bryce-huston.jpg",
    imageAlt: "Portrait of Bryce Huston",
    imagePosition: "50% 30%",
    focus:
      "Information security, systems architecture, platform resilience and digital infrastructure.",
    publicationStatus: "published-qualified",
  },
];

export const deliveryPartners: readonly DeliveryPartnerProfile[] = [
  {
    name: "Rich Burgess",
    discipline: "Construction & Advanced Materials",
    organization: "President, Cor-Tuf UHPC | Virginia, USA",
    image: "/team/rich-burgess.jpg",
    imageAlt: "Portrait of Rich Burgess",
    imagePosition: "50% 28%",
  },
  {
    name: "Chris Calvin",
    discipline: "Advanced Materials",
    organization: "President, Lightweight Concrete Solutions | Ontario, Canada",
    image: "/team/chris-calvin.jpg",
    imageAlt: "Portrait of Chris Calvin",
    imagePosition: "50% 30%",
  },
  {
    name: "Gustavo Varela Latouche",
    discipline: "Electrical Engineering",
    organization: "Director General, COMTEL Ingeniería | Costa Rica",
    image: "/team/gustavo-varela-latouche.jpg",
    imageAlt: "Portrait of Gustavo Varela Latouche",
    imagePosition: "50% 32%",
  },
];

export const evidence = [
  {
    index: "01",
    category: "Intellectual Property",
    title: "U.S. Patent 8823195 B2",
    description: "Public record for U.S. Patent No. 8,823,195 B2.",
    status: "Verified Public Record",
    href: "https://patents.google.com/patent/US8823195B2/en",
  },
  {
    index: "02",
    category: "Technical Publication",
    title: "IEEE EESAT Publication, 2024",
    description: "Peer-reviewed conference paper describing a multi-reservoir continuous-supply generation and storage system.",
    status: "Verified Public Record",
    href: "https://ieeexplore.ieee.org/document/10471215",
  },
  {
    index: "03",
    category: "Proof-of-Concept Studies",
    title: "University Capstone Studies",
    description: "Static-system results are summarized separately with their modeled status and limitations.",
    status: "Static Summaries Published",
  },
  {
    index: "04",
    category: "Industry Recognition",
    title: "GLOBE Emerging-Technology Recognition",
    description: "Company-supplied recognition language awaiting a primary event record and exact category confirmation.",
    status: "Source Confirmation Pending",
  },
];

export const roadmap = [
  {
    phase: "01",
    label: "Documented Position",
    status: "Current Public Record",
    title: "Evidence Before Scale",
    copy: "The public foundation consists of the patent record, the 2024 IEEE paper and qualified university-study summaries.",
  },
  {
    phase: "02",
    label: "Engineering Gate",
    status: "Pending",
    title: "Independent Validation",
    copy: "Independent engineering validation remains a required next gate. No completed validation report is represented here.",
  },
  {
    phase: "03",
    label: "Deployment Gate",
    status: "Planned",
    title: "Pilot Deployment",
    copy: "A pilot remains forward-looking and dependent on site, engineering, environmental, financing and partner approvals.",
  },
  {
    phase: "04",
    label: "Future Gate",
    status: "Not Yet Established",
    title: "Commercialization",
    copy: "Commercial scale, manufacturing configuration and deployment timing require an approved roadmap and supporting evidence.",
  },
];

export const standardsRoadmap = [
  {
    phase: "Phase 1",
    sourceLabel: "Current",
    title: "Build the Quality-System Foundation",
    actions: [
      "Design Humpback processes to ISO requirements.",
      "Write manuals and procedures using ISO terminology.",
      "Build the quality system from the beginning.",
    ],
  },
  {
    phase: "Phase 2",
    sourceLabel: "Prototype and Validation",
    title: "Implement and Audit the Systems",
    actions: [
      "Implement the management systems.",
      "Conduct internal audits.",
      "Have engineering partners work within those systems.",
    ],
  },
  {
    phase: "Phase 3",
    sourceLabel: "Commercialization",
    title: "Pursue Accredited Certification",
    actions: [
      "Obtain third-party certification from an accredited registrar.",
      "Promote certification in investor materials, utility proposals and government procurement only after it is obtained.",
    ],
  },
] as const;

export const standards = [
  "ISO 9001 — Quality Management",
  "ISO 14001 — Environmental Management",
  "ISO 45001 — Occupational Health and Safety",
  "ISO 55001 — Asset Management",
  "ISO 31000 — Risk Management",
  "ISO 27001 — Information Security",
  "IEC 62443 — Industrial Control-System Cybersecurity",
  "ISO 22301 — Business Continuity",
  "ISO 50001 — Energy Management",
  "ISO 26000 — Social Responsibility",
  "ISO 37001 — Anti-Bribery Management",
] as const;

export const engineeringPillars = [
  "Engineering Excellence",
  "Environmental Stewardship",
  "Safety",
  "Digital Infrastructure",
  "Corporate Governance",
  "Operations & Maintenance",
] as const;

export const applications = [
  {
    id: "data-centers",
    kicker: "Primary Market Entry",
    label: "Data Centers",
    title: "Power Where the Grid Cannot Move Fast Enough.",
    description:
      "A behind-the-meter or grid-connected pathway designed for compute campuses that value reliability, clean-energy integration and speed-to-power.",
    points: ["Reliable Power Architecture", "Long-Duration Flexibility", "Phased Modular Delivery"],
    image: "/grid-data-center-night.webp",
    cta: "Explore Data-Center Power",
  },
  {
    id: "utilities",
    kicker: "Grid Infrastructure",
    label: "Utilities",
    title: "Dispatchable Capacity for a Changing Grid.",
    description:
      "A long-duration platform designed to support renewable integration, capacity planning and grid stability.",
    points: ["Energy Shifting", "Potential Grid Services", "Firm Capacity Pathway"],
    image: "/hero-ai-power-campus.webp",
    cta: "Discuss Utility Integration",
  },
  {
    id: "islands",
    kicker: "Energy Sovereignty",
    label: "Island Systems",
    title: "Resilient Infrastructure Where Every Resource Matters.",
    description:
      "A marine platform aligned with island and remote regions pursuing energy security, water security and lower fuel dependence.",
    points: ["Local Energy Resilience", "Renewable Integration", "Water-System Potential"],
    image: "/island-energy-water.webp",
    cta: "Evaluate a Regional Opportunity",
  },
  {
    id: "industry",
    kicker: "Critical Operations",
    label: "Ports & Industry",
    title: "Dependable Energy for Operations That Cannot Wait.",
    description:
      "Modular infrastructure designed for ports, industrial zones, and critical or defense facilities evaluating reliable power close to demand.",
    points: ["Critical-Site Planning", "On-Site Reliability", "Scalable Architecture"],
    image: "/manufacturing-campus.webp",
    cta: "Explore Industrial Deployment",
  },
  {
    id: "water",
    kicker: "Integrated Resilience",
    label: "Water Systems",
    title: "Energy Infrastructure With Broader Water Potential.",
    description:
      "A platform whose broader mission includes water security and potential alignment with desalination infrastructure.",
    points: ["Energy and Water Planning", "Co-Location Potential", "Climate Resilience"],
    image: "/island-energy-water.webp",
    cta: "Discuss Water Infrastructure",
  },
];
