import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'frescoop.mobile.cart.v1';

export type CartItem = {
  productId: string;
  sellerId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image?: string;
    images?: any[];
    zone?: string;
    region?: string;
    category?: string;
    ownerId?: string;
    quantity?: number;
  };
};

type CartState = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: any, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

function snapshot(product: any): CartItem['product'] {
  return {
    id: product.id,
    name: product.name || 'Produit',
    price: Number(product.price) || 0,
    unit: product.unit || 'kg',
    image: product.image,
    images: product.images,
    zone: product.zone,
    region: product.region,
    category: product.category,
    ownerId: product.ownerId,
    quantity: Number(product.quantity || product.stock || 0),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (next: CartItem[]) => {
    setItems(next);
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const add = useCallback(
    async (product: any, quantity = 1) => {
      if (!product?.id) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const existing = items.find((i) => i.productId === product.id);
      const stock = Number(product.quantity || product.stock || 0);
      const nextQty = Math.max(1, Math.min(stock || 9999, (existing?.quantity || 0) + quantity));
      if (existing) {
        await persist(
          items.map((i) => (i.productId === product.id ? { ...i, quantity: nextQty } : i)),
        );
      } else {
        await persist([
          ...items,
          {
            productId: product.id,
            sellerId: product.ownerId || '',
            quantity: nextQty,
            product: snapshot(product),
          },
        ]);
      }
    },
    [items, persist],
  );

  const update = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await persist(items.filter((i) => i.productId !== productId));
        return;
      }
      await persist(
        items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
      );
    },
    [items, persist],
  );

  const remove = useCallback(
    async (productId: string) => {
      await persist(items.filter((i) => i.productId !== productId));
    },
    [items, persist],
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    const total = items.reduce((acc, i) => acc + i.quantity * i.product.price, 0);
    return { items, count, total, add, update, remove, clear };
  }, [items, add, update, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider');
  return ctx;
}
