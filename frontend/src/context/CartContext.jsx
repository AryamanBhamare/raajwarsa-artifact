import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'raajwarasa_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items.filter((i) => i && i.artifact && i.qty > 0);
      }
    }
  } catch {
    return [];
  }
  return [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const addItem = (artifact, qty = 1) => {
    if (!artifact?.saleAvailable || !artifact?.price) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.artifact.id === artifact.id);
      if (existing) {
        return prev.map((i) =>
          i.artifact.id === artifact.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i
        );
      }
      return [...prev, { artifact: { id: artifact.id, name: artifact.name, slug: artifact.slug, price: artifact.price, url: artifact.images?.[0]?.url || null }, qty }];
    });
  };

  const setQty = (id, qty) => {
    setItems((prev) =>
      qty < 1
        ? prev.filter((i) => i.artifact.id !== id)
        : prev.map((i) => (i.artifact.id === id ? { ...i, qty: Math.min(99, qty) } : i))
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.artifact.id !== id));

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}