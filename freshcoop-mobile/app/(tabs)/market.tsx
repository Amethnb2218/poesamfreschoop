import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Shadows } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { getProductImage } from '@/lib/images';

const CATEGORIES = ['Tout', 'Maraîchage', 'Céréales', 'Fruits', 'Transformation'];

export default function MarketScreen() {
  const { store, refresh, loading, online } = useSession();
  const { add, count } = useCart();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tout');

  const products = useMemo(() => {
    const items = store.products || [];
    const q = query.trim().toLowerCase();
    return items.filter((p: any) => {
      const cat = p.category || p.sector || '';
      if (filter !== 'Tout' && !String(cat).toLowerCase().includes(filter.toLowerCase()))
        return false;
      if (!q) return true;
      const text = `${p.name || ''} ${p.region || ''} ${p.zone || ''} ${p.seller || ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [store.products, query, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Marché</Text>
          <Text style={styles.subtitle}>
            {products.length} offre{products.length > 1 ? 's' : ''}
            {online ? '' : ' · hors-ligne'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartBtn}
          hitSlop={10}>
          <Ionicons name="cart-outline" size={22} color={Palette.ink} />
          {count > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{count}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {!online ? (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={Palette.coral600} />
          <Text style={styles.offlineText}>
            Hors-ligne · les données affichées sont celles du dernier chargement
          </Text>
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Palette.muted} />
        <TextInput
          placeholder="Rechercher un produit, région, vendeur"
          placeholderTextColor={Palette.muted}
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Palette.muted} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => {
          const active = filter === item;
          return (
            <Pressable
              onPress={() => setFilter(item)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipLabel, active && { color: '#ffffff' }]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={products}
        keyExtractor={(item: any, idx) => String(item.id || idx)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={36} color={Palette.green700} />
            <Text style={styles.emptyTitle}>Aucun produit</Text>
            <Text style={styles.emptyText}>
              Aucun produit ne correspond à votre recherche. Essayez un autre
              mot-clé ou changez de catégorie.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ProductCard product={item} onAdd={() => add(item, 1)} />
        )}
      />
    </SafeAreaView>
  );
}

function ProductCard({ product, onAdd }: { product: any; onAdd: () => void }) {
  const image = getProductImage(product);
  const availableQty = Math.max(0, Number(product.quantity || product.stock || 0));
  const outOfStock = availableQty <= 0;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        style={({ pressed }) => pressed && { opacity: 0.92 }}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Ionicons name="leaf" size={32} color={Palette.green700} />
            </View>
          )}
          {outOfStock ? (
            <View style={[styles.overlay, { backgroundColor: Palette.coral600 }]}>
              <Text style={styles.overlayText}>Rupture</Text>
            </View>
          ) : availableQty < 10 ? (
            <View style={[styles.overlay, { backgroundColor: Palette.gold600 }]}>
              <Text style={styles.overlayText}>Stock limité</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name || 'Produit'}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {product.zone || product.region || 'Sénégal'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatMoney(product.price || 0)}</Text>
            <Text style={styles.unit}>/ {product.unit || 'kg'}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onAdd}
        disabled={outOfStock}
        style={({ pressed }) => [
          styles.addBtn,
          outOfStock && styles.addBtnDisabled,
          pressed && !outOfStock && { opacity: 0.85 },
        ]}>
        <Ionicons
          name={outOfStock ? 'close-circle-outline' : 'cart-outline'}
          size={16}
          color={outOfStock ? Palette.muted : '#ffffff'}
        />
        <Text style={[styles.addBtnText, outOfStock && { color: Palette.muted }]}>
          {outOfStock ? 'Indisponible' : 'Ajouter'}
        </Text>
      </Pressable>
    </View>
  );
}

function formatMoney(value: number): string {
  return `${Number(value).toLocaleString('fr-FR')} F`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, marginTop: 2, fontSize: 13 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: Palette.coral600,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.paper,
  },
  cartBadgeText: { color: '#ffffff', fontWeight: '900', fontSize: 10 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.coral100,
    borderColor: Palette.coral600,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  offlineText: { color: Palette.coral600, fontWeight: '700', fontSize: 11, flex: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 14,
    height: 46,
  },
  search: { flex: 1, fontSize: 14, color: Palette.ink },
  chipsRow: { paddingHorizontal: 20, gap: 8, marginTop: 14, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Palette.green700, borderColor: Palette.green700 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: Palette.ink },
  list: { paddingHorizontal: 14, paddingBottom: 40 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    maxWidth: '50%',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: Palette.wash,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green100,
  },
  overlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  body: { padding: 12, gap: 2 },
  name: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  meta: { fontSize: 11, color: Palette.muted, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 4,
  },
  price: { fontSize: 15, fontWeight: '900', color: Palette.green850 },
  unit: { fontSize: 11, fontWeight: '700', color: Palette.muted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.green700,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: Radius.pill,
  },
  addBtnDisabled: {
    backgroundColor: Palette.wash,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  addBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 12, letterSpacing: 0.3 },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: {
    color: Palette.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
