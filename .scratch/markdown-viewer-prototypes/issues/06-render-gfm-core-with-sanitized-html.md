# Render GFM Core With Sanitized HTML

Status: ready-for-agent

## Goal

Render the useful GitHub-flavored markdown subset while keeping GitHub platform features out of scope.

## Tasks

- Configure `markdown-it` for the core GFM-like feature set.
- Add task list support using the chosen task-list plugin.
- Render headings, paragraphs, emphasis, links, blockquotes, ordered lists, unordered lists, task lists, fenced code, images, and tables.
- Sanitize rendered HTML with an explicit allowlist.
- Add lazy image renderer rules with `loading="lazy"` and `decoding="async"`.
- Generate stable heading anchors for in-document anchor jumps.

## Acceptance Criteria

- Corpus documents render expected markdown features.
- Images include lazy loading and async decoding attributes.
- Unsafe HTML is removed or reduced to the allowed subset.
- Anchor links jump within the current document.

## Comments

- 2026-06-01: Created `.prototype/06` by copying forward successful prototype 05. Added heading slug/id generation, basic external link `rel="noreferrer"`, a smoke corpus anchor link, and corpus assertions for heading ids and anchor links. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/smoke.md` emitted `first_viewport_ready` around 230 ms. Prototype 06 is successful.
