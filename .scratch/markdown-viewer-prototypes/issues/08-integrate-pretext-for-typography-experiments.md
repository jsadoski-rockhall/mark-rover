# Integrate Pretext for Typography Experiments

Status: needs-triage

## Goal

Use `chenglou/pretext` where it gives real typographic leverage without replacing the browser as the first renderer.

## Tasks

- Identify which pretext features are useful for responsive measure, line-height feel, and text metrics.
- Prototype pretext-assisted decisions for narrow window layout below the selected character width.
- Document limitations around font measurement, `Intl.Segmenter`, Canvas 2D, font feature settings, and system fonts.
- Keep pretext optional until it demonstrates visible product value.

## Acceptance Criteria

- There is a small, measurable typography improvement or a clear decision to defer pretext.
- The prototype does not depend on pretext for basic markdown rendering.
- Any hard-to-reverse use of pretext is proposed as an ADR before being entrenched.

## Comments

- 2026-06-01: Created `.prototype/08` by copying forward successful prototype 07. Initial `pnpm add pretext` installed the wrong unscoped package, exposing helpers like `boldify`; `pnpm add @chenglou/pretext` installed the intended library. Added a small optional pretext probe that estimates the first paragraph's line count/height for the selected reader font and measure. The probe can be disabled with `localStorage["mark-rover.pretext-probe"] = "off"` and basic rendering does not depend on it. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/emoji-long-prose.md` emitted `first_viewport_ready` around 253 ms. Caveat: renderer bundle grew from roughly 42 kB in prototype 07 to 82 kB in prototype 08, so pretext remains optional/flagged rather than foundational.
