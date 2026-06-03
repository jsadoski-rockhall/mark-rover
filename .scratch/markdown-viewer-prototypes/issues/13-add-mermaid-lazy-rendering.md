# Add Mermaid Lazy Rendering

Status: needs-triage

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
