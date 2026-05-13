import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';

const MODE_LABEL: Record<string, string> = {
  box: '4-4-4-4',
  relax: '4-7-8',
  balance: '5-5',
};

export default function BreatheCompleteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const modeLabel = MODE_LABEL[params.mode ?? 'box'] ?? '4-4-4-4';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#DDD6FE', '#EDE9FE', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.orbDeco, { top: insets.top + 40 }]} />
      <View style={[styles.orbDeco2, { top: insets.top + 120 }]} />

      <View style={[styles.body, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.title}>练习完成</Text>

        <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.checkGlow}>
          <View style={styles.checkInner}>
            <Ionicons name="checkmark" size={52} color="#FFF" />
          </View>
        </LinearGradient>

        <Text style={styles.statBig}>05:00</Text>
        <Text style={styles.statLabel}>总时长</Text>

        <View style={styles.summary}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>模式</Text>
            <Text style={styles.summaryHint}>{modeLabel}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>循环</Text>
            <Text style={styles.summaryHint}>19 次</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>平均节奏</Text>
            <Text style={styles.summaryHint}>稳定</Text>
          </View>
        </View>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 88 }]}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.replace('/breathe')}
          >
            <Text style={styles.btnPrimaryText}>再练一次</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() => router.replace('/breathe')}
          >
            <Text style={styles.btnGhostText}>返回呼吸</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#DDD6FE',
  },
  orbDeco: {
    position: 'absolute',
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  orbDeco2: {
    position: 'absolute',
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(167,139,250,0.2)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#5B21B6',
    letterSpacing: 1,
  },
  checkGlow: {
    marginTop: 28,
    marginBottom: 22,
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.neumorphicCard,
  },
  checkInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBig: {
    fontSize: 40,
    fontWeight: '900',
    color: '#5B21B6',
    letterSpacing: 2,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 22,
  },
  summary: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    padding: 16,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...Shadows.neumorphicCard,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryHint: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    paddingVertical: 15,
    borderRadius: Radii.xl,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    ...Shadows.neumorphicCard,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  btnGhost: {
    paddingVertical: 15,
    borderRadius: Radii.xl,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
});
