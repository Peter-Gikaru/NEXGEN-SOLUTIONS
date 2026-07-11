import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/getImageUrl';

interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

export const RecentlyViewed: React.FC = () => {
  const [products, setProducts] = useState<ViewedProduct[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadProducts = () => {
      // Check if functional cookies are allowed (default to true if no consent yet)
      const consentStr = localStorage.getItem('nexgen_cookie_consent');
      if (consentStr) {
        try {
          const consent = JSON.parse(consentStr);
          if (consent.functional === false) {
            setProducts([]);
            return;
          }
        } catch (e) {}
      }

      const storageKey = user ? `recentlyViewed_${user.id}` : 'recentlyViewed_guest';
      const rvStr = localStorage.getItem(storageKey);
      if (rvStr) {
        try {
          const parsed = JSON.parse(rvStr);
          // Filter out stale or invalid products
          const validProducts = parsed.filter((p: any) => p && p.id && p.name && p.price);
          setProducts(validProducts);
          
          // If we filtered out bad data, clean up local storage
          if (validProducts.length !== parsed.length) {
            localStorage.setItem(storageKey, JSON.stringify(validProducts));
          }
        } catch (e) {
          console.error('Failed to parse recently viewed', e);
        }
      }
    };

    loadProducts();

    // Listen for cookie consent changes
    const handleConsentUpdate = () => loadProducts();
    window.addEventListener('cookie_consent_updated', handleConsentUpdate);
    
    return () => window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
  }, [user]);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white border border-gray-200 rounded-xl p-6 mt-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-[#F59E0B]" />
        <h2 className="text-2xl font-bold text-[#1a1a2e]">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="group block border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-[150px] p-4 bg-slate-50 flex items-center justify-center">
              {product.image ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-semibold text-[#1a1a2e] text-sm line-clamp-2 mb-1 group-hover:text-[#F59E0B] transition-colors">
                {product.name}
              </h3>
              <p className="text-[#F59E0B] font-bold text-sm">
                KES {product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
