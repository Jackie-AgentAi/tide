import type { DayChip } from '@/stores/sessionStore';

export function computeWakeTimestampMs(
  hour: number,
  minute: number,
  dayChip: DayChip,
): number {
  const now = new Date();

  if (dayChip === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }

  if (dayChip === 'today') {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 1);
    }
    return d.getTime();
  }

  return nextWeekdayWakeMs(now, hour, minute);
}

function nextWeekdayWakeMs(from: Date, hour: number, minute: number): number {
  for (let add = 0; add < 14; add++) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + add);
    candidate.setHours(hour, minute, 0, 0);
    const wd = candidate.getDay();
    const isWeekday = wd >= 1 && wd <= 5;
    if (isWeekday && candidate.getTime() > from.getTime()) {
      return candidate.getTime();
    }
  }
  return from.getTime() + 60_000;
}

export function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
