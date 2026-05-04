import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { NotificationBell } from '@/components/NotificationBell';
import { StatPill } from '@/components/StatPill';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getProductImage } from '@/lib/images';
import {
  isAdminRole,
  isBuyerRole,
  isFieldAgentRole,
  isPartnerRole,
  isSellerRole,
  isTransporterRole,
  roleLabel,
  scopeHubs,
  scopeLots,
  scopeOrdersForUser,
  scopeProducts,
} from '@/lib/roles';

export default function HomeScreen() {
  const { user, store, refresh, loading, error, online, lastSyncAt } = useSession();
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);

  const role = user?.role;
  const userId = user?.id || '';
  const userEmail = user?.email || '';

  const scopedLots = useMemo(
    () => scopeLots(store.lots || [], role, userId),
    [store.lots, role, userId],
  );
  const scopedHubs = useMemo(
    () => scopeHubs(store.hubs || [], role, userId),
    [store.hubs, role, userId],
  );
  const scopedOrders = useMemo(
    () => scopeOrdersForUser(store.orders || [], role, userId, userEmail),
    [store.orders, role, userId, userEmail],
  );
  const scopedProducts = useMemo(
    () => scopeProducts(store.products || [], role, userId),
    [store.products, role, userId],
  );

  const stats = {
    activeLots: scopedLots.length,
    activeHubs: scopedHubs.length,
    orders: scopedOrders.length,
    products: scopedProducts.length,
  };

  const recentOrders = (isBuyerRole(role)
    ? scopedOrders.filter(isClientHomeOrderVisible)
    : scopedOrders
  ).slice(-15).reverse();
  // pour les acheteurs on montre la VITRINE (tous les produits), pas seulement les scoped
  const marketProducts = isBuyerRole(role) ? store.products || [] : scopedProducts;
  const recentProducts = marketProducts.slice(-20).reverse();
  const firstName = (user?.name || '').split(' ')[0] || 'Bienvenue';

  // Regroupement par agriculteur (vendeur du produit / vendeur de la commande)
  const usersById = new Map<string, any>((store.users || []).map((u: any) => [u.id, u]));
  function sellerLabel(id: string | undefined, fallback = 'FresCoop'): string {
    if (!id) return fallback;
    const u = usersById.get(id);
    return u?.name || u?.organization || fallback;
  }

  // Groupes commandes : clé = nom agriculteur (sellerId de la commande)
  const orderGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    recentOrders.forEach((o: any) => {
      const key = sellerLabel(o.sellerId || o.productSnapshot?.ownerId, 'Vendeur inconnu');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [recentOrders, store.users]);

  // Groupes produits : clé = nom agriculteur (ownerId)
  const productGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    recentProducts.forEach((p: any) => {
      const key = sellerLabel(p.ownerId, p.zone || 'FresCoop');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [recentProducts, store.users]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Palette.green950, Palette.green850]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>FresCoop · Accueil</Text>
              <Text style={styles.heroTitle}>Bonjour {firstName}</Text>
              <Text style={styles.heroSub}>
                {roleLabel(user?.role)} · {user?.organization || 'FresCoop'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Pressable
                onPress={() => router.push('/search')}
                style={styles.heroIcon}
                hitSlop={10}>
                <Ionicons name="search" size={18} color="#ffffff" />
              </Pressable>
              <NotificationBell tone="light" />
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.avatar}
                hitSlop={10}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.heroKpis}>
            {isBuyerRole(role) ? (
              <>
                <HeroKpi label="Commandes" value={String(stats.orders)} />
                <HeroKpi label="Offres" value={String(store.products?.length || 0)} />
                <HeroKpi label="Producteurs" value={String(
                  new Set((store.products || []).map((p: any) => p.ownerId)).size,
                )} />
              </>
            ) : isSellerRole(role) ? (
              <>
                <HeroKpi label="Produits" value={String(stats.products)} />
                <HeroKpi label="Lots" value={String(stats.activeLots)} />
                <HeroKpi label="Commandes" value={String(stats.orders)} />
              </>
            ) : isTransporterRole(role) ? (
              <>
                <HeroKpi label="Lots" value={String(stats.activeLots)} />
                <HeroKpi label="Tournées" value={String(store.dispatches?.length || 0)} />
                <HeroKpi label="Commandes" value={String(stats.orders)} />
              </>
            ) : isFieldAgentRole(role) ? (
              <>
                <HeroKpi label="Produits" value={String(store.products?.length || 0)} />
                <HeroKpi label="Alertes" value={String(store.alerts?.length || 0)} />
                <HeroKpi label="Commandes" value={String(stats.orders)} />
              </>
            ) : isPartnerRole(role) ? (
              <>
                <HeroKpi label="Dossiers" value={String(store.dossiers?.length || 0)} />
                <HeroKpi label="Preuves" value={String(store.proofs?.length || 0)} />
                <HeroKpi label="Prêts" value={String(store.loans?.length || 0)} />
              </>
            ) : isAdminRole(role) ? (
              <>
                <HeroKpi label="Utilisateurs" value={String(store.users?.length || 0)} />
                <HeroKpi label="Lots" value={String(stats.activeLots)} />
                <HeroKpi label="Hubs" value={String(stats.activeHubs)} />
              </>
            ) : (
              <>
                <HeroKpi label="Produits" value={String(store.products?.length || 0)} />
                <HeroKpi label="Lots" value={String(stats.activeLots)} />
                <HeroKpi label="Commandes" value={String(stats.orders)} />
              </>
            )}
          </View>
        </LinearGradient>

        {!online ? (
          <View style={styles.warnBox}>
            <Ionicons name="cloud-offline-outline" size={18} color={Palette.coral600} />
            <Text style={styles.warnText}>
              Hors-ligne · les données affichées sont celles du dernier chargement
              {lastSyncAt ? ` (${formatRelative(lastSyncAt)})` : ''}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.warnBox}>
            <Ionicons name="cloud-offline-outline" size={18} color={Palette.coral600} />
            <Text style={styles.warnText}>Sync API impossible · {error}</Text>
          </View>
        ) : lastSyncAt ? (
          <View style={styles.syncBox}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Synchronisé {formatRelative(lastSyncAt)}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickRow}>
          {isBuyerRole(role) ? (
            <>
              <QuickAction
                icon="storefront-outline"
                label="Marché"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/market')}
              />
              <QuickAction
                icon="cart-outline"
                label="Panier"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/cart')}
              />
              <QuickAction
                icon="chatbubbles-outline"
                label="Messages"
                tint={Palette.gold600}
                onPress={() => router.push('/messages/' as any)}
              />
            </>
          ) : isSellerRole(role) ? (
            <>
              <QuickAction
                icon="leaf-outline"
                label="Mes produits"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/products')}
              />
              <QuickAction
                icon="cube-outline"
                label="Mes lots"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/lots')}
              />
              <QuickAction
                icon="chatbubbles-outline"
                label="Messages"
                tint={Palette.gold600}
                onPress={() => router.push('/messages/' as any)}
              />
            </>
          ) : isTransporterRole(role) ? (
            <>
              <QuickAction
                icon="bus-outline"
                label="Tournées"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/operations')}
              />
              <QuickAction
                icon="cube-outline"
                label="Lots"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/lots')}
              />
              <QuickAction
                icon="receipt-outline"
                label="Commandes"
                tint={Palette.gold600}
                onPress={() => router.push('/(tabs)/cart')}
              />
            </>
          ) : isFieldAgentRole(role) ? (
            <>
              <QuickAction
                icon="checkmark-circle-outline"
                label="Vérif produits"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/products')}
              />
              <QuickAction
                icon="cube-outline"
                label="Lots"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/lots')}
              />
              <QuickAction
                icon="bus-outline"
                label="Opérations"
                tint={Palette.gold600}
                onPress={() => router.push('/(tabs)/operations')}
              />
            </>
          ) : isPartnerRole(role) ? (
            <>
              <QuickAction
                icon="stats-chart-outline"
                label="Impact"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/impact')}
              />
              <QuickAction
                icon="cube-outline"
                label="Lots"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/lots')}
              />
              <QuickAction
                icon="person-outline"
                label="Profil"
                tint={Palette.gold600}
                onPress={() => router.push('/(tabs)/profile')}
              />
            </>
          ) : (
            <>
              <QuickAction
                icon="leaf-outline"
                label="Produits"
                tint={Palette.green700}
                onPress={() => router.push('/(tabs)/products')}
              />
              <QuickAction
                icon="cube-outline"
                label="Lots"
                tint={Palette.blue700}
                onPress={() => router.push('/(tabs)/lots')}
              />
              <QuickAction
                icon="bus-outline"
                label="Opérations"
                tint={Palette.gold600}
                onPress={() => router.push('/(tabs)/operations')}
              />
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Aperçu</Text>
        <View style={styles.grid}>
          {isBuyerRole(role) ? (
            <>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="leaf-outline"
                  label="Offres"
                  value={String(stats.products)}
                  tint={Palette.green700}
                />
              </View>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="cart-outline"
                  label="Mes commandes"
                  value={String(stats.orders)}
                  tint={Palette.blue700}
                />
              </View>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="pricetags-outline"
                  label="Catégories"
                  value={String(
                    new Set((store.products || []).map((p: any) => p.category)).size,
                  )}
                  tint={Palette.gold600}
                />
              </View>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="location-outline"
                  label="Régions"
                  value={String(
                    new Set((store.products || []).map((p: any) => p.zone || p.region)).size,
                  )}
                  tint={Palette.green850}
                />
              </View>
            </>
          ) : (
            <>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="leaf-outline"
                  label="Produits"
                  value={String(stats.products)}
                  tint={Palette.green700}
                />
              </View>
              {role === 'admin' ? (
                <View style={{ flexBasis: '48%' }}>
                  <StatPill
                    icon="people-outline"
                    label="Utilisateurs"
                    value={String(store.users?.length || 0)}
                    tint={Palette.blue700}
                  />
                </View>
              ) : (
                <View style={{ flexBasis: '48%' }}>
                  <StatPill
                    icon="cube-outline"
                    label="Lots"
                    value={String(stats.activeLots)}
                    tint={Palette.blue700}
                  />
                </View>
              )}
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="shield-checkmark-outline"
                  label="Attestations"
                  value={String(store.attestations?.length || 0)}
                  tint={Palette.gold600}
                />
              </View>
              <View style={{ flexBasis: '48%' }}>
                <StatPill
                  icon="trending-up-outline"
                  label="Transactions"
                  value={String(store.transactions?.length || 0)}
                  tint={Palette.green850}
                />
              </View>
            </>
          )}
        </View>

        <Pressable onPress={() => setOrdersOpen((v) => !v)} style={styles.accordionHeader}>
          <View style={styles.accordionTitle}>
            <Ionicons name="receipt-outline" size={18} color={Palette.green850} />
            <Text style={styles.accordionText}>
              {isBuyerRole(role) ? 'Mes commandes' : isSellerRole(role) ? 'Commandes reçues' : 'Commandes récentes'}
            </Text>
            <View style={styles.accordionBadge}>
              <Text style={styles.accordionBadgeText}>{recentOrders.length}</Text>
            </View>
          </View>
          <Ionicons
            name={ordersOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Palette.muted}
          />
        </Pressable>

        {ordersOpen ? (
          <View style={styles.listWrap}>
            {recentOrders.length === 0 ? (
              <Card>
                <Text style={styles.emptyTitle}>Aucune commande pour l'instant</Text>
                <Text style={styles.emptyText}>
                  Les commandes passées apparaîtront ici en temps réel.
                </Text>
              </Card>
            ) : (
              orderGroups.map(([groupName, orders]) => {
                const groupTotal = orders.reduce(
                  (sum, o) => sum + Number(o.total || o.totalPrice || 0),
                  0,
                );
                return (
                  <View key={groupName} style={{ marginBottom: 14 }}>
                    <View style={styles.groupHeader}>
                      <View style={styles.groupAvatar}>
                        <Ionicons name="person" size={14} color={Palette.green850} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {groupName}
                        </Text>
                        <Text style={styles.groupMeta}>
                          {orders.length} commande{orders.length > 1 ? 's' : ''} ·{' '}
                          {formatMoney(groupTotal)}
                        </Text>
                      </View>
                    </View>
                    {orders.map((order: any, idx: number) => (
                      <Pressable
                        key={order.id || idx}
                        onPress={() =>
                          router.push({ pathname: '/order/[id]', params: { id: order.id } })
                        }>
                        <Card style={{ marginBottom: 8 }}>
                          <View style={styles.rowBetween}>
                            <Text style={styles.orderTitle} numberOfLines={1}>
                              {order.productSnapshot?.name ||
                                order.reference ||
                                order.id ||
                                `Commande ${idx + 1}`}
                            </Text>
                            <View style={[styles.badge, { backgroundColor: Palette.green100 }]}>
                              <Text style={[styles.badgeText, { color: Palette.green850 }]}>
                                {order.status || 'En cours'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.orderMeta}>
                            {order.customer?.name || order.buyerName || '—'} ·{' '}
                            {formatMoney(order.total || order.totalPrice || 0)}
                          </Text>
                        </Card>
                      </Pressable>
                    ))}
                  </View>
                );
              })
            )}
          </View>
        ) : null}

        <Pressable onPress={() => setProductsOpen((v) => !v)} style={styles.accordionHeader}>
          <View style={styles.accordionTitle}>
            <Ionicons name="leaf-outline" size={18} color={Palette.green850} />
            <Text style={styles.accordionText}>
              {isBuyerRole(role) ? 'Nouveautés marché' : isSellerRole(role) ? 'Mes produits' : 'Derniers produits'}
            </Text>
            <View style={styles.accordionBadge}>
              <Text style={styles.accordionBadgeText}>{recentProducts.length}</Text>
            </View>
          </View>
          <Ionicons
            name={productsOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Palette.muted}
          />
        </Pressable>
        {productsOpen ? (
          <View style={styles.listWrap}>
            {recentProducts.length === 0 ? (
              <Card>
                <Text style={styles.emptyTitle}>Catalogue vide</Text>
                <Text style={styles.emptyText}>
                  Ajoutez des produits depuis le site pour les voir ici.
                </Text>
              </Card>
            ) : (
              productGroups.map(([groupName, products]) => {
                const groupOwner = products[0]?.ownerId;
                const ownerData = groupOwner ? usersById.get(groupOwner) : null;
                return (
                  <View key={groupName} style={{ marginBottom: 14 }}>
                    <View style={styles.groupHeader}>
                      <View style={styles.groupAvatar}>
                        <Ionicons name="leaf" size={14} color={Palette.green850} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {groupName}
                        </Text>
                        <Text style={styles.groupMeta}>
                          {products.length} produit{products.length > 1 ? 's' : ''}
                          {ownerData?.region ? ` · ${ownerData.region}` : ''}
                        </Text>
                      </View>
                    </View>
                    {products.map((p: any, idx: number) => {
                      const img = getProductImage(p);
                      return (
                        <Pressable
                          key={p.id || idx}
                          onPress={() =>
                            router.push({ pathname: '/product/[id]', params: { id: p.id } })
                          }>
                          <Card style={{ marginBottom: 8 }}>
                            <View style={styles.productRow}>
                              {img ? (
                                <Image
                                  source={{ uri: img }}
                                  style={styles.thumb}
                                  contentFit="cover"
                                />
                              ) : (
                                <View style={[styles.thumb, styles.thumbFallback]}>
                                  <Ionicons name="leaf" size={20} color={Palette.green700} />
                                </View>
                              )}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.orderTitle} numberOfLines={1}>
                                  {p.name || p.title || 'Produit'}
                                </Text>
                                <Text style={styles.orderMeta} numberOfLines={1}>
                                  {p.zone || p.region || p.category || 'FresCoop'} ·{' '}
                                  {p.unit || 'kg'}
                                </Text>
                              </View>
                              <Text style={styles.price}>{formatMoney(p.price || 0)}</Text>
                            </View>
                          </Card>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>
        ) : null}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
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

function QuickAction({
  icon,
  label,
  tint,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { opacity: 0.85 }]}>
      <View style={[styles.quickIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function formatMoney(value: number): string {
  if (!value && value !== 0) return '—';
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

function isClientHomeOrderVisible(order: any): boolean {
  const status = String(order?.status || '').toLowerCase();
  const payment = String(order?.paymentStatus || '').toLowerCase();
  return status.includes('paiement') || payment.includes('attente');
}

function formatRelative(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return new Date(ts).toLocaleDateString('fr-FR');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { paddingBottom: 40 },
  hero: {
    padding: 22,
    paddingTop: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 22,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: {
    color: Palette.gold600,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.4,
  },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  heroKpis: { flexDirection: 'row', gap: 10 },
  heroKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroKpiValue: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  heroKpiLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.coral100,
    margin: 20,
    marginBottom: 0,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.coral600,
  },
  warnText: { color: Palette.coral600, fontWeight: '700', fontSize: 12, flex: 1 },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.green100,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.green700,
  },
  syncText: { color: Palette.green850, fontSize: 11, fontWeight: '800' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.ink,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  quick: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
    minHeight: 92,
    justifyContent: 'center',
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  listWrap: { paddingHorizontal: 20 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTitle: { fontWeight: '800', fontSize: 14, color: Palette.ink, flex: 1, paddingRight: 8 },
  orderMeta: { color: Palette.muted, fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  emptyTitle: { fontWeight: '800', color: Palette.ink, fontSize: 14 },
  emptyText: { color: Palette.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  price: { fontWeight: '900', color: Palette.green850, fontSize: 14 },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  accordionText: { fontSize: 14, fontWeight: '900', color: Palette.ink, flex: 1 },
  accordionBadge: {
    backgroundColor: Palette.green100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 22,
    alignItems: 'center',
  },
  accordionBadgeText: { fontSize: 11, fontWeight: '900', color: Palette.green850 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  groupAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.green850,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  groupMeta: {
    fontSize: 11,
    color: Palette.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.wash,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green100,
  },
});
