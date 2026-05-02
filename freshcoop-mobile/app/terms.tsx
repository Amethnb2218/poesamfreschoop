import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius } from '@/constants/theme';

type Section = { id: string; title: string; content: string };

const TERMS: Section[] = [
  {
    id: 'preamble',
    title: 'Préambule',
    content:
      "FresCoop est une plateforme sénégalaise de commerce agricole qui connecte productrices, commerçantes, transporteurs et acheteurs B2B autour de trois briques : micro-hubs solaires, intelligence marché et preuve économique portable. Les présentes conditions s'appliquent à tout utilisateur de l'application mobile ou du site web.",
  },
  {
    id: 'access',
    title: '1. Accès au service',
    content:
      "L'inscription à FresCoop est gratuite pour toutes les productrices et acheteurs. Vous devez être majeur et fournir des informations exactes lors de la création de votre compte. Chaque utilisateur est responsable de la confidentialité de ses identifiants et des actions effectuées depuis son compte.",
  },
  {
    id: 'usage',
    title: '2. Utilisation de la plateforme',
    content:
      "Vous vous engagez à utiliser FresCoop de bonne foi, à ne publier que des produits réels, à respecter les autres utilisateurs et à ne pas contourner les mécanismes de paiement. Tout usage abusif (faux produits, insultes, tentatives de fraude) entraîne la suspension immédiate du compte.",
  },
  {
    id: 'transactions',
    title: '3. Transactions et paiements',
    content:
      "Les paiements sont sécurisés via PayDunya (Orange Money, Wave, Free Money, cartes). FresCoop ne détient jamais vos fonds : ils transitent directement du client vers le producteur. Une commission transparente de 2% est appliquée pour couvrir les frais de plateforme et de logistique froide.",
  },
  {
    id: 'data',
    title: '4. Protection des données',
    content:
      "Vos données personnelles (nom, téléphone, région, historique de transactions) sont utilisées exclusivement pour le fonctionnement du service. Elles ne sont jamais revendues. Vous pouvez à tout moment demander leur export ou leur suppression complète via le support.",
  },
  {
    id: 'consent',
    title: '5. Consentement économique',
    content:
      "Votre historique de ventes bâti sur FresCoop constitue une preuve économique portable. Vous choisissez de le partager ou non avec nos partenaires financiers (banques, SFD, BNDE). Aucun partage n'est effectué sans votre consentement explicite depuis la page Bancabilité.",
  },
  {
    id: 'traceability',
    title: '6. Traçabilité des lots',
    content:
      "Chaque lot de produit est associé à un QR code unique qui garantit sa traçabilité du champ au paiement. Les photos qualité, relevés de température et historique de transport sont conservés pour protéger à la fois le producteur et l'acheteur.",
  },
  {
    id: 'ussd',
    title: '7. Accès hors ligne USSD',
    content:
      "Le service USSD *384*FRES# est accessible depuis tout téléphone au Sénégal (y compris 2G). Les frais opérateur standards s'appliquent. Ce canal permet aux productrices sans smartphone d'accéder aux fonctions essentielles : cours du jour, déclaration de vente, consultation de solde.",
  },
  {
    id: 'responsibility',
    title: '8. Responsabilité',
    content:
      "FresCoop met tout en œuvre pour assurer la continuité du service, la sécurité des paiements et l'exactitude des informations. Toutefois, en cas de litige entre un acheteur et un vendeur, notre équipe propose une médiation mais ne se substitue pas aux parties.",
  },
  {
    id: 'modify',
    title: '9. Modification des conditions',
    content:
      "Les présentes conditions peuvent être mises à jour. Vous serez notifié dans l'app en cas de changement majeur. La continuation de l'utilisation de FresCoop après modification vaut acceptation des nouvelles conditions.",
  },
  {
    id: 'contact',
    title: '10. Contact & médiation',
    content:
      "Pour toute question ou litige : support@frescoop.sn · +221 33 800 00 00. Le droit applicable est le droit sénégalais. En cas de litige, juridiction compétente de Dakar.",
  },
];

export default function TermsScreen() {
  const [openId, setOpenId] = useState<string | null>('preamble');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Conditions & confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Ionicons name="document-text" size={30} color={Palette.green850} />
          <Text style={styles.heroTitle}>
            Conditions générales d'utilisation
          </Text>
          <Text style={styles.heroDate}>En vigueur depuis le 30 avril 2026</Text>
        </View>

        <View style={{ gap: 8 }}>
          {TERMS.map((section) => {
            const open = openId === section.id;
            return (
              <Pressable
                key={section.id}
                onPress={() => setOpenId(open ? null : section.id)}
                style={[styles.section, open && styles.sectionOpen]}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Palette.muted}
                  />
                </View>
                {open ? <Text style={styles.sectionBody}>{section.content}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color={Palette.green700} />
          <Text style={styles.footerText}>
            FresCoop s'engage au respect du règlement RGPD et des lois sénégalaises
            sur la protection des données personnelles.
          </Text>
        </View>
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
  headerTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink, flex: 1, textAlign: 'center' },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hero: {
    backgroundColor: Palette.wash,
    padding: 20,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  heroDate: { color: Palette.muted, fontSize: 12, fontWeight: '700' },
  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.md,
    padding: 14,
  },
  sectionOpen: {
    borderColor: Palette.green700,
    backgroundColor: '#ffffff',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '900', color: Palette.ink },
  sectionBody: {
    color: Palette.ink2,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 14,
    backgroundColor: Palette.green100,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  footerText: { flex: 1, color: Palette.green850, fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
