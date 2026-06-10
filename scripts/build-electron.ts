import { build } from "esbuild";
import { mkdir } from "node:fs/promises";

await mkdir("dist/main", { recursive: true });
await mkdir("dist/preload", { recursive: true });

await build({
  entryPoints: ["src/main/main.ts"],
  outfile: "dist/main/main.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: ["electron"],
  sourcemap: false
});

await build({
  entryPoints: ["src/main/render-worker.ts"],
  outfile: "dist/main/render-worker.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  sourcemap: false
});

await build({
  entryPoints: ["src/preload/preload.ts"],
  outfile: "dist/preload/preload.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  external: ["electron"],
  sourcemap: false
});
