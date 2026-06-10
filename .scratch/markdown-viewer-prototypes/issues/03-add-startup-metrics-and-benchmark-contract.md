# Add Startup Metrics and Benchmark Contract

Status: completed

## Goal

Instrument startup and rendering so every prototype can be compared against the same first-viewport target.

## Background

The adversarial repo uses newline-delimited JSON metrics with events like `process_start`, `window_requested`, `parse_start`, `parse_done`, `first_paint`, and `first_viewport_ready`. Reuse that spirit so results stay comparable.

## Tasks

- Emit benchmark metrics when `MARK_ROVER_BENCH=1` is set.
- Record process-relative timings from both main and renderer paths.
- Include worker parse/render duration and input byte count.
- Define first viewport readiness for the prototype.
- Add a small benchmark runner or script that can execute a local corpus repeatedly.

## Acceptance Criteria

- Benchmark mode writes newline-delimited JSON metrics to stdout.
- The metrics distinguish app startup, file read, worker render, first paint, and first viewport readiness.
- A failed benchmark run exits clearly instead of silently producing partial data.

## Comments

- 2026-06-01: Created `.prototype/03` by copying forward successful prototype 02. Added `scripts/bench.mjs`, `pnpm bench`, benchmark candidate id `prototype-03`, and auto-quit after `first_viewport_ready` in `MARK_ROVER_BENCH=1` mode. Pending install/check/bench verification.
- 2026-06-01: `pnpm check` passed. First benchmark attempt failed because the runner treated pnpm's `--` separator as the markdown file path; fixed argument parsing to ignore `--`.
- 2026-06-01: Second benchmark attempt produced process/window/file/parse metrics but missed `first_viewport_ready`, causing timeout-length runs. Hypothesis: Svelte 5 was mounted using the older `new App()` API. Switched renderer entry to `mount(App, ...)`.
- 2026-06-01: Svelte 5 mount did not fix the missing renderer-originated metric. To keep benchmark work moving, added a benchmark-only main-process DOM probe after document update; it emits `first_viewport_ready` with `source: "main-dom-probe"` when the rendered document node has text. Follow-up: debug why preload/renderer acknowledgement is not observed.
- 2026-06-01: Diagnostics showed no renderer console output because the Vite bundle was not loading under `loadFile`; fixed with `base: "./"` in Vite config.
- 2026-06-01: `pnpm check` passed after the asset-path fix. One-iteration benchmark emitted renderer-originated `first_viewport_ready` around 299 ms and exited automatically. Prototype 03 is successful and becomes the last-known-good baseline.
- 2026-06-09: Verified in the consolidated app and marked completed. `src/main/main.ts` gates metrics behind `MARK_ROVER_BENCH=1` and emits `process_start`, `first_paint`, `parse_done` (with byte counts and worker metadata), and `first_viewport_ready` (renderer-acknowledged via the `metric:first-viewport-ready` IPC channel, with a main-dom-probe fallback). `scripts/bench.ts` is the corpus benchmark runner, wired up as `pnpm bench`.
