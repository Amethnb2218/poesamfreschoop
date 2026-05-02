import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function NotificationsScreen() {
  const { user, store, mutateStore, refresh, loading } = useSession();

  const notifications = useMemo(() => {
    if (!user) return [];
    return (store.notifications || [])
      .filter((n: any) => {
        // Compat site (recipientId) + mobile (userId)
        const target = n.recipientId || n.userId;
        if (target && target !== user.id) {
          // Si ciblé sur quelqu'un d'autre, on ne montre pas
          // (sauf si on est dans les recipientRoles)
          const roleMatch =
            (n.recipientRole && n.recipientRole === user.role) ||
            (Array.isArray(n.recipientRoles) && n.recipientRoles.includes(user.role));
          return roleMatch;
        }
        if (target === user.id) return true;
        // Pas de cible : diffusion rôle ou globale
        return (
          !n.recipientRole ||
          n.recipientRole === user.role ||
          (Array.isArray(n.recipientRoles) && n.recipientRoles.includes(user.role))
        );
      })
      // Dédoublonnage : certaines notifs identiques sont créées 2x (site + sync)
      .filter((n: any, i, arr) => {
        const key = `${n.title || ''}|${n.body || ''}|${(n.createdAt || '').slice(0, 19)}`;
        return arr.findIndex((x: any) => `${x.title || ''}|${x.body || ''}|${(x.createdAt || '').slice(0, 19)}` === key) === i;
      })
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [store.notifications, user]);

  // Une notif est considérée lue si read===true OU readAt non vide (format site)
  const isRead = (n: any) => n.read === true || !!n.readAt;
  const unreadCount = notifications.filter((n: any) => !isRead(n)).length;

  async function markAllRead() {
    const ids = notifications.filter((n: any) => !isRead(n)).map((n: any) => n.id);
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    await mutateStore((store) => ({
      ...store,
      notifications: (store.notifications || []).map((n: any) =>
        ids.includes(n.id) ? { ...n, read: true, readAt: now } : n,
      ),
    }));
  }

  async function onTap(notif: any) {
    if (!isRead(notif)) {
      const now = new Date().toISOString();
      await mutateStore((store) => ({
        ...store,
        notifications: (store.notifications || []).map((n: any) =>
          n.id === notif.id ? { ...n, read: true, readAt: now } : n,
        ),
      }));
    }
    if (notif.orderId) {
      router.push({ pathname: '/order/[id]', params: { id: notif.orderId } });
    } else if (notif.productId) {
      router.push({ pathname: '/product/[id]', params: { id: notif.productId } });
    } else if (notif.type === 'message' && notif.fromId) {
      router.push({ pathname: '/messages/[id]', params: { id: notif.fromId } });
    } else if (notif.type === 'anti-waste') {
      router.push('/more/antigaspi');
    } else if (notif.path === '/marche') {
      router.push('/(tabs)/market');
    } else if (notif.path === '/messages') {
      router.push('/messages/' as any);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} style={styles.markAll} hitSlop={8}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n: any, i) => String(n.id || i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color={Palette.muted} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
              Vous serez prévenu ici en cas de commande, message ou alerte anti-gaspi.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const icon = iconFor(item);
          const tint = tintFor(item);
          return (
            <Pressable onPress={() => onTap(item)} style={[styles.row, !isRead(item) && styles.rowUnread]}>
              <View style={[styles.icon, { backgroundColor: `${tint}1A` }]}>
                <Ionicons name={icon} size={20} color={tint} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowHead}>
                  <Text style={[styles.notifTitle, !isRead(item) && { fontWeight: '900' }]} numberOfLines={1}>
                    {item.title || 'Notification'}
                  </Text>
                  {!isRead(item) ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {item.body || item.message || ''}
                </Text>
                <Text style={styles.notifTime}>{formatRelative(item.createdAt)}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function iconFor(n: any): any {
  const t = n.type || '';
  if (t.includes('order')) return 'cube-outline';
  if (t.includes('message')) return 'chatbubble-outline';
  if (t.includes('anti-waste') || t.includes('flash')) return 'flash-outline';
  if (t.includes('payment')) return 'card-outline';
  return 'notifications-outline';
}

function tintFor(n: any): string {
  const t = n.type || '';
  if (t.includes('order')) return Palette.green700;
  if (t.includes('message')) return Palette.blue700;
  if (t.includes('anti-waste') || t.includes('flash')) return Palette.coral600;
  return Palette.gold600;
}

function formatRelative(iso?: string): string {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  title: { fontSize: 20, fontWeight: '900', color: Palette.ink },
  subtitle: { color: Palette.muted, fontSize: 12, fontWeight: '700' },
  markAll: { paddingHorizontal: 12, paddingVertical: 8 },
  markAllText: { color: Palette.green850, fontWeight: '900', fontSize: 12 },
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 14,
  },
  rowUnread: { borderColor: Palette.green700, backgroundColor: Palette.green100 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { flex: 1, color: Palette.ink, fontSize: 14, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.coral600 },
  notifBody: { color: Palette.muted, fontSize: 12, marginTop: 2, lineHeight: 18 },
  notifTime: { color: Palette.muted, fontSize: 10, marginTop: 6, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    gap: 10,
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
