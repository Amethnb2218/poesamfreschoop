import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Palette, Radius, Shadows } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

type ListScreenProps = {
  title: string;
  subtitle?: string;
  data: any[];
  emptyIcon: React.ComponentProps<typeof Ionicons>['name'];
  emptyTitle: string;
  emptyText: string;
  renderItem: (item: any) => React.ReactNode;
  header?: React.ReactNode;
  onAdd?: () => void;
};

export function ListScreen({
  title,
  subtitle,
  data,
  emptyIcon,
  emptyTitle,
  emptyText,
  renderItem,
  header,
  onAdd,
}: ListScreenProps) {
  const { refresh, loading } = useSession();
  return (
    <>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={data}
        keyExtractor={(it, i) => String(it?.id || i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Palette.green700} />
        }
        ListHeaderComponent={() =>
          subtitle || header ? (
            <View style={{ marginBottom: 14 }}>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
              {header}
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Card>
            <View style={styles.empty}>
              <Ionicons name={emptyIcon} size={36} color={Palette.green700} />
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          </Card>
        )}
        renderItem={({ item }) => <>{renderItem(item)}</>}
      />
      {onAdd ? (
        <Pressable onPress={onAdd} style={listFabStyle.fab} hitSlop={8}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      ) : null}
    </>
  );
}

const listFabStyle = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.green700,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});

export const listStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 14, fontWeight: '900', color: Palette.ink },
  meta: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '900', color: Palette.green850 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
});

const styles = StyleSheet.create({
  list: { padding: 20, paddingBottom: 40 },
  subtitle: { color: Palette.muted, fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  emptyTitle: { fontWeight: '900', color: Palette.ink, fontSize: 15 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
