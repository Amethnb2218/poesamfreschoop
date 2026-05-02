import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

type DialogTone = 'success' | 'warning' | 'danger' | 'info';

type DialogAction = {
  label: string;
  tone?: 'primary' | 'secondary' | 'danger';
  onPress?: () => void | Promise<void>;
};

type DialogOptions = {
  title: string;
  body?: string;
  tone?: DialogTone;
  actions?: DialogAction[];
};

type DialogContextType = {
  show: (options: DialogOptions) => void;
  confirm: (opts: {
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
    destructive?: boolean;
  }) => Promise<boolean>;
  toast: (body: string, tone?: DialogTone) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const show = useCallback((opts: DialogOptions) => setOptions(opts), []);

  const confirm = useCallback(
    ({
      title,
      body,
      confirmLabel = 'Confirmer',
      cancelLabel = 'Annuler',
      tone = 'info',
      destructive = false,
    }: {
      title: string;
      body?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      tone?: DialogTone;
      destructive?: boolean;
    }) =>
      new Promise<boolean>((resolve) => {
        setOptions({
          title,
          body,
          tone,
          actions: [
            {
              label: cancelLabel,
              tone: 'secondary',
              onPress: () => resolve(false),
            },
            {
              label: confirmLabel,
              tone: destructive ? 'danger' : 'primary',
              onPress: () => resolve(true),
            },
          ],
        });
      }),
    [],
  );

  const toast = useCallback(
    (body: string, tone: DialogTone = 'success') => {
      setOptions({
        title:
          tone === 'success'
            ? 'Succès'
            : tone === 'warning'
            ? 'Attention'
            : tone === 'danger'
            ? 'Erreur'
            : 'Info',
        body,
        tone,
        actions: [{ label: 'OK', tone: 'primary' }],
      });
    },
    [],
  );

  const close = useCallback(() => setOptions(null), []);

  const value = useMemo(() => ({ show, confirm, toast }), [show, confirm, toast]);

  const tone = options?.tone || 'info';
  const toneConfig = {
    success: { color: Palette.green700, bg: Palette.green100, icon: 'checkmark-circle' as const },
    warning: { color: Palette.gold600, bg: Palette.gold100, icon: 'warning' as const },
    danger: { color: Palette.coral600, bg: Palette.coral100, icon: 'alert-circle' as const },
    info: { color: Palette.blue700, bg: Palette.blue100, icon: 'information-circle' as const },
  }[tone];

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal
        transparent
        visible={!!options}
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={[styles.iconWrap, { backgroundColor: toneConfig.bg }]}>
              <Ionicons name={toneConfig.icon} size={30} color={toneConfig.color} />
            </View>
            <Text style={styles.title}>{options?.title}</Text>
            {options?.body ? <Text style={styles.body}>{options.body}</Text> : null}

            <View style={styles.actions}>
              {(options?.actions || [{ label: 'OK', tone: 'primary' }]).map((action, i) => {
                const isPrimary = action.tone === 'primary' || (!action.tone && i === 0);
                const isDanger = action.tone === 'danger';
                const backgroundColor = isDanger
                  ? Palette.coral600
                  : isPrimary
                  ? Palette.green700
                  : '#ffffff';
                const color = isDanger || isPrimary ? '#ffffff' : Palette.ink;
                const borderWidth = !isPrimary && !isDanger ? 1.5 : 0;
                return (
                  <Pressable
                    key={i}
                    onPress={async () => {
                      close();
                      try {
                        await action.onPress?.();
                      } catch {}
                    }}
                    style={[
                      styles.btn,
                      {
                        backgroundColor,
                        borderWidth,
                        borderColor: Palette.lineStrong,
                      },
                    ]}>
                    <Text style={[styles.btnText, { color }]}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextType {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog doit être utilisé dans un DialogProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 20, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    ...Shadows.lg,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: Palette.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    color: Palette.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  btnText: { fontWeight: '900', fontSize: 14, letterSpacing: 0.2 },
});
