import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  /** Default: router.back() */
  onBack?: () => void;
  variant?: 'onDark' | 'onLight';
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  variant = 'onDark',
}: Props) {
  const insets = useSafeAreaInsets();
  const goBack = onBack ?? (() => router.back());
  const chevron = variant === 'onDark' ? '#FFFFFF' : '#111827';
  const titleColor = variant === 'onDark' ? '#FFFFFF' : '#111827';
  const subColor =
    variant === 'onDark' ? 'rgba(255,255,255,0.82)' : '#6B7280';

  return (
    <View style={[styles.row, { paddingTop: insets.top + 6 }]}>
      <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={chevron} />
      </Pressable>
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.backSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 44,
    height: 44,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
