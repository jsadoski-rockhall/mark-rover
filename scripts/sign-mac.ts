import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

// Signs MarkRover.app, choosing the strongest signature the environment allows:
//
//   - With APPLE_SIGNING_IDENTITY: a hardened-runtime Developer ID signature
//     (required for notarization and for Gatekeeper to launch the app on a Mac
//     that did not build it). If notarization credentials are also present, the
//     app is notarized and stapled.
//   - Without it: an ad-hoc signature. LaunchServices refuses to persist a
//     default-handler claim ("Always open with") for an unsigned app, so .md
//     association silently falls back to the previous default; ad-hoc is enough
//     to make that stick locally. Gatekeeper still blocks ad-hoc-signed apps on
//     other Macs — that is expected for local builds.
//
// The release workflow sets APPLE_SIGNING_IDENTITY (and notary credentials) for
// real signing; everything else falls through to the ad-hoc path unchanged.
export async function signMacApp(appPath: string): Promise<void> {
  const identity = process.env.APPLE_SIGNING_IDENTITY;

  if (!identity) {
    await execFileP("codesign", ["--force", "--deep", "-s", "-", appPath]);
    return;
  }

  // Hardened runtime + a secure timestamp are notarization prerequisites. We
  // sign --deep for simplicity; if notarytool later rejects a nested helper for
  // a missing entitlement, switch to @electron/osx-sign, which signs each
  // embedded binary inside-out with the right entitlements.
  await execFileP("codesign", [
    "--force",
    "--deep",
    "--options",
    "runtime",
    "--timestamp",
    "--entitlements",
    resolve("build/entitlements.mac.plist"),
    "-s",
    identity,
    appPath
  ]);

  await notarizeMacApp(appPath);
}

// Notarizes and staples an already-signed app using an App Store Connect API
// key (the credential set the issue prefers). No-ops with a warning when the
// notary credentials are absent, so a Developer ID-signed-but-not-notarized
// build still completes — useful when iterating on signing alone.
async function notarizeMacApp(appPath: string): Promise<void> {
  const apiKey = process.env.APPLE_API_KEY;
  const apiKeyId = process.env.APPLE_API_KEY_ID;
  const apiIssuer = process.env.APPLE_API_ISSUER;

  if (!apiKey || !apiKeyId || !apiIssuer) {
    console.warn(
      "Signed with Developer ID, but notarization credentials " +
        "(APPLE_API_KEY / APPLE_API_KEY_ID / APPLE_API_ISSUER) are not set — " +
        "skipping notarization. The app is signed but not notarized."
    );
    return;
  }

  // notarytool takes an archive, not a .app bundle; stapler then writes the
  // ticket back into the bundle on disk, which the workflow archives as the
  // published asset.
  const notaryZip = `${appPath}.notarize.zip`;
  await rm(notaryZip, { force: true });
  await execFileP("ditto", ["-c", "-k", "--keepParent", appPath, notaryZip]);
  await execFileP("xcrun", [
    "notarytool",
    "submit",
    notaryZip,
    "--key",
    apiKey,
    "--key-id",
    apiKeyId,
    "--issuer",
    apiIssuer,
    "--wait"
  ]);
  await execFileP("xcrun", ["stapler", "staple", appPath]);
  await rm(notaryZip, { force: true });
}
