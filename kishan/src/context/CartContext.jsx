import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext({ count: 0, refresh: () => {} });
export const useCart = () => useContext(CartContext);

// navbar Cart badge (unpaid orders ki ginti)
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return setCount(0);
    try {
      setCount((await api.get('/orders/cart/count')).data.count);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({ count, refresh }), [count, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
