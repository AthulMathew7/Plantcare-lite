# Offline-first behavior

PlantCareLite supports the core classification/history loop locally, but the
entire application is not fully offline.

## Available without a network

- **Inference:** the bundled leaf-validation ONNX model runs first; only an
  image classified as LEAF proceeds to the bundled 22-class disease model.
  Both execute through the native ONNX Runtime module using the local image.
- **Catalog:** 22 disease/healthy entries are seeded into SQLite from the
  bundled catalog definition.
- **Reference photos:** 22 class images are included as bundled local assets.
- **History:** scan rows and user image files live in local SQLite/app
  documents, scoped to a local profile.
- **Guest usage:** local Guest mode does not require Firebase configuration.
- **Appearance/onboarding:** theme preference is in AsyncStorage; onboarding
  and sync preference are in SQLite.

## Network-dependent or potentially unavailable offline

- Firebase email/password sign-up and login require configured Firebase
  Authentication and service connectivity.
- The Diagnosis screen's decorative banner uses an Unsplash remote URI and
  may not render without connectivity. It is separate from the 22 bundled
  disease photographs.
- Expo/npm dependency installation and builds require the relevant package
  and Android toolchain access.

## No implemented cloud synchronization

The sync preference is persisted in `app_settings`. When enabled,
`saveScanToHistory` adds newly saved records to `sync_queue`; `getSyncQueue`
can read queue rows. There is no network uploader, backend endpoint, conflict
resolution, upload retry process, or cloud restore. `scan_history.synced`
defaults to false. The UI itself describes cloud sync as coming soon.

## Offline boundaries

Offline inference does not guarantee that every visual element or identity
operation works offline. The app can continue using local data as Guest, but
Firebase identity operations should be considered online-only. Firebase
configuration is not necessary for Guest mode.
