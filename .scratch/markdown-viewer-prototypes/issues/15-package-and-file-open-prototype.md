# Package and File Open Prototype

Status: needs-triage

## Goal

Move from dev launch toward the real double-click `.md` opening path without blocking earlier prototype learning.

## Tasks

- Package the Electron app for macOS first.
- Verify command-line file open still works in packaged form.
- Explore file association for `.md` files.
- Decide whether double-click association testing is automated or manual HITL.
- Compare packaged cold-start metrics against dev launch metrics.

## Acceptance Criteria

- A packaged app can open a local markdown file.
- Packaged startup metrics are captured.
- The project has a clear next step for cross-platform file associations.

## Comments

- 2026-06-01: Created `.prototype/15` by copying forward successful prototype 14. Installed `@electron/packager` and added `pnpm package:mac`, which builds the renderer and packages a macOS arm64 app bundle into `out/`. File association/double-click registration remains a HITL/future step. Pending install/check/test/package/packaged launch verification.
- 2026-06-01: First package attempt failed with `fetch failed`; reran with network escalation. Second package attempt failed resolving `@sveltejs/vite-plugin-svelte-inspector` during Electron Packager pruning, likely due pnpm symlink layout. Changed `package:mac` to pass `--prune=false` as a prototype workaround; this may create a larger bundle but tests whether packaging can proceed.
- 2026-06-01: Packaging with `--prune=false` succeeded, but packaged binary verification stalled after `parse_start`; likely the Node worker could not start from `app.asar`. Changed `package:mac` to include `--asar=false` for the prototype so worker files remain unpacked.
- 2026-06-01: Repackaging with `--asar=false` succeeded and produced `out/MarkRoverPrototype-darwin-arm64`, but packaged binary verification still stalled after `parse_start`; no `parse_done` or `first_viewport_ready` arrived. Stopped the process manually. Prototype 15 is a failed/partial exploration. Next likely path: bundle main and worker code for production packaging, or switch to an Electron packaging tool/config that handles pnpm and worker assets explicitly. File association remains untested.
- 2026-06-09: Branch `issue-15-package-and-file-open`. Root-caused the packaging failures: `extract-zip@2.0.1` hangs under Node 24 (stalls ~14.7 MB into the Electron zip; reproduced in isolation), which killed both the packager API and CLI. Patched `@electron/packager` via `pnpm patch` to extract with macOS-native `ditto`. With the worker unpacked via `asar: { unpack: "**/render-worker.cjs" }` (matching main.ts's `app.asar.unpacked` resolution from issue 16), `pnpm package:mac` now succeeds **with asar and prune enabled**. Packaged CLI file open verified: full metric sequence, `first_viewport_ready` ≈ 284 ms vs ≈ 262 ms dev. Remaining: `.md` file association needs `CFBundleDocumentTypes` + an `app.on("open-file")` handler, and double-click testing is manual HITL — stopped there; see `NOTES-HITL.md` on the branch.
