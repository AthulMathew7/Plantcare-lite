# Machine-learning system

## Verified model artifacts

- Mobile architecture recorded by the model card: MobileNetV3Large
  (`mobilenetv3large` backbone).
- Mobile inference artifact: `assets/models/plantcare/model.onnx`.
- Runtime: `onnxruntime-react-native`.
- Runtime version in `package.json`: `^1.24.3`.
- Model release identifier in the app: `plantcare-v1.0`.
- The checked-in model card identifies ONNX opset 14.
- The runtime loads a packaged Expo asset into a local URI and creates a
  cached `InferenceSession`.

Training Keras/TFLite files and evaluation artifacts are also in the
repository's model-data directory, but the app inference service specifically
loads the ONNX artifact. It does not run the Keras or TFLite files.

## Input and preprocessing contract

`preprocessImage(imageUri)` performs the following steps:

1. Reads source dimensions through Expo ImageManipulator.
2. Center-crops the shorter image dimension to make a square.
3. Resizes that square to 224 × 224.
4. Encodes/reads JPEG bytes and decodes them through `jpeg-js`.
5. Drops the alpha channel, preserving RGB order.
6. Copies raw channel values into a float32 array without app-side scaling.
7. Creates an ONNX tensor with type `float32` and shape `[1, 224, 224, 3]`
   (NHWC).

Thus the app supplies RGB values in the **0–255** range. Repository
diagnostic comments attribute normalization to MobileNetV3 internal
preprocessing; no separate normalization is performed in the app. This
contract must stay aligned with the exported model.

## Output, mapping, and confidence

The service reads the model's first output and requires exactly 22 values.
Every value must be finite and non-negative, and their sum must be within
`1e-3` of 1. The winning class is the index with the greatest output value.
The returned `confidence` is that winning value formatted to four decimal
places. The service does not apply a top-class rejection threshold or compute
an independent calibration at runtime. Result's displayed match percentage
is a rounded presentation of that value.

The exact immutable output order is:

| Index | Class key |
|---:|---|
| 0 | `Cassava___Bacterial_Blight` |
| 1 | `Cassava___Brown_Streak_Disease` |
| 2 | `Cassava___Green_Mottle` |
| 3 | `Cassava___Healthy` |
| 4 | `Cassava___Mosaic_Disease` |
| 5 | `Coconut___Gray_Leaf_Spot` |
| 6 | `Coconut___Leaf_Rot` |
| 7 | `Jackfruit___Algal_Leaf_Spot` |
| 8 | `Jackfruit___Black_Spot` |
| 9 | `Jackfruit___Healthy` |
| 10 | `Mango___Anthracnose` |
| 11 | `Mango___Bacterial_Canker` |
| 12 | `Mango___Cutting_Weevil` |
| 13 | `Mango___Die_Back` |
| 14 | `Mango___Gall_Midge` |
| 15 | `Mango___Healthy` |
| 16 | `Mango___Powdery_Mildew` |
| 17 | `Mango___Sooty_Mould` |
| 18 | `Rice___Bacterial_Blight` |
| 19 | `Rice___Blast` |
| 20 | `Rice___Brown_Spot` |
| 21 | `Rice___Tungro` |

`DISEASE_CLASSES` in `src/services/inferenceService.js` is used to map
indices to class keys. `assets/models/plantcare/label_map.json` and
`run_summary.json` contain the same order. The disease metadata seed order is
also checked by catalog tests. Do not reorder classes independently of model
output indices.

## Prediction flow and failures

`runInference` resolves the native runtime, loads/caches the model session,
preprocesses the URI, executes the first model input/output, validates the
output, selects the maximum class, splits its key into crop and condition,
and returns class, confidence, crop, condition, and model version. Missing
native ONNX support, missing model path, image decode/preprocess errors,
missing output, invalid probabilities, or wrong output count throw errors.
Result shows a failure state and retry option.

## Training/test evidence and interpretation

The checked-in model evaluation reports a test split of 3,651 samples
(17,034 training and 3,650 validation samples in the run summary), overall
test accuracy `0.85894` (about 85.89%) and weighted F1 `0.85795`. Per-crop
test accuracy recorded there is:

| Crop | Test split accuracy |
|---|---:|
| Rice | 0.98725 |
| Cassava | 0.54751 |
| Mango | 0.99500 |
| Jackfruit | 0.98815 |
| Coconut | 0.97333 |

These values are dataset split metrics from the checked-in evaluation
artifacts, not independent production-device or real-world field estimates.
In particular, Cassava performance is substantially weaker in that split.
No claim is made that a phone achieves those same metrics. No inference-time
severity calculation exists: severity is catalog metadata in SQLite. User
uncertainty is a separate manual History flag.

## Offline execution

The model and runtime are packaged with the custom native app; inference uses
the local image and bundled model without a network call. Expo Go lacks the
required native ONNX module, so use a development/production native build.
