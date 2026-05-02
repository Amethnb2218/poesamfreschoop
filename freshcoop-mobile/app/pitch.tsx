import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

type Slide = {
  kicker: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  stat?: { value: string; label: string };
};

const SLIDE_MS = 6000;

export default function PitchScreen() {
  const { store } = useSession();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  const slides = useMemo<Slide[]>(() => {
    const producers = (store.users || []).filter((u: any) => u.role === 'agriculteur').length;
    const volume = (store.lots || []).reduce((a: number, l: any) => a + Number(l.weight || 0), 0);
    const revenue = (store.transactions || []).reduce(
      (a: number, t: any) => a + Number(t.amount || 0),
      0,
    );
    const orders = store.orders?.length || 0;
    const hubs = store.hubs?.length || 0;
    return [
      {
        kicker: 'FRESCOOP · POESAM 2026',
        title: 'Le revenu des productrices sénégalaises, protégé.',
        body: '3 briques : micro-hubs solaires, intelligence marché, preuve économique portable.',
        icon: 'leaf',
      },
      {
        kicker: 'PROBLÈME',
        title: '35 à 40% des récoltes perdues chaque année',
        body: "Rupture de froid, manque de marché direct, intermédiaires multiples — le revenu des productrices s'évapore.",
        icon: 'warning',
        stat: { value: '-35%', label: 'revenu producteur' },
      },
      {
        kicker: 'NOTRE SOLUTION',
        title: `${producers} productrices, ${hubs} micro-hubs, 4 ODD`,
        body: `Traçabilité du champ au paiement · chaîne du froid partagée · marché B2B direct.`,
        icon: 'sparkles',
        stat: { value: String(producers), label: 'productrices actives' },
      },
      {
        kicker: 'INNOVATION',
        title: 'Preuve économique portable + USSD',
        body: "Chaque vente bâtit un dossier de crédit exportable. USSD pour les téléphones sans Internet : 100% de couverture rurale.",
        icon: 'shield-checkmark',
        stat: { value: '*384*FRES#', label: 'accès hors-ligne' },
      },
      {
        kicker: 'TRACTION',
        title: `${orders} commandes · ${formatShort(volume)} kg tracés`,
        body: `${formatMoney(revenue)} de transactions. Couverture Dakar, Thiès, Kaolack, Saint-Louis, Casamance.`,
        icon: 'trending-up',
        stat: { value: `+${Math.round(revenue / 1_000_000)}M F`, label: 'protégés' },
      },
      {
        kicker: 'IMPACT',
        title: '4 ODD activés par FresCoop',
        body: 'ODD 1 Pauvreté · ODD 5 Genre · ODD 8 Travail décent · ODD 12 Anti-gaspillage.',
        icon: 'earth',
        stat: { value: '4 ODD', label: 'directement alignés' },
      },
      {
        kicker: 'VISION',
        title: 'Devenir l\'infrastructure du commerce agricole ouest-africain',
        body: '2026 : 500 productrices. 2027 : déploiement Mali, Burkina, Côte d\'Ivoire. 2030 : 50 000 productrices CEDEAO.',
        icon: 'rocket',
        stat: { value: '50 000', label: 'productrices cible 2030' },
      },
    ];
  }, [store]);

  useEffect(() => {
    if (!playing) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, playing, progress, slides.length]);

  const slide = slides[idx];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[Palette.green950, Palette.green850, Palette.green700]} style={styles.bg}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="close" size={22} color="#ffffff" />
          </Pressable>
          <Text style={styles.counter}>
            {idx + 1} / {slides.length}
          </Text>
          <Pressable onPress={() => setPlaying((v) => !v)} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name={playing ? 'pause' : 'play'} size={20} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          {slides.map((_, i) => (
            <View key={i} style={styles.progressBar}>
              {i === idx ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              ) : i < idx ? (
                <View style={[styles.progressFill, { width: '100%' }]} />
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          style={styles.body}
          onPress={() => setIdx((i) => (i + 1) % slides.length)}>
          <View style={styles.icon}>
            <Ionicons name={slide.icon} size={42} color="#ffffff" />
          </View>
          <Text style={styles.kicker}>{slide.kicker}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.body}</Text>
          {slide.stat ? (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{slide.stat.value}</Text>
              <Text style={styles.statLabel}>{slide.stat.label}</Text>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.footer}>
          <Pressable
            onPress={() => setIdx((i) => (i === 0 ? slides.length - 1 : i - 1))}
            style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </Pressable>
          <Text style={styles.tip}>Tap au centre pour passer · slides auto 6s</Text>
          <Pressable
            onPress={() => setIdx((i) => (i + 1) % slides.length)}
            style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color="#ffffff" />
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function formatShort(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

function formatMoney(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1000) return `${Math.round(v / 1000)}k FCFA`;
  return `${v.toLocaleString('fr-FR')} FCFA`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.green950 },
  bg: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { color: '#ffffff', fontWeight: '900', letterSpacing: 1 },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.gold600 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 14,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 10,
    ...Shadows.lg,
  },
  kicker: { color: Palette.gold600, fontSize: 13, fontWeight: '900', letterSpacing: 2.5 },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 500,
  },
  stat: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statLabel: { color: Palette.gold600, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700' },
});
