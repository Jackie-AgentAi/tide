import { useCallback, useEffect, useState } from 'react';
import { fetchSounds } from '@/services/soundsApi';
import type { SoundsApiResponse } from '@/types/sounds';

export function useSounds() {
  const [data, setData] = useState<SoundsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSounds();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
