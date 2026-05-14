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

const MeditateUi = {
  gradTop: '#FBF6EE',
  gradBot: '#F5EDE3',
  title: '#9D174D',
  subtitle: '#57534E',
  accentPink: '#F06292',
  accentPinkDeep: '#EC407A',
  cardBg: '#FFFFFF',
} as const;

type ItemKey = 'quick' | 'exam' | 'breath' | 'body';

const ITEMS: {
  key: ItemKey;
  title: string;
  minutes: number;
  asset: number;
  quote: string;
}[] = [
  {
    key: 'quick',
    title: '快速入眠',
    minutes: 10,
    asset: DesignAssets.meditateQuick,
    quote: '愿这份安静继续陪着你。',
  },
  {
    key: 'exam',
    title: '考试压力',
    minutes: 15,
    asset: DesignAssets.meditateExam,
    quote: '慢慢来，也可以走得很好。',
  },
  {
    key: 'breath',
    title: '呼吸练习',
    minutes: 8,
    asset: DesignAssets.meditateBreath,
    quote: '呼吸是你随身的小型避难所。',
  },
  {
    key: 'body',
    title: '身体扫描',
    minutes: 20,
    asset: DesignAssets.meditateBody,
    quote: '把注意力轻轻放回身体。',
  },
];

/** 头图区纯图片高度（不含状态栏），压低以给网格留出两行空间 */
const HERO_IMG_H = 152;

const CTA_INNER_H = 52;
const CARD_TEXT_BLOCK = 46;

export default function MeditateScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const tabBarOffset = 72 + insets.bottom;
  const [selectedKey, setSelectedKey] = useState<ItemKey>('quick');

  const selected = useMemo(
    () => ITEMS.find((i) => i.key === selectedKey) ?? ITEMS[0],
    [selectedKey],
  );

  const horizontalPad = 20;
  const gridGap = 12;
  const tileW = useMemo(() => {
    return (width - horizontalPad * 2 - gridGap) / 2;
  }, [width]);

  /** 封面正方形边长：取列宽与「两行卡片 + 文案」可容纳高度中的较小值，保证一屏可见两行 */
  const coverSide = useMemo(() => {
    const ctaReserve = CTA_INNER_H + 6;
    const gridViewport =
      height -
      insets.top -
      HERO_IMG_H -
      ctaReserve -
      tabBarOffset -
      8;
    const rowGap = gridGap;
    const twoRowsCap = Math.floor(
      (gridViewport - rowGap - 2 * CARD_TEXT_BLOCK - 20) / 2,
    );
    const fromLayout = Math.floor(tileW);
    return Math.max(80, Math.min(fromLayout, Math.max(80, twoRowsCap)));
  }, [height, insets.top, tabBarOffset, tileW, gridGap]);

  const onStart = () => {
    router.push({
      pathname: '/meditate/complete',
      params: {
        subtitle: `${selected.title} · ${selected.minutes} 分钟`,
        quote: selected.quote,
      },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[MeditateUi.gradTop, MeditateUi.gradBot]}
        style={styles.bgGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.meditatePageBackground}
        style={styles.bgPhoto}
        contentFit="cover"
        pointerEvents="none"
      />

      <View style={styles.column}>
        <View style={[styles.heroBlock, { height: insets.top + HERO_IMG_H }]}>
          <Image
            source={DesignAssets.meditateBanner}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.08)', 'rgba(251,246,238,0.42)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          <View
            style={[
              styles.heroTitles,
              { top: insets.top + 8, paddingHorizontal: horizontalPad },
            ]}
          >
            <Text style={styles.screenTitle}>冥想</Text>
            <Text style={styles.screenSubtitle}>内在平静，回归当下</Text>
          </View>
        </View>

        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={[
            styles.gridScrollInner,
            {
              paddingHorizontal: horizontalPad,
              paddingTop: 10,
              paddingBottom: 8,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.grid, { columnGap: gridGap, rowGap: gridGap }]}>
            {ITEMS.map((item) => {
              const isSel = item.key === selectedKey;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setSelectedKey(item.key)}
                  style={[
                    styles.card,
                    { width: tileW },
                    isSel && styles.cardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.cardImageShell,
                      {
                        width: coverSide,
                        height: coverSide,
                        alignSelf: 'center',
                      },
                    ]}
                  >
                    <Image
                      source={item.asset}
                      style={styles.cardImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardMeta}>{item.minutes} 分钟</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.ctaBar, { paddingBottom: tabBarOffset + 2 }]}>
          <Pressable onPress={onStart} style={styles.ctaOuter}>
            <LinearGradient
              colors={[MeditateUi.accentPink, MeditateUi.accentPinkDeep]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>开始</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.meditateBg,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.22,
  },
  column: {
    flex: 1,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  heroBlock: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitles: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: MeditateUi.title,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255,255,255,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  screenSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: MeditateUi.subtitle,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  gridScroll: {
    flex: 1,
    minHeight: 120,
  },
  gridScrollInner: {
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: MeditateUi.cardBg,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#7C6A5A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardSelected: {
    borderColor: MeditateUi.accentPink,
    shadowColor: MeditateUi.accentPink,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  cardImageShell: {
    backgroundColor: '#F3EDE6',
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaBar: {
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  ctaOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: MeditateUi.accentPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
});
