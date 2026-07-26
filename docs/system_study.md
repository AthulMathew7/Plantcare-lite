# System Study — Feasibility Analysis

## 1. Technical feasibility

MobileNetV2 is lightweight enough for mobile inference, and TensorFlow Lite with
quantization keeps the model under ~10 MB after conversion. React Native paired
with a native TFLite bridge gives cross-platform reach from a single codebase.
SQLite handles offline-first local storage reliably, without requiring a
persistent network connection for core functionality.

Key technical risks and mitigations:

| Risk | Mitigation |
|---|---|
| On-device inference too slow on low-end phones | Use quantized (int8/float16) TFLite model; benchmark inference time during training pipeline |
| Model size too large for app bundle | Dynamic-range or int8 quantization; restrict initial scope to 2–3 crop types |
| Camera/gallery permissions vary by OS version | Use React Native's standard permission libraries and test across Android versions |

## 2. Economic feasibility

The project uses free and open resources throughout:

- **Dataset:** PlantVillage (open, freely available via Kaggle)
- **Frameworks:** TensorFlow, React Native, SQLite — all open-source
- **Training compute:** Google Colab (free tier is sufficient for a MobileNetV2
  transfer-learning job at this scope)
- **Optional cloud sync:** can run on free-tier hosting (e.g. Firebase free tier)

No paid APIs or licenses are required for the core diagnostic functionality,
keeping the project viable within a student budget.

## 3. Operational feasibility

The app is designed for low-connectivity environments common in rural farming
areas — all core functionality (capture, diagnosis, history) works fully
offline. The interaction model requires minimal input from the user: take or
select a photo, and receive a result. Diagnoses are explained in plain
language with actionable treatment steps rather than raw model output, so no
technical or agricultural expertise is required to use the app effectively.

Adoption risk is low because the app doesn't require behavior change beyond
what a user already does (photographing a plant) — it simply adds a
diagnostic step to that existing action.

## Summary

| Dimension | Verdict |
|---|---|
| Technical | Feasible — proven lightweight architecture (MobileNetV2 + TFLite) |
| Economic | Feasible — entirely open-source/free-tier resources |
| Operational | Feasible — low learning curve, works offline by design |
