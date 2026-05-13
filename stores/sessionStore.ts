import { create } from 'zustand';

export type PlaybackKind = 'none' | 'sleep' | 'focus' | 'alarm';

export type DayChip = 'today' | 'tomorrow' | 'workdays';

export type FocusPreset = '255' | '5010';

type SessionState = {
  playbackKind: PlaybackKind;
  playbackId: string | null;
  playbackTitle: string | null;
  playbackPlaying: boolean;
  playbackLoading: boolean;
  playbackError: string | null;

  selectedSleepSoundId: string | null;
  setSelectedSleepSoundId: (id: string | null) => void;

  sleepTimerRunning: boolean;
  sleepTimerWakeAtMs: number | null;
  sleepTimerDisplayHour: number;
  sleepTimerDisplayMinute: number;
  sleepTimerDayChip: DayChip | null;

  startSleepTimer: (opts: {
    wakeAtMs: number;
    hour: number;
    minute: number;
    dayChip: DayChip;
  }) => void;
  cancelSleepTimer: () => void;

  focusPreset: FocusPreset;
  setFocusPreset: (p: FocusPreset) => void;

  selectedFocusSoundId: string | null;
  setSelectedFocusSoundId: (id: string | null) => void;

  deepFocusEnabled: boolean;
  setDeepFocusEnabled: (v: boolean) => void;

  resetPlaybackUi: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  playbackKind: 'none',
  playbackId: null,
  playbackTitle: null,
  playbackPlaying: false,
  playbackLoading: false,
  playbackError: null,

  selectedSleepSoundId: null,
  setSelectedSleepSoundId: (id) => set({ selectedSleepSoundId: id }),

  sleepTimerRunning: false,
  sleepTimerWakeAtMs: null,
  sleepTimerDisplayHour: 7,
  sleepTimerDisplayMinute: 30,
  sleepTimerDayChip: null,

  startSleepTimer: (opts) =>
    set({
      sleepTimerRunning: true,
      sleepTimerWakeAtMs: opts.wakeAtMs,
      sleepTimerDisplayHour: opts.hour,
      sleepTimerDisplayMinute: opts.minute,
      sleepTimerDayChip: opts.dayChip,
    }),

  cancelSleepTimer: () =>
    set({
      sleepTimerRunning: false,
      sleepTimerWakeAtMs: null,
      sleepTimerDayChip: null,
    }),

  focusPreset: '255',
  setFocusPreset: (p) => set({ focusPreset: p }),

  selectedFocusSoundId: null,
  setSelectedFocusSoundId: (id) => set({ selectedFocusSoundId: id }),

  deepFocusEnabled: true,
  setDeepFocusEnabled: (v) => set({ deepFocusEnabled: v }),

  resetPlaybackUi: () =>
    set({
      playbackKind: 'none',
      playbackId: null,
      playbackTitle: null,
      playbackPlaying: false,
      playbackLoading: false,
    }),
}));
