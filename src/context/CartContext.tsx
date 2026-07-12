import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '../types';
import { useAuth } from './AuthContext';
import api from '../services/api';

export interface CartItem {
  product: Product;
  quantity: number;
  backendItemId?: string;
  variant?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
}

const CART_STORAGE_KEY = 'nexgen_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const hasSynced = useRef(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const fetchCart = useCallback(async () => {
    try {
      const response = await api.get('/cart');
      const backendItems = response.data.items.map((item: any) => {
        let finalPrice = item.product.price;
        if (item.variant && item.product.variants) {
          const parsedVariants = typeof item.product.variants === 'string' ? JSON.parse(item.product.variants) : item.product.variants;
          const matchedVariant = parsedVariants.find((v: any) => v.name === item.variant);
          if (matchedVariant) {
            finalPrice += (matchedVariant.priceOffset || 0);
          }
        }

        return {
          product: {
            id: item.product.id,
            title: item.product.name,
            category: item.product.category?.name || 'Laptops',
            brand: item.product.brand,
            price: finalPrice,
          originalPrice: item.product.compareAtPrice || item.product.price,
          rating: item.product.rating || 5,
          reviewCount: item.product.reviewCount || 0,
          image: item.product.imageUrls?.[0] || '',
          discount: item.product.compareAtPrice
            ? Math.round(((item.product.compareAtPrice - item.product.price) / item.product.compareAtPrice) * 100)
            : 0,
          stockStatus: 'in_stock',
          stockCount: item.product.stock,
          isVerified: true,
          description: item.product.description || '',
        },
        quantity: item.quantity,
        backendItemId: item.id,
        variant: item.variant,
      };
      });
      setCartItems(backendItems);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      const syncCart = async () => {
        try {
          const storedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (storedCart) {
            const guestItems = JSON.parse(storedCart);
            if (guestItems.length > 0) {
              for (const item of guestItems) {
                await api.post('/cart', {
                  productId: item.product.id,
                  quantity: item.quantity,
                });
              }
              localStorage.removeItem(CART_STORAGE_KEY);
            }
          }
          await fetchCart();
        } catch (err) {
          console.error('Cart sync failed:', err);
          await fetchCart();
        }
      };
      syncCart();
    } else if (!isAuthenticated) {
      hasSynced.current = false;
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
      }
    }
  }, [isAuthenticated, isAuthLoading, fetchCart]);

  const addToCart = useCallback(
    async (product: Product, quantity: number = 1, variant?: string) => {
      if (isAuthenticated) {
        try {
          await api.post('/cart', { productId: product.id, quantity, variant });
          await fetchCart();
          addToast(`${product.title.split(' - ')[0]} added to cart!`);
        } catch (err) {
          console.error(err);
          addToast('Failed to add item to cart');
        }
      } else {
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.product.id === product.id && item.variant === variant);
          let updated: CartItem[];
          if (existingItem) {
            updated = prevItems.map((item) =>
              item.product.id === product.id && item.variant === variant
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            updated = [...prevItems, { product, quantity, variant }];
          }
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        addToast(`${product.title.split(' - ')[0]} added to cart!`);
      }
    },
    [isAuthenticated, fetchCart, addToast]
  );

  const removeFromCart = useCallback(
    async (productId: string, variant?: string) => {
      const itemToRemove = cartItems.find((item) => item.product.id === productId && item.variant === variant);
      if (isAuthenticated) {
        try {
          if (itemToRemove?.backendItemId) {
            await api.delete(`/cart/${itemToRemove.backendItemId}`);
            await fetchCart();
          }
          if (itemToRemove) {
            addToast(`${itemToRemove.product.title.split(' - ')[0]} removed from cart.`);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setCartItems((prevItems) => {
          const updated = prevItems.filter((item) => !(item.product.id === productId && item.variant === variant));
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        if (itemToRemove) {
          addToast(`${itemToRemove.product.title.split(' - ')[0]} removed from cart.`);
        }
      }
    },
    [isAuthenticated, cartItems, fetchCart, addToast]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variant?: string) => {
      if (quantity <= 0) {
        await removeFromCart(productId, variant);
        return;
      }

      const itemToUpdate = cartItems.find((item) => item.product.id === productId && item.variant === variant);
      if (isAuthenticated) {
        try {
          if (itemToUpdate?.backendItemId) {
            await api.put(`/cart/${itemToUpdate.backendItemId}`, { quantity });
            await fetchCart();
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setCartItems((prevItems) => {
          const updated = prevItems.map((item) =>
            item.product.id === productId && item.variant === variant ? { ...item, quantity } : item
          );
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    },
    [isAuthenticated, cartItems, removeFromCart, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        await fetchCart();
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    addToast('Shopping cart cleared.');
  }, [isAuthenticated, fetchCart, addToast]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
