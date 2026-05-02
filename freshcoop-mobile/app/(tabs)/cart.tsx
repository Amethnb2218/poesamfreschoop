import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDialog } from '@/components/AppDialog';
import { Button } from '@/components/Button';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { CartItem, useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import { getImageSource, resolveUrl } from '@/lib/images';
import { isBuyerRole, scopeOrdersForUser } from '@/lib/roles';

type Tab = 'panier' | 'commandes';

export default function CartTabScreen() {
  const { items, count } = useCart();
  const { user, store } = useSession();
  const isBuyer = isBuyerRole(user?.role);
  const [tab, setTab] = useState<Tab>(isBuyer ? 'panier' : 'commandes');

  const myOrders = useMemo(() => {
    if (!user) return [];
    return scopeOrdersForUser(
      store.orders || [],
      user.role,
      user.id,
      user.email,
    ).sort((a: any, b: any) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
    );
  }, [store.orders, user]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{isBuyer ? 'Mon compte' : 'Commandes'}</Text>
        <Text style={styles.subtitle}>
          {isBuyer
            ? `${count} article${count > 1 ? 's' : ''} · ${myOrders.length} commande${
                myOrders.length > 1 ? 's' : ''
              }`
            : `${myOrders.length} commande${myOrders.length > 1 ? 's' : ''} à traiter`}
        </Text>
      </View>

      {isBuyer ? (
        <>
          <View style={styles.tabs}>
            <TabButton
              label="Panier"
              icon="cart-outline"
              active={tab === 'panier'}
              badge={count}
              onPress={() => setTab('panier')}
            />
            <TabButton
              label="Commandes"
              icon="receipt-outline"
              active={tab === 'commandes'}
              badge={myOrders.length}
              onPress={() => setTab('commandes')}
            />
          </View>
          {tab === 'panier' ? <CartView /> : <OrdersView orders={myOrders} />}
        </>
      ) : (
        <OrdersView orders={myOrders} />
      )}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  icon,
  active,
  badge,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  badge: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}>
      <Ionicons name={icon} size={18} color={active ? '#ffffff' : Palette.ink} />
      <Text style={[styles.tabLabel, active && { color: '#ffffff' }]}>{label}</Text>
      {badge > 0 ? (
        <View style={[styles.tabBadge, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={[styles.tabBadgeText, active && { color: '#ffffff' }]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function CartView() {
  const { items, total, count, update, remove, clear } = useCart();
  const { user, refresh } = useSession();
  const dialog = useDialog();

  async function checkout() {
    if (!user || items.length === 0) return;
    const now = new Date().toISOString();

    // Récupère le store courant pour éviter d'écraser des modifs concurrentes
    const fresh = await api.getStore();

    // Trouve un agent terrain actif pour assigner les commandes (comme le site)
    const agent =
      (fresh.users || []).find((u: any) => u.role === 'agentTerrain' && u.status === 'Actif') ||
      (fresh.users || []).find((u: any) => u.role === 'transporteur' && u.status === 'Actif');

    const newOrders = items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.product.price || 0);
      const orderId = `ord-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      return {
        id: orderId,
        createdAt: now,
        productId: item.productId,
        sellerId: item.sellerId || item.product.ownerId || '',
        clientId: user.id,
        userId: user.id,
        buyerId: user.id,
        buyerEmail: user.email,
        customer: { name: user.name, email: user.email, phone: user.phone || '' },
        quantity,
        unit: item.product.unit || 'unite',
        unitPrice,
        totalPrice: unitPrice * quantity,
        total: unitPrice * quantity,
        status: 'Paiement en attente',
        paymentStatus: 'En attente',
        assignedAgentId: agent?.id || '',
        agentWorkflow: {},
        message:
          'Commande FresCoop en attente de paiement. Règlement à confirmer pour préparation.',
        productSnapshot: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          unit: item.product.unit,
          image: item.product.image,
          images: item.product.images,
          ownerId: item.product.ownerId,
          zone: item.product.zone,
        },
      };
    });

    // Décrémenter le stock dans la même transaction
    const decrement = new Map<string, number>();
    items.forEach((it) => {
      decrement.set(it.productId, (decrement.get(it.productId) || 0) + Number(it.quantity || 0));
    });

    const nextProducts = (fresh.products || []).map((p: any) => {
      if (!decrement.has(p.id)) return p;
      const nextQty = Math.max(0, Number(p.quantity || 0) - (decrement.get(p.id) || 0));
      return { ...p, quantity: nextQty, updatedAt: now };
    });

    const nextStore = {
      ...fresh,
      products: nextProducts,
      orders: [...newOrders, ...(fresh.orders || [])],
      notifications: [
        ...newOrders.map((o) => ({
          id: `notif-${o.id}`,
          createdAt: now,
          userId: o.sellerId,
          title: 'Nouvelle commande',
          body: `${user.name} · ${o.quantity} ${o.unit} · ${o.totalPrice.toLocaleString('fr-FR')} FCFA`,
          path: '/commandes',
          type: 'order',
          orderId: o.id,
          read: false,
        })),
        ...(fresh.notifications || []),
      ],
    };

    await api.putStore(nextStore);
    await clear();
    await refresh();

    // Redirige vers l'écran de paiement sécurisé
    router.push({
      pathname: '/checkout',
      params: { orderIds: newOrders.map((o) => o.id).join(',') },
    });
  }

  async function confirmCheckout() {
    if (items.length === 0) return;
    const ok = await dialog.confirm({
      title: 'Confirmer la commande',
      body: `${count} article${count > 1 ? 's' : ''} · ${formatMoney(total)}\n\nUn paiement sécurisé vous sera proposé à l'étape suivante.`,
      confirmLabel: 'Confirmer',
      tone: 'success',
    });
    if (!ok) return;
    try {
      await checkout();
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible d\'envoyer la commande', 'danger');
    }
  }

  async function confirmClear() {
    if (items.length === 0) return;
    const ok = await dialog.confirm({
      title: 'Vider le panier',
      body: 'Retirer tous les articles du panier ?',
      confirmLabel: 'Vider',
      tone: 'warning',
      destructive: true,
    });
    if (ok) await clear();
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color={Palette.muted} />
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <Text style={styles.emptyText}>
          Ajoutez des produits depuis le marché pour commencer une commande.
        </Text>
        <Button
          label="Explorer le marché"
          variant="primary"
          size="lg"
          onPress={() => router.navigate('/(tabs)/market')}
        />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={() => (
          <Pressable onPress={confirmClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color={Palette.coral600} />
            <Text style={styles.clearText}>Vider le panier</Text>
          </Pressable>
        )}
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onChange={(qty) => update(item.productId, qty)}
            onRemove={() => remove(item.productId)}
          />
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total {count} article{count > 1 ? 's' : ''}
          </Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <Button
          label="Passer la commande"
          size="lg"
          onPress={confirmCheckout}
          trailing={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
        />
      </View>
    </>
  );
}

function CartRow({
  item,
  onChange,
  onRemove,
}: {
  item: CartItem;
  onChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const img = item.product.images?.length
    ? resolveUrl(getImageSource(item.product.images[0]))
    : resolveUrl(getImageSource(item.product.image));

  const stock = Math.max(1, Number(item.product.quantity || 9999));
  const [text, setText] = useState(String(item.quantity));

  // Garde le champ synchronisé si la quantité change de l'extérieur
  useEffect(() => {
    setText(String(item.quantity));
  }, [item.quantity]);

  function commit() {
    const parsed = Number(text);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setText(String(item.quantity));
      return;
    }
    const next = Math.min(stock, Math.round(parsed));
    onChange(next);
    setText(String(next));
  }

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/product/[id]', params: { id: item.productId } })
      }
      style={styles.row}>
      {img ? (
        <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]}>
          <Ionicons name="leaf" size={24} color={Palette.green700} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.price}>
          {formatMoney(item.product.price)} / {item.product.unit}
        </Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => onChange(Math.max(1, item.quantity - 1))}
            style={styles.stepBtn}
            hitSlop={8}>
            <Ionicons name="remove" size={16} color={Palette.ink} />
          </Pressable>
          <View style={styles.qtyInputWrap}>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.replace(/[^\d]/g, ''))}
              onBlur={commit}
              onSubmitEditing={commit}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={6}
              selectTextOnFocus
              style={styles.qtyInputText}
            />
            <Text style={styles.qtyInputUnit}>{item.product.unit}</Text>
          </View>
          <Pressable
            onPress={() => onChange(Math.min(stock, item.quantity + 1))}
            style={styles.stepBtn}
            hitSlop={8}>
            <Ionicons name="add" size={16} color={Palette.ink} />
          </Pressable>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.rowTotal}>{formatMoney(item.quantity * item.product.price)}</Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={22} color={Palette.muted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const ORDER_FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'pending', label: 'En attente' },
  { key: 'active', label: 'En cours' },
  { key: 'done', label: 'Livrées' },
  { key: 'cancel', label: 'Annulées' },
];

function OrdersView({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => {
      const s = String(o.status || '').toLowerCase();
      if (filter === 'pending') return s.includes('attente') || s.includes('paiement');
      if (filter === 'active')
        return s.includes('prepar') || s.includes('livraison') || s.includes('prete');
      if (filter === 'done') return s.includes('livr') || s.includes('paye') || s.includes('complet');
      if (filter === 'cancel') return s.includes('annul') || s.includes('rejet');
      return true;
    });
  }, [filter, orders]);

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={64} color={Palette.muted} />
        <Text style={styles.emptyTitle}>Aucune commande</Text>
        <Text style={styles.emptyText}>
          Vos commandes passées apparaîtront ici en temps réel.
        </Text>
        <Button
          label="Explorer le marché"
          variant="primary"
          size="lg"
          onPress={() => router.navigate('/(tabs)/market')}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(o: any, i) => String(o.id || i)}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={() => (
        <View style={styles.orderFilters}>
          {ORDER_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.orderFilterChip, filter === f.key && styles.orderFilterActive]}>
              <Text
                style={[
                  styles.orderFilterText,
                  filter === f.key && { color: '#ffffff' },
                ]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyFilter}>
          <Ionicons name="filter-outline" size={40} color={Palette.muted} />
          <Text style={styles.emptyFilterTitle}>Aucune commande dans ce filtre</Text>
          <Text style={styles.emptyFilterText}>
            {filter === 'pending' && 'Aucune commande en attente de paiement pour le moment.'}
            {filter === 'active' && "Aucune commande en cours de préparation ou de livraison."}
            {filter === 'done' && 'Aucune commande livrée ou payée pour le moment.'}
            {filter === 'cancel' && 'Aucune commande annulée — c\'est bon signe !'}
            {filter === 'all' && 'Aucune commande trouvée.'}
          </Text>
          {filter !== 'all' ? (
            <Pressable onPress={() => setFilter('all')} style={styles.emptyFilterBtn}>
              <Text style={styles.emptyFilterBtnText}>Voir toutes les commandes</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      renderItem={({ item }) => <OrderRow order={item} />}
    />
  );
}

function OrderRow({ order }: { order: any }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}>
      <OrderRowBody order={order} />
    </Pressable>
  );
}

function OrderRowBody({ order }: { order: any }) {
  const status = String(order.status || order.state || 'En cours');
  const total = Number(order.totalPrice || order.total || order.amount || 0);
  const date = order.createdAt || order.date || '';
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const productName =
    order.productSnapshot?.name || order.product?.name || order.productName || '';
  const buyerName =
    order.customer?.name || order.buyerName || order.buyerEmail || '';

  const { bg, fg } = statusColors(status);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderRef}>
            {order.reference || productName || order.id || 'Commande'}
          </Text>
          <Text style={styles.orderDate}>
            {buyerName ? `${buyerName} · ` : ''}
            {formatDate(date)}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: bg }]}>
          <Text style={[styles.statusText, { color: fg }]}>{status}</Text>
        </View>
      </View>

      {items.length > 0 ? (
        <View style={styles.orderItems}>
          {items.slice(0, 3).map((it: any, i: number) => (
            <Text key={i} style={styles.orderItemLine} numberOfLines={1}>
              · {it.quantity || 1} × {it.product?.name || it.name || 'Produit'}
            </Text>
          ))}
          {items.length > 3 ? (
            <Text style={styles.orderItemMore}>+ {items.length - 3} autre(s)</Text>
          ) : null}
        </View>
      ) : order.quantity ? (
        <View style={styles.orderItems}>
          <Text style={styles.orderItemLine} numberOfLines={1}>
            · {order.quantity} {order.unit || 'kg'} × {productName || 'Produit'}
          </Text>
        </View>
      ) : null}

      <View style={styles.orderFooter}>
        <Text style={styles.orderFooterLabel}>Total</Text>
        <Text style={styles.orderTotal}>{formatMoney(total)}</Text>
      </View>

      {(() => {
        const statusLower = String(order.status || '').toLowerCase();
        const paymentLower = String(order.paymentStatus || '').toLowerCase();
        const needsPayment =
          (statusLower.includes('paiement') && statusLower.includes('attente')) ||
          paymentLower.includes('attente') ||
          (!paymentLower && !statusLower.includes('livree') && !statusLower.includes('annulee'));
        if (needsPayment) {
          return (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                router.push({ pathname: '/checkout', params: { orderIds: order.id } });
              }}
              style={styles.payInlineBtn}>
              <Ionicons name="card" size={15} color="#ffffff" />
              <Text style={styles.payInlineText}>Régler le paiement</Text>
              <Ionicons name="arrow-forward" size={15} color="#ffffff" />
            </Pressable>
          );
        }
        return null;
      })()}
    </View>
  );
}

function statusColors(status: string): { bg: string; fg: string } {
  const s = status.toLowerCase();
  if (s.includes('livr') || s.includes('pay') || s.includes('complet'))
    return { bg: Palette.green100, fg: Palette.green850 };
  if (s.includes('annul') || s.includes('rejet') || s.includes('erreur'))
    return { bg: Palette.coral100, fg: Palette.coral600 };
  return { bg: Palette.gold100, fg: Palette.gold600 };
}

function formatMoney(value: number): string {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

function formatDate(value: string): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, marginTop: 2, fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    paddingVertical: 12,
    borderRadius: Radius.pill,
  },
  tabActive: {
    backgroundColor: Palette.green700,
    borderColor: Palette.green700,
  },
  tabLabel: { fontWeight: '900', color: Palette.ink, fontSize: 13 },
  tabBadge: {
    backgroundColor: Palette.green100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 22,
    alignItems: 'center',
  },
  tabBadgeText: { fontSize: 11, fontWeight: '900', color: Palette.green850 },
  list: { paddingHorizontal: 16, paddingBottom: 180 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 12,
    ...Shadows.sm,
  },
  thumb: {
    width: 74,
    height: 74,
    borderRadius: Radius.md,
    backgroundColor: Palette.wash,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green100,
  },
  name: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  price: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.wash,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.ink,
    minWidth: 46,
    textAlign: 'center',
  },
  qtyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.wash,
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 74,
    justifyContent: 'center',
  },
  qtyInputText: {
    fontSize: 14,
    fontWeight: '900',
    color: Palette.ink,
    textAlign: 'center',
    minWidth: 28,
    padding: 0,
  },
  qtyInputUnit: { fontSize: 11, fontWeight: '800', color: Palette.muted },
  right: { alignItems: 'flex-end', justifyContent: 'space-between' },
  rowTotal: { fontWeight: '900', color: Palette.green850, fontSize: 14 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
  },
  clearText: { color: Palette.coral600, fontWeight: '800', fontSize: 13 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Palette.ink },
  emptyText: {
    color: Palette.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: Palette.muted, fontSize: 12, fontWeight: '700' },
  totalValue: { color: Palette.ink, fontSize: 22, fontWeight: '900' },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 16,
    gap: 10,
    ...Shadows.sm,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  orderRef: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  orderDate: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  orderItems: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    gap: 2,
  },
  orderItemLine: { color: Palette.ink2, fontSize: 13 },
  orderItemMore: { color: Palette.muted, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  orderFooterLabel: { color: Palette.muted, fontWeight: '700', fontSize: 12 },
  orderTotal: { fontWeight: '900', color: Palette.green850, fontSize: 16 },
  orderFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  orderFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: 999,
  },
  orderFilterActive: { backgroundColor: Palette.green700, borderColor: Palette.green700 },
  orderFilterText: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  emptyFilter: {
    alignItems: 'center',
    padding: 32,
    gap: 10,
  },
  emptyFilterTitle: { fontSize: 15, fontWeight: '900', color: Palette.ink, textAlign: 'center' },
  emptyFilterText: {
    fontSize: 13,
    color: Palette.muted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  emptyFilterBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: Palette.green100,
    borderRadius: 999,
  },
  emptyFilterBtnText: { color: Palette.green850, fontWeight: '900', fontSize: 13 },
  payInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.gold600,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 10,
  },
  payInlineText: { color: '#ffffff', fontWeight: '900', fontSize: 12, letterSpacing: 0.3 },
});
