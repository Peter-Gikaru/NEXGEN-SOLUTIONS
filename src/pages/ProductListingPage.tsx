import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { SEO } from '../components/SEO';
export interface FilterState {
  category: string;
  brand: string[];
  minPrice: string;
  maxPrice: string;
  rating: string;
  inStockOnly: boolean;
}
import { buildBreadcrumbs } from '../lib/structured-data';
export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(20);
  const initialFilters = useMemo<FilterState>(() => {
    const category = searchParams.get('category') || '';
    const brandParam = searchParams.get('brand');
    const brand = brandParam ? [brandParam] : [];
    return {
      category,
      brand,
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStockOnly: false
    };
  }, [searchParams]);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilters);
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') ? [searchParams.get('brand')!] : prev.brand
    }));
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const brand = searchParams.get('brand') || '';
        const response = await api.get('/products', {
          params: { search, category, brand, limit: 100 }
        });
        const mapped = response.data.products.map((p: any) => ({
          id: p.slug,
          title: p.name,
          category: p.category.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.compareAtPrice || p.originalPrice,
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          image: p.imageUrls[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
          discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
          stockStatus: p.stock > 5 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
          description: p.description
        }));
        setProducts(mapped);
        setDidYouMean(response.data.didYouMean || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);
  const handleApplyFilters = (newFilters: FilterState) => {
    setIsLoading(true);
    setActiveFilters(newFilters);
    setIsMobileFiltersOpen(false);
    const params: Record<string, string> = {};
    const searchVal = searchParams.get('search');
    if (searchVal) params.search = searchVal;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.brand.length === 1) {
      params.brand = newFilters.brand[0];
    }
    setSearchParams(params);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  };
  const handleClearFilters = () => {
    setIsLoading(true);
    const cleared: FilterState = {
      category: '',
      brand: [],
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStockOnly: false
    };
    setActiveFilters(cleared);
    setSearchParams({});
    setIsMobileFiltersOpen(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  };
  // Filter & Sort Logic
  const processedProducts = useMemo(() => {
    let result = [...products];
    // Search Query Filter
    // (Removed redundant frontend search query filter; handled by backend)
    // Category Filter
    // (Removed redundant frontend category filter; handled by backend)
    // Brand Filter
    // (Removed redundant frontend brand filter; handled by backend)
    // Price Filter
    if (activeFilters.minPrice) {
      const min = parseFloat(activeFilters.minPrice);
      result = result.filter((p) => p.price >= min);
    }
    if (activeFilters.maxPrice) {
      const max = parseFloat(activeFilters.maxPrice);
      result = result.filter((p) => p.price <= max);
    }
    // Rating Filter
    if (activeFilters.rating) {
      const ratingMin = parseFloat(activeFilters.rating);
      result = result.filter((p) => p.rating >= ratingMin);
    }
    // Availability Filter
    if (activeFilters.inStockOnly) {
      result = result.filter((p) => p.stockStatus !== 'out_of_stock');
    }
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'recommended':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
    return result;
  }, [searchParams, activeFilters, sortBy]);
  useEffect(() => {
    setDisplayedCount(20);
  }, [searchParams, activeFilters, sortBy]);
  const visibleProducts = processedProducts.slice(0, displayedCount);
  const searchQuery = searchParams.get('search');
  const breadcrumbs = [{ name: 'Home', path: '/' }];
  if (activeFilters.category) {
    breadcrumbs.push({ name: activeFilters.category, path: `/products?category=${encodeURIComponent(activeFilters.category)}` });
  } else {
    breadcrumbs.push({ name: 'Products', path: '/products' });
  }
  const breadcrumbSchema = buildBreadcrumbs(breadcrumbs);
  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-gray">
      <SEO 
        title={activeFilters.category ? `${activeFilters.category} Laptops in Kenya | NexGen Gadgets` : "All Laptops & Accessories | NexGen Gadgets"}
        description={activeFilters.category ? `Browse our collection of ${activeFilters.category} laptops. Top models, best prices in Kenya, and fast delivery.` : "Explore our wide range of premium laptops from top brands. Find the perfect device for gaming, work, or school."}
        url={activeFilters.category ? `/products?category=${activeFilters.category}` : "/products"}
        schema={breadcrumbSchema}
      />
      {}
      <div className="bg-white border-b border-gray-200 select-none shadow-sm py-6 mb-6 text-left">
        <div className="max-w-[1600px] mx-auto px-4">
          <h1 className="text-3xl font-semibold text-[#1a1a2e] font-sans leading-none tracking-tight">
            {activeFilters.category || 'Laptops & Accessories'}
          </h1>
          <p className="text-[16px] text-text-secondary mt-2">
            Found {processedProducts.length} items
            {searchQuery && (
              <span> for search "<strong className="text-[#1a1a2e] font-semibold">{searchQuery}</strong>"</span>
            )}
          </p>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 flex-1 w-full mb-12 relative flex flex-col gap-4">
        {}
        <div className="bg-white border border-gray-200 text-text-[#1a1a2e] rounded px-4 py-3 flex items-center justify-between shadow-sm select-none gap-2 relative z-30">
          {}
          <div>
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileFiltersOpen(true);
                } else {
                  setIsFilterOpen(!isFilterOpen);
                }
              }}
              className="flex items-center gap-1.5 border border-gray-305 rounded px-4 py-2 text-[14px] font-semibold bg-gray-50 hover:bg-gray-100 cursor-pointer"
            >
              <SlidersHorizontal className="h-5 w-5 text-secondary" />
              <span>Filter</span>
            </button>
          </div>
          {}
          <span className="hidden lg:inline text-[16px] font-medium text-text-secondary">
            Displaying {processedProducts.length} products
          </span>
          {}
          <div className="flex items-center gap-2 text-[16px] ml-auto">
            <span className="text-text-secondary font-medium shrink-0">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded pl-3 pr-8 py-1.5 font-semibold text-text-[#1a1a2e] focus:outline-none focus:border-secondary cursor-pointer text-[14px]"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="rating">Rating</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            </div>
          </div>
        </div>
        {}
        {(activeFilters.category || activeFilters.brand.length > 0 || activeFilters.minPrice || activeFilters.maxPrice || activeFilters.rating) && (
          <div className="flex flex-wrap gap-2 items-center text-[14px] select-none text-left">
            <span className="text-text-secondary font-medium">Active:</span>
            {activeFilters.category && (
              <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                {activeFilters.category}
                <button 
                  type="button"
                  onClick={() => handleApplyFilters({ ...activeFilters, category: '' })} 
                  className="hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.brand.map((b: string) => (
              <span key={b} className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                {b}
                <button 
                  type="button"
                  onClick={() => handleApplyFilters({ ...activeFilters, brand: activeFilters.brand.filter((x: string) => x !== b) })} 
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {(activeFilters.minPrice || activeFilters.maxPrice) && (
              <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                Price: {activeFilters.minPrice || '0'} - {activeFilters.maxPrice || 'Any'}
                <button 
                  type="button"
                  onClick={() => handleApplyFilters({ ...activeFilters, minPrice: '', maxPrice: '' })} 
                  className="hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.rating && (
              <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                ★ {activeFilters.rating}+
                <button 
                  type="button"
                  onClick={() => handleApplyFilters({ ...activeFilters, rating: '' })} 
                  className="hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
        {/* Flex row container for collapsible filters and catalog products */}
        <div className="w-full flex gap-6 items-start mt-4 mb-12">
          {/* Collapsible Filters Sidebar (In-flow, visible on desktop) */}
          <div 
            className={`hidden lg:block shrink-0 bg-white border border-gray-200 rounded shadow-sm p-4 text-left transition-all duration-300 ease-in-out ${
              isFilterOpen ? 'w-72 md:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-0 p-0 shadow-none'
            }`}
          >
            <FiltersSidebar
              selectedCategory={activeFilters.category}
              setSelectedCategory={(cat: string) => handleApplyFilters({ ...activeFilters, category: cat })}
              selectedSubcategory={""}
              setSelectedSubcategory={() => {}}
              selectedBrand={activeFilters.brand[0] || ""}
              setSelectedBrand={(brand: string) => handleApplyFilters({ ...activeFilters, brand: [brand] })}
              minPrice={activeFilters.minPrice}
              setMinPrice={(price: string) => handleApplyFilters({ ...activeFilters, minPrice: price })}
              maxPrice={activeFilters.maxPrice}
              setMaxPrice={(price: string) => handleApplyFilters({ ...activeFilters, maxPrice: price })}
              onApplyFilters={() => {}}
            />
          </div>
          {/* Products List Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">Loading products...</div>
            ) : processedProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 text-text-[#1a1a2e] rounded p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="bg-gray-50 p-6 rounded-full border border-gray-150 mb-4">
                  <SlidersHorizontal className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1a1a2e]">No products found</h3>
                <p className="text-[16px] text-text-secondary max-w-sm mb-6 mt-1.5">
                  We couldn't find any products matching your search or filters. Try adjusting your filters.
                </p>
                {didYouMean && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 px-6 py-3 rounded-lg flex flex-col items-center">
                    <span className="text-sm text-text-secondary mb-1">Did you mean?</span>
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('search', didYouMean);
                        setSearchParams(newParams);
                      }}
                      className="text-[#1a1a2e] font-bold text-lg hover:text-secondary underline decoration-2 decoration-secondary/30 underline-offset-4 cursor-pointer"
                    >
                      {didYouMean}
                    </button>
                  </div>
                )}
                <button
                  onClick={handleClearFilters}
                  className="bg-[#F59E0B] text-[#1a1a2e] font-semibold text-[16px] px-6 py-2.5 rounded hover:bg-amber-500 hover:text-white transition-colors cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 w-full">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
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
                  ))}
                </div>
                {displayedCount < processedProducts.length && (
                  <div className="mt-10 w-full flex justify-center">
                    <button
                      onClick={() => setDisplayedCount(prev => prev + 20)}
                      className="bg-[#1a1a2e] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer shadow-md"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-hidden flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full flex flex-col shadow-xl">
            <div className="bg-[#1a1a2e] text-white px-4 py-4 flex items-center justify-between">
              <span className="text-[18px] font-semibold font-sans">Filter Laptops</span>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <FiltersSidebar
                selectedCategory={activeFilters.category}
                setSelectedCategory={(cat: string) => handleApplyFilters({ ...activeFilters, category: cat })}
                selectedSubcategory={""}
                setSelectedSubcategory={() => {}}
                selectedBrand={activeFilters.brand[0] || ""}
                setSelectedBrand={(brand: string) => handleApplyFilters({ ...activeFilters, brand: [brand] })}
                minPrice={activeFilters.minPrice}
                setMinPrice={(price: string) => handleApplyFilters({ ...activeFilters, minPrice: price })}
                maxPrice={activeFilters.maxPrice}
                setMaxPrice={(price: string) => handleApplyFilters({ ...activeFilters, maxPrice: price })}
                onApplyFilters={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductListingPage;
