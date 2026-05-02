import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { scopeProducts } from '@/lib/roles';

export default function NewLotScreen() {
  const { user, store, mutateStore } = useSession();
  const myProducts = useMemo(
    () => scopeProducts(store.products || [], user?.role, user?.id || ''),
    [store.products, user],
  );

  const [productId, setProductId] = useState<string>(myProducts[0]?.id || '');
  const [weight, setWeight] = useState('');
  const [origin, setOrigin] = useState(user?.region || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [hubId, setHubId] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function addPhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Autorisez la caméra pour photographier le lot');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    setPhotos((prev) => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
  }

  async function submit() {
    if (!user || !productId || !weight) {
      Alert.alert('Champs requis', 'Produit et poids obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const id = `lot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const product = myProducts.find((p: any) => p.id === productId);
      const reference = `LOT-${Date.now().toString().slice(-6)}`;
      await mutateStore((store) => ({
        ...store,
        lots: [
          {
            id,
            reference,
            createdAt: now,
            ownerId: user.id,
            sellerId: user.id,
            productId,
            productName: product?.name || 'Produit',
            weight: Number(weight),
            origin: origin.trim(),
            harvestDate,
            hubId: hubId.trim(),
            notes: notes.trim(),
            status: 'Récolté',
            photos,
          },
          ...(store.lots || []),
        ],
      }));
      Alert.alert('Lot créé', `${reference} est enregistré dans votre traçabilité.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible');
    } finally {
      setSaving(false);
    }
  }

  if (myProducts.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={48} color={Palette.green700} />
          <Text style={styles.emptyTitle}>Créez d'abord un produit</Text>
          <Text style={styles.emptyText}>
            Un lot est toujours rattaché à un produit de votre catalogue.
          </Text>
          <Button
            label="Créer un produit"
            onPress={() => router.replace('/new-product')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>TRAÇABILITÉ</Text>
          <Text style={styles.title}>Nouveau lot</Text>
          <Text style={styles.subtitle}>
            Enregistrez un lot avec poids, origine et photos pour sa traçabilité du champ au paiement.
          </Text>

          <Text style={styles.label}>Produit</Text>
          <View style={styles.chipsRow}>
            {myProducts.map((p: any) => (
              <Pressable
                key={p.id}
                onPress={() => setProductId(p.id)}
                style={[styles.chip, productId === p.id && styles.chipActive]}>
                <Text style={[styles.chipText, productId === p.id && { color: '#ffffff' }]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Poids (kg)"
            placeholder="150"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <Input label="Origine" placeholder="Parcelle, village…" value={origin} onChangeText={setOrigin} />
          <Input label="Date de récolte (YYYY-MM-DD)" value={harvestDate} onChangeText={setHarvestDate} />
          <Input label="Hub de stockage (optionnel)" value={hubId} onChangeText={setHubId} />
          <Input
            label="Notes qualité"
            placeholder="Observations, calibrage…"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Photos ({photos.length})</Text>
          <View style={styles.photosRow}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} contentFit="cover" />
            ))}
            <Pressable onPress={addPhoto} style={styles.photoAdd}>
              <Ionicons name="camera" size={24} color={Palette.green700} />
              <Text style={styles.photoAddText}>Photo</Text>
            </Pressable>
          </View>

          <Button
            label="Enregistrer le lot"
            size="lg"
            loading={saving}
            onPress={submit}
            leading={<Ionicons name="save-outline" size={18} color="#ffffff" />}
          />
          <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
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
    marginTop: 4,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 72, height: 72, borderRadius: Radius.md },
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
  emptyText: { color: Palette.muted, textAlign: 'center' },
});
