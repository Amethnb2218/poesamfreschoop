import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { analyzePrice } from '@/lib/pricing';

const CATEGORIES = ['Maraîchage', 'Fruits', 'Céréales', 'Transformation', 'Élevage'];
const UNITS = ['kg', 'unité', 'panier', 'sac', 'litre'];

export default function NewProductScreen() {
  const { user, mutateStore, store } = useSession();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [zone, setZone] = useState(user?.region || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function addPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée');
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
    if (!user) return;
    if (!name.trim() || !price || !quantity) {
      Alert.alert('Champs requis', 'Nom, quantité et prix sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const id = `prd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      await mutateStore((store) => ({
        ...store,
        products: [
          {
            id,
            createdAt: now,
            updatedAt: now,
            ownerId: user.id,
            name: name.trim(),
            category,
            quantity: Number(quantity),
            unit,
            price: Number(price),
            zone: zone.trim(),
            description: description.trim(),
            status: 'Publie',
            images,
          },
          ...(store.products || []),
        ],
      }));
      Alert.alert('Produit publié', `"${name}" est désormais visible sur le marché.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de publier');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>CATALOGUE</Text>
          <Text style={styles.title}>Nouveau produit</Text>
          <Text style={styles.subtitle}>
            Publiez un lot sur le marché FresCoop. Les clients et acheteurs B2B le verront
            immédiatement.
          </Text>

          <Text style={styles.label}>Photos ({images.length}/5)</Text>
          <View style={styles.photosRow}>
            {images.map((uri, i) => (
              <View key={i} style={styles.photo}>
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

          <Input label="Nom du produit" placeholder="Tomates cerises" value={name} onChangeText={setName} />

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
                placeholder="100"
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
            placeholder="1200"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <PriceInsightCard
            insight={analyzePrice(
              (store.products || []).filter((p: any) => p.ownerId !== user?.id),
              category,
              name,
              unit,
              Number(price),
            )}
          />
          <Input
            label="Zone / région"
            placeholder="Niayes, Thiès…"
            value={zone}
            onChangeText={setZone}
          />
          <Input
            label="Description"
            placeholder="Variété, qualité, conditionnement…"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button
            label="Publier le produit"
            size="lg"
            loading={saving}
            onPress={submit}
            leading={<Ionicons name="checkmark" size={18} color="#ffffff" />}
          />
          <Button
            label="Annuler"
            variant="secondary"
            onPress={() => router.back()}
          />
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
    <View style={[insightCardStyles.wrap, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={18} color={config.fg} />
      <View style={{ flex: 1 }}>
        <Text style={[insightCardStyles.title, { color: config.fg }]}>💡 {insight.title}</Text>
        <Text style={insightCardStyles.body}>{insight.body}</Text>
      </View>
    </View>
  );
}

const insightCardStyles = StyleSheet.create({
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
