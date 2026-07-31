import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import {
  calculateProjectScenario,
  normalizeCapacityMw,
  normalizeOperatingHorizon,
} from "../app/economics-model.ts";

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
  assert.match(combined, /Near-Zero Operation Is an Objective, Not a Lifecycle Claim/i);
  assert.match(combined, /opportunities and adverse effects must be evaluated together/i);
  assert.match(combined, /Alignment Is Not the Same as Measured Impact/i);
  assert.match(combined, /Advancing Toward Independent Engineering Validation and Pilot Deployment/i);
  assert.match(combined, /Engineering Infrastructure[\s\S]*That Powers Humanity/i);
  assert.match(combined, /Leadership titles, roles and career summaries are company supplied/i);
  assert.doesNotMatch(combined, /U\.S\. patent holder/i);
  assert.doesNotMatch(combined, /★|☆/);
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
    /Installed Capacity/i,
    /Operating Horizon/i,
    /10 MW/i,
    /100 MW/i,
    /500 MW/i,
    /1,000 MW/i,
    /Provisional Scenario Inputs/i,
    /Illustrative Capital Requirement/i,
    /Annual Modeled Energy Throughput/i,
    /Annual Retained Cash Flow/i,
    /Cumulative Retained Cash Flow With the Debt-Service Input Applied/i,
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
