import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';
import { useSounds } from '@/hooks/useSounds';

const BG_SOUND_META = [
  { title: '轻柔钢琴', asset: DesignAssets.focusPiano },
  { title: '白噪音', asset: DesignAssets.focusAqua },
  { title: '咖啡厅氛围', asset: DesignAssets.focusCoffee },
  { title: '雨后森林', asset: DesignAssets.focusMist },
];

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  useSounds();
  const [mode, setMode] = useState<'255' | '5010'>('255');

  const timerLabel = useMemo(() => {
    return mode === '255' ? '25:00' : '50:00';
  }, [mode]);

  const focusMinutes = mode === '255' ? 25 : 50;

  const tabBarOffset = 72 + insets.bottom;
  const cardW = Math.min(width - 36, 360);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[Colors.focusGradientTop, Colors.focusGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.focusPageBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[styles.cloudDecor, { top: insets.top + 40 }]} />
      <View style={[styles.cloudDecor2, { top: insets.top + 90 }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: tabBarOffset + 24,
          paddingHorizontal: 18,
        }}
      >
        <Text style={styles.screenTitle}>专注</Text>
        <Text style={styles.screenSubtitle}>保持专注，提高效率</Text>

        <View style={[styles.timerShell, { width: cardW }]}>
          <Image
            source={DesignAssets.focusTimerCard}
            style={[styles.timerCardImg, { width: cardW }]}
            contentFit="contain"
          />
          <View style={styles.timerOverlay}>
            <View style={styles.segment}>
              <Pressable
                onPress={() => setMode('255')}
                style={[
                  styles.segmentBtn,
                  mode === '255' && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === '255' && styles.segmentTextActive,
                  ]}
                >
                  25/5
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('5010')}
                style={[
                  styles.segmentBtn,
                  mode === '5010' && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === '5010' && styles.segmentTextActive,
                  ]}
                >
                  50/10
                </Text>
              </Pressable>
            </View>

            <Text style={styles.bigTime}>{timerLabel}</Text>
            <View style={styles.durationRow}>
              <Ionicons name="radio-button-on" size={17} color={Colors.focusAccent} />
              <Text style={styles.durationText}>
                专注时长 {focusMinutes} 分钟
              </Text>
            </View>

            <View style={styles.timerActions}>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => router.push('/focus/active')}
              >
                <Text style={styles.btnPrimaryText}>开始</Text>
              </Pressable>
              <Pressable style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>结束</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>背景音</Text>
          <Pressable onPress={() => router.push('/focus/select-sound')}>
            <Text style={styles.sectionLink}>查看全部</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.soundRow}
        >
          {BG_SOUND_META.map((item) => (
            <View key={item.title} style={styles.soundCard}>
              <Image
                source={item.asset}
                style={styles.soundCover}
                contentFit="cover"
              />
              <Text style={styles.soundTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.soundMeta}>30 分钟</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.focusGradientBottom,
  },
  cloudDecor: {
    position: 'absolute',
    opacity: 0,
    right: -30,
    width: 160,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'rgba(255,182,193,0.28)',
    transform: [{ rotate: '-8deg' }],
  },
  cloudDecor2: {
    position: 'absolute',
    opacity: 0,
    left: -20,
    width: 120,
    height: 52,
    borderRadius: 30,
    backgroundColor: 'rgba(167,243,208,0.35)',
    transform: [{ rotate: '6deg' }],
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.focusTitle,
    letterSpacing: 1,
  },
  screenSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.focusMuted,
    marginBottom: 18,
  },
  timerShell: {
    alignSelf: 'center',
    marginBottom: 22,
  },
  timerCardImg: {
    height: 340,
  },
  timerOverlay: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 26,
    bottom: 26,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(236,72,153,0.08)',
    borderRadius: 28,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.white,
  },
  segmentBtnActive: {
    backgroundColor: Colors.focusAccent,
    ...Shadows.neumorphicCard,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.focusMuted,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  bigTime: {
    marginTop: 26,
    fontSize: 52,
    fontWeight: '800',
    color: Colors.focusTitle,
    letterSpacing: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  durationText: {
    fontSize: 13,
    color: Colors.focusMuted,
    fontWeight: '600',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 28,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.focusAccent,
    paddingVertical: 14,
    borderRadius: Radii.xl,
    alignItems: 'center',
    ...Shadows.neumorphicCard,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radii.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.focusAccent,
    backgroundColor: Colors.white,
  },
  btnGhostText: {
    color: Colors.focusAccent,
    fontWeight: '800',
    fontSize: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.focusAccent,
  },
  soundRow: {
    gap: 12,
    paddingBottom: 6,
  },
  soundCard: {
    width: 118,
  },
  soundCover: {
    width: 118,
    height: 148,
    borderRadius: Radii.md,
    marginBottom: 8,
    ...Shadows.neumorphicCard,
  },
  soundTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  soundMeta: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
