import { packager } from "@electron/packager";
import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { promisify } from "node:util";
import { stageApp } from "./stage-app.ts";

const stagingDir = await stageApp();

await packager({
  dir: stagingDir,
  name: "MarkRover",
  platform: "win32",
  arch: "x64",
  out: "out",
  overwrite: true,
  // Shown in Task Manager, file properties, and the SmartScreen dialog.
  win32metadata: {
    CompanyName: "Mark Rover",
    FileDescription: "Mark Rover markdown reader",
    ProductName: "MarkRover"
  },
  // The render worker runs on worker_threads, which cannot load a module from
  // inside the asar archive; main.ts resolves it via app.asar.unpacked.
  asar: { unpack: "**/render-worker.cjs" },
  prune: true
});

// No signing step: Authenticode signing needs a certificate and (practically)
// a Windows runner. Test copies ship unsigned; recipients allowlist them.

const zipPath = "out/MarkRover-win32-x64.zip";
await rm(zipPath, { force: true });
// zip(1) rather than ditto: ditto can sequester macOS metadata into __MACOSX
// entries that confuse Windows extractors.
await promisify(execFile)("zip", ["-qr", "MarkRover-win32-x64.zip", "MarkRover-win32-x64"], {
  cwd: "out"
});
console.log(`Packaged and zipped: ${zipPath}`);
