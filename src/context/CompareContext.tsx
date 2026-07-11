import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import toast from 'react-hot-toast';

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  compareItems: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export const useCompare = () => useContext(CompareContext);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexgen_compare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nexgen_compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: Product) => {
    if (compareItems.length >= 4) {
      toast.error('You can only compare up to 4 laptops at a time');
      return;
    }
    if (!compareItems.find(item => item.id === product.id)) {
      setCompareItems([...compareItems, product]);
      toast.success('Added to Compare list');
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems(compareItems.filter(item => item.id !== productId));
    toast.success('Removed from Compare list');
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some(item => item.id === productId);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
