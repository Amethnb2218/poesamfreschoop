import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isAdminRole, isBuyerRole, isSellerRole, scopeLots } from '@/lib/roles';

export default function LotsScreen() {
  const { user, store, refresh, loading } = useSession();
  if (!user) return null;
  const lots = useMemo(
    () => scopeLots(store.lots || [], user.role, user.id),
    [store.lots, user.role, user.id],
  );
  const isMine = isSellerRole(user.role);
  const isAllView = isAdminRole(user.role);
  const isBuyer = isBuyerRole(user.role);

  const title = isBuyer
    ? 'Stock'
    : isMine
    ? 'Mes lots'
    : isAllView
    ? 'Tous les lots'
    : 'Lots';

  const subtitle = isBuyer
    ? `Produits disponibles et leur origine · ${lots.length} lot${lots.length > 1 ? 's' : ''}`
    : `Traçabilité du champ au paiement · ${lots.length} lot${lots.length > 1 ? 's' : ''}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <FlatList
        data={lots}
        keyExtractor={(item: any, idx) => String(item.id || idx)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={36} color={Palette.green700} />
              <Text style={styles.emptyTitle}>Aucun lot enregistré</Text>
              <Text style={styles.emptyText}>
                Les lots créés sur le site ou par l'agent terrain s'afficheront
                ici avec leur état (récolté, stocké, dispatché, payé).
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/lot/[id]', params: { id: item.id } })}>
          <Card>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name="cube" size={22} color={Palette.green700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.reference || item.id || 'Lot'}</Text>
                <Text style={styles.meta}>
                  {item.productName || item.product || 'Produit'} · {item.weight || 0} kg
                </Text>
              </View>
              <StatusPill status={item.status || 'En cours'} />
            </View>

            <View style={styles.tagRow}>
              {item.origin ? <Tag icon="location-outline" label={item.origin} /> : null}
              {item.hubId ? <Tag icon="flash-outline" label={`Hub ${item.hubId}`} /> : null}
              {item.harvestDate ? (
                <Tag icon="calendar-outline" label={formatDate(item.harvestDate)} />
              ) : null}
            </View>
          </Card>
          </Pressable>
        )}
      />

      {isMine || isAllView ? (
        <Pressable onPress={() => router.push('/new-lot')} style={styles.fab} hitSlop={8}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      ) : null}

      <Pressable onPress={() => router.push('/scan')} style={styles.scanFab} hitSlop={8}>
        <Ionicons name="qr-code-outline" size={22} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

function Tag({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={12} color={Palette.green850} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const lower = String(status).toLowerCase();
  const { bg, fg } = lower.includes('pay')
    ? { bg: Palette.green100, fg: Palette.green850 }
    : lower.includes('alert')
    ? { bg: Palette.coral100, fg: Palette.coral600 }
    : { bg: Palette.gold100, fg: Palette.gold600 };
  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: fg }]}>{status}</Text>
    </View>
  );
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return value;
  }
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
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15, fontWeight: '900', color: Palette.ink },
  meta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.wash,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  tagText: { fontSize: 11, fontWeight: '800', color: Palette.green850 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
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
  scanFab: {
    position: 'absolute',
    right: 22,
    bottom: 84,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.blue700,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
