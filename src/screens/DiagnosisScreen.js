import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { History } from 'lucide-react-native';
import { getAllDiseases } from '../services/database';
import colors from '../constants/colors';
import { font, softShadow, fontSize } from '../constants/typography';

const FILTER_OPTIONS = ['All', 'Rice', 'Cassava'];

// Helper to provide a generic leafy thumbnail for the cards, matching the mockup's aesthetic
function getThumbnailUrl(index) {
  const urls = [
    'https://images.unsplash.com/photo-1614745585098-b80c3e986bf3?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1592982537447-6f2334208f34?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=150&q=80',
  ];
  return urls[index % urls.length];
}

export default function DiagnosisScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [diseases, setDiseases] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    async function fetchDiseases() {
      try {
        const data = await getAllDiseases();
        setDiseases(data);
      } catch (err) {
        console.warn(err);
      }
    }
    fetchDiseases();
  }, []);

  const filteredDiseases = diseases.filter((d) => {
    if (activeFilter === 'All') return true;
    return d.class_name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const navigateToHistory = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const navigateToScan = useCallback(() => {
    navigation.navigate('Capture');
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        {/* Top Title Bar */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.screenTitle}>Diagnosis</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={navigateToHistory}
            accessibilityRole="button"
            accessibilityLabel="View scan history"
            activeOpacity={0.7}
          >
            <History size={16} color={colors.forest} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + Math.max(insets.bottom, 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Plant Health Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Is your plant 🪴 looking healthy?</Text>
            <Text style={styles.heroSubtitle}>
              Scan or use images of your plant to identify issues.
            </Text>
            <TouchableOpacity
              style={styles.diagnoseBtn}
              onPress={navigateToScan}
              activeOpacity={0.8}
            >
              <Text style={styles.diagnoseBtnText}>Diagnose now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Common Problems Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Common Problems</Text>
          
          {/* Category Filter Pills Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            style={styles.filterScroll}
          >
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    isActive ? styles.filterPillActive : styles.filterPillInactive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                    ]}
                  >
                    {filter === 'All' ? 'All' : `${filter} Diseases`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Disease Cards List */}
        <View style={styles.listContainer}>
          {filteredDiseases.map((disease, index) => (
            <View key={disease.class_name} style={styles.diseaseCard}>
              <Image
                source={{ uri: getThumbnailUrl(index) }}
                style={styles.diseaseThumb}
              />
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseName}>{disease.display_name}</Text>
                <Text style={styles.diseaseDesc} numberOfLines={2}>
                  {disease.description}
                </Text>
              </View>
            </View>
          ))}
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
  headerSafe: {
    backgroundColor: colors.cream,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    fontFamily: font(800),
    fontSize: fontSize.lg,
    color: '#111827',
  },
  historyBtn: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 20,
    ...softShadow,
    shadowOpacity: 0.15,
  },
  heroContent: {
    flex: 1,
    maxWidth: 180,
    zIndex: 10,
  },
  heroTitle: {
    fontFamily: font(800),
    fontSize: fontSize.sm,
    color: colors.cardBg,
    lineHeight: 20,
  },
  heroSubtitle: {
    fontFamily: font(400),
    fontSize: 10,
    color: '#D1D5DB', // gray-300
    marginTop: 4,
  },
  diagnoseBtn: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginTop: 12,
    ...softShadow,
  },
  diagnoseBtnText: {
    fontFamily: font(800),
    fontSize: fontSize.xs,
    color: colors.forest,
  },
  heroImageContainer: {
    width: 96,
    height: 112,
    zIndex: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  // Section
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: font(800),
    fontSize: fontSize.sm,
    color: '#111827',
    marginBottom: 10,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    ...softShadow,
  },
  filterPillActive: {
    backgroundColor: colors.navy,
  },
  filterPillInactive: {
    backgroundColor: colors.cardBg,
  },
  filterPillText: {
    fontFamily: font(600),
    fontSize: fontSize.xs,
  },
  filterPillTextActive: {
    color: colors.cardBg,
  },
  filterPillTextInactive: {
    color: '#4B5563', // gray-600
  },

  // List
  listContainer: {
    gap: 12,
  },
  diseaseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...softShadow,
  },
  diseaseThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontFamily: font(800),
    fontSize: fontSize.xs,
    color: '#111827',
  },
  diseaseDesc: {
    fontFamily: font(500),
    fontSize: 10,
    color: '#6B7280', // gray-500
    marginTop: 2,
    lineHeight: 14,
  },
});
