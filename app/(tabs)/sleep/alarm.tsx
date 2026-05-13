import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';

export default function AlarmRingingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    hour?: string;
    minute?: string;
    alarm?: string;
  }>();

  const time =
    params.hour && params.minute
      ? `${params.hour}:${params.minute}`
      : '07:30';
  const alarmName = params.alarm ?? 'Morning Joy';

  const stopAlarm = () => {
    router.replace('/sleep');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FF7096', '#E879F9', '#A855F7']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <View style={[styles.cloud, { top: insets.top + 40 }]} />
      <View style={[styles.cloudSmall, { top: insets.top + 90 }]} />

      <View style={[styles.body, { paddingTop: insets.top + 36 }]}>
        <Text style={styles.title}>该起床了</Text>
        <Text style={styles.subtitle}>闹钟正在播放</Text>

        <Text style={styles.bigTime}>{time}</Text>

        <View style={styles.heroFrame}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.08)']}
            style={styles.heroGlow}
          >
            <View style={styles.clockBubble}>
              <Ionicons name="alarm" size={52} color="#FFF" />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.status}>
          白噪音已停止 · {alarmName}
        </Text>

        <Pressable style={styles.primaryBtn} onPress={stopAlarm}>
          <Text style={styles.primaryBtnText}>停止闹钟</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FF7096',
  },
  cloud: {
    position: 'absolute',
    left: -30,
    width: 140,
    height: 56,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cloudSmall: {
    position: 'absolute',
    right: -20,
    width: 110,
    height: 44,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  bigTime: {
    marginTop: 28,
    fontSize: 56,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 3,
  },
  heroFrame: {
    marginTop: 36,
    marginBottom: 28,
  },
  heroGlow: {
    width: 220,
    height: 220,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    ...Shadows.neumorphicCard,
  },
  clockBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 28,
  },
  primaryBtn: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 28,
    paddingVertical: 16,
    borderRadius: Radii.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    ...Shadows.neumorphicCard,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FF7096',
    letterSpacing: 2,
  },
});
