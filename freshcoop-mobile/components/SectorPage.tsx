import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';

export type SectorHighlight = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  text: string;
};

type Props = {
  title: string;
  kicker: string;
  headline: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  highlights: SectorHighlight[];
};

export function SectorPage({ title, kicker, headline, body, icon, tint, highlights }: Props) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={[Palette.green950, Palette.green850]}
          style={styles.hero}>
          <View style={[styles.iconBadge, { backgroundColor: `${tint}33` }]}>
            <Ionicons name={icon} size={26} color="#ffffff" />
          </View>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.body}>{body}</Text>
        </LinearGradient>

        <View style={{ gap: 10 }}>
          {highlights.map((h, i) => (
            <Card key={i}>
              <View style={styles.row}>
                <View style={[styles.hIcon, { backgroundColor: `${tint}1A` }]}>
                  <Ionicons name={h.icon} size={20} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hTitle}>{h.title}</Text>
                  <Text style={styles.hText}>{h.text}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hero: {
    padding: 22,
    borderRadius: Radius.lg,
    gap: 6,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kicker: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  headline: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  body: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  hIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  hText: { color: Palette.ink2, fontSize: 13, lineHeight: 19, marginTop: 4 },
});
