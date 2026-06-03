# Add RTL Rendering Support

Status: ready-for-agent

## Goal

After the app is stabilized, support right-to-left document rendering well enough for markdown authored in RTL languages.

## Tasks

- Define expected behavior for document-level direction, mixed LTR/RTL paragraphs, headings, lists, blockquotes, tables, and code blocks.
- Add a test corpus for Arabic, Hebrew, Persian, Urdu, and mixed-direction markdown samples.
- Verify text alignment, punctuation placement, list markers, table column behavior, selection, copy/paste, and scroll behavior.
- Decide whether direction should be inferred from content, controlled by metadata, exposed as a viewer setting, or some combination.
- Add automated or manual visual validation for the highest-risk rendering cases.

## Acceptance Criteria

- RTL prose renders in the correct direction without broken layout in common markdown structures.
- Mixed LTR/RTL content behaves predictably, especially around inline code, links, punctuation, and numbers.
- Direction behavior is documented and covered by representative test samples.

## Comments

- 2026-06-01: Created `.prototype/17` by copying forward successful bundled-packaging prototype 16. Added `corpus/rtl-mixed.md` covering Arabic, Hebrew, mixed LTR/RTL prose, lists, blockquotes, tables, inline code, and fenced code. Added a renderer direction enhancement that infers `dir` per prose block, sets document-level direction when RTL blocks dominate, mirrors blockquote chrome, and keeps code blocks isolated as LTR.
- 2026-06-01: Verification passed: `pnpm check`, `pnpm test`, and escalated `pnpm test:electron`, including `tests/rtl-smoke.mjs` for document direction and LTR code behavior. One-iteration benchmark on `corpus/rtl-mixed.md` emitted `first_viewport_ready` around 219 ms. Direction is content-inferred for this prototype; metadata/manual controls remain a follow-up decision.
