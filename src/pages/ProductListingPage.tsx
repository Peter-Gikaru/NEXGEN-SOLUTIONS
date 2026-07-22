import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { SEO } from '../components/SEO';
import type { FilterState } from '../types';
import { buildBreadcrumbs } from '../lib/structured-data';
import { useCategories } from '../hooks/useCategories';

export const ProductListingPage: React.FC = () => {
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getCategoryName = (slug: string) => {
    const findNode = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.slug === slug) return node.name;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const rawName = findNode(categories) || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // Strip "Laptops" or "Laptop" to make it cleaner like a brand, per user request
    return rawName.replace(/\blaptops?\b/gi, '').trim() || rawName;
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const initialFilters = useMemo<FilterState>(() => {
    const category = searchParams.get('category') || '';
    const brandParams = searchParams.getAll('brand');
    const base: FilterState = {
      category,
      brand: brandParams,
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStockOnly: false
    };
    const standardKeys = ['category', 'search', 'brand', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'rating', 'inStockOnly'];
    searchParams.forEach((value, key) => {
      if (!standardKeys.includes(key)) {
        if (!base[key]) base[key] = [];
        if (!(base[key] as string[]).includes(value)) {
          (base[key] as string[]).push(value);
        }
      }
    });
    return base;
  }, [searchParams]);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilters);
  useEffect(() => {
    const updated = { ...initialFilters };
    setActiveFilters(updated);
  }, [searchParams, initialFilters]);
  
  useEffect(() => {
    setPage(1);
  }, [searchParams, activeFilters, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setIsLoading(true);
      try {
        const search = searchParams.get('search') || '';
        const params: any = {
          search,
          limit: 20,
          page,
          sort: sortBy
        };
        const standardKeys = ['category', 'search', 'brand', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'rating', 'inStockOnly'];
        
        if (activeFilters.category) params.category = activeFilters.category;
        if (activeFilters.brand && (activeFilters.brand as string[]).length > 0) params.brand = activeFilters.brand;
        if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
        if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;
        
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (!standardKeys.includes(key) && Array.isArray(value) && value.length > 0) {
            params[key] = value;
          }
        });
        const response = await api.get('/products', { params });
        const mapped = response.data.products.map((p: any) => ({
          id: p.slug,
          slug: p.slug,
          title: p.name,
          category: p.category?.name || 'Uncategorized',
          brand: p.brand,
          price: p.price,
          originalPrice: p.compareAtPrice || p.price,
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          image: p.imageUrls[0] || '',
          hoverImage: p.imageUrls[1] || undefined,
          discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
          stockStatus: p.stock > 5 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
          description: p.description,
          isVerified: true,
          specs: p.specs
        }));
        
        if (page === 1) {
          setProducts(mapped);
        } else {
          setProducts(prev => [...prev, ...mapped]);
        }
        
        setHasMore(page < response.data.totalPages);
        setTotalCount(response.data.total);
        setDidYouMean(response.data.didYouMean || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, activeFilters, sortBy, page]);
  const handleApplyFilters = (newFilters: FilterState) => {
    setIsLoading(true);
    setActiveFilters(newFilters);
    setIsMobileFiltersOpen(false);
    const params = new URLSearchParams();
    const searchVal = searchParams.get('search');
    if (searchVal) params.append('search', searchVal);
    if (newFilters.category) params.append('category', newFilters.category as string);
    if (newFilters.brand && (newFilters.brand as string[]).length > 0) {
      (newFilters.brand as string[]).forEach(b => params.append('brand', b));
    }
    const standardKeys = ['category', 'search', 'brand', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'rating', 'inStockOnly'];
    Object.entries(newFilters).forEach(([key, value]) => {
      if (!standardKeys.includes(key) && Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      }
    });
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
  const processedProducts = products;
  const visibleProducts = products;
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
            Found {totalCount} items
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
            Displaying {totalCount} products
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
        {(Object.entries(activeFilters).some(([key, val]) => {
          if (['category', 'minPrice', 'maxPrice', 'rating'].includes(key)) return !!val;
          if (Array.isArray(val)) return val.length > 0;
          return false;
        })) && (
          <div className="flex flex-wrap gap-2 items-center text-[14px] select-none text-left">
            <span className="text-text-secondary font-medium">Active:</span>
            {activeFilters.category && (
              <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                {getCategoryName(activeFilters.category)}
                <button 
                  type="button"
                  onClick={() => handleApplyFilters({ ...activeFilters, category: '' })} 
                  className="hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.brand && activeFilters.brand.map((b: string) => (
              <span key={`brand-${b}`} className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
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
            {Object.entries(activeFilters)
              .filter(([key, val]) => !['category', 'brand', 'minPrice', 'maxPrice', 'rating', 'inStockOnly'].includes(key) && Array.isArray(val) && val.length > 0)
              .map(([key, valArray]) => 
                (valArray as string[]).map((val: string) => (
                  <span key={`${key}-${val}`} className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
                    {val}
                    <button 
                      type="button"
                      onClick={() => handleApplyFilters({ ...activeFilters, [key]: (activeFilters[key as keyof FilterState] as string[]).filter((x: string) => x !== val) })} 
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
            )}
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
              filters={activeFilters}
              onChange={handleApplyFilters}
            />
          </div>
          {}
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
                <div className="grid gap-2 md:gap-4 w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
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
                      condition={product.condition}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-10 w-full flex justify-center">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
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
                filters={activeFilters}
                onChange={handleApplyFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductListingPage;
