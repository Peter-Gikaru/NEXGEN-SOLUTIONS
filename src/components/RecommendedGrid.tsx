import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ProductCard } from './ProductCard';
export const RecommendedGrid: React.FC = () => {
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/products', { params: { limit: 8 } });
        const mapped = response.data.products.map((p: any) => ({
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
        setRecommendedProducts(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecommendations();
  }, []);
  if (recommendedProducts.length === 0) return null;
  return (
    <section className="mb-6 text-left">
      <div className="flex items-center justify-between border-b border-light-gray pb-2.5 mb-4 select-none">
        <h2 className="text-sm font-black text-secondary uppercase">
          Top Picks For You
        </h2>
      </div>
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 -mx-4 px-4 md:mx-0 md:px-0">
        {recommendedProducts.map((product) => (
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
                  warranty={product.warranty}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

