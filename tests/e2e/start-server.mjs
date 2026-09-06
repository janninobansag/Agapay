import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const nextCli = resolve(root, "node_modules/next/dist/bin/next");
const port = process.argv[2] ?? "3100";
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [nextCli, "start", "--port", port, "--hostname", "127.0.0.1"], {
  cwd: root,
  env: {
    ...process.env,
    AUTH_TRUST_HOST: "true",
    AUTH_URL: baseUrl,
    NEXT_PUBLIC_APP_URL: baseUrl,
    NEXT_DIST_DIR: ".next-e2e",
    PORT: port,
    HOSTNAME: "127.0.0.1",
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
