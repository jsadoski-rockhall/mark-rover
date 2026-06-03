# Localize App System Text

Status: ready-for-agent

## Goal

After the app is stabilized, prepare app-controlled system text for localization.

## Scope

This covers text owned by the app shell and viewer UI, not user-authored markdown document content.

## Tasks

- Inventory all app-controlled strings in menus, dialogs, tooltips, buttons, status messages, errors, empty states, and accessibility labels.
- Choose a localization approach that works in the Electron/Svelte app without adding unnecessary runtime weight.
- Replace hard-coded UI strings with localizable message keys.
- Define formatting rules for dates, numbers, file sizes, keyboard shortcuts, and platform-specific labels.
- Add at least one non-English locale fixture to validate the system before broader translation work.

## Acceptance Criteria

- App-controlled UI text can be translated without changing component code.
- The localization path covers menus, dialogs, tooltips, errors, and accessibility labels.
- At least one non-English locale can be loaded in development for validation.

## Comments

- 2026-06-01: Created `.prototype/18` by copying forward successful bundled-packaging prototype 16. Added a small English/Spanish message catalog for app-owned viewer text, including reader controls, token/pretext labels, code-copy feedback, Mermaid status text, and the external-link confirmation modal. Added a locale selector and kept user-authored markdown content outside localization scope.
- 2026-06-01: Verification passed: `pnpm check`, `pnpm test`, and escalated `pnpm test:electron`, including `tests/localization-smoke.mjs` that switches to Spanish and verifies modal text/actions. One-iteration benchmark on `corpus/smoke.md` emitted `first_viewport_ready` around 246 ms. Menus/native dialogs are not present in this prototype; if they are added later, they should use the same message-key approach.
