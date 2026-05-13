import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';

const ITEMS = [
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

export default function MeditateScreen() {
  const insets = useSafeAreaInsets();
  const tabBarOffset = 72 + insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FBF6EE', '#EFE7DC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Image
        source={DesignAssets.meditatePageBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarOffset + 110,
        }}
      >
        <View style={styles.heroWrap}>
          <Image
            source={DesignAssets.meditateBanner}
            style={styles.hero}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(251,246,238,0.65)', Colors.meditateBg]}
            style={styles.heroFade}
          />
          <View style={styles.heroTitles}>
            <Text style={styles.screenTitle}>冥想</Text>
            <Text style={styles.screenSubtitle}>内在平静，回归当下</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          <View style={styles.grid}>
            {ITEMS.map((item) => (
              <View key={item.key} style={styles.tileWrap}>
                <Pressable
                  style={styles.tile}
                  onPress={() =>
                    router.push({
                      pathname: '/meditate/complete',
                      params: {
                        subtitle: `${item.title} · ${item.minutes} 分钟`,
                        quote: item.quote,
                      },
                    })
                  }
                >
                  <Image
                    source={item.asset}
                    style={styles.tileImg}
                    contentFit="cover"
                  />
                </Pressable>
                <Text style={styles.tileTitle}>{item.title}</Text>
                <Text style={styles.tileMeta}>{item.minutes} 分钟</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.ctaDock, { bottom: tabBarOffset + 10 }]}>
        <Pressable style={styles.ctaPress}>
          <Image
            source={DesignAssets.primaryButton}
            style={styles.ctaBg}
            contentFit="fill"
          />
          <Text style={styles.ctaText}>开始</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.meditateBg,
  },
  heroWrap: {
    width: '100%',
    marginBottom: 18,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 200,
    opacity: 0,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
    top: undefined,
    height: '55%',
    bottom: 0,
  },
  heroTitles: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.meditateTitle,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  screenSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 0,
    textShadowColor: 'rgba(255,255,255,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    marginTop: 4,
  },
  tileWrap: {
    width: '48%',
  },
  tile: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.neumorphicCard,
    backgroundColor: '#fff',
  },
  tileImg: {
    width: '100%',
    aspectRatio: 1,
  },
  tileTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tileMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaDock: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 56,
    justifyContent: 'center',
  },
  ctaPress: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radii.xl,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
});
