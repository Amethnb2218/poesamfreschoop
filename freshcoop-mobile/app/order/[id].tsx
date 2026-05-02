import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDialog } from '@/components/AppDialog';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getImageSource, resolveUrl } from '@/lib/images';
import {
  isAdminRole,
  isFieldAgentRole,
  isSellerRole,
  isTransporterRole,
  roleLabel,
} from '@/lib/roles';

const STATUSES = [
  'Paiement en attente',
  'Paiement confirme',
  'Preparation',
  'Prete',
  'En livraison',
  'Livree',
  'Annulee',
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, store, mutateStore } = useSession();
  const dialog = useDialog();

  const order = useMemo(
    () => (store.orders || []).find((o: any) => o.id === id),
    [store.orders, id],
  );
  const product = useMemo(() => {
    if (!order) return null;
    return (
      order.productSnapshot ||
      (store.products || []).find((p: any) => p.id === order.productId)
    );
  }, [order, store.products]);
  const buyer = useMemo(
    () => (store.users || []).find((u: any) => u.id === order?.userId || u.id === order?.buyerId),
    [store.users, order],
  );
  const seller = useMemo(
    () => (store.users || []).find((u: any) => u.id === order?.sellerId),
    [store.users, order],
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Ionicons name="sad-outline" size={48} color={Palette.muted} />
          <Text style={styles.notFoundTitle}>Commande introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const canChangeStatus =
    isAdminRole(user?.role) ||
    isSellerRole(user?.role) ||
    isTransporterRole(user?.role) ||
    isFieldAgentRole(user?.role);

  const image = resolveUrl(
    getImageSource(product?.images?.[0]) || getImageSource(product?.image),
  );

  async function changeStatus(next: string) {
    const ok = await dialog.confirm({
      title: 'Changer le statut',
      body: `Passer la commande en "${next}" ?`,
      confirmLabel: 'Confirmer',
      tone: 'info',
    });
    if (!ok) return;
    try {
      await mutateStore((store) => ({
        ...store,
        orders: (store.orders || []).map((o: any) =>
          o.id === id
            ? {
                ...o,
                status: next,
                updatedAt: new Date().toISOString(),
                ...(next === 'Paiement confirme' ? { paymentStatus: 'Paye' } : {}),
              }
            : o,
        ),
        notifications: [
          {
            id: `notif-${Date.now().toString(36)}`,
            createdAt: new Date().toISOString(),
            userId: order.userId || order.buyerId,
            title: 'Commande mise à jour',
            body: `Votre commande est maintenant : ${next}`,
            path: '/commandes',
            orderId: order.id,
            type: 'order-status',
            read: false,
          },
          ...(store.notifications || []),
        ],
      }));
      dialog.toast(`La commande est maintenant "${next}".`, 'success');
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible de changer le statut', 'danger');
    }
  }

  async function cancelOrder() {
    const ok = await dialog.confirm({
      title: 'Annuler la commande',
      body: 'Cette action est définitive. Le stock du produit sera restauré.',
      confirmLabel: 'Annuler la commande',
      cancelLabel: 'Retour',
      tone: 'warning',
      destructive: true,
    });
    if (!ok) return;
    try {
      await mutateStore((store) => ({
        ...store,
        orders: (store.orders || []).map((o: any) =>
          o.id === id
            ? { ...o, status: 'Annulee', updatedAt: new Date().toISOString() }
            : o,
        ),
        products: (store.products || []).map((p: any) =>
          p.id === order.productId
            ? {
                ...p,
                quantity: Number(p.quantity || 0) + Number(order.quantity || 0),
              }
            : p,
        ),
      }));
      dialog.toast('Commande annulée · stock restauré.', 'success');
      router.back();
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible', 'danger');
    }
  }

  const status = String(order.status || 'En cours');
  const total = Number(order.totalPrice || order.total || 0);
  const { bg, fg } = statusColors(status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <Text style={styles.topTitle}>Commande</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ref}>{order.reference || order.id}</Text>
              <Text style={styles.date}>
                {new Date(order.createdAt).toLocaleString('fr-FR')}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: bg }]}>
              <Text style={[styles.statusText, { color: fg }]}>{status}</Text>
            </View>
          </View>
        </Card>

        {(() => {
          // Bouton "Régler le paiement" si l'user est l'acheteur ET le paiement est en attente
          const isBuyer =
            user?.id === order.userId ||
            user?.id === order.clientId ||
            user?.id === order.buyerId ||
            (order.buyerEmail &&
              String(order.buyerEmail).toLowerCase() === String(user?.email || '').toLowerCase());
          const statusLower = String(order.status || '').toLowerCase();
          const paymentLower = String(order.paymentStatus || '').toLowerCase();
          const needsPayment =
            (statusLower.includes('paiement') && statusLower.includes('attente')) ||
            paymentLower.includes('attente') ||
            (!paymentLower || paymentLower === 'en attente');
          if (isBuyer && needsPayment) {
            return (
              <View style={styles.payBanner}>
                <View style={styles.payHeader}>
                  <Ionicons name="card" size={22} color={Palette.gold600} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payTitle}>Paiement à régler</Text>
                    <Text style={styles.paySub}>
                      {formatMoney(total)} · Finalisez pour démarrer la préparation
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/checkout', params: { orderIds: order.id } })
                  }
                  style={styles.payBtn}>
                  <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
                  <Text style={styles.payBtnText}>Régler le paiement</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </Pressable>
              </View>
            );
          }
          if (isBuyer && paymentLower.includes('paye')) {
            return (
              <View style={styles.paidBanner}>
                <Ionicons name="checkmark-circle" size={22} color={Palette.green700} />
                <Text style={styles.paidText}>Paiement confirmé</Text>
              </View>
            );
          }
          return null;
        })()}

        <Text style={styles.sectionTitle}>Article</Text>
        <Card>
          <View style={styles.productRow}>
            {image ? (
              <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, { backgroundColor: Palette.green100, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="leaf" size={24} color={Palette.green700} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product?.name || 'Produit'}</Text>
              <Text style={styles.productMeta}>
                {order.quantity} {order.unit || 'kg'} × {Number(order.unitPrice || 0).toLocaleString('fr-FR')} F
              </Text>
            </View>
            <Text style={styles.price}>{formatMoney(total)}</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Acheteur</Text>
        <Card>
          <PersonRow user={buyer} fallbackEmail={order.buyerEmail} fallbackName={order.customer?.name} phone={order.customer?.phone} />
        </Card>

        <Text style={styles.sectionTitle}>Vendeur</Text>
        <Card>
          <PersonRow user={seller} />
        </Card>

        {order.message ? (
          <>
            <Text style={styles.sectionTitle}>Message</Text>
            <Card>
              <Text style={styles.message}>{order.message}</Text>
            </Card>
          </>
        ) : null}

        {canChangeStatus ? (
          <>
            <Text style={styles.sectionTitle}>Changer le statut</Text>
            <View style={styles.statusGrid}>
              {STATUSES.filter((s) => s !== status).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => (s === 'Annulee' ? cancelOrder() : changeStatus(s))}
                  style={styles.statusBtn}>
                  <Text style={styles.statusBtnText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PersonRow({
  user,
  fallbackName,
  fallbackEmail,
  phone,
}: {
  user?: any;
  fallbackName?: string;
  fallbackEmail?: string;
  phone?: string;
}) {
  const name = user?.name || fallbackName || '—';
  const email = user?.email || fallbackEmail || '';
  const tel = user?.phone || phone || '';
  const initials = String(name).charAt(0).toUpperCase();
  return (
    <View style={styles.personRow}>
      <View style={styles.personAvatar}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={styles.personInitials}>{initials}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.personName}>{name}</Text>
        <Text style={styles.personMeta}>{email}</Text>
        {tel ? <Text style={styles.personMeta}>{tel}</Text> : null}
        {user?.role ? <Text style={styles.personRole}>{roleLabel(user.role)}</Text> : null}
      </View>
    </View>
  );
}

function statusColors(status: string): { bg: string; fg: string } {
  const s = status.toLowerCase();
  if (s.includes('livr') || s.includes('pay') || s.includes('complet') || s.includes('prete'))
    return { bg: Palette.green100, fg: Palette.green850 };
  if (s.includes('annul') || s.includes('rejet')) return { bg: Palette.coral100, fg: Palette.coral600 };
  return { bg: Palette.gold100, fg: Palette.gold600 };
}

function formatMoney(v: number): string {
  return `${Number(v).toLocaleString('fr-FR')} FCFA`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  topBar: {
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
    backgroundColor: Palette.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ref: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  date: { color: Palette.muted, fontSize: 12, marginTop: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
  },
  productRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: Palette.wash },
  productName: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  productMeta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  price: { fontWeight: '900', color: Palette.green850, fontSize: 16 },
  personRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  personInitials: { fontWeight: '900', color: Palette.green850, fontSize: 18 },
  personName: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  personMeta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  personRole: {
    color: Palette.green850,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  message: { color: Palette.ink2, fontSize: 13, lineHeight: 20 },
  payBanner: {
    backgroundColor: Palette.gold100,
    borderWidth: 1.5,
    borderColor: Palette.gold600,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  payHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payTitle: { color: Palette.ink, fontWeight: '900', fontSize: 14 },
  paySub: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.green700,
    paddingVertical: 14,
    borderRadius: 999,
  },
  payBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.green100,
    borderWidth: 1,
    borderColor: Palette.green700,
    borderRadius: 14,
    padding: 12,
  },
  paidText: { color: Palette.green850, fontWeight: '900', fontSize: 13 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Palette.lineStrong,
    borderRadius: Radius.pill,
  },
  statusBtnText: { color: Palette.ink, fontWeight: '800', fontSize: 13 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  notFoundTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
});
