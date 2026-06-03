# Add Resizable Reader Text

Status: Done

## Problem

Readers need to resize Document prose without changing the markdown source or relying on browser zoom.

## Scope

- Add a persisted reader text-size preference.
- Expose a compact size control alongside the existing reader controls.
- Use Pretext with the selected text size so typography estimates match the rendered Document.
- Keep basic markdown rendering independent of Pretext.

## Acceptance Criteria

- Text size can be adjusted from the viewer shell.
- The selected size persists with other reader preferences.
- Pretext measurement uses the selected size instead of a fixed 18px assumption.
- Electron smoke coverage verifies the rendered Document font size changes.

## Comments

- 2026-06-03: Created `.prototype/20` by copying forward successful localized prototype 18. Added a persisted text-size slider and wired the Pretext probe to the selected pixel size.
- 2026-06-03: Verification passed: `pnpm check`, `pnpm test`, and escalated `pnpm test:electron`. Electron smoke now sets the text-size slider to 22 and verifies the rendered Document font size is `22px`; localization smoke still passes.
