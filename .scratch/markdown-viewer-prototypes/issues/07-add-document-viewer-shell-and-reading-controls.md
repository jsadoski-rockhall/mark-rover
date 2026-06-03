# Add Document Viewer Shell and Reading Controls

Status: ready-for-agent

## Goal

Add the smallest useful reading surface and controls without turning the prototype into a settings app.

## Tasks

- Add fixed measure options for 66, 70, and 88 characters.
- Add flexible line-height control.
- Add font family options for serif, sans-serif, mono, slab serif, comic sans, and script.
- Add ligature and emoji-friendly rendering defaults.
- Respect system light/dark mode by default.
- Persist viewer preferences in local storage.
- Restore scroll only if cheap; otherwise leave a deliberate follow-up note.

## Acceptance Criteria

- The document remains the first-screen focus.
- Width, line height, font family, and ligature preferences can be changed and persist across reloads.
- The viewer follows system light/dark mode without requiring manual setup.
- The layout remains usable on narrow windows.
- No product work depends on relative document links.

## Comments

- 2026-06-01: Created `.prototype/07` by copying forward successful prototype 06. Added compact reader controls for 66/70/88 character measure, line-height slider, font family select, and ligature toggle. Preferences persist to local storage. System light/dark remains handled by CSS media dark mode. Scroll restoration during font switches is deferred. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/emoji-long-prose.md` emitted `first_viewport_ready` around 255 ms. Prototype 07 is successful.
