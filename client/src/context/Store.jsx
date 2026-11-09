import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const load = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works for this session */
  }
};

export const MAX_QTY = 8;
export const sizeLabel = (s) => `${s.diameter}x${s.width} ET${s.offset} · ${s.pcd}`;
const lineId = (slug, color, s) => `${slug}|${color}|${s.diameter}x${s.width}|${s.pcd}|${s.offset}`;

// v2 cart lines carry the full size (diameter, width, PCD, offset) so two sizes that
// share diameter x width but differ in bolt pattern can never merge into one line.
const isValidLine = (l) =>
  l && typeof l.id === 'string' && l.size && Number.isFinite(l.qty) && l.qty >= 1 && Number.isFinite(l.price);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('rims_cart_v2', []).filter(isValidLine));
  const [wishlist, setWishlist] = useState(() => load('rims_wishlist', []));
  const [vehicle, setVehicleState] = useState(() => load('rims_vehicle', null));

  useEffect(() => { save('rims_cart_v2', cart); }, [cart]);
  useEffect(() => { save('rims_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { save('rims_vehicle', vehicle); }, [vehicle]);

  const addToCart = useCallback((product, color, size, qty = 1) => {
    const id = lineId(product.slug, color.name, size);
    const cap = Math.max(1, Math.min(MAX_QTY, size.stock ?? MAX_QTY));
    setCart((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(l.cap, l.qty + qty) } : l));
      return [
        ...prev,
        {
          id, slug: product.slug, name: product.name, brand: product.brand, style: product.style,
          price: product.price, color: { name: color.name, hex: color.hex },
          size: { diameter: size.diameter, width: size.width, pcd: size.pcd, offset: size.offset, centerBore: size.centerBore },
          cap, qty: Math.min(cap, qty),
        },
      ];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    const q = Math.floor(Number(qty));
    if (!Number.isFinite(q)) return;
    setCart((prev) =>
      q < 1 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty: Math.min(l.cap, q) } : l))
    );
  }, []);

  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((l) => l.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) =>
      prev.some((p) => p.slug === product.slug)
        ? prev.filter((p) => p.slug !== product.slug)
        : [
            ...prev,
            {
              slug: product.slug, name: product.name, brand: product.brand, style: product.style,
              price: product.price, colors: product.colors, sizes: product.sizes,
            },
          ]
    );
  }, []);

  // vehicle = { fitmentKey, trimIndex, make, model, label, color } | { unverified: true, make, model, label, color }
  const setVehicle = useCallback((v) => setVehicleState(v), []);
  const clearVehicle = useCallback(() => setVehicleState(null), []);

  const value = useMemo(() => {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
    return {
      cart, wishlist, vehicle, count, subtotal, total: subtotal,
      maxQty: MAX_QTY,
      addToCart, setQty, removeFromCart, clearCart, toggleWishlist, setVehicle, clearVehicle,
      inWishlist: (slug) => wishlist.some((p) => p.slug === slug),
    };
  }, [cart, wishlist, vehicle, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, setVehicle, clearVehicle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
