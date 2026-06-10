# ADR-0002: Plain tables with a large-table enhancer

Status: Proposed

## Context

Markdown tables in a Document are read, not manipulated: GFM has no sorting,
filtering, or pagination semantics, and the worker already emits sanitized
semantic `<table>` HTML. Prototype 12 evaluated `@tanstack/table-core` as a
replacement renderer and found it solves problems Mark Rover does not have —
its value is interactive state (sorting/filtering models), at the cost of
rebuilding the table DOM outside the sanitized HTML path.

What large tables actually need are reading affordances: the header should stay
visible while scrolling, and one table should not push the rest of the Document
out of reach.

## Decision

- Markdown tables render as the worker's sanitized semantic HTML, always.
- A renderer-side enhancer adds reading affordances (constrained height and a
  sticky header via the `large-markdown-table` class) when a table crosses the
  large-table threshold: **8 body rows or 6 columns**, encoded once in
  `src/shared/table-threshold.ts` and consumed by both the runtime enhancer and
  the `pnpm table:threshold` validation script.
- The threshold is intentionally coarse. It marks "taller/wider than fits a
  comfortable reading viewport at the default measure", not a performance
  boundary. Corpus cases `table-wide.md` (12 columns) and `table-long.md`
  (48 rows) pin each bound independently.
- TanStack Table is **deferred**: it stays out of the render path until tables
  need interactive state (sort/filter), which is a product decision, not a
  rendering one. The dependency remains only as the validation script's test
  subject.
- TanStack Virtual is **deferred until a measured problem exists**. The
  benchmark contract (`first_viewport_ready` on `corpus/table-heavy.md`, ~300 ms
  in prototype 12) is the tripwire; no virtualization lands without a corpus
  case that demonstrably regresses it.

## Consequences

- Tables keep working with selection, find-in-page, and copy, because they stay
  ordinary DOM produced by the sanitizer.
- If interactive tables are ever wanted, that work starts with a new ADR and a
  sanitizer-boundary design, not with swapping the renderer.
- The threshold lives in one module; the enhancer, the validation script, and
  this ADR cannot silently disagree.
