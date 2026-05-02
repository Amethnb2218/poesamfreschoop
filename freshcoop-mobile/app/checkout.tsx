import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';

export default function CheckoutScreen() {
  const { orderIds = '' } = useLocalSearchParams<{ orderIds: string }>();
  const { user, store, refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'launched' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const ids = useMemo(
    () => String(orderIds).split(',').map((s) => s.trim()).filter(Boolean),
    [orderIds],
  );

  const orders = useMemo(
    () => (store.orders || []).filter((o: any) => ids.includes(o.id)),
    [store.orders, ids],
  );

  const total = orders.reduce(
    (acc: number, o: any) => acc + Number(o.totalPrice || o.total || 0),
    0,
  );

  useEffect(() => {
    if (orders.length === 0 && ids.length > 0) {
      // peut arriver si le user vient ici avec des IDs obsolètes
      refresh();
    }
  }, [orders.length, ids.length, refresh]);

  async function payNow() {
    if (!user || orders.length === 0) return;
    setBusy(true);
    setStatus('idle');
    setMessage(null);
    try {
      const description = `Commande FresCoop · ${orders.length} article${orders.length > 1 ? 's' : ''}`;
      const res = await api.createPaydunyaInvoice({
        amount: total,
        description,
        orderIds: ids,
        payerId: user.id,
        receiptCode: `FC-${Date.now().toString(36).toUpperCase()}`,
        storePhone: user.phone,
      });

      if (!res.ok || !res.url) {
        setStatus('error');
        setMessage(res.error || 'Impossible de créer la facture');
        return;
      }

      setStatus('launched');
      const out = await WebBrowser.openBrowserAsync(res.url);
      // WebBrowser retourne 'cancel' ou 'dismiss' à la fermeture
      if (out.type === 'cancel' || out.type === 'dismiss') {
        // On ne sait pas l'issue — le serveur reçoit un IPN de PayDunya
        await refresh();
        setStatus('done');
        setMessage(
          'Paiement lancé. Le statut sera mis à jour automatiquement dès confirmation.',
        );
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Erreur réseau');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="card" size={26} color="#ffffff" />
          </View>
          <Text style={styles.title}>Paiement sécurisé</Text>
          <Text style={styles.subtitle}>
            Paiement via PayDunya · Mobile money, carte, Wave, Orange Money
          </Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          {orders.length === 0 ? (
            <Text style={styles.empty}>Aucune commande à payer.</Text>
          ) : (
            orders.map((o: any, i: number) => (
              <View key={o.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {o.productSnapshot?.name || o.productName || 'Produit'}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {o.quantity} {o.unit || 'kg'} × {Number(o.unitPrice || 0).toLocaleString('fr-FR')} F
                  </Text>
                </View>
                <Text style={styles.rowTotal}>
                  {Number(o.totalPrice || 0).toLocaleString('fr-FR')} F
                </Text>
              </View>
            ))
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </Card>

        {message ? (
          <Card
            style={{
              backgroundColor:
                status === 'error' ? Palette.coral100 : Palette.green100,
              borderColor: status === 'error' ? Palette.coral600 : Palette.green700,
            }}>
            <Text
              style={{
                color: status === 'error' ? Palette.coral600 : Palette.green850,
                fontWeight: '800',
                fontSize: 13,
                lineHeight: 19,
              }}>
              {message}
            </Text>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Paiement sur place</Text>
          <Text style={styles.info}>
            Vous pouvez aussi régler en espèces à la livraison. Le vendeur recevra
            votre commande et confirmera la remise à l'agent.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={styles.linkRow}>
            <Ionicons name="cash-outline" size={16} color={Palette.green850} />
            <Text style={styles.linkText}>Payer à la livraison</Text>
          </Pressable>
        </Card>

        <Button
          label={busy ? 'Préparation…' : `Payer ${total.toLocaleString('fr-FR')} FCFA`}
          size="lg"
          loading={busy}
          onPress={payNow}
          disabled={orders.length === 0}
          leading={<Ionicons name="shield-checkmark" size={18} color="#ffffff" />}
        />
        <Button
          label="Retour"
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 6, paddingTop: 10 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { color: Palette.muted, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: Palette.ink, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Palette.line },
  rowTitle: { fontWeight: '800', color: Palette.ink, fontSize: 13 },
  rowMeta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  rowTotal: { fontWeight: '900', color: Palette.green850, fontSize: 14 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: Palette.ink,
  },
  totalLabel: { color: Palette.muted, fontWeight: '800', fontSize: 14 },
  totalValue: { color: Palette.ink, fontWeight: '900', fontSize: 22 },
  empty: { color: Palette.muted, textAlign: 'center', padding: 10 },
  info: { color: Palette.muted, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  linkText: { color: Palette.green850, fontWeight: '900', fontSize: 13 },
});
