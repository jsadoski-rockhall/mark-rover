# Add CDP and Playwright Electron Validation

Status: ready-for-agent

## Goal

Validate the running Electron app through both Playwright Electron APIs and CDP attachment so prototype testing matches the intended agent workflow.

## Tasks

- Add a launch path that enables `--remote-debugging-port=9222` or a configurable port.
- Document the validation workflow: launch app, connect agent-browser over CDP, snapshot, interact, assert.
- Add Playwright Electron tests for app launch and main document interactions.
- Add CDP smoke validation for rendered content, controls, and modal behavior.
- Ensure tests can avoid port collisions in CI or local repeated runs.

## Acceptance Criteria

- A running app can be inspected over CDP.
- Playwright Electron tests cover launch and document rendering.
- CDP validation can snapshot and interact with the app.
- The workflow is documented in the issue or follow-up docs.

## Comments

- 2026-06-01: Created `.prototype/14` by copying forward successful prototype 13. Installed Playwright, added `tests/electron-smoke.mjs` using Playwright Electron to launch the app, assert document rendering/lazy image output, and click an external link into the security modal. Added `MARK_ROVER_CDP_PORT` support and `pnpm cdp:launch` for `agent-browser connect 9222` workflows. Loaded `agent-browser skills get electron`; `agent-browser` and `npx` are available. Pending install/check/test/electron/CDP verification.
- 2026-06-01: `pnpm check`, `pnpm test`, and `pnpm test:electron` passed. CDP validation succeeded: launched with `pnpm cdp:launch`, connected with `agent-browser connect 9222`, snapshotted reader controls/document content, clicked the external link, and confirmed the security modal appeared. Prototype 14 is successful.
