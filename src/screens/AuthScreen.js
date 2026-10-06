import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { isAuthConfigured } from '../services/authService';
import colors from '../constants/colors';
import { font, fontSize, radius } from '../constants/typography';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const {
    status,
    pendingLink,
    error: authError,
    continueAsGuest,
    signIn,
    signUp,
    finishLocalLink,
  } = useAuth();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const configured = isAuthConfigured();

  useEffect(() => {
    if (status === 'authenticated' && navigation.isFocused()) {
      navigation.goBack();
    }
  }, [navigation, status]);

  const submit = async () => {
    setError('');
    const normalizedEmail = email.trim();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    if (creatingAccount) {
      if (!displayName.trim()) {
        setError('Enter your display name.');
        return;
      }
      if (password.length < 8) {
        setError('Use a password with at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (creatingAccount) {
        await signUp(normalizedEmail, password, displayName.trim());
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const completeLink = async (importLocalData) => {
    setBusy(true);
    setError('');
    try {
      await finishLocalLink(importLocalData);
    } catch (linkError) {
      setError(linkError.message || 'Could not link your local history.');
    } finally {
      setBusy(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setBusy(true);
    setError('');
    try {
      await continueAsGuest();
      navigation.goBack();
    } catch (guestError) {
      setError(guestError.message || 'Could not switch to guest mode.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'resolving' || status === 'loading') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.forest} />
          <Text style={styles.loadingText}>Preparing your local profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'linking' && pendingLink) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Brand />
          <Text style={styles.title}>Your local scans</Text>
          <Text style={styles.description}>
            This device has {pendingLink.legacyScanCount} saved scan
            {pendingLink.legacyScanCount === 1 ? '' : 's'} under the existing Farmer profile.
            Choose whether to associate those scans with {pendingLink.authUser.email}.
          </Text>
          <Text style={styles.notice}>
            Scan records and photos stay on this device. Only account details are sent to Firebase Authentication.
          </Text>
          {(error || authError) ? <Text style={styles.error}>{error || authError}</Text> : null}
          <ActionButton
            title={`Import ${pendingLink.legacyScanCount} local scan${pendingLink.legacyScanCount === 1 ? '' : 's'}`}
            onPress={() => completeLink(true)}
            disabled={busy}
            busy={busy}
          />
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleContinueAsGuest}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>or sign in to save your account</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => completeLink(false)}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Keep local history separate</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Brand />
          <Text style={styles.title}>
            {creatingAccount ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={styles.description}>
            Sign in to your PlantCare account. Scanning and saved history remain on this device.
          </Text>

          {!configured && (
            <Text style={styles.notice}>
              Firebase isn’t configured for this build. Set the Firebase Expo public
              configuration values before creating a new development build.
            </Text>
          )}
          {(error || authError) ? <Text style={styles.error}>{error || authError}</Text> : null}

          {creatingAccount && (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              autoCapitalize="words"
              textContentType="name"
              editable={!busy}
              returnKeyType="next"
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!busy}
            returnKeyType="next"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            secureTextEntry
            textContentType={creatingAccount ? 'newPassword' : 'password'}
            editable={!busy}
            returnKeyType={creatingAccount ? 'next' : 'go'}
            onSubmitEditing={creatingAccount ? undefined : submit}
          />
          {creatingAccount && (
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              secureTextEntry
              textContentType="newPassword"
              editable={!busy}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          )}

          <ActionButton
            title={creatingAccount ? 'Create account' : 'Log in'}
            onPress={submit}
            disabled={busy || !configured}
            busy={busy}
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setCreatingAccount((current) => !current);
              setError('');
            }}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              {creatingAccount ? 'Already have an account? Log in' : 'Create an account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Brand() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.brand}>
      <View style={styles.brandIcon}>
        <Leaf size={30} color={colors.forest} strokeWidth={2.2} />
      </View>
      <Text style={styles.brandName}>PlantCare Lite</Text>
    </View>
  );
}

function ActionButton({ title, onPress, disabled, busy }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {busy
        ? <ActivityIndicator color={colors.cardBg} />
        : <Text style={styles.primaryButtonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.subtleText,
    fontFamily: font(500),
    fontSize: fontSize.sm,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    height: 68,
    width: 68,
    borderRadius: 34,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandName: {
    color: colors.forest,
    fontFamily: font(800),
    fontSize: fontSize.xl,
  },
  title: {
    color: '#111827',
    fontFamily: font(800),
    fontSize: fontSize.xl,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: colors.subtleText,
    fontFamily: font(400),
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: 22,
    textAlign: 'center',
  },
  notice: {
    backgroundColor: '#FFF7E6',
    borderRadius: radius.md,
    color: '#854D0E',
    fontFamily: font(500),
    fontSize: fontSize.xs,
    lineHeight: 19,
    marginBottom: 16,
    padding: 12,
  },
  error: {
    color: colors.coral,
    fontFamily: font(500),
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    color: '#111827',
    fontFamily: font(400),
    fontSize: fontSize.base,
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.cardBg,
    fontFamily: font(700),
    fontSize: fontSize.base,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  guestButton: {
    alignItems: 'center',
    backgroundColor: '#E6EFE8',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 20,
  },
  guestButtonText: {
    color: colors.forest,
    fontFamily: font(700),
    fontSize: fontSize.base,
  },
  separator: {
    color: colors.subtleText,
    fontFamily: font(400),
    fontSize: fontSize.xs,
    marginTop: 16,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: colors.forest,
    fontFamily: font(600),
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
