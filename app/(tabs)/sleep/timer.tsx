import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSounds } from '@/hooks/useSounds';
import { playRemoteSound, stopPlayback } from '@/services/audioSession';
import { useSessionStore, type DayChip } from '@/stores/sessionStore';
import { computeWakeTimestampMs, formatRemaining } from '@/utils/sleepWake';

const DAY_LABEL: Record<DayChip, string> = {
  today: '今天',
  tomorrow: '明天',
  workdays: '工作日',
};

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

export default function SleepTimerScreen() {
  const insets = useSafeAreaInsets();
  const { data } = useSounds();
  const alarmName = data?.alarm?.name ?? 'Morning Joy';

  const selectedSleepSoundId = useSessionStore((s) => s.selectedSleepSoundId);
  const startSleepTimer = useSessionStore((s) => s.startSleepTimer);
  const cancelSleepTimer = useSessionStore((s) => s.cancelSleepTimer);
  const sleepRunning = useSessionStore((s) => s.sleepTimerRunning);
  const wakeAt = useSessionStore((s) => s.sleepTimerWakeAtMs);

  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [dayChip, setDayChip] = useState<DayChip>('today');
  const [remainMs, setRemainMs] = useState(0);

  const sounds = data?.sounds ?? [];
  const ambient =
    (selectedSleepSoundId
      ? sounds.find((s) => s.id === selectedSleepSoundId)
      : null) ?? sounds[0];

  const timeLabel = useMemo(
    () => `${pad2(hour)}:${pad2(minute)}`,
    [hour, minute],
  );

  useEffect(() => {
    if (!sleepRunning || !wakeAt) {
      setRemainMs(0);
      return;
    }
    const tick = () => setRemainMs(Math.max(0, wakeAt - Date.now()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [sleepRunning, wakeAt]);

  const bumpHour = (delta: number) => {
    setHour((h) => (h + delta + 24) % 24);
  };

  const startTimer = async () => {
    const wakeMs = computeWakeTimestampMs(hour, minute, dayChip);
    if (!ambient?.url) {
      Alert.alert(
        '无法开始定时',
        '请先加载可用的白噪音音频（检查网络后返回睡眠页重试）。',
      );
      return;
    }

    startSleepTimer({
      wakeAtMs: wakeMs,
      hour,
      minute,
      dayChip,
    });

    await playRemoteSound({
      uri: ambient.url,
      id: ambient.id,
      title: ambient.name,
      kind: 'sleep',
      loop: true,
    });
  };

  const cancelTimer = async () => {
    cancelSleepTimer();
    await stopPlayback();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2D1B4E', '#4C2A85', '#7C5CB8']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.nightGlow} />
      <View style={[styles.moonDeco, { top: insets.top + 52 }]} />

      <ScreenHeader
        title="睡眠定时"
        subtitle="设定醒来时间，轻柔唤醒"
        variant="onDark"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + 28,
        }}
      >
        {sleepRunning && wakeAt ? (
          <View style={styles.runningCard}>
            <Text style={styles.runningLabel}>距离醒来还有</Text>
            <Text style={styles.runningBig}>{formatRemaining(remainMs)}</Text>
            <Text style={styles.runningSub}>
              将在 {alarmName} 中温柔唤醒
            </Text>
            <Text style={styles.runningHint}>
              伴眠声音：{ambient?.name ?? '—'}
            </Text>

            <Pressable style={styles.cancelBtn} onPress={() => void cancelTimer()}>
              <Text style={styles.cancelBtnText}>取消定时</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>醒来时间</Text>

              <View style={styles.timeRow}>
                <Pressable onPress={() => bumpHour(-1)} style={styles.stepBtn}>
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.digitalTime}>{timeLabel}</Text>
                <Pressable onPress={() => bumpHour(1)} style={styles.stepBtn}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>

              <View style={styles.wheelRow}>
                <ScrollWheel
                  label="时"
                  value={hour}
                  range={24}
                  onChange={setHour}
                />
                <ScrollWheel
                  label="分"
                  value={minute}
                  range={60}
                  onChange={setMinute}
                />
              </View>

              <View style={styles.dayChips}>
                {(Object.keys(DAY_LABEL) as DayChip[]).map((k) => {
                  const active = dayChip === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setDayChip(k)}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                    >
                      <Text
                        style={[styles.dayChipText, active && styles.dayChipTextActive]}
                      >
                        {DAY_LABEL[k]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable style={styles.musicRow}>
              <View style={styles.musicIcon}>
                <Ionicons name="musical-notes" size={20} color="#EC4899" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.musicLabel}>闹钟音乐</Text>
                <Text style={styles.musicValue}>{alarmName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.primaryBtn} onPress={() => void startTimer()}>
              <Text style={styles.primaryBtnText}>开始定时</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ScrollWheel({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: number;
  onChange: (v: number) => void;
}) {
  const items = useMemo(
    () => Array.from({ length: range }, (_, i) => i),
    [range],
  );
  return (
    <View style={styles.wheelCol}>
      <Text style={styles.wheelLabel}>{label}</Text>
      <ScrollView
        style={styles.wheelScroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
      >
        {items.map((n) => {
          const active = n === value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={[styles.wheelItem, active && styles.wheelItemActive]}
            >
              <Text style={[styles.wheelItemText, active && styles.wheelItemTextActive]}>
                {pad2(n)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2D1B4E',
  },
  nightGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,182,193,0.06)',
  },
  moonDeco: {
    position: 'absolute',
    right: 36,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  runningCard: {
    marginTop: 8,
    borderRadius: Radii.xl,
    padding: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    ...Shadows.neumorphicCard,
    gap: 10,
  },
  runningLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  runningBig: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  runningSub: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  runningHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cancelBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: Radii.xl,
    borderWidth: 2,
    borderColor: '#FF7096',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF7096',
    letterSpacing: 2,
  },
  card: {
    marginTop: 8,
    borderRadius: Radii.xl,
    padding: 20,
    backgroundColor: Colors.white,
    ...Shadows.neumorphicCard,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236,72,153,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EC4899',
  },
  digitalTime: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
    minWidth: 160,
    textAlign: 'center',
  },
  wheelRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
    marginBottom: 18,
  },
  wheelCol: {
    flex: 1,
  },
  wheelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  wheelScroll: {
    maxHeight: 160,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(243,244,246,0.95)',
    paddingVertical: 8,
  },
  wheelItem: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemActive: {
    backgroundColor: 'rgba(236,72,153,0.12)',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  wheelItemText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  wheelItemTextActive: {
    color: '#BE185D',
  },
  dayChips: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(243,244,246,0.95)',
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: '#FF7096',
    ...Shadows.neumorphicCard,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayChipTextActive: {
    color: Colors.white,
  },
  musicRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...Shadows.neumorphicCard,
  },
  musicIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236,72,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  musicValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  primaryBtn: {
    marginTop: 22,
    paddingVertical: 16,
    borderRadius: Radii.xl,
    backgroundColor: '#FF7096',
    alignItems: 'center',
    ...Shadows.neumorphicCard,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
});
