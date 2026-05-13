import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { DesignAssets } from '@/constants/designAssets';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSounds } from '@/hooks/useSounds';
import type { AmbientSound } from '@/types/sounds';

const CHIPS = ['全部', '自然', '乐器', '咖啡馆'] as const;

const LOCAL_FALLBACK: AmbientSound[] = [
  { id: 'wn', name: 'White Noise', url: '', cover: '' },
  { id: 'cafe', name: 'Cafe', url: '', cover: '' },
  { id: 'rain', name: 'Rainy Forest', url: '', cover: '' },
];

const LOCAL_COVERS = [
  DesignAssets.focusPiano,
  DesignAssets.focusCoffee,
  DesignAssets.focusMist,
  DesignAssets.focusAqua,
];

function pickCover(index: number, item: AmbientSound) {
  if (item.cover && item.cover.length > 0) {
    return { uri: item.cover } as const;
  }
  return LOCAL_COVERS[index % LOCAL_COVERS.length];
}

function chipMatches(chip: (typeof CHIPS)[number], sound: AmbientSound) {
  const n = sound.name;
  if (chip === '全部') return true;
  if (chip === '自然') return /雨|森|海|林|浪/.test(n);
  if (chip === '乐器') return /钢琴|琴|弦/.test(n) || /White/.test(n);
  if (chip === '咖啡馆') return /咖啡|Cafe/.test(n);
  return true;
}

export default function FocusSelectSoundScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data } = useSounds();
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('全部');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const sounds = data?.sounds?.length ? data.sounds : LOCAL_FALLBACK;

  const filtered = useMemo(() => {
    const base = sounds.filter((s) => chipMatches(chip, s));
    const q = query.trim();
    if (!q) return base.length ? base : sounds;
    return base.filter((s) => s.name.includes(q));
  }, [sounds, chip, query]);

  const displayList = filtered.length ? filtered : sounds;

  const gap = 14;
  const horizontalPad = 18;
  const tile = (width - horizontalPad * 2 - gap) / 2;

  const selected =
    displayList.find((s) => s.id === selectedId) ?? displayList[0];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#D9F4EC', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScreenHeader
        title="选择背景音"
        subtitle="专注时的陪伴声音"
        variant="onLight"
      />

      <View style={[styles.searchWrap, { marginHorizontal: horizontalPad }]}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="搜索声音"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={[styles.chipRow, { paddingHorizontal: horizontalPad }]}>
        {CHIPS.map((c) => {
          const active = c === chip;
          return (
            <Pressable
              key={c}
              onPress={() => setChip(c)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap, paddingHorizontal: horizontalPad }}
        contentContainerStyle={{
          gap,
          paddingBottom: insets.bottom + 120,
        }}
        renderItem={({ item, index }) => {
          const active = selected?.id === item.id;
          const source = pickCover(index, item);
          return (
            <Pressable
              onPress={() => setSelectedId(item.id)}
              style={{ width: tile }}
            >
              <View
                style={[styles.cardFrame, active && styles.cardFrameActive]}
              >
                <Image
                  source={source}
                  style={[styles.cover, { width: tile - 6 }]}
                  contentFit="cover"
                />
                {active ? (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </Pressable>
          );
        }}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 72 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomLabel}>已选择</Text>
          <Text style={styles.bottomValue} numberOfLines={1}>
            {selected?.name ?? '—'}
          </Text>
        </View>
        <Pressable style={styles.useBtn} onPress={() => router.back()}>
          <Text style={styles.useBtnText}>使用</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D9F4EC',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: Colors.white,
    ...Shadows.neumorphicCard,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  chipActive: {
    backgroundColor: '#FF7096',
    ...Shadows.neumorphicCard,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  cardFrame: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(243,244,246,0.9)',
  },
  cardFrameActive: {
    borderWidth: 2,
    borderColor: '#FF7096',
  },
  cover: {
    aspectRatio: 1,
    borderRadius: Radii.lg - 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF7096',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bottomValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  useBtn: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: '#FF7096',
    ...Shadows.neumorphicCard,
  },
  useBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
});
