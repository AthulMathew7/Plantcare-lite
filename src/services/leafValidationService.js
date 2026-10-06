import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { preprocessImage } from './inferenceService';

const LEAF_THRESHOLD = 0.60;
const NON_LEAF_THRESHOLD = 0.40;

let leafSession = null;

async function getLeafSession() {
  if (leafSession) {
    return leafSession;
  }

  const asset = Asset.fromModule(
    require('../../assets/models/leaf/leaf_classifier.onnx')
  );

  console.log('[PlantCare][LeafGate] Asset module:', asset);

  await asset.downloadAsync();

  console.log('[PlantCare][LeafGate] Asset URI:', asset.localUri || asset.uri);

  leafSession = await InferenceSession.create(
    asset.localUri || asset.uri
  );

  console.log('[PlantCare][LeafGate] Session loaded:', {
    inputNames: leafSession.inputNames,
    outputNames: leafSession.outputNames,
  });

  return leafSession;
}

/**
 * Validate whether an image is a leaf before running disease classification.
 *
 * Returns:
 *   LEAF       -> safe to continue to disease model
 *   NOT_LEAF   -> reject image
 *   UNCERTAIN  -> ask user to retake/reselect image
 */
export async function validateLeaf(imageUri) {
  const session = await getLeafSession();

  const inputData = await preprocessImage(imageUri);

  const inputTensor = new Tensor(
    'float32',
    inputData,
    [1, 224, 224, 3]
  );

  const inputName = session.inputNames[0];

  const output = await session.run({
    [inputName]: inputTensor,
  });

  const outputName = session.outputNames[0];
  const outputTensor = output[outputName];

  if (!outputTensor || !outputTensor.data) {
    throw new Error('Leaf validation model returned no output.');
  }

  const leafProbability = Number(outputTensor.data[0]);

  if (!Number.isFinite(leafProbability)) {
    throw new Error('Leaf validation model returned an invalid probability.');
  }

  if (leafProbability >= LEAF_THRESHOLD) {
    return {
      status: 'LEAF',
      isLeaf: true,
      probability: leafProbability,
    };
  }

  if (leafProbability <= NON_LEAF_THRESHOLD) {
    return {
      status: 'NOT_LEAF',
      isLeaf: false,
      probability: leafProbability,
    };
  }

  return {
    status: 'UNCERTAIN',
    isLeaf: null,
    probability: leafProbability,
  };
}