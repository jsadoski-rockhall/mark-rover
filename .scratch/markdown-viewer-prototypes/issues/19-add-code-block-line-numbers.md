# Add Code Block Line Numbers

Status: ready-for-agent

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
