import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

type Props = {
  tone?: 'light' | 'dark';
};

export function NotificationBell({ tone = 'light' }: Props) {
  const { user, store } = useSession();

  const unread = useMemo(() => {
    if (!user) return 0;
    const seen = new Set<string>();
    return (store.notifications || []).filter((n: any) => {
      // non lu ?
      if (n.read === true || !!n.readAt) return false;
      // destinataire ?
      const target = n.recipientId || n.userId;
      const roleMatch =
        (n.recipientRole && n.recipientRole === user.role) ||
        (Array.isArray(n.recipientRoles) && n.recipientRoles.includes(user.role));
      const forMe = target === user.id || (!target && roleMatch) || (target && target !== user.id && roleMatch);
      if (!forMe && target !== user.id) return false;
      // dédup (site+mobile créent parfois des doublons)
      const key = `${n.title || ''}|${n.body || ''}|${(n.createdAt || '').slice(0, 19)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).length;
  }, [store.notifications, user]);

  const color = tone === 'light' ? '#ffffff' : Palette.ink;
  const bg = tone === 'light' ? 'rgba(255,255,255,0.15)' : Palette.wash;

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      style={[styles.btn, { backgroundColor: bg }]}
      hitSlop={10}>
      <Ionicons name="notifications-outline" size={20} color={color} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    backgroundColor: Palette.coral600,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.paper,
  },
  badgeText: { color: '#ffffff', fontWeight: '900', fontSize: 10 },
});
