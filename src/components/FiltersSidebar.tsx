import React, { useState } from 'react';
import { useCategories, type CategoryNode } from '../hooks/useCategories';
import { Filter, ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { FilterState } from '../types';
import api from '../services/api';

interface FiltersSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}
const RecursiveCategoryFilter: React.FC<{
  node: CategoryNode;
  level: number;
  selectedCategory: string;
  onSelect: (slug: string) => void;
}> = ({ node, level, selectedCategory, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedCategory === node.slug;
  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-amber-50 text-[#F59E0B] font-bold' : 'text-slate-600 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${(level * 16) + 12}px` }}
      >
        <span 
          className="flex-1 truncate"
          onClick={() => {
            onSelect(isSelected ? '' : node.slug);
          }}
        >
          {node.name}
        </span>
        {hasChildren && (
          <button 
            aria-label={isExpanded ? "Collapse category" : "Expand category"}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-slate-200 rounded shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="flex flex-col mt-1">
          {node.children.map(child => (
            <RecursiveCategoryFilter
              key={child.id}
              node={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onChange
}) => {
  const { categories, loading } = useCategories();
  const [brands, setBrands] = useState<string[]>(['HP', 'Dell', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Samsung', 'MSI']);
  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, string[]>>({});
  
  React.useEffect(() => {
    api.get('/products/meta/filters')
      .then(res => {
        if (res.data?.brands?.length > 0) {
          // Ensure brands are strings (API might return objects)
          const formattedBrands = res.data.brands.map((b: any) => typeof b === 'string' ? b : (b.name || b._id || String(b)));
          setBrands(formattedBrands);
        }
        if (res.data?.dynamicSpecs) {
          // Ensure dynamic specs values are strings
          const formattedSpecs: Record<string, string[]> = {};
          Object.entries(res.data.dynamicSpecs).forEach(([key, values]: [string, any]) => {
            if (Array.isArray(values)) {
              formattedSpecs[key] = values.map((v: any) => typeof v === 'string' ? v : (v.name || v.value || String(v)));
            } else {
              formattedSpecs[key] = [];
            }
          });
          setDynamicSpecs(formattedSpecs);
        }
      })
      .catch(err => console.error('Failed to load dynamic filters:', err));
  }, []);

  const handleStringArrayToggle = (key: string, value: string) => {
    const filterVal = filters[key as keyof FilterState];
    const current = Array.isArray(filterVal) ? filterVal : (filterVal ? [String(filterVal)] : []);
    const isSelected = current.includes(value);
    onChange({
      ...filters,
      [key]: isSelected ? current.filter(x => x !== value) : [...current, value]
    });
  };


  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedCategory = filters.category || '';
  return (
    <div className="flex flex-col h-full w-full">
      <div className="pb-4 mb-4 border-b border-slate-200 flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-700" />
        <h2 className="font-sans font-bold text-lg text-slate-800">Filters</h2>
      </div>
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin divide-y divide-slate-100 pr-2">
        {/* Categories */}
        <div className="pt-0">
          <button 
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Categories</span>
            {expanded.categories ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.categories && (
            loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-6 bg-slate-100 rounded animate-pulse w-full"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div 
                  className={`py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                    !selectedCategory ? 'bg-amber-50 text-[#F59E0B] font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => onChange({ ...filters, category: '' })}
                >
                  All Products
                </div>
                {categories.map((cat) => (
                  <RecursiveCategoryFilter
                    key={cat.id}
                    node={cat}
                    level={0}
                    selectedCategory={selectedCategory}
                    onSelect={(slug) => onChange({ ...filters, category: slug })}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Brands */}
        <div className="pt-6">
          <button 
            type="button"
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Brands</span>
            {expanded.brands ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.brands && (
            <div className="space-y-3">
              {brands.map((brand) => {
                const currentBrands = Array.isArray(filters.brand) ? filters.brand : (filters.brand ? [String(filters.brand)] : []);
                const isSelected = currentBrands.includes(brand);
                return (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    name="brand"
                    value={brand}
                    checked={isSelected}
                    onChange={() => handleStringArrayToggle('brand', brand)}
                    className="sr-only"
                  />
                  <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{brand}</span>
                </label>
              )})}
            </div>
          )}
        </div>

        {}
        <div className="pt-6">
          <button 
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Price Range (KES)</span>
            {expanded.price ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.price && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
            </div>
          )}
        </div>
        
        {Object.entries(dynamicSpecs)
          .filter(([specKey]) => {
             const lowerKey = specKey.toLowerCase();
             const standardKeys = ['category', 'search', 'brand', 'brands', '.brands', 'sort', 'page', 'limit', 'minprice', 'maxprice', 'rating', 'instockonly'];
             return !standardKeys.includes(lowerKey);
          })
          .map(([specKey, specValues]) => (
          <div key={specKey} className="pt-6">
            <button 
              type="button"
              onClick={() => toggleSection(specKey)}
              className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
            >
              <span>{specKey.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}</span>
              {expanded[specKey] ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
            </button>
            {expanded[specKey] && (
              <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                {specValues.map((val) => {
                  const filterVal = filters[specKey as keyof FilterState];
                  const currentFilters = Array.isArray(filterVal) ? filterVal : (filterVal ? [String(filterVal)] : []);
                  const isSelected = currentFilters.includes(val);
                  return (
                    <label key={val} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStringArrayToggle(specKey, val)}
                        className="sr-only"
                      />
                      <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{val}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
