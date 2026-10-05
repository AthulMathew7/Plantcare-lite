import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Leaf, Sprout, MoreVertical, ChevronLeft } from 'lucide-react-native';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { loadHistory, deleteHistoryItem, restoreHistoryItem } from '../services/database';
import { formatRelativeDate } from '../utils/dateUtils';
import colors from '../constants/colors';
import { font, radius, softShadow, fontSize } from '../constants/typography';

// Map relativeDate strings → section order index so we can sort them
const SECTION_ORDER = ['Today', 'Yesterday', 'Last week', 'Older'];

function groupByDate(items) {
  const map = {};
  for (const item of items) {
    const key = item.relativeDate || 'Older';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  // Build sorted sections
  const sections = Object.entries(map)
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      const ai = SECTION_ORDER.indexOf(a.title);
      const bi = SECTION_ORDER.indexOf(b.title);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  return sections;
}

function pickIcon(scan) {
  const cls = scan.disease_class || '';
  if (cls.toLowerCase().includes('healthy')) {
    return <Sprout size={16} color={colors.forest} strokeWidth={2} />;
  }
  return <Leaf size={16} color={colors.forest} strokeWidth={2} />;
}

// SQLite stores booleans as 0/1 integers
function isSynced(scan) {
  return scan.synced === 1 || scan.synced === true;
}

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, item: null });
  const snackbarTimerRef = useRef(null);
  const firstLoadRef = useRef(true);
  const insets = useSafeAreaInsets();

  const refresh = useCallback(async () => {
    const showSpinner = firstLoadRef.current;
    if (showSpinner) setLoading(true);
    try {
      const rows = await loadHistory();
      setHistory(
        rows.map((row) => ({
          ...row,
          display_name: row.display_name || row.disease_class,
          relativeDate: formatRelativeDate(row.scanned_at),
        })),
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to load scan history.');
    } finally {
      firstLoadRef.current = false;
      setLoading(false);
    }
  }, []);

  const onPullToRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refresh);
    return unsubscribe;
  }, [navigation, refresh]);

  useEffect(() => {
    return () => {
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
    };
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      try {
        await deleteHistoryItem(item.id);
        // Soft delete immediately removes it from the list
        setHistory((prev) => prev.filter((row) => row.id !== item.id));

        if (snackbarTimerRef.current) {
          clearTimeout(snackbarTimerRef.current);
        }

        setSnackbar({ visible: true, item });

        snackbarTimerRef.current = setTimeout(() => {
          setSnackbar({ visible: false, item: null });
        }, 4500);
      } catch (err) {
        Alert.alert('Error', err.message || 'Could not delete scan.');
      }
    },
    [],
  );

  const handleUndo = useCallback(async () => {
    if (!snackbar.item) return;
    const restoredItem = snackbar.item;
    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
    setSnackbar({ visible: false, item: null });
    try {
      await restoreHistoryItem(restoredItem.id);
      await refresh();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not restore scan.');
    }
  }, [snackbar.item, refresh]);

  const renderRightActions = useCallback(
    (item) => () => (
      <RectButton
        style={styles.swipeDeleteBg}
        onPress={() => handleDelete(item)}
        accessibilityRole="button"
        accessibilityLabel="Delete scan"
      >
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </RectButton>
    ),
    [handleDelete],
  );

  const handleItemPress = useCallback(
    (item) => {
      navigation.navigate('HistoryDetail', {
        imageUri: item.image_path,
        historyMode: true,
        scanData: item,
      });
    },
    [navigation],
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <Text style={styles.screenTitle}>History</Text>
        </SafeAreaView>
        <LoadingSpinner message="Loading history…" />
      </View>
    );
  }

  const sections = groupByDate(history);

  return (
    <View style={[styles.screen]}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.forest} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>History</Text>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>

      {/* ── Section list ─────────────────────────────────────────── */}
      {sections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onPullToRefresh}
              tintColor={colors.sage}
              colors={[colors.sage]}
            />
          }
        >
          <EmptyState message="No scans yet — take your first photo" />
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onPullToRefresh}
              tintColor={colors.sage}
              colors={[colors.sage]}
            />
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={renderRightActions(item)}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') handleDelete(item);
              }}
              overshootRight={false}
            >
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`Scan record for ${item.display_name || item.disease_class}`}
                activeOpacity={0.8}
              >
                <View style={styles.itemThumbWrap}>
                  {item.image_thumbnail_path || item.image_path ? (
                    <Image
                      source={{ uri: item.image_thumbnail_path || item.image_path }}
                      style={styles.itemThumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.itemIconWrap}>
                      {pickIcon(item)}
                    </View>
                  )}
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.display_name || item.disease_class}
                  </Text>
                  <Text
                    style={[
                      styles.itemSyncLabel,
                      isSynced(item) && styles.itemSyncLabelSynced,
                    ]}
                  >
                    {isSynced(item) ? 'Synced' : 'Not synced'}
                  </Text>
                </View>
                <MoreVertical size={16} color="#9CA3AF" strokeWidth={1.8} />
              </TouchableOpacity>
            </Swipeable>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + Math.max(insets.bottom, 0) },
          ]}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* ── Undo snackbar ────────────────────────────────────────── */}
      {snackbar.visible && (
        <View
          style={[
            styles.snackbar,
            { bottom: 85 + Math.max(insets.bottom, 0) },
          ]}
        >
          <Text style={styles.snackbarText}>Scan deleted</Text>
          <TouchableOpacity
            style={styles.undoBtn}
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo delete"
            activeOpacity={0.8}
          >
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  screenTitle: {
    fontFamily: font(800),
    fontSize: fontSize.lg,
    color: '#111827',
  },

  // ── Section list ─────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    fontFamily: font(800),
    fontSize: fontSize.base,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 12,
    ...softShadow,
  },
  itemThumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemThumbImage: {
    width: 44,
    height: 44,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: font(600),
    fontSize: fontSize.sm,
    color: '#1F2937',
  },
  itemSyncLabel: {
    fontFamily: font(400),
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemSyncLabelSynced: {
    color: colors.sage,
  },
  emptyScroll: {
    flexGrow: 1,
  },

  // ── Swipe delete ─────────────────────────────────────────────
  swipeDeleteBg: {
    width: 88,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 8,
  },
  swipeDeleteText: {
    fontFamily: font(600),
    color: colors.cardBg,
    fontSize: fontSize.sm,
  },

  // ── Snackbar ─────────────────────────────────────────────────
  snackbar: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...softShadow,
    zIndex: 100,
    elevation: 8,
  },
  snackbarText: {
    fontFamily: font(600),
    fontSize: fontSize.sm,
    color: '#F9FAFB',
  },
  undoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  undoBtnText: {
    fontFamily: font(700),
    fontSize: fontSize.sm,
    color: colors.sage,
  },
});
