import { spawn } from "node:child_process";
import { once } from "node:events";
import electron from "electron";

const args = process.argv.slice(2);
const vite = spawn("pnpm", ["exec", "vite", "--host", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "inherit"],
  env: process.env
});

let devUrl = "";

vite.stdout.on("data", (chunk) => {
  const text = String(chunk);
  process.stdout.write(text);
  const match = text.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
  if (match) {
    devUrl = `http://127.0.0.1:${match[1]}`;
  }
});

while (!devUrl) {
  if (vite.exitCode !== null) {
    process.exit(vite.exitCode ?? 1);
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
}

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
