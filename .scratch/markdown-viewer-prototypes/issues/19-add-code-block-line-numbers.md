# Add Code Block Line Numbers

Status: completed

## Goal

Add optional line numbers to fenced code blocks as a follow-up code-reading feature.

## Scope

This covers rendered fenced code blocks in the markdown viewer. It does not require line numbers for prose, tables, Mermaid diagrams, or source-editor views.

## Tasks

- Add a viewer preference to show or hide code block line numbers.
- Render stable line numbers for fenced code blocks without changing the underlying markdown content.
- Keep copy-to-clipboard behavior focused on the original code text, excluding line numbers.
- Handle long lines, wrapped lines, unknown languages, highlighted code, and many code blocks.
- Persist the line-number preference with the other viewer settings.

## Acceptance Criteria

- Users can toggle code block line numbers on and off.
- Line numbers align with code rows and remain readable in light and dark mode.
- Long code lines remain usable without line numbers overlapping or becoming part of copied code.
- Existing syntax highlighting and copy buttons continue to work.
- The feature does not materially regress first-viewport readiness on the code-heavy corpus.

## Comments

- 2026-06-01: Added as a future feature request.
- 2026-06-09: Implemented. New `codeLineNumbers` reader preference (default off) persisted with the other viewer settings, with a localized toggle (`Line numbers` / `Números de línea`) in the reader controls. The code-block enhancement pass builds a line-number gutter per fenced block (skipping Mermaid blocks); the gutter is a sibling of `<code>` inside `<pre>`, `aria-hidden`, and `user-select: none`, so copy-to-clipboard (which reads `code.textContent`) and text selection never include the numbers. Visibility is toggled purely via a `show-line-numbers` class bound to the preference, so the toggle is instant without re-rendering. When enabled, the `pre` becomes a two-column grid: gutter and code share line boxes (same mono font-size/line-height, so numbers align with highlighted code in every treatment and in dark mode), and the code column takes over horizontal scrolling so long lines slide under their own scrollbar, never under the numbers. Verified: `pnpm qa`, plus new `pnpm test:electron` assertions (gutter hidden by default, visible and numbered after toggle, structurally outside `<code>`); bench on `tests/corpus/code-heavy.md` emitted `first_viewport_ready` ≈164 ms — no regression.
