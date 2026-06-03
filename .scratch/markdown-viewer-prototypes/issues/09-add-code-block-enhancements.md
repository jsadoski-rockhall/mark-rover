# Add Code Block Enhancements

Status: ready-for-agent

## Goal

Make code blocks useful without letting highlighting dominate the early prototype.

## Tasks

- Add syntax highlighting for fenced code blocks.
- Add a copy button to code blocks.
- Preserve plain readable code when the language is unknown.
- Test long lines, unknown languages, and many code blocks.

## Acceptance Criteria

- Fenced code blocks render with highlighting when possible.
- Every code block has a working copy action.
- Highlighting does not block first window creation.

## Comments

- 2026-06-01: Created `.prototype/09` by copying forward successful prototype 08. Added `highlight.js` highlighting in the worker, allowed sanitized highlight spans/classes, added a preload/main clipboard bridge, and enhanced rendered `<pre>` blocks with copy buttons. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/code-heavy.md` emitted `first_viewport_ready` around 262 ms; worker render duration was about 15.5 ms with highlighting. Prototype 09 is successful.
