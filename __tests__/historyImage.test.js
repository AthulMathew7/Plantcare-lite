import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import HistoryScreen from '../src/screens/HistoryScreen';
import { loadHistory } from '../src/services/database';

jest.mock('../src/services/database', () => ({
  getActiveLocalUserId: () => 7,
  loadHistory: jest.fn(),
  deleteHistoryItem: jest.fn(),
  restoreHistoryItem: jest.fn(),
}));

jest.mock('../src/services/historyNavigation', () => ({
  subscribeToHistoryFocus: (navigation, refresh) => navigation.addListener('focus', refresh),
}));

jest.mock('../src/utils/dateUtils', () => ({
  formatRelativeDate: () => 'Today',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('react-native-gesture-handler', () => ({
  Swipeable: ({ children }) => children,
  RectButton: ({ children }) => children,
}));

jest.mock('lucide-react-native', () => ({
  Leaf: () => null,
  Sprout: () => null,
  MoreVertical: () => null,
  ChevronLeft: () => null,
}));

jest.mock('../src/components/EmptyState', () => () => null);
jest.mock('../src/components/LoadingSpinner', () => () => null);

describe('HistoryScreen scan images', () => {
  it('shows the saved scan thumbnail and opens the same original image in history detail', async () => {
    const originalImage = 'file:///documents/scans/scan-71.jpg';
    const thumbnailImage = 'file:///documents/scans/scan-71-thumb.jpg';
    loadHistory.mockResolvedValue([{
      id: 71,
      image_path: originalImage,
      image_thumbnail_path: thumbnailImage,
      disease_class: 'Rice___Blast',
      display_name: 'Rice Blast',
      scanned_at: '2026-10-06 08:00:00',
      synced: 0,
    }]);

    let focusHandler;
    const navigation = {
      addListener: jest.fn((event, callback) => {
        focusHandler = callback;
        return jest.fn();
      }),
      navigate: jest.fn(),
      canGoBack: () => false,
    };
    let tree;

    await act(async () => {
      tree = TestRenderer.create(React.createElement(HistoryScreen, { navigation }));
    });
    expect(focusHandler).toEqual(expect.any(Function));
    await act(async () => {
      await focusHandler();
    });

    expect(tree.root.findByType(require('react-native').Image).props.source).toEqual({
      uri: thumbnailImage,
    });

    const scanCard = tree.root.find((node) => (
      node.props.accessibilityLabel === 'Scan record for Rice Blast'
    ));
    act(() => scanCard.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('HistoryDetail', {
      imageUri: originalImage,
      historyMode: true,
      scanData: expect.objectContaining({ image_path: originalImage }),
    });

    act(() => tree.unmount());
  });
});
