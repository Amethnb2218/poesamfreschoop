import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { roleLabel } from '@/lib/roles';

export default function UsersScreen() {
  const { store, refresh, loading } = useSession();
  const users = store.users || [];

  return (
    <>
      <Stack.Screen options={{ title: 'Utilisateurs' }} />
      <FlatList
        data={users}
        keyExtractor={(u: any, i) => String(u.id || i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={() => (
          <Text style={styles.subtitle}>
            {users.length} compte{users.length > 1 ? 's' : ''} sur la plateforme
          </Text>
        )}
        ListEmptyComponent={() => (
          <Card>
            <Text style={styles.empty}>Aucun utilisateur</Text>
          </Card>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {String(item.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name || '—'}</Text>
              <Text style={styles.meta}>{item.email}</Text>
              {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
              <View style={styles.tags}>
                <View style={[styles.tag, { backgroundColor: Palette.green100 }]}>
                  <Text style={[styles.tagText, { color: Palette.green850 }]}>
                    {roleLabel(item.role)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor:
                        item.status === 'Actif' ? Palette.green100 : Palette.coral100,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.tagText,
                      {
                        color:
                          item.status === 'Actif' ? Palette.green850 : Palette.coral600,
                      },
                    ]}>
                    {item.status || '—'}
                  </Text>
                </View>
                {item.region ? (
                  <View style={[styles.tag, { backgroundColor: Palette.wash }]}>
                    <Ionicons name="location-outline" size={10} color={Palette.muted} />
                    <Text style={[styles.tagText, { color: Palette.muted }]}>{item.region}</Text>
                  </View>
                ) : null}
              </View>
              {item.organization ? (
                <Text style={styles.orgLine}>{item.organization}</Text>
              ) : null}
            </View>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, paddingBottom: 40 },
  subtitle: { color: Palette.muted, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.blue100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Palette.blue700, fontWeight: '900', fontSize: 16 },
  name: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  meta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  tags: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '900' },
  orgLine: { color: Palette.green850, fontSize: 12, marginTop: 6, fontWeight: '800' },
  empty: { textAlign: 'center', color: Palette.muted, padding: 20 },
});
