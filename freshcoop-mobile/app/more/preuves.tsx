import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ListScreen, listStyles } from '@/components/ListScreen';
import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isAdminRole } from '@/lib/roles';

export default function PreuvesScreen() {
  const { user, store } = useSession();
  const proofs = useMemo(() => {
    const list = store.proofs || [];
    if (!user) return list;
    if (isAdminRole(user.role)) return list;
    return list.filter((p: any) => p.ownerId === user.id || p.userId === user.id);
  }, [store.proofs, user]);

  return (
    <ListScreen
      title="Preuves économiques"
      subtitle={`${proofs.length} preuve${proofs.length > 1 ? 's' : ''}`}
      data={proofs}
      emptyIcon="receipt-outline"
      emptyTitle="Aucune preuve"
      emptyText="Enregistrez vos transactions pour bâtir votre profil économique."
      onAdd={() => router.push({ pathname: '/new/[type]', params: { type: 'proof' } })}
      renderItem={(item) => (
        <View style={listStyles.row}>
          <View style={[listStyles.iconBox, { backgroundColor: Palette.green100 }]}>
            <Ionicons name="receipt" size={20} color={Palette.green700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={listStyles.name}>{item.label || item.type || 'Preuve'}</Text>
            <Text style={listStyles.meta}>
              {item.paymentMethod || '—'} ·{' '}
              {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
          <Text style={listStyles.amount}>
            {Number(item.amount || 0).toLocaleString('fr-FR')} F
          </Text>
        </View>
      )}
    />
  );
}
