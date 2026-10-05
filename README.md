# PlantCare Lite

Offline-first plant disease detection app for **Rice** and **Cassava** crops.  
Point your phone at a leaf → get an instant diagnosis with treatment recommendations.

> **Status:** The app runs on-device inference with the PlantCare ONNX model.

---

## Features

- **Capture** — take a photo or pick from gallery
- **Diagnosis** — (mock) classifies 10 disease classes across Rice & Cassava
- **History** — browse past scans with status dots and relative timestamps
- **Settings** — sync preference, clear history, app info
- **Offline** — scans stored in local SQLite; photos copied into app documents

## Design system

| Token | Hex | Usage |
|---|---|---|
| Forest (primary) | `#2C5F2D` | Buttons, headers, accent |
| Moss (primary light) | `#97BC62` | Switch tracks, highlights |
| Moss light (bg tint) | `#E4EEDB` | Screen backgrounds |
| Ink (text) | `#1E2A1E` | Headings, body text |
| Secondary text | `#5F5E5A` | Hints, subtitles, dates |
| Border | `#D8DED8` | Dividers, input outlines |
| Coral (alert) | `#D85A30` | Low-confidence badges, warnings |

Rounded corners (10–14 px), soft card shadows, generous whitespace.

## Quick start

```bash
# 1. Install JS dependencies
npm install

# 2. Build and install the custom Android development client (needs Android SDK)
npm run android

# 3. Start Metro for the custom development client
npm start

# Web
npm run web
```

ONNX Runtime is a native module, so scanning will not work in Expo Go. Use the
custom development client installed by `npm run android`. Rebuild it after
adding or changing native modules. iOS is not the primary target (Android-first)
but `npm run ios` builds the custom client if Xcode is set up.

## Project structure

```
App.js                              # Root: gestures, safe area, DB init
index.js                            # Expo registerRootComponent
src/
  constants/
    colors.js                       # Design system palette
    diseaseInfo.js                  # 10-class seed data (5 Rice + 5 Cassava)
  services/
    database.js                     # SQLite: schema, CRUD, lookups
    imageStorage.js                 # Persist scan photos in app documents
    inferenceService.js             # Mock inference stub (swap for TFLite)
  components/
    PrimaryButton.js                # Filled forest-green button
    SecondaryButton.js              # Outlined button
    ConfidenceBadge.js              # Color-coded confidence pill
    DiseaseCard.js                  # Image + diagnosis + description
    HistoryListItem.js              # Scan history row
    EmptyState.js                   # Empty list placeholder
    LoadingSpinner.js               # Centered loading indicator
    ImagePreview.js                 # Capture area / image display
  screens/
    CaptureScreen.js                # Home: camera/gallery + preview
    ResultScreen.js                 # Inference result + treatment + save
    HistoryScreen.js                # Past scans list
    SettingsScreen.js               # App info, sync, clear history
  navigation/
    AppNavigator.js                 # Bottom tabs + nested Capture stack
```

## Architecture notes

### Navigation

```
BottomTabNavigator
├── Capture → NativeStackNavigator
│   ├── CaptureHome (default)
│   └── Result (pushed after scan)
├── History (tab)
└── Settings (tab)
```

Tapping a history item navigates cross-tab into the Capture stack's Result
screen with `historyMode: true` — inference is skipped and action buttons
are hidden. Tapping the Capture tab returns to CaptureHome.

### Database (SQLite)

Tables: `users`, `scan_history`, `disease_info`, `sync_queue`, `app_settings`.  
See [database_schema.md](./database_schema.md) for full schema and column details.

`disease_info` is auto-seeded on first launch with 10 disease classes.
Scan images are copied into the app documents directory before insert.

### On-device inference

`src/services/inferenceService.js` preprocesses images and runs the bundled
ONNX model through `onnxruntime-react-native`. It exports:

```ts
runInference(imageUri: string) → Promise<{
  diseaseClass: string,
  confidence: number,
  crop: string,
  condition: string,
  modelVersion: string
}>
```

This native runtime requires a custom development or production build; Expo Go
does not include its native module.

## Key dependencies

| Package | Purpose |
|---|---|
| `expo` ~57 | Tooling and native modules |
| `react-native` 0.86 | Core framework |
| `@react-navigation/*` v6 | Bottom tabs + nested stacks |
| `expo-sqlite` | Local SQLite database |
| `expo-image-picker` | Camera + gallery access |
| `expo-file-system` | Persistent scan photo copies |
| `react-native-gesture-handler` | Swipe-to-delete and navigation gestures |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen containers |

## License

TBD — internal project for now.
