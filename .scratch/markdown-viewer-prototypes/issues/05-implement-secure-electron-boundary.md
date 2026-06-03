# Implement Secure Electron Boundary

Status: ready-for-agent

## Goal

Make the default Electron app shape safe for arbitrary local markdown before feature work expands the attack surface.

## Tasks

- Use `contextIsolation`, sandboxing, and disabled renderer Node integration.
- Expose a narrow preload API for document data, metrics, and approved app actions.
- Add a strict Content Security Policy.
- Prevent untrusted navigation and unexpected new windows.
- Add a safe path for local document assets, likely through a custom app protocol.
- Add tests for blocked scripts, blocked iframes, blocked unexpected navigation, and external-link interception.

## Acceptance Criteria

- Markdown content cannot access Node APIs.
- Raw scripts and iframes from markdown do not execute or render.
- External web links do not open directly from document content.
- The security boundary is covered by automated tests.

## Comments

- 2026-06-01: Created `.prototype/05` by copying forward successful prototype 04. Added privileged `mark-rover-file://` protocol, rewrote relative image sources in the worker to that protocol, kept sandbox/context isolation/no node integration, explicitly enabled web security, and extended corpus smoke assertions for protocol rewriting. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/smoke.md` emitted `first_viewport_ready` around 187 ms. Prototype 05 is successful. Caveat: full process elapsed was about 2 seconds despite early readiness, likely Electron shutdown/protocol lifecycle overhead worth revisiting later.
