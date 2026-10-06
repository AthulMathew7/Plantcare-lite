# PlantCareLite — Technical Report

## 1. Executive summary

PlantCareLite is an Android-first Expo/React Native app for offline-capable
classification of leaf images into a fixed 22-class, five-crop set. It runs a
bundled MobileNetV3Large ONNX model locally, presents catalog-backed
information, and stores scan history and photographs on the device. Firebase
Authentication is optional and is used for email/password identity only;
there is no implemented cloud history synchronization.

## 2. Project overview

The application targets farmers, gardeners, students, and demonstration users
who need a convenient preliminary plant-leaf assessment in low-connectivity
settings. Users can capture/select a leaf photo, view a class/confidence and
management guidance, and revisit local scan records. Results are informational
and are not professional diagnoses.

## 3. Problem statement

Identifying visible plant symptoms can be difficult and specialist
connectivity may be limited. A local photo classifier and locally available
reference information can provide an accessible first-look aid. It cannot
confirm disease or replace expert assessment.

## 4. Objectives

- Provide a camera/gallery-to-result mobile flow.
- Keep inference and disease metadata available locally.
- Preserve scan records and actual scan photographs on-device.
- Offer optional authenticated identity while retaining Guest operation.
- Present class-specific reference and management information.
- Support persistent explicit Light and Dark appearance.

## 5. Scope

The implemented classifier covers 22 ordered classes in Cassava, Coconut,
Jackfruit, Mango, and Rice. The app includes onboarding, Capture, Diagnosis,
Result, History, Settings, Guest mode, and Firebase email/password auth.
There is no cloud scan backup/sync, remote diagnostic API, expert consultation,
or model-based severity classifier.

## 6. Target users

The app is designed for farmers, gardeners, learners, and reviewers as a
preliminary visual aid. It should not be used as the sole basis for crop
treatment or pesticide decisions.

## 7. Functional requirements and status

Implemented functions include onboarding, guest profile activation, optional
Firebase email/password login/signup/logout, image capture/library selection,
on-device prediction, local disease information, automatic scan saving,
History/soft-delete/undo, manual uncertainty flagging, and theme preference.
Sync preference and queue storage exist but transfer is not implemented.
See [feature_matrix.md](./feature_matrix.md) for status by feature.

## 8. Non-functional requirements and characteristics

- Local model/catalog/history operation without an application server.
- Native Android build for ONNX Runtime.
- Persistent local SQLite data and app-document image files.
- Firebase credential flow when configured.
- Fixed class ordering across model output and catalog.
- Local explicit theme preference.
- Automated Jest regression coverage.

These implementation properties do not imply a production service-level
guarantee, a field-accuracy guarantee, or complete offline availability of
every decorative asset/auth operation.

## 9. Technology stack

Expo SDK `~57.0.26`, React Native `0.86.3`, React `19.2.3`, React Navigation
6 packages, `expo-sqlite`, `onnxruntime-react-native`, `expo-image-picker`,
Expo FileSystem/ImageManipulator, Firebase JS Authentication, AsyncStorage,
Lucide React Native, Plus Jakarta Sans, Jest/jest-expo, and ESLint. See root
`package.json` for declared ranges/exact versions.

## 10. System architecture

The UI/navigation, application services, persistence, and bundled asset
layers are described in [system_architecture.md](./system_architecture.md).
The main data boundaries are:

- Screens invoke inference, database, image-storage, auth, and theme services.
- Inference consumes the user's image and bundled ONNX model.
- SQLite owns user profiles, scan rows, catalog metadata, onboarding and sync
  preference/queue.
- App documents contain user's scan images and thumbnails.
- Firebase owns credential/session identity only.
- AsyncStorage stores the theme mode and Firebase SDK authentication
  persistence.

## 11. Application workflow

At startup, the app loads fonts, database/onboarding state, auth readiness, and
theme preference. Welcome appears on first use. Main's Capture flow copies a
camera/gallery image where possible and passes its URI to Result. Result runs
inference, reads disease metadata, and automatically saves successful
predictions. History reads records for the active local profile and opens a
history-mode Result with stored class/confidence and original image URI.

## 12. UI architecture

`App.js` composes Gesture Handler, Safe Area, Theme, Auth, Navigation, and
application readiness. `src/screens/` owns route screens;
`src/components/` owns reusable controls and presentation. The theme provider
offers two palettes and `useThemedStyles` maps legacy static screen styles to
the selected palette. See [ui_screens.md](./ui_screens.md).

## 13. Navigation

Root stack: Welcome, Main, modal Auth. Main tabs: Capture (nested
CaptureHome/Result), Diagnosis, History (nested HistoryList/HistoryDetail),
and Settings. A custom floating tab bar remains fixed. History detail is a
Result route with `historyMode` and stored scan data.

## 14. Authentication architecture

`authService.js` wraps Firebase email/password signup, login, logout, current
user and auth-state subscription, with React Native AsyncStorage persistence.
`AuthContext` turns Firebase identity into an active local SQLite profile.
No app backend stores scan data. Further detail: [authentication.md](./authentication.md).

## 15. Guest mode

SQLite Guest profile creation/activation is independent of Firebase. Its ID
is persisted in `app_settings.guest_user_id`; scan queries use the active
local profile. If the old Farmer profile is associated with an account, Guest
uses a separate unlinked profile. Guest operation remains available when
Firebase is unconfigured.

## 16. Database architecture

`database.js` opens `plantcare.db` via `expo-sqlite`, enables foreign keys,
creates tables, applies additive schema changes, and upserts the disease
catalog. Five tables are present: `users`, `disease_info`, `scan_history`,
`sync_queue`, and `app_settings`. Full columns/relationships:
[database.md](./database.md).

## 17. SQLite schema and migration

`users.id`, `disease_info.class_name`, `scan_history.id`, `sync_queue.id`, and
`app_settings.key` are primary keys. Scan rows reference users and disease
classes; queue entries reference scan rows. There is a unique index on
`users.auth_provider_id`; the service creates no explicit scan-history
indexes. Migration logic uses `PRAGMA table_info`, adds missing columns and
creates that unique index; it has no schema-version ledger and does not clear
tables. Old `mock-v0` scan model values are normalized to `legacy-unknown`.

## 18. Disease catalog

The ordered disease metadata array in `src/constants/diseaseInfo.js` is
authoritative; SQLite mirrors it at startup. Each entry contains class key,
display name, crop, image key, overview/short description, symptoms, cause,
treatment, prevention, cure status, and severity. The complete ordered list
and documented summaries are in [disease_catalog.md](./disease_catalog.md).

## 19. ML model

The mobile runtime model is `assets/models/plantcare/model.onnx`, described
as MobileNetV3Large. It is loaded with ONNX Runtime React Native. Training,
evaluation and TFLite artifacts in the repository are not loaded by the
mobile app. Model details/limitations: [machine_learning.md](./machine_learning.md).

## 20. Inference pipeline

The service center-crops to square, resizes to 224 × 224, decodes RGB, builds
float32 raw 0–255 NHWC input `[1, 224, 224, 3]`, executes the ONNX session,
checks output count/probabilities, maps the winning index to one of 22 class
keys, and rounds the maximum output to four decimals for `confidence`.
Inference is local. Do not change the preprocessor or order independently of
the model.

## 21. Image processing

`expo-image-manipulator` probes dimensions and crops/resizes the scan;
`jpeg-js` decodes RGB. The actual scan URI is the inference input. The
independent image-storage service copies source files to app documents and
creates best-effort thumbnails.

## 22. Result generation

Result displays the actual scan photo, model class/confidence, and catalog
severity/details. Catalog severity is static metadata, not predicted. Invalid
inference shows a retry/back error state. Result may be shared and manually
flagged uncertain.

## 23. Scan persistence

Successful prediction invokes automatic `saveScanToHistory`, writing scan
image paths, class, confidence, uncertainty, timestamp/model version, and
active local `user_id`. A manual Save/retry control is also present. A
thumbnail failure does not prevent the original scan from being stored.

## 24. History

History lists non-soft-deleted rows for the active profile, newest first,
grouped by relative date. It displays the saved thumbnail or original image;
opening a row passes the original image to Result in history mode. Swipe
delete and Settings clear-history mark rows deleted; Undo restores a row.
These are soft deletes, not physical purge.

## 25. Offline architecture

The bundled model, SQLite catalog/history, user images, Guest mode, and
class-reference photos are local. Firebase sign-up/login require network and
configuration. Diagnosis's decorative hero uses a remote Unsplash URI. No
cloud sync is implemented. See [offline_architecture.md](./offline_architecture.md).

## 26. Settings

Settings shows profile/auth action, Dark Mode, local sync preference, model
and version information, clear-history confirmation, and About copy. Sync
preference is SQLite-backed but sync is inactive. Theme persists via
AsyncStorage key `@plantcare/theme`.

## 27. Dark mode

ThemeContext defaults to Light and asynchronously restores `light`/`dark`
from AsyncStorage before the application navigator renders. The Settings
switch updates theme state immediately and persists it. Major screens,
navigation, and common controls use theme-aware palette/styles; photographic
assets are not recolored. See `src/context/ThemeContext.js`.

## 28. Disease reference images

There is one bundled reference mapping per class. Dataset-sourced image
author/license and attribution records are in
[disease_image_sources.md](./disease_image_sources.md). The four
project-owner-supplied photos have no asserted public license. A disease
reference photo belongs to Diagnosis/catalog; it is not a user's scan image.

## 29. Error handling

Inference failures appear in Result with retry/back controls. Camera/gallery
and image-copy failures use alerts. Database/profile errors are surfaced by
service errors and screen alerts. Firebase errors are mapped to explanatory
messages. Thumbnail creation is best effort; History falls back to original
photo. Some decorative/share errors are not surfaced uniformly; see source
before relying on error UX.

## 30. Testing

Jest/jest-expo tests cover catalog/assets, Diagnosis interactions, inference,
SQLite/migrations, file persistence, auto-save and actual scan images,
History, auth/local profile behavior, theme restore/persistence, and utility
components. The current documented validation is 16 suites/65 tests, Expo
Android export passed, and Gradle debug build passed. Physical-device
verification remains pending. See [testing.md](./testing.md).

## 31. Build process

Install/start and export commands run from repository root; `.\gradlew.bat
assembleDebug` runs from `android/`. ONNX Runtime requires native Android
build support, not Expo Go. Details: [development_setup.md](./development_setup.md).

## 32. Security and privacy

Scan images, SQLite history, and local profiles reside in app-private local
storage. Firebase client configuration is read from `EXPO_PUBLIC_FIREBASE_*`
variables; no service-account private key belongs in this app. Firebase does
not receive scan history in current code. Local env files are ignored by
`.gitignore`, and `.env.example` is currently absent. Local image files and
database are not cloud-backed by this implementation.

## 33. Limitations

The classifier is bounded by its 22 classes and image training domain.
Confidence is not calibrated field certainty; Cassava test-split performance
is comparatively low. Photo framing/quality and visual similarity matter.
There is no cloud sync or field-expert validation in this report. Full list:
[limitations.md](./limitations.md).

## 34. Future scope

Potential future work includes stronger external/field evaluation, improving
Cassava performance, more reviewed disease classes/guidance, translations,
device validation, and a deliberately designed secure sync service. These are
not implemented features. See [future_scope.md](./future_scope.md).

## 35. Current project status

The repository contains an implemented local scan/classification/history
application with optional Firebase Auth and persistent Dark Mode. The
runtime ONNX model and local class catalog are packaged. No project-level
license file was found in the audited root, and the app's sync UI remains
nonfunctional scaffolding. Automated checks pass as recorded in
[testing.md](./testing.md); physical-device checks are pending.

## 36. Conclusion

PlantCareLite currently delivers an offline-capable local classification and
history workflow with optional online identity. Documentation must preserve
the key boundaries: catalog reference photographs versus actual user scans,
Firebase authentication versus local SQLite application data, and stored
sync queue entries versus working synchronization. The model is an
informational classifier and should not be treated as expert diagnosis.
