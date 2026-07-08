import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import api from '../services/api';
export const RecentlyViewed: React.FC = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const loadRecentProducts = async () => {
    try {
      const recent = localStorage.getItem('recently_viewed_laptops');
      if (recent) {
        const ids: string[] = JSON.parse(recent);
        if (ids.length > 0) {
          const response = await api.get('/products', { params: { limit: 100 } });
          const allProducts = response.data.products.map((p: any) => ({
            id: p.slug,
            image: p.imageUrls[0] || '',
            title: p.name,
            price: p.price,
            originalPrice: p.compareAtPrice || p.price,
            rating: p.rating || 5.0,
            reviewCount: p.reviewCount || 0,
            discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
            stockStatus: p.stock > 5 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
            stockCount: p.stock,
            isVerified: true
          }));
          const products = ids
            .map(id => allProducts.find((p: any) => p.id === id))
            .filter((p): p is Product => p !== undefined);
          setRecentProducts(products);
        }
      }
    } catch (e) {
      console.error('Failed to load recently viewed laptops', e);
    }
  };
  useEffect(() => {
    loadRecentProducts();
    window.addEventListener('recentlyViewedUpdated', loadRecentProducts);
    return () => {
      window.removeEventListener('recentlyViewedUpdated', loadRecentProducts);
    };
  }, []);
  if (recentProducts.length < 2) return null;
  return (
    <section className="mb-6 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b border-light-gray pb-2.5 mb-4 select-none">
        <h2 className="text-sm font-black text-secondary uppercase">
          Recently Viewed Laptops
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 -mx-4 px-4 md:mx-0 md:px-0">
        {recentProducts.slice(0, 4).map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard
              id={product.id}
              image={product.image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              discount={product.discount}
              stockStatus={product.stockStatus}
              stockCount={product.stockCount}
              isVerified={product.isVerified}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
