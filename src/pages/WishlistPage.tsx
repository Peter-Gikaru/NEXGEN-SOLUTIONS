import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import toast from 'react-hot-toast';
export const WishlistPage: React.FC = () => {
  const { items, isLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/wishlist/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [items]);
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success('Added to cart');
  };
  return (
    <div className="min-h-[80vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-[#F59E0B] fill-[#F59E0B]" />
          <h1 className="text-3xl font-extrabold text-slate-900">Your Wishlist</h1>
          <span className="bg-amber-100 text-[#F59E0B] py-1 px-3 rounded-full text-sm font-bold">
            {items.length} Items
          </span>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center mb-16">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Save your favorite items here to keep track of them or buy them later.
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Explore Products <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {items.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                <div className="relative aspect-square">
                  <Link to={`/product/${product.slug}`}>
                    <img 
                      src={JSON.parse(product.imageUrls)[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full shadow-sm transition-colors z-10"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <Link to={`/product/${product.slug}`} className="block">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 hover:text-[#F59E0B] transition-colors h-10">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-extrabold text-[#F59E0B]">
                      Ksh {product.price.toLocaleString()}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        Ksh {product.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {}
        <div className="border-t border-slate-200 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">You May Also Like</h2>
            <Link to="/products" className="text-[#F59E0B] font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingRecs ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-200 rounded-2xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  slug={product.slug}
                  image={product.imageUrls?.[0] || ''}
                  title={product.name}
                  price={product.price}
                  originalPrice={product.compareAtPrice || product.price}
                  rating={5}
                  reviewCount={0}
                  discount={0}
                  stockStatus={product.stock > 0 ? 'in_stock' : 'out_of_stock'}
                  stockCount={product.stock}
                  isVerified={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No recommendations available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};
