import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';

const FAQ = [
  {
    q: 'Comment vendre mes produits sur FresCoop ?',
    a: "1) Créez votre compte agriculteur. 2) Sur l'onglet Produits, appuyez sur le bouton + pour publier un produit avec photo, prix et quantité. 3) Les acheteurs commandent directement depuis le Marché. 4) Vous recevez le paiement via Wave, Orange Money ou virement.",
  },
  {
    q: "Comment obtenir un crédit bancaire ?",
    a: "Allez dans Profil → Bancabilité. FresCoop calcule un score de 0 à 100 selon vos ventes, paiements et attestations. Au-dessus de 70, votre dossier est exportable en PDF pour les banques et SFD partenaires.",
  },
  {
    q: "L'app fonctionne-t-elle sans Internet ?",
    a: "Oui ! En mode hors-ligne, vous pouvez consulter vos données en cache. Les actions que vous effectuez sont mises en file d'attente et envoyées automatiquement dès que la connexion revient. Pour les téléphones sans Internet, composez *384*FRES#.",
  },
  {
    q: "Comment suivre un lot jusqu'au paiement ?",
    a: "Chaque lot dispose d'un QR code unique. Dans l'onglet Lots, ouvrez votre lot pour voir : origine, date de récolte, photos qualité, température du hub, historique des statuts, commande associée et paiement.",
  },
  {
    q: "Qu'est-ce que l'anti-gaspi ?",
    a: "Notre système détecte les produits qui approchent de leur fin de vie (6 jours ou moins). Il propose une remise automatique (-15% à -40% selon l'urgence) et notifie immédiatement les acheteurs B2B. Vous évitez la perte et vendez au bon prix.",
  },
  {
    q: "Comment contacter un vendeur ?",
    a: "Sur la page d'un produit, appuyez sur le bouton 'Contacter le vendeur'. Une conversation s'ouvre dans votre messagerie. Vous pouvez également appeler le numéro affiché sur le profil du vendeur.",
  },
  {
    q: "Quels moyens de paiement sont acceptés ?",
    a: "FresCoop intègre PayDunya qui accepte : Orange Money, Wave, Free Money, cartes Visa/Mastercard et virements bancaires. Les paiements à la livraison sont aussi possibles sur les commandes physiques.",
  },
  {
    q: "Comment devenir partenaire financier ?",
    a: "Contactez l'équipe FresCoop à contact@frescoop.sn. Nos partenaires accèdent à un tableau de bord dédié avec scoring bancabilité, preuves économiques et suivi des cohortes de producteurs.",
  },
];

const CONTACTS = [
  {
    icon: 'mail-outline' as const,
    label: 'Email support',
    value: 'support@frescoop.sn',
    action: () => Linking.openURL('mailto:support@frescoop.sn').catch(() => {}),
  },
  {
    icon: 'call-outline' as const,
    label: 'Téléphone',
    value: '+221 33 800 00 00',
    action: () => Linking.openURL('tel:+221338000000').catch(() => {}),
  },
  {
    icon: 'logo-whatsapp' as const,
    label: 'WhatsApp',
    value: '+221 77 000 00 00',
    action: () =>
      Linking.openURL('https://wa.me/221770000000').catch(() => {}),
  },
  {
    icon: 'chatbubbles-outline' as const,
    label: 'Assistant IA',
    value: 'Disponible 24/7 · 4 langues',
    action: () => {
      router.back();
    },
  },
];

export default function HelpScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Centre d'aide</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={30} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
          <Text style={styles.heroSub}>
            Parcourez les questions fréquentes ou contactez notre équipe.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        <View style={{ gap: 8 }}>
          {FAQ.map((item, i) => {
            const open = openIdx === i;
            return (
              <Pressable
                key={i}
                onPress={() => setOpenIdx(open ? null : i)}
                style={[styles.faqCard, open && styles.faqCardOpen]}>
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ} numberOfLines={open ? undefined : 2}>
                    {item.q}
                  </Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Palette.muted}
                  />
                </View>
                {open ? <Text style={styles.faqA}>{item.a}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <Card padded={false}>
          {CONTACTS.map((c, i) => (
            <Pressable
              key={i}
              onPress={c.action}
              style={[styles.contactRow, i > 0 && styles.contactRowBorder]}>
              <View style={styles.contactIcon}>
                <Ionicons name={c.icon} size={20} color={Palette.green850} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
            </Pressable>
          ))}
        </Card>

        <Card>
          <View style={styles.tipHead}>
            <Ionicons name="bulb-outline" size={18} color={Palette.gold600} />
            <Text style={styles.tipTitle}>Astuce</Text>
          </View>
          <Text style={styles.tipBody}>
            Vous pouvez aussi poser vos questions à notre assistant virtuel disponible en français,
            wolof, pulaar et sérère. Appuyez sur le bouton 💬 en bas à gauche.
          </Text>
        </Card>

        <Text style={styles.footerText}>
          FresCoop · POESAM 2026 · Version 1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: Palette.green850,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.md,
    padding: 14,
  },
  faqCardOpen: {
    borderColor: Palette.green700,
    backgroundColor: Palette.green100,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '800', color: Palette.ink, lineHeight: 20 },
  faqA: {
    color: Palette.ink2,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  contactRowBorder: { borderTopWidth: 1, borderTopColor: Palette.line },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  contactValue: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipTitle: { fontWeight: '900', color: Palette.gold600, fontSize: 13, letterSpacing: 0.5 },
  tipBody: { color: Palette.ink2, fontSize: 13, lineHeight: 20, marginTop: 8 },
  footerText: {
    textAlign: 'center',
    color: Palette.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
  },
});
