import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

// Create an api instance that includes the token
const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Assuming useAuth exposes the logged-in user

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await api.get("/wishlist");
      if (res.data.success && res.data.data) {
        setWishlistItems(res.data.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId, variantId) => {
    try {
      const res = await api.post("/wishlist", { productId, variantId });
      if (res.data.success) {
        setWishlistItems(res.data.data.items);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { success: false, message: error.response?.data?.message || "Failed to add to wishlist" };
    }
  };

  const removeFromWishlist = async (productId, variantId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}/${variantId}`);
      if (res.data.success) {
        setWishlistItems(res.data.data.items);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false, message: error.response?.data?.message || "Failed to remove from wishlist" };
    }
  };

  const isInWishlist = (productId, variantId) => {
    return wishlistItems.some(
      (item) => item.productId?._id === productId && item.variantId?._id === variantId
    );
  };

  const toggleWishlist = async (productId, variantId) => {
    if (isInWishlist(productId, variantId)) {
      return await removeFromWishlist(productId, variantId);
    } else {
      return await addToWishlist(productId, variantId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
