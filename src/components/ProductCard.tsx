import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, StarHalf, ShieldCheck, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/format';
import type { Product } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getImageUrl } from '../utils/getImageUrl';

const RECENTLY_VIEWED_KEY = 'recently_viewed_nexgen';

interface ProductCardProps {
  id: string;
  slug?: string;
  image: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  discount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  isVerified: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  id,
  slug,
  image,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  discount,
  stockStatus,
  stockCount,
  isVerified
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleClick = () => {
    saveToRecentlyViewed(id);
    navigate(`/product/${slug || id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productItem: Product = {
      id,
      slug,
      image,
      title,
      price,
      originalPrice,
      rating,
      reviewCount,
      discount,
      stockStatus,
      stockCount,
      isVerified,
      category: 'Laptops',
      brand: title.split(' ')[0],
      description: title
    };
    
    addToCart(productItem);
    saveToRecentlyViewed(id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productItem: Product = {
      id,
      slug,
      image,
      title,
      price,
      originalPrice,
      rating,
      reviewCount,
      discount,
      stockStatus,
      stockCount,
      isVerified,
      category: 'Laptops',
      brand: title.split(' ')[0],
      description: title
    };
    
    addToCart(productItem);
    saveToRecentlyViewed(id);
    navigate('/checkout');
  };

  const saveToRecentlyViewed = (productId: string) => {
    try {
      const recent = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentIds: string[] = recent ? JSON.parse(recent) : [];
      
      recentIds = recentIds.filter(x => x !== productId);
      recentIds.unshift(productId);
      recentIds = recentIds.slice(0, 4);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentIds));
      
      window.dispatchEvent(new Event('recentlyViewedUpdated'));
    } catch (e) {
      console.error('Failed to save to recently viewed:', e);
    }
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phoneNumber = "254717043408";
    const message = `Hello NexGen Gadgets, I am interested in ordering the ${title} which costs KES ${price.toLocaleString()}. Please assist me with the order process.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id, slug: slug || id, name: title, price, compareAtPrice: originalPrice, imageUrls: JSON.stringify([image]), stock: stockCount || 10
    });
  };

  const renderStars = (ratingValue: number) => {
    const stars = [];
    const floor = Math.floor(ratingValue);
    const hasHalf = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />);
      } else if (i === floor + 1 && hasHalf) {
        stars.push(<StarHalf key={i} className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300 shrink-0" />);
      }
    }
    return stars;
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white border border-border-gray text-dark-primary rounded relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col h-full cursor-pointer overflow-hidden text-left"
    >
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-danger text-white text-sm font-semibold px-2 py-0.5 rounded shadow-sm select-none">
          -{discount}%
        </span>
      )}

      <div className="w-full aspect-square bg-white p-4 flex items-center justify-center relative border-b border-border-gray select-none group/image">
        <img
          src={getImageUrl(image)}
          alt={title}
          className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full shadow-sm transition-colors z-20 opacity-0 group-hover/image:opacity-100 focus:opacity-100"
          title="Add to wishlist"
        >
          <Heart className={`h-5 w-5 ${isInWishlist(id) ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2.5 relative bg-white">
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded w-max select-none">
            <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" /> VERIFIED
          </span>
        )}

        <h3 className="text-lg font-semibold font-sans text-dark-primary line-clamp-2 leading-snug hover:text-secondary transition-colors duration-100">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 select-none text-sm">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-text-secondary">({reviewCount} reviews)</span>
        </div>

        <div className="flex items-baseline gap-2.5 mt-1.5 flex-wrap">
          <span className="text-2xl font-semibold text-dark-primary">{formatPrice(price)}</span>
          {originalPrice > price && (
            <span className="text-base text-text-secondary line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="text-sm font-semibold mt-auto select-none">
          <span className="text-accent">In Stock</span>
        </div>
      </div>

      <div className="p-3.5 border-t border-border-gray bg-bg-gray mt-auto z-10 select-none flex flex-col gap-2">
        <button
          onClick={handleBuyNow}
          className="w-full bg-[#1a1a2e] text-white py-2 rounded text-sm font-bold items-center justify-center gap-2 shadow hover:bg-slate-800 transition-all hidden group-hover:flex"
        >
          Buy Now
        </button>

        <button
          onClick={handleWhatsAppOrder}
          className="w-full bg-[#25D366] text-white py-2 rounded text-sm font-bold items-center justify-center gap-2 shadow hover:bg-[#1ebd59] transition-all hidden group-hover:flex"
        >
          <WhatsAppIcon size={18} /> Quick Order
        </button>

        <button
          onClick={handleAddToCart}
          className="w-full bg-secondary text-dark-primary py-2.5 rounded text-base font-semibold uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <ShoppingCart className="h-5 w-5" /> Add to Cart
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
