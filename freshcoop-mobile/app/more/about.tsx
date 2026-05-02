import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';

const TEAM = [
  { name: 'Ameth Sall', role: 'Fondateur · Produit', initials: 'AS' },
  { name: 'Équipe FresCoop', role: 'Développement · Design', initials: 'FC' },
];

const PARTNERS = [
  { name: 'BNDE', role: 'Financement producteur' },
  { name: 'Sonatel / Orange', role: 'USSD + Orange Money' },
  { name: 'PayDunya', role: 'Paiements sécurisés' },
  { name: 'Ministère Agriculture', role: 'Soutien institutionnel' },
  { name: 'POESAM 2026', role: 'Programme d\'accompagnement' },
];

const PILLARS = [
  {
    icon: 'leaf-outline' as const,
    title: 'Micro-hubs solaires',
    text: 'Infrastructure froide partagée pour couper les pertes post-récolte de 35% à moins de 5%.',
  },
  {
    icon: 'stats-chart-outline' as const,
    title: 'Intelligence marché',
    text: 'Chaque lot orienté vers le meilleur acheteur selon prix, demande et délai.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Preuve économique portable',
    text: 'Historique de ventes tracé qui ouvre l\'accès au crédit bancaire.',
  },
];

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'À propos' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[Palette.green950, Palette.green850]} style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={40} color="#ffffff" />
          </View>
          <Text style={styles.brand}>FresCoop</Text>
          <Text style={styles.brandTag}>POESAM 2026 · Sénégal</Text>
          <Text style={styles.mission}>
            Connecter productrices, commerçantes et acheteurs B2B sur une plateforme
            qui protège le revenu, coupe les pertes et ouvre l'accès au crédit.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Nos 3 piliers</Text>
        {PILLARS.map((p, i) => (
          <Card key={i}>
            <View style={styles.pillarRow}>
              <View style={styles.pillarIcon}>
                <Ionicons name={p.icon} size={22} color={Palette.green700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <Text style={styles.pillarText}>{p.text}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Équipe</Text>
        <Card>
          {TEAM.map((m, i) => (
            <View key={i} style={[styles.teamRow, i > 0 && styles.teamRowBorder]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{m.name}</Text>
                <Text style={styles.teamRole}>{m.role}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Partenaires</Text>
        <Card>
          <Text style={styles.partnersIntro}>
            FresCoop s'appuie sur un écosystème d'acteurs publics et privés alignés sur la
            souveraineté alimentaire et l'inclusion financière.
          </Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            {PARTNERS.map((p, i) => (
              <View key={i} style={styles.partnerRow}>
                <View style={styles.partnerDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerName}>{p.name}</Text>
                  <Text style={styles.partnerRole}>{p.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Pressable
            onPress={() => Linking.openURL('mailto:contact@frescoop.sn').catch(() => {})}
            style={styles.linkRow}>
            <Ionicons name="mail-outline" size={18} color={Palette.green850} />
            <Text style={styles.linkText}>contact@frescoop.sn</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('tel:+221338000000').catch(() => {})}
            style={styles.linkRow}>
            <Ionicons name="call-outline" size={18} color={Palette.green850} />
            <Text style={styles.linkText}>+221 33 800 00 00</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('https://frescoop.sn').catch(() => {})}
            style={styles.linkRow}>
            <Ionicons name="globe-outline" size={18} color={Palette.green850} />
            <Text style={styles.linkText}>frescoop.sn</Text>
          </Pressable>
        </Card>

        <Text style={styles.version}>Version 1.0 · POESAM 2026</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hero: {
    padding: 24,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: '#ffffff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginTop: 8 },
  brandTag: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  mission: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 6,
  },
  pillarRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  pillarText: { color: Palette.ink2, fontSize: 13, lineHeight: 19, marginTop: 4 },
  teamRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10 },
  teamRowBorder: { borderTopWidth: 1, borderTopColor: Palette.line },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  teamName: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  teamRole: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  partnersIntro: { color: Palette.muted, fontSize: 13, lineHeight: 19 },
  partnerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  partnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.green700 },
  partnerName: { fontWeight: '900', color: Palette.ink, fontSize: 13 },
  partnerRole: { color: Palette.muted, fontSize: 11, marginTop: 1 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  linkText: { color: Palette.green850, fontWeight: '800', fontSize: 14 },
  version: {
    textAlign: 'center',
    color: Palette.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 20,
  },
});
