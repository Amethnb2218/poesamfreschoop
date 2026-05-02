import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { api, EMPTY_STORE, hashPassword, loadApiOverride, Store } from '@/lib/api';
import { flushOutbox } from '@/lib/outbox';
import { pushLocalNotification, setupNotifications } from '@/lib/notifications';
import { readCachedStore, writeCachedStore } from '@/lib/offline';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  organization?: string;
  region?: string;
  bio?: string;
  avatar?: string;
  passwordHash?: string;
  createdAt?: string;
};

type SessionState = {
  loading: boolean;
  user: User | null;
  store: Store;
  online: boolean;
  cachedAt: number;
  lastSyncAt: number;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<User>;
  mutateStore: (mutate: (store: Store) => Store) => Promise<Store>;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  organization?: string;
  region?: string;
};

const SESSION_KEY = 'frescoop.mobile.session.v1';
const POLL_INTERVAL_MS = 4000;

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store>(EMPTY_STORE);
  const [online, setOnline] = useState(true);
  const [cachedAt, setCachedAt] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // snapshot des IDs pour détecter les nouveautés à chaque sync
  const seenRef = useRef<{
    orders: Set<string>;
    products: Set<string>;
    notifications: Set<string>;
    messages: Set<string>;
  }>({
    orders: new Set(),
    products: new Set(),
    notifications: new Set(),
    messages: new Set(),
  });
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const applyStore = useCallback((fresh: Store, { notify }: { notify: boolean }) => {
    if (notify) {
      emitNotifications(fresh, seenRef.current, userRef.current);
    }
    seenRef.current = {
      orders: new Set((fresh.orders || []).map((o: any) => String(o.id))),
      products: new Set((fresh.products || []).map((p: any) => String(p.id))),
      notifications: new Set((fresh.notifications || []).map((n: any) => String(n.id))),
      messages: new Set((fresh.messages || []).map((m: any) => String(m.id))),
    };
    setStore(fresh);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const fresh = await api.getStore();
      applyStore(fresh, { notify: seenRef.current.orders.size > 0 });
      setError(null);
      setLastSyncAt(Date.now());
      await writeCachedStore(fresh);
      setCachedAt(Date.now());

      // Déconnexion forcée si le compte courant vient d'être suspendu par l'admin
      const me = userRef.current;
      if (me) {
        const current = (fresh.users || []).find((u: any) => u.id === me.id);
        if (current) {
          const s = String(current.status || 'Actif').toLowerCase();
          if (s === 'suspendu' || s === 'inactif' || s === 'bloque' || s === 'bloqué') {
            await AsyncStorage.removeItem(SESSION_KEY);
            setUser(null);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Connexion API impossible');
    }
  }, [applyStore]);

  // Bootstrap: charger session + cache avant d'essayer l'API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadApiOverride();
      await setupNotifications();
      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);
        if (!cancelled && saved) setUser(JSON.parse(saved));
      } catch {}
      const cached = await readCachedStore();
      if (!cancelled && cached) {
        applyStore(cached.store, { notify: false });
        setCachedAt(cached.cachedAt);
      }
      try {
        const fresh = await api.getStore();
        if (!cancelled) {
          applyStore(fresh, { notify: false });
          await writeCachedStore(fresh);
          setCachedAt(Date.now());
          setLastSyncAt(Date.now());
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'API injoignable — mode hors-ligne');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyStore]);

  // Écoute NetInfo pour refléter l'état de connexion
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const next = !!state.isConnected && state.isInternetReachable !== false;
      setOnline((prev) => {
        if (prev === false && next === true) {
          flushOutbox().then(() => refresh()).catch(() => refresh());
        }
        return next;
      });
    });
    return unsub;
  }, [refresh]);

  // Polling quand en ligne + app active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    function start() {
      if (interval || !online) return;
      interval = setInterval(() => {
        refresh();
      }, POLL_INTERVAL_MS);
    }
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
    start();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [online, refresh]);

  const persistUser = useCallback(async (value: User | null) => {
    setUser(value);
    if (value) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(value));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      // Essaie d'abord en ligne pour avoir le store le plus frais
      let source: Store = store;
      try {
        source = await api.getStore();
        applyStore(source, { notify: false });
        await writeCachedStore(source);
      } catch {
        // en mode hors-ligne, on tente avec le cache
        const cached = await readCachedStore();
        if (cached) source = cached.store;
      }
      const target = source.users.find(
        (u: any) => String(u?.email || '').trim().toLowerCase() === email.trim().toLowerCase(),
      );
      if (!target) throw new Error('Aucun compte avec cet e-mail');
      const hash = await hashPassword(password);
      if (hash !== target.passwordHash) throw new Error('Mot de passe incorrect');
      // Refus de connexion si le compte est suspendu / inactif
      const status = String(target.status || 'Actif').toLowerCase();
      if (status === 'suspendu' || status === 'inactif' || status === 'bloque' || status === 'bloqué') {
        throw new Error('Votre compte est suspendu. Contactez un administrateur.');
      }
      const sessionUser: User = {
        id: target.id,
        name: target.name,
        email: target.email,
        phone: target.phone,
        role: target.role,
        status: target.status,
        organization: target.organization,
        region: target.region,
        bio: target.bio,
        createdAt: target.createdAt,
      };
      await persistUser(sessionUser);
      return sessionUser;
    },
    [applyStore, persistUser, store],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      const fresh = await api.getStore();
      const normalized = input.email.trim().toLowerCase();
      if (fresh.users.some((u: any) => String(u?.email || '').toLowerCase() === normalized)) {
        throw new Error('Un compte existe déjà avec cet e-mail');
      }
      const hash = await hashPassword(input.password);
      const now = new Date().toISOString();
      const newUser = {
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone || '',
        role: input.role,
        status: 'Actif',
        organization: input.organization || '',
        region: input.region || '',
        bio: '',
        passwordHash: hash,
      };
      const updated = { ...fresh, users: [...fresh.users, newUser] };
      await api.putStore(updated);
      applyStore(updated, { notify: false });
      await writeCachedStore(updated);
      const sessionUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        organization: newUser.organization,
        region: newUser.region,
        bio: newUser.bio,
        createdAt: newUser.createdAt,
      };
      await persistUser(sessionUser);
      return sessionUser;
    },
    [applyStore, persistUser],
  );

  const logout = useCallback(async () => {
    await persistUser(null);
  }, [persistUser]);

  const mutateStore = useCallback(
    async (mutate: (store: Store) => Store): Promise<Store> => {
      // Lit le store à jour pour éviter d'écraser des modifs concurrentes
      const fresh = await api.getStore();
      const next = mutate(fresh);
      await api.putStore(next);
      applyStore(next, { notify: false });
      await writeCachedStore(next);
      setLastSyncAt(Date.now());
      setCachedAt(Date.now());
      return next;
    },
    [applyStore],
  );

  const updateUser = useCallback(
    async (patch: Partial<User>): Promise<User> => {
      if (!userRef.current) throw new Error('Aucune session active');
      const fresh = await api.getStore();
      const next = {
        ...fresh,
        users: (fresh.users || []).map((u: any) =>
          u.id === userRef.current!.id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u,
        ),
      };
      await api.putStore(next);
      applyStore(next, { notify: false });
      await writeCachedStore(next);
      const nextUser: User = { ...userRef.current, ...patch };
      await persistUser(nextUser);
      return nextUser;
    },
    [applyStore, persistUser],
  );

  const value = useMemo<SessionState>(
    () => ({
      loading,
      user,
      store,
      online,
      cachedAt,
      lastSyncAt,
      error,
      refresh,
      login,
      register,
      logout,
      updateUser,
      mutateStore,
    }),
    [loading, user, store, online, cachedAt, lastSyncAt, error, refresh, login, register, logout, updateUser, mutateStore],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function emitNotifications(
  fresh: Store,
  seen: {
    orders: Set<string>;
    products: Set<string>;
    notifications: Set<string>;
    messages: Set<string>;
  },
  currentUser: User | null,
) {
  if (!currentUser) return;

  const newOrders = (fresh.orders || []).filter((o: any) => !seen.orders.has(String(o.id)));
  const newNotifications = (fresh.notifications || []).filter(
    (n: any) => !seen.notifications.has(String(n.id)),
  );
  const newMessages = (fresh.messages || []).filter(
    (m: any) => !seen.messages.has(String(m.id)),
  );

  // Anti-spam : un seul push par (titre + body + jour) pour éviter les répétitions
  const pushedKeys = new Set<string>();
  const tryPush = (title: string, body: string, data: Record<string, unknown>) => {
    const key = `${title}|${body}`;
    if (pushedKeys.has(key)) return;
    pushedKeys.add(key);
    pushLocalNotification({ title, body, data });
  };

  // Nouvelle commande : notifier SEULEMENT si l'user est concerné (vendeur/agent/admin)
  const isAdmin = currentUser.role === 'admin';
  for (const order of newOrders.slice(0, 3)) {
    const concerned =
      order.sellerId === currentUser.id ||
      order.assignedAgentId === currentUser.id ||
      order.userId === currentUser.id ||
      order.clientId === currentUser.id ||
      isAdmin;
    if (!concerned) continue;
    const amount = Number(order.totalPrice || order.total || order.amount || 0);
    const clientLabel =
      order.customer?.name || order.buyerName || order.buyerEmail || 'Un client';
    tryPush(
      order.sellerId === currentUser.id ? 'Nouvelle commande reçue' : 'Nouvelle commande',
      `${clientLabel} · ${amount.toLocaleString('fr-FR')} FCFA`,
      { type: 'order', id: order.id },
    );
  }

  // Notifications broadcast créées côté site ou mobile
  for (const notif of newNotifications.slice(0, 5)) {
    const target = notif.recipientId || notif.userId;
    const roleMatch =
      (notif.recipientRole && notif.recipientRole === currentUser.role) ||
      (Array.isArray(notif.recipientRoles) && notif.recipientRoles.includes(currentUser.role));
    const forMe = target === currentUser.id || (!target && roleMatch);
    if (!forMe) continue;
    tryPush(
      notif.title || 'Notification FresCoop',
      notif.body || notif.message || '',
      { type: 'notification', id: notif.id },
    );
  }

  // Messages reçus
  for (const msg of newMessages.slice(0, 3)) {
    const target = msg.toUserId || msg.toId;
    if (target && target !== currentUser.id) continue;
    if (!target) continue;
    tryPush(
      `Message de ${msg.fromName || 'FresCoop'}`,
      msg.body || msg.content || '',
      { type: 'message', id: msg.id },
    );
  }
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession doit être utilisé dans un SessionProvider');
  return ctx;
}
