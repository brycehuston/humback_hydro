import assert from "node:assert/strict";
import test from "node:test";
import { readdir } from "node:fs/promises";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

const publicRoutes = [
  "/",
  "/technology",
  "/applications",
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
    /\bship\b/i,
    /\bvessel\b/i,
    /\bmobile platform\b/i,
    /\bonboard\b/i,
    /\banti-rolling\b/i,
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
  assert.doesNotMatch(combined, /OpshScene-[^"'<>]+\.js/i);

  const assets = await readdir(new URL("../dist/client/assets/", import.meta.url));
  assert.ok(
    assets.some((asset) => /^OpshScene-.+\.js$/.test(asset)),
    "3D scene must be emitted as a separate lazy chunk",
  );
});
