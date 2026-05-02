import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ListScreen, listStyles } from '@/components/ListScreen';
import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { isAdminRole } from '@/lib/roles';

export default function DossiersScreen() {
  const { user, store } = useSession();
  const dossiers = useMemo(() => {
    const list = store.dossiers || [];
    if (!user) return list;
    if (isAdminRole(user.role)) return list;
    return list.filter(
      (d: any) => d.ownerId === user.id || d.personId === user.id || d.userId === user.id,
    );
  }, [store.dossiers, user]);

  return (
    <ListScreen
      title="Dossiers"
      subtitle={`${dossiers.length} dossier${dossiers.length > 1 ? 's' : ''}`}
      data={dossiers}
      emptyIcon="folder-open-outline"
      emptyTitle="Aucun dossier"
      emptyText="Créez votre premier dossier avec le bouton ci-dessous."
      onAdd={() => router.push({ pathname: '/new/[type]', params: { type: 'dossier' } })}
      renderItem={(item) => (
        <View style={listStyles.row}>
          <View style={[listStyles.iconBox, { backgroundColor: Palette.blue100 }]}>
            <Ionicons name="folder" size={20} color={Palette.blue700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={listStyles.name}>{item.title || item.type || 'Dossier'}</Text>
            <Text style={listStyles.meta}>
              {item.personName || '—'} · {item.organization || item.region || ''}
            </Text>
            <View style={[listStyles.badge, { backgroundColor: Palette.green100, marginTop: 6 }]}>
              <Text style={[listStyles.badgeText, { color: Palette.green850 }]}>
                {item.status || 'En cours'}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}
