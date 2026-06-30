import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { promisify } from "node:util";
import { packageApp } from "./package-app.ts";

// No signing step here by design: local cross-builds from macOS ship unsigned
// and recipients allowlist them. Authenticode signing needs a Windows runner
// and Trusted Signing credentials, so it lives in the release workflow's
// Windows job (see .github/workflows/release.yml, issue #26).
const outDir = await packageApp("win32", "x64");

const zipPath = "out/MarkRover-win32-x64.zip";
await rm(zipPath, { force: true });
// zip(1) rather than ditto: ditto can sequester macOS metadata into __MACOSX
// entries that confuse Windows extractors. (Local convenience for cross-built
// test copies from macOS; CI archives with PowerShell on the Windows runner.)
await promisify(execFile)("zip", ["-qr", "MarkRover-win32-x64.zip", "MarkRover-win32-x64"], {
  cwd: "out"
});
console.log(`Packaged and zipped: ${zipPath} (from ${outDir})`);
