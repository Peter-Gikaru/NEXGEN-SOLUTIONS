import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import api from '../services/api';
import { 
  Star,
  StarHalf,
  ShoppingCart, 
  ShieldCheck, 
  ChevronRight, 
  Heart,
  Share2, 
  AlertTriangle,
  Scale,
  Truck,
  Search
} from 'lucide-react';
import type { Product } from '../types';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SEO } from '../components/SEO';
import { buildBreadcrumbs } from '../lib/structured-data';
import { getImageUrl } from '../utils/getImageUrl';

interface Review {
  id: string;
  rating: number;
  serviceRating: number;
  comment: string;
  verifiedPurchase: boolean;
  imageUrls?: string | null;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrls: string[];
  threeDModelUrl?: string | null;
  specs: Record<string, string>;
  category: {
    name: string;
  };
  reviews: Review[];
  rating: number;
  variants: { id: string; name: string; priceOffset: number; stock: number }[] | null;
}

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, addToast } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [mainImage, setMainImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const [newReview, setNewReview] = useState({
    rating: 5,
    serviceRating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${slug}`);
      const data = response.data;
      setProduct(data);
      if (response.data.imageUrls && response.data.imageUrls.length > 0) {
        setMainImage(getImageUrl(response.data.imageUrls[0]));
        setCurrentImageIndex(0);
      }
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }

      // Check if functional cookies are allowed
      const consentStr = localStorage.getItem('nexgen_cookie_consent');
      let functionalAllowed = true;
      if (consentStr) {
        try {
          const consent = JSON.parse(consentStr);
          if (consent.functional === false) functionalAllowed = false;
        } catch(e) {}
      }

      if (functionalAllowed) {
        const storageKey = user ? `recentlyViewed_${user.id}` : 'recentlyViewed_guest';
        const rvStr = localStorage.getItem(storageKey) || '[]';
        let rvArr = JSON.parse(rvStr);
        rvArr = rvArr.filter((p: any) => p.id !== data.id);
        rvArr.unshift({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: data.price,
          image: data.imageUrls?.[0] || ''
        });
        if (rvArr.length > 5) rvArr.pop();
        localStorage.setItem(storageKey, JSON.stringify(rvArr));
        setRecentlyViewed(rvArr.filter((p: any) => p.id !== data.id));
      } else {
        setRecentlyViewed([]);
      }

      const relatedRes = await api.get(`/products/${data.id}/related`);
      setRelatedProducts(relatedRes.data);

      if (isAuthenticated) {
        try {
          const revStatus = await api.get(`/reviews/can-review/${data.id}`);
          setCanReview(revStatus.data.canReview);
          if (revStatus.data.message) {
            setReviewMessage(revStatus.data.message);
          }
        } catch (e) {
          console.error('Failed to check review status', e);
        }
      }

      try {
        const zoneRes = await api.get('/shipping');
        setShippingZones(zoneRes.data);
      } catch (e) {
        console.error('Failed to fetch shipping zones', e);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProductDetails();
    window.scrollTo(0,0);
  }, [slug]);

  // Auto-play image gallery
  useEffect(() => {
    if (!product || !product.imageUrls || product.imageUrls.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % product.imageUrls.length;
        setMainImage(getImageUrl(product.imageUrls[nextIndex]));
        return nextIndex;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const productItem: Product = {
      id: product.id,
      slug: product.slug,
      title: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice || product.price,
      image: product.imageUrls[0] || '',
      rating: product.rating,
      reviewCount: product.reviews.length,
      discount: product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0,
      stockStatus: 'in_stock',
      stockCount: product.stock,
      isVerified: true,
      brand: product.brand,
      category: 'Laptops',
      description: product.description,
      variant: selectedVariant?.name || undefined
    };

    addToCart(productItem, quantity);
    addToast('Added to Cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const productItem: Product = {
      id: product.id,
      slug: product.slug,
      title: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice || product.price,
      image: product.imageUrls[0] || '',
      rating: product.rating,
      reviewCount: product.reviews.length,
      discount: product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0,
      stockStatus: 'in_stock',
      stockCount: product.stock,
      isVerified: true,
      brand: product.brand,
      category: 'Laptops',
      description: product.description,
      variant: selectedVariant?.name || undefined
    };

    navigate('/checkout', { state: { buyNowItem: { product: productItem, quantity } } });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const phoneNumber = "254717043408";
    const currentPrice = product.price + (selectedVariant?.priceOffset || 0);
    const message = `Hi NexGen, I'm looking to level up my setup with the ${product.name}.\n\nCurrent price showing as KES ${currentPrice.toLocaleString()}.\nCan you help me process this order?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} at NexGen Gadgets`,
      text: `Upgrading your setup? Take a look at the ${product.name}. Great specs, solid performance.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share was cancelled or failed.');
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!');
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrls: JSON.stringify(product.imageUrls),
      stock: product.stock
    });
  };

  const handleToggleCompare = () => {
    if (!product) return;
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare({
        id: product.id,
        slug: product.slug,
        title: product.name,
        price: product.price,
        originalPrice: product.compareAtPrice || product.price,
        image: product.imageUrls[0] || '',
        rating: product.rating,
        reviewCount: product.reviews.length,
        discount: product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0,
        stockStatus: 'in_stock',
        stockCount: product.stock,
        isVerified: true,
        brand: product.brand,
        category: 'Laptops',
        description: product.description,
        specs: product.specs
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    setReviewError('');

    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: Number(newReview.rating),
        serviceRating: Number(newReview.serviceRating),
        comment: newReview.comment
      });
      addToast('Review submitted successfully!');
      setNewReview({ rating: 5, serviceRating: 5, comment: '' });
      await fetchProductDetails();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Note: Reviews require a delivered order.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingValue: number) => {
    const stars = [];
    const floor = Math.floor(ratingValue);
    const hasHalf = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400 shrink-0" />);
      } else if (i === floor + 1 && hasHalf) {
        stars.push(<StarHalf key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400 shrink-0" />);
      } else {
        stars.push(<Star key={i} className="h-4.5 w-4.5 text-gray-300 shrink-0" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Retrieving laptop specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <SEO title="Product Not Found | NexGen Gadgets" description="The product you are looking for does not exist." />
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Product Not Found</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">We couldn't locate the system model you requested. It might have been sold out or catalog removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#F59E0B] text-slate-950 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-500 transition-colors cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrls,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": `https://yourdomain.co.ke/product/${product.slug}`,
      "priceCurrency": "KES",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    ...(product.reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toFixed(1),
        "reviewCount": product.reviews.length
      }
    })
  };

  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: product.category?.name || 'Category', path: `/products?category=${encodeURIComponent(product.category?.name || '')}` },
    { name: product.brand, path: `/products?brand=${encodeURIComponent(product.brand)}` },
    { name: product.name }
  ]);

  return (
    <div className="flex-1 bg-slate-50 text-[#1a1a2e] font-sans py-8">
      <SEO 
        title={`${product.name} Price in Kenya | ${product.brand} Laptops`} 
        description={`Buy ${product.name} in Kenya for KES ${product.price.toLocaleString()}. ${product.description.substring(0, 100)}... Fast delivery.`} 
        url={`/product/${product.slug}`}
        image={mainImage}
        schema={[productSchema, breadcrumbSchema]}
      />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {location.state?.fromSearch && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm mb-4 flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Reached via search for <strong>"{location.state.searchQuery}"</strong></span>
            <button onClick={() => navigate(-1)} className="ml-auto font-bold hover:underline cursor-pointer text-amber-900">
              ← Back to results
            </button>
          </div>
        )}

        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 select-none text-left">
          <button onClick={() => navigate('/')} className="hover:text-secondary cursor-pointer">Home</button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-400 capitalize">{product.category.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1a1a2e] font-semibold truncate max-w-[200px] md:max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          
          <div className="flex flex-col gap-4">
              <div className="w-full h-auto min-h-[300px] max-h-[600px] flex items-center justify-center relative select-none overflow-hidden group">
                <img 
                  src={getImageUrl(mainImage)} 
                  alt={product.name} 
                  className="max-h-[600px] w-auto object-contain drop-shadow-md transition-transform duration-500 ease-out hover:scale-105"
                  crossOrigin="anonymous"
                />
              </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {product.imageUrls.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMainImage(getImageUrl(img));
                      setCurrentImageIndex(index);
                    }}
                    className={`w-20 h-20 bg-white border rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:border-[#F59E0B] transition-colors shrink-0 ${
                      currentImageIndex === index ? 'border-2 border-[#F59E0B]' : 'border-gray-200'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col text-left gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase select-none">
                  {product.brand}
                </span>
                {product.specs?.condition && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm select-none uppercase ${
                    String(product.specs.condition).toLowerCase() === 'new' ? 'bg-emerald-500 text-white' : 
                    String(product.specs.condition).toLowerCase() === 'refurbished' ? 'bg-[#1a1a2e] text-white' : 
                    'bg-[#F59E0B] text-white'
                  }`}>
                    {String(product.specs.condition)}
                  </span>
                )}
                {product.specs?.warranty && (
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold select-none flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {String(product.specs.warranty)} Warranty
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] leading-snug">{product.name}</h1>
            </div>

            <div className="flex items-center gap-2 select-none">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-sm font-semibold text-[#1a1a2e] mt-0.5">{product.rating.toFixed(1)}</span>
              <span className="text-gray-300 font-normal">|</span>
              <span className="text-sm text-gray-500 mt-0.5">({product.reviews.length} Customer Reviews)</span>
            </div>

            <div className="flex items-baseline gap-3.5 py-2 border-y border-gray-150">
              <span className="text-3xl font-bold text-[#1a1a2e]">
                KES {((product.price) + (selectedVariant?.priceOffset || 0)).toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                  <span className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            
            {isAuthenticated && (
              <div className="text-xs text-[#F59E0B] font-bold">
                ✨ Earn {Math.floor(((product.price) + (selectedVariant?.priceOffset || 0)) / 100)} loyalty points
              </div>
            )}

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="pt-2">
                <span className="text-sm font-semibold text-slate-500 block mb-2">Select Variant:</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 border rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                        selectedVariant?.id === v.id 
                          ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B]' 
                          : 'border-gray-200 text-slate-600 hover:border-gray-300'
                      }`}
                    >
                      {v.name} {v.priceOffset > 0 && `(+KES ${v.priceOffset.toLocaleString()})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500 w-24">Availability:</span>
                <span className="bg-emerald-50 text-accent border border-emerald-100 px-2.5 py-0.5 rounded text-xs font-bold">In Stock</span>
              </div>

              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 mt-2">
                <h4 className="font-bold text-[#1a1a2e] text-sm mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#F59E0B]" />
                  Delivery Options & ETA
                </h4>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B] mb-3"
                >
                  <option value="">Select your region to see ETA & fee</option>
                  {shippingZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.regionName}
                    </option>
                  ))}
                </select>
                
                {selectedZoneId && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-bold text-[#1a1a2e]">
                        {shippingZones.find(z => z.id === selectedZoneId)?.estimatedDays}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-bold text-[#F59E0B]">
                        {((product?.price || 0) + (selectedVariant?.priceOffset || 0)) >= 50000 
                          ? 'FREE (Orders over 50k)' 
                          : `KES ${shippingZones.find(z => z.id === selectedZoneId)?.fee.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 select-none">
                <span className="text-sm font-semibold text-slate-500 w-24">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-slate-50">
                  <button
                    onClick={() => setQuantity(p => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 hover:bg-gray-200 text-[#1a1a2e] transition-colors cursor-pointer font-bold rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-semibold text-[#1a1a2e] min-w-[30px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(p => p + 1)}
                    className="px-3.5 py-1.5 hover:bg-gray-200 text-[#1a1a2e] transition-colors cursor-pointer font-bold rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 mt-auto">
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#1a1a2e] text-white py-3.5 rounded-xl text-base font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#F59E0B] text-[#1a1a2e] py-3.5 rounded-xl text-base font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <ShoppingCart className="h-5.5 w-5.5" /> Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`border p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                    product && isInWishlist(product.id) 
                      ? 'border-rose-500 text-rose-500 bg-rose-50' 
                      : 'bg-white border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-500'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${product && isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <button
                  onClick={handleToggleCompare}
                  className={`border p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                    product && isInCompare(product.id)
                      ? 'border-blue-500 text-blue-500 bg-blue-50'
                      : 'bg-white border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-500'
                  }`}
                  aria-label="Compare"
                >
                  <Scale className={`h-5 w-5 ${product && isInCompare(product.id) ? 'text-blue-500' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white border border-gray-200 text-gray-500 hover:text-[#F59E0B] hover:border-[#F59E0B] p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <button
                 onClick={handleWhatsAppOrder}
                 className="w-full bg-[#25D366] text-white py-3.5 mt-2 rounded-xl text-base font-bold uppercase tracking-wider hover:bg-[#1ebd59] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
              >
                <WhatsAppIcon size={22} /> Order on WhatsApp
              </button>

              <div className="mt-6 space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                    <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Same-Day Delivery</h4>
                      <p className="text-xs text-slate-500">Available in Nairobi CBD</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">7-Day Easy Returns</h4>
                      <p className="text-xs text-slate-500">Subject to terms & conditions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-10 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          
          <div className="flex border-b border-gray-200 bg-slate-50 select-none">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'description'
                  ? 'border-[#F59E0B] text-[#F59E0B] bg-white'
                  : 'border-transparent text-gray-500 hover:text-[#1a1a2e]'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-[#F59E0B] text-[#F59E0B] bg-white'
                  : 'border-transparent text-gray-500 hover:text-[#1a1a2e]'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#F59E0B] text-[#F59E0B] bg-white'
                  : 'border-transparent text-gray-500 hover:text-[#1a1a2e]'
              }`}
            >
              Reviews ({product.reviews.length})
            </button>
          </div>

          <div className="p-6 md:p-8 text-left">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-650 space-y-4">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">Notebook Overview</h3>
                <p>{product.description}</p>
                <p>Every system ordered through NexGen Gadgets undergoes hardware stress-testing and quality verification to ensure flawless performance out of the box.</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Technical Specifications</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-150">
                    {Object.entries(product.specs).map(([key, value]) => {
                      if (key === 'whatsInBox') return null;
                      return (
                        <div key={key} className="grid grid-cols-3 p-3.5 text-sm bg-white hover:bg-slate-50/50">
                          <span className="font-bold text-slate-500 col-span-1 capitalize">{key}</span>
                          <span className="text-[#1a1a2e] col-span-2 font-medium">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {product.specs?.whatsInBox && Array.isArray(product.specs.whatsInBox) && (
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">What's in the Box</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                      {product.specs.whatsInBox.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm font-medium">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Customer Reviews</h3>
                  {product.reviews.length === 0 ? (
                    <p className="text-gray-400 text-sm">No reviews posted yet for this notebook.</p>
                  ) : (
                    <div className="space-y-6 max-w-4xl">
                      {product.reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-gray-150 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-[#1a1a2e]">{rev.user?.name || 'Anonymous User'}</span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded select-none">
                                <ShieldCheck className="h-3 w-3 text-accent shrink-0" /> VERIFIED PURCHASE
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 uppercase">Product:</span>
                              <div className="flex">{renderStars(rev.rating)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 uppercase">Service:</span>
                              <div className="flex">{renderStars(rev.serviceRating)}</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                          {rev.imageUrls && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                              {JSON.parse(rev.imageUrls).map((img: string, idx: number) => (
                                <img key={idx} src={getImageUrl(img)} alt="Review" className="w-16 h-16 object-cover rounded border border-gray-200" />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-150 pt-8 max-w-xl">
                  <h4 className="text-base font-bold text-[#1a1a2e] mb-4">Submit a Review</h4>
                  {isAuthenticated ? (
                    canReview ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {reviewError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                          <span>{reviewError}</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">Product Rating</label>
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview(p => ({ ...p, rating: Number(e.target.value) }))}
                            className="bg-slate-50 border border-gray-300 text-sm rounded-lg px-3.5 py-2 focus:outline-none focus:border-[#F59E0B] w-full"
                          >
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Good)</option>
                            <option value="3">3 Stars (Average)</option>
                            <option value="2">2 Stars (Poor)</option>
                            <option value="1">1 Star (Very Bad)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">Service & Delivery Rating</label>
                          <select
                            value={newReview.serviceRating}
                            onChange={(e) => setNewReview(p => ({ ...p, serviceRating: Number(e.target.value) }))}
                            className="bg-slate-50 border border-gray-300 text-sm rounded-lg px-3.5 py-2 focus:outline-none focus:border-[#F59E0B] w-full"
                          >
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Good)</option>
                            <option value="3">3 Stars (Average)</option>
                            <option value="2">2 Stars (Poor)</option>
                            <option value="1">1 Star (Very Bad)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Your Review Comments</label>
                        <textarea
                          required
                          value={newReview.comment}
                          onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                          placeholder="Tell us what you think of this notebook model..."
                          rows={4}
                          className="bg-slate-50 border border-gray-300 text-sm rounded-lg p-3.5 focus:outline-none focus:border-[#F59E0B] w-full"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-[#F59E0B] text-slate-950 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 cursor-pointer text-sm shadow-sm"
                      >
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                    ) : (
                      <div className="bg-slate-50 border border-gray-250 p-5 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">{reviewMessage || 'You can only review products that have been delivered to you.'}</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-slate-50 border border-gray-250 p-5 rounded-xl text-center">
                      <p className="text-gray-500 text-sm mb-4">Please log in to your account to write a review.</p>
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-slate-800 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {relatedProducts.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-12 mb-8">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
            <span className="bg-[#F59E0B] w-1 h-6 rounded-full inline-block"></span>
            Similar Items
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(rp => (
              <div 
                key={rp.id} 
                className="bg-white border border-gray-150 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/product/${rp.slug}`)}
              >
                <div className="aspect-square bg-slate-50 rounded-lg p-2 mb-3 flex items-center justify-center">
                  <img src={getImageUrl(Array.isArray(rp.imageUrls) ? rp.imageUrls[0] : rp.imageUrls?.split(',')[0])} alt={rp.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h3 className="text-sm font-bold text-[#1a1a2e] truncate">{rp.name}</h3>
                <p className="text-[#F59E0B] font-bold text-sm mt-1">KES {rp.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8 mb-12">
          <h2 className="text-xl font-bold text-slate-500 mb-6 border-b border-gray-200 pb-2">
            Recently Viewed
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {recentlyViewed.map(rv => (
              <div 
                key={rv.id} 
                className="w-[150px] shrink-0 bg-white border border-gray-150 rounded-lg p-3 cursor-pointer hover:border-[#F59E0B] transition-colors"
                onClick={() => navigate(`/product/${rv.slug}`)}
              >
                <div className="aspect-square bg-slate-50 rounded mb-2 flex items-center justify-center p-1">
                  <img src={getImageUrl(rv.image)} alt={rv.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h3 className="text-xs font-bold text-slate-600 truncate">{rv.name}</h3>
                <p className="text-slate-400 font-medium text-xs mt-0.5">KES {rv.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex gap-3">
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-[#1a1a2e] text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center shadow-md"
        >
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-[#F59E0B] text-[#1a1a2e] py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
};
export default ProductDetailPage;
