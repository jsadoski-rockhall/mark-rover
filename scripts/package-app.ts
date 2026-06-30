import { packager } from "@electron/packager";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stageApp } from "./stage-app.ts";

export type Platform = "darwin" | "win32" | "linux";
export type Arch = "x64" | "arm64";

const execFileP = promisify(execFile);

// Per-platform packager options. The shared bits (name, asar unpack, prune)
// live in packageApp; only the OS-specific metadata diverges here.
const PER_PLATFORM: Record<Platform, Record<string, unknown>> = {
  darwin: {
    // A stable bundle id keeps LaunchServices from treating every rebuild as a
    // new app when it resolves the .md association.
    appBundleId: "org.markrover.prototype",
    extendInfo: {
      CFBundleDocumentTypes: [
        {
          CFBundleTypeName: "Markdown Document",
          CFBundleTypeRole: "Viewer",
          LSHandlerRank: "Default",
          LSItemContentTypes: ["net.daringfireball.markdown"],
          CFBundleTypeExtensions: ["md", "markdown", "mdown"]
        }
      ]
    }
  },
  win32: {
    // Shown in Task Manager, file properties, and the SmartScreen dialog.
    win32metadata: {
      CompanyName: "Mark Rover",
      FileDescription: "Mark Rover markdown reader",
      ProductName: "MarkRover"
    }
  },
  linux: {}
};

// Packages MarkRover for one platform/arch and returns the output directory
// (out/MarkRover-<platform>-<arch>). Does not archive — callers decide how to
// wrap it (zip/tar locally, or the release workflow's per-OS archive step).
export async function packageApp(platform: Platform, arch: Arch): Promise<string> {
  const stagingDir = await stageApp();

  await packager({
    dir: stagingDir,
    name: "MarkRover",
    platform,
    arch,
    out: "out",
    overwrite: true,
    // The render worker runs on worker_threads, which cannot load a module from
    // inside the asar archive; main.ts resolves it via app.asar.unpacked.
    asar: { unpack: "**/render-worker.cjs" },
    prune: true,
    ...PER_PLATFORM[platform]
  });

  const outDir = `out/MarkRover-${platform}-${arch}`;

  if (platform === "darwin") {
    // LaunchServices refuses to persist a default-handler claim ("Always open
    // with") for an unsigned app, so .md association silently falls back to the
    // previous default. An ad-hoc signature is enough for local use; replace
    // with Developer ID signing for notarized distribution.
    await execFileP("codesign", ["--force", "--deep", "-s", "-", `${outDir}/MarkRover.app`]);
  }

  return outDir;
}
