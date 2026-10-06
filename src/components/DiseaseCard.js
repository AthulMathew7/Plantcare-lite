import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import ConfidenceBadge from './ConfidenceBadge';
import SeverityBadge from './SeverityBadge';
import { font, softShadow, fontSize } from '../constants/typography';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

const SEVERITY_LABELS = {
  none: 'Healthy Plant',
  medium: 'Medium Severity',
  high: 'High Severity',
};

/**
 * DiseaseCard — used as a compact summary card in contexts that need one.
 * The full result detail layout is now built directly in ResultScreen.
 */
export default function DiseaseCard({ imageUri, displayName, confidence, description, severity }) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const severityLabel = SEVERITY_LABELS[severity];

  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.body}>
        {severityLabel ? (
          <Text style={styles.severityLabel}>{severityLabel.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.metaRow}>
          <ConfidenceBadge confidence={confidence} />
          {severity ? <SeverityBadge severity={severity} isDark={isDark} themeColors={colors} /> : null}
        </View>

        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...softShadow,
  },
  image: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    backgroundColor: '#CBD5E1',
  },
  body: {
    padding: 16,
    gap: 8,
  },
  severityLabel: {
    fontFamily: font(700),
    fontSize: 10,
    color: colors.coral,
    letterSpacing: 0.8,
  },
  name: {
    fontFamily: font(800),
    fontSize: fontSize.xl,
    color: '#111827',
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  description: {
    fontFamily: font(400),
    fontSize: fontSize.base,
    color: colors.subtleText,
    lineHeight: 22,
  },
});
