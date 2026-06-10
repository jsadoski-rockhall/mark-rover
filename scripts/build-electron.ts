import { build } from "esbuild";
import { mkdir } from "node:fs/promises";

await mkdir("dist/main", { recursive: true });
await mkdir("dist/preload", { recursive: true });

await build({
  entryPoints: ["src/main/main.mjs"],
  outfile: "dist/main/main.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: ["electron"],
  sourcemap: false
});

await build({
  entryPoints: ["src/main/render-worker.mjs"],
  outfile: "dist/main/render-worker.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  sourcemap: false
});

await build({
  entryPoints: ["src/preload/preload.cjs"],
  outfile: "dist/preload/preload.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  external: ["electron"],
  sourcemap: false
});
