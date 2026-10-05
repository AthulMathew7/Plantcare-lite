import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Leaf, Trash2, ChevronRight, Cpu, Info } from 'lucide-react-native';
import {
  clearAllHistory,
  getSyncPreference,
  toggleSyncPreference,
} from '../services/database';
import colors from '../constants/colors';
import { font, softShadow, fontSize } from '../constants/typography';

const APP_VERSION = Constants.expoConfig?.version || '0.1.0';

export default function SettingsScreen() {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getSyncPreference()
      .then(setSyncEnabled)
      .catch(() => setSyncEnabled(false));
  }, []);

  const handleToggleSync = useCallback(async (value) => {
    setSyncEnabled(value);
    try {
      await toggleSyncPreference(value);
    } catch {
      setSyncEnabled(!value);
      Alert.alert('Error', 'Could not save this preference.');
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear all history',
      'This will permanently delete every scan record. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              Alert.alert('Done', 'All scan history has been cleared.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not clear history.');
            }
          },
        },
      ],
    );
  }, []);

  return (
    <View style={styles.screen}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <Text style={styles.screenTitle}>Settings</Text>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + Math.max(insets.bottom, 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ─────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Leaf size={22} color={colors.sage} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.profileName}>PlantCare</Text>
            <Text style={styles.profileSub}>Open-source crop health tool</Text>
          </View>
        </View>

        {/* ── Preferences section ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.groupCard}>

          {/* Sync toggle */}
          <View style={styles.groupRow}>
            <Text style={styles.rowLabel}>Sync history when online</Text>
            <Switch
              value={syncEnabled}
              onValueChange={handleToggleSync}
              trackColor={{ false: '#E5E7EB', true: colors.sage }}
              thumbColor={syncEnabled ? colors.cardBg : '#F9FAFB'}
              ios_backgroundColor="#E5E7EB"
              accessibilityRole="switch"
              accessibilityLabel="Sync history when online"
            />
          </View>
          {syncEnabled && (
            <View style={styles.syncSubtextRow}>
              <Text style={styles.syncSubtext}>
                Cloud sync coming soon — scans are queued locally
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Offline AI engine */}
          <View style={styles.groupRow}>
            <Text style={styles.rowLabel}>Offline AI Engine</Text>
            <View style={styles.rowValueWrap}>
              <Cpu size={13} color={colors.sage} strokeWidth={2} />
              <Text style={styles.rowValue}>Active (MobileNetV2)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* App version */}
          <View style={styles.groupRow}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={[styles.rowValue, styles.mono]}>{APP_VERSION}</Text>
          </View>

        </View>

        {/* ── Danger section ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearHistory}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Clear all history"
          >
            <Trash2 size={16} color={colors.coral} strokeWidth={2} />
            <Text style={styles.dangerLabel}>Clear all history</Text>
          </TouchableOpacity>
        </View>

        {/* ── About ────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.groupCard}>
          <View style={styles.groupRow}>
            <View style={styles.aboutRow}>
              <Info size={14} color={colors.subtleText} strokeWidth={1.8} />
              <Text style={styles.aboutText}>
                PlantCare • Open-source crop health tool. Diagnosis runs fully on-device with no data uploaded.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // ── Header ───────────────────────────────────────────────────
  headerSafe: {
    backgroundColor: colors.cream,
  },
  screenTitle: {
    fontFamily: font(800),
    fontSize: fontSize.lg,
    color: '#111827',
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },

  // ── Content ───────────────────────────────────────────────────
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },

  // ── Profile card ──────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
    ...softShadow,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: font(800),
    fontSize: fontSize.base,
    color: '#111827',
    marginBottom: 2,
  },
  profileSub: {
    fontFamily: font(400),
    fontSize: fontSize.xs,
    color: '#9CA3AF',
  },

  // ── Section label ─────────────────────────────────────────────
  sectionLabel: {
    fontFamily: font(700),
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingLeft: 4,
    marginTop: 8,
    marginBottom: 4,
  },

  // ── Group card ────────────────────────────────────────────────
  groupCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 4,
    ...softShadow,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontFamily: font(600),
    fontSize: fontSize.sm,
    color: '#1F2937',
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontFamily: font(500),
    fontSize: fontSize.sm,
    color: '#9CA3AF',
  },
  mono: {
    fontFamily: font(400),
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  syncSubtextRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: -4,
  },
  syncSubtext: {
    fontFamily: font(400),
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // ── Danger row ────────────────────────────────────────────────
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerLabel: {
    fontFamily: font(600),
    fontSize: fontSize.sm,
    color: colors.coral,
  },

  // ── About row ─────────────────────────────────────────────────
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  aboutText: {
    flex: 1,
    fontFamily: font(400),
    fontSize: fontSize.sm,
    color: colors.subtleText,
    lineHeight: 18,
  },
});
