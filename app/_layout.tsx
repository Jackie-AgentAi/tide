import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SleepAlarmScheduler } from '@/components/SleepAlarmScheduler';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SleepAlarmScheduler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
