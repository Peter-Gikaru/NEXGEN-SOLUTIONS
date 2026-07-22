import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
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
  Heart,
  Scale,
  Package,
  LogOut as Logout
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
export const Header: React.FC = () => {
  const { categories: mainCategories } = useCategories();
  const { cartItems, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { compareItems } = useCompare();
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
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
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
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
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
              <Link to="/" className="hover:opacity-90 transition-opacity flex items-center" aria-label="NexGen Gadgets Home">
                <img src="/favicon.png" alt="NexGen Logo" className="h-10 md:h-14 w-auto object-contain" />
              </Link>
              <span className="font-sans text-3xl md:text-4xl font-semibold leading-none tracking-wide text-white">
                  NexGen <span className="text-[#F59E0B]">Gadgets</span>
                </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:hidden">
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
            className="flex items-center relative w-full mt-3 md:mt-0 md:max-w-xl lg:max-w-2xl flex-1 md:mx-4"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={searchInput}
              onFocus={() => { if(searchInput.trim().length > 1) setIsSuggestionsOpen(true) }}
              onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-12 py-2.5 md:py-3 text-sm md:text-base bg-white text-text-primary rounded-lg border border-gray-300 md:border-2 md:border-transparent focus:outline-none focus:border-[#d97706] placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 text-gray-500 md:bg-[#d97706] md:text-primary md:rounded-r flex items-center justify-center hover:text-gray-700 md:hover:bg-amber-700 cursor-pointer transition-colors"
              aria-label="Search Submit"
            >
              <Search className="h-5 w-5 md:text-primary" />
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
          <div className="hidden md:flex items-center gap-4 shrink-0 text-right justify-end">
            {/* Help Dropdown */}
            <div className="relative group ml-4">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#F59E0B] transition-colors py-2">
                <div className="relative border-2 border-white group-hover:border-[#F59E0B] rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                  <span className="font-bold text-lg text-white group-hover:text-[#F59E0B] block mt-[-2px]">?</span>
                </div>
                <span className="text-sm font-bold flex items-center gap-1 text-white group-hover:text-[#F59E0B]">Help <ChevronDown className="h-4 w-4" /></span>
              </div>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded shadow-2xl py-2 z-50 text-slate-800 border border-gray-100 hidden group-hover:block">
                <a href="tel:+254717043408" className="block px-4 py-3 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm border-b border-gray-100">Call Us</a>
                <Link to="/how-to-shop" className="block px-4 py-3 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm border-b border-gray-100">How to Shop</Link>
                <a href="mailto:support@nexgen-gadgets.com" className="block px-4 py-3 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm">Contact Support</a>
              </div>
            </div>

            {/* Account Dropdown */}
            <div 
              className="relative ml-4"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#F59E0B] transition-colors py-2 group">
                <User className="h-9 w-9 text-white group-hover:text-[#F59E0B]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold flex items-center gap-1 text-white group-hover:text-[#F59E0B]">
                    {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}` : 'Account'} 
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded shadow-2xl py-3 z-50 text-slate-800 border border-gray-100">
                  {!isAuthenticated ? (
                    <div className="px-4 pb-3 mb-2 border-b border-gray-100">
                      <Link to="/login" className="block w-full text-center bg-[#F59E0B] text-slate-900 font-bold py-3 rounded hover:bg-amber-500 transition-colors shadow-sm text-base">
                        Sign In
                      </Link>
                    </div>
                  ) : (
                    <div className="px-4 pb-2 mb-2 border-b border-gray-100 text-sm font-medium text-slate-500 truncate">
                      {user?.email}
                    </div>
                  )}
                  
                  <Link to={isAuthenticated && user?.role === 'ADMIN' ? '/admin' : '/orders'} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm">
                    <User className="h-5 w-5 text-gray-400" />
                    {isAuthenticated && user?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Account'}
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm">
                    <Package className="h-5 w-5 text-gray-400" />
                    Orders
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-gray-400" />
                      Saved Items
                    </div>
                    {wishlistItems.length > 0 && <span className="bg-[#F59E0B] text-white text-[12px] font-bold px-2 py-0.5 rounded-full">{wishlistItems.length}</span>}
                  </Link>
                  <Link to="/compare" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#F59E0B] transition-colors font-semibold text-sm justify-between">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-gray-400" />
                      Compare
                    </div>
                    {compareItems.length > 0 && <span className="bg-blue-500 text-white text-[12px] font-bold px-2 py-0.5 rounded-full">{compareItems.length}</span>}
                  </Link>

                  {isAuthenticated && (
                    <>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <button onClick={async () => { await logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-red-500 hover:text-red-600 transition-colors font-semibold text-left text-sm">
                        <Logout className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {}
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 cursor-pointer hover:text-[#F59E0B] transition-colors py-2 group ml-4">
              <div className="relative">
                <ShoppingCart className="h-9 w-9 text-white group-hover:text-[#F59E0B]" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#1a1a2e] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1a1a2e]">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white group-hover:text-[#F59E0B]">Cart</span>
            </button>
          </div>
        </div>
      </div>
      {}
      <div className="hidden md:block">
        <CategoryNav />
      </div>
      {}
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
              className="flex-1 pl-4 pr-4 py-3 border border-gray-700 rounded bg-[#1a1a2e] text-white text-base focus:outline-none focus:border-[#F59E0B]"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#F59E0B] text-primary px-5 py-3 rounded font-semibold text-sm cursor-pointer hover:bg-amber-500"
            >
              Search
            </button>
          </form>
        </div>
      )}
      {}
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
      {}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          {}
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {}
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white h-full flex flex-col shadow-2xl animate-slide-in-left overflow-y-auto">
            {}
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
            {}
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
                      {}
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
              
              <div className="px-4 pt-4 border-t border-gray-150">
                <Link
                  to="/compare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-text-primary hover:text-secondary font-semibold text-[15px] py-2"
                >
                  <Scale className="h-5 w-5 text-[#d97706]" />
                  <span>Compare Laptops</span>
                  {compareItems.length > 0 && (
                    <span className="bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto">
                      {compareItems.length}
                    </span>
                  )}
                </Link>
              </div>

              <div className="mt-4 px-4 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact & Support
                </span>
                <a
                  href="tel:+254717043408"
                  className="flex items-center gap-2 text-slate-600 hover:text-[#F59E0B] transition-colors font-medium cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-[#F59E0B]" />
                  <span>Call: +254 717 043408</span>
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
