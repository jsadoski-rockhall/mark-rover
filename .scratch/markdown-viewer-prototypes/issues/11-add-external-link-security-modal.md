# Add External Link Security Modal

Status: ready-for-agent

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
