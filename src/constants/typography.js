/**
 * PlantCare typography system — Plus Jakarta Sans
 *
 * Usage:
 *   import { font, fontSize } from '../constants/typography';
 *   style={{ fontFamily: font(700), fontSize: fontSize.lg }}
 *
 * Note: fontFamily strings must match the keys loaded by
 * @expo-google-fonts/plus-jakarta-sans in App.js.
 */

export const FONT_FAMILY = 'PlusJakartaSans';

/** Returns the fontFamily string for a given weight */
export function font(weight = 400) {
  const map = {
    300: 'PlusJakartaSans_300Light',
    400: 'PlusJakartaSans_400Regular',
    500: 'PlusJakartaSans_500Medium',
    600: 'PlusJakartaSans_600SemiBold',
    700: 'PlusJakartaSans_700Bold',
    800: 'PlusJakartaSans_800ExtraBold',
  };
  return map[weight] || map[400];
}

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
};

/** Border radius scale matching the reference's 3xl/4xl/5xl tokens */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,   // rounded-3xl in Tailwind (1.5rem)
  '3xl': 32,   // rounded-4xl (2rem)
  '4xl': 40,   // rounded-5xl (2.5rem)
  full: 9999,
};

/** Soft card shadow — matches the reference's .soft-shadow style */
export const softShadow = {
  shadowColor: '#24361B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 20,
  elevation: 3,
};
