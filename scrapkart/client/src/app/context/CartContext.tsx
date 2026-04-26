import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface CartItem {
  partId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  inStock: boolean;
  availableQuantity?: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem, quantity?: number) => void;
  updateItemQuantity: (partId: string, quantity: number) => void;
  removeFromCart: (partId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'car-scrap-cart';

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((cartItem) => cartItem.partId === item.partId);
      const available = item.availableQuantity ?? item.quantity;
      if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (available !== undefined && nextQuantity > available) {
          return current.map((cartItem) =>
            cartItem.partId === item.partId
              ? { ...cartItem, quantity: available }
              : cartItem
          );
        }
        return current.map((cartItem) =>
          cartItem.partId === item.partId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }

      return [...current, { ...item, quantity: Math.min(quantity, available ?? quantity) }];
    });
  };

  const updateItemQuantity = (partId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.partId !== partId) {
            return item;
          }

          const nextQuantity = Math.max(1, quantity);
          const maxQuantity = item.availableQuantity ?? item.quantity;
          return { ...item, quantity: Math.min(nextQuantity, maxQuantity) };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (partId: string) => {
    setItems((current) => current.filter((item) => item.partId !== partId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    cartCount,
    cartTotal,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
