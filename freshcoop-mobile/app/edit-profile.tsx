import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function EditProfileScreen() {
  const { user, updateUser } = useSession();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [region, setRegion] = useState(user?.region || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function submit() {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Le nom est obligatoire');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        region: region.trim(),
        bio: bio.trim(),
      });
      Alert.alert('Profil mis à jour');
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Modifier mon profil</Text>
          <Text style={styles.subtitle}>Ces informations sont synchronisées avec le site.</Text>

          <Input label="Nom complet" value={name} onChangeText={setName} />
          <Input
            label="E-mail"
            value={user.email}
            editable={false}
            hint="Pour changer votre e-mail, contactez un admin."
          />
          <Input
            label="Téléphone"
            placeholder="+221 77 000 00 00"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input label="Organisation" value={organization} onChangeText={setOrganization} />
          <Input label="Région" value={region} onChangeText={setRegion} />
          <Input
            label="Bio"
            placeholder="Quelques mots sur votre activité…"
            multiline
            numberOfLines={3}
            value={bio}
            onChangeText={setBio}
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
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { color: Palette.muted, fontSize: 13 },
});
