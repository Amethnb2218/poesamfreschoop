import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

export type Bar = { label: string; value: number; color?: string };

export function BarChart({
  bars,
  max,
  height = 140,
  unit = '',
}: {
  bars: Bar[];
  max?: number;
  height?: number;
  unit?: string;
}) {
  const computedMax = max ?? Math.max(1, ...bars.map((b) => b.value));
  return (
    <View>
      <View style={[styles.chart, { height }]}>
        {bars.map((bar, i) => {
          const h = Math.max(4, Math.round((bar.value / computedMax) * (height - 30)));
          return (
            <View key={i} style={styles.barCol}>
              <Text style={styles.value}>
                {formatShort(bar.value)}
                {unit ? ` ${unit}` : ''}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: bar.color || Palette.green700,
                  },
                ]}
              />
              <Text style={styles.label} numberOfLines={1}>
                {bar.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatShort(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '85%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  value: {
    fontSize: 10,
    color: Palette.ink,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: Palette.muted,
    fontWeight: '700',
    position: 'absolute',
    bottom: 0,
  },
});
