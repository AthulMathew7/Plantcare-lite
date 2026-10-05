import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Lucide icons
import {
  Camera,
  History,
  Settings,
  Stethoscope,
} from 'lucide-react-native';

import CaptureScreen from '../screens/CaptureScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DiagnosisScreen from '../screens/DiagnosisScreen';
import colors from '../constants/colors';
import { font, softShadow } from '../constants/typography';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Stacks ────────────────────────────────────────────────────────────────

function CaptureStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CaptureHome" component={CaptureScreen} />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen
        name="HistoryDetail"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ─── Custom floating pill tab bar ──────────────────────────────────────────

const TAB_CONFIG = [
  { name: 'Capture', label: 'Scan', Icon: Camera },
  { name: 'Diagnosis', label: 'Diagnose', Icon: Stethoscope },
  { name: 'History', label: 'History', Icon: History },
  { name: 'Settings', label: 'Settings', Icon: Settings },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { label, Icon } = TAB_CONFIG[index] || {};
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isFocused }}
            >
              <Icon
                size={22}
                color={isFocused ? colors.forest : '#9CA3AF'}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Root tab navigator ────────────────────────────────────────────────────

import WelcomeScreen from '../screens/WelcomeScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator({ initialRoute }) {
  return (
    <RootStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Welcome" component={WelcomeScreen} />
      <RootStack.Screen name="Main" component={TabNavigator} />
    </RootStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Capture" component={CaptureStack} />
      <Tab.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 9999,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...softShadow,
    shadowOpacity: 0.12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
  },
  tabLabelActive: {
    fontFamily: font(700),
    color: colors.forest,
  },
  tabLabelInactive: {
    fontFamily: font(500),
    color: '#9CA3AF',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.forest,
    marginTop: 2,
  },
});
