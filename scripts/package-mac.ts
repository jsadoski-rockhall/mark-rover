import { packager } from "@electron/packager";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stageApp } from "./stage-app.ts";

const stagingDir = await stageApp();

await packager({
  dir: stagingDir,
  name: "MarkRover",
  platform: "darwin",
  arch: "arm64",
  out: "out",
  overwrite: true,
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
  },
  // The render worker runs on worker_threads, which cannot load a module from
  // inside the asar archive; main.ts resolves it via app.asar.unpacked.
  asar: { unpack: "**/render-worker.cjs" },
  prune: true
});

// LaunchServices refuses to persist a default-handler claim ("Always open
// with") for an unsigned app, so .md association silently falls back to the
// previous default. An ad-hoc signature is enough for local use; replace with
// Developer ID signing for distribution.
await promisify(execFile)("codesign", [
  "--force",
  "--deep",
  "-s",
  "-",
  "out/MarkRover-darwin-arm64/MarkRover.app"
]);
