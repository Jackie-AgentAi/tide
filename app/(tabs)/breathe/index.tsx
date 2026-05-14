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
import { Colors, Radii } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';

type Mode = 'box' | 'relax' | 'balance';

const BreatheUi = {
  gradA: '#E4E2FD',
  gradB: '#F3E8F5',
  gradC: '#FDF6F3',
  title: '#5B21B6',
  titleDeep: '#4C1D95',
  muted: '#6B7280',
  cardGlass: 'rgba(255,255,255,0.78)',
  cardBorderIdle: 'rgba(255,255,255,0.85)',
  detailBarBg: 'rgba(255,255,255,0.92)',
  purpleRing: '#8B5CF6',
  mintAccent: '#14B8A6',
  pinkAccent: '#EC4899',
} as const;

const MODES: {
  id: Mode;
  nums: string;
  label: string;
  title: string;
  detail: string;
  icon: number;
  selectedBorder: string;
  selectedGlow: string;
}[] = [
  {
    id: 'box',
    nums: '4-4-4-4',
    label: '盒式呼吸',
    title: '4-4-4-4 盒式呼吸',
    detail: '吸气 4 秒 · 屏息 4 秒 · 呼气 4 秒 · 屏息 4 秒',
    icon: DesignAssets.waveBox,
    selectedBorder: BreatheUi.purpleRing,
    selectedGlow: 'rgba(139, 92, 246, 0.35)',
  },
  {
    id: 'relax',
    nums: '4-7-8',
    label: '放松呼吸',
    title: '4-7-8 放松呼吸',
    detail: '吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒',
    icon: DesignAssets.waveRelax,
    selectedBorder: BreatheUi.mintAccent,
    selectedGlow: 'rgba(20, 184, 166, 0.3)',
  },
  {
    id: 'balance',
    nums: '5-5',
    label: '平衡呼吸',
    title: '5-5 平衡呼吸',
    detail: '吸气 5 秒 · 呼气 5 秒',
    icon: DesignAssets.waveBalance,
    selectedBorder: BreatheUi.pinkAccent,
    selectedGlow: 'rgba(236, 72, 153, 0.28)',
  },
];

export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('box');
  const active = useMemo(() => MODES.find((m) => m.id === mode)!, [mode]);

  const tabBarOffset = 72 + insets.bottom;
  const horizontalPad = 20;
  const chipGap = 10;
  const chipW = useMemo(() => {
    const inner = width - horizontalPad * 2 - chipGap * 2;
    return Math.floor(inner / 3);
  }, [width]);

  const orbSize = Math.min(width * 0.62, 260);
  const orbBlockHeight = orbSize + 72;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[BreatheUi.gradA, BreatheUi.gradB, BreatheUi.gradC]}
        style={styles.bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Image
        source={DesignAssets.breathePageBackground}
        style={styles.bgPhoto}
        contentFit="cover"
        pointerEvents="none"
      />

      <View
        style={[
          styles.column,
          {
            paddingTop: insets.top + 6,
            paddingBottom: tabBarOffset + 6,
            paddingHorizontal: horizontalPad,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.screenTitle}>呼吸</Text>
            <Text style={styles.screenSubtitle}>跟随节奏，放松身心</Text>
          </View>
          <Pressable
            style={styles.gearCircle}
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="设置"
          >
            <Image
              source={DesignAssets.gear}
              style={styles.gearIcon}
              contentFit="contain"
            />
          </Pressable>
        </View>

        <View style={styles.modeScrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.modeScroll}
            contentContainerStyle={[styles.modeRow, { gap: chipGap }]}
          >
            {MODES.map((m) => {
              const selected = m.id === mode;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMode(m.id)}
                  style={[
                    styles.modeChip,
                    {
                      width: chipW,
                      borderColor: selected ? m.selectedBorder : BreatheUi.cardBorderIdle,
                      shadowColor: selected ? m.selectedGlow : '#8B7BA8',
                    },
                    selected && styles.modeChipSelected,
                  ]}
                >
                  <Image source={m.icon} style={styles.modeChipIcon} contentFit="contain" />
                  <Text style={styles.modeChipNums}>{m.nums}</Text>
                  <Text style={styles.modeChipLabel} numberOfLines={1}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.flexSpacer} />

        <View style={[styles.orbBlock, { height: orbBlockHeight }]}>
          <View style={styles.orbFillCenter} pointerEvents="none">
            <View
              style={[
                styles.orbHaloOuter,
                {
                  width: orbSize + 48,
                  height: orbSize + 48,
                  borderRadius: (orbSize + 48) / 2,
                },
              ]}
            />
          </View>
          <View style={styles.orbFillCenter} pointerEvents="none">
            <View
              style={[
                styles.orbHaloMid,
                {
                  width: orbSize + 22,
                  height: orbSize + 22,
                  borderRadius: (orbSize + 22) / 2,
                },
              ]}
            />
          </View>
          <View style={[styles.orbFillCenter, { zIndex: 2 }]} pointerEvents="none">
            <View
              style={[
                styles.orbImageClip,
                {
                  width: orbSize,
                  height: orbSize,
                  borderRadius: orbSize / 2,
                },
              ]}
            >
              <Image
                source={DesignAssets.breatheOrb}
                style={{ width: orbSize, height: orbSize }}
                contentFit="contain"
              />
            </View>
          </View>
          <View
            style={[styles.orbFillCenter, styles.orbLabels]}
            pointerEvents="none"
          >
            <Text style={styles.phaseMain}>吸气</Text>
            <Text style={styles.phaseSub}>跟随节奏</Text>
          </View>
          <View style={styles.decoBallPink} pointerEvents="none" />
          <View style={styles.decoBallPurple} pointerEvents="none" />
          <View style={styles.decoBallPurpleSmall} pointerEvents="none" />
        </View>

        <View style={styles.flexSpacer} />

        <View style={styles.detailCard}>
          <View style={styles.detailIconBubble}>
            <Image
              source={active.icon}
              style={styles.detailIconImg}
              contentFit="contain"
            />
          </View>
          <View style={styles.detailTextCol}>
            <Text style={styles.detailTitle} numberOfLines={1}>
              {active.title}
            </Text>
            <Text style={styles.detailBody}>{active.detail}</Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/breathe/complete',
              params: { mode: active.id },
            })
          }
          style={styles.endLink}
        >
          <Text style={styles.endLinkText}>结束练习</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BreatheUi.gradC,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.5,
  },
  column: {
    flex: 1,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: BreatheUi.titleDeep,
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: BreatheUi.muted,
  },
  gearCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#6B5B7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  gearIcon: {
    width: 24,
    height: 24,
    opacity: 0.55,
  },
  modeScrollWrap: {
    flexShrink: 0,
    marginBottom: 2,
  },
  modeScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 2,
  },
  modeChip: {
    borderRadius: Radii.lg,
    backgroundColor: BreatheUi.cardGlass,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 5,
  },
  modeChipSelected: {
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  modeChipIcon: {
    width: 40,
    height: 40,
  },
  modeChipNums: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  modeChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BreatheUi.muted,
    textAlign: 'center',
  },
  flexSpacer: {
    flex: 1,
    minHeight: 6,
  },
  orbBlock: {
    width: '100%',
    flexShrink: 0,
    position: 'relative',
    alignItems: 'center',
    overflow: 'visible',
  },
  orbFillCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbHaloOuter: {
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
  },
  orbHaloMid: {
    backgroundColor: 'rgba(244, 114, 182, 0.12)',
  },
  orbImageClip: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  orbLabels: {
    zIndex: 4,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseMain: {
    fontSize: 28,
    fontWeight: '800',
    color: BreatheUi.titleDeep,
    lineHeight: 34,
    marginBottom: 6,
    textAlign: 'center',
  },
  phaseSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(91, 33, 182, 0.55)',
    lineHeight: 18,
    textAlign: 'center',
  },
  decoBallPink: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(251, 182, 206, 0.95)',
    top: '18%',
    right: '8%',
    zIndex: 5,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  decoBallPurple: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(167, 139, 250, 0.95)',
    bottom: '20%',
    left: '6%',
    zIndex: 5,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  decoBallPurpleSmall: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.85)',
    top: '30%',
    left: '12%',
    zIndex: 5,
  },
  detailCard: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radii.xl,
    backgroundColor: BreatheUi.detailBarBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#7C6A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  detailIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIconImg: {
    width: 24,
    height: 24,
  },
  detailTextCol: {
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BreatheUi.titleDeep,
  },
  detailBody: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: BreatheUi.muted,
    lineHeight: 17,
  },
  endLink: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  endLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(91, 33, 182, 0.55)',
  },
});
