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
    label: "Pilot",
    scale: "1-10 MW",
    title: "Prove the Operating Platform",
    copy: "Planned deployment with existing manufacturing and engineering partners.",
  },
  {
    phase: "02",
    label: "Regional",
    scale: "10-100 MW",
    title: "Repeat Modular Infrastructure",
    copy: "Planned regional production built around repeatable delivery systems.",
  },
  {
    phase: "03",
    label: "Manufacturing",
    scale: "Semi-Automated",
    title: "Expand Industrial Capacity",
    copy: "Planned manufacturing expansion and supply-chain development.",
  },
  {
    phase: "04",
    label: "Industrialized",
    scale: "100 MW",
    title: "Automate at Grid Scale",
    copy: "Target fully automated production for repeatable deployment.",
  },
];

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
    label: "Industry",
    title: "Dependable Energy for Operations That Cannot Wait.",
    description:
      "Modular infrastructure designed for industrial customers seeking reliable clean power close to demand.",
    points: ["Direct Offtake Potential", "On-Site Reliability", "Scalable Architecture"],
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
