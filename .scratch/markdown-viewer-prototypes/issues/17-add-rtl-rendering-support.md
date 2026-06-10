# Add RTL Rendering Support

Status: completed

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
- 2026-06-09: Implemented in the consolidated app (the prototype 17 work had never been folded in). Direction inference now lives in the render worker as a markdown-it core rule: first-strong-character (UAX #9) detection per block; paragraphs/headings/list items vote on document direction, table cells get `dir` but do not vote; only blocks opposing the document direction receive an explicit `dir` attribute. Document direction flows through worker meta to the renderer, which sets `dir` on the article. Code blocks are pinned LTR via CSS, and treatment accents (blockquote/h2 borders, th alignment) were converted to CSS logical properties so they mirror automatically. Added `tests/corpus/rtl-mixed.md` (Arabic, Hebrew, Persian, Urdu, mixed-direction lists/blockquotes/tables/code) with assertions in `pnpm test` (document direction rtl, explicit ltr on opposing paragraph, no rtl code blocks). Direction behavior documented in README. Verified: `pnpm qa`, `pnpm test:electron`, one-iteration bench on `tests/corpus/rtl-mixed.md` emitted `first_viewport_ready` with no regression. Direction remains content-inferred; metadata/manual override is still an open follow-up decision.
