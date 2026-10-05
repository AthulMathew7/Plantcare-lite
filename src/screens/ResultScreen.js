import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Share2,
  ShieldCheck,
  Bookmark,
  Flag,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SeverityBadge from '../components/SeverityBadge';
import { runInference, MODEL_VERSION } from '../services/inferenceService';
import { lookupDiseaseInfo, saveScanToHistory } from '../services/database';
import colors from '../constants/colors';
import { font, radius, softShadow, fontSize } from '../constants/typography';

const SEVERITY_LABELS = {
  none: 'Healthy Plant',
  medium: 'Medium Severity',
  high: 'High Severity',
};

export default function ResultScreen({ route, navigation }) {
  const { imageUri, historyMode = false, scanData = null } = route.params || {};
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(!historyMode);
  const [error, setError] = useState(null);
  const [inferenceResult, setInferenceResult] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isUncertain, setIsUncertain] = useState(scanData?.is_uncertain === 1);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (historyMode && scanData) {
      setInferenceResult({
        diseaseClass: scanData.disease_class,
        confidence: scanData.confidence,
      });
      lookupDiseaseInfo(scanData.disease_class)
        .then(setDiseaseInfo)
        .catch(() => setDiseaseInfo(null));
      return;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        console.log('[PlantCare][Scan] IMAGE URI:', imageUri);
        const result = await runInference(imageUri);
        if (cancelled) return;
        console.log('[PlantCare][Scan] RESULT:', {
          diseaseClass: result.diseaseClass,
          confidence: result.confidence,
          crop: result.crop,
          condition: result.condition,
          modelVersion: result.modelVersion,
        });
        setInferenceResult(result);
        const info = await lookupDiseaseInfo(result.diseaseClass);
        if (!cancelled) setDiseaseInfo(info);
      } catch (err) {
        if (!cancelled) {
          setInferenceResult(null);
          setDiseaseInfo(null);
          setError(err.message || 'Inference failed.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [imageUri, historyMode, scanData, retryKey]);

  const onFlagUncertain = useCallback(() => {
    setIsUncertain(true);
    Alert.alert('Flagged as uncertain', 'This scan will be marked uncertain when saved.');
  }, []);

  const onSave = useCallback(async () => {
    if (!inferenceResult) return;
    setSaving(true);
    try {
      await saveScanToHistory(
        imageUri,
        inferenceResult.diseaseClass,
        inferenceResult.confidence,
        isUncertain,
        MODEL_VERSION,
      );
      Alert.alert('Saved', 'Scan saved to your history.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save scan.');
    } finally {
      setSaving(false);
    }
  }, [inferenceResult, imageUri, isUncertain, navigation]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `PlantCare diagnosis: ${diseaseInfo?.display_name || inferenceResult?.diseaseClass || 'Unknown'} — ${Math.round((inferenceResult?.confidence || 0) * 100)}% confidence`,
      });
    } catch (_) {}
  }, [diseaseInfo, inferenceResult]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.loadingHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={20} color={colors.forest} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <LoadingSpinner message="Analyzing leaf with ML model…" />
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error || !inferenceResult) {
    return (
      <View style={styles.fullScreen}>
        <View style={[styles.loadingHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={20} color={colors.forest} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorBody}>
          <AlertCircle size={48} color={colors.coral} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Diagnosis failed</Text>
          <Text style={styles.errorSubtitle}>{error || 'No diagnosis is available.'}</Text>
          {error && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setRetryKey((k) => k + 1)}
              activeOpacity={0.8}
            >
              <RefreshCcw size={16} color={colors.forest} strokeWidth={2.5} />
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.backTextBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backTextBtnLabel}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const treatmentSteps = diseaseInfo?.treatment
    ? diseaseInfo.treatment.split('. ').filter(Boolean)
    : [];

  const displayName = diseaseInfo?.display_name || inferenceResult.diseaseClass;
  const severityLabel = SEVERITY_LABELS[diseaseInfo?.severity] || null;

  return (
    <View style={styles.fullScreen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: historyMode ? 32 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Image header ───────────────────────────────────────── */}
        <View style={styles.imageHeader}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.headerImage, styles.headerImagePlaceholder]} />
          )}

          <View style={styles.imageGradient} />

          <TouchableOpacity
            style={[styles.floatBtn, { top: insets.top + 12, left: 16 }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color={colors.forest} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatBtn, { top: insets.top + 12, right: 16 }]}
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Share diagnosis"
            activeOpacity={0.8}
          >
            <Share2 size={16} color={colors.forest} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Cards area ─────────────────────────────────────────── */}
        <View style={styles.cardsArea}>

          {/* Result title card */}
          <View style={styles.card}>
            <View style={styles.resultTitleRow}>
              <View style={{ flex: 1 }}>
                {severityLabel && (
                  <Text style={styles.typeLabel}>{severityLabel.toUpperCase()}</Text>
                )}
                <Text style={styles.diseaseName}>{displayName}</Text>
                {diseaseInfo?.description && (
                  <Text style={styles.diseaseDesc} numberOfLines={3}>
                    {diseaseInfo.description}
                  </Text>
                )}
              </View>
              <View style={styles.badgesWrap}>
                <ConfidenceBadge confidence={inferenceResult.confidence} />
                {diseaseInfo?.severity && (
                  <SeverityBadge severity={diseaseInfo.severity} />
                )}
              </View>
            </View>
          </View>

          {/* Treatment steps card */}
          {treatmentSteps.length > 0 && (
            <View style={styles.card}>
              <View style={styles.treatmentHeader}>
                <ShieldCheck size={16} color={colors.sage} strokeWidth={2.5} />
                <Text style={styles.treatmentTitle}>Recommended Care</Text>
              </View>
              {treatmentSteps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>
                    {step.endsWith('.') ? step : step + '.'}
                  </Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Fixed bottom action bar (hidden in historyMode) ──────── */}
      {!historyMode && (
        <View
          style={[
            styles.actionBar,
            { paddingBottom: Math.max(insets.bottom + 4, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={onSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save scan to history"
            activeOpacity={0.8}
          >
            <Bookmark size={16} color={colors.forest} strokeWidth={2} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.flagBtn, isUncertain && styles.flagBtnDone]}
            onPress={onFlagUncertain}
            disabled={isUncertain}
            accessibilityRole="button"
            accessibilityLabel="Flag diagnosis as uncertain"
            activeOpacity={0.8}
          >
            <Flag size={16} color={colors.forest} strokeWidth={2} />
            <Text style={styles.flagBtnText}>
              {isUncertain ? 'Flagged' : 'Flag uncertain'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  imageHeader: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImagePlaceholder: {
    backgroundColor: '#CBD5E1',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  floatBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  cardsArea: {
    paddingHorizontal: 20,
    marginTop: -32,
    gap: 12,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
    ...softShadow,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badgesWrap: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  typeLabel: {
    fontFamily: font(700),
    fontSize: 10,
    color: colors.coral,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  diseaseName: {
    fontFamily: font(800),
    fontSize: fontSize.xl,
    color: '#111827',
    lineHeight: 28,
  },
  diseaseDesc: {
    fontFamily: font(400),
    fontSize: fontSize.xs,
    color: '#9CA3AF',
    marginTop: 3,
    lineHeight: 17,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  treatmentTitle: {
    fontFamily: font(800),
    fontSize: fontSize.sm,
    color: colors.forest,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${colors.cream}CC`,
    borderRadius: 16,
    padding: 10,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontFamily: font(700),
    fontSize: 10,
    color: colors.forest,
  },
  stepText: {
    flex: 1,
    fontFamily: font(400),
    fontSize: fontSize.sm,
    color: '#374151',
    lineHeight: 19,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.cream,
    borderRadius: 9999,
    paddingVertical: 13,
  },
  saveBtnText: {
    fontFamily: font(700),
    fontSize: fontSize.sm,
    color: colors.forest,
  },
  flagBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.sage,
    borderRadius: 9999,
    paddingVertical: 13,
    ...softShadow,
  },
  flagBtnDone: {
    backgroundColor: '#D1FAE5',
  },
  flagBtnText: {
    fontFamily: font(800),
    fontSize: fontSize.sm,
    color: colors.forest,
  },
  loadingHeader: {
    paddingHorizontal: 20,
    paddingTop: 56,
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
  errorBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontFamily: font(800),
    fontSize: fontSize.xl,
    color: colors.forest,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontFamily: font(400),
    fontSize: fontSize.base,
    color: colors.subtleText,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.sage,
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 4,
  },
  retryBtnText: {
    fontFamily: font(700),
    fontSize: fontSize.base,
    color: colors.forest,
  },
  backTextBtn: {
    paddingVertical: 10,
  },
  backTextBtnLabel: {
    fontFamily: font(600),
    fontSize: fontSize.base,
    color: colors.subtleText,
  },
});
