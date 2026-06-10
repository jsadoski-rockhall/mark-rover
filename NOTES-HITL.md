# Temporary branch notes — issue 15 (package and file open)

> Temporary note per experiment protocol. Delete before merging.

## What works on this branch (verified 2026-06-09)

- `pnpm package:mac` produces `out/MarkRover-darwin-arm64/MarkRover.app`
  (261 MB) with **asar and pruning enabled** — both workarounds from the
  failed 2026-06-01 prototype (`--prune=false`, `--asar=false`) are gone.
- Root cause of every packaging stall/hang was `extract-zip@2.0.1` hanging
  under Node 24 (stalls at ~14.7 MB into the Electron zip with a dropped
  promise; reproduced in isolation). Fixed with a pnpm patch
  (`patches/@electron__packager.patch`) that swaps the packager's unzip step
  for macOS-native `ditto -x -k`.
- The render worker is unpacked via `asar: { unpack: "**/render-worker.cjs" }`,
  matching the `app.asar.unpacked` path `src/main/main.ts` already resolves.
- Command-line file open works in packaged form:
  `MarkRover.app/Contents/MacOS/MarkRover -- <file.md>` renders and emits the
  full metric sequence with `MARK_ROVER_BENCH=1`.
- Packaged cold start: `first_viewport_ready` ≈ 284 ms vs ≈ 262 ms for dev
  launch on `tests/corpus/smoke.md` (single iteration each). No meaningful
  regression.

## What needs a human / a follow-up decision

1. **`.md` file association is not implemented.** It needs two coupled pieces:
   - `CFBundleDocumentTypes` in Info.plist (packager `extendInfo` option) so
     Finder offers MarkRover for `.md`.
   - An `app.on("open-file")` handler in `src/main/main.ts` — macOS delivers
     double-clicked files as an event, not argv, so without this the
     association would launch an empty window. Declaring the association
     without the handler ships a half-feature; that tradeoff is why this
     branch stops here.
2. **Double-click verification is manual HITL.** Finder/LaunchServices
   registration can't be meaningfully driven from this harness; once (1) is
   built, a human should: copy the app to /Applications, double-click a `.md`
   file, and confirm it opens with the document loaded (first launch will also
   hit Gatekeeper because the bundle is unsigned).
3. **The ditto patch is darwin-only.** Fine while packaging targets macOS;
   when Windows/Linux packaging starts, the patch must be made conditional
   (e.g. fall back to extract-zip or wait for an upstream fix to land).
4. **Bundle size (261 MB).** The asar carries every lazy Mermaid/katex/
   cytoscape chunk from `dist/renderer`. Worth pruning unused diagram chunks
   or auditing what vite emits before this goes anywhere near distribution.
