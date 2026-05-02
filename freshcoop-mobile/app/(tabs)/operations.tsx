import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { distanceKm, REGION_COORDS } from '@/lib/geo';
import { isAdminRole, scopeHubs } from '@/lib/roles';

export default function OperationsScreen() {
  const { user, store, refresh, loading } = useSession();
  if (!user) return null;

  const hubs = useMemo(
    () => scopeHubs(store.hubs || [], user.role, user.id),
    [store.hubs, user.role, user.id],
  );

  const dispatches = store.dispatches || [];
  const crates = store.crates || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={hubs}
        keyExtractor={(item: any, idx) => String(item.id || idx)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <View style={{ gap: 14 }}>
            <View style={styles.header}>
              <Text style={styles.title}>Opérations</Text>
              <Text style={styles.subtitle}>
                Micro-hubs · tournées · stockage froid
              </Text>
            </View>

            <View style={styles.kpiRow}>
              <Kpi icon="flash-outline" label="Hubs" value={hubs.length} tint={Palette.gold600} />
              <Kpi
                icon="bus-outline"
                label="Tournées"
                value={dispatches.length}
                tint={Palette.blue700}
              />
              <Kpi
                icon="cube-outline"
                label="Cagettes"
                value={crates.length}
                tint={Palette.green700}
              />
            </View>

            <Text style={styles.sectionTitle}>Micro-hubs solaires</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="flash-outline" size={36} color={Palette.gold600} />
              <Text style={styles.emptyTitle}>Aucun hub</Text>
              <Text style={styles.emptyText}>
                Ajoutez vos hubs depuis le site pour piloter capacité, température et autonomie.
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }: { item: any }) => (
          <Card>
            <View style={styles.hubRow}>
              <View style={styles.hubIcon}>
                <Ionicons name="flash" size={22} color={Palette.gold600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hubName}>{item.name || 'Hub FresCoop'}</Text>
                <Text style={styles.hubMeta}>
                  {item.location || item.region || 'Sénégal'} · {item.capacityKg || item.capacity || '—'} kg
                </Text>
                {user?.region && REGION_COORDS[user.region] && REGION_COORDS[item.region] ? (
                  <Text style={styles.hubDistance}>
                    📍 {distanceKm(REGION_COORDS[user.region], REGION_COORDS[item.region])} km
                    depuis {user.region}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.gauges}>
              <Gauge
                icon="thermometer-outline"
                label="Temp"
                value={`${item.temperature ?? '—'}°C`}
                tint={Palette.blue700}
              />
              <Gauge
                icon="battery-charging-outline"
                label="Batterie"
                value={`${item.batteryPercent ?? item.battery ?? '—'}%`}
                tint={Palette.green700}
              />
              <Gauge
                icon="leaf-outline"
                label="Stock"
                value={`${item.currentStockKg ?? '—'} kg`}
                tint={Palette.green850}
              />
            </View>
          </Card>
        )}
      />
      {isAdminRole(user.role) ? (
        <Pressable
          onPress={() => router.push({ pathname: '/new/[type]', params: { type: 'hub' } })}
          style={opsFab.fab}
          hitSlop={8}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const opsFab = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});

function Kpi({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <View style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function Gauge({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
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
  list: { padding: 20, paddingBottom: 40 },
  header: {},
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, marginTop: 2, fontSize: 13 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 12,
    gap: 6,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: { fontSize: 20, fontWeight: '900', color: Palette.ink },
  kpiLabel: { fontSize: 11, color: Palette.muted, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: Palette.ink },
  hubRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hubIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.gold100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubName: { fontSize: 15, fontWeight: '900', color: Palette.ink },
  hubMeta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  hubDistance: { color: Palette.green850, fontSize: 11, marginTop: 4, fontWeight: '800' },
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
  gaugeLabel: { fontSize: 10, fontWeight: '700', color: Palette.muted },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
