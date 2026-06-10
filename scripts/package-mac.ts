import { packager } from "@electron/packager";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const stagingDir = resolve(process.cwd(), ".packager/app");

await rm(stagingDir, { force: true, recursive: true });
await mkdir(stagingDir, { recursive: true });
await cp("dist", resolve(stagingDir, "dist"), { recursive: true });

await writeFile(
  resolve(stagingDir, "package.json"),
  `${JSON.stringify(
    {
      name: "mark-rover",
      version: "0.0.1",
      private: true,
      type: "module",
      main: "dist/main/main.mjs"
    },
    null,
    2
  )}\n`
);

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
