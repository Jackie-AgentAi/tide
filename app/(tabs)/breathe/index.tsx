import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';

type Mode = 'box' | 'relax' | 'balance';

const MODES: {
  id: Mode;
  title: string;
  subtitle: string;
  detail: string;
  icon: number;
  accent: string;
}[] = [
  {
    id: 'box',
    title: '4-4-4-4 盒式呼吸',
    subtitle: '稳住节奏',
    detail: '吸气 4 秒 · 屏息 4 秒 · 呼气 4 秒 · 屏息 4 秒',
    icon: DesignAssets.waveBox,
    accent: Colors.breatheAccent,
  },
  {
    id: 'relax',
    title: '4-7-8 放松呼吸',
    subtitle: '睡前舒缓',
    detail: '吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒',
    icon: DesignAssets.waveRelax,
    accent: '#14B8A6',
  },
  {
    id: 'balance',
    title: '5-5 平衡呼吸',
    subtitle: '日常减压',
    detail: '吸气 5 秒 · 呼气 5 秒',
    icon: DesignAssets.waveBalance,
    accent: Colors.focusAccent,
  },
];

export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('box');
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[Colors.breatheGradientTop, Colors.breatheGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.breathePageBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, paddingHorizontal: 18 },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>呼吸</Text>
          <Text style={styles.screenSubtitle}>跟随节奏，放松身心</Text>
        </View>
        <Pressable
          style={styles.gearBtn}
          onPress={() => router.push('/settings')}
        >
          <Image
            source={DesignAssets.gear}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 18, gap: 12, marginTop: 8 }}>
        {MODES.map((m) => {
          const selected = m.id === mode;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMode(m.id)}
              style={[
                styles.modeCard,
                selected && { borderColor: m.accent, borderWidth: 2 },
              ]}
            >
              <Image source={m.icon} style={styles.modeIcon} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>{m.title}</Text>
                <Text style={styles.modeSub}>{m.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.orbArea}>
        <Image
          source={DesignAssets.breatheOrb}
          style={styles.orb}
          contentFit="contain"
        />
        <View style={styles.orbLabels}>
          <Text style={styles.phase}>吸气</Text>
          <Text style={styles.phaseHint}>跟随节奏</Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: 72 + insets.bottom }]}>
        <LinearGradient
          colors={[Colors.breatheAccent, '#A855F7']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.instructionPill}
        >
          <Image
            source={active.icon}
            style={{ width: 22, height: 22 }}
            contentFit="contain"
          />
          <Text style={styles.instructionText} numberOfLines={2}>
            {active.detail}
          </Text>
        </LinearGradient>

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/breathe/complete',
              params: { mode: active.id },
            })
          }
          style={styles.endPractice}
        >
          <Text style={styles.endPracticeText}>结束练习</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.breatheGradientBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gearBtn: {
    padding: 8,
    marginTop: 4,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.breatheTitle,
    letterSpacing: 1,
  },
  screenSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    ...Shadows.neumorphicCard,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeIcon: {
    width: 44,
    height: 44,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modeSub: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  orbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  orb: {
    width: '92%',
    height: 320,
  },
  orbLabels: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  phase: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.breatheTitle,
  },
  phaseHint: {
    fontSize: 13,
    color: 'rgba(124,58,237,0.65)',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 18,
    gap: 12,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radii.xl,
    ...Shadows.neumorphicCard,
  },
  instructionText: {
    flex: 1,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
  },
  endPractice: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  endPracticeText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.breatheAccent,
  },
});
