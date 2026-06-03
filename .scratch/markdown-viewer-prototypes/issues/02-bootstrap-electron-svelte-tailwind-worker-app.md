# Bootstrap Electron Svelte Tailwind Worker App

Status: ready-for-agent

## Goal

Create the smallest runnable Electron app that opens a markdown file path from the command line, creates the main window promptly, and renders worker-produced markdown output.

## Background

Worker offloading has already been validated in `/Users/joesadoski/Projects/mark-rover-adversarial`, so this prototype should start worker-first rather than preserving a sync render path for product behavior.

## Tasks

- Bootstrap Electron with Svelte, Tailwind, Node 24, and a package manager setup.
- Accept a markdown file path as the final command-line argument.
- Start worker markdown processing off the main startup path.
- Show a minimal loading state if the renderer wins the race.
- Keep the first UI a document viewer, not a landing page.
- Add basic scripts for dev, build, and test.

## Acceptance Criteria

- Running the app with a local `.md` path displays rendered document content.
- The window can appear before markdown processing completes.
- The app has a clear place for main, preload, renderer, and worker code.
- No relative-link navigation behavior is implemented.

## Comments

- 2026-06-01: Created `.prototype/02` as the first runnable package. It uses Electron main/preload/renderer/worker boundaries, Svelte, Tailwind, `markdown-it`, and `sanitize-html`. Pending dependency install and verification.
- 2026-06-01: First launch failed because pnpm ignored Electron/esbuild build scripts, leaving the Electron binary missing. Added `pnpm.onlyBuiltDependencies` for `electron` and `esbuild` in the package.
- 2026-06-01: `pnpm check` passed. Smoke launch with the PRD markdown file succeeded and the process was stopped after verification. Prototype 02 is the first last-known-good implementation.
- 2026-06-01: Later prototype 03 diagnostics showed Vite's default absolute asset paths meant the Svelte bundle did not load under Electron `loadFile`; patched prototype 02 with `base: "./"`.
