import labelMap from '../assets/models/plantcare/label_map.json';
import { NativeModules } from 'react-native';
import {
  DISEASE_CLASSES,
  MODEL_VERSION,
  preprocessImage,
} from '../src/services/inferenceService';

NativeModules.Onnxruntime = { install: jest.fn() };

jest.mock('../assets/models/plantcare/model.onnx', () => 1);

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///tmp/manipulated.jpg',
    width: 224,
    height: 224,
  }),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({
    arrayBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
  })),
}));

jest.mock('jpeg-js', () => ({
  decode: jest.fn().mockReturnValue({
    width: 224,
    height: 224,
    data: new Uint8Array(224 * 224 * 4), // RGBA
  }),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn().mockResolvedValue([{ localUri: 'file:///tmp/model.onnx' }]),
  },
}));

jest.mock('onnxruntime-react-native', () => {
  return {
    InferenceSession: {
      create: jest.fn().mockResolvedValue({
        inputNames: ['input_1'],
        outputNames: ['output_1'],
        run: jest.fn().mockResolvedValue({
          output_1: {
            data: new Float32Array([0.9, ...new Array(21).fill(0.1 / 21)]),
          },
        }),
      }),
    },
    Tensor: jest.fn().mockImplementation((type, data, dims) => ({ type, data, dims })),
  };
});

describe('inferenceService', () => {
  it('contains all 22 expected disease classes in Crop___Disease_Name format', () => {
    expect(DISEASE_CLASSES).toHaveLength(22);
    expect(DISEASE_CLASSES).toEqual(
      Object.keys(labelMap).map((index) => labelMap[index]),
    );
    expect(DISEASE_CLASSES).toContain('Rice___Blast');
    expect(DISEASE_CLASSES).toContain('Cassava___Healthy');
    expect(DISEASE_CLASSES).toContain('Mango___Anthracnose');
    expect(DISEASE_CLASSES).toContain('Coconut___Gray_Leaf_Spot');
    expect(DISEASE_CLASSES).toContain('Jackfruit___Healthy');
  });

  it('center-crops to square, resizes, decodes RGB, and returns RGB Float32 data in the 0–255 range', async () => {
    const { manipulateAsync } = require('expo-image-manipulator');
    const jpeg = require('jpeg-js');
    manipulateAsync.mockResolvedValueOnce({
      uri: 'file:///tmp/source.jpg',
      width: 400,
      height: 300,
    });
    const rgba = new Uint8Array(224 * 224 * 4);
    rgba.set([255, 127, 0, 255]);
    jpeg.decode.mockReturnValueOnce({ width: 224, height: 224, data: rgba });

    const tensorData = await preprocessImage('file:///tmp/source.jpg');

    expect(manipulateAsync).toHaveBeenNthCalledWith(
      2,
      'file:///tmp/source.jpg',
      [
        { crop: { originX: 50, originY: 0, width: 300, height: 300 } },
        { resize: { width: 224, height: 224 } },
      ],
      { format: 'jpeg', compress: 1 },
    );
    expect(require('expo-file-system').File).toHaveBeenCalledWith(
      'file:///tmp/manipulated.jpg',
    );
    expect(tensorData).toBeInstanceOf(Float32Array);
    expect(tensorData).toHaveLength(224 * 224 * 3);
    expect(tensorData[0]).toBe(255);
    expect(tensorData[1]).toBe(127);
    expect(tensorData[2]).toBe(0);

    const values = Array.from(tensorData);
    const min = values.reduce((currentMin, value) => Math.min(currentMin, value), Infinity);
    const max = values.reduce((currentMax, value) => Math.max(currentMax, value), -Infinity);
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(255);
  });

  it('runs inference and returns expected structure', async () => {
    const { runInference } = require('../src/services/inferenceService');
    const result = await runInference('file:///tmp/test.jpg');

    expect(result).toHaveProperty('diseaseClass');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('crop');
    expect(result).toHaveProperty('condition');
    expect(result).toHaveProperty('modelVersion', MODEL_VERSION);
    expect(DISEASE_CLASSES).toContain(result.diseaseClass);
    expect(result.diseaseClass).toBe(DISEASE_CLASSES[0]);
    expect(result.confidence).toBe(0.9);
    expect(require('onnxruntime-react-native').Tensor).toHaveBeenCalledWith(
      'float32',
      expect.any(Float32Array),
      [1, 224, 224, 3],
    );
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('rejects model output that does not contain all 22 classes', async () => {
    const { runInference } = require('../src/services/inferenceService');
    const ort = require('onnxruntime-react-native');
    const session = await ort.InferenceSession.create.mock.results[0].value;
    session.run.mockResolvedValueOnce({
      output_1: { data: new Float32Array(21).fill(1 / 21) },
    });

    await expect(runInference('file:///tmp/test.jpg')).rejects.toThrow(
      'Expected 22 model outputs, received 21',
    );
  });
});
