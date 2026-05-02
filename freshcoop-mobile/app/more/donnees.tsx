import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { API_BASE_AUTO, getApiBase, setApiOverride } from '@/lib/api';
import { rowsToCsv, shareCsv } from '@/lib/csv';
import { useDialog } from '@/components/AppDialog';
import { generateDemoSeed, hasDemoData, isStoreBootstrapped, removeDemoData } from '@/lib/demoSeed';

export default function DataScreen() {
  const { store, refresh, online, lastSyncAt, error, mutateStore } = useSession();
  const [customUrl, setCustomUrl] = useState(getApiBase());
  const [busy, setBusy] = useState(false);
  const dialog = useDialog();

  const demoLoaded = hasDemoData(store);

  async function seedDemo() {
    setBusy(true);
    try {
      const alreadyDone = await isStoreBootstrapped(store);
      if (alreadyDone) {
        dialog.show({
          title: 'Démo déjà chargée',
          body: 'Les données de démo existent déjà. Retirez-les avant de relancer un nouveau seed.',
          tone: 'warning',
        });
        return;
      }
      const seeded = await generateDemoSeed(store);
      await mutateStore(() => seeded);
      dialog.show({
        title: 'Données de démo chargées',
        body: '50 productrices, 200 produits, 150 commandes, 80 lots, 8 hubs et 50 transactions ajoutés.',
        tone: 'success',
      });
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible de charger la démo', 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function unseedDemo() {
    const ok = await dialog.confirm({
      title: 'Retirer les données démo',
      body: "Toutes les entités ajoutées par le seed seront supprimées. Vos comptes et données réels sont conservés.",
      confirmLabel: 'Retirer',
      tone: 'warning',
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const cleaned = removeDemoData(store);
      await mutateStore(() => cleaned);
      dialog.toast('Base revenue à son état d\'origine.', 'success');
    } catch (err: any) {
      dialog.toast(err?.message || 'Impossible', 'danger');
    } finally {
      setBusy(false);
    }
  }

  const rows = [
    { label: 'Utilisateurs', count: store.users?.length || 0 },
    { label: 'Produits', count: store.products?.length || 0 },
    { label: 'Lots', count: store.lots?.length || 0 },
    { label: 'Commandes', count: store.orders?.length || 0 },
    { label: 'Dossiers', count: store.dossiers?.length || 0 },
    { label: 'Attestations', count: store.attestations?.length || 0 },
    { label: 'Preuves', count: store.proofs?.length || 0 },
    { label: 'Transactions', count: store.transactions?.length || 0 },
    { label: 'Hubs', count: store.hubs?.length || 0 },
    { label: 'Notifications', count: store.notifications?.length || 0 },
  ];

  const totalRecords = rows.reduce((a, r) => a + r.count, 0);

  async function testAndApply(url: string) {
    setBusy(true);
    try {
      const clean = url.trim().replace(/\/$/, '');
      const res = await fetch(`${clean}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error('Réponse invalide');
      await setApiOverride(clean);
      await refresh();
      dialog.show({
        title: 'Connexion OK',
        body: `API joignable (${json.mode}). Les données vont se synchroniser.`,
        tone: 'success',
      });
    } catch (err: any) {
      dialog.show({
        title: 'Échec de connexion',
        body: `Impossible d'atteindre ${url}.\n\n${err?.message || 'Erreur réseau'}\n\nVérifiez :\n· Le serveur tourne (npm run dev)\n· Même Wi-Fi que le PC\n· IP locale correcte`,
        tone: 'danger',
      });
    } finally {
      setBusy(false);
    }
  }

  async function resetAuto() {
    await setApiOverride(null);
    setCustomUrl(API_BASE_AUTO);
    await refresh();
    dialog.toast(`URL automatique restaurée : ${API_BASE_AUTO}`, 'info');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Données' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.head}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: online ? Palette.green700 : Palette.coral600 },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {online ? 'Connecté' : 'Hors-ligne'}
              </Text>
              <Text style={styles.sub}>
                {lastSyncAt
                  ? `Dernière sync : ${new Date(lastSyncAt).toLocaleTimeString('fr-FR')}`
                  : 'Jamais synchronisé'}
              </Text>
            </View>
          </View>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Text style={styles.endpoint}>{getApiBase()}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>URL de l'API</Text>
          <Text style={styles.hint}>
            Si l'app ne voit pas les mêmes données que le site, changez l'URL pour celle de
            votre PC. Exemple : http://192.168.1.42:4174
          </Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <Input
              label="URL du serveur"
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://192.168.1.42:4174"
            />
            <Button
              label={busy ? 'Test...' : 'Tester et enregistrer'}
              size="lg"
              loading={busy}
              onPress={() => testAndApply(customUrl)}
              leading={<Ionicons name="wifi" size={18} color="#ffffff" />}
            />
            <Button
              label="Revenir à l'URL automatique"
              variant="secondary"
              onPress={resetAuto}
              leading={<Ionicons name="refresh" size={18} color={Palette.ink} />}
            />
            <Text style={styles.hintSmall}>
              URL auto détectée : {API_BASE_AUTO}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Volumétrie</Text>
          <Text style={styles.sub}>
            {totalRecords.toLocaleString('fr-FR')} enregistrements partagés avec le site
          </Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowCount}>{r.count}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Mode démo POESAM</Text>
          <Text style={styles.hint}>
            {demoLoaded
              ? "Démo active : 50 productrices, produits, commandes, lots et hubs sont présents. Vous pouvez les retirer pour revenir à l'état d'origine."
              : 'Pré-remplit la base avec 50 productrices, 200 produits, 150 commandes et 8 micro-hubs. Idéal pour la présentation au jury.'}
          </Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            {demoLoaded ? (
              <>
                <View style={styles.demoStatus}>
                  <Ionicons name="checkmark-circle" size={16} color={Palette.green700} />
                  <Text style={styles.demoStatusText}>Démo chargée</Text>
                </View>
                <Button
                  label="Retirer les données démo"
                  variant="secondary"
                  loading={busy}
                  onPress={unseedDemo}
                  leading={<Ionicons name="trash-outline" size={18} color={Palette.coral600} />}
                />
              </>
            ) : (
              <Button
                label="Charger les données démo"
                size="lg"
                loading={busy}
                onPress={seedDemo}
                leading={<Ionicons name="sparkles" size={18} color="#ffffff" />}
              />
            )}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Exports CSV</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <Button
              label="Produits"
              variant="secondary"
              onPress={async () => {
                const csv = rowsToCsv(store.products || [], [
                  'id',
                  'name',
                  'category',
                  'price',
                  'quantity',
                  'unit',
                  'zone',
                  'ownerId',
                  'createdAt',
                ]);
                await shareCsv('frescoop-produits.csv', csv);
              }}
            />
            <Button
              label="Commandes"
              variant="secondary"
              onPress={async () => {
                const csv = rowsToCsv(store.orders || [], [
                  'id',
                  'createdAt',
                  'sellerId',
                  'userId',
                  'buyerEmail',
                  'quantity',
                  'unit',
                  'unitPrice',
                  'totalPrice',
                  'status',
                ]);
                await shareCsv('frescoop-commandes.csv', csv);
              }}
            />
            <Button
              label="Lots"
              variant="secondary"
              onPress={async () => {
                const csv = rowsToCsv(store.lots || [], [
                  'id',
                  'reference',
                  'ownerId',
                  'productName',
                  'weight',
                  'origin',
                  'status',
                  'harvestDate',
                ]);
                await shareCsv('frescoop-lots.csv', csv);
              }}
            />
          </View>
        </Card>

        <Button
          label="Resynchroniser maintenant"
          leading={<Ionicons name="cloud-download-outline" size={18} color="#ffffff" />}
          onPress={() => {
            refresh();
            dialog.toast('Données rafraîchies depuis le serveur.', 'success');
          }}
          size="lg"
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  sub: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  err: {
    color: Palette.coral600,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  endpoint: {
    color: Palette.green850,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  hint: { color: Palette.muted, fontSize: 12, marginTop: 6, lineHeight: 18 },
  hintSmall: { color: Palette.muted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Palette.wash,
    borderRadius: Radius.sm,
  },
  rowLabel: { color: Palette.ink, fontSize: 13, fontWeight: '700' },
  rowCount: { color: Palette.green850, fontSize: 14, fontWeight: '900' },
  demoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.green100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  demoStatusText: { color: Palette.green850, fontWeight: '900', fontSize: 12 },
});
