import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isBuyerRole, isSellerRole } from '@/lib/roles';

type Step = {
  kicker: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  cta: string;
  action?: () => void;
};

export default function OnboardingScreen() {
  const { user } = useSession();
  const [idx, setIdx] = useState(0);

  const role = user?.role;
  const steps: Step[] = [
    {
      kicker: `BIENVENUE ${user?.name?.split(' ')[0]?.toUpperCase() || ''}`,
      title: 'FresCoop, votre allié quotidien',
      body: isSellerRole(role)
        ? 'Publiez vos produits, suivez vos lots, recevez vos paiements en temps réel. Tout sur un seul écran.'
        : isBuyerRole(role)
        ? 'Découvrez des produits tracés, négociez avec les productrices, payez en toute sécurité.'
        : 'Pilotez l\'écosystème FresCoop avec un tableau de bord complet adapté à votre rôle.',
      icon: 'hand-left-outline',
      cta: 'Continuer',
    },
    {
      kicker: 'ÉTAPE 1 · ACCUEIL',
      title: 'Tout démarre sur votre accueil',
      body: 'Actions rapides, notifications, recherche globale, commandes récentes. Votre hub personnel adapté à votre rôle.',
      icon: 'grid-outline',
      cta: 'Étape suivante',
    },
    {
      kicker: 'ÉTAPE 2 · AGIR',
      title: isSellerRole(role)
        ? 'Publiez votre premier produit'
        : isBuyerRole(role)
        ? 'Explorez le marché'
        : 'Supervisez la plateforme',
      body: isSellerRole(role)
        ? 'Appuyez sur le bouton + sur l\'onglet Produits pour ajouter photo, prix, zone. Les clients le verront immédiatement.'
        : isBuyerRole(role)
        ? 'Parcourez le marché, ajoutez au panier, confirmez votre commande. Paiement Wave, Orange Money ou livraison.'
        : 'Gérez utilisateurs, validez dossiers, consultez l\'impact global depuis le menu "Mon espace administrateur".',
      icon: isSellerRole(role) ? 'leaf-outline' : 'storefront-outline',
      cta: 'Étape suivante',
    },
    {
      kicker: 'ÉTAPE 3 · YAAY',
      title: 'FresCoop AI, votre assistant',
      body: 'En bas à gauche, le bouton vert 💬 ouvre FresCoop AI, votre assistant intelligent en 4 langues : français, wolof, pulaar, sérère. Posez-lui toutes vos questions.',
      icon: 'sparkles',
      cta: 'Lancer FresCoop',
      action: () => router.replace('/'),
    },
  ];

  const step = steps[idx];

  function next() {
    if (step.action) return step.action();
    if (idx >= steps.length - 1) {
      router.replace('/');
    } else {
      setIdx((i) => i + 1);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[Palette.green950, Palette.green850]} style={styles.bg}>
        <View style={styles.skip}>
          <Pressable onPress={() => router.replace('/')} hitSlop={10}>
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        </View>

        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === idx && styles.dotActive,
                i < idx && { backgroundColor: Palette.gold600 },
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name={step.icon} size={56} color="#ffffff" />
          </View>
          <Text style={styles.kicker}>{step.kicker}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
        </View>

        <View style={styles.footer}>
          <Button
            label={step.cta}
            size="lg"
            onPress={next}
            trailing={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
          />
          {idx > 0 ? (
            <Pressable onPress={() => setIdx((i) => i - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>Précédent</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.green950 },
  bg: { flex: 1, padding: 24 },
  skip: { alignItems: 'flex-end' },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 36,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Shadows.lg,
  },
  kicker: { color: Palette.gold600, fontSize: 12, fontWeight: '900', letterSpacing: 2.5 },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  body: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 400,
  },
  footer: { gap: 10 },
  backBtn: { alignItems: 'center', paddingVertical: 10 },
  backText: { color: 'rgba(255,255,255,0.8)', fontWeight: '800' },
});
