import { spawn } from "node:child_process";
import { cp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const nextCli = resolve(root, "node_modules/next/dist/bin/next");
const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");
const copyMaplibreWorker = resolve(root, "scripts/copy-maplibre-worker.mjs");
const nextEnvironmentFile = resolve(root, "next-env.d.ts");
const e2eBuild = resolve(root, ".next-e2e");
const environment = { ...process.env, NEXT_DIST_DIR: ".next-e2e" };

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd: root, env: environment, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolveRun() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

const originalNextEnvironment = await readFile(nextEnvironmentFile, "utf8");

try {
  await run(process.execPath, [copyMaplibreWorker]);
  await run(process.execPath, [nextCli, "build"]);
  await cp(resolve(e2eBuild, "static"), resolve(e2eBuild, "standalone/.next-e2e/static"), { recursive: true });
  await cp(resolve(root, "public"), resolve(e2eBuild, "standalone/public"), { recursive: true });
  await run(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)]);
} finally {
  await writeFile(nextEnvironmentFile, originalNextEnvironment);
}
