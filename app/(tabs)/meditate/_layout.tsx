import { Stack } from 'expo-router';

export default function MeditateStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
