import { useState, useEffect } from 'react';
import React from 'react';
import api from '../services/api';
import { 
  Laptop,
  Monitor,
  Printer,
  Layers,
  Smartphone,
  Keyboard,
  Power
} from 'lucide-react';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  children: CategoryNode[];
  icon?: React.ReactNode;
}

const getIconForSlug = (slug: string) => {
  switch (slug) {
    case 'laptops': return <Laptop className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'desktops': return <Monitor className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'monitors': return <Monitor className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'pc-accessories': return <Keyboard className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'mobiles': return <Smartphone className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'printers': return <Printer className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'ups': return <Power className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    case 'all-in-ones': return <Layers className="h-5 w-5 text-[#F59E0B] shrink-0" />;
    default: return undefined;
  }
};

const mapCategoryNodes = (categories: any[]): CategoryNode[] => {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    parentId: cat.parentId,
    icon: getIconForSlug(cat.slug),
    children: cat.children ? mapCategoryNodes(cat.children) : []
  }));
};

let cachedCategories: CategoryNode[] | null = null;
let fetchPromise: Promise<CategoryNode[]> | null = null;

export const useCategories = (forceRefetch = false) => {
  const [categories, setCategories] = useState<CategoryNode[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories || forceRefetch);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const mapped = mapCategoryNodes(res.data);
      cachedCategories = mapped;
      setCategories(mapped);
      setLoading(false);
      return mapped;
    } catch (err) {
      console.error(err);
      fetchPromise = null;
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (forceRefetch || !cachedCategories) {
      if (!fetchPromise || forceRefetch) {
        fetchPromise = fetchCategories();
      }
      fetchPromise.then(mapped => setCategories(mapped));
    } else {
      setCategories(cachedCategories);
      setLoading(false);
    }
  }, [forceRefetch]);

  return { categories, loading, refetch: fetchCategories };
};
