import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
interface ProductGridProps {
  products: Product[];
  onShopNowClick?: (category: string, brand: string, search: string) => void;
}
export const ProductGrid: React.FC<ProductGridProps> = ({ products, onShopNowClick }) => {
  const navigate = useNavigate();
  const showcases = [
    { 
      id: 'hp', 
      title: 'HP Laptops', 
      filter: (p: Product) => p.category === 'Laptops' && p.brand === 'HP', 
      targetCategory: 'Laptops', 
      targetBrand: 'HP' 
    },
    { 
      id: 'dell', 
      title: 'Dell Laptops', 
      filter: (p: Product) => p.category === 'Laptops' && p.brand === 'Dell', 
      targetCategory: 'Laptops', 
      targetBrand: 'Dell' 
    },
    { 
      id: 'lenovo', 
      title: 'Lenovo Laptops', 
      filter: (p: Product) => p.category === 'Laptops' && p.brand === 'Lenovo', 
      targetCategory: 'Laptops', 
      targetBrand: 'Lenovo' 
    },
    { 
      id: 'apple', 
      title: 'Apple MacBooks', 
      filter: (p: Product) => p.category === 'Laptops' && p.brand === 'Apple', 
      targetCategory: 'Laptops', 
      targetBrand: 'Apple' 
    },
    { 
      id: 'bags', 
      title: 'Laptop Bags & Sleeves', 
      filter: (p: Product) => p.category === 'PC Components & Accessories' && (p.title.toLowerCase().includes('bag') || p.title.toLowerCase().includes('backpack') || p.title.toLowerCase().includes('sleeve')), 
      targetCategory: 'PC Components & Accessories', 
      targetSearch: 'Bag' 
    },
    { 
      id: 'desktops', 
      title: 'Desktops & All-in-Ones', 
      filter: (p: Product) => p.category === 'Desktops' || p.category === 'All-in-Ones', 
      targetCategory: 'Desktops', 
      targetSearch: '' 
    },
    { 
      id: 'accessories', 
      title: 'Computer Accessories', 
      filter: (p: Product) => p.category === 'PC Components & Accessories', 
      targetCategory: 'PC Components & Accessories',
      targetSearch: ''
    },
    { 
      id: 'mobiles', 
      title: 'Mobiles & Tablets', 
      filter: (p: Product) => p.category === 'Mobile & Tablets', 
      targetCategory: 'Mobile & Tablets', 
      targetSearch: '' 
    },
    { 
      id: 'monitors', 
      title: 'Premium Monitors', 
      filter: (p: Product) => p.category === 'Monitors', 
      targetCategory: 'Monitors', 
      targetSearch: '' 
    },
    { 
      id: 'printers', 
      title: 'Printers, Scanners & Copiers', 
      filter: (p: Product) => p.category === 'Printers & Scanners', 
      targetCategory: 'Printers & Scanners', 
      targetSearch: '' 
    },
    { 
      id: 'ups', 
      title: 'UPS & Power Backups', 
      filter: (p: Product) => p.category === 'UPS & Power Backups', 
      targetCategory: 'UPS & Power Backups', 
      targetSearch: '' 
    }
  ];
  const handleShopNow = (showcase: typeof showcases[number]) => {
    if (onShopNowClick) {
      onShopNowClick(showcase.targetCategory, showcase.targetBrand || '', showcase.targetSearch || '');
    } else {
      let url = `/products?category=${encodeURIComponent(showcase.targetCategory)}`;
      if (showcase.targetBrand) url += `&brand=${encodeURIComponent(showcase.targetBrand)}`;
      if (showcase.targetSearch) url += `&search=${encodeURIComponent(showcase.targetSearch)}`;
      navigate(url);
    }
  };
  return (
    <div className="w-full flex flex-col gap-8">
      {showcases.map((showcase) => {
        const filteredProducts = products.filter(showcase.filter).slice(0, 4);
        if (filteredProducts.length === 0) return null;
        return (
          <div 
            key={showcase.id} 
            className="w-full bg-white border border-gray-200 rounded p-6 shadow-sm select-none"
          >
            {}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-3 text-left">
              <div>
                <h3 className="text-3xl font-semibold text-[#1a1a2e] font-sans leading-none tracking-tight uppercase">
                  {showcase.title}
                </h3>
              </div>
              <button
                onClick={() => handleShopNow(showcase)}
                className="bg-secondary text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-semibold text-[16px] px-6 py-2.5 rounded transition-all duration-150 cursor-pointer self-start sm:self-center shadow-sm"
              >
                SHOP NOW
              </button>
            </div>
            {}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ProductGrid;
