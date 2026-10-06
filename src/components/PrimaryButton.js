import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import colors from '../constants/colors';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { font, fontSize } from '../constants/typography';

export default function PrimaryButton({ title, onPress, disabled, loading, style }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={colors.forest} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.sage,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: font(700),
    color: colors.forest,
    fontSize: fontSize.base,
  },
});
