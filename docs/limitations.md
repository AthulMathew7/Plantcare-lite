# Known limitations

## Model and image domain

- The MobileNetV3Small leaf-validation model at
  `assets/models/leaf/leaf_classifier.onnx` is a preliminary supporting layer,
  not a guaranteed non-leaf detector. In a 100-image real-world evaluation
  (50 leaf and 50 non-leaf images), 49/50 leaves were correctly accepted,
  while only 25/50 non-leaf images were correctly rejected; 22/50 non-leaf
  images were falsely accepted and 3/50 were uncertain. The observed
  non-leaf false-accept rate was **44%**. Held-out test performance does not
  establish real-world robustness.
- The classifier covers only the fixed 22 classes in its training label map;
  it cannot identify unlisted conditions or confirm absence of disease.
- The recorded test split reports overall accuracy around 85.89%, while
  Cassava is around 54.75%. These are dataset-specific metrics, not a promise
  of field accuracy or per-device performance.
- Output confidence is the model's largest class probability rounded to four
  decimals. The app does not apply an abstention threshold; confidence is not
  a guarantee of correctness.
- Center cropping can omit symptoms near the edge or on a different plant
  part. Focus, lighting, distance, angle, background, cultivar, growth stage,
  and field conditions can affect image classification.
- Disease lookalikes, mixed infections, nutrient disorders, pests, and
  non-leaf symptoms can fall outside model training assumptions.
- The displayed severity is catalog metadata, not severity inferred from the
  scan. Uncertainty marking is user-driven.

## Disease guidance and references

- Catalog descriptions and management tips are informational and not a
  diagnosis by an agricultural expert or a chemical-use prescription.
- Catalog photos are a single representative reference per class and do not
  capture all symptom variation. Four photos were supplied by the project
  owner without a public source/license assertion; provenance is recorded
  separately.
- The Diagnosis screen's decorative hero is a remote Unsplash asset, unlike
  the offline bundled class photos.

## Connectivity and sync

- Firebase sign-up/login require valid project configuration and connectivity.
- Firebase Auth is not scan backup. Scan history and photos are local.
- Sync UI preference and queue table are present, but upload, cloud restore,
  and cross-device synchronization are not implemented.

## Device/storage

- ONNX Runtime requires a custom native build; Expo Go cannot run the model.
- Original images and generated thumbnails use app-private document storage
  and consume device space. The current History deletion/clear actions are
  soft deletes and do not implement permanent local purge.
- Physical-device coverage and inference latency vary by device and have not
  been represented as validated here.

## Scope

The UI is Android-first, with Expo iOS scripts/configuration but no documented
equivalent iOS-device validation. There is no in-app expert consultation,
weather service, automatic treatment prescription, or working cloud backend.
