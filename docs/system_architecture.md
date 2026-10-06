# System architecture

## High-level architecture

```mermaid
flowchart TD
  User --> ExpoUI[Expo / React Native UI]
  ExpoUI --> Nav[React Navigation root stack, nested stacks and tabs]
  Nav --> Screens[Welcome, Capture, Diagnosis, Result, History, Settings, Auth]
  Screens --> Contexts[AuthContext and ThemeContext]
  Screens --> Services[Application services]
  Services --> LeafValidation[leafValidationService]
  LeafValidation --> Prep[Shared image manipulation and RGB decoder]
  LeafValidation --> ORT[ONNX Runtime React Native]
  LeafValidation -->|LEAF| Inference[inferenceService]
  Inference --> Prep
  Inference --> ORT
  ORT --> LeafModel[Bundled assets/models/leaf/leaf_classifier.onnx]
  ORT --> Model[Bundled assets/models/plantcare/model.onnx]
  Services --> DB[database service / expo-sqlite]
  DB --> SQLite[(plantcare.db)]
  Services --> Storage[imageStorage / app documents]
  Storage --> Photos[User scan images and generated thumbnails]
  Screens --> Catalog[constants/diseaseInfo.js and bundled reference photos]
  Contexts --> Preferences[AsyncStorage]
  AuthContext --> Firebase[Firebase Authentication]
  AuthContext --> DB
  Tests[Jest tests] -. exercise .-> Screens
  Tests -. exercise .-> Services
```

## Layers and ownership

- **UI:** `src/screens/` contains Welcome, Capture, Diagnosis, Result, History,
  Settings, and Auth. `src/components/` contains reusable presentation
  elements and badges.
- **Navigation:** `src/navigation/AppNavigator.js` defines the root Welcome /
  Main / Auth stack, four bottom tabs, and nested Capture and History stacks.
  It owns the custom fixed floating tab bar.
- **Application state:** `AuthContext` coordinates Firebase state with local
  user-profile resolution. `ThemeContext` owns the explicit Light/Dark
  preference and palette.
- **Services:** `database.js` owns SQLite creation, migrations, seeding,
  profiles, scans, and settings. `leafValidationService.js` runs first and
  returns LEAF, NOT_LEAF, or UNCERTAIN. Only LEAF proceeds to
  `inferenceService.js`, which retains the existing disease-model loading,
  image tensor creation, inference, and class output. `imageStorage.js` copies
  images, creates thumbnails, and deletes individual image files. `authService.js`
  wraps Firebase Authentication. `historyNavigation.js` listens for History
  focus refreshes.
- **ML/data:** the leaf-validation ONNX model is bundled at
  `assets/models/leaf/leaf_classifier.onnx`; the unchanged 22-class disease
  ONNX model is bundled at `assets/models/plantcare/model.onnx`.
  `diseaseInfo.js` is the authoritative application metadata and local image
  map; SQLite is seeded/upserted from it. Reference photos live in
  `assets/diseases/`.
- **Persistence:** SQLite holds records/catalog/settings; app documents hold
  user images; AsyncStorage holds theme and Firebase's persisted auth state.
- **Validation:** Jest tests under `__tests__/` cover UI behavior, services,
  catalog and persistence contracts. Android is built with Expo prebuild
  configuration and the Gradle wrapper.

## Detection and scan/history data flow

```mermaid
sequenceDiagram
  actor User
  participant Capture as CaptureScreen
  participant Files as imageStorage
  participant Result as ResultScreen
  participant Gate as leafValidationService / leaf ONNX
  participant ML as inferenceService / disease ONNX
  participant DB as database.js / SQLite
  participant History as HistoryScreen

  User->>Capture: capture or select image
  Capture->>Files: persistScanImage(source URI)
  Files-->>Capture: app-documents URI
  Capture->>Result: navigate with actual imageUri
  Result->>Gate: validateLeaf(imageUri)
  alt NOT_LEAF
    Gate-->>Result: reject image and request a leaf photo
  else UNCERTAIN
    Gate-->>Result: request a clearer leaf image
  else LEAF
    Gate-->>Result: accepted leaf
    Result->>ML: runInference(imageUri)
    ML-->>Result: 22-class prediction and confidence
    Result->>DB: lookupDiseaseInfo(class)
    Result->>DB: automatically save successful scan
    DB->>Files: persist source and generate thumbnail
    DB-->>Result: scan record ID / save outcome
  end
  User->>History: open history
  History->>DB: load rows for active local user
  DB-->>History: scan paths and catalog display name
  History-->>User: actual scan thumbnail
  User->>History: open a saved item
  History->>Result: historyMode + stored original image_path
  Result-->>User: same actual scan image and stored prediction
```

Result's hero and History images originate from the scan record/URI. Catalog
reference photos are used for Diagnosis cards and are not substituted.

The leaf gate runs before disease inference and uses the existing shared image
preprocessing helper. It classifies probability >= 0.60 as LEAF, <= 0.40 as
NOT_LEAF, and intermediate values as UNCERTAIN. It is a preliminary
validation layer, not a guaranteed non-leaf detector. The gate does not alter
the disease model or its preprocessing, input tensor shape, output class
order, output handling, or inference logic.

## Authentication/local-profile flow

```mermaid
flowchart TD
  Start[App startup] --> LocalDB[Initialize SQLite and Guest profile]
  LocalDB --> Config{Firebase client config present?}
  Config -- No --> Guest[Continue as Guest using local profile]
  Config -- Yes --> FirebaseState[Restore Firebase Auth state]
  FirebaseState --> Signed{Firebase user?}
  Signed -- No --> Guest
  Signed -- Yes --> Link[Find or establish local users row by Firebase UID]
  Link --> Legacy{Unlinked Farmer profile has scans?}
  Legacy -- No --> NewProfile[Create or use account-scoped local profile]
  Legacy -- Yes --> Choice[Offer import/associate or keep separate]
  Choice -- Import --> LegacyLinked[Link legacy local profile to Firebase UID]
  Choice -- Separate --> NewProfile
  NewProfile --> Active[Make local profile active]
  LegacyLinked --> Active
  Guest --> Active
  Active --> LocalHistory[History queries remain local/profile-scoped]
```

Firebase authenticates identities; SQLite remains the application data store.
No Firebase scan upload or cloud history is represented.

## Database relationships

```mermaid
erDiagram
  users ||--o{ scan_history : owns
  disease_info ||--o{ scan_history : classifies
  scan_history ||--o{ sync_queue : queues
  app_settings {
    TEXT key PK
    TEXT value
  }
```

`app_settings` is a local key/value table and does not reference a user. The
actual columns, keys, and migration strategy are documented in
[database.md](./database.md).

## Important boundaries

- Firebase Authentication does not store local scan history or images.
- The sync queue is dormant scaffolding; there is no queue processor/server
  synchronization implementation.
- Disease reference assets and the ONNX model are bundled. User scan files are
  copied to the app's private documents directory where available.
- The app may request remote content for the Diagnosis decorative hero image;
  this does not affect local inference or bundled disease cards.
