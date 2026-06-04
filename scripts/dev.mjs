import { spawn } from "node:child_process";
import { once } from "node:events";
import electron from "electron";

const args = process.argv.slice(2);
const vite = spawn("pnpm", ["exec", "vite", "--host", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "inherit"],
  env: process.env
});

let resolveDevUrl;
const devUrlReady = new Promise((resolve) => {
  resolveDevUrl = resolve;
});

vite.stdout.on("data", (chunk) => {
  const text = String(chunk);
  process.stdout.write(text);
  const match = text.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
  if (match) {
    resolveDevUrl(`http://127.0.0.1:${match[1]}`);
  }
});

const devUrl = await Promise.race([
  devUrlReady,
  once(vite, "exit").then(([code]) => process.exit(code ?? 1))
]);

const electronProcess = spawn(electron, [".", "--", ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    MARK_ROVER_RENDERER_URL: devUrl
  }
});

const [code] = await once(electronProcess, "exit");
vite.kill();
process.exit(code ?? 0);
