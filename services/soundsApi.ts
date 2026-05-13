import type { SoundsApiResponse } from '@/types/sounds';

const SOUNDS_URL =
  'https://zzz-pet.oss-cn-hangzhou.aliyuncs.com/api/sounds.json';

export async function fetchSounds(): Promise<SoundsApiResponse> {
  const res = await fetch(SOUNDS_URL, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load sounds (${res.status})`);
  }
  const data = (await res.json()) as SoundsApiResponse;
  if (!data?.alarm || !Array.isArray(data.sounds)) {
    throw new Error('Unexpected sounds payload');
  }
  return data;
}
