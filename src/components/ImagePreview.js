import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import colors from '../constants/colors';
import { font, softShadow, fontSize } from '../constants/typography';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

/**
 * ImagePreview — standalone preview component (kept for potential reuse).
 * The CaptureScreen now renders its own inline preview.
 */
export default function ImagePreview({ uri, placeholder }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  if (placeholder || !uri) {
    return (
      <View style={styles.placeholder}>
        <Leaf size={40} color={colors.forest} strokeWidth={1.5} style={{ opacity: 0.35 }} />
        <Text style={styles.placeholderText}>No image selected</Text>
        <Text style={styles.placeholderHint}>Take a photo or pick from gallery</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const baseStyles = StyleSheet.create({
  placeholder: {
    height: 240,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: `${colors.cardBg}CC`,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: font(700),
    fontSize: fontSize.lg,
    color: colors.forest,
    marginTop: 8,
  },
  placeholderHint: {
    fontFamily: font(400),
    fontSize: fontSize.sm,
    color: colors.subtleText,
  },
  imageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    ...softShadow,
  },
  image: {
    width: '100%',
    height: 240,
  },
});
