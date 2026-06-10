// Repair an incomplete Electron install.
//
// Electron's own postinstall unpacks its prebuilt binary with `extract-zip`,
// whose promise never settles under Node 24 ("Detected unsettled top-level
// await"). The process then exits early, leaving node_modules/electron/dist
// with only a stray file or two — no binary, no path.txt — so the app dies
// with "Electron failed to install correctly".
//
// This guard runs as the project postinstall. On a healthy install it is a
// fast no-op; otherwise it re-extracts the (cached or freshly downloaded) zip
// with the system `unzip` and writes path.txt the way electron/install.js
// would have.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

function resolveBinary(): string | null {
  try {
    const binary = require("electron"); // reads dist/ + path.txt, throws if absent
    return typeof binary === "string" && existsSync(binary) ? binary : null;
  } catch {
    return null;
  }
}

if (resolveBinary()) {
  process.exit(0);
}

const electronPkg = require.resolve("electron/package.json");
const electronDir = dirname(electronPkg);
const { version } = require(electronPkg) as { version: string };
const distDir = join(electronDir, "dist");

const platformPaths: Record<string, string> = {
  darwin: "Electron.app/Contents/MacOS/Electron",
  mas: "Electron.app/Contents/MacOS/Electron",
  win32: "electron.exe"
};
const platformPath = platformPaths[process.platform] ?? "electron";

try {
  execFileSync("unzip", ["-v"], { stdio: "ignore" });
} catch {
  console.error(
    "[ensure-electron] Electron binary missing and `unzip` is unavailable. " +
      "Delete node_modules/electron and reinstall."
  );
  process.exit(1);
}

console.warn(`[ensure-electron] Repairing incomplete Electron ${version} install...`);

// downloadArtifact returns the cached zip path, downloading it if necessary.
const electronRequire = createRequire(electronPkg);
const { downloadArtifact } = electronRequire("@electron/get");
const zipPath = await downloadArtifact({
  version,
  artifactName: "electron",
  platform: process.platform,
  arch: process.arch
});

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
execFileSync("unzip", ["-q", zipPath, "-d", distDir], { stdio: "inherit" });

// Mirror electron/install.js: hoist the bundled type defs and write path.txt.
const bundledTypeDefs = join(distDir, "electron.d.ts");
if (existsSync(bundledTypeDefs)) {
  renameSync(bundledTypeDefs, join(electronDir, "electron.d.ts"));
}
writeFileSync(join(electronDir, "path.txt"), platformPath);

const binary = resolveBinary();
if (!binary) {
  console.error("[ensure-electron] Repair failed: binary still missing after extraction.");
  process.exit(1);
}
console.log(`[ensure-electron] Electron ready at ${binary}`);
