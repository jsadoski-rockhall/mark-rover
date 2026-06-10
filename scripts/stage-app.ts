import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Builds the minimal app dir the packager consumes: the bundled dist/ output
// plus a dependency-free package.json. Staging sidesteps the pnpm symlink
// layout that broke packager pruning in prototype 15.
export async function stageApp(): Promise<string> {
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

  return stagingDir;
}
