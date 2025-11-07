import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Root as PopupRootProvider } from '@sekizlipenguen/react-native-popup-confirm-toast';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    Google_Sans_Code: require('@/assets/fonts/GoogleSansCode.ttf'),
    Fira_Code: require('@/assets/fonts/FiraCode.ttf')
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PopupRootProvider>
      <GestureHandlerRootView>
        <ThemeProvider value={{ ...NAV_THEME[colorScheme ?? 'light'], dark: colorScheme === 'dark' }}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="models" options={{ presentation: 'modal', title: 'Available Models' }} />
            <Stack.Screen name="settings" options={{ headerTitle: 'Settings', headerBackButtonDisplayMode: 'minimal', headerTransparent: true }} />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </PopupRootProvider>
  );
}
