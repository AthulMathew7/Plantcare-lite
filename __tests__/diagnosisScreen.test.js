import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import DiagnosisScreen from '../src/screens/DiagnosisScreen';
import diseaseInfo from '../src/constants/diseaseInfo';
import { getAllDiseases } from '../src/services/database';

jest.mock('../src/services/database', () => ({
  getAllDiseases: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('lucide-react-native', () => ({
  History: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  ImageIcon: () => null,
}));

describe('DiagnosisScreen disease cards', () => {
  let tree;

  beforeEach(() => {
    getAllDiseases.mockResolvedValue(diseaseInfo);
  });

  afterEach(() => {
    if (tree) {
      act(() => tree.unmount());
      tree = null;
    }
  });

  async function renderScreen() {
    await act(async () => {
      tree = TestRenderer.create(React.createElement(DiagnosisScreen, {
        navigation: { navigate: jest.fn() },
      }));
      await Promise.resolve();
    });
  }

  function cardFor(label) {
    return tree.root.find((node) => node.props.accessibilityLabel === label);
  }

  function visibleText() {
    return tree.root.findAllByType(require('react-native').Text)
      .map((node) => node.props.children)
      .filter((child) => typeof child === 'string');
  }

  it('renders all disease cards and expands/collapses one card on repeated taps', async () => {
    await renderScreen();
    const cardLabels = tree.root.findAll((node) => (
      node.props.accessibilityRole === 'button'
      && typeof node.props.accessibilityLabel === 'string'
      && node.props.accessibilityLabel.includes(', ')
    )).map((node) => node.props.accessibilityLabel);
    expect(new Set(cardLabels).size).toBe(22);

    const card = cardFor('Rice Blast, Rice');
    await act(async () => card.props.onPress());
    expect(visibleText()).toContain('Cause / pathogen');
    expect(visibleText()).toContain('Treatment / management');
    expect(visibleText()).toContain('Prevention');
    expect(visibleText()).toContain('Cure status');
    expect(visibleText()).not.toContain('Tap to close');
    expect(visibleText()).toContain('Rice Blast');

    await act(async () => card.props.onPress());
    expect(visibleText()).not.toContain('Cause / pathogen');
  });

  it('shows all newly supplied photos in their cards without the unavailable-photo placeholder', async () => {
    await renderScreen();
    const suppliedPhotoCards = [
      'Cassava Green Mottle, Cassava',
      'Jackfruit Algal Leaf Spot, Jackfruit',
      'Jackfruit Black Spot, Jackfruit',
      'Healthy Jackfruit, Jackfruit',
    ];
    const Image = require('react-native').Image;

    for (const label of suppliedPhotoCards) {
      const card = cardFor(label);
      expect(card.findByType(Image).props.source).toBeDefined();
      expect(visibleText()).not.toContain('Photo unavailable');

      await act(async () => card.props.onPress());
      expect(visibleText()).toContain('Cause / pathogen');
      expect(visibleText()).not.toContain('Photo unavailable');
      await act(async () => card.props.onPress());
    }
  });

  it('leaves enough scrollable space below expanded content for fixed bottom navigation', async () => {
    await renderScreen();
    const scrollViews = tree.root.findAllByType(require('react-native').ScrollView);
    const verticalScroll = scrollViews.find((node) => node.props.horizontal !== true);
    const contentStyle = require('react-native').StyleSheet.flatten(
      verticalScroll.props.contentContainerStyle,
    );
    expect(contentStyle.paddingBottom).toBeGreaterThanOrEqual(180);
  });
});
