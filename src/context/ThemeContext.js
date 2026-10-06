import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseColors from '../constants/colors';

const THEME_STORAGE_KEY = '@plantcare/theme';

const LIGHT_COLORS = {
  ...baseColors,
  isDark: false,
  screen: '#EEF2EC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  input: '#FFFFFF',
  inputBorder: '#D1D5DB',
  navInactive: '#9CA3AF',
  navBackground: '#FFFFFF',
};

const DARK_COLORS = {
  ...baseColors,
  isDark: true,
  cream: '#18221B',
  screen: '#18221B',
  cardBg: '#27342B',
  surface: '#27342B',
  surfaceElevated: '#303D34',
  forest: '#DCEBDD',
  forestBackground: '#24361B',
  sage: '#527B35',
  sageDark: '#44672C',
  textPrimary: '#F1F5F1',
  textSecondary: '#B7C4BA',
  subtleText: '#A8B7AC',
  secondaryText: '#B7C4BA',
  border: '#405047',
  input: '#202C24',
  inputBorder: '#526257',
  navInactive: '#A8B7AC',
  navBackground: '#27342B',
  navy: '#34463A',
  mutedGreen: '#34483A',
};

const ThemeContext = createContext({
  mode: 'light',
  isDark: false,
  colors: LIGHT_COLORS,
  themeReady: true,
  setThemeMode: async () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (active && (storedMode === 'dark' || storedMode === 'light')) {
          setMode(storedMode);
        }
      })
      .catch((error) => {
        console.warn('[PlantCare][Theme] Could not load saved theme:', error);
      })
      .finally(() => {
        if (active) setThemeReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const setThemeMode = useCallback(async (nextMode) => {
    if (nextMode !== 'light' && nextMode !== 'dark') {
      throw new Error(`Unsupported theme mode: ${nextMode}`);
    }
    const previousMode = mode;
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      setMode(previousMode);
      throw error;
    }
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    isDark: mode === 'dark',
    colors: mode === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    themeReady,
    setThemeMode,
  }), [mode, themeReady, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemedStyles(baseStyles) {
  const { colors } = useTheme();
  return useMemo(() => {
    if (!colors.isDark) return baseStyles;
    const themedStyles = {};
    Object.keys(baseStyles).forEach((key) => {
      const style = StyleSheet.flatten(baseStyles[key]) || {};
      themedStyles[key] = Object.entries(style).reduce((result, [property, value]) => {
        if (property === 'backgroundColor') {
          if (value === '#EEF2EC' || value === '#F8FAF5') result[property] = colors.screen;
          else if (value === '#FFFFFF' || value === '#fff' || value === '#FFFFFFCC') result[property] = colors.surface;
          else if (value === '#24361B') result[property] = colors.forestBackground;
          else if (['#F3F4F6', '#F9FAFB', '#E8E4D8', '#E5E7EB', '#CBD5E1'].includes(value)) result[property] = colors.surfaceElevated;
          else if (['#E8F5EA', '#D1FAE5', '#E6EFE8'].includes(value)) result[property] = colors.mutedGreen;
          else if (['#FEF3C7', '#FFF7E6', '#FFF3E5'].includes(value)) result[property] = '#493A1E';
          else result[property] = value;
        } else if (property === 'borderColor') {
          result[property] = value === '#F3F4F6' || value === '#E5E7EB' ? colors.border : value;
        } else if (property === 'color') {
          if (['#111827', '#1F2937', '#24361B', '#374151'].includes(value)) result[property] = colors.textPrimary;
          else if (['#4B5563', '#6B7280', '#9CA3AF', '#A8A8A8', '#854D0E', '#78350F'].includes(value)) result[property] = colors.textSecondary;
          else result[property] = value;
        } else {
          result[property] = value;
        }
        return result;
      }, {});
    });
    return themedStyles;
  }, [baseStyles, colors]);
}
