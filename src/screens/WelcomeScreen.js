import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Leaf } from 'lucide-react-native';
import PrimaryButton from '../components/PrimaryButton';
import { setOnboardingComplete } from '../services/database';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import colors from '../constants/colors';
import { font, fontSize } from '../constants/typography';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await setOnboardingComplete();
      // Replace prevents the user from swiping/navigating back to Welcome
      navigation.replace('Main');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        
        <View style={styles.spacer} />

        {/* ── Icon & Branding ──────────────────────────────────────── */}
        <View style={styles.brandingContainer}>
          <View style={styles.iconCircle}>
            <Leaf size={48} color={colors.forest} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>PlantCare Lite</Text>
        </View>

        {/* ── Value Proposition ────────────────────────────────────── */}
        <View style={styles.textContainer}>
          <Text style={styles.tagline}>
            Offline, on-device plant disease diagnosis for Rice and Cassava.
          </Text>
          <Text style={styles.bodyText}>
            Photograph a leaf and get an instant diagnosis — no internet required.
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* ── Action Button ────────────────────────────────────────── */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Get Started"
            onPress={handleGetStarted}
            loading={loading}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const baseStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Add a soft glow effect
    shadowColor: colors.sage,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  appName: {
    fontFamily: font(800),
    fontSize: 32,
    color: colors.cardBg,
    letterSpacing: -0.5,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: height * 0.1,
  },
  tagline: {
    fontFamily: font(700),
    fontSize: fontSize.xl,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  bodyText: {
    fontFamily: font(400),
    fontSize: fontSize.base,
    color: '#D1D5DB', // light gray for readability on forest
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 24,
  },
});
