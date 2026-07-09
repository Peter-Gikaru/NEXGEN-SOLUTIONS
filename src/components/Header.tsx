import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { CategoryNav } from './CategoryNav';
import api from '../services/api';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  Home, 
  Menu, 
  User, 
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
export const Header: React.FC = () => {
  const { categories: mainCategories } = useCategories();
  const { cartItems, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [topBarIndex, setTopBarIndex] = useState(0);
  const [topBarFade, setTopBarFade] = useState(true);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTopBarFade(false);
      const timer = setTimeout(() => {
        setTopBarIndex((prev) => (prev === 0 ? 1 : 0));
        setTopBarFade(true);
      }, 300);
      return () => clearTimeout(timer);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/wishlist/recommendations');
        setRecommendedProducts(res.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      }
    };
    fetchRecommendations();
  }, []);
  useEffect(() => {
    const fetchSuggestions = async () => {
      const val = searchInput.trim().toLowerCase();
      if (val.length > 1) {
        try {
          const res = await api.get('/products', { params: { search: val, limit: 4 } });
          setSearchSuggestions(res.data.products || []);
          setDidYouMean(res.data.didYouMean || null);
          const keywords: string[] = [];
          mainCategories.forEach(cat => {
            if (cat.name.toLowerCase().includes(val)) keywords.push(cat.name);
            cat.children?.forEach(sub => {
              if (sub.name.toLowerCase().includes(val)) keywords.push(sub.name);
            });
          });
          const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 3);
          setKeywordSuggestions(uniqueKeywords);
          setIsSuggestionsOpen(true);
          setSelectedIndex(-1);
        } catch (e) {
          setSearchSuggestions([]);
          setKeywordSuggestions([]);
          setDidYouMean(null);
        }
      } else {
        setSearchSuggestions([]);
        setKeywordSuggestions([]);
        setDidYouMean(null);
        setIsSuggestionsOpen(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchInput]);
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSuggestionsOpen(false);
    if (selectedIndex >= 0) {
      if (selectedIndex < keywordSuggestions.length) {
        navigate(`/products?search=${encodeURIComponent(keywordSuggestions[selectedIndex])}`);
      } else {
        const prod = searchSuggestions[selectedIndex - keywordSuggestions.length];
        navigate(`/product/${prod.slug}`, { state: { fromSearch: true, searchQuery: searchInput || prod.name } });
      }
    } else if (searchInput.trim()) {
      const sanitizedSearch = searchInput.trim().replace(/[<>]/g, '');
      navigate(`/products?search=${encodeURIComponent(sanitizedSearch)}`);
    } else {
      navigate('/products');
    }
    setIsMobileSearchOpen(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSuggestionsOpen) return;
    const totalLength = keywordSuggestions.length + searchSuggestions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalLength - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };
  return (
    <header className="sticky top-0 z-40 w-full select-none shadow-md border-b border-gray-200">
      {}
      <div className="w-full bg-[#1a1a2e] text-white py-4 px-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              {}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-white hover:text-[#d97706] md:hidden cursor-pointer flex items-center justify-center"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="hover:opacity-90 transition-opacity flex items-center gap-2" aria-label="NexGen Gadgets Home">
                <img src="/favicon.png" alt="NexGen Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
                <span className="font-sans text-2xl md:text-3xl font-semibold leading-none tracking-wide text-white">
                  NexGen <span className="text-[#F59E0B]">Gadgets</span>
                </span>
              </Link>
            </div>
            {}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer text-white"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5 text-white" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[12px] font-semibold w-5.5 h-5.5 rounded-full flex items-center justify-center shadow">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer text-white"
                aria-label="Open Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F59E0B] text-primary text-[14px] font-semibold w-5.5 h-5.5 rounded-full flex items-center justify-center border border-[#1a1a2e] shadow">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
          {}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center relative w-full max-w-xl lg:max-w-2xl flex-1 mx-4"
          >
            <input
              type="text"
              placeholder="Search premium laptops & accessories..."
              value={searchInput}
              onFocus={() => { if(searchInput.trim().length > 1) setIsSuggestionsOpen(true) }}
              onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-12 py-3 text-[18px] bg-white text-text-primary rounded border-2 border-transparent focus:outline-none focus:border-[#d97706] placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 bg-[#d97706] text-primary rounded-r flex items-center justify-center hover:bg-amber-700 cursor-pointer transition-colors"
              aria-label="Search Submit"
            >
              <Search className="h-5 w-5 text-primary" />
            </button>
            {isSuggestionsOpen && searchInput.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-b shadow-xl overflow-hidden z-50 divide-y divide-gray-100">
                {}
                {keywordSuggestions.length > 0 && (
                  <div className="py-2">
                    {keywordSuggestions.map((keyword, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={keyword}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchInput(keyword);
                            setIsSuggestionsOpen(false);
                            navigate(`/products?search=${encodeURIComponent(keyword)}`);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer ${isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                          <Search className={`h-4 w-4 ${isSelected ? 'text-[#F59E0B]' : 'text-gray-400'}`} />
                          <span className={`text-[16px] ${isSelected ? 'font-bold text-[#F59E0B]' : 'font-medium text-slate-700'}`}>
                            {keyword}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {}
                {searchSuggestions.length > 0 && (
                  <div className="py-2 bg-slate-50">
                    <div className="px-4 py-1">
                      <span className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Products</span>
                    </div>
                    {searchSuggestions.map((item, idx) => {
                      const currentIdx = keywordSuggestions.length + idx;
                      const isSelected = selectedIndex === currentIdx;
                      return (
                        <button
                          key={item.slug}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(currentIdx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate(`/product/${item.slug}`, { state: { fromSearch: true, searchQuery: searchInput || item.name } });
                            setIsSuggestionsOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 flex items-center gap-4 cursor-pointer ${isSelected ? 'bg-white shadow-sm ring-1 ring-inset ring-[#F59E0B]/20' : 'hover:bg-white'}`}
                        >
                          <div className="w-14 h-14 shrink-0 bg-white rounded flex items-center justify-center border border-gray-100">
                            <img src={(() => {
                              if (!item.imageUrls) return '';
                              if (Array.isArray(item.imageUrls)) return item.imageUrls[0];
                              try { return JSON.parse(item.imageUrls)[0]; }
                              catch(e) { return typeof item.imageUrls === 'string' ? item.imageUrls.split(',')[0] : ''; }
                            })()} alt="" className="max-w-full max-h-full object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[16px] truncate ${isSelected ? 'font-bold text-[#F59E0B]' : 'font-semibold text-[#1a1a2e]'}`}>{item.name}</p>
                            <p className="text-[14px] font-bold text-emerald-600">KES {item.price.toLocaleString()}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* No Results Found */}
                {keywordSuggestions.length === 0 && searchSuggestions.length === 0 && (
                  <div className="py-6 px-4 text-center bg-slate-50">
                    <div className="bg-white p-3 rounded-full inline-block mb-3 shadow-sm border border-gray-100">
                      <Search className="h-6 w-6 text-gray-300" />
                    </div>
                    {didYouMean ? (
                      <p className="text-[15px] text-[#1a1a2e] font-semibold">
                        Did you mean: <button onMouseDown={(e) => { e.preventDefault(); setSearchInput(didYouMean); }} className="text-[#F59E0B] hover:underline cursor-pointer">"{didYouMean}"</button>?
                      </p>
                    ) : (
                      <p className="text-[15px] text-[#1a1a2e] font-semibold">We couldn't find matches for "<span className="text-[#F59E0B]">{searchInput}</span>"</p>
                    )}
                    <p className="text-[13px] text-gray-500 mt-1 mb-4">But don't worry, here are some recommendations for you:</p>
                    {recommendedProducts.length > 0 ? (
                      <div className="flex flex-col gap-2 text-left bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                        {recommendedProducts.map((item) => (
                          <button
                            key={item.slug}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigate(`/product/${item.slug}`, { state: { fromSearch: true, searchQuery: searchInput || item.name } });
                              setIsSuggestionsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-amber-50/50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 shrink-0 bg-white rounded flex items-center justify-center border border-gray-100 p-1">
                              <img src={(() => {
                                if (!item.imageUrls) return '';
                                if (Array.isArray(item.imageUrls)) return item.imageUrls[0];
                                try { return JSON.parse(item.imageUrls)[0]; }
                                catch(e) { return typeof item.imageUrls === 'string' ? item.imageUrls.split(',')[0] : ''; }
                              })()} alt="" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#1a1a2e] truncate">{item.name}</p>
                              <p className="text-[12px] font-bold text-emerald-600">KES {item.price.toLocaleString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        {mainCategories.slice(0, 4).map(cat => (
                          <button 
                            key={cat.id} 
                            onMouseDown={(e) => { e.preventDefault(); navigate(`/products?category=${encodeURIComponent(cat.slug)}`); setIsSuggestionsOpen(false); }} 
                            className="bg-white border border-gray-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors shadow-sm cursor-pointer capitalize"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
          {/* Contact Support & Trust Badge (Right on Desktop) - Alternating Carousel Animation */}
          <div className="hidden md:flex items-center gap-4 shrink-0 text-right justify-end min-w-[280px]">
            <div className={`transition-all duration-300 ${topBarFade ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-2'}`}>
              {topBarIndex === 0 ? (
                <a 
                  href="tel:+254721420096"
                  className="flex items-center gap-2 hover:text-[#F59E0B] transition-colors text-[16px] font-semibold text-white"
                >
                  <Phone className="h-5 w-5 text-[#F59E0B]" />
                  <span>Order Now: <strong className="text-white">+254 717 043408</strong></span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[16px] text-[#10B981] font-semibold bg-emerald-950/45 px-3 py-1 rounded border border-emerald-800/50">
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  <span>✓ Free Delivery Within Nairobi</span>
                </span>
              )}
            </div>
            {/* Desktop Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer text-white ml-2"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-white" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[12px] font-semibold w-5.5 h-5.5 rounded-full flex items-center justify-center shadow">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            {/* Desktop Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer text-white ml-2"
              aria-label="Open Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F59E0B] text-primary text-[14px] font-semibold w-5.5 h-5.5 rounded-full flex items-center justify-center border border-[#1a1a2e] shadow">
                  {totalItems}
                </span>
              )}
            </button>
            {/* Desktop User Account Link/Dropdown */}
            <div className="relative ml-2">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer text-white font-sans text-[14px]"
                  >
                    <User className="h-5 w-5 text-white" />
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-55 text-left">
                      <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
                        Logged in as: <strong className="text-white">{user?.email}</strong>
                      </div>
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          Dashboard Portal
                        </Link>
                      )}
                      {user?.role === 'USER' && (
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          My Orders & Returns
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setIsProfileOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-450 hover:bg-slate-800 hover:text-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2.5 px-4 rounded bg-[#d97706] text-slate-950 font-bold hover:bg-amber-700 transition-colors flex items-center justify-center cursor-pointer text-[14px]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          {/* Mobile Search Bar - stack version */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex md:hidden items-center relative w-full"
          >
            <input
              type="text"
              placeholder="Search laptops..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 text-[16px] bg-white text-text-primary rounded border border-gray-300 focus:outline-none focus:border-[#d97706] placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4.5 bg-[#d97706] text-primary rounded-r flex items-center justify-center hover:bg-amber-700 cursor-pointer transition-colors"
            >
              <Search className="h-5 w-5 text-primary" />
            </button>
          </form>
          {/* Mobile Alternating support contact / trust badge (stacks bottom) */}
          <div className="flex md:hidden items-center justify-center h-8 w-full border-t border-slate-800 pt-2.5 mt-0.5">
            <div className={`transition-all duration-300 ${topBarFade ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-1'}`}>
              {topBarIndex === 0 ? (
                <a 
                  href="tel:+254721420096"
                  className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors text-[14px] font-semibold text-white"
                >
                  <Phone className="h-4 w-4 text-[#d97706]" />
                  <span>Call: <strong className="text-white">+254 721 420096</strong></span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[14px] text-[#10B981] font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  <span>✓ Free Delivery Within Nairobi</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Category Navigation Bar */}
      <CategoryNav />
      {/* Mobile Search Modal Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#1a1a2e]/90 flex flex-col p-4 md:hidden">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="bg-white p-2.5 rounded-full text-primary shadow-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Search laptops..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 pl-4 pr-4 py-3 border border-gray-700 rounded bg-[#1a1a2e] text-white text-[18px] focus:outline-none focus:border-[#F59E0B]"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#F59E0B] text-primary px-5 py-3 rounded font-semibold text-[16px] cursor-pointer hover:bg-amber-500"
            >
              Search
            </button>
          </form>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar (Jumia/Kilimall Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a2e] border-t border-slate-800 flex md:hidden justify-around items-center py-2 shadow-2xl select-none">
        <Link to="/" className="flex flex-col items-center justify-center text-gray-400 hover:text-[#F59E0B] transition-colors">
          <Home className="h-5.5 w-5.5" />
          <span className="text-[14px] font-medium mt-1">Home</span>
        </Link>
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#F59E0B] transition-colors cursor-pointer"
        >
          <Search className="h-5.5 w-5.5" />
          <span className="text-[14px] font-medium mt-1">Search</span>
        </button>
        <div 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#F59E0B] transition-colors cursor-pointer"
        >
          <Menu className="h-5.5 w-5.5" />
          <span className="text-[14px] font-medium mt-1">Categories</span>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center text-gray-400 hover:text-[#F59E0B] transition-colors cursor-pointer"
        >
          <ShoppingCart className="h-5.5 w-5.5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-2 bg-[#F59E0B] text-primary text-[12px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-[14px] font-medium mt-1">Cart</span>
        </button>
        <button 
          onClick={() => {
            if (isAuthenticated) {
              if (user?.role === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/orders');
              }
            } else {
              navigate('/login');
            }
          }}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#d97706] transition-colors cursor-pointer"
        >
          <User className="h-5.5 w-5.5" />
          <span className="text-[14px] font-medium mt-1">
            {isAuthenticated ? 'Profile' : 'Account'}
          </span>
        </button>
      </nav>
      {/* Mobile Side Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Drawer Content */}
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white h-full flex flex-col shadow-2xl animate-slide-in-left overflow-y-auto">
            {/* Header */}
            <div className="bg-[#1a1a2e] text-white px-4 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="NexGen Logo" className="h-8 w-8 object-contain" />
                <div className="flex flex-col items-start">
                  <span className="font-sans text-[20px] font-semibold text-white">
                    NexGen <span className="text-[#d97706]">Gadgets</span>
                  </span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider">
                    Menu
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Categories List (Accordion) */}
            <div className="flex-1 py-4 flex flex-col text-left">
              <h3 className="px-4 text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                All Categories
              </h3>
              <div className="flex flex-col">
                {mainCategories.map((cat) => {
                  const hasSub = cat.children && cat.children.length > 0;
                  const isExpanded = expandedMobileCategory === cat.name;
                  return (
                    <div key={cat.name} className="border-b border-gray-150 last:border-0">
                      <div
                        onClick={() => {
                          if (hasSub) {
                            setExpandedMobileCategory(isExpanded ? null : cat.name);
                          } else {
                            setIsMobileMenuOpen(false);
                            navigate(`/products?category=${encodeURIComponent(cat.slug)}`);
                          }
                        }}
                        className={`flex items-center justify-between px-4 py-3.5 text-[15px] text-text-primary hover:bg-gray-50 transition-colors font-medium cursor-pointer ${
                          isExpanded ? 'bg-gray-50 text-secondary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {cat.icon}
                          <span>{cat.name}</span>
                        </div>
                        {hasSub && (
                          isExpanded 
                            ? <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                            : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                      </div>
                      {/* Accordion Subcategories */}
                      {hasSub && isExpanded && cat.children && (
                        <div className="bg-gray-50/50 pl-11 pr-4 py-2 flex flex-col gap-2 border-t border-dashed border-gray-100">
                          {cat.children.map((sub: any) => (
                            <button
                              key={sub.name}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                navigate(`/products?category=${encodeURIComponent(sub.slug)}`);
                              }}
                              className="text-left text-[14px] text-text-secondary hover:text-secondary py-1.5 transition-colors font-medium border-b border-dashed border-gray-100 last:border-0 cursor-pointer"
                            >
                              • {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {}
              <div className="mt-8 px-4 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact & Support
                </span>
                <a 
                  href="tel:+254721420096"
                  className="flex items-center gap-2 text-text-primary hover:text-secondary font-semibold text-[14px]"
                >
                  <Phone className="h-4 w-4 text-[#d97706]" />
                  <span>Call: +254 721 420096</span>
                </a>
                <span className="inline-flex items-center gap-1.5 text-[14px] text-accent font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>Free Delivery in Nairobi</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
