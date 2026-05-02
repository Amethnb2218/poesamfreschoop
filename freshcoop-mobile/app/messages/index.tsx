import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function MessagesListScreen() {
  const { user, store } = useSession();

  const threads = useMemo(() => {
    if (!user) return [];
    const messages = store.messages || [];
    const mine = messages.filter(
      (m: any) => m.fromId === user.id || m.toId === user.id,
    );
    const map = new Map<string, { otherId: string; last: any; count: number; unread: number }>();
    for (const msg of mine) {
      const otherId = msg.fromId === user.id ? msg.toId : msg.fromId;
      const entry = map.get(otherId) || { otherId, last: msg, count: 0, unread: 0 };
      entry.count += 1;
      if (!entry.last.createdAt || String(msg.createdAt) > String(entry.last.createdAt)) {
        entry.last = msg;
      }
      if (msg.toId === user.id && !msg.read) entry.unread += 1;
      map.set(otherId, entry);
    }
    return [...map.values()]
      .map((e) => ({
        ...e,
        other: (store.users || []).find((u: any) => u.id === e.otherId),
      }))
      .sort((a, b) =>
        String(b.last.createdAt || '').localeCompare(String(a.last.createdAt || '')),
      );
  }, [store, user]);

  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <FlatList
        data={threads}
        keyExtractor={(t) => t.otherId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={36} color={Palette.green700} />
              <Text style={styles.emptyTitle}>Aucune conversation</Text>
              <Text style={styles.emptyText}>
                Contactez un vendeur depuis la page d'un produit pour démarrer une discussion.
              </Text>
            </View>
          </Card>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/messages/[id]',
                params: { id: item.otherId },
              })
            }
            style={styles.row}>
            <View style={styles.avatar}>
              {item.other?.avatar ? (
                <Image
                  source={{ uri: item.other.avatar }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {String(item.other?.name || '?').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowHead}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.other?.name || 'Utilisateur'}
                </Text>
                <Text style={styles.time}>{formatTime(item.last.createdAt)}</Text>
              </View>
              <Text
                style={[styles.preview, item.unread ? { fontWeight: '900', color: Palette.ink } : null]}
                numberOfLines={1}>
                {item.last.body || item.last.content || ''}
              </Text>
            </View>
            {item.unread > 0 ? (
              <View style={styles.unread}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </>
  );
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { fontWeight: '900', color: Palette.green850, fontSize: 16 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '900', color: Palette.ink, fontSize: 14, flex: 1, marginRight: 6 },
  time: { fontSize: 11, color: Palette.muted, fontWeight: '700' },
  preview: { color: Palette.muted, fontSize: 13, marginTop: 2 },
  unread: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: Palette.coral600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: '#ffffff', fontWeight: '900', fontSize: 11 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: {
    color: Palette.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
