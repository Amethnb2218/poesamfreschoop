import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { askAdvisor } from '@/lib/agro';

type Lang = 'fr' | 'wo' | 'pu' | 'sr';

type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  source?: 'llm' | 'offline';
};

let messageSeq = 0;
function newMessage(from: Message['from'], text: string, source?: Message['source']): Message {
  messageSeq += 1;
  return { id: `m${messageSeq}`, from, text, source };
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'wo', label: 'Wolof' },
  { code: 'pu', label: 'Pulaar' },
  { code: 'sr', label: 'Sérère' },
];

const WELCOME: Record<Lang, string> = {
  fr: "Bonjour, je suis votre conseiller agronomique FresCoop. Posez-moi vos questions sur les cultures, les semis, les sols, les engrais, les ravageurs ou le calendrier cultural.",
  wo: 'Salamaleekum, maa ngi tudd conseiller agronomique FresCoop. Laaj ma ci mbey mi, tool bi, fetal walla nawet bi.',
  pu: 'Jam waali, ko miin woni conseiller agronomique FresCoop. Naamno mi ko faati e gese, remooɓe, lewru walla coggu.',
  sr: 'Nafio, mi tedd conseiller agronomique FresCoop. Penden mi ke tool, mbey ole nawet.',
};

const SUGGESTIONS: Record<Lang, string[]> = {
  fr: [
    "Quand semer l'arachide à Kaolack ?",
    'Quel engrais pour le mil sur sol dior ?',
    'Comment traiter les pucerons de la tomate ?',
    'Quelle variété de riz pour la vallée du fleuve ?',
  ],
  wo: ['Kañ lañu jëmbët gerte ci Kaolack ?', 'Ban fetal la war ci dugub ?', 'Nan lañu faj tamaat yi ?'],
  pu: ['Nde woni sahaa aawugol gerte ?', 'Ko honɗum fetal wonande gawri ?', 'Noy safrata tomate ?'],
  sr: ['Nafio, le ma ŋ tool a ?', 'Ke fetal a noong ?'],
};

const COVERAGE = [
  { icon: 'calendar-outline', title: 'Calendrier cultural', body: 'Dates de semis par zone, cycles variétaux, échelonnement des parcelles.' },
  { icon: 'flask-outline', title: 'Fertilisation', body: 'Doses NPK et urée par culture, fumure organique, prix des intrants.' },
  { icon: 'bug-outline', title: 'Protection des cultures', body: 'Lutte biologique (neem, savon noir, Bt), identification des ravageurs.' },
  { icon: 'layers-outline', title: 'Sols et rotations', body: 'Dior, deck, hollaldé, ferralitique : cultures adaptées et amendements.' },
  { icon: 'partly-sunny-outline', title: 'Adaptation climatique', body: 'Variétés à cycle court, zaï et demi-lunes, agroforesterie.' },
  { icon: 'business-outline', title: 'Financement', body: 'La Banque Agricole, DER, SFD et score de bancabilité FresCoop.' },
] as const;

export default function ConseillerScreen() {
  const { user } = useSession();
  const [lang, setLang] = useState<Lang>('fr');
  const [messages, setMessages] = useState<Message[]>([newMessage('bot', WELCOME.fr)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Tant que la conversation n'a pas démarré, changer de langue réécrit l'accueil.
  useEffect(() => {
    setMessages((prev) => (prev.length > 1 ? prev : [newMessage('bot', WELCOME[lang])]));
  }, [lang]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages, loading]);

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const history = messages.slice(-6).map((m) => ({ from: m.from, text: m.text }));
      setMessages((prev) => [...prev, newMessage('user', content)]);
      setInput('');
      setLoading(true);

      try {
        const reply = await askAdvisor({
          message: content,
          language: lang,
          context: {
            userName: user?.name,
            userRole: user?.role,
            region: user?.region,
          },
          history,
        });
        setMessages((prev) => [...prev, newMessage('bot', reply.answer, reply.source)]);
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          newMessage(
            'bot',
            e?.message ||
              'Je ne peux pas répondre pour le moment. Réessayez dans un instant — vos questions précédentes restent affichées.',
          ),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, lang, loading, messages, user],
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Conseiller' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}>
        <View style={styles.langBar}>
          {LANGS.map((l) => (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              style={[styles.langChip, lang === l.code && styles.langChipActive]}>
              <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.thread}>
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={m.from === 'user' ? styles.textUser : styles.textBot}>{m.text}</Text>
              {m.source === 'offline' && (
                <Text style={styles.sourceNote}>Réponse du moteur local (modèle indisponible)</Text>
              )}
            </View>
          ))}

          {loading && (
            <View style={[styles.bubble, styles.bubbleBot, styles.typing]}>
              <ActivityIndicator size="small" color={Palette.green700} />
              <Text style={styles.typingText}>Le conseiller réfléchit…</Text>
            </View>
          )}

          {messages.length <= 1 && (
            <View style={styles.coverage}>
              <Text style={styles.coverageTitle}>Ce que le conseiller couvre</Text>
              {COVERAGE.map((c) => (
                <View key={c.title} style={styles.coverageRow}>
                  <View style={styles.coverageIcon}>
                    <Ionicons
                      name={c.icon as React.ComponentProps<typeof Ionicons>['name']}
                      size={15}
                      color={Palette.green700}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coverageName}>{c.title}</Text>
                    <Text style={styles.coverageBody}>{c.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}>
          {(SUGGESTIONS[lang] || SUGGESTIONS.fr).map((s) => (
            <Pressable
              key={s}
              style={styles.suggestion}
              onPress={() => send(s)}
              disabled={loading}>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={
              lang === 'fr' ? 'Ex : quel engrais pour le maïs ?' : 'Laaj ma…'
            }
            placeholderTextColor={Palette.muted}
            multiline
            onSubmitEditing={() => send()}
            editable={!loading}
          />
          <Pressable
            style={[styles.sendBtn, (loading || !input.trim()) && styles.sendBtnOff]}
            onPress={() => send()}
            disabled={loading || !input.trim()}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.paper },

  langBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.wash,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  langChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langChipActive: { backgroundColor: Palette.green700, borderColor: Palette.green850 },
  langText: { fontSize: 11, fontWeight: '900', color: Palette.muted },
  langTextActive: { color: '#ffffff' },

  thread: { padding: 16, gap: 10, paddingBottom: 20 },
  bubble: { padding: 12, borderRadius: Radius.lg, maxWidth: '88%' },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: Palette.green700,
    borderTopRightRadius: 4,
  },
  textBot: { color: Palette.ink, fontSize: 13, lineHeight: 19 },
  textUser: { color: '#ffffff', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  sourceNote: { color: Palette.muted, fontSize: 10, fontWeight: '800', marginTop: 6 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { color: Palette.muted, fontSize: 12, fontWeight: '800' },

  coverage: {
    marginTop: 8,
    padding: 14,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    gap: 12,
  },
  coverageTitle: { fontSize: 13, fontWeight: '900', color: Palette.ink },
  coverageRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  coverageIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverageName: { fontSize: 12, fontWeight: '900', color: Palette.ink },
  coverageBody: { fontSize: 11, color: Palette.muted, lineHeight: 15, marginTop: 1 },

  suggestions: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  suggestion: {
    backgroundColor: Palette.green100,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  suggestionText: { fontSize: 11, fontWeight: '800', color: Palette.green850 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    backgroundColor: Palette.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: Palette.ink,
    backgroundColor: Palette.paper,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { opacity: 0.45 },
});
