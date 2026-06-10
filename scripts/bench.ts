import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import electron from "electron";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const file = resolve(cliArgs[0] ?? ".scratch/markdown-viewer-prototypes/PRD.md");
const iterations = Number(process.env.MARK_ROVER_ITERATIONS ?? "3");

if (!existsSync(file)) {
  console.error(`Markdown file not found: ${file}`);
  process.exit(1);
}

const results = [];

for (let iteration = 1; iteration <= iterations; iteration += 1) {
  const startedAt = performance.now();
  const child = spawn(electron, [".", "--", file], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MARK_ROVER_BENCH: "1"
    },
    stdio: ["ignore", "pipe", "inherit"]
  });

  const metrics = [];
  child.stdout.on("data", (chunk) => {
    for (const line of String(chunk).split("\n")) {
      if (!line.trim()) continue;
      try {
        metrics.push(JSON.parse(line));
      } catch {
        process.stdout.write(line);
      }
    }
  });

  const timeout = setTimeout(() => child.kill("SIGTERM"), 5000);
  const [code, signal] = await once(child, "exit");
  clearTimeout(timeout);

  results.push({
    iteration,
    code,
    signal,
    elapsedMs: performance.now() - startedAt,
    metrics
  });
}

const summary = {
  app: "mark-rover",
  file,
  iterations,
  results
};

console.log(JSON.stringify(summary, null, 2));
