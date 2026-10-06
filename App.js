import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { getDatabase, getOnboardingStatus } from './src/services/database';
import colors from './src/constants/colors';

// Keep the splash visible until app is ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ThemedNavigationContainer>
              <ApplicationRoot />
            </ThemedNavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedNavigationContainer({ children }) {
  const { colors } = useTheme();
  const navigationTheme = useMemo(() => ({
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.screen,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.sage,
    },
  }), [colors]);

  return <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>;
}

function ApplicationRoot() {
  const { authReady } = useAuth();
  const { colors, isDark, themeReady } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await getDatabase();
        const onboarded = await getOnboardingStatus();
        setHasOnboarded(onboarded);
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (
    !appIsReady
    || !authReady
    || !themeReady
  ) {
    return null;
  }

  return (
    <ApplicationContent onLayout={onLayoutRootView} backgroundColor={colors.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screen}
      />
      <AppNavigator initialRoute={hasOnboarded ? 'Main' : 'Welcome'} />
    </ApplicationContent>
  );
}

function ApplicationContent({ children, onLayout, backgroundColor }) {
  return (
    <View style={[styles.contentRoot, { backgroundColor }]} onLayout={onLayout}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  contentRoot: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});
