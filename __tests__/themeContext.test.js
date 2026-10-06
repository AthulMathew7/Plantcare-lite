import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity, View } from 'react-native';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

const mockStorage = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
}));

function ThemeProbe() {
  const { mode, themeReady, setThemeMode } = useTheme();
  return (
    <View>
      <Text>{themeReady ? mode : 'loading'}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Set dark theme"
        onPress={() => setThemeMode('dark')}
      />
    </View>
  );
}

describe('theme preference', () => {
  beforeEach(() => {
    delete mockStorage['@plantcare/theme'];
    jest.clearAllMocks();
  });

  it('defaults to Light when no preference is stored', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(<ThemeProvider><ThemeProbe /></ThemeProvider>);
      await Promise.resolve();
    });
    expect(tree.root.findByType(Text).props.children).toBe('light');
    act(() => tree.unmount());
  });

  it('updates immediately and persists the selected mode', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(<ThemeProvider><ThemeProbe /></ThemeProvider>);
      await Promise.resolve();
    });

    await act(async () => {
      tree.root.findByProps({ accessibilityLabel: 'Set dark theme' }).props.onPress();
      await Promise.resolve();
    });
    expect(tree.root.findByType(Text).props.children).toBe('dark');
    expect(mockStorage['@plantcare/theme']).toBe('dark');
    act(() => tree.unmount());
  });

  it('restores a saved Dark preference on startup', async () => {
    mockStorage['@plantcare/theme'] = 'dark';
    let tree;
    await act(async () => {
      tree = TestRenderer.create(<ThemeProvider><ThemeProbe /></ThemeProvider>);
      await Promise.resolve();
    });
    expect(tree.root.findByType(Text).props.children).toBe('dark');
    act(() => tree.unmount());
  });
});
