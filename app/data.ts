export const brandmark = "/brandmark.svg";
export const brandLockupNav = "/brand/humpback-hydro-lockup-nav.png";
export const brandLockupFull = "/brand/humpback-hydro-lockup-full.png";

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
  imageBg?: string;
  imageScale?: number;
  imageHoverScale?: number;
  initials?: string;
  focus: string;
  profileLabel?: string;
  specialty?: string;
  credentialLabel?: string;
  credentialValue?: string | readonly string[];
  biography?: readonly string[];
  publicationStatus: LeadershipPublicationStatus;
}

export interface DeliveryCapability {
  discipline: string;
  scope: string;
}

export interface DeliveryPartnerProfile {
  name: string;
  discipline: string;
  relationship: string;
  role: string;
  location: string;
  organization: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
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
    image: "/team/mark-legacy.webp",
    imageAlt: "Portrait of Mark Legacy",
    imagePosition: "50% 28%",
    focus: "Company founder; patent and IEEE public records are linked below",
    publicationStatus: "published-qualified",
  },
  {
    name: "Col. Bryan Green (Ret.)",
    role: "Operations & Infrastructure Delivery",
    image: "/team/col-bryan-green.webp",
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
    role: "CHIEF INFORMATION SECURITY OFFICER",
    image: "/team/bryce-huston.webp",
    imageAlt: "Portrait of Bryce Huston",
    imagePosition: "50% 30%",
    focus: "Information Security • AI Systems • Digital Infrastructure",
    profileLabel: "SECURITY & DIGITAL INFRASTRUCTURE",
    specialty: "Information Security • AI Systems • Digital Infrastructure",
    credentialLabel: "TECH CONSULTANT & SYSTEMS ARCHITECT",
    credentialValue: ["HUSTON SOLUTION Inc.", "FruxLabs", "Alpha Alerts"],
    biography: [
      "Bryce Huston is Chief Information Security Officer at Humpback Hydro and founder of FruxLabs, Alpha Alerts and HUSTON SOLUTION Inc. His work spans information security, applied artificial intelligence, automation, quantitative systems and digital infrastructure, with a focus on building secure, resilient systems and high-performance digital products for real-world operation.",
      "A hands-on systems architect and technical operator, Bryce designs and builds production platforms integrating real-time data acquisition, automated decision systems, quantitative analysis, secure cloud infrastructure, operational monitoring and AI-assisted workflows. His work also extends to premium digital experience design, combining technical architecture with meticulous interface design, animation, interactive motion and performance engineering to create polished, highly responsive web platforms.",
      "His broader technical work includes real-time intelligence systems, quantitative research and backtesting infrastructure, AI-enabled automation, high-frequency data processing, telemetry and data-driven decision architecture. Through FruxLabs and Alpha Alerts, he has developed and operated systems spanning market intelligence, signal research, risk modelling, automated monitoring and execution research, with particular emphasis on reliability, data integrity and disciplined risk controls.",
      "At Humpback Hydro, Bryce leads information security and digital infrastructure strategy, establishing the secure, scalable digital foundation supporting engineering collaboration, data integrity, operational continuity and future platform growth. His approach combines system architecture, risk management and execution discipline to build the infrastructure required to scale.",
    ],
    publicationStatus: "published-qualified",
  },
];

export const deliveryPartners: readonly DeliveryPartnerProfile[] = [
  {
    name: "Rich Burgess",
    discipline: "Construction & Advanced Materials",
    relationship: "Technical Partner / Contractor",
    role: "President, Cor-Tuf UHPC",
    location: "Virginia, USA",
    organization: "President, Cor-Tuf UHPC | Virginia, USA",
    image: "/team/rich-burgess.webp",
    imageAlt: "Portrait of Rich Burgess",
    imagePosition: "50% 28%",
  },
  {
    name: "Chris Calvin",
    discipline: "Advanced Materials",
    relationship: "Technical Partner",
    role: "President, Lightweight Concrete Solutions",
    location: "Ontario, Canada",
    organization: "President, Lightweight Concrete Solutions | Ontario, Canada",
    image: "/team/chris-calvin.webp",
    imageAlt: "Portrait of Chris Calvin",
    imagePosition: "50% 30%",
  },
  {
    name: "Gustavo Varela Latouche",
    discipline: "Electrical Engineering",
    relationship: "Electrical Engineering Partner",
    role: "Director General, COMTEL Ingeniería",
    location: "Costa Rica",
    organization: "Director General, COMTEL Ingeniería | Costa Rica",
    image: "/team/gustavo-varela-latouche.webp",
    imageAlt: "Portrait of Gustavo Varela Latouche",
    imagePosition: "50% 32%",
  },
];

export const deliveryCapabilities: readonly DeliveryCapability[] = [
  {
    discipline: "Construction / EPC",
    scope: "Constructability, civil works, procurement strategy and site delivery.",
  },
  {
    discipline: "Advanced Materials",
    scope: "Material selection, durability, testing and marine-environment qualification.",
  },
  {
    discipline: "Electrical Engineering",
    scope: "Generation, pumping, protection, interconnection and grid integration.",
  },
  {
    discipline: "Manufacturing",
    scope: "Repeatable fabrication, quality control, assembly and supply-chain planning.",
  },
  {
    discipline: "Project Delivery",
    scope: "Site, permitting, commercial, construction and commissioning coordination.",
  },
];

export const evidence = [
  {
    index: "01",
    category: "Intellectual Property",
    title: "U.S. Patent 8823195 B2",
    description: "Public record for U.S. Patent No. 8,823,195 B2.",
    status: "Public Patent Record",
    statusTone: "documented",
    href: "https://patents.google.com/patent/US8823195B2/en",
    external: true,
    action: "OPEN PUBLIC RECORD",
  },
  {
    index: "02",
    category: "Technical Publication",
    title: "IEEE EESAT Conference Paper, 2024",
    description: "Peer-reviewed conference paper describing a multi-reservoir continuous-supply generation and storage system.",
    status: "Peer-Reviewed IEEE Conference Paper",
    statusTone: "documented",
    href: "https://ieeexplore.ieee.org/document/10471215",
    external: true,
    action: "OPEN IEEE RECORD",
  },
  {
    index: "03",
    category: "Proof-of-Concept Studies",
    title: "University Capstone Studies",
    description: "Static-system results are summarized separately with their modeled status and limitations.",
    status: "University Engineering Study",
    statusTone: "documented",
    href: "#technical-study-record",
    external: false,
    action: "READ STUDY SUMMARIES",
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
    status: "Validation Pathway",
    title: "Independent Validation",
    copy: "Humpback Hydro is advancing through independent engineering validation as the next engineering gate.",
  },
  {
    phase: "03",
    label: "Deployment Gate",
    status: "Next Commercial Milestone",
    title: "Pilot Deployment",
    copy: "Pilot deployment is the next commercial milestone, subject to site, engineering, environmental, financing and partner approvals.",
  },
  {
    phase: "04",
    label: "Future Gate",
    status: "Commercialization Pathway",
    title: "Commercialization",
    copy: "Commercial scale, manufacturing configuration and deployment timing will be defined through an approved roadmap and supporting evidence.",
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
    id: "utilities",
    kicker: "Grid Infrastructure",
    label: "Utilities",
    title: "Dispatchable Capacity for a Changing Grid.",
    description:
      "A long-duration platform designed to support renewable integration, capacity planning and grid stability.",
    points: ["Energy Shifting", "Potential Grid Services", "Firm Capacity Pathway"],
    image: "/grid-data-center-night-approved.webp",
    cta: "Discuss Utility Integration",
  },
  {
    id: "data-centers",
    kicker: "AI Infrastructure",
    label: "AI & Data Centers",
    title: "Power Where the Grid Cannot Move Fast Enough.",
    description:
      "For energy-intensive AI infrastructure, Humpback is designed to provide rapid access to stored energy, continuous dispatchable power and greater energy security—helping address the speed-to-power and reliability constraints facing data-center development.",
    points: ["Rapid Stored-Energy Access", "Continuous Dispatchable Power", "Energy Security"],
    image: "/hero-ai-power-campus.webp",
    cta: "Explore Data-Center Power",
  },
  {
    id: "industry",
    kicker: "Critical Operations",
    label: "Industry",
    title: "Dependable Energy for Operations That Cannot Wait.",
    description:
      "Modular infrastructure designed for ports, industrial zones, and critical or defense facilities evaluating reliable power close to demand.",
    points: ["Critical-Site Planning", "On-Site Reliability", "Scalable Architecture"],
    image: "/manufacturing-campus-approved.webp",
    cta: "Explore Industrial Deployment",
  },
  {
    id: "islands",
    kicker: "Energy Sovereignty",
    label: "Islands & Remote Communities",
    title: "Resilient Infrastructure Where Every Resource Matters.",
    description:
      "A marine platform aligned with island and remote regions pursuing energy security, water security and lower fuel dependence.",
    points: ["Local Energy Resilience", "Renewable Integration", "Water-System Potential"],
    image: "/island-energy-water-approved.webp",
    cta: "Evaluate a Regional Opportunity",
  },
  {
    id: "water",
    kicker: "Integrated Resilience",
    label: "Water Systems",
    title: "Energy Infrastructure With Broader Water Potential.",
    description:
      "A platform whose broader mission includes water security and potential alignment with desalination infrastructure.",
    points: ["Energy and Water Planning", "Co-Location Potential", "Climate Resilience"],
    image: "/hero-ocean-infrastructure.webp",
    cta: "Discuss Water Infrastructure",
  },
  {
    id: "food-systems",
    kicker: "Resource Security",
    label: "Food Systems",
    title: "Reliable Energy and Water for Essential Production.",
    description:
      "A potential infrastructure pathway for food-production regions evaluating dependable power, water resilience and integrated resource planning.",
    points: ["Reliable Energy Supply", "Water-System Integration", "Regional Resilience"],
    image: "/food-systems-approved.webp",
    cta: "Discuss Food-System Infrastructure",
  },
];
