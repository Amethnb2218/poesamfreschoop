import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { computeBancabilityScore } from '@/lib/analytics';

export default function BancabiliteScreen() {
  const { user, store } = useSession();
  const score = useMemo(
    () => computeBancabilityScore(store, user?.id || ''),
    [store, user],
  );

  const tint =
    score.total >= 70 ? Palette.green700 : score.total >= 40 ? Palette.gold600 : Palette.coral600;

  return (
    <>
      <Stack.Screen options={{ title: 'Bancabilité' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={[Palette.green950, Palette.green850]}
          style={styles.hero}>
          <Text style={styles.kicker}>SCORE BANCABILITÉ</Text>
          <Text style={styles.heroTitle}>{score.total}/100</Text>
          <Text style={styles.heroSub}>
            {score.total >= 70 ? 'Éligible crédit' : score.total >= 40 ? 'En progression' : 'À construire'}
          </Text>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${score.total}%`, backgroundColor: tint }]} />
          </View>
        </LinearGradient>

        <Card style={styles.reco}>
          <View style={styles.recoHeader}>
            <Ionicons name="bulb-outline" size={18} color={Palette.green850} />
            <Text style={styles.recoTitle}>Recommandation</Text>
          </View>
          <Text style={styles.recoBody}>{score.recommendation}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Détail du score</Text>

        <ScoreBar label="Volumes de vente" value={score.volumes} max={30} tint={Palette.green700} />
        <ScoreBar label="Constance des preuves" value={score.consistency} max={25} tint={Palette.blue700} />
        <ScoreBar label="Diversification" value={score.diversity} max={20} tint={Palette.gold600} />
        <ScoreBar
          label="Attestations"
          value={score.attestations}
          max={25}
          tint={Palette.coral600}
        />

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.infoTitle}>Comment améliorer votre score</Text>
          <Bullet text="Enregistrez chaque vente avec preuve (reçu, facture, attestation)." />
          <Bullet text="Diversifiez votre catalogue sur plusieurs catégories." />
          <Bullet text="Faites valider vos lots par un agent terrain." />
          <Bullet text="Agissez vite sur les alertes anti-gaspi pour protéger votre marge." />
        </Card>
      </ScrollView>
    </>
  );
}

function ScoreBar({
  label,
  value,
  max,
  tint,
}: {
  label: string;
  value: number;
  max: number;
  tint: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={styles.bar}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>
          {value}/{max}
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  hero: {
    padding: 22,
    borderRadius: Radius.lg,
    gap: 6,
    alignItems: 'center',
  },
  kicker: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '800' },
  progressWrap: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 4 },
  reco: {},
  recoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recoTitle: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  recoBody: { color: Palette.ink2, fontSize: 13, lineHeight: 20, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: Palette.ink, marginTop: 4 },
  bar: { gap: 6 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 13, fontWeight: '800', color: Palette.ink },
  barValue: { fontSize: 13, fontWeight: '800', color: Palette.muted },
  barBg: {
    height: 8,
    backgroundColor: Palette.wash,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  infoTitle: { fontWeight: '900', color: Palette.ink, fontSize: 14, marginBottom: 10 },
  bullet: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'flex-start' },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.green700,
    marginTop: 6,
  },
  bulletText: { flex: 1, color: Palette.ink2, fontSize: 13, lineHeight: 19 },
});
