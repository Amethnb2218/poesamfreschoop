import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Palette, Radius } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { getImageSource, resolveUrl } from '@/lib/images';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store } = useSession();
  const { add, items } = useCart();
  const { width } = useWindowDimensions();

  const product = useMemo(
    () => (store.products || []).find((p: any) => p.id === id),
    [store.products, id],
  );

  const seller = useMemo(
    () => (store.users || []).find((u: any) => u.id === product?.ownerId),
    [store.users, product],
  );

  const images = useMemo(() => {
    if (!product) return [] as string[];
    const list = Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image
      ? [product.image]
      : [];
    return list.map((img: any) => resolveUrl(getImageSource(img))).filter(Boolean) as string[];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [qtyText, setQtyText] = useState('1');

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Ionicons name="sad-outline" size={48} color={Palette.muted} />
          <Text style={styles.notFoundTitle}>Produit introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const stock = Math.max(0, Number(product.quantity || product.stock || 0));
  const unit = product.unit || 'kg';
  const price = Number(product.price) || 0;
  const outOfStock = stock <= 0;
  const total = quantity * price;
  const existing = items.find((i) => i.productId === product.id);

  function changeQty(next: number) {
    const max = stock || 9999;
    const value = Math.max(1, Math.min(max, Math.round(next)));
    setQuantity(value);
    setQtyText(String(value));
  }

  function onQtyTextChange(text: string) {
    // Autorise l'édition libre, on valide au blur / commit
    const cleaned = text.replace(/[^\d]/g, '');
    setQtyText(cleaned);
  }

  function commitQtyText() {
    const parsed = Number(qtyText);
    if (!Number.isFinite(parsed) || parsed < 1) {
      changeQty(1);
    } else {
      changeQty(parsed);
    }
  }

  async function onAdd() {
    await add(product, quantity);
    Alert.alert('Ajouté au panier', `${quantity} ${unit} · ${product.name}`, [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Voir le panier', onPress: () => router.push('/(tabs)/cart') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={Palette.ink} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => {
                Share.share({
                  message: `🌱 ${product.name} sur FresCoop\n${
                    Number(product.price).toLocaleString('fr-FR')
                  } F/${product.unit || 'kg'}\n${product.zone || 'Sénégal'}\n\nDécouvrez FresCoop, la plateforme des productrices sénégalaises.`,
                }).catch(() => {});
              }}
              style={styles.iconBtn}
              hitSlop={12}>
              <Ionicons name="share-outline" size={22} color={Palette.ink} />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/cart')} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name="cart-outline" size={22} color={Palette.ink} />
              {items.length > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{items.length}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <View style={[styles.gallery, { height: width }]}>
          {images.length > 0 ? (
            <>
              <FlatList
                data={images}
                keyExtractor={(uri, i) => `${uri}-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImage(index);
                }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={{ width, height: width }} contentFit="cover" />
                )}
              />
              {images.length > 1 ? (
                <View style={styles.dots}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === activeImage && styles.dotActive]}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View style={[styles.fallback, { width, height: width }]}>
              <Ionicons name="leaf" size={64} color={Palette.green700} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.meta}>
                {product.zone || product.region || 'Sénégal'} ·{' '}
                {product.category || 'Maraîchage'}
              </Text>
            </View>
            <View style={outOfStock ? styles.pillOut : styles.pillOk}>
              <Text style={outOfStock ? styles.pillOutText : styles.pillOkText}>
                {outOfStock ? 'Épuisé' : `${stock} ${unit}`}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatMoney(price)}</Text>
            <Text style={styles.priceUnit}>/ {unit}</Text>
          </View>

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          <View style={styles.sellerCard}>
            <View style={styles.sellerHead}>
              <View style={styles.sellerIcon}>
                <Ionicons name="person" size={18} color={Palette.green850} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{seller?.name || 'Vendeur FresCoop'}</Text>
                <Text style={styles.sellerMeta}>
                  {seller?.organization || 'Coopérative'} ·{' '}
                  {seller?.region || product.zone || 'Sénégal'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() =>
                seller?.id
                  ? router.push({ pathname: '/messages/[id]', params: { id: seller.id } })
                  : Alert.alert('Contact', seller?.phone || seller?.email || '—')
              }
              style={styles.contactBtn}>
              <Ionicons name="chatbubbles-outline" size={18} color="#ffffff" />
              <Text style={styles.contactText}>Contacter le vendeur</Text>
            </Pressable>
          </View>

          {!outOfStock ? (
            <View style={styles.qtyCard}>
              <View style={styles.qtyHeader}>
                <Text style={styles.qtyLabel}>Quantité</Text>
                <Text style={styles.qtyStockHint}>Stock : {stock} {unit}</Text>
              </View>

              <View style={styles.stepper}>
                <Pressable
                  onPress={() => changeQty(quantity - 1)}
                  disabled={quantity <= 1}
                  style={[styles.stepBtn, quantity <= 1 && { opacity: 0.4 }]}
                  hitSlop={6}>
                  <Ionicons name="remove" size={20} color={Palette.ink} />
                </Pressable>
                <View style={styles.qtyInputWrap}>
                  <TextInput
                    value={qtyText}
                    onChangeText={onQtyTextChange}
                    onBlur={commitQtyText}
                    onSubmitEditing={commitQtyText}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={6}
                    selectTextOnFocus
                    style={styles.qtyInput}
                  />
                  <Text style={styles.qtyUnit}>{unit}</Text>
                </View>
                <Pressable
                  onPress={() => changeQty(quantity + 1)}
                  disabled={quantity >= stock}
                  style={[styles.stepBtn, quantity >= stock && { opacity: 0.4 }]}
                  hitSlop={6}>
                  <Ionicons name="add" size={20} color={Palette.ink} />
                </Pressable>
              </View>

              <View style={styles.presets}>
                {[5, 10, 25, 50].map((preset) =>
                  preset <= stock ? (
                    <Pressable
                      key={preset}
                      onPress={() => changeQty(preset)}
                      style={[styles.preset, quantity === preset && styles.presetActive]}>
                      <Text
                        style={[
                          styles.presetText,
                          quantity === preset && { color: '#ffffff' },
                        ]}>
                        {preset} {unit}
                      </Text>
                    </Pressable>
                  ) : null,
                )}
                <Pressable
                  onPress={() => changeQty(stock)}
                  style={[styles.preset, quantity === stock && styles.presetActive]}>
                  <Text
                    style={[
                      styles.presetText,
                      quantity === stock && { color: '#ffffff' },
                    ]}>
                    Max
                  </Text>
                </Pressable>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total estimé</Text>
                <Text style={styles.totalValue}>{formatMoney(total)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.outOfStockBox}>
              <Ionicons name="alert-circle" size={20} color={Palette.coral600} />
              <Text style={styles.outOfStockText}>
                Ce produit est actuellement indisponible. Contactez le vendeur pour être notifié.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {existing ? (
          <Text style={styles.footerHint}>
            Déjà {existing.quantity} {unit} dans le panier
          </Text>
        ) : null}
        <Button
          label={outOfStock ? 'Contacter le vendeur' : `Ajouter · ${formatMoney(total)}`}
          size="lg"
          onPress={onAdd}
          disabled={outOfStock}
          leading={
            <Ionicons name={outOfStock ? 'chatbubbles-outline' : 'cart'} size={18} color="#ffffff" />
          }
        />
      </View>
    </SafeAreaView>
  );
}

function formatMoney(value: number): string {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  topBar: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071b14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    backgroundColor: Palette.coral600,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontWeight: '900', fontSize: 10 },
  gallery: { backgroundColor: Palette.wash },
  fallback: {
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: { backgroundColor: '#ffffff', width: 20 },
  body: {
    padding: 20,
    gap: 16,
    marginTop: -20,
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { fontSize: 24, fontWeight: '900', color: Palette.ink, letterSpacing: -0.4 },
  meta: { color: Palette.muted, fontSize: 13, marginTop: 4 },
  pillOk: {
    backgroundColor: Palette.green100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillOkText: { color: Palette.green850, fontWeight: '900', fontSize: 11 },
  pillOut: {
    backgroundColor: Palette.coral100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillOutText: { color: Palette.coral600, fontWeight: '900', fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 28, fontWeight: '900', color: Palette.green850, letterSpacing: -0.5 },
  priceUnit: { fontSize: 14, fontWeight: '700', color: Palette.muted },
  description: {
    color: Palette.ink2,
    fontSize: 14,
    lineHeight: 21,
  },
  sellerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 12,
  },
  sellerHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  sellerMeta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.green700,
    borderRadius: 999,
    paddingVertical: 12,
  },
  contactText: { color: '#ffffff', fontWeight: '900', fontSize: 13, letterSpacing: 0.3 },
  qtyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
  },
  qtyLabel: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  qtyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyStockHint: { color: Palette.muted, fontSize: 12, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.wash,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.line,
  },
  qtyInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.wash,
    borderWidth: 1.5,
    borderColor: Palette.line,
    borderRadius: Radius.md,
    paddingVertical: 6,
  },
  qtyInput: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.ink,
    textAlign: 'center',
    minWidth: 60,
    padding: 0,
  },
  qtyUnit: { fontSize: 13, color: Palette.muted, fontWeight: '800' },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Palette.wash,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  presetActive: {
    backgroundColor: Palette.green700,
    borderColor: Palette.green700,
  },
  presetText: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  totalLabel: { color: Palette.muted, fontSize: 13, fontWeight: '700' },
  totalValue: { color: Palette.green850, fontSize: 18, fontWeight: '900' },
  outOfStockBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: Palette.coral100,
    borderWidth: 1,
    borderColor: Palette.coral600,
    borderRadius: Radius.md,
    padding: 14,
  },
  outOfStockText: { color: Palette.coral600, fontWeight: '700', flex: 1, fontSize: 13 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 8,
  },
  footerHint: {
    color: Palette.green850,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 40,
  },
  notFoundTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
});
