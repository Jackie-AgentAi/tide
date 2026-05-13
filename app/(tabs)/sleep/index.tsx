import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  SLEEP_LOCAL_FALLBACK,
  pickSleepCover,
  sleepSoundIndex,
} from '@/constants/sleepSoundDefaults';
import { DesignAssets } from '@/constants/designAssets';
import { Colors } from '@/constants/theme';
import { useSounds } from '@/hooks/useSounds';
import {
  pausePlayback,
  playRemoteSound,
  resumePlayback,
} from '@/services/audioSession';
import { useSessionStore } from '@/stores/sessionStore';
import type { AmbientSound } from '@/types/sounds';

/** 睡眠页视觉令牌（仅 UI，与业务逻辑无关） */
const SleepUi = {
  accentPink: '#FF4D94',
  pinkAccent: '#FF6B9D',
  pinkAccentDeep: '#EC4899',
  chipIdleGray: '#6D6280',
  chipIdleBg: 'rgba(255,255,255,0.52)',
  cardTitle: '#374151',
  cardMeta: '#9CA3AF',
  glassBg: 'rgba(255,255,255,0.82)',
  glassBorder: 'rgba(255,255,255,0.95)',
  gradientTop: '#2A1A5E',
  gradientBottom: '#F8D7E8',
  heroTitleLight: '#FFF8FC',
  heroSubtitleWhite: 'rgba(255,255,255,0.92)',
} as const;

/** 顶部夜空背景区高度占整屏比例上限（约四分之一） */
const HERO_HEIGHT_RATIO = 0.25;

/** Tab 场景可视区底边已在自定义 Tab 栏之上，仅需与底缘少量间距 */
const MINI_PLAYER_BOTTOM_GAP = 12;
/** 迷你播放器占位高度（含上下内边距），用于列表底部防遮挡 */
const MINI_PLAYER_CLEARANCE = 92;

const CHIPS = ['全部', '自然', '动物', '城市', '舒缓'] as const;

function chipMatches(chip: (typeof CHIPS)[number], sound: AmbientSound) {
  const n = sound.name;
  if (chip === '全部') return true;
  if (chip === '自然') {
    return /海|雨|森|风|浪|虫|林|夜|星/.test(n);
  }
  if (chip === '动物') {
    return /猫|鸟|鲸|虫/.test(n);
  }
  if (chip === '城市') {
    return /街|咖啡|窗|车|城|厅/.test(n);
  }
  if (chip === '舒缓') {
    return /轻|柔|缓|静|眠|呼|猫|呼噜|雨|海|虫|森|夜|浪/.test(n);
  }
  return true;
}

export default function SleepScreen() {
  const { width, height: windowHeight } = useWindowDimensions();
  const { data, loading, error, reload } = useSounds();
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('全部');

  const playbackKind = useSessionStore((s) => s.playbackKind);
  const playbackId = useSessionStore((s) => s.playbackId);
  const playbackTitle = useSessionStore((s) => s.playbackTitle);
  const playbackPlaying = useSessionStore((s) => s.playbackPlaying);
  const playbackLoading = useSessionStore((s) => s.playbackLoading);
  const selectedSleepSoundId = useSessionStore((s) => s.selectedSleepSoundId);
  const setSelectedSleepSoundId = useSessionStore((s) => s.setSelectedSleepSoundId);

  const sounds = data?.sounds?.length ? data.sounds : SLEEP_LOCAL_FALLBACK;

  const filtered = useMemo(
    () => sounds.filter((s) => chipMatches(chip, s)),
    [sounds, chip],
  );

  const displayList = filtered.length ? filtered : sounds;

  const coverSourceById = useMemo(() => {
    const next = new Map<string, ReturnType<typeof pickSleepCover>>();
    displayList.forEach((sound, index) => {
      next.set(sound.id, pickSleepCover(index, sound));
    });
    return next;
  }, [displayList]);

  const sleepTransportId =
    playbackKind === 'sleep' ? playbackId : null;

  const dockSound = useMemo(() => {
    const prefer = sleepTransportId ?? selectedSleepSoundId;
    const hit = prefer
      ? displayList.find((s) => s.id === prefer)
      : undefined;
    return hit ?? displayList.find((s) => /猫/.test(s.name)) ?? displayList[0];
  }, [
    displayList,
    sleepTransportId,
    selectedSleepSoundId,
  ]);

  const dockIdx = sleepSoundIndex(displayList, dockSound?.id);
  const dockThumb = useMemo(() => {
    const sound = dockSound ?? displayList[0];
    return pickSleepCover(dockIdx, sound);
  }, [displayList, dockIdx, dockSound]);

  const gap = 12;
  const horizontalPad = 18;
  const tile = (width - horizontalPad * 2 - gap) / 2;
  const heroHeight = Math.round(windowHeight * HERO_HEIGHT_RATIO);
  const heroBottomFadeHeight = Math.max(
    56,
    Math.round(heroHeight * 0.45),
  );

  const overlayStyles = useMemo(
    () =>
      StyleSheet.create({
        playerDockBottom: {
          bottom: MINI_PLAYER_BOTTOM_GAP,
        },
      }),
    [],
  );

  const scrollStyles = useMemo(
    () =>
      StyleSheet.create({
        scrollContent: {
          paddingTop: 6,
          paddingBottom: MINI_PLAYER_BOTTOM_GAP + MINI_PLAYER_CLEARANCE + 16,
          paddingHorizontal: horizontalPad,
        },
        gridCell: {
          width: tile,
        },
      }),
    [horizontalPad, tile],
  );

  const openPlay = useCallback(
    (item: AmbientSound) => {
      setSelectedSleepSoundId(item.id);
      router.push({ pathname: '/sleep/play', params: { id: item.id } });
    },
    [setSelectedSleepSoundId],
  );

  const dockMainAction = useCallback(async () => {
    if (!dockSound) return;
    const isThisSleep =
      playbackKind === 'sleep' && playbackId === dockSound.id;
    if (isThisSleep) {
      if (playbackPlaying) await pausePlayback();
      else await resumePlayback();
      return;
    }
    setSelectedSleepSoundId(dockSound.id);
    if (dockSound.url) {
      await playRemoteSound({
        uri: dockSound.url,
        id: dockSound.id,
        title: dockSound.name,
        kind: 'sleep',
        loop: true,
      });
      return;
    }
    router.push({
      pathname: '/sleep/play',
      params: { id: dockSound.id },
    });
  }, [
    dockSound,
    playbackId,
    playbackKind,
    playbackPlaying,
    setSelectedSleepSoundId,
  ]);

  const openDockDetail = useCallback(() => {
    if (!dockSound) return;
    openPlay(dockSound);
  }, [dockSound, openPlay]);

  const dockTitleLine =
    playbackKind === 'sleep'
      ? playbackTitle ?? dockSound?.name ?? '—'
      : dockSound?.name ?? '—';

  const fixedHeroAndChips = (
    <View style={styles.fixedTopStack}>
      <View style={[styles.heroBlock, { height: heroHeight }]}>
        <Image
          source={DesignAssets.sleepNightSkyBackground}
          style={styles.heroNightImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            'transparent',
            'rgba(248,215,232,0.65)',
            SleepUi.gradientBottom,
          ]}
          locations={[0, 0.5, 1]}
          style={[styles.heroBottomFade, { height: heroBottomFadeHeight }]}
          pointerEvents="none"
        />
        <SafeAreaView edges={['top']} style={styles.heroSafeArea} pointerEvents="box-none">
          <Text style={styles.screenTitle}>睡眠</Text>
          <Text style={styles.screenSubtitle}>选择白噪音，安静入睡</Text>
        </SafeAreaView>
      </View>

      <View style={styles.chipOverlapWrap}>
        <View style={styles.chipPanelRaised}>
          <View style={styles.chipRowStatic}>
            {CHIPS.map((c) => {
              const active = c === chip;
              return (
                <Pressable
                  key={c}
                  onPress={() => setChip(c)}
                  style={styles.chipFlexCell}
                >
                  {active ? (
                    <LinearGradient
                      colors={[SleepUi.accentPink, SleepUi.pinkAccentDeep]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.chipActiveCapsule}
                    >
                      <Text style={styles.chipTextActive}>{c}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.chipIdleCapsule}>
                      <Text style={styles.chipTextIdle}>{c}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[SleepUi.gradientTop, SleepUi.gradientBottom]}
        locations={[0, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.sleepPageBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.white} size="large" />
          <Text style={styles.loadingText}>加载声音…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>加载失败</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {fixedHeroAndChips}

          <ScrollView
            style={styles.scrollFill}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={scrollStyles.scrollContent}
          >
            <FlatList
              data={displayList}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.flatListRow}
              contentContainerStyle={styles.flatListContent}
              renderItem={({ item, index }) => {
                const isCurrentSleep =
                  playbackKind === 'sleep' && playbackId === item.id;
                const showPlayingBadge = isCurrentSleep && playbackPlaying;
                const source =
                  coverSourceById.get(item.id) ?? pickSleepCover(index, item);
                return (
                  <Pressable
                    onPress={() => openPlay(item)}
                    style={scrollStyles.gridCell}
                  >
                    <View
                      style={[
                        styles.soundCard,
                      ]}
                    >
                      <View style={styles.soundCardImageShell}>
                        <Image
                          key={item.id}
                          source={source}
                          style={styles.soundCardImage}
                          resizeMode="cover"
                        />
                        {showPlayingBadge ? (
                          <View style={styles.playingBadge}>
                            <View style={styles.equalizerBars} pointerEvents="none">
                              <View style={[styles.equalizerBar, styles.equalizerBarShort]} />
                              <View style={[styles.equalizerBar, styles.equalizerBarTall]} />
                              <View style={[styles.equalizerBar, styles.equalizerBarMid]} />
                            </View>
                          </View>
                        ) : null}
                      </View>
                      {isCurrentSleep ? (
                        <View style={styles.soundCardActiveRing} pointerEvents="none" />
                      ) : null}
                      <View style={styles.soundCardBody}>
                        <Text style={styles.soundCardTitle} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.soundCardMeta}>30 分钟</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </ScrollView>

          <View style={[styles.playerDock, overlayStyles.playerDockBottom]}>
            <View style={styles.playerGlass}>
              <View style={styles.playerRow}>
                <Pressable
                  style={styles.playerMainTap}
                  onPress={openDockDetail}
                >
                  <Image
                    key={`dock-${dockSound?.id ?? 'empty'}`}
                    source={dockThumb}
                    style={styles.playerThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.playerTexts}>
                    <Text style={styles.playerLabel}>当前播放</Text>
                    <Text style={styles.playerTitle} numberOfLines={1}>
                      {dockTitleLine}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={styles.pauseBtn}
                  disabled={playbackLoading || !dockSound}
                  onPress={() => {
                    void dockMainAction();
                  }}
                >
                  <Ionicons
                    name={
                      playbackKind === 'sleep' &&
                      playbackId === dockSound?.id &&
                      playbackPlaying
                        ? 'pause'
                        : 'play'
                    }
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SleepUi.gradientBottom,
  },
  fixedTopStack: {
    zIndex: 2,
    marginBottom: 4,
  },
  heroBlock: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroNightImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroSafeArea: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  screenTitle: {
    marginTop: 8,
    fontSize: 44,
    fontWeight: '700',
    color: SleepUi.heroTitleLight,
    letterSpacing: 1,
    textAlign: 'center',
  },
  screenSubtitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: SleepUi.heroSubtitleWhite,
    letterSpacing: 0.35,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  chipOverlapWrap: {
    marginTop: -28,
    paddingHorizontal: 18,
    marginBottom: 10,
    zIndex: 3,
  },
  chipPanelRaised: {
    backgroundColor: 'rgba(255,252,254,0.93)',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#4A306D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  chipRowStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chipFlexCell: {
    flex: 1,
    marginHorizontal: 3,
    minWidth: 0,
  },
  chipActiveCapsule: {
    paddingVertical: 9,
    paddingHorizontal: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    shadowColor: SleepUi.accentPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  chipIdleCapsule: {
    paddingVertical: 9,
    paddingHorizontal: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    backgroundColor: SleepUi.chipIdleBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextIdle: {
    color: SleepUi.chipIdleGray,
    fontWeight: '600',
    fontSize: 12,
  },
  scrollFill: {
    flex: 1,
  },
  flatListRow: {
    gap: 12,
  },
  flatListContent: {
    gap: 12,
    paddingBottom: 8,
  },
  soundCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#6B4E9E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  soundCardActiveRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: SleepUi.accentPink,
    borderRadius: 22,
    zIndex: 2,
  },
  soundCardImageShell: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EBDDFB',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  soundCardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EBDDFB',
  },
  playingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SleepUi.accentPink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.86)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  equalizerBars: {
    height: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  equalizerBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  equalizerBarShort: {
    height: 10,
  },
  equalizerBarMid: {
    height: 14,
  },
  equalizerBarTall: {
    height: 18,
  },
  soundCardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  soundCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SleepUi.cardTitle,
    textAlign: 'center',
  },
  soundCardMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: SleepUi.cardMeta,
    textAlign: 'center',
  },
  playerDock: {
    position: 'absolute',
    left: 18,
    right: 18,
    minHeight: 76,
    justifyContent: 'center',
    zIndex: 2,
  },
  playerGlass: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: SleepUi.glassBg,
    borderWidth: 1,
    borderColor: SleepUi.glassBorder,
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  playerMainTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerThumb: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EBDDFB',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(236,72,153,0.35)',
  },
  playerTexts: {
    flex: 1,
  },
  playerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SleepUi.accentPink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SleepUi.accentPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.white,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: Colors.white,
  },
  retryText: {
    fontWeight: '700',
    color: SleepUi.gradientTop,
  },
});
