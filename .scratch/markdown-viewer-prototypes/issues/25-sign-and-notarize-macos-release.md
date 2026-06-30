# Sign and Notarize macOS Release

Status: ready-for-human

## Goal

Replace the ad-hoc macOS signature with a real Developer ID signature plus
Apple notarization so MarkRover.app launches on other Macs without Gatekeeper
blocking it, and so the `.md` default-handler claim ("Always open with") sticks.

## Background

`scripts/package-app.ts:68` currently ad-hoc signs (`codesign -s -`). That is
enough for local use but is rejected by Gatekeeper on any machine that did not
build it, and LaunchServices will not persist a default-handler claim for an
ad-hoc-signed app. The release workflow (`.github/workflows/release.yml`) builds
the `macos-14 / darwin / arm64` target and publishes it with no signing step.

## Tasks

- Obtain an Apple Developer ID Application certificate and an app-specific
  password / notarization credentials (App Store Connect API key preferred).
- Add a hardened-runtime Developer ID signing step to `packageApp` (or a
  release-only path) gated on the signing identity being present, so local
  builds still fall back to ad-hoc.
- Notarize and staple the `.app` (`notarytool submit --wait` + `stapler staple`).
- Wire signing/notarization secrets into the release workflow's macOS job
  (certificate, keychain setup, notarization credentials) without exposing them
  to fork PR runs (see CI prefs: gate fork PRs).
- Verify the published zip: `spctl -a -vvv` and `codesign --verify --deep
--strict` pass on a clean Mac.

## Acceptance Criteria

- A tagged release produces a notarized, stapled `MarkRover.app` that opens on a
  Mac that never built it, with no Gatekeeper override.
- "Always open .md with MarkRover" persists across relaunch.
- Local `pnpm package:mac` without signing credentials still succeeds via the
  ad-hoc fallback.

## Comments

- 2026-06-30: Filed alongside #26 (Windows). Signing is entirely outstanding
  across the release workflow; macOS currently ad-hoc only. Requires human
  setup (Apple Developer account, certificates, notarization secrets), hence
  `ready-for-human`.
- 2026-06-30: Agent-doable scaffolding landed. `scripts/package-app.ts` now
  signs via a credentials-gated `signMacApp`/`notarizeMacApp` pair: hardened
  Developer ID + notarize/staple when `APPLE_SIGNING_IDENTITY` and the API-key
  notary creds are present, ad-hoc fallback otherwise (local
  `pnpm package:mac` unchanged). Added `build/entitlements.mac.plist` (JIT /
  unsigned-exec-mem / library-validation for Chromium). `release.yml` gained a
  gated keychain-setup step, signing env on Package, and a `spctl` +
  `codesign --verify` step, all gated on `MACOS_CERTIFICATE` presence.
  Remaining (human): create the Developer ID cert + App Store Connect API key,
  set the seven `MACOS_*`/`APPLE_*` secrets listed in `release.yml`, run a
  tagged release, and verify on a clean Mac. Acceptance criteria can only be
  confirmed once real credentials exist, so this stays `ready-for-human`.
