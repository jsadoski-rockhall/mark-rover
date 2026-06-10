# ADR-0003: Mermaid stays lazy, with strict in-renderer sanitization

Status: Proposed

## Context

Mermaid fences carry untrusted diagram text from the Document, and Mermaid is
by far the heaviest dependency in the app: the core chunk alone is ~600 kB
minified, with per-diagram-type chunks behind it. Prototype 13 established the
lazy path — fences stay inert code blocks until an `IntersectionObserver`
(420px root margin) sees them, then `import("mermaid")` runs and the block is
replaced with rendered SVG or a visible inline failure state.

The rendered SVG is injected via `innerHTML`, which is **outside** the worker's
`sanitize-html` boundary. That boundary intentionally strips `<svg>` and
`<script>`, so Mermaid output could never pass through it; some second line of
defense is required.

Isolation options evaluated:

- **Mermaid `securityLevel: "strict"`** (current). Mermaid runs DOMPurify over
  its own output, blocks click interactions and external links inside
  diagrams. Cheap, in-process, no layout cost.
- **Sandboxed `<iframe srcdoc>` per diagram** (Mermaid's `securityLevel:
"sandbox"` works this way). Hard DOM/JS isolation, but: the renderer CSP
  sets `frame-src 'none'` and would need loosening, diagram auto-sizing needs
  postMessage plumbing, and theme/dark-mode propagation breaks. Material
  complexity for a marginal gain over strict mode.
- **Electron utility process / separate BrowserWindow.** Full process
  isolation, far more machinery than a markdown reader's diagram path
  justifies, and it still has to hand SVG back into the reader DOM.

## Decision

- Mermaid rendering stays **lazy and renderer-side**: inert fence → observer →
  dynamic import → SVG, with failures rendered inline and non-fatal. The
  initial app chunk must never include Mermaid.
- `securityLevel: "strict"` is the accepted sanitization boundary for diagram
  SVG. The worker sanitizer is unchanged and continues to strip raw SVG from
  markdown, so Mermaid's DOMPurify pass is the only path by which SVG reaches
  the Document.
- The renderer CSP keeps `frame-src 'none'`; the iframe sandbox option is
  rejected while strict mode holds. Revisit only if a concrete DOMPurify
  bypass in Mermaid output is demonstrated.
- `tests/corpus/mermaid.md` pins the contract end to end: the worker must emit
  three inert `language-mermaid` fences and no SVG; the Electron smoke
  (`tests/mermaid-smoke.ts`) verifies in-viewport render, a visible failure
  state for an invalid diagram, and that a far-below diagram renders only
  after scrolling.

## Consequences

- First Viewport Ready is insulated from Mermaid entirely — even a Mermaid
  regression can only affect diagrams, not Document readiness.
- Diagram SVG trusts Mermaid's DOMPurify configuration; tracking Mermaid
  security releases is part of dependency hygiene.
- The many large lazy chunks (cytoscape, katex, per-diagram bundles) remain in
  `dist/` and inflate packaged app size; acceptable for the prototype, worth a
  look when packaging (issue 15/16) matures.
