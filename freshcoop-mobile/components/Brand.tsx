import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, Radius } from '@/constants/theme';

type BrandProps = {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'dark' | 'light';
};

export function Brand({ size = 'md', tone = 'dark' }: BrandProps) {
  const textColor = tone === 'light' ? '#ffffff' : Palette.ink;
  const iconSize = size === 'lg' ? 28 : size === 'sm' ? 18 : 22;
  const fontSize = size === 'lg' ? 26 : size === 'sm' ? 16 : 20;
  const markSize = size === 'lg' ? 44 : size === 'sm' ? 30 : 36;

  return (
    <View style={styles.wrap}>
      <View style={[styles.mark, { width: markSize, height: markSize }]}>
        <Ionicons name="leaf" size={iconSize} color="#ffffff" />
      </View>
      <View>
        <Text style={[styles.title, { color: textColor, fontSize }]}>FresCoop</Text>
        <Text style={[styles.tag, tone === 'light' && { color: 'rgba(255,255,255,0.7)' }]}>
          POESAM 2026
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    backgroundColor: Palette.green700,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '900', letterSpacing: -0.3 },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.gold600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
