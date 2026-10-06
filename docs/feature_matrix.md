# Feature matrix

| Feature | Status | Main implementation |
|---|---|---|
| First-run Welcome/onboarding | Implemented | `WelcomeScreen.js`, `database.js` (`has_onboarded`) |
| Guest mode | Implemented | `AuthContext.js`, local `users` profile |
| Email/password sign-up/login | Implemented, requires Firebase configuration/network | `AuthScreen.js`, `authService.js` |
| Firebase auth session persistence | Implemented | Firebase React Native persistence using AsyncStorage |
| Firebase identity ↔ local SQLite profile | Implemented | `AuthContext.js`, `database.js` |
| Camera/gallery image selection | Implemented | `CaptureScreen.js`, `expo-image-picker` |
| Persistent scan image copy | Implemented | `imageStorage.js` |
| 22-class local ONNX prediction | Implemented | `inferenceService.js`, `model.onnx` |
| Automatic successful-scan saving | Implemented | `ResultScreen.js`, `database.js` |
| Local scan History and original photo | Implemented | `HistoryScreen.js`, `ResultScreen.js`, `scan_history` |
| Local disease catalog/reference photos | Implemented | `diseaseInfo.js`, `disease_info`, `assets/diseases/` |
| Diagnosis filters/expandable cards | Implemented | `DiagnosisScreen.js` |
| Manual uncertain flag | Implemented | `ResultScreen.js`, `scan_history.is_uncertain` |
| Soft-delete/undo History | Implemented | `database.js`, `HistoryScreen.js` |
| Light/Dark toggle and persistence | Implemented | `ThemeContext.js`, `SettingsScreen.js`, AsyncStorage |
| Sync preference | Implemented as local preference only | Settings + `app_settings.sync_enabled` |
| Sync queue storage | Implemented as scaffolding only | `sync_queue`, `getSyncQueue` |
| Upload scans/cloud restore | Not implemented | No uploader/backend/restore service found |
| Diagnosis decorative online banner | Implemented, network-dependent | Remote image URI in `DiagnosisScreen.js` |
| Physical-device validation | Pending/not evidenced by automated suite | No checked-in device report |

There are 18 rows whose status begins with **Implemented**. This count
includes conditional Firebase functionality, local-only sync preference/queue
scaffolding, and a network-dependent decorative banner; it does **not** mean
18 independent user workflows or that scan synchronization works.
