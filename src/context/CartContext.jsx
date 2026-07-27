import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      if (res.data.success) {
        setCartItems(res.data.data.items || []);
        setCartCount(res.data.data.itemCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  }, [user]);

  // Refetch cart whenever user logs in or out
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartCount = useCallback((count) => {
    setCartCount(count);
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const isVariantInCart = useCallback((variantId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => item.variantId === variantId);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, updateCartCount, refreshCart, isVariantInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
