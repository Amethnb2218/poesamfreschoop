import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isAdminRole, isFieldAgentRole, isSellerRole, isTransporterRole } from '@/lib/roles';

const LOT_STATUSES = [
  'Récolté',
  'Contrôle qualité',
  'En hub froid',
  'En tournée',
  'Livré',
  'Payé',
];

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, store, mutateStore } = useSession();
  const [showQR, setShowQR] = useState(false);

  const lot = useMemo(
    () => (store.lots || []).find((l: any) => l.id === id || l.reference === id),
    [store.lots, id],
  );

  const product = useMemo(() => {
    if (!lot) return null;
    return (store.products || []).find((p: any) => p.id === lot.productId);
  }, [lot, store.products]);

  const owner = useMemo(
    () => (store.users || []).find((u: any) => u.id === lot?.ownerId),
    [store.users, lot],
  );

  const history = useMemo(() => {
    if (!lot) return [];
    const base = [
      {
        label: 'Lot créé',
        at: lot.createdAt,
        done: true,
      },
    ];
    if (Array.isArray(lot.history)) {
      return [...base, ...lot.history];
    }
    const idx = LOT_STATUSES.indexOf(lot.status || 'Récolté');
    return LOT_STATUSES.map((s, i) => ({
      label: s,
      at: i === 0 ? lot.createdAt : undefined,
      done: i <= idx,
    }));
  }, [lot]);

  if (!lot) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Lot' }} />
        <View style={styles.notFound}>
          <Ionicons name="cube-outline" size={48} color={Palette.muted} />
          <Text style={styles.notFoundTitle}>Lot introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const canEdit =
    isAdminRole(user?.role) ||
    isFieldAgentRole(user?.role) ||
    isTransporterRole(user?.role) ||
    (isSellerRole(user?.role) && lot.ownerId === user?.id);

  async function changeStatus(next: string) {
    await mutateStore((store) => ({
      ...store,
      lots: (store.lots || []).map((l: any) =>
        l.id === lot.id
          ? {
              ...l,
              status: next,
              updatedAt: new Date().toISOString(),
              history: [
                ...(l.history || [
                  { label: 'Lot créé', at: l.createdAt, done: true },
                ]),
                {
                  label: next,
                  at: new Date().toISOString(),
                  done: true,
                  by: user?.id,
                },
              ],
            }
          : l,
      ),
    }));
    Alert.alert('Statut mis à jour', `Lot passé en "${next}".`);
  }

  const qrData = JSON.stringify({
    type: 'lot',
    id: lot.id,
    ref: lot.reference,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ title: lot.reference || 'Lot' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ref}>{lot.reference || lot.id}</Text>
              <Text style={styles.sub}>
                {product?.name || lot.productName || 'Produit'} · {lot.weight || 0} kg
              </Text>
              {owner ? (
                <Text style={styles.sub}>Par {owner.name}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => setShowQR((v) => !v)} style={styles.qrBtn}>
              <Ionicons name="qr-code-outline" size={20} color={Palette.green850} />
            </Pressable>
          </View>

          {showQR ? (
            <View style={styles.qrWrap}>
              <View style={styles.qrBox}>
                <QRCode value={qrData} size={180} backgroundColor="#ffffff" color={Palette.green950} />
              </View>
              <Text style={styles.qrHint}>
                Scannez ce code pour accéder au lot depuis une autre app FresCoop.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.grid}>
            <Field label="Origine" value={lot.origin || '—'} />
            <Field label="Récolte" value={lot.harvestDate || '—'} />
            <Field label="Hub" value={lot.hubId || '—'} />
            <Field label="Statut" value={lot.status || 'En cours'} />
          </View>
          {lot.notes ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Notes qualité</Text>
              <Text style={styles.notes}>{lot.notes}</Text>
            </>
          ) : null}
        </Card>

        {Array.isArray(lot.photos) && lot.photos.length > 0 ? (
          <Card>
            <Text style={styles.sectionTitle}>Photos ({lot.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {lot.photos.map((uri: string, i: number) => (
                  <Image key={i} source={{ uri }} style={styles.photo} contentFit="cover" />
                ))}
              </View>
            </ScrollView>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Historique</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            {history.map((h: any, i: number) => (
              <View key={i} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineDot,
                    h.done && { backgroundColor: Palette.green700 },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineLabel, h.done && { color: Palette.ink }]}>
                    {h.label}
                  </Text>
                  {h.at ? (
                    <Text style={styles.timelineTime}>
                      {new Date(h.at).toLocaleString('fr-FR')}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {canEdit ? (
          <>
            <Text style={[styles.sectionTitle, { marginHorizontal: 4 }]}>Changer le statut</Text>
            <View style={styles.statusGrid}>
              {LOT_STATUSES.filter((s) => s !== lot.status).map((s) => (
                <Pressable
                  key={s}
                  onPress={() =>
                    Alert.alert('Confirmer', `Passer le lot en "${s}" ?`, [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Confirmer', onPress: () => changeStatus(s) },
                    ])
                  }
                  style={styles.statusBtn}>
                  <Text style={styles.statusBtnText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ref: { fontSize: 18, fontWeight: '900', color: Palette.ink },
  sub: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  qrBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrap: { alignItems: 'center', gap: 10, marginTop: 14 },
  qrBox: {
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  qrHint: { color: Palette.muted, fontSize: 12, textAlign: 'center' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: {
    flexBasis: '48%',
    backgroundColor: Palette.wash,
    padding: 10,
    borderRadius: Radius.sm,
  },
  fieldLabel: { fontSize: 10, color: Palette.muted, fontWeight: '800', textTransform: 'uppercase' },
  fieldValue: { fontSize: 14, fontWeight: '800', color: Palette.ink, marginTop: 4 },
  notes: { color: Palette.ink2, fontSize: 13, lineHeight: 19 },
  photo: { width: 120, height: 120, borderRadius: Radius.md },
  timelineRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.line,
    marginTop: 4,
  },
  timelineLabel: { color: Palette.muted, fontWeight: '800', fontSize: 13 },
  timelineTime: { color: Palette.muted, fontSize: 11, marginTop: 2 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Palette.lineStrong,
    borderRadius: Radius.pill,
  },
  statusBtnText: { color: Palette.ink, fontWeight: '800', fontSize: 13 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  notFoundTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
});
