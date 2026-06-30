import { packageApp } from "./package-app.ts";

const outDir = await packageApp("darwin", "arm64");
console.log(`Packaged: ${outDir}/MarkRover.app`);
