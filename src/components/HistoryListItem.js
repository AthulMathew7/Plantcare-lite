import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Leaf, Sprout, MoreVertical } from 'lucide-react-native';
import colors from '../constants/colors';
import { font, softShadow, fontSize } from '../constants/typography';

function getStatusColor(scan) {
  if (scan.is_uncertain) return colors.statusUncertain;
  if (typeof scan.disease_class === 'string' && scan.disease_class.endsWith('Healthy')) {
    return colors.statusHealthy;
  }
  return colors.statusDiseased;
}

function pickIcon(scan) {
  const cls = (scan.disease_class || '').toLowerCase();
  if (cls.includes('healthy')) {
    return <Sprout size={16} color={colors.forest} strokeWidth={2} />;
  }
  return <Leaf size={16} color={colors.forest} strokeWidth={2} />;
}

export default function HistoryListItem({ scan, onPress, onLongPress }) {
  const statusColor = getStatusColor(scan);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      {/* Icon */}
      <View style={styles.iconWrap}>
        {pickIcon(scan)}
      </View>

      {/* Name + date */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {scan.display_name || scan.disease_class}
        </Text>
        <Text style={styles.date}>{scan.relativeDate || scan.scanned_at}</Text>
      </View>

      {/* Status dot */}
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

      {/* More icon */}
      <MoreVertical size={16} color="#9CA3AF" strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 10,
    ...softShadow,
  },
  iconWrap: {
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: font(600),
    fontSize: fontSize.sm,
    color: '#1F2937',
    marginBottom: 2,
  },
  date: {
    fontFamily: font(400),
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
});
