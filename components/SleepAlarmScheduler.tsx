import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { stopPlayback } from '@/services/audioSession';
import { useSessionStore } from '@/stores/sessionStore';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

export function SleepAlarmScheduler() {
  const wakeAt = useSessionStore((s) => s.sleepTimerWakeAtMs);
  const running = useSessionStore((s) => s.sleepTimerRunning);
  const cancelSleepTimer = useSessionStore((s) => s.cancelSleepTimer);
  const hour = useSessionStore((s) => s.sleepTimerDisplayHour);
  const minute = useSessionStore((s) => s.sleepTimerDisplayMinute);

  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [wakeAt, running]);

  useEffect(() => {
    if (!running || !wakeAt) return;

    const tick = async () => {
      if (Date.now() < wakeAt || firedRef.current) return;
      firedRef.current = true;
      cancelSleepTimer();
      await stopPlayback();
      router.replace({
        pathname: '/sleep/alarm',
        params: {
          hour: pad2(hour),
          minute: pad2(minute),
        },
      });
    };

    void tick();
    const iv = setInterval(() => {
      void tick();
    }, 1000);
    return () => clearInterval(iv);
  }, [running, wakeAt, cancelSleepTimer, hour, minute]);

  return null;
}
