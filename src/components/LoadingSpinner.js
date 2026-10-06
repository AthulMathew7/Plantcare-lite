import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { font, fontSize } from '../constants/typography';

export default function LoadingSpinner({ message = 'Loading…' }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.sage} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  text: {
    fontFamily: font(500),
    fontSize: fontSize.base,
    color: colors.subtleText,
  },
});
