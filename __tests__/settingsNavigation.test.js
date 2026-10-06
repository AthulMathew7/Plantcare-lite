import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import SettingsScreen from '../src/screens/SettingsScreen';
import { ThemeProvider } from '../src/context/ThemeContext';

const mockNavigate = jest.fn();

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
  }),
}));

jest.mock('../src/services/database', () => ({
  clearAllHistory: jest.fn(),
  getSyncPreference: jest.fn().mockResolvedValue(false),
  toggleSyncPreference: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('lucide-react-native', () => ({
  Leaf: () => null,
  Trash2: () => null,
  ChevronRight: () => null,
  Cpu: () => null,
  Info: () => null,
}));

describe('guest Settings authentication navigation', () => {
  it('opens the registered Auth route from the guest account action', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <SettingsScreen navigation={{ navigate: mockNavigate }} />
        </ThemeProvider>,
      );
    });
    const authButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Log in or create an account',
    );

    await act(async () => {
      authButton.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Auth');
    act(() => tree.unmount());
  });

  it('shows the Dark Mode switch and updates it when toggled', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <SettingsScreen navigation={{ navigate: mockNavigate }} />
        </ThemeProvider>,
      );
      await Promise.resolve();
    });
    const themeSwitch = tree.root.findByProps({
      accessibilityLabel: 'Dark Mode',
    });
    expect(themeSwitch.props.value).toBe(false);

    await act(async () => {
      themeSwitch.props.onValueChange(true);
      await Promise.resolve();
    });
    expect(tree.root.findByProps({
      accessibilityLabel: 'Dark Mode',
    }).props.value).toBe(true);
    act(() => tree.unmount());
  });
});
