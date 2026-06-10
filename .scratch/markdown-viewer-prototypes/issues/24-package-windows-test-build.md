# Package Windows Test Build

Status: completed

## Goal

Get a runnable Windows x64 test copy of Mark Rover into a tester's hands (Elise, Windows 11 x64) without standing up Windows build infrastructure.

## Tasks

- Add `pnpm package:win` cross-packaging win32-x64 from macOS.
- Share packaging staging logic between the mac and win scripts.
- Produce a transfer-ready zip with no macOS metadata entries.
- Document the unsigned-binary realities (SmartScreen, SentinelOne) and the manual file-association path for testers.

## Acceptance Criteria

- `pnpm package:win` produces `out/MarkRover-win32-x64.zip` containing a PE32+ x64 `MarkRover.exe` with the render worker unpacked from the asar.
- The zip extracts cleanly on Windows (no `__MACOSX` entries).
- Signing strategy for managed Windows endpoints is decided or explicitly deferred.

## Comments

- 2026-06-10: Added `scripts/package-win.ts` and a shared `scripts/stage-app.ts` (staging extracted from `package-mac.ts`). Cross-packaging works from macOS: the ditto unzip patch runs on the build machine and extracts the win32 Electron prebuilt fine, and packager v20 uses pure-JS `resedit` for exe metadata (no Wine). `win32metadata` stamps ProductName/FileDescription for Task Manager and the SmartScreen dialog. Output verified: PE32+ x86-64 GUI executable, `resources/app.asar.unpacked/dist/main/render-worker.cjs` present, 144 MB zip via `zip(1)` (ditto would sequester `__MACOSX` metadata). Not runnable locally — tester verification is the smoke test. Known unsigned-binary friction on managed endpoints: SmartScreen "More info → Run anyway", and SentinelOne may quarantine; short-term answer is an S1 console exclusion (hash or path), medium-term is Authenticode signing (Azure Trusted Signing) on a Windows runner.
