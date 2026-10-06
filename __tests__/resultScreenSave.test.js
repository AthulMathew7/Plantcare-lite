import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ResultScreen from '../src/screens/ResultScreen';
import { runInference } from '../src/services/inferenceService';
import { lookupDiseaseInfo, saveScanToHistory } from '../src/services/database';

jest.mock('../src/services/inferenceService', () => ({
  MODEL_VERSION: 'plantcare-v1.0',
  runInference: jest.fn(),
}));

jest.mock('../src/services/database', () => ({
  lookupDiseaseInfo: jest.fn(),
  saveScanToHistory: jest.fn(),
  setHistoryItemUncertain: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Share2: () => null,
  ShieldCheck: () => null,
  Bookmark: () => null,
  Flag: () => null,
  AlertCircle: () => null,
  RefreshCcw: () => null,
}));

jest.mock('../src/components/LoadingSpinner', () => () => null);
jest.mock('../src/components/ConfidenceBadge', () => () => null);
jest.mock('../src/components/SeverityBadge', () => () => null);

describe('ResultScreen history saving', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    runInference.mockResolvedValue({
      diseaseClass: 'Rice___Brown_Spot',
      confidence: 0.84,
      crop: 'Rice',
      condition: 'Brown_Spot',
      modelVersion: 'plantcare-v1.0',
    });
    lookupDiseaseInfo.mockResolvedValue({ display_name: 'Rice Brown Spot' });
    saveScanToHistory.mockResolvedValue({ id: 41, userId: 1 });
  });

  it('automatically saves a successful diagnosis for local History', async () => {
    const navigation = { goBack: jest.fn(), popToTop: jest.fn() };
    let tree;

    await act(async () => {
      tree = TestRenderer.create(React.createElement(
        ResultScreen,
        {
          route: { params: { imageUri: 'file:///scan.jpg' } },
          navigation,
        },
      ));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(saveScanToHistory).toHaveBeenCalledWith(
      'file:///scan.jpg',
      'Rice___Brown_Spot',
      0.84,
      false,
      'plantcare-v1.0',
    );
    expect(
      tree.root.findAllByType(require('react-native').Text)
        .some((node) => node.props.children === 'Saved'),
    ).toBe(true);
    const resultImage = tree.root.findByType(require('react-native').Image);
    expect(resultImage.props.source).toEqual({ uri: 'file:///scan.jpg' });
    act(() => tree.unmount());
  });

  it('keeps the actual history scan image in the hero when disease metadata has a catalog image', async () => {
    lookupDiseaseInfo.mockResolvedValue({
      display_name: 'Rice Brown Spot',
      image: 'rice_brown_spot',
    });
    let tree;

    await act(async () => {
      tree = TestRenderer.create(React.createElement(
        ResultScreen,
        {
          route: {
            params: {
              imageUri: 'file:///documents/scans/original-scan.jpg',
              historyMode: true,
              scanData: {
                disease_class: 'Rice___Brown_Spot',
                confidence: 0.84,
              },
            },
          },
          navigation: { goBack: jest.fn() },
        },
      ));
      await Promise.resolve();
    });

    expect(tree.root.findByType(require('react-native').Image).props.source).toEqual({
      uri: 'file:///documents/scans/original-scan.jpg',
    });
    act(() => tree.unmount());
  });
});
