# Publishing LAG2

Edit lag2-course-app in the authoring folder. Set one higher semantic version in version.json, js/release.js, the welcome text, distribution/README.md and distribution/android/package.json; regenerate the Android lockfile and update RELEASE_NOTES.md.

Run node tools/prepare-release.cjs and node tools/check-release.cjs distribution/public. Review only the student export. Commit and push it from distribution/public to the existing public repository. Push the matching new vMAJOR.MINOR.PATCH tag. A main push alone does not publish.

The tag workflow verifies version consistency, builds and verifies the signed APK, packages the ZIP, creates a draft release, publishes Pages and then publishes the matching downloads. Check Actions, the live version.json and /releases/latest before sharing.

Never reuse a tag. Keep .private/android-signing backed up privately: Android updates need the same signing key and app ID. The student export intentionally excludes source photos, authoring archives, credentials and local test reports.
