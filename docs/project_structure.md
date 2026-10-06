# Project structure

The application entry and active Expo/React Native source are at repository
root and under `src/`.

```text
App.js
index.js
app.json
package.json / package-lock.json
plugins/
  withOnnxruntimePackage.js
src/
  components/          reusable UI pieces, badges, empty/loading states
  constants/           design tokens, disease metadata and static image map
  context/              auth/profile state and Light/Dark theme state
  navigation/           root, tab, Capture and History navigation
  screens/              Welcome, Capture, Diagnosis, Result, History,
                        Settings and Auth
  services/             SQLite, Firebase Auth, leaf validation, disease
                        inference, image files, history focus subscription
  utils/                relative date formatting
assets/
  diseases/             local disease-reference JPEGs and supplied originals
  models/leaf/          leaf_classifier.onnx validation model
  models/plantcare/     disease model.onnx and training/evaluation artifacts
__tests__/               Jest suites
docs/                    project and technical documentation
android/                 generated/native Android app and Gradle wrapper
ml_pipeline/, Model/      model-related project artifacts
design/, presentation/,
uml/                     design, presentation, and diagram resources
```

## Key source files

| Path | Responsibility |
|---|---|
| `App.js` | Loads fonts, wraps providers, waits for app/auth/theme readiness and chooses onboarding start route |
| `src/navigation/AppNavigator.js` | Welcome/Main/Auth root stack, tab bar and nested Capture/History stacks |
| `src/services/leafValidationService.js` | Preliminary leaf validation before disease classification |
| `src/services/inferenceService.js` | Existing disease-model loading, image preprocessing, ONNX execution, output validation and class mapping |
| `src/services/database.js` | SQLite schema creation/migration/seeding, profile and history operations |
| `src/services/authService.js` | Firebase Authentication client adapter |
| `src/services/imageStorage.js` | Persistent scan file copy, thumbnail generation, file deletion helpers |
| `src/constants/diseaseInfo.js` | Authoritative 22-class metadata and local reference-image mapping |
| `src/context/AuthContext.js` | Firebase state to active local profile coordination |
| `src/context/ThemeContext.js` | Light/Dark palette and AsyncStorage persistence |
| `assets/models/leaf/leaf_classifier.onnx` | Bundled MobileNetV3Small leaf-validation model |
| `assets/models/plantcare/model.onnx` | Bundled MobileNetV3Large 22-class disease-classification model |
| `docs/` | Current implementation documentation |

`assets/models/plantcare/` includes training/evaluation outputs as well as the
runtime ONNX file. The React Native service loads only the ONNX file.

## Configuration and build files

`app.json` declares Expo metadata, permissions, plugins and Android package
identifier. `plugins/withOnnxruntimePackage.js` supplies native ONNX-related
configuration. `android/` contains the Android native project and wrapper.
`.gitignore` excludes local `.env*` files except `.env.example`, but an
`.env.example` is not currently present.

The repository also contains a root-level `app/` Android source tree and
other legacy/design/training artifacts. The supported app commands and Expo
entry point are controlled by root `package.json`, `index.js`, `App.js`, and
`app.json`; verify a legacy artifact's consumers before treating it as an
active application module.
