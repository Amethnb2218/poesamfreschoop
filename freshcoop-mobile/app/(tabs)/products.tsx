import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getProductImage } from '@/lib/images';
import { isAdminRole, isFieldAgentRole, isSellerRole, scopeProducts } from '@/lib/roles';

export default function ProductsScreen() {
  const { user, store, refresh, loading, mutateStore } = useSession();
  if (!user) return null;

  const products = useMemo(
    () => scopeProducts(store.products || [], user.role, user.id),
    [store.products, user.role, user.id],
  );

  async function verifyProduct(productId: string, outcome: 'Fiable' | 'A revoir') {
    await mutateStore((store) => ({
      ...store,
      products: (store.products || []).map((p: any) =>
        p.id === productId
          ? {
              ...p,
              verification: outcome,
              verifiedBy: user?.id,
              verifiedAt: new Date().toISOString(),
            }
          : p,
      ),
    }));
    Alert.alert('Vérification enregistrée', `Produit marqué "${outcome}".`);
  }

  async function deleteProduct(productId: string) {
    Alert.alert('Supprimer ce produit ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await mutateStore((store) => ({
            ...store,
            products: (store.products || []).filter((p: any) => p.id !== productId),
          }));
        },
      },
    ]);
  }

  const role = user.role;
  const title = isAdminRole(role) || isFieldAgentRole(role) ? 'Tous les produits' : 'Mes produits';
  const subtitle = isSellerRole(role)
    ? 'Catalogue et articles publiés'
    : isFieldAgentRole(role)
    ? 'Vérification qualité et conformité'
    : 'Catalogue plateforme';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {products.length} produit{products.length > 1 ? 's' : ''} · {subtitle}
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p: any, i) => String(p.id || i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={36} color={Palette.green700} />
              <Text style={styles.emptyTitle}>Aucun produit</Text>
              <Text style={styles.emptyText}>
                {isSellerRole(role)
                  ? 'Ajoutez vos produits depuis le site web pour les gérer ici.'
                  : 'Aucun produit publié pour le moment.'}
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }: { item: any }) => {
          const img = getProductImage(item);
          const qty = Number(item.quantity || 0);
          const out = qty <= 0;
          const mine = item.ownerId === user.id;
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              style={styles.row}>
              {img ? (
                <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Ionicons name="leaf" size={22} color={Palette.green700} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.rowHead}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  {item.verification ? (
                    <Ionicons
                      name={item.verification === 'Fiable' ? 'shield-checkmark' : 'warning'}
                      size={14}
                      color={item.verification === 'Fiable' ? Palette.green700 : Palette.coral600}
                    />
                  ) : null}
                </View>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.zone || item.region || 'Sénégal'} · {item.category || 'Maraîchage'}
                </Text>
                <View style={styles.metaRow}>
                  <View style={[styles.pill, out ? styles.pillOut : styles.pillOk]}>
                    <Text style={[styles.pillText, { color: out ? Palette.coral600 : Palette.green850 }]}>
                      {out ? 'Rupture' : `${qty} ${item.unit || 'kg'}`}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    {Number(item.price || 0).toLocaleString('fr-FR')} F/{item.unit || 'kg'}
                  </Text>
                </View>

                {isFieldAgentRole(user.role) ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => verifyProduct(item.id, 'Fiable')}
                      style={[styles.action, { backgroundColor: Palette.green100 }]}>
                      <Ionicons name="shield-checkmark" size={14} color={Palette.green850} />
                      <Text style={[styles.actionText, { color: Palette.green850 }]}>Fiable</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => verifyProduct(item.id, 'A revoir')}
                      style={[styles.action, { backgroundColor: Palette.coral100 }]}>
                      <Ionicons name="warning" size={14} color={Palette.coral600} />
                      <Text style={[styles.actionText, { color: Palette.coral600 }]}>À revoir</Text>
                    </Pressable>
                  </View>
                ) : mine || isAdminRole(user.role) ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({ pathname: '/edit-product/[id]', params: { id: item.id } });
                      }}
                      style={[styles.action, { backgroundColor: Palette.green100 }]}>
                      <Ionicons name="create-outline" size={14} color={Palette.green850} />
                      <Text style={[styles.actionText, { color: Palette.green850 }]}>Modifier</Text>
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteProduct(item.id);
                      }}
                      style={[styles.action, { backgroundColor: Palette.coral100 }]}>
                      <Ionicons name="trash-outline" size={14} color={Palette.coral600} />
                      <Text style={[styles.actionText, { color: Palette.coral600 }]}>Supprimer</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />

      {(isSellerRole(user.role) || isAdminRole(user.role)) ? (
        <Pressable
          onPress={() => router.push('/new-product')}
          style={styles.fab}
          hitSlop={8}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, marginTop: 2, fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: Palette.wash,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green100,
  },
  name: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  meta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillOk: { backgroundColor: Palette.green100 },
  pillOut: { backgroundColor: Palette.coral100 },
  pillText: { fontSize: 11, fontWeight: '900' },
  price: { fontSize: 13, fontWeight: '900', color: Palette.green850 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  actionText: { fontSize: 11, fontWeight: '900' },
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
