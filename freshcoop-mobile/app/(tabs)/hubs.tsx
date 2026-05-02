import { Ionicons } from '@expo/vector-icons';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function HubsScreen() {
  const { store, refresh, loading } = useSession();
  const hubs = store.hubs || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Micro-hubs solaires</Text>
        <Text style={styles.subtitle}>
          Capacité · froid · batterie · pertes évitées
        </Text>
      </View>

      <FlatList
        data={hubs}
        keyExtractor={(item: any, idx) => String(item.id || idx)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="flash-outline" size={36} color={Palette.gold600} />
              <Text style={styles.emptyTitle}>Aucun hub enregistré</Text>
              <Text style={styles.emptyText}>
                Ajoutez vos micro-hubs depuis le site pour piloter capacité,
                température et autonomie batterie en temps réel.
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }: { item: any }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name="flash" size={22} color={Palette.gold600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || 'Hub FresCoop'}</Text>
                <Text style={styles.meta}>
                  {item.location || item.region || 'Sénégal'} · {item.capacity || '—'} kg
                </Text>
              </View>
            </View>

            <View style={styles.gauges}>
              <Gauge
                icon="thermometer-outline"
                label="Température"
                value={`${item.temperature ?? '—'}°C`}
                tint={Palette.blue700}
              />
              <Gauge
                icon="battery-charging-outline"
                label="Batterie"
                value={`${item.battery ?? '—'}%`}
                tint={Palette.green700}
              />
              <Gauge
                icon="leaf-outline"
                label="Pertes évitées"
                value={`${item.lossAvoided ?? '—'} kg`}
                tint={Palette.green850}
              />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

function Gauge({
  icon,
  label,
  value,
  tint,
}: {
  icon: any;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.gauge}>
      <View style={[styles.gaugeIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.gaugeValue}>{value}</Text>
      <Text style={styles.gaugeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, marginTop: 2, fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.gold100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15, fontWeight: '900', color: Palette.ink },
  meta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  gauges: { flexDirection: 'row', gap: 8, marginTop: 14 },
  gauge: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: Palette.wash,
    borderRadius: Radius.md,
    gap: 6,
  },
  gaugeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  gaugeLabel: { fontSize: 10, fontWeight: '700', color: Palette.muted, textAlign: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
