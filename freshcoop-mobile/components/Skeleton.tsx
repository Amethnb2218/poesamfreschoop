import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

export function Skeleton({
  height = 16,
  width,
  radius = 6,
  style,
}: {
  height?: number;
  width?: number | string;
  radius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { height, width: (width as any) || '100%', borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton height={48} width={48} radius={12} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton height={14} width="70%" />
        <Skeleton height={10} width="45%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: Palette.wash },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
  },
});
