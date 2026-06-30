# Mark Rover

Mark Rover is a local markdown reader focused on fast file opening, safe rendering, and comfortable long-form reading.

## Run

```sh
pnpm install
pnpm dev -- tests/corpus/smoke.md
```

## Verify

```sh
pnpm check
pnpm test
pnpm test:electron
```

## Package

```sh
pnpm package:mac     # macOS arm64      -> out/MarkRover-darwin-arm64/MarkRover.app
pnpm package:win     # Windows x64      -> out/MarkRover-win32-x64.zip
pnpm package:linux   # Linux arm64 + x64 -> out/MarkRover-linux-*.tar.gz
```

`@electron/packager` downloads the prebuilt Electron for the target, so any host can cross-package any target (only the macOS ad-hoc code signature has to run on macOS).

## Releases

GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) builds every platform on its native runner and publishes a GitHub Release when a version tag is pushed:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Targets: macOS arm64, Windows x64, Linux arm64, and Linux x64. The archives attach to a Release with auto-generated notes. You can also run the workflow manually from the **Actions** tab to dry-run the build matrix without publishing. Binaries are unsigned (macOS gets an ad-hoc signature); recipients allowlist them on first launch.

## Notes

- `tests/corpus/` contains markdown documents used to test rendering, security, performance, and reader ergonomics.
- `.prototype/` is intentionally ignored. It contains historical Prototype Candidates and can be deleted when no longer needed.
- The app is written in TypeScript and uses Electron, Svelte, Tailwind, `markdown-it`, `sanitize-html`, Mermaid lazy rendering, and an optional Pretext typography probe.
- Type-checking spans three projects: `tsconfig.json` (Svelte renderer, via `svelte-check`), `tsconfig.node.json` (main process, worker, preload, build scripts), and `tsconfig.test.json` (Playwright smoke tests). Run them all with `pnpm typecheck`.
- Scripts and tests run directly as `.ts` via Node's native type stripping (Node 24+); no separate transpile step is needed for them.

## Fonts and glyph coverage

Mark Rover bundles no fonts; it relies on platform font fallback, with explicit emoji fonts appended to every reader stack (`Apple Color Emoji` on macOS, `Segoe UI Emoji` on Windows, `Noto Color Emoji` on Linux).

- **macOS**: the system resolves missing glyphs through its full fallback cascade (Hiragino for CJK, Geeza Pro for Arabic, SF Hebrew, Kohinoor for Indic). Coverage is effectively complete out of the box.
- **Windows**: Yu Gothic/Microsoft YaHei/Malgun Gothic cover CJK, Segoe UI covers Arabic/Hebrew, Nirmala UI covers Indic. Coverage is complete on default installs.
- **Linux**: coverage depends on installed font packages; distributions without `fonts-noto` (or equivalent) may show tofu boxes for less common scripts. This is a packaging concern, not an app bug.

`tests/corpus/non-english-glyphs.md` covers Latin extended, Greek, Cyrillic, CJK, Arabic, Hebrew, Indic, emoji, symbols, ligatures, and glyph-heavy code. `pnpm test` asserts these characters survive worker rendering and sanitization byte-for-byte and that no U+FFFD replacement characters appear in any rendered corpus output. True tofu detection (a glyph present in the text but missing from every installed font) still requires visual inspection per platform.

## Text direction

Direction is inferred from content, not configured. The render worker applies a first-strong-character heuristic (UAX #9) per block: paragraphs, headings, and list items vote on the document direction, which the renderer applies to the whole document via `dir` on the article. Blocks that oppose the document direction get an explicit `dir` attribute; table cells get a direction but do not vote, so a large LTR data table cannot flip an RTL document. Code blocks are always left-to-right (CSS `direction: ltr` on `pre`), and blockquote/heading accents mirror automatically through CSS logical properties. Representative samples live in `tests/corpus/rtl-mixed.md` and are asserted by `pnpm test`.
