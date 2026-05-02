import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

type EntityType = 'dossier' | 'transaction' | 'proof' | 'hub';

const META: Record<
  EntityType,
  { title: string; storeKey: string; idPrefix: string; kicker: string; icon: any; description: string }
> = {
  dossier: {
    title: 'Nouveau dossier',
    storeKey: 'dossiers',
    idPrefix: 'dos',
    kicker: 'DOCUMENTATION',
    icon: 'folder-open',
    description: 'Créez un dossier administratif avec les pièces justificatives.',
  },
  transaction: {
    title: 'Nouvelle transaction',
    storeKey: 'transactions',
    idPrefix: 'trx',
    kicker: 'FINANCES',
    icon: 'cash-outline',
    description: 'Enregistrez une vente, un paiement ou un versement pour bâtir votre historique.',
  },
  proof: {
    title: 'Nouvelle preuve économique',
    storeKey: 'proofs',
    idPrefix: 'prf',
    kicker: 'PREUVES',
    icon: 'receipt',
    description:
      'Enregistrez une transaction avec justificatif (reçu, photo) pour construire votre preuve économique.',
  },
  hub: {
    title: 'Nouveau micro-hub',
    storeKey: 'hubs',
    idPrefix: 'hub',
    kicker: 'OPÉRATIONS',
    icon: 'flash',
    description: "Enregistrez un nouveau point de stockage solaire partagé.",
  },
};

const TRANSACTION_STATUSES = ['Paye', 'En attente', 'En retard'];
const DOSSIER_TYPES = ['Piece identite', 'Inscription cooperative', 'Demande attestation', 'Autre'];

export default function NewEntityScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const meta = META[type as EntityType];
  const { user, mutateStore } = useSession();
  const [saving, setSaving] = useState(false);

  // champs communs
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');

  // transaction/proof
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [status, setStatus] = useState('Paye');
  const [buyer, setBuyer] = useState('');

  // dossier
  const [dossierType, setDossierType] = useState(DOSSIER_TYPES[0]);
  const [personName, setPersonName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');

  // hub
  const [capacity, setCapacity] = useState('');
  const [region, setRegion] = useState(user?.region || '');
  const [manager, setManager] = useState(user?.name || '');

  if (!meta) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={36} color={Palette.coral600} />
          <Text style={styles.title}>Type inconnu</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  async function submit() {
    if (!user) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const id = `${meta.idPrefix}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const base: any = {
        id,
        createdAt: now,
        userId: user.id,
        ownerId: user.id,
      };

      let record: any;
      if (type === 'dossier') {
        if (!personName.trim()) {
          setSaving(false);
          return Alert.alert('Champ requis', 'Nom du bénéficiaire requis');
        }
        record = {
          ...base,
          title: label.trim() || `${dossierType} · ${personName}`,
          type: dossierType,
          personName: personName.trim(),
          organization: organization.trim(),
          status: 'En cours',
          notes: notes.trim(),
        };
      } else if (type === 'transaction' || type === 'proof') {
        if (!amount) {
          setSaving(false);
          return Alert.alert('Champ requis', 'Montant obligatoire');
        }
        record = {
          ...base,
          label: label.trim() || `Vente ${new Date().toLocaleDateString('fr-FR')}`,
          amount: Number(amount),
          paymentMethod,
          status,
          buyer: buyer.trim(),
          date: now,
          notes: notes.trim(),
        };
      } else if (type === 'hub') {
        if (!label.trim() || !capacity) {
          setSaving(false);
          return Alert.alert('Champs requis', 'Nom et capacité obligatoires');
        }
        record = {
          ...base,
          name: label.trim(),
          region: region.trim(),
          manager: manager.trim(),
          capacityKg: Number(capacity),
          currentStockKg: 0,
          temperature: 6,
          batteryPercent: 90,
        };
      }

      await mutateStore((store) => ({
        ...store,
        [meta.storeKey]: [record, ...((store as any)[meta.storeKey] || [])],
      }));
      Alert.alert('Enregistré', `"${meta.title}" créé.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible');
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
          <View style={styles.heroIcon}>
            <Ionicons name={meta.icon} size={24} color="#ffffff" />
          </View>
          <Text style={styles.kicker}>{meta.kicker}</Text>
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.subtitle}>{meta.description}</Text>

          <Input
            label={type === 'hub' ? 'Nom du hub' : 'Intitulé'}
            value={label}
            onChangeText={setLabel}
            placeholder={type === 'hub' ? 'Hub Thiaroye' : ''}
          />

          {type === 'dossier' ? (
            <>
              <Text style={styles.label}>Type de dossier</Text>
              <View style={styles.chips}>
                {DOSSIER_TYPES.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDossierType(d)}
                    style={[styles.chip, dossierType === d && styles.chipActive]}>
                    <Text
                      style={[styles.chipText, dossierType === d && { color: '#ffffff' }]}>
                      {d}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Input label="Bénéficiaire" value={personName} onChangeText={setPersonName} />
              <Input
                label="Organisation"
                value={organization}
                onChangeText={setOrganization}
              />
            </>
          ) : null}

          {type === 'transaction' || type === 'proof' ? (
            <>
              <Input
                label="Montant (FCFA)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Input
                label="Acheteur / contrepartie"
                value={buyer}
                onChangeText={setBuyer}
                placeholder="Nom du client, de la coopérative…"
              />
              <Input
                label="Méthode de paiement"
                value={paymentMethod}
                onChangeText={setPaymentMethod}
                placeholder="Espèces, Wave, Orange Money…"
              />
              <Text style={styles.label}>Statut</Text>
              <View style={styles.chips}>
                {TRANSACTION_STATUSES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[styles.chip, status === s && styles.chipActive]}>
                    <Text style={[styles.chipText, status === s && { color: '#ffffff' }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {type === 'hub' ? (
            <>
              <Input
                label="Capacité (kg)"
                keyboardType="numeric"
                value={capacity}
                onChangeText={setCapacity}
              />
              <Input label="Région" value={region} onChangeText={setRegion} />
              <Input label="Responsable" value={manager} onChangeText={setManager} />
            </>
          ) : null}

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button
            label="Enregistrer"
            size="lg"
            loading={saving}
            onPress={submit}
            leading={<Ionicons name="checkmark" size={18} color="#ffffff" />}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kicker: {
    color: Palette.green850,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: { fontSize: 22, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { color: Palette.muted, fontSize: 13, lineHeight: 19 },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.ink2,
    marginTop: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
});
