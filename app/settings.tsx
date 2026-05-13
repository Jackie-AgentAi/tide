import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';

const MENU = [
  { key: 'notify', label: '通知提醒', icon: 'notifications-outline' as const },
  { key: 'audio', label: '音频播放', icon: 'musical-notes-outline' as const },
  { key: 'theme', label: '外观主题', icon: 'color-palette-outline' as const },
  { key: 'privacy', label: '数据与隐私', icon: 'shield-checkmark-outline' as const },
  { key: 'about', label: '关于应用', icon: 'information-circle-outline' as const },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FBF6EE', '#F3EDE4']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.botanicalHint, { top: insets.top }]} />

      <ScreenHeader
        title="设置"
        subtitle="偏好与隐私"
        variant="onLight"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + 28,
          paddingTop: 8,
        }}
      >
        <Pressable style={styles.profileCard}>
          <View style={styles.profileMoon}>
            <Ionicons name="moon" size={28} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>Tide Relax</Text>
            <Text style={styles.profileSub}>账户与订阅</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        <View style={styles.menuCard}>
          {MENU.map((row, i) => (
            <Pressable
              key={row.key}
              style={[styles.menuRow, i < MENU.length - 1 && styles.menuRowBorder]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={row.icon} size={22} color={Colors.meditateTitle} />
              </View>
              <Text style={styles.menuLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBF6EE',
  },
  botanicalHint: {
    position: 'absolute',
    right: 0,
    width: 160,
    height: 120,
    opacity: 0.28,
    borderBottomLeftRadius: 80,
    backgroundColor: '#E8DDD0',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: Radii.lg,
    backgroundColor: Colors.white,
    ...Shadows.neumorphicCard,
    marginBottom: 18,
  },
  profileMoon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileSub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  menuCard: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    ...Shadows.neumorphicCard,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  menuIcon: {
    width: 36,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
