# Use Pretext to Control the Reader Font Size

Status: Done

## Problem

The text-size slider (issue 20) sets a fixed pixel size, and Pretext only reports stats. In a narrow window the selected line width (measure) no longer fits, so lines wrap well short of the chosen character count. Pretext can measure real text in the selected font, so it should be able to drive the applied font size instead of just observing it.

## Scope

- Add a persisted "Fit" preference alongside the text-size slider.
- When Fit is on, use Pretext (`prepareWithSegments` + `measureNaturalWidth`) to find the largest font size — capped at the slider value, floored at 12px — at which a representative line of the selected measure fits the available content width without wrapping.
- The Pretext-derived size drives `--reader-font-size`; the slider value remains the preferred/maximum size.
- Recompute on window resize and on any reader-preference change.
- Keep basic markdown rendering independent of Pretext: with Fit off (default), behavior is unchanged from issue 20.

## Acceptance Criteria

- With Fit off, the slider controls the rendered font size exactly as before.
- With Fit on in a window narrower than the selected measure at the preferred size, the rendered font size shrinks below the slider value, and the size readout shows the effective size.
- The Fit preference persists with the other reader preferences.
- The Pretext probe stats use the effective size, not the slider value.
- Electron smoke coverage verifies the rendered font size shrinks when Fit is enabled in a narrow window and restores when disabled.

## Comments

- 2026-06-09: Implemented on branch `pretext-font-size-control`. Added a persisted `fitTextSize` preference with a localized "Fit"/"Ajustar" toggle next to the size slider. When enabled, `computeFittedFontSize` builds a reference line of `measure` characters from the first paragraph, measures it with Pretext's `prepareWithSegments` + `measureNaturalWidth` in the selected font, and solves for the largest size (slider value max, 12px min) that fits the container content width; the result drives `--reader-font-size` and the size readout. Recomputes on window resize. The probe stats now use the effective size.
- 2026-06-09: Verification passed: `pnpm qa` (fmt, lint, knip, check, test) and `pnpm test:electron` twice. Electron smoke now shrinks the window to 480px, enables Fit, and verifies the rendered font size drops below the 22px slider value (observed 13px) with a matching readout, then restores 22px when Fit is disabled. One flaky first run timed out on the pre-existing line-number gutter check; three subsequent full runs passed.
