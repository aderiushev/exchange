import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TamaguiProvider } from 'tamagui';
import { AppState } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import tamaguiConfig from './tamagui.config';
import { RubToUsdtScreen } from './src/screens/RubToUsdtScreen';
import { UsdtToEurScreen } from './src/screens/UsdtToEurScreen';
import { RubToEurScreen } from './src/screens/RubToEurScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { useExchangeStore } from './src/store/exchangeStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

export default function App() {
  const { fetchAllRates, refreshRates } = useExchangeStore();
  const [appIsReady, setAppIsReady] = useState(false);

  // Load Inter fonts required by Tamagui
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  // Wait for fonts to load before rendering
  useEffect(() => {
    if (loaded) {
      setAppIsReady(true);
    }
  }, [loaded]);

  // Fetch rates on initial load
  useEffect(() => {
    if (appIsReady) {
      fetchAllRates();
    }
  }, [appIsReady]);

  // Refresh rates when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshRates();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerStyle: {
                backgroundColor: '#1f2937',
              },
              headerTintColor: '#f9fafb',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              tabBarStyle: {
                backgroundColor: '#1f2937',
                borderTopColor: '#374151',
              },
              tabBarActiveTintColor: '#60a5fa',
              tabBarInactiveTintColor: '#9ca3af',
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'RUB → USDT') {
                  iconName = focused ? 'cash' : 'cash-outline';
                } else if (route.name === 'USDT → EUR') {
                  iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
                } else if (route.name === 'RUB → EUR') {
                  iconName = focused ? 'analytics' : 'analytics-outline';
                } else if (route.name === 'History') {
                  iconName = focused ? 'time' : 'time-outline';
                } else {
                  iconName = 'help-circle-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen
              name="RUB → USDT"
              component={RubToUsdtScreen}
              options={{
                title: 'RUB → USDT',
              }}
            />
            <Tab.Screen
              name="USDT → EUR"
              component={UsdtToEurScreen}
              options={{
                title: 'USDT → EUR',
              }}
            />
            <Tab.Screen
              name="RUB → EUR"
              component={RubToEurScreen}
              options={{
                title: 'RUB → EUR',
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'History',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
