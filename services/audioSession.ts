import { Audio } from 'expo-av';
import type { PlaybackKind } from '@/stores/sessionStore';
import { useSessionStore } from '@/stores/sessionStore';

let sound: Audio.Sound | null = null;

type PlaybackSlice = {
  playbackKind: PlaybackKind;
  playbackId: string | null;
  playbackTitle: string | null;
  playbackPlaying: boolean;
  playbackLoading: boolean;
  playbackError: string | null;
};

function patch(partial: Partial<PlaybackSlice>) {
  useSessionStore.setState(partial);
}

export async function unloadSound(): Promise<void> {
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {
    /* noop */
  }
  try {
    await sound.unloadAsync();
  } catch {
    /* noop */
  }
  sound = null;
}

export async function stopPlayback(): Promise<void> {
  await unloadSound();
  patch({
    playbackKind: 'none',
    playbackId: null,
    playbackTitle: null,
    playbackPlaying: false,
    playbackLoading: false,
    playbackError: null,
  });
}

async function ensureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export async function playRemoteSound(opts: {
  uri: string;
  id: string;
  title: string;
  kind: Exclude<PlaybackKind, 'none'>;
  loop: boolean;
}): Promise<void> {
  patch({ playbackLoading: true, playbackError: null });
  await ensureAudioMode();
  await unloadSound();

  try {
    const { sound: created } = await Audio.Sound.createAsync(
      { uri: opts.uri },
      { shouldPlay: true, isLooping: opts.loop },
      (status) => {
        if (!status.isLoaded) {
          if ('error' in status && status.error) {
            patch({
              playbackLoading: false,
              playbackPlaying: false,
              playbackError: status.error,
              playbackKind: 'none',
              playbackId: null,
              playbackTitle: null,
            });
          }
          return;
        }
        patch({
          playbackPlaying: status.isPlaying,
          playbackLoading: false,
          playbackError: null,
        });
      },
    );
    sound = created;
    patch({
      playbackKind: opts.kind,
      playbackId: opts.id,
      playbackTitle: opts.title,
      playbackPlaying: true,
      playbackLoading: false,
      playbackError: null,
    });
  } catch (e) {
    patch({
      playbackLoading: false,
      playbackError: e instanceof Error ? e.message : '播放失败',
      playbackKind: 'none',
      playbackPlaying: false,
    });
  }
}

export async function pausePlayback(): Promise<void> {
  if (!sound) return;
  await sound.pauseAsync();
}

export async function resumePlayback(): Promise<void> {
  if (!sound) return;
  await sound.playAsync();
}

export async function togglePausePlayback(): Promise<boolean> {
  const st = await sound?.getStatusAsync();
  if (!st?.isLoaded) return false;
  if (st.isPlaying) {
    await pausePlayback();
    return false;
  }
  await resumePlayback();
  return true;
}
