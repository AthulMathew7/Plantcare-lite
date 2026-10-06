import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import colors from '../constants/colors';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { font, fontSize } from '../constants/typography';

/**
 * EmptyState — shown when a list has no items.
 * Uses a Lucide Leaf icon instead of emoji, matching the reference's clean vector style.
 */
export default function EmptyState({ message }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Leaf size={48} color={colors.forest} strokeWidth={1.2} style={{ opacity: 0.35 }} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    gap: 12,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.forest}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  message: {
    fontFamily: font(500),
    fontSize: fontSize.base,
    color: colors.subtleText,
    textAlign: 'center',
    lineHeight: 22,
  },
});
