import { Stack } from 'expo-router';

export default function BreatheStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
