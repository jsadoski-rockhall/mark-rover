# Add Mermaid Lazy Rendering

Status: completed

## Goal

Render Mermaid diagrams lazily and safely after the base markdown viewer is already solid.

## Tasks

- Detect Mermaid fenced code blocks.
- Replace them with inert placeholders on initial render.
- Render diagrams only near the viewport.
- Keep failures visible and non-fatal.
- Evaluate sandboxing or isolation options before rendering untrusted diagram text.

## Acceptance Criteria

- Mermaid blocks do not delay initial document readiness.
- Diagrams render when scrolled near the viewport.
- Invalid Mermaid code displays a useful failure state.
- Mermaid rendering does not weaken the markdown HTML sanitizer boundary.

## Comments

- 2026-06-01: Created `.prototype/13` by copying forward successful prototype 12. Installed `mermaid` and added a renderer-side IntersectionObserver that dynamically imports Mermaid only when `.language-mermaid` code fences approach the viewport. Mermaid uses `securityLevel: "strict"` and replaces the placeholder with rendered SVG or an inline failure state. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/mermaid.md` emitted `first_viewport_ready` around 281 ms. Caveat: dynamic import split Mermaid out of the initial app chunk, but generated many chunks including several very large ones. Prototype 13 is successful but Mermaid must stay lazy.
- 2026-06-09: Branch `issue-13-mermaid-hardening`. Extended `tests/corpus/mermaid.md` to three fences (valid in-viewport, intentionally invalid, valid far below the viewport) with corpus-smoke assertions that the worker emits inert `language-mermaid` fences and no pre-rendered SVG. Added `tests/mermaid-smoke.ts` (wired into `pnpm test:electron`) verifying in-viewport render, the visible non-fatal failure state, and scroll-triggered lazy render. Evaluated isolation options (strict mode vs. sandboxed iframe vs. utility process) in ADR-0003; decision: keep `securityLevel: "strict"` as the diagram SVG boundary, keep CSP `frame-src 'none'`.
- 2026-06-09: Experiment branch merged to main; issue closed as completed.
