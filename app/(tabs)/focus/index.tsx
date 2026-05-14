import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DesignAssets } from '@/constants/designAssets';
import { useSounds } from '@/hooks/useSounds';
import { useSessionStore, type FocusPreset } from '@/stores/sessionStore';

/** 对齐 `main_focus_screen` 稿面的专注页视觉令牌 */
const FocusUi = {
  mintTop: '#D4F5EF',
  mintMid: '#E0F7F4',
  mintBottom: '#EAF9F7',
  maroon: '#8B2942',
  maroonSoft: '#A34E63',
  maroonMuted: 'rgba(139, 41, 66, 0.72)',
  pinkSolid: '#E84A7F',
  pinkDeep: '#D63D6F',
  segmentTrack: 'rgba(236, 72, 133, 0.12)',
  cardShadow: 'rgba(120, 72, 96, 0.14)',
  cloudPink: 'rgba(255, 182, 193, 0.42)',
  ghostFill: '#FFF7F9',
  white: '#FFFFFF',
} as const;

const BG_SOUND_META: { title: string; asset: number }[] = [
  { title: '轻柔钢琴', asset: DesignAssets.focusPiano },
  { title: '白噪音', asset: DesignAssets.focusAqua },
  { title: '咖啡厅氛围', asset: DesignAssets.focusCoffee },
  { title: '雨后森林', asset: DesignAssets.focusMist },
];

type Tile = {
  id: string;
  title: string;
  source: ImageSourcePropType;
};

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { data } = useSounds();

  const mode = useSessionStore((s) => s.focusPreset);
  const setFocusPreset = useSessionStore((s) => s.setFocusPreset);
  const selectedFocusSoundId = useSessionStore((s) => s.selectedFocusSoundId);
  const setSelectedFocusSoundId = useSessionStore((s) => s.setSelectedFocusSoundId);

  const timerLabel = mode === '255' ? '25:00' : '50:00';
  const focusMinutes = mode === '255' ? 25 : 50;

  const tabBarOffset = 72 + insets.bottom;
  const horizontalPad = 20;
  const cardW = Math.min(width - horizontalPad * 2, 342);

  /** 横向卡片宽度：略小于一屏三分之一，保证封面+双行标题+图标区完整露出 */
  const soundTile = useMemo(() => {
    const slot = (width - horizontalPad * 2 - 36) / 3.15;
    return Math.round(Math.min(118, Math.max(92, slot)));
  }, [width]);

  const bigTimeSize = height < 700 ? 46 : 54;

  const tiles: Tile[] = useMemo(() => {
    const api = data?.sounds ?? [];
    return BG_SOUND_META.map((meta, i) => {
      const s = api[i];
      const source: ImageSourcePropType =
        s?.cover?.trim().length ? { uri: s.cover.trim() } : meta.asset;
      const title = s?.name?.trim() ? s.name : meta.title;
      const id = s?.id ?? `focus_placeholder_${i}`;
      return { id, title, source };
    });
  }, [data?.sounds]);

  const setMode = (p: FocusPreset) => setFocusPreset(p);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[FocusUi.mintTop, FocusUi.mintMid, FocusUi.mintBottom]}
        style={styles.bgGradient}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.focusPageBackground}
        style={styles.bgPhoto}
        contentFit="cover"
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={[styles.cloudTop, { top: insets.top + 28 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.cloudMid, { top: insets.top + 64 }]}
      />

      <View
        style={[
          styles.mainColumn,
          {
            paddingTop: insets.top + 6,
            paddingBottom: tabBarOffset + 4,
            paddingHorizontal: horizontalPad,
          },
        ]}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>专注</Text>
          <Text style={styles.screenSubtitle}>保持专注，提高效率</Text>
        </View>

        <View style={styles.timerBlock}>
          <View style={[styles.timerCard, { width: cardW }]}>
            <View style={styles.segment}>
              <Pressable
                onPress={() => setMode('255')}
                style={[styles.segmentBtn, mode === '255' && styles.segmentBtnActive]}
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
                style={[styles.segmentBtn, mode === '5010' && styles.segmentBtnActive]}
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

            <Text style={[styles.bigTime, { fontSize: bigTimeSize }]}>{timerLabel}</Text>

            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={18} color={FocusUi.maroon} />
              <Text style={styles.durationText}>专注时长 {focusMinutes} 分钟</Text>
            </View>

            <View style={styles.timerActions}>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => router.push('/focus/active')}
              >
                <LinearGradient
                  colors={[FocusUi.pinkSolid, FocusUi.pinkDeep]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.btnPrimaryFill}
                >
                  <Text style={styles.btnPrimaryText}>开始</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>结束</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.verticalSpacer} />

        <View style={styles.soundSection}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBubble}>
                <Ionicons name="musical-notes" size={18} color={FocusUi.maroon} />
              </View>
              <Text style={styles.sectionTitle}>背景音</Text>
            </View>
            <Pressable
              style={styles.sectionLinkPress}
              onPress={() => router.push('/focus/select-sound')}
            >
              <Text style={styles.sectionLink}>查看全部</Text>
              <Ionicons name="chevron-forward" size={16} color={FocusUi.maroonSoft} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.soundScroller}
            contentContainerStyle={styles.soundRow}
          >
            {tiles.map((item) => {
              const selected = selectedFocusSoundId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedFocusSoundId(item.id)}
                  style={[
                    styles.soundCardWrap,
                    selected && styles.soundCardWrapSelected,
                    { width: soundTile + 4 },
                  ]}
                >
                  <View style={[styles.soundCard, { width: soundTile }]}>
                    <View
                      style={[
                        styles.soundCoverShell,
                        { width: soundTile, height: soundTile },
                      ]}
                    >
                      <Image
                        source={item.source}
                        style={styles.soundCover}
                        contentFit="cover"
                        recyclingKey={item.id}
                      />
                    </View>
                    <Text
                      style={styles.soundTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                    <View style={styles.soundMetaRow}>
                      <Ionicons
                        name="headset-outline"
                        size={13}
                        color={FocusUi.maroonSoft}
                      />
                      <Text style={styles.soundMeta}>30 分钟</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FocusUi.mintBottom,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.68,
  },
  cloudTop: {
    position: 'absolute',
    right: -24,
    width: 168,
    height: 76,
    borderRadius: 48,
    backgroundColor: FocusUi.cloudPink,
    transform: [{ rotate: '-10deg' }],
    opacity: 0.95,
    zIndex: 2,
  },
  cloudMid: {
    position: 'absolute',
    right: 32,
    width: 112,
    height: 56,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 200, 210, 0.38)',
    transform: [{ rotate: '6deg' }],
    opacity: 0.9,
    zIndex: 2,
  },
  mainColumn: {
    flex: 1,
    zIndex: 3,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  headerBlock: {
    flexShrink: 0,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: FocusUi.maroon,
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: FocusUi.maroonMuted,
  },
  timerBlock: {
    flexShrink: 0,
    marginTop: 10,
    alignItems: 'center',
  },
  verticalSpacer: {
    flex: 1,
    minHeight: 0,
  },
  timerCard: {
    alignSelf: 'center',
    backgroundColor: FocusUi.white,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: FocusUi.cardShadow,
    shadowOffset: { width: 14, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 14,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: FocusUi.segmentTrack,
    borderRadius: 28,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: FocusUi.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: FocusUi.pinkSolid,
    shadowColor: FocusUi.pinkSolid,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '800',
    color: FocusUi.maroon,
  },
  segmentTextActive: {
    color: FocusUi.white,
  },
  bigTime: {
    marginTop: 18,
    fontWeight: '800',
    color: FocusUi.maroon,
    letterSpacing: 3,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    color: FocusUi.maroonSoft,
    fontWeight: '600',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: FocusUi.pinkSolid,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  btnPrimaryFill: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  btnPrimaryText: {
    color: FocusUi.white,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FocusUi.ghostFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 74, 127, 0.35)',
  },
  btnGhostText: {
    color: FocusUi.maroon,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  soundSection: {
    flexShrink: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 41, 66, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: FocusUi.maroon,
  },
  sectionLinkPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: FocusUi.maroonSoft,
  },
  soundScroller: {
    flexGrow: 0,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 4,
    paddingBottom: 2,
  },
  soundCardWrap: {
    borderRadius: 20,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  soundCardWrapSelected: {
    borderColor: FocusUi.pinkSolid,
  },
  soundCard: {
    alignItems: 'stretch',
  },
  soundCoverShell: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F3E8EC',
    marginBottom: 8,
    shadowColor: '#907088',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  soundCover: {
    width: '100%',
    height: '100%',
  },
  soundTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: FocusUi.maroon,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
  soundMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  soundMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: FocusUi.maroonMuted,
  },
});
