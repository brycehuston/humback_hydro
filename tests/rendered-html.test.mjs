import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import {
  calculateProjectScenario,
  normalizeCapacityMw,
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
    assert.ok(html.includes(`rel="canonical" href="https://humpbackenergy.com${route}"`), route);
    assert.match(html, /property="og:title"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
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
  assert.match(combined, /Company Record in Verification/i);
  assert.match(combined, /Peer-Reviewed IEEE Conference Paper/i);
  assert.match(combined, /University Engineering Study/i);
  assert.match(combined, /Independent Third-Party Qualification/i);
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

test("renders leadership portraits and generic delivery capabilities", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/company");
  const teamFiles = await readdir(new URL("../public/team/", import.meta.url));

  for (const file of [
    "bryce-huston.jpg",
    "col-bryan-green.jpg",
    "mark-legacy.jpg",
  ]) {
    assert.ok(teamFiles.includes(file), `missing public/team/${file}`);
  }

  for (const required of [
    /\/team\/mark-legacy\.webp/,
    /\/team\/bryce-huston\.webp/,
    /\/team\/col-bryan-green\.webp/,
    /Portrait of Mark Legacy/,
    /Portrait of Bryce Huston/,
    /Portrait of Col\. Bryan Green \(Ret\.\)/,
    /CHIEF INFORMATION SECURITY OFFICER/,
    /Founder • HUSTON SOLUTION INC\./,
    /SECURITY &amp; DIGITAL INFRASTRUCTURE/,
    /Information Security • AI Systems • Digital Infrastructure/,
    /FOUNDER &amp; SYSTEMS ARCHITECT/,
    /Bryce Huston is Chief Information Security Officer at Humpback Hydro and founder of HUSTON SOLUTION INC\./,
    /A hands-on systems architect and technical operator, Bryce builds production platforms/,
    /architect the system, control the risk and build the infrastructure required to scale/,
    /\/company\/humpback-team-vancouver\.webp/,
    /PROJECT PHOTOGRAPH/,
    /U\.S\. Army Corps of Engineers retired colonel and former commander and military laboratory director/i,
    /3,000 researchers and scientists and budgets exceeding \$2 billion/i,
    /Construction \/ EPC/,
    /Advanced Materials/,
    /Electrical Engineering/,
    /Manufacturing/,
    /Project Delivery/,
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
  assert.match(styles, /\.leadership-name-inline\s*\{[^}]*flex-wrap:\s*nowrap/s);
  assert.match(styles, /\.leadership-name-suffix\s*\{[^}]*font-size:\s*\.52em/s);

  assert.doesNotMatch(html, /src="\/(?:mark-legacy|bryan-green)\.webp/);
  for (const partner of [
    /\/team\/rich-burgess\.webp/,
    /\/team\/chris-calvin\.webp/,
    /\/team\/gustavo-varela-latouche\.webp/,
    /Rich Burgess/,
    /Chris Calvin/,
    /Gustavo Varela Latouche/,
    /Technical Partner \/ Contractor/,
    /Technical Partner/,
    /Electrical Engineering Partner/,
    /President, Cor-Tuf UHPC/,
    /President, Lightweight Concrete Solutions/,
    /Director General, COMTEL Ingeniería/,
    /03<\/span>PROJECT DELIVERY NETWORK/,
  ]) {
    assert.match(html, partner);
  }
});

test("publishes the approved homepage hierarchy and native V4 controls", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/");

  for (const required of [
    /Hydropower\.[\s\S]*?Reimagined\./,
    /Generation • Storage • Dispatch Architecture/,
    /A Canadian energy technology company developing modular hydroelectric generation and long-duration energy storage infrastructure\./,
    /data-v4-twin/,
    /Auto Cycle/,
    /Lower Generation/,
    /Charging/,
    /Upper Generation/,
    /Sequence Summary/,
    /Energy In → Store → Generate → Dispatch/,
    /External Energy In/i,
    /External electricity powers pumping/i,
    /System losses require make-up energy/i,
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

test("renders the linked company credit without the obsolete website link on every public route", async () => {
  const worker = await loadWorker();
  for (const route of publicRoutes) {
    const { html } = await fetchRoute(worker, route);
    assert.match(html, /<span class="text-balance">HUMPBACK HYDRO © 2026 \| SITE BY <a class="huston-shimmer" href="https:\/\/www\.brycehuston\.com\/solutions" target="_blank" rel="noreferrer">HUSTON SOLUTION INC\.<\/a><\/span>/, route);
    assert.doesNotMatch(html, /Huston Solutions|Current Website/i, route);
  }
});

test("renders the reduced user-driven economics boundary", async () => {
  const worker = await loadWorker();
  const { html } = await fetchRoute(worker, "/economics");

  assert.match(html, /Annual Energy Sensitivity/i);
  assert.match(html, /User-Supplied Annual Utilization Assumption/i);
  assert.match(html, /User-Supplied Sale-Price Assumption/i);
  assert.match(html, /Gross Electricity-Sale Sensitivity/i);
  assert.match(html, /Before Charging Energy and All Project Costs/i);
  assert.match(html, /No operating Humpback installation has demonstrated a quantified avoided-emissions benefit/i);
});

test("calculates only explicit annual-energy and gross-sale sensitivities", () => {
  const blank = calculateProjectScenario(10, null, null);
  assert.equal(blank.annualEnergySensitivityMwh, null);
  assert.equal(blank.grossElectricitySaleSensitivity, null);

  const energyOnly = calculateProjectScenario(10, 25, null);
  assert.equal(energyOnly.annualEnergySensitivityMwh, 21_900);
  assert.equal(energyOnly.grossElectricitySaleSensitivity, null);

  const complete = calculateProjectScenario(10, 25, 120);
  assert.equal(complete.annualEnergySensitivityMwh, 21_900);
  assert.equal(complete.grossElectricitySaleSensitivity, 2_628_000);
  assert.equal(complete.illustrativeCapitalRequirement, 50_000_000);
});

test("fails closed for invalid required inputs and clamps only scenario capacity", () => {
  for (const [utilization, salePrice] of [
    [Number.NaN, 120],
    [-1, 120],
    [101, 120],
    [25, Number.NaN],
    [25, -1],
  ]) {
    const result = calculateProjectScenario(10, utilization, salePrice);
    if (!Number.isFinite(utilization) || utilization < 0 || utilization > 100) {
      assert.equal(result.annualEnergySensitivityMwh, null);
    }
    assert.equal(result.grossElectricitySaleSensitivity, null);
  }
  assert.equal(normalizeCapacityMw(-1), 10);
  assert.equal(normalizeCapacityMw(10_000), 1_000);
  assert.equal(normalizeCapacityMw(104), 100);
  assert.equal(normalizeCapacityMw(106), 110);
});

test("publishes an infrastructure model without retail-return framing", async () => {
  const worker = await loadWorker();
  const economics = await fetchRoute(worker, "/economics");
  const assetNames = await readdir(
    new URL("../dist/client/assets/", import.meta.url),
  );
  const economicsInteractiveAssets = assetNames.filter((asset) =>
    /^(OpshCalculator|EconomicsScenarioSelector)-.+\.js$/.test(asset),
  );
  assert.ok(
    economicsInteractiveAssets.some((asset) => /^OpshCalculator-.+\.js$/.test(asset)),
    "calculator client asset must be present",
  );

  const economicsInteractiveSource = (
    await Promise.all(
      economicsInteractiveAssets.map((asset) =>
        readFile(new URL(`../dist/client/assets/${asset}`, import.meta.url), "utf8"),
      ),
    )
  ).join("\n");
  const publicOutput = `${economics.html}\n${economicsInteractiveSource}`;

  for (const prohibited of [
    /\$10K/,
    /\$50K/,
    /\$250K/,
    /8% annual return/i,
    /12\.5% annual return/i,
    /Projected investment value/i,
    /Estimated investor gain/i,
    /Investment Amount/i,
    /Modeled Annual Generation/i,
    /Simple Payback/i,
    /retained cash/i,
    /retained by client/i,
    /pre-debt|post-debt/i,
    /debt-service result/i,
    /0\.35 tCO₂\/MWh/i,
    /Illustrative Avoided-Emissions Potential/i,
  ]) {
    assert.doesNotMatch(publicOutput, prohibited);
  }

  for (const required of [
    /Generation Sensitivity Tool/i,
    /Scenario Generating Capacity/i,
    /User-Supplied Annual Utilization Assumption/i,
    /User-Supplied Sale-Price Assumption/i,
    /10(?:<!-- -->)? MW/i,
    /MODEL DETAILS &(?:amp;|) ASSUMPTIONS/i,
    /Illustrative Capital-Cost Arithmetic/i,
    /Annual Energy Sensitivity/i,
    /Gross Electricity-Sale Sensitivity/i,
    /Before Charging Energy and All Project Costs/i,
    /Not a market benchmark, forecast or offtake price/i,
    /not an EPC estimate/i,
  ]) {
    assert.match(publicOutput, required);
  }

  for (const required of [
    /Energy In → Store → Generate → Dispatch/i,
    /lower-stage ambient-flow generation is a separate architecture path/i,
    /No numeric storage or arbitrage output is published/i,
    /complete project cost and revenue boundary/i,
  ]) {
    assert.match(publicOutput, required);
  }

  assert.doesNotMatch(publicOutput, /85\s*[–-]\s*93%/i);
});

test("places a collapsed economics teaser directly after the homepage operating model", async () => {
  const worker = await loadWorker();
  const homepage = await fetchRoute(worker, "/");
  const economics = await fetchRoute(worker, "/economics");

  assert.match(homepage.html, /id="platform"[\s\S]*?<\/section>[\s\S]*?<section[^>]*class="home-economics-section"[^>]*id="economics"/i);
  assert.match(homepage.html, /aria-controls="homepage-economics-calculator" aria-expanded="false"[^>]*>Open Calculator/i);
  assert.match(homepage.html, /class="home-economics-calculator" hidden="" id="homepage-economics-calculator"/i);
  assert.match(homepage.html, /href="\/economics">Explore Full Economics/i);
  assert.match(homepage.html, /<a[^>]*href="\/#economics"[^>]*>(?:<span[^>]*>)?Calculator(?:<\/span>)?<\/a>/i);
  assert.match(homepage.html, /Concept Imagery Does Not Depict Completed Projects · Vancouver, Canada/i);
  assert.doesNotMatch(homepage.html, /<div><small>CONNECT<\/small>[\s\S]*?<span>Vancouver, Canada<\/span>/i);
  assert.match(economics.html, /data-economics-calculator="true"[\s\S]*?data-opsh-calculator="embedded"/i);
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
