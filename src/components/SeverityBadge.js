import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { font, fontSize } from '../constants/typography';

const SEVERITY_CONFIG = {
  low: {
    label: 'Severity: Low',
    backgroundColor: '#98CC6B',
    textColor: '#24361B',
    borderColor: '#81B354',
  },
  none: {
    label: 'Severity: None',
    backgroundColor: '#98CC6B',
    textColor: '#24361B',
    borderColor: '#81B354',
  },
  medium: {
    label: 'Severity: Medium',
    backgroundColor: '#FDE68A',
    textColor: '#78350F',
    borderColor: '#F59E0B',
  },
  high: {
    label: 'Severity: High',
    backgroundColor: '#ED7A3B',
    textColor: '#FFFFFF',
    borderColor: '#D85A30',
  },
};

export default function SeverityBadge({ severity }) {
  if (!severity) return null;
  const key = String(severity).toLowerCase();
  const config = SEVERITY_CONFIG[key] || {
    label: `Severity: ${severity}`,
    backgroundColor: '#E5E7EB',
    textColor: '#374151',
    borderColor: '#D1D5DB',
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={config.label}
    >
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  text: {
    fontFamily: font(700),
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
});
