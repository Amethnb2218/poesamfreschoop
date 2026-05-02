import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function RoiScreen() {
  const { user, store } = useSession();
  if (!user) return null;

  const data = useMemo(() => {
    const myOrders = (store.orders || []).filter((o: any) => o.sellerId === user.id);
    const myTransactions = (store.transactions || []).filter(
      (t: any) => t.userId === user.id || t.ownerId === user.id,
    );
    const myLots = (store.lots || []).filter((l: any) => l.ownerId === user.id);

    const totalOrderRevenue = myOrders.reduce(
      (a: number, o: any) => a + Number(o.totalPrice || o.total || 0),
      0,
    );
    const totalTransactions = myTransactions.reduce(
      (a: number, t: any) => a + Number(t.amount || 0),
      0,
    );
    const totalRevenue = totalOrderRevenue + totalTransactions;
    const totalKg = myLots.reduce((a: number, l: any) => a + Number(l.weight || 0), 0);

    // Scénario "sans FresCoop"
    const lossRate = 0.35; // 35% pertes post-récolte typiques au Sénégal
    const priceReduction = 0.2; // -20% prix net faute de marché direct

    const revenueWithout = totalRevenue * (1 - priceReduction) * (1 - lossRate);
    const kgSavedVsBefore = Math.round(totalKg * lossRate);
    const extraRevenue = totalRevenue - revenueWithout;
    const avgOrder = myOrders.length > 0 ? Math.round(totalRevenue / myOrders.length) : 0;

    // Revenus cumulés par mois (6 derniers mois)
    const now = Date.now();
    const monthly: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 30 * 86400000);
      const end = new Date(now - i * 30 * 86400000);
      const amount = myOrders
        .filter((o: any) => {
          const d = new Date(o.createdAt).getTime();
          return d >= start.getTime() && d < end.getTime();
        })
        .reduce((a: number, o: any) => a + Number(o.totalPrice || 0), 0);
      monthly.push({
        label: new Intl.DateTimeFormat('fr', { month: 'short' }).format(end),
        value: amount,
      });
    }

    return {
      totalRevenue,
      revenueWithout,
      extraRevenue,
      kgSavedVsBefore,
      orderCount: myOrders.length,
      avgOrder,
      totalKg,
      monthly,
    };
  }, [store, user]);

  const pctImprovement = data.revenueWithout > 0
    ? Math.round(((data.totalRevenue - data.revenueWithout) / data.revenueWithout) * 100)
    : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Mon gain FresCoop' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[Palette.green700, Palette.green850]} style={styles.hero}>
          <Text style={styles.kicker}>RETOUR SUR INVESTISSEMENT</Text>
          <Text style={styles.heroTitle}>
            +{pctImprovement}%
            <Text style={styles.heroTitleSmall}> de revenu</Text>
          </Text>
          <Text style={styles.heroSub}>
            {formatMoney(data.extraRevenue)} gagnés en plus grâce à FresCoop
          </Text>
          <View style={styles.heroKpis}>
            <HeroKpi label="Commandes" value={String(data.orderCount)} />
            <HeroKpi label="Panier moyen" value={formatShort(data.avgOrder)} />
            <HeroKpi label="kg sauvés" value={String(data.kgSavedVsBefore)} />
          </View>
        </LinearGradient>

        <Card>
          <Text style={styles.sectionTitle}>Revenu mensuel (6 mois)</Text>
          <BarChart bars={data.monthly} unit="F" />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Comparaison scénario</Text>
          <Text style={styles.hint}>
            Sans FresCoop : 35% de pertes post-récolte + 20% de marge perdue aux intermédiaires.
          </Text>
          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={styles.row}>
              <View style={[styles.chip, { backgroundColor: Palette.coral100 }]}>
                <Text style={[styles.chipText, { color: Palette.coral600 }]}>Sans FresCoop</Text>
              </View>
              <Text style={styles.rowValue}>{formatMoney(data.revenueWithout)}</Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.chip, { backgroundColor: Palette.green100 }]}>
                <Text style={[styles.chipText, { color: Palette.green850 }]}>Avec FresCoop</Text>
              </View>
              <Text style={[styles.rowValue, { color: Palette.green850 }]}>
                {formatMoney(data.totalRevenue)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.gainLabel}>Gain net</Text>
              <Text style={styles.gainValue}>+ {formatMoney(data.extraRevenue)}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Impact sur mon activité</Text>
          <View style={{ gap: 12, marginTop: 10 }}>
            <InsightRow
              icon="leaf-outline"
              tint={Palette.green700}
              label="Volume tracé"
              value={`${data.totalKg.toLocaleString('fr-FR')} kg`}
            />
            <InsightRow
              icon="shield-checkmark-outline"
              tint={Palette.blue700}
              label="Pertes évitées"
              value={`${data.kgSavedVsBefore.toLocaleString('fr-FR')} kg sauvés`}
            />
            <InsightRow
              icon="cash-outline"
              tint={Palette.gold600}
              label="Chiffre d'affaires"
              value={formatMoney(data.totalRevenue)}
            />
            <InsightRow
              icon="trending-up-outline"
              tint={Palette.coral600}
              label="Amélioration"
              value={`+${pctImprovement}% vs filière classique`}
            />
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

function HeroKpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroKpi}>
      <Text style={styles.heroKpiValue}>{value}</Text>
      <Text style={styles.heroKpiLabel}>{label}</Text>
    </View>
  );
}

function InsightRow({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.insight}>
      <View style={[styles.insightIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.insightLabel}>{label}</Text>
        <Text style={styles.insightValue}>{value}</Text>
      </View>
    </View>
  );
}

function formatMoney(v: number): string {
  return `${Math.round(v).toLocaleString('fr-FR')} FCFA`;
}

function formatShort(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hero: {
    padding: 22,
    borderRadius: Radius.lg,
    gap: 4,
  },
  kicker: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  heroTitleSmall: { fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroKpis: { flexDirection: 'row', gap: 10, marginTop: 14 },
  heroKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'flex-start',
  },
  heroKpiValue: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  heroKpiLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginBottom: 10 },
  hint: { color: Palette.muted, fontSize: 12, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '900' },
  rowValue: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  divider: { height: 1, backgroundColor: Palette.line, marginVertical: 4 },
  gainLabel: { fontWeight: '900', color: Palette.green850, fontSize: 13 },
  gainValue: { fontWeight: '900', color: Palette.green700, fontSize: 18, letterSpacing: -0.4 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: { fontSize: 11, color: Palette.muted, fontWeight: '800', textTransform: 'uppercase' },
  insightValue: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginTop: 2 },
});
