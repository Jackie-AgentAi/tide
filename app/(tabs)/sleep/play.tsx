import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  SLEEP_LOCAL_FALLBACK,
  pickSleepCover,
  sleepSoundIndex,
} from '@/constants/sleepSoundDefaults';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  pausePlayback,
  playRemoteSound,
  resumePlayback,
} from '@/services/audioSession';
import { useSessionStore } from '@/stores/sessionStore';
import { useSounds } from '@/hooks/useSounds';
import type { AmbientSound } from '@/types/sounds';

export default function SleepPlayScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, loading, error, reload } = useSounds();

  const sounds: AmbientSound[] =
    data?.sounds?.length ? data.sounds : SLEEP_LOCAL_FALLBACK;

  const item = useMemo(() => {
    const id = params.id;
    if (!id) return sounds[0];
    return sounds.find((s) => s.id === id) ?? sounds[0];
  }, [params.id, sounds]);

  const idx = sleepSoundIndex(sounds, item.id);

  const playbackKind = useSessionStore((s) => s.playbackKind);
  const playbackId = useSessionStore((s) => s.playbackId);
  const playbackPlaying = useSessionStore((s) => s.playbackPlaying);
  const playbackLoading = useSessionStore((s) => s.playbackLoading);
  const playbackError = useSessionStore((s) => s.playbackError);
  const setSelectedSleepSoundId = useSessionStore((s) => s.setSelectedSleepSoundId);

  useEffect(() => {
    setSelectedSleepSoundId(item.id);
  }, [item.id, setSelectedSleepSoundId]);

  useEffect(() => {
    void (async () => {
      if (!item.url) return;
      const st = useSessionStore.getState();
      if (
        st.playbackKind === 'sleep' &&
        st.playbackId === item.id &&
        st.playbackPlaying
      ) {
        return;
      }
      await playRemoteSound({
        uri: item.url,
        id: item.id,
        title: item.name,
        kind: 'sleep',
        loop: true,
      });
    })();
  }, [item.id, item.url, item.name]);

  const dockPlaying =
    playbackKind === 'sleep' && playbackId === item.id && playbackPlaying;

  const toggle = async () => {
    if (!item.url) return;
    if (playbackKind === 'sleep' && playbackId === item.id) {
      if (playbackPlaying) await pausePlayback();
      else await resumePlayback();
      return;
    }
    await playRemoteSound({
      uri: item.url,
      id: item.id,
      title: item.name,
      kind: 'sleep',
      loop: true,
    });
  };

  const cover = pickSleepCover(idx, item);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[
          Colors.sleepGradientTop,
          Colors.sleepGradientMid,
          Colors.sleepGradientBottom,
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScreenHeader
        title={item.name}
        subtitle="睡眠白噪音 · 循环播放"
        variant="onDark"
        onBack={() => router.back()}
      />

      <View style={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        {loading ? (
          <ActivityIndicator color={Colors.white} size="large" />
        ) : error ? (
          <>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.retryGhost} onPress={reload}>
              <Text style={styles.retryGhostText}>重试</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.coverFrame}>
              <Image source={cover} style={styles.cover} resizeMode="cover" />
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(12,6,22,0.45)',
                  'rgba(12,6,22,0.62)',
                ]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.coverLabelWrap} pointerEvents="none">
                <Text style={styles.coverLabel}>{item.name}</Text>
              </View>
            </View>

            {playbackError ? (
              <Text style={styles.error}>{playbackError}</Text>
            ) : null}

            <Pressable
              style={styles.playBtn}
              onPress={() => {
                void toggle();
              }}
              disabled={Boolean(item.url) && playbackLoading}
            >
              <Ionicons
                name={dockPlaying ? 'pause' : 'play'}
                size={28}
                color="#BE185D"
              />
              <Text style={styles.playText}>
                {!item.url
                  ? '暂无远程音频（请检查网络数据）'
                  : playbackLoading
                    ? '加载中…'
                    : dockPlaying
                      ? '暂停'
                      : '播放'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.sleepGradientBottom,
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  coverFrame: {
    width: '88%',
    maxWidth: 360,
    aspectRatio: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.neumorphicCard,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverLabelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  coverLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  retryGhost: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  retryGhostText: {
    fontWeight: '800',
    color: Colors.white,
    fontSize: 14,
  },
  playBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radii.xl,
    backgroundColor: Colors.white,
    ...Shadows.neumorphicCard,
  },
  playText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#BE185D',
    letterSpacing: 2,
  },
});
