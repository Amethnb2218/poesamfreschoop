import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart } from '@/components/BarChart';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

const ODDS = [
  {
    id: 1,
    label: 'Pas de pauvreté',
    color: '#e5243b',
    description: 'Revenus protégés pour les productrices grâce au prix net garanti.',
  },
  {
    id: 5,
    label: 'Égalité femmes/hommes',
    color: '#ff3a21',
    description: "Autonomisation économique des femmes productrices et accès au crédit.",
  },
  {
    id: 8,
    label: 'Travail décent',
    color: '#a21942',
    description: 'Preuve économique portable qui ouvre l’accès aux financements.',
  },
  {
    id: 12,
    label: 'Anti-gaspi',
    color: '#bf8b2e',
    description: 'Consommation responsable : alertes DLC et ventes éclair.',
  },
];

export default function ImpactScreen() {
  const { user, store, refresh, loading } = useSession();

  // Les hooks doivent être appelés avant tout retour anticipé, sinon leur
  // nombre change entre deux rendus quand la session s'initialise. Aucun des
  // useMemo ci-dessous ne dépend de `user` : le garde-fou est donc simplement
  // déplacé juste avant le rendu.
  const metrics = useMemo(() => {
    const lots = store.lots || [];
    const totalKg = lots.reduce((acc: number, l: any) => acc + Number(l.weight || 0), 0);
    const lossAvoided = lots.reduce(
      (acc: number, l: any) => acc + Number(l.lossAvoidedKg || l.lossAvoided || 0) * 10,
      0,
    );
    const transactions = (store.transactions || []).reduce(
      (acc: number, t: any) => acc + Number(t.amount || 0),
      0,
    );
    const womenProducers = (store.users || []).filter(
      (u: any) => u.role === 'agriculteur' && u.status === 'Actif',
    ).length;
    const orders = (store.orders || []).length;
    return { totalKg, lossAvoided, transactions, womenProducers, orders };
  }, [store]);

  const regionData = useMemo(() => {
    const map = new Map<string, number>();
    (store.lots || []).forEach((l: any) => {
      const region = l.origin?.split(',')[0]?.trim() || 'Autre';
      map.set(region, (map.get(region) || 0) + Number(l.weight || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  }, [store.lots]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    (store.orders || []).forEach((o: any) => {
      const product = (store.products || []).find((p: any) => p.id === o.productId);
      const cat = product?.category || 'Autre';
      map.set(cat, (map.get(cat) || 0) + Number(o.totalPrice || o.total || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], i) => ({
        label,
        value,
        color: [Palette.green700, Palette.blue700, Palette.gold600, Palette.coral600, Palette.green850][i],
      }));
  }, [store.orders, store.products]);

  // Avant / après — scénario "sans FresCoop"
  const beforeAfter = useMemo(() => {
    // Hypothèse : sans FresCoop, 35% des volumes se perdent, prix net -20%
    const volumeKept = metrics.totalKg * 0.65;
    const revenueBefore = metrics.transactions * 0.8;
    return {
      volumeBefore: volumeKept,
      volumeAfter: metrics.totalKg,
      revenueBefore,
      revenueAfter: metrics.transactions,
    };
  }, [metrics]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }>
        <LinearGradient colors={[Palette.green950, Palette.green850]} style={styles.hero}>
          <Text style={styles.kicker}>POESAM 2026 · IMPACT</Text>
          <Text style={styles.heroTitle}>FresCoop en chiffres</Text>
          <Text style={styles.heroSub}>
            Chaque action sur la plateforme renforce 4 ODD et protège le revenu des productrices.
          </Text>
        </LinearGradient>

        <View style={styles.bigKpis}>
          <BigKpi
            icon="woman-outline"
            tint={Palette.coral600}
            label="Productrices"
            value={metrics.womenProducers}
            suffix="femmes"
          />
          <BigKpi
            icon="leaf-outline"
            tint={Palette.green700}
            label="Volume tracé"
            value={metrics.totalKg}
            suffix="kg"
          />
          <BigKpi
            icon="snow-outline"
            tint={Palette.blue700}
            label="Pertes évitées"
            value={metrics.lossAvoided}
            suffix="kg"
          />
          <BigKpi
            icon="cash-outline"
            tint={Palette.gold600}
            label="Revenus"
            value={metrics.transactions}
            suffix="FCFA"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="stats-chart" size={18} color={Palette.green850} />
            <Text style={styles.cardTitle}>Volumes tracés par région</Text>
          </View>
          {regionData.length > 0 ? (
            <BarChart bars={regionData} unit="kg" />
          ) : (
            <Text style={styles.empty}>Pas encore de données régionales</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="pricetags-outline" size={18} color={Palette.green850} />
            <Text style={styles.cardTitle}>Ventes par catégorie</Text>
          </View>
          {categoryData.length > 0 ? (
            <BarChart bars={categoryData} unit="F" />
          ) : (
            <Text style={styles.empty}>Pas encore de ventes</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="git-compare-outline" size={18} color={Palette.green850} />
            <Text style={styles.cardTitle}>Avant / Après FresCoop</Text>
          </View>
          <Text style={styles.hint}>
            Scénario sans FresCoop : 35% de pertes post-récolte, prix net -20%
          </Text>

          <ComparisonBar
            label="Volume conservé"
            before={beforeAfter.volumeBefore}
            after={beforeAfter.volumeAfter}
            unit="kg"
          />
          <ComparisonBar
            label="Revenu protégé"
            before={beforeAfter.revenueBefore}
            after={beforeAfter.revenueAfter}
            unit="FCFA"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="earth-outline" size={18} color={Palette.green850} />
            <Text style={styles.cardTitle}>ODD impactés</Text>
          </View>
          <View style={{ marginTop: 10, gap: 10 }}>
            {ODDS.map((odd) => (
              <View key={odd.id} style={styles.oddRow}>
                <View style={[styles.oddBadge, { backgroundColor: odd.color }]}>
                  <Text style={styles.oddNumber}>{odd.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.oddLabel}>{odd.label}</Text>
                  <Text style={styles.oddDesc}>{odd.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BigKpi({
  icon,
  label,
  value,
  suffix,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  suffix: string;
  tint: string;
}) {
  return (
    <View style={styles.bigKpi}>
      <View style={[styles.bigKpiIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.bigKpiValue}>{formatShort(value)}</Text>
      <Text style={styles.bigKpiSuffix}>{suffix}</Text>
      <Text style={styles.bigKpiLabel}>{label}</Text>
    </View>
  );
}

function ComparisonBar({
  label,
  before,
  after,
  unit,
}: {
  label: string;
  before: number;
  after: number;
  unit: string;
}) {
  const max = Math.max(before, after, 1);
  return (
    <View style={styles.compBlock}>
      <Text style={styles.compLabel}>{label}</Text>
      <View style={styles.compRow}>
        <Text style={styles.compSide}>Avant</Text>
        <View style={styles.compBarBg}>
          <View
            style={[
              styles.compBar,
              { width: `${(before / max) * 100}%`, backgroundColor: Palette.coral600 },
            ]}
          />
        </View>
        <Text style={styles.compValue}>{formatShort(before)} {unit}</Text>
      </View>
      <View style={styles.compRow}>
        <Text style={styles.compSide}>Après</Text>
        <View style={styles.compBarBg}>
          <View
            style={[
              styles.compBar,
              { width: `${(after / max) * 100}%`, backgroundColor: Palette.green700 },
            ]}
          />
        </View>
        <Text style={styles.compValue}>{formatShort(after)} {unit}</Text>
      </View>
      <View style={styles.compGain}>
        <Ionicons name="trending-up" size={14} color={Palette.green850} />
        <Text style={styles.compGainText}>
          +{Math.round(((after - before) / Math.max(1, before)) * 100)}% avec FresCoop
        </Text>
      </View>
    </View>
  );
}

function formatShort(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { paddingBottom: 40 },
  hero: {
    padding: 22,
    paddingTop: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 4,
  },
  kicker: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },
  bigKpis: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bigKpi: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 14,
    gap: 4,
  },
  bigKpiIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bigKpiValue: { fontSize: 22, fontWeight: '900', color: Palette.ink, letterSpacing: -0.5 },
  bigKpiSuffix: { fontSize: 11, fontWeight: '800', color: Palette.muted },
  bigKpiLabel: { fontSize: 11, color: Palette.muted, fontWeight: '700', marginTop: 4 },
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 16,
    gap: 6,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  hint: { color: Palette.muted, fontSize: 12, lineHeight: 18 },
  empty: { color: Palette.muted, fontSize: 13, textAlign: 'center', padding: 20 },
  oddRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  oddBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oddNumber: { color: '#ffffff', fontWeight: '900', fontSize: 18 },
  oddLabel: { fontWeight: '900', color: Palette.ink, fontSize: 13 },
  oddDesc: { color: Palette.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  compBlock: { marginTop: 10 },
  compLabel: { fontWeight: '900', color: Palette.ink, fontSize: 13, marginBottom: 8 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  compSide: { width: 48, fontSize: 11, fontWeight: '800', color: Palette.muted },
  compBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: Palette.wash,
    borderRadius: 7,
    overflow: 'hidden',
  },
  compBar: { height: '100%', borderRadius: 7 },
  compValue: { width: 82, fontSize: 11, fontWeight: '800', color: Palette.ink, textAlign: 'right' },
  compGain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.green100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  compGainText: { color: Palette.green850, fontWeight: '900', fontSize: 12 },
});
