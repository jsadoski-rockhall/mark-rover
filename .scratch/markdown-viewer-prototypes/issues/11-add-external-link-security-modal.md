# Add External Link Security Modal

Status: completed

## Goal

Prevent document content from opening web links without an explicit user confirmation.

## Tasks

- Intercept web links from rendered markdown.
- Normalize and display the destination URL in a confirmation modal.
- Open approved links through the safe Electron external-open path.
- Block or reject malformed and unsupported protocols.
- Keep relative markdown links intentionally unimplemented in this prototype.

## Acceptance Criteria

- Clicking an HTTP or HTTPS link opens a confirmation modal first.
- Approving opens the normalized URL externally.
- Cancelling leaves the user in the document.
- Relative links do not open documents yet.

## Comments

- 2026-06-01: Created `.prototype/11` by copying forward successful prototype 10. Added rendered-link enhancement that allows hash links, intercepts HTTP/HTTPS links into a modal, keeps other/relative links inert, and exposes a narrow preload/main `openExternalLink` path that only accepts HTTP/HTTPS URLs. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed after fixing modal semantics. One-iteration benchmark on `corpus/smoke.md` emitted `first_viewport_ready` around 284 ms. Prototype 11 is successful with a caveat: click behavior should be validated via CDP/Playwright in prototype 14.
- 2026-06-09: Verified in the consolidated app and marked completed. `src/renderer/App.svelte` intercepts HTTP/HTTPS links from rendered markdown into an accessible confirmation modal (`role="dialog"`, `aria-modal`), opens approved URLs through the `openExternalLink` preload bridge, and the `link:open-external` handler in `src/main/main.ts` normalizes the URL and rejects any protocol other than `http:`/`https:` before calling `shell.openExternal`. Hash links work in-document and relative links stay inert. The earlier caveat is resolved: `tests/electron-smoke.ts` clicks an external link and asserts the modal appears, and `tests/localization-smoke.ts` verifies the modal in Spanish.
