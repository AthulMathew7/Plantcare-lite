# Application functionality

This document describes behavior currently implemented in `src/`. Source
references are authoritative if behavior changes.

## 1. Startup and onboarding

`App.js` loads Plus Jakarta Sans fonts and wraps the UI in gesture, safe-area,
theme, authentication, and navigation providers. The root waits for SQLite
initialization/onboarding status, auth readiness, and the AsyncStorage theme
read before rendering navigation and hiding the splash screen. An un-onboarded
installation begins at Welcome; Get Started writes `has_onboarded` in
`app_settings` and replaces Welcome with Main.

## 2. Guest mode and authentication

`AuthProvider` initializes SQLite and a local Guest profile first. If Firebase
configuration is absent or Firebase initialization fails, the app enters Guest
mode. Email/password sign-up and login call Firebase Authentication. Firebase
auth state is restored by its React Native AsyncStorage persistence and
resolved to a local `users` row keyed by Firebase UID.

When a Firebase identity is new and the legacy Farmer profile has scans, the
auth flow offers to associate that local profile/history with the Firebase
identity or create a separate local profile. Logout signs out of Firebase,
clears the active local-user pointer, and activates the local guest profile;
neither path uploads/deletes scan data. The exact association behavior is
described in [authentication.md](./authentication.md). Credential operations
require Firebase configuration and network access.

## 3. Home, camera, and gallery

The Capture tab is the main/home screen. It presents camera and gallery
actions, a photo preview, and a dismissible capture-quality tip. Camera and
library access use `expo-image-picker` permissions. After selection, the
image URI is copied through `persistScanImage` into the app documents
`scans/` directory when possible; the app navigates to Result with that
persistent URI. Cancellation leaves the user on Capture. Permission, picker,
or persistence errors are shown with alerts.

## 4. Preprocessing and inference

For a new scan, `ResultScreen` first calls `validateLeaf(imageUri)` from
`leafValidationService.js`. The service loads
`assets/models/leaf/leaf_classifier.onnx` with ONNX Runtime React Native,
uses the existing `preprocessImage` helper to center-crop to square, resize to
224 × 224, decode RGB, and build a float32 `[1, 224, 224, 3]` NHWC tensor
containing raw 0–255 RGB values. Probability >= 0.60 is LEAF, <= 0.40 is
NOT_LEAF, and a value between the thresholds is UNCERTAIN. A NOT_LEAF result
shows a rejection message; UNCERTAIN asks the user for a clearer leaf image.
Neither proceeds to disease inference.

Only LEAF proceeds to the existing `inferenceService.js`, which resolves
`assets/models/plantcare/model.onnx` and applies that model's unchanged
preprocessing, tensor shape, class order, output handling, and inference
logic. Its input is also 224 × 224 RGB raw 0–255 float32. The model output is
checked for 22 values, finite non-negative probabilities, and a sum
approximately equal to one. The maximum output index maps to the fixed class
order; returned confidence is the winning value rounded to four decimal
places. Leaf validation does not modify this disease classifier. See
[machine_learning.md](./machine_learning.md).

The validation and inference services throw when an image cannot be
processed, the native ONNX module/model cannot load, or output validation
fails. Result displays a loading state, then a diagnosis or a rejection,
clearer-image, or failure message with retry/back actions. Both model stages
run locally and do not require internet.

## 5. Result and disease information

Result displays the original supplied scan image as its hero, class/display
name, crop, catalog severity, confidence, symptoms, cause, recommended care,
prevention, and cure status. Disease content comes from the local SQLite
`disease_info` catalog seeded from `src/constants/diseaseInfo.js`. It does not
replace the scan hero with the disease-reference image.

Result offers sharing, flag-as-uncertain, and a fixed action bar. Successful
inference triggers automatic history saving; Save is also available if the
automatic save did not complete. Save failures are surfaced for retry. A
flag is persisted in `is_uncertain`; if the record is still being saved, the
flag is carried into that save. In `historyMode`, inference and scan actions
are skipped/hidden and the record's stored result is displayed. The hero
continues to use the history record's original `image_path`.

## 6. Diagnosis catalog

Diagnosis loads all 22 SQLite disease entries. Filter pills select All, Rice,
Cassava, Coconut, Jackfruit, or Mango. Cards show a local disease reference
photo, display name, crop, and short description. Tapping expands the selected
card to show overview, symptoms, cause/pathogen, treatment/management,
prevention, and cure status; tapping again collapses it. Only one class is
expanded at a time, using React Native `LayoutAnimation`. A fixed bottom tab
bar remains in place; the scroll content includes clearance padding.

The catalog's local reference photograph is illustrative reference content,
not the image submitted for a scan. All 22 catalog entries currently have a
bundled image mapping. Provenance distinctions are in
[disease_image_sources.md](./disease_image_sources.md).

## 7. Automatic scan persistence and History

`saveScanToHistory` ensures the scan URI is in app documents, attempts a
150 × 150 compressed JPEG thumbnail, and inserts `image_path`,
`image_thumbnail_path`, class, confidence, uncertainty, model version, and
active local profile ID into SQLite. Thumbnail failure is tolerated; the
original scan image remains the source. Saved rows are local.

History is scoped to the active local profile, ordered newest first, grouped
by relative date, and refreshed on focus or pull-to-refresh. Thumbnails use
`image_thumbnail_path` with `image_path` fallback; opening an item navigates
to a history-mode Result using `image_path`. Swipe-to-delete sets `deleted_at`
(soft delete) and shows a timed Undo action; restore clears that timestamp.
The Settings clear-history action also soft-deletes that profile's visible
rows. The UI does not implement permanent purge of database rows or scan
files.

## 8. Settings and theme

Settings shows account status/sign-out or a login action, Light/Dark
appearance, a sync preference, offline AI/model information, app version,
clear-history action, and app information. The sync preference is stored in
SQLite and, when enabled, causes future scans to be entered into `sync_queue`.
No sync worker/backend is implemented.

`ThemeContext` supports explicit `light` and `dark` modes. It restores
`@plantcare/theme` from AsyncStorage before the navigator appears. Changing
the Settings switch updates mounted components and writes the new preference;
an AsyncStorage write error is logged/notified and reverts the state. Theme
colors are consumed across the principal screens, shared components, status
bar, navigation container, and custom tab bar. Disease and scan photos remain
unfiltered photographs.

## 9. Database, migration, and catalog seed

SQLite is opened as `plantcare.db`; foreign-key enforcement is enabled.
`createTables`, `migrateDatabase`, and `seedDatabase` run during database
initialization. Migrations inspect table columns and add missing profile,
scan, and disease metadata columns; a unique index is created for Firebase
UIDs. The migration also replaces old `mock-v0` model-version values with
`legacy-unknown`. There is no numbered migration ledger. The 22 authoritative
metadata rows are upserted from `diseaseInfo.js` at initialization. See
[database.md](./database.md).

## 10. Synchronization and network usage

No scan/history upload or cloud restore is implemented. `synced` defaults to
false; `sync_queue` records future work when the preference is enabled, and
`getSyncQueue` can read eligible queue rows. No service consumes that queue.
Core catalog, inference, and SQLite history do not require internet.

Firebase sign-up/sign-in require Firebase service access. In addition, the
Diagnosis hero currently loads a remote Unsplash plant photo; this decorative
banner may be unavailable offline. The class-specific disease photos are
bundled locally. See [offline_architecture.md](./offline_architecture.md).

## 11. Navigation

The root stack contains Welcome, Main, and modal Auth. Main contains four
bottom tabs: Capture (nested stack CaptureHome → Result), Diagnosis, History
(nested stack HistoryList → HistoryDetail), and Settings. A History item opens
HistoryDetail in history mode; the custom floating tab bar stays attached to
Main tabs. Full route and screen detail: [ui_screens.md](./ui_screens.md).

## Error handling and limits

Image picker/camera, database writes, inference, auth, and history operations
surface alerts, error text, or logs as implemented. Firebase auth messages
are mapped to user-facing guidance. The classifier and the accompanying
agricultural guidance are informational aids, not professional diagnosis or
prescriptions. No individual treatment should be inferred beyond the
catalog's cautious extension/label language.
