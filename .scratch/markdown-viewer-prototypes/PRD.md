# Mark Rover Prototype Sequence

Build a boring-first Electron markdown viewer prototype that opens local markdown files quickly, renders safely, and gives us enough instrumentation to compare prototypes as the product moves toward a 400 ms v1 first-viewport target.

The first prototype should go straight to worker offloading because `/Users/joesadoski/Projects/mark-rover-adversarial` has already validated the shape: Electron, bundled Chromium, `markdown-it` in a Node worker, parse/window overlap, lazy image attributes, and first viewport readiness around 180-310 ms on the starter corpus.

## Scope Decisions

- Use Electron, Svelte, Tailwind, `markdown-it`, Node 24, TanStack Table, and Playwright/CDP validation.
- Treat relative markdown links as out of scope for the first prototype.
- Defer scroll restoration during font switching unless it is cheap.
- Support system light/dark mode in the viewer shell.
- Keep implementation boring before adding typography delight.
- Use local markdown issue files under `.scratch/markdown-viewer-prototypes/issues/`.

## Target

The long-term v1 target is 400 ms from launch to first viewport ready for typical local markdown files. During prototyping, prioritize measurement, correctness, security, and architectural clarity over hitting the final number.

## ADR Candidates

Create ADRs only if the decision remains hard to reverse, surprising, and trade-off driven after implementation starts.

- Go straight to worker-first rendering instead of building a sync-path prototype first.
- Use a custom app protocol and narrow preload bridge for local document assets.
- Sanitize rendered HTML with an allowlist while keeping raw HTML support intentionally small.
- Defer relative links and multi-window document navigation from the first prototype.
- Use CDP/agent-browser as a validation path alongside Playwright Electron tests.
