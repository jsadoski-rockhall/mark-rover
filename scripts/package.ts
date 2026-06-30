import { parseArgs } from "node:util";
import { type Arch, packageApp, type Platform } from "./package-app.ts";

// Package-only CLI used by the release workflow:
//   node scripts/package.ts --platform linux --arch arm64
// Archiving is left to the caller (the workflow archives with the right tool
// for each runner OS), so this stays free of host-tool assumptions like zip.
const { values } = parseArgs({
  options: {
    platform: { type: "string" },
    arch: { type: "string" }
  }
});

const platform = values.platform as Platform | undefined;
const arch = values.arch as Arch | undefined;

if (!platform || !arch) {
  console.error("Usage: node scripts/package.ts --platform <darwin|win32|linux> --arch <arch>");
  process.exit(1);
}

const outDir = await packageApp(platform, arch);
console.log(outDir);
