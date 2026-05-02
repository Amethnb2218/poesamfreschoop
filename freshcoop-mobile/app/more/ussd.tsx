import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

const USSD_CODE = '*384*FRES#';

type Screen = {
  title: string;
  text: string;
  options: { key: string; label: string; next?: string; action?: 'call' | 'reset' }[];
};

export default function UssdScreen() {
  const { store } = useSession();
  const [dialed, setDialed] = useState('');
  const [current, setCurrent] = useState<string>('start');
  const [history, setHistory] = useState<string[]>(['start']);

  const productsCount = store.products?.length || 0;
  const avgPrice = (store.products || []).reduce(
    (a: number, p: any) => a + Number(p.price || 0),
    0,
  ) / Math.max(1, productsCount);

  const screens: Record<string, Screen> = {
    start: {
      title: 'FresCoop USSD',
      text: `Bienvenue FresCoop\n\nChoisissez une option :`,
      options: [
        { key: '1', label: 'Prix du jour', next: 'prix' },
        { key: '2', label: 'Déclarer une vente', next: 'vente' },
        { key: '3', label: 'Mon solde', next: 'solde' },
        { key: '4', label: 'Alerte anti-gaspi', next: 'antigaspi' },
        { key: '5', label: 'Contacter un agent', next: 'agent' },
        { key: '0', label: 'Quitter', action: 'reset' },
      ],
    },
    prix: {
      title: 'Prix du jour',
      text: `Prix marché · ${productsCount} produits\n\nMoyenne: ${Math.round(avgPrice).toLocaleString('fr-FR')} F/kg\n\n1. Tomates: 700 F\n2. Oignons: 450 F\n3. Mangues: 900 F\n4. Bissap séché: 2 500 F`,
      options: [
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    vente: {
      title: 'Déclarer une vente',
      text: `Entrez votre code vendeur (4 chiffres)\n\nExemple: 1234\n\n[Cette étape requiert un envoi SMS depuis un vrai opérateur]`,
      options: [
        { key: '1', label: 'Simuler : 150 kg tomates', next: 'vente-ok' },
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    'vente-ok': {
      title: 'Vente enregistrée',
      text: `✓ Vente enregistrée\n\n150 kg × 700 F = 105 000 F\n\nVous recevrez un SMS de confirmation de l'acheteur sous 24h.`,
      options: [
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    solde: {
      title: 'Mon solde',
      text: `Solde FresCoop\n\nDisponible: 285 000 F\nEn attente: 105 000 F\nBancabilité: 72/100\n\nMode: Wave, Orange Money`,
      options: [
        { key: '1', label: 'Retirer', next: 'retrait' },
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    retrait: {
      title: 'Retrait en cours',
      text: `Retrait demandé\n\n285 000 F vers\n+221 77 XXX XX XX\n\n✓ Reçu par Wave en 5 minutes`,
      options: [
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    antigaspi: {
      title: 'Alerte anti-gaspi',
      text: `2 lots à vendre vite :\n\n1. Tomates 80 kg (2j)\n2. Mangues 30 kg (3j)\n\nPublier en vente éclair ?`,
      options: [
        { key: '1', label: 'Oui -25%', next: 'flash-ok' },
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    'flash-ok': {
      title: 'Vente éclair publiée',
      text: `✓ Publié sur le marché\n\nAcheteurs B2B notifiés par SMS\n\nRéduction appliquée: -25%`,
      options: [
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
    agent: {
      title: 'Contacter un agent',
      text: `Appeler l'agent terrain\n\nBinta Camara\n+221 76 200 00 00\n\nDispo: 8h - 18h`,
      options: [
        { key: '1', label: 'Appeler maintenant', action: 'call' },
        { key: '0', label: 'Retour', next: 'start' },
      ],
    },
  };

  const screen = screens[current];

  function press(opt: Screen['options'][0]) {
    setDialed(`${USSD_CODE.slice(0, -1)}*${opt.key}#`);
    setTimeout(() => {
      if (opt.action === 'reset') {
        setCurrent('start');
        setHistory(['start']);
        setDialed('');
        return;
      }
      if (opt.action === 'call') {
        Linking.openURL('tel:+221762000000').catch(() => {});
        return;
      }
      if (opt.next) {
        setCurrent(opt.next);
        setHistory((h) => [...h, opt.next!]);
      }
    }, 220);
  }

  function dialReal() {
    Linking.openURL(`tel:${USSD_CODE.replace('#', '%23')}`).catch(() => {});
  }

  function reset() {
    setCurrent('start');
    setHistory(['start']);
    setDialed('');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Simulateur USSD' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Pour les téléphones basiques sans Internet. Testez la navigation comme si vous étiez sur un
          mobile 2G.
        </Text>

        <View style={styles.phone}>
          <View style={styles.phoneTop}>
            <View style={styles.phoneDot} />
          </View>
          <View style={styles.phoneScreen}>
            {dialed ? (
              <Text style={styles.dialed}>{dialed}</Text>
            ) : (
              <Text style={styles.dialed}>{USSD_CODE}</Text>
            )}
            <Text style={styles.screenTitle}>{screen.title}</Text>
            <Text style={styles.screenText}>{screen.text}</Text>

            <View style={styles.divider} />

            <View style={{ gap: 8 }}>
              {screen.options.map((opt) => (
                <Pressable key={opt.key} onPress={() => press(opt)} style={styles.option}>
                  <Text style={styles.optionKey}>{opt.key}</Text>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.phoneBottom}>
            <Pressable onPress={reset} style={styles.phoneBtn}>
              <Ionicons name="close" size={16} color={Palette.ink} />
              <Text style={styles.phoneBtnText}>Fin</Text>
            </Pressable>
            <Pressable onPress={dialReal} style={[styles.phoneBtn, { backgroundColor: Palette.green700 }]}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={[styles.phoneBtnText, { color: '#ffffff' }]}>Composer réel</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle" size={16} color={Palette.blue700} />
          <Text style={styles.infoText}>
            Le vrai service USSD fonctionne en wolof, pulaar et français. Frais opérateur standard.
          </Text>
        </View>

        <View style={styles.info}>
          <Ionicons name="checkmark-circle" size={16} color={Palette.green700} />
          <Text style={styles.infoText}>
            Couverture : 100% des producteurs même sans smartphone. Clé de l'inclusion rurale.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  intro: { color: Palette.muted, fontSize: 13, lineHeight: 19 },
  phone: {
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    padding: 10,
    ...Shadows.lg,
  },
  phoneTop: { alignItems: 'center', paddingVertical: 6 },
  phoneDot: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  phoneScreen: {
    backgroundColor: '#c5dbb8',
    padding: 18,
    borderRadius: Radius.md,
    gap: 8,
    minHeight: 360,
  },
  dialed: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#0a2b1e',
    letterSpacing: 2,
    marginBottom: 6,
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0a2b1e',
    letterSpacing: 0.5,
  },
  screenText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#0a2b1e',
    lineHeight: 20,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#0a2b1e55',
    marginVertical: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(10,43,30,0.12)',
    borderRadius: 6,
  },
  optionKey: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#0a2b1e',
    color: '#c5dbb8',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '900',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  optionLabel: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#0a2b1e',
  },
  phoneBottom: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    marginTop: 4,
  },
  phoneBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: Radius.pill,
  },
  phoneBtnText: { color: Palette.ink, fontWeight: '900', fontSize: 12 },
  info: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  infoText: { flex: 1, color: Palette.ink2, fontSize: 12, lineHeight: 17 },
});
