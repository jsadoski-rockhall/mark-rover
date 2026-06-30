import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { promisify } from "node:util";
import { type Arch, packageApp } from "./package-app.ts";

const execFileP = promisify(execFile);

// Linux ships both arm64 and x64. @electron/packager downloads the prebuilt
// Electron for each target arch, so a single host (any OS) can cross-package
// both — nothing from the target binary is executed here.
for (const arch of ["arm64", "x64"] satisfies Arch[]) {
  const dir = `MarkRover-linux-${arch}`;
  await packageApp("linux", arch);

  const tarPath = `out/${dir}.tar.gz`;
  await rm(tarPath, { force: true });
  // tar.gz is the conventional Linux distribution format; recipients extract
  // and run the MarkRover binary inside.
  await execFileP("tar", ["-czf", `${dir}.tar.gz`, dir], { cwd: "out" });
  console.log(`Packaged and archived: ${tarPath}`);
}
