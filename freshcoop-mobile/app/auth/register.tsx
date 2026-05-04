import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
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

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

const ROLES: { id: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'agriculteur', label: 'Agriculteur', icon: 'leaf-outline' },
  { id: 'agentTerrain', label: 'Agent terrain', icon: 'walk-outline' },
  { id: 'transporteur', label: 'Transporteur', icon: 'car-outline' },
  { id: 'client', label: 'Client', icon: 'cart-outline' },
  { id: 'acheteurB2B', label: 'Acheteur B2B', icon: 'business-outline' },
  { id: 'partenaire', label: 'Partenaire finance', icon: 'wallet-outline' },
];

export default function RegisterScreen() {
  const { register } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Nom, e-mail et mot de passe requis');
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe trop court (min 6 caractères)');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({ name, email, password, role, phone, organization, region });
      if (user.status === 'En attente') {
        router.replace('/pending');
      } else {
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setError(err?.message || 'Création impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={Palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Créer un compte</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Quel est votre rôle ?</Text>
          <View style={styles.roles}>
            {ROLES.map((r) => {
              const active = r.id === role;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRole(r.id)}
                  style={[styles.role, active && styles.roleActive]}>
                  <Ionicons
                    name={r.icon}
                    size={22}
                    color={active ? '#ffffff' : Palette.green700}
                  />
                  <Text style={[styles.roleLabel, active && { color: '#ffffff' }]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.form}>
            <Input label="Nom complet" placeholder="Fatou Ndiaye" value={name} onChangeText={setName} />
            <Input
              label="E-mail"
              placeholder="vous@frescoop.sn"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Mot de passe"
              placeholder="6 caractères minimum"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              label="Téléphone"
              placeholder="+221 77 000 00 00"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Organisation (facultatif)"
              placeholder="Coopérative, entreprise…"
              value={organization}
              onChangeText={setOrganization}
            />
            <Input
              label="Région (facultatif)"
              placeholder="Thiès, Dakar, Kaolack…"
              value={region}
              onChangeText={setRegion}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Palette.coral600} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Créer mon compte"
              size="lg"
              loading={submitting}
              onPress={onSubmit}
              trailing={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.wash,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  scroll: { padding: 20, gap: 18, paddingBottom: 60 },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    color: Palette.green850,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  role: {
    flexBasis: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Palette.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  roleActive: {
    backgroundColor: Palette.green700,
    borderColor: Palette.green700,
  },
  roleLabel: { fontWeight: '800', color: Palette.ink, fontSize: 13 },
  form: { gap: 14, marginTop: 10 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.coral100,
    borderColor: Palette.coral600,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
  },
  errorText: { color: Palette.coral600, fontWeight: '700', flex: 1, fontSize: 13 },
});
