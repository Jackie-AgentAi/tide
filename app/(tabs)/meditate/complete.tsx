import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';

export default function MeditateCompleteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    subtitle?: string;
    quote?: string;
  }>();

  const subtitle = params.subtitle ?? '快速入眠 · 10 分钟';
  const quote = params.quote ?? '愿这份安静继续陪着你。';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FFD8C2', '#FECDD3', '#FBCFE8']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <View style={[styles.cloud, { top: insets.top + 30 }]} />

      <View style={[styles.body, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 88 }]}>
        <Text style={styles.title}>冥想完成</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.moonCard}>
          <Image
            source={DesignAssets.meditateBanner}
            style={styles.moonImg}
            contentFit="cover"
          />
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>完成 5/5 段</Text>
            <Text style={styles.statHint}>章节</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>今日练习 +1</Text>
            <Text style={styles.statHint}>记录</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.replace('/meditate')}
          >
            <Text style={styles.btnPrimaryText}>再听一次</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() => router.replace('/meditate')}
          >
            <Text style={styles.btnGhostText}>返回冥想</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD8C2',
  },
  cloud: {
    position: 'absolute',
    right: -10,
    width: 160,
    height: 64,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#9D174D',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(157,23,77,0.78)',
    marginBottom: 22,
  },
  moonCard: {
    width: '100%',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.neumorphicCard,
    marginBottom: 18,
  },
  moonImg: {
    width: '100%',
    height: 160,
  },
  quoteCard: {
    width: '100%',
    padding: 18,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.88)',
    ...Shadows.neumorphicCard,
    marginBottom: 18,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    padding: 16,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...Shadows.neumorphicCard,
    marginBottom: 22,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statHint: {
    fontSize: 12,
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
