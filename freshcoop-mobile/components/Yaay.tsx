import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import { answer as yaayAnswer, suggestions as yaaySuggestions } from '@/lib/yaayBrain';

type Lang = 'fr' | 'wo' | 'pul' | 'sr';

type Msg = { from: 'bot' | 'user'; text: string; at: number };

const LANG_LABELS: Record<Lang, string> = {
  fr: 'Français',
  wo: 'Wolof',
  pul: 'Pulaar',
  sr: 'Sérère',
};

function greeting(firstName: string, lang: Lang): string {
  const map: Record<Lang, string> = {
    fr: `Bonjour ${firstName} 👋\n\nJe suis FresCoop AI. Je connais tout sur les prix, les ventes, la bancabilité, l'anti-gaspi, les lots, les hubs solaires, les attestations, le paiement et l'USSD.\n\nPosez-moi votre question !`,
    wo: `Salamaleekum ${firstName} 👋\n\nMaa ngi tudd FresCoop AI. Xamal naa lépp ci njëg, jaay, bancabilité, anti-gaspi, suivi, paiement. Laaj ma !`,
    pul: `Mbaa kaa ${firstName} 👋\n\nKo miin woni FresCoop AI. Mi anndi kala ko faati e coggu, njeeygol, tokkoral, anti-gaspi, njoɓdi. Naamno mi !`,
    sr: `Nafio ${firstName} 👋\n\nMi tedd FresCoop AI. Pendol ma !`,
  };
  return map[lang];
}

export function Yaay() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('fr');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const firstName = session.user?.name?.split(' ')[0] || '';

  const ctx = useMemo(
    () => ({
      lang,
      user: session.user
        ? {
            id: session.user.id,
            name: session.user.name,
            role: session.user.role,
            region: session.user.region,
            organization: session.user.organization,
          }
        : null,
      store: session.store,
    }),
    [lang, session.user, session.store],
  );

  const quickSuggestions = useMemo(() => yaaySuggestions(ctx).slice(0, 4), [ctx]);

  useEffect(() => {
    if (!open) return;
    // on initialise avec un message d'accueil au premier open
    if (messages.length === 0) {
      setMessages([{ from: 'bot', text: greeting(firstName, lang), at: Date.now() }]);
    }
  }, [open, lang, firstName, messages.length]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Msg = { from: 'user', text: content, at: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);

    const stats = {
      producers: (session.store.users || []).filter(
        (u: any) => u.role === 'agriculteur' && u.status === 'Actif',
      ).length,
      products: session.store.products?.length || 0,
      orders: session.store.orders?.length || 0,
      lots: session.store.lots?.length || 0,
      hubs: session.store.hubs?.length || 0,
      transactions: session.store.transactions?.length || 0,
    };

    const history = messages.slice(-6).map((m) => ({ from: m.from, text: m.text }));

    let reply: string;
    try {
      // Essaie d'abord l'IA via le serveur proxy OpenRouter
      const res = await api.yaayChat({
        message: content,
        lang,
        context: {
          stats,
          userRole: session.user?.role,
          userName: session.user?.name,
        },
        history,
      });
      if (res.ok && res.answer) {
        reply = res.answer;
      } else {
        reply = yaayAnswer(content, ctx);
      }
    } catch {
      // Fallback sur le cerveau local si offline / erreur serveur
      reply = yaayAnswer(content, ctx);
    }

    setMessages((prev) => [...prev, { from: 'bot', text: reply, at: Date.now() }]);
    setTyping(false);
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
  }

  function clearChat() {
    setMessages([{ from: 'bot', text: greeting(firstName, lang), at: Date.now() }]);
  }

  if (!session.user) return null;

  return (
    <>
      {!open ? (
        <Pressable onPress={() => setOpen(true)} style={styles.fab} hitSlop={6}>
          <LinearGradient
            colors={[Palette.green700, Palette.green850]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}>
            <Ionicons name="chatbubbles" size={22} color="#ffffff" />
          </LinearGradient>
        </Pressable>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.panel}>
            <LinearGradient
              colors={[Palette.green950, Palette.green850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}>
              <View style={styles.headerBrand}>
                <View style={styles.headerIcon}>
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>FresCoop AI</Text>
                  <Text style={styles.headerSub}>
                    Assistant intelligent · {typing ? 'écrit...' : 'en ligne'}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable onPress={clearChat} style={styles.iconSmall} hitSlop={8}>
                  <Ionicons name="refresh" size={16} color="#ffffff" />
                </Pressable>
                <Pressable onPress={() => setOpen(false)} style={styles.closeBtn} hitSlop={10}>
                  <Ionicons name="close" size={20} color="#ffffff" />
                </Pressable>
              </View>
            </LinearGradient>

            <View style={styles.langs}>
              {(Object.keys(LANG_LABELS) as Lang[]).map((code) => (
                <Pressable
                  key={code}
                  onPress={() => {
                    setLang(code);
                    setMessages([{ from: 'bot', text: greeting(firstName, code), at: Date.now() }]);
                  }}
                  style={[styles.langChip, lang === code && styles.langChipActive]}>
                  <Text style={[styles.langText, lang === code && { color: '#ffffff' }]}>
                    {LANG_LABELS[code]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
              renderItem={({ item }) => (
                <View style={[styles.bubbleRow, item.from === 'user' && styles.bubbleRowMine]}>
                  {item.from === 'bot' ? (
                    <View style={styles.botAvatar}>
                      <Ionicons name="sparkles" size={12} color="#ffffff" />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.bubble,
                      item.from === 'user' ? styles.bubbleMine : styles.bubbleBot,
                    ]}>
                    <Text style={[styles.bubbleText, item.from === 'user' && { color: '#ffffff' }]}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              )}
              ListFooterComponent={
                typing ? (
                  <View style={styles.bubbleRow}>
                    <View style={styles.botAvatar}>
                      <Ionicons name="sparkles" size={12} color="#ffffff" />
                    </View>
                    <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 14 }]}>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        <View style={styles.typingDot} />
                        <View style={[styles.typingDot, { opacity: 0.6 }]} />
                        <View style={[styles.typingDot, { opacity: 0.3 }]} />
                      </View>
                    </View>
                  </View>
                ) : null
              }
            />

            {messages.length <= 2 ? (
              <View style={styles.suggestions}>
                {quickSuggestions.map((q) => (
                  <Pressable key={q} onPress={() => send(q)} style={styles.suggestion}>
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {q}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.composer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={
                  lang === 'fr'
                    ? 'Posez votre question…'
                    : lang === 'wo'
                    ? 'Laaj ma…'
                    : lang === 'pul'
                    ? 'Naamno mi…'
                    : 'Penden mi…'
                }
                placeholderTextColor={Palette.muted}
                style={styles.input}
                onSubmitEditing={() => send()}
                returnKeyType="send"
                multiline
              />
              <Pressable
                onPress={() => send()}
                disabled={!input.trim()}
                style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}>
                <Ionicons name="arrow-up" size={18} color="#ffffff" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 16,
    bottom: 86,
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  fabInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
  iconSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.wash,
    borderRadius: 999,
  },
  langChipActive: { backgroundColor: Palette.green700 },
  langText: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  messages: { padding: 16, gap: 8 },
  bubbleRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  bubbleBot: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderTopLeftRadius: 4,
  },
  bubbleMine: { backgroundColor: Palette.green700, borderTopRightRadius: 4 },
  bubbleText: { color: Palette.ink, fontSize: 14, lineHeight: 20 },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.muted,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    paddingTop: 10,
  },
  suggestion: {
    backgroundColor: Palette.green100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Palette.green700,
    maxWidth: '100%',
  },
  suggestionText: { fontSize: 12, fontWeight: '800', color: Palette.green850 },
  composer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Palette.wash,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.ink,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
