# Authenticode Sign Windows Release

Status: ready-for-human

## Goal

Authenticode-sign the Windows build so testers and managed endpoints stop
hitting SmartScreen "unknown publisher" warnings and SentinelOne quarantine, and
so the binary carries a verifiable publisher identity.

## Background

`scripts/package-win.ts:6-7` ships unsigned by design ("recipients allowlist
them"). Issue #24 documented the friction (SmartScreen "Run anyway", S1
quarantine) and named Authenticode via Azure Trusted Signing on a Windows runner
as the medium-term answer. The release workflow builds `win32 / x64` on
`windows-latest` and publishes it unsigned.

## Tasks

- Choose a signing path: Azure Trusted Signing (no hardware token, cloud-based)
  is preferred over a traditional OV/EV cert on an HSM.
- Add a signing step to the Windows release job that runs `signtool` (or the
  Trusted Signing action) against `MarkRover.exe` before the PowerShell archive
  step.
- Store signing credentials as repo/environment secrets; do not expose them to
  fork PR runs (see CI prefs: gate fork PRs).
- Keep local `pnpm package:win` unsigned — signing is a CI/release-only concern.
- Verify the signed exe: `signtool verify /pa /v` passes and the publisher shows
  in the file properties / SmartScreen dialog.

## Acceptance Criteria

- A tagged release produces a `MarkRover.exe` with a valid Authenticode
  signature and a named publisher.
- SmartScreen shows the publisher rather than "unknown publisher" (reputation
  builds over time, but the signature is present and verifiable).
- Local cross-build from macOS still produces an unsigned test zip unchanged.

## Comments

- 2026-06-30: Filed alongside #25 (macOS). Continues the signing thread opened
  in #24. Requires human setup (Trusted Signing account / certificate, CI
  secrets), hence `ready-for-human`.
- 2026-06-30: Agent-doable scaffolding landed. `release.yml` gained a
  `Sign Windows binary (Azure Trusted Signing)` step using
  `azure/trusted-signing-action@v0.5.9`, running on the Windows job after
  Package and before the PowerShell archive, against
  `out\MarkRover-win32-<arch>\*.exe` with SHA256. It is gated on
  `env.AZURE_CLIENT_ID != ''`, so an unconfigured release still publishes the
  unsigned exe. Local `pnpm package:win` is untouched (comment in
  `scripts/package-win.ts` now points here). Remaining (human): set up Azure
  Trusted Signing, add the `AZURE_*` + `TRUSTED_SIGNING_*` secrets listed in
  `release.yml`, run a tagged release, and confirm `signtool verify /pa /v`
  plus the SmartScreen publisher. Stays `ready-for-human` until then.
