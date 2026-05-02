import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDialog } from '@/components/AppDialog';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getImageSource } from '@/lib/images';
import { analyzePrice } from '@/lib/pricing';

const CATEGORIES = ['Maraîchage', 'Fruits', 'Céréales', 'Transformation', 'Élevage'];
const UNITS = ['kg', 'unité', 'panier', 'sac', 'litre'];
const STATUSES = ['Publie', 'Brouillon', 'Retire'];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, store, mutateStore } = useSession();
  const dialog = useDialog();

  const product = useMemo(
    () => (store.products || []).find((p: any) => p.id === id),
    [store.products, id],
  );

  const initialImages = useMemo(() => {
    if (!product) return [] as string[];
    const list = Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image
      ? [product.image]
      : [];
    return list.map((img: any) => getImageSource(img)).filter(Boolean) as string[];
  }, [product]);

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || CATEGORIES[0]);
  const [quantity, setQuantity] = useState(String(product?.quantity ?? ''));
  const [unit, setUnit] = useState(product?.unit || 'kg');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [zone, setZone] = useState(product?.zone || user?.region || '');
  const [description, setDescription] = useState(product?.description || '');
  const [status, setStatus] = useState(product?.status || 'Publie');
  const [images, setImages] = useState<string[]>(initialImages);
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="sad-outline" size={48} color={Palette.muted} />
          <Text style={styles.title}>Produit introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const canEdit = user && (user.role === 'admin' || product.ownerId === user.id);
  if (!canEdit) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Palette.muted} />
          <Text style={styles.title}>Modification réservée au propriétaire</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  async function addPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      dialog.toast('Permission galerie refusée', 'warning');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      base64: true,
    });
    if (result.canceled) return;
    const next = result.assets
      .map((a) => (a.base64 ? `data:image/jpeg;base64,${a.base64}` : ''))
      .filter(Boolean);
    setImages((prev) => [...prev, ...next].slice(0, 5));
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (!user || !product) return;
    if (!name.trim() || !price || !quantity) {
      dialog.show({
        title: 'Champs requis',
        body: 'Nom, quantité et prix sont obligatoires.',
        tone: 'warning',
      });
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await mutateStore((s) => ({
        ...s,
        products: (s.products || []).map((p: any) =>
          p.id === product.id
            ? {
                ...p,
                name: name.trim(),
                category,
                quantity: Number(quantity),
                unit,
                price: Number(price),
                zone: zone.trim(),
                description: description.trim(),
                status,
                images,
                updatedAt: now,
              }
            : p,
        ),
      }));
      dialog.toast(`"${name}" mis à jour.`, 'success');
      router.back();
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible de sauvegarder', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    const ok = await dialog.confirm({
      title: 'Supprimer ce produit ?',
      body: 'Le produit sera retiré du marché. Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
      destructive: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await mutateStore((s) => ({
        ...s,
        products: (s.products || []).filter((p: any) => p.id !== product.id),
      }));
      dialog.toast('Produit supprimé.', 'success');
      router.back();
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>MODIFIER</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.subtitle}>
            Ajustez les informations du produit. Les modifications sont synchronisées
            instantanément pour les acheteurs.
          </Text>

          <Text style={styles.label}>Photos ({images.length}/5)</Text>
          <View style={styles.photosRow}>
            {images.map((uri, i) => (
              <View key={`${uri}-${i}`} style={styles.photo}>
                <Image source={{ uri }} style={styles.photoImg} contentFit="cover" />
                <Pressable onPress={() => removeImage(i)} style={styles.photoRemove} hitSlop={6}>
                  <Ionicons name="close" size={14} color="#ffffff" />
                </Pressable>
              </View>
            ))}
            {images.length < 5 ? (
              <Pressable onPress={addPhoto} style={styles.photoAdd}>
                <Ionicons name="add" size={28} color={Palette.green700} />
                <Text style={styles.photoAddText}>Ajouter</Text>
              </Pressable>
            ) : null}
          </View>

          <Input label="Nom du produit" value={name} onChangeText={setName} />

          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, category === c && styles.chipActive]}>
                <Text style={[styles.chipText, category === c && { color: '#ffffff' }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Input
                label="Quantité"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unité</Text>
              <View style={styles.chipsRow}>
                {UNITS.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[styles.chip, unit === u && styles.chipActive]}>
                    <Text style={[styles.chipText, unit === u && { color: '#ffffff' }]}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Input
            label={`Prix par ${unit} (FCFA)`}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <PriceInsightCard
            insight={analyzePrice(
              (store.products || []).filter((p: any) => p.id !== product.id && p.ownerId !== user?.id),
              category,
              name,
              unit,
              Number(price),
            )}
          />

          <Input label="Zone / région" value={zone} onChangeText={setZone} />
          <Input
            label="Description"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Statut de publication</Text>
          <View style={styles.chipsRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.chip, status === s && styles.chipActive]}>
                <Text style={[styles.chipText, status === s && { color: '#ffffff' }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Button
            label="Enregistrer les modifications"
            size="lg"
            loading={saving}
            onPress={submit}
            leading={<Ionicons name="checkmark" size={18} color="#ffffff" />}
          />
          <Button
            label="Supprimer ce produit"
            variant="secondary"
            onPress={deleteProduct}
            leading={<Ionicons name="trash-outline" size={18} color={Palette.coral600} />}
          />
          <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PriceInsightCard({ insight }: { insight: ReturnType<typeof analyzePrice> }) {
  if (!insight) return null;
  const config = {
    ok: { bg: Palette.green100, fg: Palette.green850, icon: 'checkmark-circle' as const },
    warn: { bg: Palette.gold100, fg: Palette.gold600, icon: 'warning' as const },
    danger: { bg: Palette.coral100, fg: Palette.coral600, icon: 'alert-circle' as const },
    info: { bg: Palette.blue100, fg: Palette.blue700, icon: 'information-circle' as const },
  }[insight.tone];
  return (
    <View style={[priceStyles.wrap, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={18} color={config.fg} />
      <View style={{ flex: 1 }}>
        <Text style={[priceStyles.title, { color: config.fg }]}>💡 {insight.title}</Text>
        <Text style={priceStyles.body}>{insight.body}</Text>
      </View>
    </View>
  );
}

const priceStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  title: { fontWeight: '900', fontSize: 13 },
  body: { color: Palette.ink2, fontSize: 12, lineHeight: 17, marginTop: 4 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  kicker: {
    color: Palette.green850,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: { fontSize: 22, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { color: Palette.muted, fontSize: 13, lineHeight: 19 },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.ink2,
    letterSpacing: 0.1,
    marginTop: 4,
  },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.green700,
  },
  photoAddText: { fontSize: 10, fontWeight: '800', color: Palette.green700, marginTop: 2 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Palette.green700, borderColor: Palette.green700 },
  chipText: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  row2: { flexDirection: 'row', gap: 10 },
});
