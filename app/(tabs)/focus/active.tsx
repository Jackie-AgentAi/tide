import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';

export default function FocusActiveScreen() {
  const insets = useSafeAreaInsets();
  const [deepFocus, setDeepFocus] = useState(true);
  const [paused, setPaused] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#D9F4EC', '#FDF2F8', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.confetti, { top: insets.top + 20 }]} />
      <View style={[styles.confetti2, { top: insets.top + 80 }]} />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.title}>专注中</Text>
        <Text style={styles.subtitle}>保持专注，提高效率</Text>
      </View>

      <View style={styles.ringWrap}>
        <View style={styles.ringTrack} />
        <View style={styles.ringProgress} />
        <View style={styles.ringInner}>
          <Text style={styles.phaseLabel}>25/5 · 专注阶段</Text>
          <Text style={styles.timeMain}>{paused ? '—' : '18:42'}</Text>
        </View>
      </View>

      <View style={styles.cards}>
        <View style={styles.rowCard}>
          <Text style={styles.rowTitle}>深途模式</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{deepFocus ? '已开启' : '已关闭'}</Text>
            <Switch
              value={deepFocus}
              onValueChange={setDeepFocus}
              trackColor={{ false: '#E5E7EB', true: 'rgba(236,72,153,0.35)' }}
              thumbColor={deepFocus ? '#EC4899' : '#F9FAFB'}
            />
          </View>
        </View>

        <View style={styles.rowCard}>
          <View style={styles.soundLeft}>
            <Ionicons name="musical-note" size={20} color="#EC4899" />
            <Text style={styles.rowTitle}>背景音</Text>
          </View>
          <Text style={styles.rowChev}>轻柔钢琴</Text>
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 88 }]}>
        <Pressable
          style={styles.btnPause}
          onPress={() => setPaused((p) => !p)}
        >
          <Text style={styles.btnPauseText}>{paused ? '继续' : '暂停'}</Text>
        </Pressable>
        <Pressable
          style={styles.btnEnd}
          onPress={() => router.push('/focus/complete')}
        >
          <Text style={styles.btnEndText}>结束</Text>
        </Pressable>
      </View>
    </View>
  );
}

const RING = 232;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D9F4EC',
  },
  confetti: {
    position: 'absolute',
    right: 24,
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(236,72,153,0.35)',
    transform: [{ rotate: '12deg' }],
  },
  confetti2: {
    position: 'absolute',
    left: 40,
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: 'rgba(52,211,153,0.45)',
    transform: [{ rotate: '-18deg' }],
  },
  header: {
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.focusTitle,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.focusMuted,
  },
  ringWrap: {
    marginTop: 28,
    alignSelf: 'center',
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 14,
    borderColor: 'rgba(236,72,153,0.15)',
  },
  ringProgress: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 14,
    borderColor: '#FF7096',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-42deg' }],
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.focusMuted,
    marginBottom: 8,
  },
  timeMain: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.focusTitle,
    letterSpacing: 2,
  },
  cards: {
    marginTop: 32,
    paddingHorizontal: 18,
    gap: 12,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...Shadows.neumorphicCard,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.focusMuted,
  },
  soundLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowChev: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.focusAccent,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 18,
    marginTop: 'auto',
  },
  btnPause: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: Radii.xl,
    backgroundColor: '#FF7096',
    alignItems: 'center',
    ...Shadows.neumorphicCard,
  },
  btnPauseText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  btnEnd: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: Radii.xl,
    borderWidth: 2,
    borderColor: '#FF7096',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  btnEndText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF7096',
    letterSpacing: 2,
  },
});
