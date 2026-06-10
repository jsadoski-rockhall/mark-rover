# Audit Non-English Character and Glyph Rendering

Status: completed

## Goal

After the app is stabilized, ensure rendered markdown has robust coverage for non-English characters and special glyphs.

## Notes

This may primarily be a font audit, but the investigation should verify whether the app needs additional bundled fonts, better fallback font stacks, or renderer-level changes.

## Tasks

- Build or collect a small corpus covering Latin extended characters, diacritics, CJK, Cyrillic, Greek, emoji, symbols, ligatures, and uncommon markdown-adjacent glyphs.
- Audit the current viewer font stack and fallback behavior across supported platforms.
- Identify tofu boxes, missing glyphs, incorrect shaping, clipping, line-height issues, and code block rendering problems.
- Decide whether to rely on platform fonts, bundle additional fonts, or provide document/viewer font controls.
- Capture screenshots or automated visual checks for representative samples.

## Acceptance Criteria

- The app renders representative non-English text and glyph-heavy markdown without missing glyph boxes in normal prose and code blocks.
- Font fallback behavior is documented for each supported platform.
- Any required font additions or viewer settings are implemented or split into follow-up issues.

## Comments

- 2026-06-01: Created `.prototype/16-glyph-audit` by copying forward successful bundled-packaging prototype 16 without reusing the occupied `.prototype/16` directory. Added `corpus/non-english-glyphs.md` covering Latin extended text, Greek, Cyrillic, CJK, Arabic, Hebrew, Devanagari, emoji, symbols, ligatures, and code glyphs. Added `scripts/glyph-audit.mjs` and wired it into `pnpm test` to verify glyph text survives worker rendering and sanitization without replacement characters.
- 2026-06-01: Verification passed: `pnpm check`, `pnpm test`, and escalated `pnpm test:electron`. One-iteration benchmark on `corpus/non-english-glyphs.md` emitted `first_viewport_ready` around 249 ms. Caveat: this proves character preservation and app rendering paths, but true tofu-box detection still needs OS-specific visual inspection or screenshot comparison.
- 2026-06-09: Implemented in the consolidated app (the prototype glyph-audit work had never been folded in). Added `tests/corpus/non-english-glyphs.md` covering Latin extended, Vietnamese stacking diacritics, Greek, Cyrillic, CJK, Arabic, Hebrew, Devanagari, Tamil, emoji (including ZWJ sequences and flags), math/currency symbols, ligatures, Arabic shaping, and glyph-heavy code. `pnpm test` now asserts 17 representative samples survive worker rendering and sanitization byte-for-byte, and that no U+FFFD replacement characters appear in any rendered corpus output. Appended explicit emoji font fallbacks (`Apple Color Emoji`, `Segoe UI Emoji`, `Noto Color Emoji`) to all six reader font stacks and the code font so emoji never fall through to a glyphless last-resort font on Windows/Linux. Documented per-platform fallback behavior in README (macOS/Windows complete on default installs; Linux depends on `fonts-noto` or equivalent). Verified: `pnpm qa`, `pnpm test:electron`, bench with no regression. Remaining caveat unchanged: true tofu detection requires per-platform visual inspection; no bundled fonts were added.
- 2026-06-09: Renumbered from 16 to 21 to resolve a duplicate issue number introduced by a branch merge. `16-bundle-main-and-worker-for-packaging.md` keeps the original number since it closed with `.prototype/16` and is referenced as "prototype 16" by issues 17 and 18; this issue's prototype was already namespaced as `.prototype/16-glyph-audit` for the same reason. Content is otherwise unchanged.
