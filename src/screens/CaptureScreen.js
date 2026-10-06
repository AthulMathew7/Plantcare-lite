import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Leaf, ScanLine, Lightbulb, X } from 'lucide-react-native';
import { persistScanImage } from '../services/imageStorage';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import colors from '../constants/colors';
import { font, radius, softShadow, fontSize } from '../constants/typography';

export default function CaptureScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const [imageUri, setImageUri] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const onImageSelected = useCallback(
    async (uri) => {
      try {
        console.log('[PlantCare][Scan] SELECTED IMAGE URI:', uri);
        const persistentUri = await persistScanImage(uri);
        console.log('[PlantCare][Scan] PERSISTED IMAGE URI:', persistentUri);
        setImageUri(persistentUri);
        navigation.navigate('Result', { imageUri: persistentUri });
      } catch (err) {
        Alert.alert('Could not keep photo', err.message || 'The image could not be saved on this device.');
      }
    },
    [navigation],
  );

  const triggerCameraLaunch = useCallback(async () => {
    setPickerLoading(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission denied',
          'Camera access is needed to take photos. Please enable it in Settings.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (uri) await onImageSelected(uri);
      }
    } catch (err) {
      Alert.alert('Camera error', err.message || 'Could not open camera.');
    } finally {
      setPickerLoading(false);
    }
  }, [onImageSelected]);

  const openCamera = useCallback(async () => {
    try {
      const existing = await ImagePicker.getCameraPermissionsAsync();
      if (existing.granted) {
        await triggerCameraLaunch();
        return;
      }
      Alert.alert(
        'Camera Permission',
        'PlantCare Lite needs camera access to photograph leaves for diagnosis.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: triggerCameraLaunch },
        ],
      );
    } catch {
      await triggerCameraLaunch();
    }
  }, [triggerCameraLaunch]);

  const triggerGalleryLaunch = useCallback(async () => {
    setPickerLoading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Photo library access is needed to select an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (uri) await onImageSelected(uri);
      }
    } catch (err) {
      Alert.alert('Gallery error', err.message || 'Could not open gallery.');
    } finally {
      setPickerLoading(false);
    }
  }, [onImageSelected]);

  const openGallery = useCallback(async () => {
    try {
      const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (existing.granted) {
        await triggerGalleryLaunch();
        return;
      }
      Alert.alert(
        'Photo Library Permission',
        'PlantCare Lite needs photo library access to choose leaf images for diagnosis.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: triggerGalleryLaunch },
        ],
      );
    } catch {
      await triggerGalleryLaunch();
    }
  }, [triggerGalleryLaunch]);

  return (
    <View style={styles.screen}>
      {/* ── Forest hero header ───────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroWelcome}>Welcome back!</Text>
              <Text style={styles.heroTitle}>PlantCare</Text>
            </View>
            <View style={styles.heroLeafIcon}>
              <Leaf size={18} color={colors.forest} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            Scan a leaf to check its health
          </Text>
        </View>
      </SafeAreaView>

      {/* ── Cream body ───────────────────────────────────────────── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Camera action card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={openCamera}
          activeOpacity={0.85}
          disabled={pickerLoading}
          accessibilityRole="button"
          accessibilityLabel="Take a photo of a leaf with camera"
        >
          <View style={styles.actionCardLeft}>
            <View style={[styles.iconBubble, { backgroundColor: '#FFF3E5' }]}>
              <Camera size={22} color={colors.coral} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.actionCardTitle}>Camera</Text>
              <Text style={styles.actionCardSub}>Take a photo of a leaf</Text>
            </View>
          </View>
          <View style={styles.scanPill}>
            <ScanLine size={14} color={colors.forest} strokeWidth={2.5} />
            <Text style={styles.scanPillText}>Scan</Text>
          </View>
        </TouchableOpacity>

        {/* Gallery action card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={openGallery}
          activeOpacity={0.85}
          disabled={pickerLoading}
          accessibilityRole="button"
          accessibilityLabel="Choose a leaf photo from gallery"
        >
          <View style={styles.actionCardLeft}>
            <View style={[styles.iconBubble, { backgroundColor: '#E5F3FF' }]}>
              <ImageIcon size={22} color="#3B82F6" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.actionCardTitle}>Gallery</Text>
              <Text style={styles.actionCardSub}>Choose from your library</Text>
            </View>
          </View>
          <View style={styles.scanPill}>
            <ScanLine size={14} color={colors.forest} strokeWidth={2.5} />
            <Text style={styles.scanPillText}>Pick</Text>
          </View>
        </TouchableOpacity>

        {/* Image preview card (shown after selection) */}
        {imageUri ? (
          <View style={styles.previewCard}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewLabel}>
              <Leaf size={14} color={colors.sage} strokeWidth={2} />
              <Text style={styles.previewLabelText}>Selected — tap Scan to analyze</Text>
            </View>
          </View>
        ) : (
          /* Empty preview state with dismissible tip */
          <View style={styles.emptyWrap}>
            {showTip && (
              <View style={styles.tipBanner}>
                <View style={styles.tipIconWrap}>
                  <Lightbulb size={16} color="#B45309" strokeWidth={2.2} />
                </View>
                <Text style={styles.tipText}>
                  Tip: Use good lighting and fill the frame with the leaf for best results.
                </Text>
                <TouchableOpacity
                  style={styles.tipDismissBtn}
                  onPress={() => setShowTip(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss photo tip"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={15} color="#92400E" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}

            {/* Empty hint card when no image */}
            <View style={styles.hintCard}>
              <Leaf size={40} color={colors.forest} strokeWidth={1.5} style={{ opacity: 0.4 }} />
              <Text style={styles.hintTitle}>No image selected</Text>
              <Text style={styles.hintSub}>Use Camera or Gallery above to get started</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // ── Hero header ───────────────────────────────────────────────
  hero: {
    backgroundColor: colors.forest,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroWelcome: {
    fontFamily: font(500),
    fontSize: fontSize.xs,
    color: '#D1D5DB',
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: font(800),
    fontSize: 24,
    color: colors.cardBg,
    letterSpacing: -0.5,
  },
  heroLeafIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    fontFamily: font(500),
    fontSize: fontSize.sm,
    color: colors.sage,
    marginTop: 2,
  },

  // ── Body ──────────────────────────────────────────────────────
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // clear floating nav
    gap: 14,
  },

  // ── Action cards ──────────────────────────────────────────────
  actionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...softShadow,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontFamily: font(800),
    fontSize: fontSize.base,
    color: '#111827',
    marginBottom: 2,
  },
  actionCardSub: {
    fontFamily: font(500),
    fontSize: fontSize.xs,
    color: '#9CA3AF',
  },
  scanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.sage,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  scanPillText: {
    fontFamily: font(700),
    fontSize: fontSize.xs,
    color: colors.forest,
  },

  // ── Preview card ──────────────────────────────────────────────
  previewCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...softShadow,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  previewLabelText: {
    fontFamily: font(600),
    fontSize: fontSize.xs,
    color: colors.subtleText,
  },

  // ── Hint card ─────────────────────────────────────────────────
  hintCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...softShadow,
  },
  hintTitle: {
    fontFamily: font(700),
    fontSize: fontSize.lg,
    color: colors.forest,
    marginTop: 8,
  },
  hintSub: {
    fontFamily: font(400),
    fontSize: fontSize.sm,
    color: colors.subtleText,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // ── Empty preview & tips ──────────────────────────────────────
  emptyWrap: {
    gap: 12,
  },
  tipBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...softShadow,
  },
  tipIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontFamily: font(500),
    fontSize: fontSize.xs,
    color: '#78350F',
    lineHeight: 18,
  },
  tipDismissBtn: {
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
