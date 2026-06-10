# Fix Startup Enhancement Race When the Document Is Ready Before First Flush

Status: Done

## Problem

When the render worker finishes before the renderer calls `getDocument()`, `initializeDocument` receives an already-`ready` state and runs the enhancers (`enhanceCodeBlocks`, task lists, links, tables, Mermaid) synchronously — before Svelte has flushed the article to the DOM. `querySelector('[data-testid="document"]')` returns null and every enhancement silently skips, so the document renders with no code-copy buttons, line-number gutters, task-list persistence, link interception, or Mermaid rendering. The slower path (update arriving via `onDocumentUpdate`) wraps enhancers in `requestAnimationFrame` and is unaffected, which made the bug appear as an intermittent Electron smoke failure whose rate shifted with bundle size and machine warmth.

## Fix

- `await tick()` in the ready branch of `initializeDocument` before running the enhancers, so the article is in the DOM.
- Pin the smoke-test window with `setAlwaysOnTop(true)` for the test's duration: Playwright's locator/`waitForFunction` polling and the app's Pretext probe both ride on `requestAnimationFrame`, which macOS pauses while the window is occluded.

## Comments

- 2026-06-09: Found while verifying issue 22 on branch `pretext-font-size-control`. A diagnostic run showed the article in its raw, un-enhanced HTML form in 4 of 4 failing runs — the synchronous init path had skipped all enhancers. Reproduced reliably once caches were warm (fast worker), which is why earlier prototypes rarely hit it.
- 2026-06-09: After the `tick()` fix: five consecutive `electron-smoke` passes, plus `pnpm qa` and `pnpm test:electron` green. Separately verified the fit feature live over CDP (`pnpm cdp:launch` + agent-browser): 22px → 13px at 480px width with matching readout, restored to 22px on widen, "Ajustar" label under the Spanish locale. Note for future CDP sessions: rAF (and therefore the Pretext probe) pauses while the app window is occluded — bring the window to front before expecting probe-driven updates.
