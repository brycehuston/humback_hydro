import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const validateOnly = process.argv.includes("--validate-only");

function parseDuration(value, name) {
  const match = /^(\d+)(ms|s|m|h)?$/i.exec(value);
  if (!match) {
    throw new Error(`${name} must be a positive duration such as 500ms, 10s, or 3m.`);
  }

  const amount = Number(match[1]);
  const units = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 };
  return amount * units[(match[2] ?? "ms").toLowerCase()];
}

async function requireFile(path, message) {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(message);
  }
}

async function runBuild() {
  const vinext = resolve(projectRoot, "node_modules", "vinext", "dist", "cli.js");
  await requireFile(
    vinext,
    "Vinext is unavailable. Run npm run install:ci and wait for it to finish before building.",
  );

  const timeoutMs = parseDuration(
    process.env.SITES_BUILD_TIMEOUT ?? "3m",
    "SITES_BUILD_TIMEOUT",
  );
  const killAfterMs = parseDuration(
    process.env.SITES_BUILD_KILL_AFTER ?? "10s",
    "SITES_BUILD_KILL_AFTER",
  );

  console.log("Running bounded vinext build...");
  await new Promise((resolveBuild, rejectBuild) => {
    const child = spawn(process.execPath, [vinext, "build"], {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    let timedOut = false;
    let forceKillTimer;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      forceKillTimer = setTimeout(() => child.kill("SIGKILL"), killAfterMs);
    }, timeoutMs);

    child.once("error", (error) => {
      clearTimeout(timeout);
      clearTimeout(forceKillTimer);
      rejectBuild(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timeout);
      clearTimeout(forceKillTimer);
      if (timedOut) {
        rejectBuild(new Error(`Vinext build exceeded ${timeoutMs}ms and was terminated.`));
      } else if (code === 0) {
        resolveBuild();
      } else {
        rejectBuild(
          new Error(`Vinext build failed with ${signal ? `signal ${signal}` : `exit code ${code}`}.`),
        );
      }
    });
  });
}

async function validateArtifact() {
  const workerPath = resolve(projectRoot, "dist", "server", "index.js");
  const hostingPath = resolve(projectRoot, "dist", ".openai", "hosting.json");

  await requireFile(workerPath, "Missing Worker entry: dist/server/index.js");
  await requireFile(hostingPath, "Missing packaged hosting manifest: dist/.openai/hosting.json");
  JSON.parse(await readFile(hostingPath, "utf8"));

  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("artifact-validation", `${process.pid}-${Date.now()}`);
  const worker = await import(workerUrl.href);
  if (!worker.default || typeof worker.default.fetch !== "function") {
    throw new Error(
      "dist/server/index.js must have an ESM default export with fetch(request, env, ctx).",
    );
  }

  console.log("Validated artifact: Worker default.fetch and hosting manifest are present.");
}

try {
  if (!validateOnly) {
    await runBuild();
  }
  await validateArtifact();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
