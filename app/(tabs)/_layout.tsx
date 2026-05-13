import { Tabs } from 'expo-router';
import { MainTabBar } from '@/components/MainTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="sleep" options={{ title: '睡眠' }} />
      <Tabs.Screen name="focus" options={{ title: '专注' }} />
      <Tabs.Screen name="breathe" options={{ title: '呼吸' }} />
      <Tabs.Screen name="meditate" options={{ title: '冥想' }} />
    </Tabs>
  );
}
