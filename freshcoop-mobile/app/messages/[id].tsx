import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function ThreadScreen() {
  const { id: otherId } = useLocalSearchParams<{ id: string }>();
  const { user, store, mutateStore } = useSession();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const other = useMemo(
    () => (store.users || []).find((u: any) => u.id === otherId),
    [store.users, otherId],
  );

  const messages = useMemo(() => {
    if (!user) return [];
    return (store.messages || [])
      .filter(
        (m: any) =>
          (m.fromId === user.id && m.toId === otherId) ||
          (m.fromId === otherId && m.toId === user.id),
      )
      .sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }, [store.messages, user, otherId]);

  // Marquer comme lus les messages reçus
  useEffect(() => {
    if (!user) return;
    const unreadIds = messages
      .filter((m: any) => m.toId === user.id && !m.read)
      .map((m: any) => m.id);
    if (unreadIds.length === 0) return;
    mutateStore((store) => ({
      ...store,
      messages: (store.messages || []).map((m: any) =>
        unreadIds.includes(m.id) ? { ...m, read: true } : m,
      ),
    })).catch(() => {});
  }, [messages, user, mutateStore]);

  async function send() {
    if (!user || !draft.trim() || !otherId) return;
    const body = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const now = new Date().toISOString();
      await mutateStore((store) => ({
        ...store,
        messages: [
          ...(store.messages || []),
          {
            id: `msg-${Date.now().toString(36)}`,
            createdAt: now,
            fromId: user.id,
            fromName: user.name,
            toId: otherId,
            toUserId: otherId,
            body,
            content: body,
            read: false,
          },
        ],
        notifications: [
          {
            id: `notif-msg-${Date.now().toString(36)}`,
            createdAt: now,
            userId: otherId,
            title: `Message de ${user.name}`,
            body,
            path: '/messages',
            type: 'message',
            read: false,
          },
          ...(store.notifications || []),
        ],
      }));
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: other?.name || 'Conversation' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m: any, i) => String(m.id || i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.fromId === user?.id;
            return (
              <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, mine && { color: '#ffffff' }]}>
                    {item.body || item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, mine && { color: 'rgba(255,255,255,0.6)' }]}>
                    {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={Palette.muted}
            style={styles.input}
            multiline
          />
          <Pressable onPress={send} disabled={!draft.trim() || sending} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  list: { padding: 16, gap: 6 },
  bubbleRow: { flexDirection: 'row', marginBottom: 2 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  bubbleOther: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: Palette.line },
  bubbleMine: { backgroundColor: Palette.green700 },
  bubbleText: { color: Palette.ink, fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: Palette.muted, marginTop: 4, textAlign: 'right' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  input: {
    flex: 1,
    backgroundColor: Palette.wash,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.ink,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
