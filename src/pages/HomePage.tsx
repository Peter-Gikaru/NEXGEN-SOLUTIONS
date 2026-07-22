import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Carousel } from '../components/Carousel';
import { FlashDeals } from '../components/FlashDeals';
import { ProductGrid } from '../components/ProductGrid';
import { TrustBadges } from '../components/TrustBadges';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { ProductCard } from '../components/ProductCard';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { SEO } from '../components/SEO';
export const HomePage: React.FC = () => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'NexGen Gadgets',
    'url': 'https://yourdomain.co.ke',
    'logo': 'https://yourdomain.co.ke/favicon.png',
    'description': 'Buy laptops in Kenya from top brands like HP, Dell, Lenovo, and Apple. Genuine products, best prices, fast delivery, and warranty included.',
    'telephone': '+254717043408',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'KE',
      'addressLocality': 'Nairobi'
    },
    'sameAs': [
    ]
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'NexGen Gadgets',
    'url': 'https://yourdomain.co.ke',
    'description': 'Best Laptops in Kenya | NexGen Gadgets',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://yourdomain.co.ke/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);
  useEffect(() => {
    const searchVal = searchParams.get('search');
    const catVal = searchParams.get('category');
    if (catVal) {
      setSelectedCategory(catVal);
    }
    if (searchVal || catVal) {
      const catalogEl = document.getElementById('main-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);
  useEffect(() => {
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
          id: p.id,
          slug: p.slug,
          title: p.name,
          category: p.category.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.compareAtPrice || p.price,
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          image: p.imageUrls[0] || '',
          hoverImage: p.imageUrls[1] || undefined,
          discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
          stockStatus: 'in_stock',
          stockCount: p.stock,
          isVerified: true,
          description: p.description
        }));
        setProducts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);
  const filteredProducts = useMemo(() => {
    let result = [...products];
    const searchQuery = searchParams.get('search') || '';
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [selectedCategory, selectedBrands, minPrice, maxPrice, sortBy, searchParams, products]);
  useEffect(() => {
    setDisplayedCount(20);
  }, [selectedCategory, selectedBrands, minPrice, maxPrice, sortBy, searchParams]);
  const visibleProducts = filteredProducts.slice(0, displayedCount);
  const handleBrandCheckboxChange = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recommended');
    setSearchParams({});
  };
  
  const searchQuery = searchParams.get('search');
  
  const seoTemplates = useMemo(() => {
    const templates = [
      {
        title: "Discover Your Next Laptop | NexGen Gadgets Kenya",
        description: "Explore our curated collection of premium laptops and accessories. Unleash your productivity with cutting-edge tech tailored for you."
      },
      {
        title: "Top-Tier Tech & Laptops in Kenya | NexGen Gadgets",
        description: "From creative powerhouses to sleek office laptops, find exactly what you need to upgrade your digital lifestyle. Authentic devices with full warranty."
      },
      {
        title: "NexGen Gadgets | Elevate Your Setup",
        description: "Level up your workflow with industry-leading electronics. Shop the latest devices in Kenya, featuring unmatched performance and reliability."
      },
      {
        title: "Premium Computing Redefined | NexGen Gadgets",
        description: "Your ultimate destination for high-performance laptops and gear in Nairobi. Smart choices, competitive pricing, and fast delivery."
      }
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-gray">
      <SEO 
        title={seoTemplates.title}
        description={seoTemplates.description}
        url="/"
        schema={[organizationSchema, websiteSchema]}
      />
      {}
      <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 pt-4 relative z-20">
        {}
        <div className="w-full rounded overflow-hidden shadow-sm h-[250px] md:h-[350px]">
          <Carousel />
        </div>
      </div>
      {}
      <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 pt-6 flex flex-col gap-6">
        {}
        <TrustBadges />
        {}
        <FlashDeals />
        {}
        <ProductGrid products={products} onShopNowClick={(category, brand, search) => {
          setSelectedCategory(category);
          if (brand) {
            setSelectedBrands([brand]);
          } else {
            setSelectedBrands([]);
          }
          setMinPrice('');
          setMaxPrice('');
          const params: Record<string, string> = { category };
          if (brand) params.brand = brand;
          if (search) params.search = search;
          setSearchParams(params);
          const el = document.getElementById('main-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} />
        {}
        <TrustBadges />
        {}
        <section id="main-catalog" className="w-full border-t border-gray-200 pt-6 scroll-mt-24">
          {}
          <div className="text-left mb-6">
            <h2 className="text-3xl font-semibold text-primary font-sans leading-none tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory || 'Browse All Products'}
            </h2>
            <p className="text-[16px] text-text-secondary mt-2">
              Found {filteredProducts.length} premium laptops match in our catalog
            </p>
          </div>
          <div className="w-full flex flex-col gap-4 mb-12 relative">
            {}
            <div className="bg-white border border-gray-200 text-text-primary rounded px-4 py-3 flex items-center justify-between shadow-sm select-none relative z-30">
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
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-350 rounded px-3.5 py-2 text-[14px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <SlidersHorizontal className="h-5 w-5 text-secondary" />
                  <span>Filter</span>
                </button>
              </div>
              <span className="hidden lg:inline text-[16px] font-medium text-text-secondary">
                Displaying {filteredProducts.length} models
              </span>
              {}
              <div className="flex items-center gap-2 text-[16px]">
                <span className="text-text-secondary">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded pl-3 pr-8 py-1.5 font-semibold text-text-primary focus:outline-none focus:border-secondary cursor-pointer text-[14px]"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low-High</option>
                    <option value="price-desc">Price: High-Low</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>
            {}
            {(selectedCategory || selectedBrands.length > 0 || minPrice || maxPrice) && (
              <div className="flex flex-wrap gap-2 items-center text-[14px] select-none text-left">
                <span className="text-text-secondary font-medium">Active:</span>
                {selectedCategory && (
                  <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} className="hover:text-red-500 cursor-pointer">×</button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span key={b} className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    {b}
                    <button onClick={() => handleBrandCheckboxChange(b)} className="hover:text-red-500 cursor-pointer">×</button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="bg-emerald-50 text-accent border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    Price: {minPrice || '0'} - {maxPrice || 'Any'}
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 cursor-pointer">×</button>
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
                filters={{
                  category: selectedCategory,

                  minPrice: minPrice,
                  maxPrice: maxPrice,
                  brand: selectedBrands,
                  cpu: [],
                  ram: [],
                  storage: [],
                  condition: [],
                  generation: [],
                  rating: '',
                  inStockOnly: false


                }}
                onChange={(newFilters: any) => {
                  const f = typeof newFilters === 'function' ? newFilters({
                    category: selectedCategory,
  
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    brand: selectedBrands,
                    cpu: [],
                    ram: [],
                    storage: [],
                    condition: [],
                  generation: [],
                  rating: '',
                  inStockOnly: false
  
  
                  }) : newFilters;
                  if (f.category !== selectedCategory) setSelectedCategory(f.category || '');
                  if (f.minPrice !== minPrice) setMinPrice(f.minPrice);
                  if (f.maxPrice !== maxPrice) setMaxPrice(f.maxPrice);
                  if (f.brand !== selectedBrands) setSelectedBrands(f.brand || []);
                }}

              />
            </div>
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid gap-2 md:gap-4 w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white border border-gray-200 rounded p-4 h-[350px] flex flex-col gap-4">
                      <div className="w-full bg-gray-200 aspect-square rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                      <div className="mt-auto w-full h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-gray-200 text-text-primary rounded p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <X className="h-12 w-12 text-gray-300 mb-3" />
                  <h4 className="text-[18px] font-semibold text-primary">No matching models found</h4>
                  <p className="text-[16px] text-text-secondary max-w-sm mt-1.5 mb-6">
                    Try adjusting your filters, price limits, or key queries in the search box.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-secondary text-primary font-semibold text-[16px] px-6 py-2.5 rounded hover:bg-amber-700 hover:text-white transition-colors duration-150 cursor-pointer shadow-sm"
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
                  {displayedCount < filteredProducts.length && (
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
      </section>
      <RecentlyViewed />
      </div>
      {}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-hidden flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full flex flex-col shadow-2xl">
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
                filters={{
                  category: selectedCategory,

                  minPrice: minPrice,
                  maxPrice: maxPrice,
                  brand: selectedBrands,
                  cpu: [],
                  ram: [],
                  storage: [],
                  condition: [],
                  generation: [],
                  rating: '',
                  inStockOnly: false


                }}
                onChange={(newFilters: any) => {
                  const f = typeof newFilters === 'function' ? newFilters({
                    category: selectedCategory,
  
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    brand: selectedBrands,
                    cpu: [],
                    ram: [],
                    storage: [],
                    condition: [],
                  generation: [],
                  rating: '',
                  inStockOnly: false
  
  
                  }) : newFilters;
                  if (f.category !== selectedCategory) setSelectedCategory(f.category || '');
                  if (f.minPrice !== minPrice) setMinPrice(f.minPrice);
                  if (f.maxPrice !== maxPrice) setMaxPrice(f.maxPrice);
                  if (f.brand !== selectedBrands) setSelectedBrands(f.brand || []);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HomePage;
