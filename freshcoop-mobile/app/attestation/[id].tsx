import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { Button } from '@/components/Button';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { roleLabel } from '@/lib/roles';

export default function AttestationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store } = useSession();

  const attestation = useMemo(
    () => (store.attestations || []).find((a: any) => a.id === id),
    [store.attestations, id],
  );

  const beneficiary = useMemo(() => {
    if (!attestation) return null;
    return (store.users || []).find(
      (u: any) => u.id === attestation.userId || u.id === attestation.ownerId,
    );
  }, [store.users, attestation]);

  // Statistiques utilisées pour remplir l'attestation économique
  const stats = useMemo(() => {
    if (!beneficiary) return null;
    const orders = (store.orders || []).filter((o: any) => o.sellerId === beneficiary.id);
    const transactions = (store.transactions || []).filter(
      (t: any) => t.userId === beneficiary.id || t.ownerId === beneficiary.id,
    );
    const proofs = (store.proofs || []).filter(
      (p: any) => p.userId === beneficiary.id || p.ownerId === beneficiary.id,
    );
    const totalRevenue =
      orders.reduce((a: number, o: any) => a + Number(o.totalPrice || 0), 0) +
      transactions.reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
    const since = beneficiary.createdAt || new Date().toISOString();
    return {
      totalRevenue,
      orderCount: orders.length,
      proofCount: proofs.length,
      transactionCount: transactions.length,
      since,
    };
  }, [beneficiary, store.orders, store.transactions, store.proofs]);

  if (!attestation) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Attestation' }} />
        <View style={styles.notFound}>
          <Ionicons name="document-outline" size={48} color={Palette.muted} />
          <Text style={styles.notFoundTitle}>Attestation introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const ref = attestation.reference || attestation.id;
  const issuedDate = attestation.issuedAt || attestation.createdAt;
  const qrData = JSON.stringify({
    type: 'attestation',
    id: attestation.id,
    ref,
  });

  async function shareAttestation() {
    try {
      await Share.share({
        message: `🏛️ ATTESTATION FRESCOOP\n\nRéférence : ${ref}\nBénéficiaire : ${beneficiary?.name || attestation.personName}\nDate : ${new Date(issuedDate).toLocaleDateString('fr-FR')}\n\nCette attestation certifie l'activité économique du bénéficiaire sur la plateforme FresCoop. Vérification : frescoop.sn/verify/${ref}`,
      });
    } catch {}
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <Text style={styles.topTitle}>Attestation officielle</Text>
        <Pressable onPress={shareAttestation} style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="share-outline" size={22} color={Palette.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Document stylé — fond blanc, bordures, QR code */}
        <View style={styles.document}>
          <LinearGradient
            colors={[Palette.green950, Palette.green850]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.docHead}>
            <View style={styles.docLogo}>
              <Ionicons name="leaf" size={24} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docBrand}>FRESCOOP</Text>
              <Text style={styles.docBrandSub}>Plateforme commerce agricole · Sénégal</Text>
            </View>
            <View style={styles.docStamp}>
              <Ionicons name="shield-checkmark" size={14} color={Palette.gold600} />
              <Text style={styles.docStampText}>CERTIFIÉE</Text>
            </View>
          </LinearGradient>

          <View style={styles.docBody}>
            <Text style={styles.docKicker}>ATTESTATION ÉCONOMIQUE</Text>
            <Text style={styles.docTitle}>
              {attestation.title || attestation.type || 'Attestation de participation'}
            </Text>
            <Text style={styles.docRef}>Référence : {ref}</Text>

            <View style={styles.divider} />

            <Text style={styles.docIntro}>
              La plateforme FresCoop atteste que :
            </Text>

            <View style={styles.benefBox}>
              <Text style={styles.benefName}>
                {beneficiary?.name || attestation.personName || attestation.beneficiary || '—'}
              </Text>
              {beneficiary?.organization ? (
                <Text style={styles.benefOrg}>{beneficiary.organization}</Text>
              ) : null}
              <View style={styles.benefTags}>
                {beneficiary?.role ? (
                  <View style={styles.benefTag}>
                    <Text style={styles.benefTagText}>{roleLabel(beneficiary.role)}</Text>
                  </View>
                ) : null}
                {beneficiary?.region ? (
                  <View style={styles.benefTag}>
                    <Ionicons name="location-outline" size={11} color={Palette.green850} />
                    <Text style={styles.benefTagText}>{beneficiary.region}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={styles.docText}>
              est inscrit(e) sur la plateforme FresCoop depuis le{' '}
              <Text style={styles.bold}>
                {stats?.since
                  ? new Date(stats.since).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </Text>{' '}
              et dispose d'une activité économique vérifiée par la plateforme.
            </Text>

            {stats && stats.totalRevenue > 0 ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.docSection}>Activité économique vérifiée</Text>
                <View style={styles.statsGrid}>
                  <Stat label="Volume de transactions" value={`${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`} />
                  <Stat label="Commandes honorées" value={String(stats.orderCount)} />
                  <Stat label="Preuves économiques" value={String(stats.proofCount)} />
                  <Stat label="Transactions tracées" value={String(stats.transactionCount)} />
                </View>
              </>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.docSection}>Usage autorisé</Text>
            <Text style={styles.docText}>
              Ce document peut être présenté à des banques, SFD, mutuelles ou partenaires
              financiers dans le cadre d'une demande de crédit, d'un dossier administratif
              ou d'un appel à projets.
            </Text>

            <View style={styles.footerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docSignLabel}>Émise le</Text>
                <Text style={styles.docSignValue}>
                  {new Date(issuedDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <View style={{ height: 10 }} />
                <Text style={styles.docSignLabel}>Signature</Text>
                <View style={styles.signature}>
                  <Text style={styles.signatureText}>FresCoop Certification</Text>
                </View>
              </View>

              <View style={styles.qrBox}>
                <QRCode value={qrData} size={90} color={Palette.green950} backgroundColor="#ffffff" />
                <Text style={styles.qrLabel}>Scanner pour vérifier</Text>
              </View>
            </View>
          </View>

          <View style={styles.docFoot}>
            <Ionicons name="shield-checkmark" size={12} color={Palette.green850} />
            <Text style={styles.docFootText}>
              Document sécurisé · frescoop.sn/verify/{ref}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 14 }}>
          <Button
            label="Partager l'attestation"
            size="lg"
            leading={<Ionicons name="share-outline" size={18} color="#ffffff" />}
            onPress={shareAttestation}
          />
          <Button
            label="Retour"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  topBar: {
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
  topTitle: { fontSize: 15, fontWeight: '900', color: Palette.ink },
  scroll: { padding: 16, paddingBottom: 40 },
  document: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.line,
    ...Shadows.lg,
  },
  docHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  docLogo: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBrand: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  docBrandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700' },
  docStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(217,153,18,0.25)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Palette.gold600,
  },
  docStampText: {
    color: Palette.gold600,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  docBody: { padding: 22, gap: 12 },
  docKicker: {
    color: Palette.gold600,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  docTitle: {
    color: Palette.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  docRef: { color: Palette.muted, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  divider: {
    height: 1,
    backgroundColor: Palette.line,
    marginVertical: 4,
  },
  docIntro: { color: Palette.ink2, fontSize: 14, lineHeight: 20 },
  benefBox: {
    backgroundColor: Palette.green100,
    borderRadius: Radius.md,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Palette.green700,
  },
  benefName: { fontSize: 20, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },
  benefOrg: { fontSize: 13, color: Palette.green850, fontWeight: '800', marginTop: 2 },
  benefTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  benefTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Palette.green700,
  },
  benefTagText: { color: Palette.green850, fontSize: 11, fontWeight: '900' },
  docText: { color: Palette.ink2, fontSize: 13, lineHeight: 20 },
  bold: { fontWeight: '900', color: Palette.ink },
  docSection: {
    fontSize: 12,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flexBasis: '48%',
    backgroundColor: Palette.wash,
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  statLabel: {
    fontSize: 10,
    color: Palette.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginTop: 4 },
  footerRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  docSignLabel: {
    fontSize: 10,
    color: Palette.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docSignValue: { fontSize: 13, fontWeight: '800', color: Palette.ink, marginTop: 4 },
  signature: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
    justifyContent: 'center',
    marginTop: 4,
  },
  signatureText: {
    fontStyle: 'italic',
    color: Palette.green850,
    fontWeight: '900',
    fontSize: 13,
  },
  qrBox: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  qrLabel: {
    fontSize: 9,
    color: Palette.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  docFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.wash,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  docFootText: {
    color: Palette.green850,
    fontSize: 11,
    fontWeight: '800',
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  notFoundTitle: { fontSize: 18, fontWeight: '900', color: Palette.ink },
});
