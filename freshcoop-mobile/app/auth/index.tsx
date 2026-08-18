import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Redirect, router } from 'expo-router';
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

export default function LoginScreen() {
  const { user, login, loading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (user) return <Redirect href="/" />;

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('E-mail et mot de passe requis');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <LinearGradient
            colors={[Palette.green950, Palette.green850, Palette.green700]}
            style={styles.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Ionicons name="leaf" size={20} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.logoTitle}>FresCoop</Text>
                <Text style={styles.logoTag}>POESAM 2026</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Connexion</Text>
            <Text style={styles.heroSub}>
              Accédez à votre espace FresCoop
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <Input
              label="E-mail"
              placeholder="vous@frescoop.sn"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />

            <View>
              <Input
                label="Mot de passe"
                placeholder="••••••••"
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={onSubmit}
              />
              <Pressable
                onPress={() => setShowPwd((v) => !v)}
                style={styles.eye}
                hitSlop={10}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Palette.muted}
                />
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Palette.coral600} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Se connecter"
              size="lg"
              loading={submitting}
              onPress={onSubmit}
              trailing={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.line} />
            </View>

            <Link href="/auth/register" asChild>
              <Pressable style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.85 }]}>
                <Ionicons name="person-add-outline" size={18} color={Palette.green850} />
                <Text style={styles.secondaryText}>Créer un compte</Text>
              </Pressable>
            </Link>

            <Pressable
              onPress={async () => {
                setEmail('amethsl2218@gmail.com');
                setPassword('demo1234');
                setTimeout(() => onSubmit(), 100);
              }}
              style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="sparkles" size={16} color={Palette.gold600} />
              <Text style={styles.demoText}>Démo invité · tester toutes les fonctions</Text>
            </Pressable>

            <Text style={styles.footer}>
              Besoin d'aide ? Contactez votre coordinateur coopérative.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.green950 },
  scroll: { flexGrow: 1, backgroundColor: Palette.paper },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 4,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  logoTag: {
    color: Palette.gold600,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: Palette.line,
    shadowColor: '#071b14',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 34,
    padding: 8,
  },
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  line: { flex: 1, height: 1, backgroundColor: Palette.line },
  dividerText: { color: Palette.muted, fontWeight: '700', fontSize: 12 },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Palette.lineStrong,
    backgroundColor: '#ffffff',
  },
  secondaryText: { color: Palette.green850, fontWeight: '900', fontSize: 15 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Palette.gold100,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  demoText: { color: Palette.gold600, fontWeight: '900', fontSize: 13 },
  footer: {
    textAlign: 'center',
    color: Palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
