/**
 * PlantCare Lite — Production Inference Service
 *
 * Runs on-device machine learning inference using the newly trained
 * MobileNetV3 model (22 classes across 5 crops: Cassava, Coconut,
 * Jackfruit, Mango, Rice).
 *
 * Model assets:
 *   - Model file: models/plantcare/model.onnx (opset 14, 224x224x3 NHWC input)
 *   - Label mapping: models/plantcare/label_map.json
 */

import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';

export const MODEL_VERSION = 'plantcare-v1.0';

/**
 * All 22 classes recognized by the trained ML model, ordered exactly
 * by output index (0 to 21) matching label_map.json.
 */
export const DISEASE_CLASSES = [
  'Cassava___Bacterial_Blight',
  'Cassava___Brown_Streak_Disease',
  'Cassava___Green_Mottle',
  'Cassava___Healthy',
  'Cassava___Mosaic_Disease',
  'Coconut___Gray_Leaf_Spot',
  'Coconut___Leaf_Rot',
  'Jackfruit___Algal_Leaf_Spot',
  'Jackfruit___Black_Spot',
  'Jackfruit___Healthy',
  'Mango___Anthracnose',
  'Mango___Bacterial_Canker',
  'Mango___Cutting_Weevil',
  'Mango___Die_Back',
  'Mango___Gall_Midge',
  'Mango___Healthy',
  'Mango___Powdery_Mildew',
  'Mango___Sooty_Mould',
  'Rice___Bacterial_Blight',
  'Rice___Blast',
  'Rice___Brown_Spot',
  'Rice___Tungro',
];

function getOnnxRuntime() {
  if (
    !NativeModules.Onnxruntime ||
    typeof NativeModules.Onnxruntime.install !== 'function'
  ) {
    throw new Error(
      'ONNX Runtime is not installed in this app binary. Build and open the PlantCare development client with "npm run android"; Expo Go does not include this native module.',
    );
  }

  return require('onnxruntime-react-native');
}

let _session = null;
let _previousInputFingerprint = null;

const FINGERPRINT_SAMPLE_COUNT = 16;
const FLOAT_LOG_SAMPLE_COUNT = 12;

function createInputFingerprint(inputData, imageUri, mean, min, max) {
  let hash = 2166136261;
  const sample = [];

  for (let i = 0; i < inputData.length; i++) {
    const quantizedValue = Math.round((inputData[i] + 1) * 1_000_000);
    hash = Math.imul(hash ^ quantizedValue, 16777619);

    if (i % Math.max(1, Math.floor(inputData.length / FINGERPRINT_SAMPLE_COUNT)) === 0
      && sample.length < FINGERPRINT_SAMPLE_COUNT) {
      sample.push(inputData[i]);
    }
  }

  return {
    imageUri,
    mean,
    min,
    max,
    hash: (hash >>> 0).toString(16).padStart(8, '0'),
    sample,
  };
}

function logInputFingerprint(inputData, imageUri, mean, min, max) {
  const current = createInputFingerprint(inputData, imageUri, mean, min, max);

  if (_previousInputFingerprint) {
    const previous = _previousInputFingerprint;
    const maxSampleDifference = Math.max(
      ...current.sample.map((value, index) => Math.abs(value - previous.sample[index])),
    );
    const meanDifference = Math.abs(current.mean - previous.mean);
    const minDifference = Math.abs(current.min - previous.min);
    const maxDifference = Math.abs(current.max - previous.max);
    const identical = current.hash === previous.hash;
    const substantiallyDifferent = !identical && (
      meanDifference >= 0.01
      || minDifference >= 0.05
      || maxDifference >= 0.05
      || maxSampleDifference >= 0.05
    );

    console.log('[PlantCare][Diagnostic] INPUT COMPARISON:', {
      previousUri: previous.imageUri,
      currentUri: current.imageUri,
      uriChanged: previous.imageUri !== current.imageUri,
      identicalFingerprint: identical,
      inputDifference: identical
        ? 'IDENTICAL'
        : substantiallyDifferent
          ? 'SUBSTANTIALLY DIFFERENT'
          : 'DIFFERENT, BUT NOT CLEARLY SUBSTANTIAL',
      previousHash: previous.hash,
      currentHash: current.hash,
      meanDifference,
      minDifference,
      maxDifference,
      maxSampleDifference,
    });
  } else {
    console.log('[PlantCare][Diagnostic] INPUT COMPARISON: no previous input');
  }

  _previousInputFingerprint = current;
}

/**
 * Returns a cached ONNX InferenceSession for the trained plantcare model.
 */
async function getSession() {
  if (_session) return _session;

  const ort = getOnnxRuntime();
  const [asset] = await Asset.loadAsync(
    require('../../assets/models/plantcare/model.onnx'),
  );
  const modelPath = asset.localUri || asset.uri;

  if (!modelPath) {
    throw new Error('Could not resolve local path for plantcare model.onnx');
  }

  _session = await ort.InferenceSession.create(modelPath);
  return _session;
}

/**
 * Center-crop image to square, resize to 224×224, decode JPEG pixels to RGB,
 * and construct a float32 NHWC tensor of raw RGB values in the 0–255 range.
 *
 * @param {string} imageUri - file:// or content:// URI of the source image
 * @returns {Promise<Float32Array>}
 */
export async function preprocessImage(imageUri) {
  // Probe dimensions
  const probe = await manipulateAsync(imageUri, [], {
    format: SaveFormat.JPEG,
  });
  const { width: origW, height: origH } = probe;

  // Compute center-crop square
  const side = Math.min(origW, origH);
  const cropX = Math.floor((origW - side) / 2);
  const cropY = Math.floor((origH - side) / 2);

  const manipulated = await manipulateAsync(
    imageUri,
    [
      {
        crop: {
          originX: cropX,
          originY: cropY,
          width: side,
          height: side,
        },
      },
      { resize: { width: 224, height: 224 } },
    ],
    { format: SaveFormat.JPEG, compress: 1.0 },
  );

  const jpegBytes = Buffer.from(await new File(manipulated.uri).arrayBuffer());
  const rgbPixels = decodeJpegToRgb(jpegBytes);

  const floatData = new Float32Array(1 * 224 * 224 * 3);
  for (let i = 0; i < 224 * 224 * 3; i++) {
    floatData[i] = rgbPixels[i];
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (let i = 0; i < floatData.length; i++) {
    const value = floatData[i];
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
  }
  const mean = sum / floatData.length;

  console.log('[PlantCare][Preprocess] SOURCE URI:', imageUri);
  console.log('[PlantCare][Preprocess] MANIPULATED URI:', manipulated.uri);
  console.log('[PlantCare][Preprocess] ORIGINAL SIZE:', `${origW}x${origH}`);
  console.log('[PlantCare][Preprocess] CROP:', {
    originX: cropX,
    originY: cropY,
    width: side,
    height: side,
    side,
  });
  console.log('[PlantCare][Preprocess] JPEG BYTES:', jpegBytes.length);
  console.log('[PlantCare][Preprocess] RGB LENGTH:', rgbPixels.length);
  console.log('[PlantCare][Preprocess] FLOAT LENGTH:', floatData.length);
  console.log('[PlantCare][Preprocess] FLOAT MIN:', min);
  console.log('[PlantCare][Preprocess] FLOAT MAX:', max);
  console.log('[PlantCare][Preprocess] FLOAT MEAN:', mean);
  console.log(
    '[PlantCare][Preprocess] INPUT RANGE: 0-255 (MobileNetV3 internal preprocessing)',
  );
  console.log(
    '[PlantCare][Preprocess] RGB SAMPLE:',
    Array.from(rgbPixels.slice(0, FLOAT_LOG_SAMPLE_COUNT)),
  );
  console.log(
    '[PlantCare][Preprocess] FLOAT SAMPLE:',
    Array.from(floatData.slice(0, FLOAT_LOG_SAMPLE_COUNT)),
  );

  return floatData;
}

/**
 * Decodes JPEG buffer to raw RGB byte array using jpeg-js.
 */
function decodeJpegToRgb(jpegBuffer) {
  try {
    const jpeg = require('jpeg-js');
    const decoded = jpeg.decode(jpegBuffer, { useTArray: true });
    const rgba = decoded.data;
    const rgb = new Uint8Array(decoded.width * decoded.height * 3);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
      rgb[j] = rgba[i];
      rgb[j + 1] = rgba[i + 1];
      rgb[j + 2] = rgba[i + 2];
    }
    return rgb;
  } catch (err) {
    throw new Error(
      `JPEG pixel decoding failed: ${err.message || err}`,
    );
  }
}

/**
 * Run trained ML model inference on an image.
 *
 * @param {string} imageUri - path to captured or selected leaf image
 * @returns {Promise<{
 *   diseaseClass: string,
 *   confidence: number,
 *   crop: string,
 *   condition: string,
 *   modelVersion: string
 * }>}
 */
export async function runInference(imageUri) {
  const ort = getOnnxRuntime();
  const session = await getSession();
  const inputData = await preprocessImage(imageUri);

  const inputTensor = new ort.Tensor('float32', inputData, [1, 224, 224, 3]);
  let inputMin = Infinity;
  let inputMax = -Infinity;
  let inputSum = 0;
  for (let i = 0; i < inputData.length; i++) {
    const value = inputData[i];
    if (value < inputMin) inputMin = value;
    if (value > inputMax) inputMax = value;
    inputSum += value;
  }
  logInputFingerprint(inputData, imageUri, inputSum / inputData.length, inputMin, inputMax);

  const inputName = session.inputNames[0];
  const feeds = { [inputName]: inputTensor };

  const results = await session.run(feeds);

  const outputName = session.outputNames[0];
  const output = results[outputName];
  const outputData = output && output.data;
  console.log('[PlantCare][Inference] MODEL INPUT NAME:', inputName);
  console.log('[PlantCare][Inference] MODEL OUTPUT NAME:', outputName);
  console.log('[PlantCare][Inference] INPUT TENSOR DIMENSIONS:', inputTensor.dims);
  console.log(
    '[PlantCare][Inference] OUTPUT LENGTH:',
    outputData ? outputData.length : 'missing',
  );

  if (!output || !output.data) {
    throw new Error(`Model output "${outputName}" is missing or has no data`);
  }

  if (outputData.length !== DISEASE_CLASSES.length) {
    throw new Error(
      `Expected ${DISEASE_CLASSES.length} model outputs, received ${outputData.length}`,
    );
  }

  const probs = Array.from(outputData);
  const allPredictions = probs.map((probability, index) => ({
    index,
    className: DISEASE_CLASSES[index],
    probability,
  }));
  const probabilitySum = probs.reduce((sum, probability) => sum + probability, 0);
  console.log('[PlantCare][Inference] ALL PROBABILITIES:', allPredictions);
  console.log('[PlantCare][Inference] PROBABILITY SUM:', probabilitySum);

  const invalidProbabilityIndex = probs.findIndex(
    (probability) => !Number.isFinite(probability) || probability < 0,
  );
  if (invalidProbabilityIndex !== -1) {
    throw new Error(
      `Model output contains an invalid probability at index ${invalidProbabilityIndex}: ${probs[invalidProbabilityIndex]}`,
    );
  }
  if (Math.abs(probabilitySum - 1) > 1e-3) {
    throw new Error(
      `Model output probabilities sum to ${probabilitySum}, expected approximately 1`,
    );
  }

  let maxIdx = 0;
  let maxVal = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > maxVal) {
      maxVal = probs[i];
      maxIdx = i;
    }
  }

  const topPredictions = allPredictions
    .slice()
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);
  console.log('[PlantCare][Inference] TOP 5 PREDICTIONS:', topPredictions);
  console.log('[PlantCare][Inference] WINNING CLASS INDEX:', maxIdx);
  console.log('[PlantCare][Inference] WINNING CLASS NAME:', DISEASE_CLASSES[maxIdx]);
  console.log('[PlantCare][Inference] WINNING CONFIDENCE:', maxVal);

  const diseaseClass = DISEASE_CLASSES[maxIdx];
  const [crop, condition] = diseaseClass.split('___');

  return {
    diseaseClass,
    confidence: parseFloat(maxVal.toFixed(4)),
    crop,
    condition,
    modelVersion: MODEL_VERSION,
  };
}
