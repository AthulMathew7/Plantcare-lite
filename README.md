# PlantCareLite

PlantCareLite is an Android-first Expo/React Native application for on-device
classification of leaf photographs into 22 disease or healthy-condition classes
covering cassava, coconut, jackfruit, mango, and rice. The app pairs its
on-device prediction with a local disease-information catalog and locally saved
scan history.

## Problem and purpose

Plant symptoms can be difficult to distinguish, while connectivity and access
to specialist advice may be limited. PlantCareLite offers a convenient
photo-based first-look aid: select or capture a leaf image, run the bundled
model locally, inspect the predicted class and confidence, and consult
management information. It is intended for farmers, gardeners, students, and
demonstration/testing use—not as a confirmed agricultural diagnosis.

## Current capabilities

- Capture a photograph with the camera or choose one from the gallery.
- Check the image with a bundled MobileNetV3Small leaf-validation model before
  running the disease classifier. Non-leaf images are rejected and uncertain
  images prompt the user for a clearer photo.
- For images accepted as leaves, run the existing bundled MobileNetV3Large
  22-class ONNX classifier on-device.
- Present the top class, model confidence, catalog severity, and disease
  information.
- Browse/filter 22 disease and healthy-condition entries; expand one card at a
  time to read the complete information.
- Automatically save successful predictions and the actual source photograph
  to local SQLite-backed history; browse, inspect, flag uncertainty, and
  soft-delete/undo history entries.
- Use a persistent local Guest profile without Firebase configuration.
- Optionally sign up/sign in with Firebase Authentication and associate the
  Firebase identity with a local SQLite profile.
- Select Light or Dark appearance; the preference persists locally.

Cloud scan synchronization is **not implemented**. The Settings preference
and SQLite queue are scaffolding only; no uploader, server API, or cloud
history restore is present.

## Architecture at a glance

```text
Expo / React Native screens
  ├── capture and diagnosis navigation
  ├── disease catalog and local reference assets
  └── result/history with user's persisted scan image
       ├── leafValidationService → MobileNetV3Small ONNX leaf gate
       │    └── LEAF → inferenceService → MobileNetV3Large disease model
       ├── database service → expo-sqlite → plantcare.db
       ├── imageStorage → app documents/scans/
       ├── AuthContext → Firebase Authentication + local SQLite user
       └── ThemeContext → AsyncStorage preference
```

The disease reference photo is catalog content. A result hero and a History
thumbnail/detail use the actual image selected or captured for that scan; the
catalog photograph does not replace it. See
[assets and image handling](./docs/assets_and_images.md).

## Machine-learning model

The first stage loads `assets/models/leaf/leaf_classifier.onnx` through
`leafValidationService.js`. This MobileNetV3Small model returns a leaf
probability: at least 0.60 continues to the disease model, at most 0.40
rejects the image, and values between those thresholds request a clearer
image. The disease stage then loads `assets/models/plantcare/model.onnx`
through `inferenceService.js`, an unchanged MobileNetV3Large classifier for
22 disease/healthy classes. Both use 224 × 224 × 3 raw RGB 0–255 float32
inputs in `[1, 224, 224, 3]` NHWC layout. The leaf-validation feature does not
modify the disease classifier's preprocessing, tensor shape, class order,
output handling, or inference logic. See
[machine_learning.md](./docs/machine_learning.md) for the detailed contracts
and real-world evaluation limits.

## Data and identity

SQLite (`plantcare.db`, via `expo-sqlite`) stores local profiles, the seeded
disease catalog, scan records, settings, and the future-sync queue. Scan image
files are copied to the app documents `scans/` directory; thumbnails are
generated where supported. Firebase handles email/password identity only.
Firebase does not store scan records or photos. See [database.md](./docs/database.md)
and [authentication.md](./docs/authentication.md).

## Supported classes and reference photos

There are 22 classes in the model/catalog order: 5 Cassava, 2 Coconut,
3 Jackfruit, 8 Mango, and 4 Rice. Each class maps to a local bundled image.
Source/attribution notes—including four images supplied by the project owner
whose public license has not been verified—are maintained in
[disease_image_sources.md](./docs/disease_image_sources.md). The full ordered
catalog is documented in [disease_catalog.md](./docs/disease_catalog.md).

## Technology

| Area | Current implementation |
|---|---|
| App framework | Expo SDK `~57.0.26`, React Native `0.86.3`, React `19.2.3` |
| Navigation | React Navigation native stack and bottom tabs; custom floating tab bar |
| Local database | `expo-sqlite` |
| Inference | `onnxruntime-react-native`, bundled ONNX model, `jpeg-js` decoding |
| Camera/gallery | `expo-image-picker` |
| Image persistence/manipulation | Expo FileSystem legacy API, `expo-image-manipulator` |
| Authentication | Firebase Authentication email/password |
| Preferences | React Native AsyncStorage (Firebase auth persistence and theme) |
| UI | React Native, Lucide icons, Plus Jakarta Sans fonts |
| Tests/lint | Jest with `jest-expo`, ESLint |

Exact dependency declarations are in [package.json](./package.json).

## Setup and run

Prerequisites include Node.js/npm, Android Studio/Android SDK, a supported
Android device or emulator, and a custom development build for native ONNX
Runtime. Expo Go does not include that native module.

```powershell
# From the project root
npm install
npm run android
npm start
```

`npm run android` builds/runs the native development client; `npm start` starts
Expo in development-client mode. Camera and gallery use Android runtime
permissions. Firebase email/password actions additionally require the relevant
`EXPO_PUBLIC_FIREBASE_*` client configuration and an enabled provider in the
Firebase project. Guest/local diagnosis does not require that configuration.
See [development_setup.md](./docs/development_setup.md). No `.env.example`
currently exists; do not commit `.env.local` or credentials.

## Tests and builds

```powershell
# Project root
npm test -- --runInBand
npm run lint
npx expo export --platform android

# Android project directory
cd android
.\gradlew.bat assembleDebug
```

The test suite covers database behavior and migrations, disease metadata and
assets, inference contract, image persistence, result/history image behavior,
authentication, theme persistence, and screen interactions. See
[testing.md](./docs/testing.md) for the most recently run results and known
coverage gaps.

## Repository map

```text
App.js                         app providers, readiness, splash and status bar
src/screens/                   Welcome, Capture, Diagnosis, Result, History,
                               Settings and Auth
src/navigation/AppNavigator.js root stack, screen stacks and tab navigation
src/services/                  SQLite, authentication, leaf validation, disease inference, image storage
src/context/                   auth and appearance state
src/constants/                 colors, typography and 22-class catalog/image map
src/components/                shared visual components
assets/models/leaf/            bundled leaf-validation ONNX model
assets/models/plantcare/       bundled disease-classifier ONNX model and metadata
assets/diseases/               bundled disease-reference photographs
__tests__/                     Jest tests
docs/                          technical/project documentation
android/                       generated/native Android project and Gradle wrapper
```

The broader details are indexed in [project_structure.md](./docs/project_structure.md).

## Limitations and future work

This is a 22-class image classifier, not a substitute for laboratory diagnosis
or extension-service advice. Performance varies by class; the checked-in
training report shows materially weaker Cassava test-split performance than
the other crops. The supporting leaf-validation model also has a measured
real-world false-accept rate of 44% on the reported 50-image non-leaf sample;
it is not a guaranteed non-leaf detector. Image quality, lighting, angle,
background, symptoms outside the leaf, and field/domain differences can
affect predictions. Firebase login requires network access for credential
operations; local inference/catalog/history do not require Firebase. Scan
sync is not functional. See
[limitations.md](./docs/limitations.md) and
[future_scope.md](./docs/future_scope.md).

## Documentation

- [Application functionality](./docs/application_functionality.md)
- [System architecture and data-flow diagrams](./docs/system_architecture.md)
- [Technical report](./docs/PLANTCARE_LITE_TECHNICAL_REPORT.md)
- [Feature matrix](./docs/feature_matrix.md)
- [Machine learning](./docs/machine_learning.md)
- [Disease catalog](./docs/disease_catalog.md)
- [Database](./docs/database.md)
- [Authentication](./docs/authentication.md)
- [Offline architecture](./docs/offline_architecture.md)
- [Screen guide](./docs/ui_screens.md)
- [Assets and image handling](./docs/assets_and_images.md)
- [Image sources and attributions](./docs/disease_image_sources.md)
- [Testing](./docs/testing.md)
- [Development setup](./docs/development_setup.md)
- [Limitations](./docs/limitations.md)
- [Future scope](./docs/future_scope.md)

## License and attribution

No project-level license file is present, so this README does not assert a
license for the application as a whole. Image-level provenance and any
attribution requirements are documented separately. Dataset-level licenses
must not be assumed to apply to the project-owner-supplied photographs.

## Project status

The implemented Android-first application includes the local scan-to-result
flow, 22-class model/catalog, local history, optional Firebase Authentication,
and persistent Light/Dark appearance. Cloud synchronization, expert review,
and further on-device/field evaluation remain unimplemented or future work.
