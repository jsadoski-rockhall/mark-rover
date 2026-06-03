# Build Test Corpus and Smoke Harness

Status: ready-for-agent

## Goal

Create a corpus and test harness that catches markdown rendering, security, and performance regressions early.

## Tasks

- Add corpus documents for smoke, README-like content, pathological nesting, image-heavy content, code-heavy content, table-heavy content, unsafe HTML, task lists, Mermaid fences, emoji, and long prose.
- Include relative links in the corpus only as inert fixtures for future behavior.
- Add smoke tests that open representative corpus files.
- Verify key rendered features with DOM assertions.
- Verify unsafe input does not execute scripts or create forbidden elements.

## Acceptance Criteria

- Tests can run without network access.
- The corpus includes at least one file that stresses each major planned feature.
- Smoke tests prove the app can open and render a local markdown file.

## Comments

- 2026-06-01: Created `.prototype/04` by copying forward successful prototype 03. Added corpus files for smoke, README-like content, pathological nesting/unsafe HTML, image-heavy, code-heavy, table-heavy, unsafe HTML, task lists, Mermaid, emoji, and long prose. Added `scripts/corpus-smoke.mjs` and `pnpm test` to render corpus files through the worker without launching Electron. Pending install/check/test verification.
- 2026-06-01: `pnpm check` passed. `pnpm test` rendered all 10 corpus files successfully and verified unsafe HTML stripping, lazy image attributes, task list inputs, and table output. Prototype 04 is successful.
