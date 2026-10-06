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
replace real Firebase project validation or agricultural field evaluation.
The leaf-model Android integration evidence below is a separate physical
device test, not an automated Jest test.

## Latest validation run

Run in project root:

```powershell
npm test -- --runInBand
```

The recorded successful application validation completed **16 suites and 65
tests**. This documentation-only update did not modify application code or
rerun the application test suite.

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

The existing successful validation results also include authentication,
SQLite history, disease inference, dark mode, Android build/export, and
validation of the disease model's 22-class output contract.

ESLint is available as `npm run lint`. The most recently checked result exited
successfully with zero errors and 174 warnings. Lint is not one of Jest's
test suites.

## Physical-device validation

**Leaf-model Android integration: successful.** On a physical Android device:

- The leaf ONNX model loaded successfully; the ONNX session input was
  `input` and output was `leaf_prob`.
- Leaf validation executed before disease inference.
- When the leaf model returned LEAF, the existing disease model subsequently
  executed successfully.
- Disease inference continued to produce the existing 22-class output, and
  history saving continued to work.

This confirms integration and inference sequencing, not strong real-world
leaf detection. Broader physical-device checks such as camera/gallery
permissions, restart behavior, and performance across devices are not
established by this integration result.

## Gaps

- Jest does not constitute real-device ONNX performance or image-quality
  evaluation.
- The UI tests use component rendering and mocked platform/database services.
- Firebase flows are not a substitute for testing against a configured
  Firebase project and network.
- No automated test proves the absent synchronization worker; no such worker
  is implemented.
- The real-world leaf-model evaluation below is limited to 100 images and is
  not a large independent field study or expert-label validation.

## Leaf-model real-world evaluation

In the reported 100-image real-world evaluation, there were 50 leaf images
and 50 non-leaf images. The model correctly accepted 49/50 leaf images.
Among the 50 non-leaf images, it correctly rejected 25, falsely accepted
22, and classified 3 as uncertain. The observed false-accept rate on
non-leaf images was therefore **44% (22/50)**. This result does not support
describing the model as a guaranteed non-leaf detector or as having perfect
real-world accuracy. The model performed well on its held-out test set, but
that result is not evidence of real-world robustness.
