import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getProductImage } from '@/lib/images';
import { isAdminRole, roleLabel } from '@/lib/roles';

type Result = {
  kind: 'product' | 'lot' | 'order' | 'user';
  id: string;
  title: string;
  subtitle: string;
  image?: string;
};

export default function SearchScreen() {
  const { user, store } = useSession();
  const [query, setQuery] = useState('');

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Result[] = [];

    (store.products || []).forEach((p: any) => {
      const text = `${p.name} ${p.zone || ''} ${p.category || ''}`.toLowerCase();
      if (text.includes(q)) {
        out.push({
          kind: 'product',
          id: p.id,
          title: p.name,
          subtitle: `${p.zone || ''} · ${Number(p.price || 0).toLocaleString('fr-FR')} F/${p.unit || 'kg'}`,
          image: getProductImage(p) || undefined,
        });
      }
    });

    (store.lots || []).forEach((l: any) => {
      const text = `${l.reference || ''} ${l.productName || ''} ${l.origin || ''}`.toLowerCase();
      if (text.includes(q)) {
        out.push({
          kind: 'lot',
          id: l.id,
          title: l.reference || l.id,
          subtitle: `${l.productName || 'Lot'} · ${l.weight || 0} kg`,
        });
      }
    });

    (store.orders || []).forEach((o: any) => {
      const text = `${o.id || ''} ${o.reference || ''} ${o.productSnapshot?.name || ''} ${o.buyerEmail || ''}`.toLowerCase();
      if (text.includes(q)) {
        out.push({
          kind: 'order',
          id: o.id,
          title: o.reference || o.id,
          subtitle: `${o.productSnapshot?.name || 'Commande'} · ${Number(o.totalPrice || 0).toLocaleString('fr-FR')} F`,
        });
      }
    });

    if (isAdminRole(user?.role)) {
      (store.users || []).forEach((u: any) => {
        const text = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
        if (text.includes(q)) {
          out.push({
            kind: 'user',
            id: u.id,
            title: u.name || 'Utilisateur',
            subtitle: `${u.email} · ${roleLabel(u.role)}`,
          });
        }
      });
    }

    return out.slice(0, 40);
  }, [query, store, user]);

  function openResult(r: Result) {
    if (r.kind === 'product') {
      router.push({ pathname: '/product/[id]', params: { id: r.id } });
    } else if (r.kind === 'order') {
      router.push({ pathname: '/order/[id]', params: { id: r.id } });
    } else if (r.kind === 'lot') {
      router.push({ pathname: '/lot/[id]', params: { id: r.id } } as any);
    } else if (r.kind === 'user') {
      router.push({ pathname: '/messages/[id]', params: { id: r.id } });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Palette.ink} />
        </Pressable>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Palette.muted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Produit, lot, commande, utilisateur…"
            placeholderTextColor={Palette.muted}
            style={styles.search}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={18} color={Palette.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => `${r.kind}-${r.id}`}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() =>
          query.length < 2 ? (
            <View style={styles.hint}>
              <Ionicons name="search-outline" size={40} color={Palette.muted} />
              <Text style={styles.hintTitle}>Recherche globale</Text>
              <Text style={styles.hintText}>
                Tapez au moins 2 caractères pour chercher dans les produits, lots,
                commandes{isAdminRole(user?.role) ? ' et utilisateurs' : ''}.
              </Text>
            </View>
          ) : (
            <View style={styles.hint}>
              <Ionicons name="sad-outline" size={40} color={Palette.muted} />
              <Text style={styles.hintTitle}>Aucun résultat</Text>
              <Text style={styles.hintText}>
                Aucune correspondance trouvée pour "{query}".
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openResult(item)} style={styles.row}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Ionicons name={kindIcon(item.kind)} size={20} color={Palette.green700} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.rowKind}>{kindLabel(item.kind)}</Text>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function kindIcon(kind: Result['kind']): any {
  if (kind === 'product') return 'leaf';
  if (kind === 'lot') return 'cube';
  if (kind === 'order') return 'receipt';
  return 'person';
}

function kindLabel(kind: Result['kind']): string {
  if (kind === 'product') return 'Produit';
  if (kind === 'lot') return 'Lot';
  if (kind === 'order') return 'Commande';
  return 'Utilisateur';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
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
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    height: 46,
  },
  search: { flex: 1, fontSize: 14, color: Palette.ink },
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.wash,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green100,
  },
  rowKind: {
    fontSize: 10,
    fontWeight: '900',
    color: Palette.green850,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rowTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginTop: 2 },
  rowSub: { fontSize: 12, color: Palette.muted, marginTop: 2 },
  hint: {
    alignItems: 'center',
    gap: 8,
    padding: 32,
    marginTop: 40,
  },
  hintTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  hintText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
