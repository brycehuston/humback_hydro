import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import {
  calculateProjectScenario,
  normalizeCapacityMw,
  normalizeOperatingHorizon,
} from "../app/economics-model.ts";
import {
  DIGITAL_TWIN_BASE_PLATE,
  DIGITAL_TWIN_CYCLE_SECONDS,
  digitalTwinSceneAt,
  flagBreezeActivityAt,
  manualDigitalTwinScene,
  reservoirLevelsAt,
} from "../app/digital-twin.ts";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

const publicRoutes = [
  "/",
  "/technology",
  "/applications",
  "/impact",
  "/economics",
  "/evidence",
  "/company",
  "/partners",
];

const presetExpectations = [
  {
    capacity: 10,
    throughput: 78_840,
    capital: 50_000_000,
    gross: 9_460_800,
    royalty: 693_792,
    operationsAndMaintenance: 1_182_600,
    debtService: 2_365_200,
    deductions: 4_241_592,
    retained: 5_219_208,
    postDebt: 7_584_408,
    co2: 27_594,
  },
  {
    capacity: 100,
    throughput: 788_400,
    capital: 500_000_000,
    gross: 94_608_000,
    royalty: 6_937_920,
    operationsAndMaintenance: 11_826_000,
    debtService: 23_652_000,
    deductions: 42_415_920,
    retained: 52_192_080,
    postDebt: 75_844_080,
    co2: 275_940,
  },
  {
    capacity: 500,
    throughput: 3_942_000,
    capital: 2_500_000_000,
    gross: 473_040_000,
    royalty: 34_689_600,
    operationsAndMaintenance: 59_130_000,
    debtService: 118_260_000,
    deductions: 212_079_600,
    retained: 260_960_400,
    postDebt: 379_220_400,
    co2: 1_379_700,
  },
  {
    capacity: 1_000,
    throughput: 7_884_000,
    capital: 5_000_000_000,
    gross: 946_080_000,
    royalty: 69_379_200,
    operationsAndMaintenance: 118_260_000,
    debtService: 236_520_000,
    deductions: 424_159_200,
    retained: 521_920_800,
    postDebt: 758_440_800,
    co2: 2_759_400,
  },
];

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function fetchRoute(worker, route) {
  const response = await worker.fetch(
    new Request(`http://localhost${route}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
  return { response, html: await response.text() };
}

test("renders all public routes and development preview metadata", async () => {
  const worker = await loadWorker();
  for (const route of publicRoutes) {
    const { response, html } = await fetchRoute(worker, route);
    assert.equal(response.status, 200, route);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^text\/html\b/i,
      route,
    );
    assert.match(html, developmentPreviewMeta, route);
  }
});

test("publishes qualified evidence and the complete IEEE reference", async () => {
  const worker = await loadWorker();
  const home = await fetchRoute(worker, "/");
  const evidence = await fetchRoute(worker, "/evidence");
  const combined = `${home.html}\n${evidence.html}`;

  assert.match(combined, /10\.1109\/EESAT59125\.2024\.10471215/);
  assert.match(combined, /Mark R\. J\. Legacy, Emma Van Wyk, and Joshua Brinkerhoff/);
  assert.match(combined, /10 MW configuration with three hours of delivery and a maximum cycle efficiency of 70\.2%/);
  assert.match(combined, /two-stage static structure designed for 10\.6 MW and continuous operation as needed/);
  assert.match(combined, /not measured output from an operating facility/i);
  assert.match(combined, /Concept Model — Not to Scale/);
  assert.match(combined, /Source Confirmation Pending/i);
  assert.match(combined, /Public record for U\.S\. Patent No\. 8,823,195 B2/i);
});

test("publishes qualified impact and company positioning", async () => {
  const worker = await loadWorker();
  const impact = await fetchRoute(worker, "/impact");
  const company = await fetchRoute(worker, "/company");
  const combined = `${impact.html}\n${company.html}`;

  assert.match(combined, /No operating Humpback installation has demonstrated/i);
  assert.match(combined, /Near-Zero Operation Is the Design Objective/i);
  assert.match(combined, /opportunities and adverse effects must be evaluated together/i);
  assert.match(combined, /Use the SDGs as a Planning and Measurement Framework/i);
  assert.match(combined, /Net Positive Marine Infrastructure/i);
  assert.match(combined, /future design and measurement objective/i);
  assert.match(combined, /Established Design Mechanisms/i);
  assert.match(combined, /Research Hypotheses/i);
  assert.match(combined, /Advancing Toward Independent Engineering Validation and Pilot Deployment/i);
  assert.match(combined, /Engineering Infrastructure[\s\S]*That Powers Humanity/i);
  assert.match(combined, /Published leadership profiles use company-supplied titles, roles and career summaries/i);
  assert.doesNotMatch(combined, /U\.S\. patent holder/i);
  assert.doesNotMatch(combined, /★|☆/);
});

test("renders the approved local team portraits including Bryan Green", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/company");
  const teamFiles = await readdir(new URL("../public/team/", import.meta.url));

  for (const file of [
    "bryce-huston.jpg",
    "chris-calvin.jpg",
    "col-bryan-green.jpg",
    "gustavo-varela-latouche.jpg",
    "mark-legacy.jpg",
    "rich-burgess.jpg",
  ]) {
    assert.ok(teamFiles.includes(file), `missing public/team/${file}`);
  }

  for (const required of [
    /\/team\/mark-legacy\.jpg/,
    /\/team\/bryce-huston\.jpg/,
    /\/team\/rich-burgess\.jpg/,
    /\/team\/chris-calvin\.jpg/,
    /\/team\/gustavo-varela-latouche\.jpg/,
    /\/team\/col-bryan-green\.jpg/,
    /Portrait of Mark Legacy/,
    /Portrait of Bryce Huston/,
    /Portrait of Rich Burgess/,
    /Portrait of Chris Calvin/,
    /Portrait of Gustavo Varela Latouche/,
    /Portrait of Col\. Bryan Green \(Ret\.\)/,
    /CHIEF INFORMATION SECURITY OFFICER/,
    /Founder • Huston Solutions/,
    /SECURITY &amp; DIGITAL INFRASTRUCTURE/,
    /Information Security • AI Systems • Digital Infrastructure/,
    /FOUNDER &amp; SYSTEMS ARCHITECT/,
    /Bryce Huston is Chief Information Security Officer at Humpback Hydro and founder of Huston Solutions/,
    /A hands-on systems architect and technical operator, Bryce builds production platforms/,
    /architect the system, control the risk and build the infrastructure required to scale/,
    /\/company\/humpback-team-vancouver\.jpeg/,
    /PROJECT PHOTOGRAPH/,
    /U\.S\. Army Corps of Engineers retired colonel and former commander and military laboratory director/i,
    /3,000 researchers and scientists and budgets exceeding \$2 billion/i,
  ]) {
    assert.match(html, required);
  }

  const companySource = await readFile(
    new URL("../app/company/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(companySource, /Col\. Bryan Green\{" "\}[\s\S]*leadership-name-suffix[\s\S]*\(Ret\.\)/);
  assert.match(styles, /\.leadership-name-inline\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.leadership-name-suffix\s*\{[^}]*font-size:\s*\.52em/s);

  assert.doesNotMatch(html, /\/(?:mark-legacy|bryan-green)\.webp/);
});

test("publishes the approved homepage hierarchy and native V4 controls", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/");

  for (const required of [
    /Modular Pumped-Storage Hydroelectric Generation and Energy Storage Infrastructure/,
    /Generation • Storage • Automated Dispatch/,
    /A Canadian energy technology company developing modular hydroelectric generation and long-duration energy storage infrastructure\./,
    /data-v4-twin/,
    /Auto Cycle/,
    /Lower Generation/,
    /Charging/,
    /Upper Generation/,
    /Cycle Summary/,
    /Pause/,
    /Engineering &amp; Operational Roadmap/,
    /Standards Roadmap/,
    /Core Engineering Pillars/,
    /proposal and has not been formally approved/i,
    /not evidence that its activities are underway/i,
  ]) {
    assert.match(html, required);
  }

  assert.doesNotMatch(html, /Planned Deployment Roadmap/i);
  assert.doesNotMatch(html, /1-10 MW|10-100 MW|Semi-Automated/i);
});

test("uses the authoritative 29-second V4 timing and level progression", () => {
  assert.equal(DIGITAL_TWIN_CYCLE_SECONDS, 29);
  assert.equal(digitalTwinSceneAt(0).phase, "establish");
  assert.equal(digitalTwinSceneAt(2).phase, "lower");
  assert.deepEqual(
    { phase: digitalTwinSceneAt(8).phase, from: digitalTwinSceneAt(8).from, to: digitalTwinSceneAt(8).to },
    { phase: "handoff", from: "lower", to: "charge" },
  );
  assert.equal(digitalTwinSceneAt(9.5).phase, "charge");
  assert.equal(digitalTwinSceneAt(15.5).phase, "handoff");
  assert.equal(digitalTwinSceneAt(17).phase, "upper");
  assert.equal(digitalTwinSceneAt(23).phase, "handoff");
  assert.equal(digitalTwinSceneAt(24.5).phase, "summary");
  assert.equal(digitalTwinSceneAt(29).phase, "establish");
  assert.equal(manualDigitalTwinScene("lower").activity, 1);

  assert.deepEqual(reservoirLevelsAt(0), { upper: 0.18, lower: 0.85 });
  assert.deepEqual(reservoirLevelsAt(8), { upper: 0.18, lower: 0.79 });
  assert.deepEqual(reservoirLevelsAt(17), { upper: 0.125, lower: 0.85 });
  assert.deepEqual(reservoirLevelsAt(24.5), { upper: 0.18, lower: 0.85 });
});

test("pins the corrected base geometry and state-mapped SVG vectors", async () => {
  assert.deepEqual(
    {
      width: DIGITAL_TWIN_BASE_PLATE.width,
      height: DIGITAL_TWIN_BASE_PLATE.height,
      waterline: DIGITAL_TWIN_BASE_PLATE.ambientWaterlineY,
      midpoint:
        (DIGITAL_TWIN_BASE_PLATE.structureTopY +
          DIGITAL_TWIN_BASE_PLATE.structureBaseY) /
        2,
      pipeAngle: DIGITAL_TWIN_BASE_PLATE.externalPipeAngleDegrees,
      embedment: DIGITAL_TWIN_BASE_PLATE.embedmentDepthFeet,
    },
    {
      width: 1600,
      height: 900,
      waterline: 493,
      midpoint: 493,
      pipeAngle: 0,
      embedment: [30, 50],
    },
  );

  const component = await readFile(
    new URL("../app/components/PremiumDigitalTwin.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(component, /premium-twin-flow-vectors/);
  assert.match(component, /data-flow-vector-route/);
  assert.match(component, /is-\$\{route\.operation\}/);
  assert.match(component, /M 0 704 H 584 V 770 C 584 804 610 820 646 820 H 790/);
  assert.match(component, /M 800 800 V 188/);
  assert.match(component, /M 650 184 V 320 C 650 386 616 430 584 438 V 487 H 0/);
  assert.match(component, /humpback-digital-twin-v4-geometry\.jpg/);
  assert.doesNotMatch(component, /function drawFlow/);
  assert.match(component, /function drawMarineLife/);
  assert.match(component, /function drawFish/);
  assert.match(component, /function drawSeal/);
  assert.match(component, /if \(reducedMotion\) return;/);
  assert.match(styles, /\.premium-twin-flow-group\.is-lower\s*\{\s*color:\s*#48b9ff/);
  assert.match(styles, /\.premium-twin-flow-group\.is-charge\s*\{\s*color:\s*#50e38a/);
  assert.match(styles, /\.premium-twin-flow-group\.is-upper\s*\{\s*color:\s*#b78cff/);
  assert.match(styles, /\.premium-twin-card\.step-1\s*\{\s*left:\s*2\.2%;\s*top:\s*18%;\s*\}/);
  assert.match(styles, /\.premium-twin-card\.step-2\s*\{\s*left:\s*2\.2%;\s*top:\s*55%;\s*\}/);
  assert.match(styles, /\.premium-twin-card\.step-3\s*\{\s*right:\s*2\.2%;\s*top:\s*52%;\s*\}/);
  assert.match(styles, /\.premium-twin-card\.step-4\s*\{\s*right:\s*2\.2%;\s*top:\s*18%;\s*\}/);
  assert.match(styles, /\.premium-twin-controls\s*\{[^}]*grid-template-columns:\s*repeat\(6,minmax\(0,1fr\)\)/s);

  assert.equal(flagBreezeActivityAt(0), 0);
  assert.ok(flagBreezeActivityAt(1.2) > 0.99);
  assert.equal(flagBreezeActivityAt(8), 0);
  assert.ok(flagBreezeActivityAt(26.75) > 0.99);
  assert.equal(flagBreezeActivityAt(29), 0);
});

test("removes standalone seeking language and external V4 payloads", async () => {
  const worker = await loadWorker();
  const rendered = [];
  for (const route of publicRoutes) rendered.push((await fetchRoute(worker, route)).html);
  const combined = rendered.join("\n");
  const assetNames = await readdir(new URL("../dist/client/assets/", import.meta.url));
  const premiumAssetNames = assetNames.filter((asset) => /^PremiumDigitalTwin-.+\.js$/.test(asset));
  assert.ok(premiumAssetNames.length > 0, "native V4 must be emitted as a client asset");
  const premiumSource = (
    await Promise.all(
      premiumAssetNames.map((asset) =>
        readFile(new URL(`../dist/client/assets/${asset}`, import.meta.url), "utf8"),
      ),
    )
  ).join("\n");
  const v4Output = `${combined}\n${premiumSource}`;

  assert.match(premiumSource, /\/digital-twin\/humpback-digital-twin-v4-geometry\.jpg/);
  for (const required of [
    /Evidence You Can Examine/i,
    /advancing through independent engineering validation/i,
    /Pilot deployment is the next commercial milestone/i,
    /engaging strategic partners for validation and pilot deployment/i,
    /Modeled results are informing the engineering validation program/i,
  ]) {
    assert.match(combined, required);
  }
  for (const prohibited of [
    /Not yet independently validated/i,
    /No pilot has been completed/i,
    /Results are modeled, not measured/i,
    /Seeking capital and partners/i,
    /\bEarly-stage\b/i,
    /\bExperimental\b/i,
  ]) {
    assert.doesNotMatch(combined, prohibited);
  }
  assert.doesNotMatch(combined, /\bseeking\b|\bsought\b/i);
  assert.doesNotMatch(v4Output, /humpback-digital-twin-base-v3-sunny/i);
  assert.doesNotMatch(v4Output, /<iframe|srcdoc|data:image\/jpeg;base64/i);
  assert.doesNotMatch(v4Output, /floating-ui|lucide(?:\.min)?\.js|unpkg\.com|cdn\.jsdelivr\.net/i);
});

test("preserves the exact footer attribution and safe external target", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/");

  assert.match(html, /© 2026 HUMPBACK HYDRO \| SITE BY/);
  assert.match(
    html,
    /href="https:\/\/www\.brycehuston\.com\/solutions"[^>]*target="_blank"/i,
  );
});

test("labels economics as provisional and distinguishes calculated outputs", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/economics");

  assert.match(html, /provisional assumptions/i);
  assert.match(html, /calculated outputs/i);
  assert.match(html, /9\.6/);
  assert.match(html, /\$758\.4M/);
  assert.match(html, /not measured operating performance/i);
  assert.match(html, /investment offering/i);
});

test("calculates project-scale economics for every public preset", () => {
  for (const expected of presetExpectations) {
    const result = calculateProjectScenario(expected.capacity, 1);

    assert.equal(result.installedCapacityMw, expected.capacity);
    assert.equal(result.annualModeledEnergyThroughputMwh, expected.throughput);
    assert.equal(result.illustrativeCapitalRequirement, expected.capital);
    assert.equal(result.grossElectricityRevenue, expected.gross);
    assert.equal(result.royaltyDeduction, expected.royalty);
    assert.equal(
      result.operationsAndMaintenanceDeduction,
      expected.operationsAndMaintenance,
    );
    assert.equal(result.debtServiceDeduction, expected.debtService);
    assert.equal(result.totalDeductions, expected.deductions);
    assert.equal(result.annualRetainedCashFlow, expected.retained);
    assert.ok(
      Math.abs(result.simplePaybackYears - 9.57999757817661) < 1e-12,
    );
    assert.equal(result.postDebtRetainedCashFlow, expected.postDebt);
    assert.equal(result.annualCo2DisplacementTons, expected.co2);
    assert.equal(result.cumulativeRetainedCashFlow, expected.retained);
    assert.equal(result.cumulativeEnergyThroughputMwh, expected.throughput);
    assert.equal(result.cumulativeCo2DisplacementTons, expected.co2);
  }
});

test("uses a simple non-compounding operating horizon and clamps controls", () => {
  const result = calculateProjectScenario(100, 20);

  assert.equal(result.cumulativeRetainedCashFlow, 1_043_841_600);
  assert.equal(
    result.cumulativeRetainedCashFlow,
    result.annualRetainedCashFlow * 20,
  );
  assert.equal(
    result.cumulativeEnergyThroughputMwh,
    result.annualModeledEnergyThroughputMwh * 20,
  );
  assert.equal(
    result.cumulativeCo2DisplacementTons,
    result.annualCo2DisplacementTons * 20,
  );
  assert.equal(normalizeCapacityMw(-1), 10);
  assert.equal(normalizeCapacityMw(10_000), 1_000);
  assert.equal(normalizeCapacityMw(104), 100);
  assert.equal(normalizeCapacityMw(106), 110);
  assert.equal(normalizeOperatingHorizon(0), 1);
  assert.equal(normalizeOperatingHorizon(50), 20);
});

test("publishes an infrastructure model without retail-return framing", async () => {
  const worker = await loadWorker();
  const economics = await fetchRoute(worker, "/economics");
  const assetNames = await readdir(
    new URL("../dist/client/assets/", import.meta.url),
  );
  const calculatorAssets = assetNames.filter((asset) =>
    /^OpshCalculator-.+\.js$/.test(asset),
  );
  assert.ok(calculatorAssets.length > 0, "calculator must remain lazy loaded");

  const calculatorSource = (
    await Promise.all(
      calculatorAssets.map((asset) =>
        readFile(new URL(`../dist/client/assets/${asset}`, import.meta.url), "utf8"),
      ),
    )
  ).join("\n");
  const publicOutput = `${economics.html}\n${calculatorSource}`;

  for (const prohibited of [
    /\$10K/,
    /\$50K/,
    /\$250K/,
    /8% annual return/i,
    /12\.5% annual return/i,
    /Projected investment value/i,
    /Estimated investor gain/i,
    /Investment Amount/i,
  ]) {
    assert.doesNotMatch(publicOutput, prohibited);
  }

  for (const required of [
    /Project Economics &(?:amp;|) Impact Model/i,
    /Project Scale/i,
    /Operating Horizon/i,
    /10 MW/i,
    /MODEL DETAILS & ASSUMPTIONS/i,
    /Illustrative Capital Requirement/i,
    /Annual Modeled Energy Throughput/i,
    /Annual Retained Cash Flow/i,
    /Cumulative Retained Cash Flow/i,
    /Simple Payback/i,
    /Post-Debt Retained Cash Flow/i,
    /Approximate CO₂ Displacement/i,
    /desalination and industrial co-location value is excluded/i,
    /not offered commercial terms or verified forecasts/i,
  ]) {
    assert.match(publicOutput, required);
  }
});

test("excludes simulated telemetry, unsupported validation and prohibited system copy", async () => {
  const worker = await loadWorker();
  const rendered = [];
  for (const route of publicRoutes) {
    rendered.push((await fetchRoute(worker, route)).html);
  }
  const combined = rendered.join("\n");
  const prohibited = [
    /\bEngineering Validated\b/i,
    /\bLive Digital Twin\b/i,
    /\bLive Telemetry\b/i,
    /\bmobile platform\b/i,
    /\bonboard\b/i,
    /\banti-rolling\b/i,
    /\bU\.S\. patent holder\b/i,
    /\$50,?000\/MW/i,
    /\$250\/MWh/i,
  ];
  for (const pattern of prohibited) {
    assert.doesNotMatch(combined, pattern);
  }
});

test("does not publish mixed-source documents or preload the 3D scene", async () => {
  const worker = await loadWorker();
  const rendered = [];
  for (const route of publicRoutes) {
    rendered.push((await fetchRoute(worker, route)).html);
  }
  const combined = rendered.join("\n");

  assert.doesNotMatch(combined, /drive\.google\.com/i);
  assert.doesNotMatch(combined, /\.pdf(?:["?#]|$)/i);
  assert.doesNotMatch(combined, /humpback-hydro\.glb/i);
  assert.doesNotMatch(combined, /OpshScene-[^"'<>]+\.js/i);

  const assets = await readdir(new URL("../dist/client/assets/", import.meta.url));
  assert.ok(
    assets.some((asset) => /^OpshScene-.+\.js$/.test(asset)),
    "3D scene must be emitted as a separate lazy chunk",
  );
});
