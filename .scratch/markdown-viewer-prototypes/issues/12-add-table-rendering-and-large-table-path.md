# Add Table Rendering and Large Table Path

Status: needs-triage

## Goal

Render normal markdown tables simply and decide whether TanStack Table is justified for large or interactive tables.

## Tasks

- Render basic markdown tables from the sanitized markdown output.
- Add corpus cases for wide tables and long tables.
- Evaluate whether TanStack Table improves large table usability enough to justify its complexity.
- If needed, add TanStack Table only for table blocks above a size threshold.
- Evaluate TanStack Virtual only after large documents or tables demonstrate a real need.

## Acceptance Criteria

- Normal markdown tables render correctly.
- The prototype has a documented threshold decision for plain tables versus enhanced tables.
- Virtualization is not added without a measured problem.

## Comments

- 2026-06-01: Created `.prototype/12` by copying forward successful prototype 11. Installed `@tanstack/table-core` and added `scripts/table-threshold.mjs` to validate the table threshold idea, but kept the runtime as semantic HTML tables with a lightweight large-table enhancer: tables with at least 8 body rows or 6 columns get constrained height and sticky headers. TanStack replacement rendering is not justified yet because plain markdown tables need reading affordances, not sorting/filtering. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check`, `pnpm test`, and `pnpm table:threshold` passed. One-iteration benchmark on `corpus/table-heavy.md` emitted `first_viewport_ready` around 300 ms. Prototype 12 is successful; virtualization remains deferred because there is no measured problem yet.
