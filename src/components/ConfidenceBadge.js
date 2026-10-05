import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { font, fontSize } from '../constants/typography';

function getConfidenceLabel(confidence) {
  // confidence is 0.0 – 1.0
  const pct = Math.round(confidence * 100);
  return `${pct}% Match`;
}

export default function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence || 0) * 100);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{pct}% Match</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#D1FAE5', // emerald-100 equiv
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${colors.sage}60`,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  text: {
    fontFamily: font(700),
    fontSize: fontSize.sm,
    color: colors.forest,
  },
});
