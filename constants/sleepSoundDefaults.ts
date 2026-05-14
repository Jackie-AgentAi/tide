import type { ImageSourcePropType } from 'react-native';
import { DesignAssets } from '@/constants/designAssets';
import type { AmbientSound } from '@/types/sounds';

/** Offline placeholder rows — URLs filled only when API returns sounds */
export const SLEEP_LOCAL_FALLBACK: AmbientSound[] = [
  {
    id: 'local_ocean',
    name: '海浪轻拍',
    url: '',
    cover: '',
  },
  {
    id: 'local_rain',
    name: '温柔雨声',
    url: '',
    cover: '',
  },
  {
    id: 'local_forest',
    name: '夏夜虫鸣',
    url: '',
    cover: '',
  },
  {
    id: 'local_cat',
    name: '猫呼噜声',
    url: '',
    cover: '',
  },
];

export const SLEEP_LOCAL_COVERS = [
  DesignAssets.sleepCoverOcean,
  DesignAssets.sleepCoverRain,
  DesignAssets.sleepCoverForest,
  DesignAssets.sleepCoverCat,
] as const;

/** 列表/播放器封面：优先使用接口返回的远程图，避免名称与本地占位图错位 */
export function resolveSleepImageSource(
  item: AmbientSound,
  index: number,
): ImageSourcePropType {
  const c = item.cover?.trim();
  if (c) return { uri: c };
  return pickSleepCover(index, item);
}

export function pickSleepCover(index: number, item: AmbientSound) {
  const name = item.name;
  const id = item.id;

  if (/cat|猫|呼噜|cainai|踩奶/.test(id) || /猫|呼噜|踩奶/.test(name)) {
    return DesignAssets.sleepCoverCat;
  }
  if (/sea|ocean|海|水/.test(id) || /海|浪|水/.test(name)) {
    return DesignAssets.sleepCoverOcean;
  }
  if (/rain|storm|雨|雷/.test(id) || /雨|雷|窗/.test(name)) {
    return DesignAssets.sleepCoverRain;
  }
  if (/cicada|frog|forest|虫|蛙|森|林/.test(id) || /虫|蛙|森|林|夜/.test(name)) {
    return DesignAssets.sleepCoverForest;
  }

  return SLEEP_LOCAL_COVERS[index % SLEEP_LOCAL_COVERS.length];
}

export function sleepSoundIndex(list: AmbientSound[], id: string | null | undefined) {
  if (!id) return 0;
  const i = list.findIndex((s) => s.id === id);
  return i >= 0 ? i : 0;
}
