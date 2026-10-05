# PlantCare Lite — Model Card

**Run ID:** 20261004_020840
**Backbone:** mobilenetv3large
**Crops:** Rice, Cassava, Mango, Jackfruit, Coconut
**Classes:** 22

## Dataset
- Train: 17034 images
- Validation: 3650 images
- Test: 3651 images
- 4 Kaggle sources: compiled Rice+Cassava dataset, standalone Mango/Jackfruit/Coconut
- Rambutan evaluated and dropped: no usable public dataset found
- Rubber dropped: its Mendeley dataset requires a manual download and was unavailable
- Coconut limited to 2 leaf-based classes (Gray Leaf Spot, Leaf Rot) — the dataset's
  other 3 classes (Bud Root Dropping, Bud Rot, Stem Bleeding) are not leaf symptoms

## Training
- Two-phase transfer learning: frozen head (15 epochs) then
  fine-tuning of the last 30 backbone layers (6 epochs)
- Mixed precision (float16), cosine LR schedule with warmup, AdamW optimizer
- Label smoothing (0.1), per-sample class weighting, MixUp augmentation (alpha=0.2)

## Results
- **Overall test accuracy:** 0.8589
- **Weighted F1:** 0.8579
- **Per-crop accuracy:** {
  "rice": 0.9872537659327926,
  "cassava": 0.5475070555032926,
  "mango": 0.995,
  "jackfruit": 0.9881481481481481,
  "coconut": 0.9733333333333334
}

## TFLite variants
{
  "dynamic": {
    "size_kb": 3703.421875,
    "test_accuracy": 0.85,
    "avg_inference_ms": 66.88835022003332,
    "p95_inference_ms": 97.86238605020115
  },
  "float16": {
    "size_kb": 6833.75390625,
    "test_accuracy": 0.858,
    "avg_inference_ms": 22.234696019950206,
    "p95_inference_ms": 35.48546090069067
  },
  "int8": {
    "size_kb": 3914.4453125,
    "test_accuracy": 0.7,
    "avg_inference_ms": 65.85431539991987,
    "p95_inference_ms": 94.06058455024322
  }
}

## Files in this export
- `plantcare_model.keras` — full Keras model
- `model_dynamic.tflite`, `model_float16.tflite`, `model_int8.tflite` — TFLite variants (int8 may be absent if conversion failed)
- `label_map.json` — class index -> class name, for the app to consume
- `class_weights.json`, `evaluation_metrics.json`, `run_summary.json`
- `class_distribution.png`, `sample_grid.png`, `training_curves.png`, `confusion_matrix.png`, `confidence_calibration.png`, `gradcam_examples.png`
