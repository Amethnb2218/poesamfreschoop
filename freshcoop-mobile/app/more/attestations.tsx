import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ListScreen, listStyles } from '@/components/ListScreen';
import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isAdminRole, isPartnerRole } from '@/lib/roles';

export default function AttestationsScreen() {
  const { user, store } = useSession();
  const attestations = useMemo(() => {
    const list = store.attestations || [];
    if (!user) return list;
    // Admin et partenaire finance voient toutes les attestations (utile pour
    // vérifier les dossiers de crédit et présenter des exemples au jury).
    if (isAdminRole(user.role) || isPartnerRole(user.role)) return list;
    // Les autres voient les leurs
    return list.filter((a: any) => a.ownerId === user.id || a.userId === user.id);
  }, [store.attestations, user]);

  return (
    <ListScreen
      title="Attestations"
      subtitle={`${attestations.length} attestation${attestations.length > 1 ? 's' : ''} · Touchez pour voir le format officiel`}
      data={attestations}
      emptyIcon="ribbon-outline"
      emptyTitle="Aucune attestation"
      emptyText="Vos attestations apparaîtront ici après validation d'un dossier. En démo, chargez les données pour voir des exemples."
      renderItem={(item) => (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/attestation/[id]', params: { id: item.id } })
          }>
          <View style={listStyles.row}>
            <View style={[listStyles.iconBox, { backgroundColor: Palette.gold100 }]}>
              <Ionicons name="ribbon" size={20} color={Palette.gold600} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={listStyles.name}>{item.title || item.type || 'Attestation'}</Text>
              <Text style={listStyles.meta}>
                {item.personName || item.beneficiary || '—'} ·{' '}
                {item.issuedAt
                  ? new Date(item.issuedAt).toLocaleDateString('fr-FR')
                  : 'émise'}
              </Text>
              <Text style={[listStyles.meta, { marginTop: 4, fontStyle: 'italic' }]}>
                Réf. {item.reference || item.id}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle" size={22} color={Palette.green700} />
              <Ionicons name="chevron-forward" size={16} color={Palette.muted} />
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}
