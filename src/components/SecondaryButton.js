import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { useThemedStyles } from '../context/ThemeContext';
import { font, fontSize } from '../constants/typography';

export default function SecondaryButton({ title, onPress, disabled, style }) {
  const styles = useThemedStyles(baseStyles);
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.cream,
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
