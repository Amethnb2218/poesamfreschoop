import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Palette } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { getMobileTabs, isBuyerRole, MobileTab } from '@/lib/roles';

const TAB_META: Record<
  MobileTab,
  {
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconFocused: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  index: { title: 'Accueil', icon: 'home-outline', iconFocused: 'home' },
  market: { title: 'Marché', icon: 'storefront-outline', iconFocused: 'storefront' },
  cart: { title: 'Panier', icon: 'cart-outline', iconFocused: 'cart' },
  lots: { title: 'Lots', icon: 'cube-outline', iconFocused: 'cube' },
  products: { title: 'Produits', icon: 'leaf-outline', iconFocused: 'leaf' },
  operations: { title: 'Opérations', icon: 'bus-outline', iconFocused: 'bus' },
  impact: { title: 'Impact', icon: 'stats-chart-outline', iconFocused: 'stats-chart' },
  profile: { title: 'Profil', icon: 'person-outline', iconFocused: 'person' },
};

export default function TabLayout() {
  const { user, loading } = useSession();
  const { count } = useCart();

  if (loading) return null;
  if (!user) return <Redirect href="/auth" />;

  const visible = getMobileTabs(user.role);
  const showCart = visible.includes('cart');
  const showMarket = visible.includes('market');
  const showProducts = visible.includes('products');
  const showOperations = visible.includes('operations');
  const showImpact = visible.includes('impact');
  const showLots = visible.includes('lots');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.green700,
        tabBarInactiveTintColor: Palette.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingVertical: 4 },
        sceneStyle: { backgroundColor: Palette.paper },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_META.index.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.index.iconFocused : TAB_META.index.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          href: showMarket ? undefined : null,
          title: TAB_META.market.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.market.iconFocused : TAB_META.market.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: showCart ? undefined : null,
          title: isBuyerRole(user.role) ? 'Panier' : 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithBadge
              name={focused ? 'cart' : 'cart-outline'}
              color={color}
              badge={count}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: showProducts ? undefined : null,
          title: TAB_META.products.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.products.iconFocused : TAB_META.products.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lots"
        options={{
          href: showLots ? undefined : null,
          title: isBuyerRole(user.role) ? 'Stock' : TAB_META.lots.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.lots.iconFocused : TAB_META.lots.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          href: showOperations ? undefined : null,
          title: TAB_META.operations.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.operations.iconFocused : TAB_META.operations.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          href: showImpact ? undefined : null,
          title: TAB_META.impact.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.impact.iconFocused : TAB_META.impact.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_META.profile.title,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? TAB_META.profile.iconFocused : TAB_META.profile.icon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen name="hubs" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function TabIconWithBadge({
  name,
  color,
  badge,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  badge: number;
}) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={color} />
      {badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: Palette.line,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    backgroundColor: Palette.coral600,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  badgeText: { color: '#ffffff', fontWeight: '900', fontSize: 9 },
});
