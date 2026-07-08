import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrls: string;
  stock: number;
}
interface WishlistContextType {
  items: Product[];
  isLoading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getSessionId = () => {
    let sessionId = localStorage.getItem('nexgen_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('nexgen_session_id', sessionId);
    }
    return sessionId;
  };
  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await api.get('/wishlist', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchWishlist();
  }, []);
  const toggleWishlist = async (product: Product) => {
    const exists = items.some(item => item.id === product.id);
    if (exists) {
      setItems(prev => prev.filter(item => item.id !== product.id));
      toast.success('Removed from wishlist');
    } else {
      setItems(prev => [product, ...prev]);
      toast.success('Added to wishlist');
    }
    try {
      const sessionId = getSessionId();
      await api.post('/wishlist/toggle', 
        { productId: product.id },
        { headers: { 'x-session-id': sessionId } }
      );
    } catch (error) {
      toast.error('Failed to update wishlist');
      fetchWishlist();
    }
  };
  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };
  return (
    <WishlistContext.Provider value={{ items, isLoading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
