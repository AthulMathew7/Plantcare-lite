# Testing and validation

## Test framework and coverage

Tests use Jest, `jest-expo`, and `react-test-renderer`; `jest.setup.js` mocks
AsyncStorage. Test files currently cover:

| Area | Test file(s) | Coverage examples |
|---|---|---|
| Disease metadata/image map | `diseaseInfo.test.js` | 22 catalog classes, metadata/image completeness, ordering and unique local image resolution |
| Diagnosis UI | `diagnosisScreen.test.js` | Card count, expand/collapse, class-specific info and image UI |
| Inference contract | `inferenceService.test.js` | Preprocessing inputs, model output mapping/validation and confidence result |
| SQLite | `database.test.js`, `migrationsAndFeatures.test.js` | Database setup, local records, migration and feature behavior |
| Scan image persistence | `imageStorage.test.js` | Persistent image copy, thumbnail behavior and file URI handling |
| Result and scan saving | `resultScreenSave.test.js` | Automatic scan save, actual scan hero image, catalog image not substituted |
| History | `historyImage.test.js`, `historyFocus.test.js` | Actual thumbnail/original image usage and focus refresh |
| Authentication | `authService.test.js`, `authContext.test.js`, `settingsNavigation.test.js` | Firebase adapter/persistence, Guest and account/profile state, Auth navigation |
| Theme and Settings | `themeContext.test.js`, `settingsNavigation.test.js` | Default Light, immediate toggle, AsyncStorage persist/restore and Settings control |
| Other component/utilities | `SeverityBadge.test.js`, `colors.test.js`, `dateUtils.test.js` | Severity labels, palette tokens and date formatting |

These are automated tests, including mocked/native-boundary tests. They do not
replace Android-device validation, real Firebase project validation, or
agricultural field evaluation.

## Latest validation run

Run in project root:

```powershell
npm test -- --runInBand
```

**16 suites and 65 tests passed** in the latest validated run for this
documentation update. Tests were rerun after the docs were written.

Android export:

```powershell
npx expo export --platform android
```

**Passed.** Metro reported the 22 local disease JPEGs in the Android export.

Debug APK:

```powershell
# From android/
.\gradlew.bat assembleDebug
```

**Passed**; Gradle reported `BUILD SUCCESSFUL` and generated the debug APK.

ESLint is available as `npm run lint`. The most recently checked result exited
successfully with zero errors and 174 warnings. Lint is not one of Jest's
test suites.

## Physical-device validation

**Pending/not verified by this repository run.** No connected-device test
evidence is checked in. The current environment did not have `adb` available,
so camera/gallery permissions, theme behavior after a physical restart, and
on-device model latency were not manually checked as part of this task.

## Gaps

- Jest does not constitute real-device ONNX performance or image-quality
  evaluation.
- The UI tests use component rendering and mocked platform/database services.
- Firebase flows are not a substitute for testing against a configured
  Firebase project and network.
- No automated test proves the absent synchronization worker; no such worker
  is implemented.
- No field study or expert-label validation is represented by the test suite.
