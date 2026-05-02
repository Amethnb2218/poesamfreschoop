import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { AntiWasteAlert, buildAntiWasteAlerts } from '@/lib/analytics';
import { isAdminRole, isBuyerRole, isSellerRole } from '@/lib/roles';

export default function AntiGaspiScreen() {
  const { user, store, refresh, loading, mutateStore } = useSession();
  const role = user?.role;
  const alerts = useMemo(() => buildAntiWasteAlerts(store), [store]);
  const scoped = useMemo(() => {
    if (isSellerRole(role)) return alerts.filter((a) => a.sellerId === user?.id);
    return alerts;
  }, [alerts, role, user]);

  const canApply = isSellerRole(role) || isAdminRole(role);

  async function applyDiscount(alert: AntiWasteAlert) {
    Alert.alert(
      'Appliquer la remise',
      `${alert.productName} passe à ${alert.suggestedPrice.toLocaleString('fr-FR')} FCFA (-${alert.suggestedDiscountPct}%).`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appliquer',
          onPress: async () => {
            const now = new Date().toISOString();
            await mutateStore((store) => ({
              ...store,
              products: (store.products || []).map((p: any) =>
                p.id === alert.productId
                  ? {
                      ...p,
                      price: alert.suggestedPrice,
                      flashSaleStartedAt: now,
                      flashSaleDiscountPct: alert.suggestedDiscountPct,
                      updatedAt: now,
                    }
                  : p,
              ),
              notifications: [
                {
                  id: `notif-flash-${Date.now().toString(36)}`,
                  createdAt: now,
                  title: 'Vente éclair anti-gaspi',
                  body: `${alert.productName} -${alert.suggestedDiscountPct}% — disponible immédiatement`,
                  path: '/marche',
                  recipientRole: 'acheteurB2B',
                  type: 'anti-waste',
                  read: false,
                },
                ...(store.notifications || []),
              ],
            }));
          },
        },
      ],
    );
  }

  const heroTitle = isSellerRole(role)
    ? 'Vos lots proches de péremption'
    : isBuyerRole(role)
    ? 'Produits à sauver · prix réduits'
    : 'Lots à risque · alertes anti-gaspi';

  const heroBody = isSellerRole(role)
    ? 'Appliquez une réduction (-15 à -40%) pour éviter la perte. Plus vous agissez vite, mieux votre score de bancabilité progresse.'
    : isBuyerRole(role)
    ? 'Achetez ces produits à prix cassé. Chaque achat évite des pertes et soutient un producteur.'
    : '30 à 40% des récoltes sont perdues au Sénégal. FresCoop détecte les lots à DLC courte et propose des ventes éclair.';

  return (
    <>
      <Stack.Screen options={{ title: 'Anti-gaspi' }} />
      <FlatList
        data={scoped}
        keyExtractor={(a) => a.productId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ListHeaderComponent={() => (
          <View style={styles.hero}>
            <Text style={styles.kicker}>ANTI-GASPI</Text>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroBody}>{heroBody}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={36} color={Palette.green700} />
              <Text style={styles.emptyTitle}>Aucune alerte</Text>
              <Text style={styles.emptyText}>
                Aucun lot proche de péremption pour le moment. Tout va bien !
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }) => (
          <AlertRow
            alert={item}
            canApply={canApply}
            onApply={() => applyDiscount(item)}
          />
        )}
      />
    </>
  );
}

function AlertRow({
  alert,
  canApply,
  onApply,
}: {
  alert: AntiWasteAlert;
  canApply: boolean;
  onApply: () => void;
}) {
  const tint =
    alert.urgency === 'critical'
      ? Palette.coral600
      : alert.urgency === 'high'
      ? Palette.gold600
      : Palette.blue700;
  const bg =
    alert.urgency === 'critical'
      ? Palette.coral100
      : alert.urgency === 'high'
      ? Palette.gold100
      : Palette.blue100;

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.urgencyBadge, { backgroundColor: bg }]}>
          <Text style={[styles.urgencyText, { color: tint }]}>{alert.urgencyLabel}</Text>
        </View>
        <Text style={styles.daysLeft}>
          {alert.daysLeft === 0 ? "Aujourd'hui" : `${alert.daysLeft}j`}
        </Text>
      </View>
      <Text style={styles.productName}>{alert.productName}</Text>
      <Text style={styles.meta}>
        {alert.sellerName} · {alert.region || 'Sénégal'} · {alert.quantityKg} {alert.unit}
      </Text>
      <View style={styles.priceBlock}>
        <View>
          <Text style={styles.label}>Prix actuel</Text>
          <Text style={styles.priceOld}>
            {alert.currentUnitPrice.toLocaleString('fr-FR')} F
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={Palette.muted} />
        <View>
          <Text style={styles.label}>Prix suggéré</Text>
          <Text style={[styles.priceNew, { color: tint }]}>
            {alert.suggestedPrice.toLocaleString('fr-FR')} F
          </Text>
        </View>
        <View style={[styles.discount, { backgroundColor: bg }]}>
          <Text style={[styles.discountText, { color: tint }]}>
            -{alert.suggestedDiscountPct}%
          </Text>
        </View>
      </View>

      {canApply ? (
        <Pressable onPress={onApply} style={[styles.applyBtn, { backgroundColor: tint }]}>
          <Ionicons name="flash" size={16} color="#ffffff" />
          <Text style={styles.applyText}>Appliquer la remise</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, paddingBottom: 40 },
  hero: {
    backgroundColor: Palette.green950,
    padding: 18,
    borderRadius: Radius.lg,
    marginBottom: 16,
    gap: 6,
  },
  kicker: {
    color: Palette.gold600,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  heroTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  heroBody: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  urgencyText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  daysLeft: { fontSize: 12, fontWeight: '800', color: Palette.muted },
  productName: { fontSize: 15, fontWeight: '900', color: Palette.ink, marginTop: 8 },
  meta: { fontSize: 12, color: Palette.muted, marginTop: 2 },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  label: { fontSize: 10, color: Palette.muted, fontWeight: '800', textTransform: 'uppercase' },
  priceOld: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.muted,
    textDecorationLine: 'line-through',
  },
  priceNew: { fontSize: 16, fontWeight: '900' },
  discount: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  discountText: { fontSize: 13, fontWeight: '900' },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  applyText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
