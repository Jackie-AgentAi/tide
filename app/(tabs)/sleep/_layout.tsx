import { Stack } from 'expo-router';

export default function SleepStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="play" />
      <Stack.Screen name="timer" />
      <Stack.Screen name="alarm" />
    </Stack>
  );
}
