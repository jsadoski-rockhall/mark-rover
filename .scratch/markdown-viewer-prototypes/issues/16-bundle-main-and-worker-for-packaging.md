# Bundle Main and Worker for Packaging

Status: completed

## Goal

Test whether production packaging succeeds when Electron main and worker code are bundled into explicit build artifacts instead of packaging raw source plus pnpm `node_modules`.

## Background

Prototype 15 successfully produced a macOS app bundle with Electron Packager only after disabling pruning and asar, but the packaged binary stalled after `parse_start`. The app could read the markdown file, but the Node worker never emitted `parse_done`.

## Tasks

- Add a production build step for Electron main, preload, and render worker code.
- Ensure the packaged app loads worker code from a known unpacked or bundled path.
- Avoid depending on pnpm symlink layout inside the app bundle.
- Package the app and rerun `MARK_ROVER_BENCH=1 <packaged binary> -- corpus/smoke.md`.
- Compare packaged first-viewport metrics to dev/built Electron metrics.

## Acceptance Criteria

- Packaged binary opens a markdown file path and emits `first_viewport_ready`.
- The package script does not require disabling dependency pruning as the primary strategy.
- The packaging README documents how worker assets are included.

## Comments

- 2026-06-01: Created after prototype 15 exposed a packaging-specific worker stall. This is a large enough theory to deserve a new ticket/prototype rather than a small patch.
- 2026-06-01: Closed with `.prototype/16`. Copied forward prototype 15, added `scripts/build-electron.mjs` to bundle Electron main, preload, and worker code into `dist/`, and changed the app entry point to `dist/main/main.mjs`. The render worker is bundled as CJS at `dist/main/render-worker.cjs`; the first ESM bundle attempt reproduced the stall with a dependency dynamic-require failure, so CJS is the correct packaged worker artifact for this dependency set.
- 2026-06-01: Added `scripts/package-mac.mjs`, which stages a minimal production app under `.packager/app` containing only `dist/` and a small `package.json`, then packages that staged app with pruning enabled. This avoids packaging raw `src/` and avoids depending on the pnpm `node_modules` symlink layout.
- 2026-06-01: Verification passed: `pnpm check`, `pnpm test`, direct bundled-worker check, `pnpm test:electron`, and `pnpm package:mac`. Built Electron benchmark on `corpus/smoke.md` emitted `first_viewport_ready` at about 316 ms. Packaged binary benchmark emitted `parse_done` at about 238 ms and `first_viewport_ready` at about 239 ms, so the prototype 15 packaged-worker stall is resolved.
