import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ListScreen, listStyles } from '@/components/ListScreen';
import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function PaymentScreen() {
  const { user, store } = useSession();
  const payments = useMemo(() => {
    const list = store.paymentRecords || store.transactions || [];
    if (!user) return list;
    return list.filter(
      (p: any) =>
        p.userId === user.id ||
        p.ownerId === user.id ||
        p.payerId === user.id ||
        (p.email && String(p.email).toLowerCase() === user.email.toLowerCase()),
    );
  }, [store, user]);

  return (
    <ListScreen
      title="Paiement"
      subtitle={`${payments.length} paiement${payments.length > 1 ? 's' : ''}`}
      data={payments}
      emptyIcon="card-outline"
      emptyTitle="Aucun paiement"
      emptyText="Vos paiements et reçus apparaîtront ici après confirmation."
      renderItem={(item) => {
        const ok = String(item.status || '').toLowerCase().includes('pay') ||
          String(item.status || '').toLowerCase().includes('complet');
        return (
          <View style={listStyles.row}>
            <View
              style={[
                listStyles.iconBox,
                { backgroundColor: ok ? Palette.green100 : Palette.gold100 },
              ]}>
              <Ionicons
                name={ok ? 'checkmark-circle' : 'time-outline'}
                size={22}
                color={ok ? Palette.green700 : Palette.gold600}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={listStyles.name}>{item.reference || item.label || 'Paiement'}</Text>
              <Text style={listStyles.meta}>
                {item.method || item.paymentMethod || 'Mobile money'} ·{' '}
                {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}
              </Text>
            </View>
            <Text style={listStyles.amount}>
              {Number(item.amount || 0).toLocaleString('fr-FR')} F
            </Text>
          </View>
        );
      }}
    />
  );
}
