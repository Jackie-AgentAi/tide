import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';

type TabVisual = {
  name: string;
  label: string;
  active: number;
  outline: number;
  activeTint: string;
};

const TAB_VISUALS: TabVisual[] = [
  {
    name: 'sleep',
    label: '睡眠',
    active: DesignAssets.tabSleepActive,
    outline: DesignAssets.tabSleepOutline,
    activeTint: Colors.tabSleepActive,
  },
  {
    name: 'focus',
    label: '专注',
    active: DesignAssets.tabFocusActive,
    outline: DesignAssets.tabFocusOutline,
    activeTint: Colors.tabFocusActive,
  },
  {
    name: 'breathe',
    label: '呼吸',
    active: DesignAssets.tabBreatheActive,
    outline: DesignAssets.tabBreatheOutline,
    activeTint: Colors.tabBreatheActive,
  },
  {
    name: 'meditate',
    label: '冥想',
    active: DesignAssets.tabMeditateActive,
    outline: DesignAssets.tabMeditateOutline,
    activeTint: Colors.tabMeditateActive,
  },
];

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const visual = TAB_VISUALS.find((t) => t.name === route.name);
          if (!visual) {
            return null;
          }
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              onPress={onPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.iconBubble,
                  focused && { backgroundColor: `${visual.activeTint}22` },
                ]}
              >
                <Image
                  source={focused ? visual.active : visual.outline}
                  style={styles.tabIcon}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: focused ? visual.activeTint : Colors.tabInactive },
                ]}
              >
                {visual.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.tabBarBg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  item: {
    alignItems: 'center',
    minWidth: 64,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 40,
    height: 40,
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
