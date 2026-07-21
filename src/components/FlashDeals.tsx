import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ProductCard } from './ProductCard';
import { CountdownTimer } from './CountdownTimer';

export const FlashDeals: React.FC = () => {
  const [flashProducts, setFlashProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await api.get('/flash');
        if (response.data && response.data.length > 0) {
          const mapped = response.data.map((sale: any) => ({
            id: sale.product.slug,
            image: sale.product.imageUrls[0] || '',
            title: sale.product.name,
            price: sale.salePrice,
            originalPrice: sale.product.price,
            rating: 4.8,
            reviewCount: 95,
            discount: Math.round(((sale.product.price - sale.salePrice) / sale.product.price) * 100),
            stockStatus: sale.product.stock > 5 ? 'in_stock' : sale.product.stock > 0 ? 'low_stock' : 'out_of_stock',
            stockCount: sale.product.stock,
            isVerified: true
          }));
          setFlashProducts(mapped);
        } else {
          const responseProducts = await api.get('/products', { params: { limit: 12 } });
          const productsWithDiscount = responseProducts.data.products
            .filter((p: any) => p.compareAtPrice && p.compareAtPrice > p.price)
            .map((p: any) => ({
              id: p.slug,
              image: p.imageUrls[0] || '',
              title: p.name,
              price: p.price,
              originalPrice: p.compareAtPrice,
              rating: p.rating || 5.0,
              reviewCount: p.reviewCount || 0,
              discount: Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100),
              stockStatus: p.stock > 5 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
              stockCount: p.stock,
              isVerified: true
            }));
          setFlashProducts(productsWithDiscount);
        }
      } catch (err) {
        console.error('Failed to fetch flash sales:', err);
      }
    };
    fetchFlashSales();
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <div className="w-full bg-[#1a1a2e] text-white border border-gray-800 rounded p-6 shadow-sm select-none">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 mb-6 gap-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-semibold font-sans text-[#F59E0B] flex items-center gap-1 tracking-tight">
            ⚡ FLASH SALE
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[16px] text-gray-300 font-semibold font-sans">Ending In:</span>
          <CountdownTimer variant="light" />
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {flashProducts.map((product) => (
          <div 
            key={product.id} 
            className="w-[240px] md:w-[280px] shrink-0 snap-start bg-white rounded overflow-hidden"
          >
            <ProductCard
              id={product.id}
              image={product.image}
              hoverImage={product.hoverImage}
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

    </div>
  );
};
export default FlashDeals;
