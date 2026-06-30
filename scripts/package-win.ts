import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { promisify } from "node:util";
import { packageApp } from "./package-app.ts";

// No signing step: Authenticode signing needs a certificate and (practically)
// a Windows runner. Test copies ship unsigned; recipients allowlist them.
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
