# ADR-0001: Pretext as an optional typography layer

Status: Proposed

## Context

`@chenglou/pretext` gives Mark Rover glyph-accurate text measurement (Canvas 2D
`measureText` plus `Intl.Segmenter` line breaking) without replacing the browser
as the first renderer. Prototype 08 measured the cost: adding pretext roughly
doubled the renderer bundle (~42 kB → ~82 kB) while `first_viewport_ready` on
`corpus/emoji-long-prose.md` stayed in the ~250 ms range.

Pretext currently powers three things:

1. The probe statistics shown in the header (estimated line count for the first
   paragraph).
2. The **Fit** preference: finding the largest font size at which a line of the
   selected measure fits the window without wrapping.
3. Narrow-window leading: when the window truncates the selected measure, the
   line-height is scaled down toward a 1.45 floor in proportion to how much of
   the measure actually fits (shorter measure → tighter leading).

All three run from a single `requestAnimationFrame`-deferred probe that can be
disabled with `localStorage["mark-rover.pretext-probe"] = "off"`.

## Decision

Pretext is an **optional enhancement layer**, not a rendering dependency.

- The Document render path (worker markdown → sanitized HTML → `{@html}`) must
  never require pretext. First Viewport Ready cannot wait on a pretext result.
- Pretext-derived values may only _adjust_ CSS custom properties that already
  have sensible preference-driven defaults (`--reader-font-size`,
  `--reader-line-height`). Disabling the probe must leave a fully usable
  reader.
- Any future use of pretext that would be hard to reverse (e.g. pretext-driven
  pagination, custom line breaking, replacing CSS wrapping) requires a new ADR
  before it lands.

## Known limitations

- **Font measurement vs. DOM layout.** Canvas 2D `measureText` does not apply
  `font-feature-settings`, `font-variant-ligatures`, kerning context across
  inline elements, or `letter-spacing`. Measurements drift from real DOM line
  breaking, especially with the Ligatures preference on. Treat pretext output
  as an estimate, never as an exact mirror of layout.
- **`Intl.Segmenter`.** Segmentation is locale-sensitive and does not implement
  full UAX #14 line breaking; CJK and SEA scripts in particular may break
  differently than the browser does.
- **System fonts.** The reader font stacks resolve per-platform (e.g. Snell
  Roundhand only on macOS), so measured widths are machine-specific. Probe
  results must not be persisted or compared across machines.
- **Complex shaping.** No HarfBuzz-style shaping: Arabic joining, Indic
  conjuncts, and emoji ZWJ sequences are measured as naive glyph runs.
- **Bundle cost.** ~40 kB of renderer JS. Acceptable while optional; a reason
  to remove pretext if its features stop earning their keep.

## Consequences

- Typography features built on pretext degrade gracefully to the static
  preferences when the probe is off or measurement fails.
- The probe runs after First Viewport Ready, so pretext can never regress the
  startup benchmark contract.
- Revisit after the narrow-window leading experiment has real-world feedback;
  if neither Fit nor narrow leading proves valuable, the cheapest path is to
  delete the probe and the dependency together.
