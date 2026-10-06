# Module boundaries

This document describes current code boundaries. It does not assert current
individual ownership, staffing, or delivery dates.

| Module | Primary files | Responsibility |
|---|---|---|
| App startup and navigation | `App.js`, `src/navigation/` | Provider composition, readiness, routes, stacks and fixed tab bar |
| Screens and components | `src/screens/`, `src/components/` | User workflows and shared UI |
| Theme | `src/context/ThemeContext.js`, `src/constants/colors.js` | Explicit Light/Dark palette and persisted appearance preference |
| Authentication/profile | `src/context/AuthContext.js`, `src/services/authService.js` | Firebase identity, local SQLite profile association, Guest state |
| Local storage | `src/services/database.js`, `src/services/imageStorage.js` | SQLite schema/data and scan image files |
| ML/inference | `src/services/inferenceService.js`, `assets/models/plantcare/model.onnx` | Image preprocessing, ONNX execution and fixed output map |
| Catalog/assets | `src/constants/diseaseInfo.js`, `assets/diseases/` | Disease content and bundled reference photographs |
| Testing/docs | `__tests__/`, `docs/` | Regression checks and technical documentation |

The former version of this file listed proposed module owners, timelines,
TFLite, and a planned backend. Those were planning notes and are not evidence
of current ownership or implemented cloud synchronization.
