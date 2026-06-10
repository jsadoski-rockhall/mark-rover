# Temporary branch notes — issue 15 (package and file open)

> Temporary note per experiment protocol. Delete before merging.

## What works on this branch (verified 2026-06-10)

- `pnpm package:mac` produces `out/MarkRover-darwin-arm64/MarkRover.app` with
  **asar and pruning enabled**. Root cause of all earlier stalls was
  `extract-zip@2.0.1` hanging under Node 24; fixed via
  `patches/@electron__packager.patch` (extracts with macOS-native `ditto`).
- The render worker is unpacked via `asar: { unpack: "**/render-worker.cjs" }`.
- CLI file open works packaged; `first_viewport_ready` ≈ 284 ms vs ≈ 262 ms dev.
- **`.md` file association is now implemented and event-verified:**
  - `CFBundleDocumentTypes` (md/markdown/mdown, `net.daringfireball.markdown`)
    and a stable `appBundleId` (`org.markrover.prototype`) land in Info.plist.
  - `src/main/main.ts` handles `app.on("open-file")` for all three macOS
    delivery cases: before `ready` (cold Finder launch — path is stashed and
    used instead of argv), while running (document re-renders in place, window
    title updates), and after all windows are closed (a window is recreated).
  - Verified against the packaged app via LaunchServices `open` events, which
    are the same `odoc` events Finder sends on double-click: warm path
    (running app received `smoke.md` and swapped the document in place,
    single instance) and cold path (launched with `code-heavy.md`, rendered
    it instead of the welcome screen).

## What still needs a human (~5 minutes)

The only unverified link is Finder/Gatekeeper itself:

1. Copy `out/MarkRover-darwin-arm64/MarkRover.app` to `/Applications`.
2. First launch: right-click → Open (the bundle is unsigned, so a plain
   double-click warns).
3. Double-click a `.md` file in Finder (or right-click → Open With →
   MarkRover) and confirm the document loads.
4. Repeat with the app already running, and once more after closing the
   window but not quitting.

## Follow-ups beyond this issue

- The ditto patch is darwin-only; make it conditional before Windows/Linux
  packaging.
- Bundle is ~261 MB, dominated by lazy Mermaid/katex/cytoscape chunks in
  `dist/renderer`; audit before distribution.
- Code signing/notarization is untouched — required before anyone else can
  run the app without Gatekeeper friction.
- This branch predates the issue 08/12/13 merges; merge main back in (or
  rebase) before landing.
