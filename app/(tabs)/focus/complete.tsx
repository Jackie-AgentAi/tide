import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';

export default function FocusCompleteScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#D9F4EC', '#FFF7FB', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.confettiDot, { top: insets.top + 24, left: 30 }]} />
      <View style={[styles.confettiDot2, { top: insets.top + 60, right: 26 }]} />

      <View style={[styles.body, { paddingTop: insets.top + 28 }]}>
        <Text style={styles.title}>专注完成</Text>

        <View style={styles.checkWrap}>
          <LinearGradient
            colors={['#FF7096', '#EC4899']}
            style={styles.checkCircle}
          >
            <Ionicons name="checkmark" size={56} color="#FFF" />
          </LinearGradient>
        </View>

        <Text style={styles.statBig}>25 分钟</Text>
        <Text style={styles.statLabel}>专注时间</Text>

        <View style={styles.summary}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>完成 1 轮</Text>
            <Text style={styles.summaryHint}>番茄</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal} numberOfLines={2}>
              背景音{'\n'}轻柔钢琴
            </Text>
            <Text style={styles.summaryHint}>声音</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>沉浸模式</Text>
            <Text style={styles.summaryHint}>成功</Text>
          </View>
        </View>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 88 }]}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.push('/focus/active')}
          >
            <Text style={styles.btnPrimaryText}>再来一轮</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() => router.replace('/focus')}
          >
            <Text style={styles.btnGhostText}>返回专注</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D9F4EC',
  },
  confettiDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(236,72,153,0.35)',
  },
  confettiDot2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(52,211,153,0.5)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.focusTitle,
    letterSpacing: 1,
  },
  checkWrap: {
    marginTop: 28,
    marginBottom: 22,
  },
  checkCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.neumorphicCard,
  },
  statBig: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.focusTitle,
    letterSpacing: 1,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.focusMuted,
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
    textAlign: 'center',
    lineHeight: 16,
  },
  summaryHint: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actions: {
    marginTop: 'auto',
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    paddingVertical: 15,
    borderRadius: Radii.xl,
    backgroundColor: '#FF7096',
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
    borderColor: '#FF7096',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF7096',
    letterSpacing: 2,
  },
});
