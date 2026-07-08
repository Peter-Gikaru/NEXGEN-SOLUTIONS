import React, { useState } from 'react';
import { useCategories, type CategoryNode } from '../hooks/useCategories';
import { Filter, ChevronDown, ChevronRight, Check } from 'lucide-react';
interface FiltersSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  onApplyFilters: () => void;
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
            onSelect(isSelected ? '' : node.slug); // toggle
          }}
        >
          {node.name}
        </span>
        {hasChildren && (
          <button 
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
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApplyFilters
}) => {
  const { categories, loading } = useCategories();
  // Some standard brands for filtering
  const brands = ['HP', 'Dell', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Samsung', 'MSI', 'Generic'];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-700" />
        <h2 className="font-sans font-bold text-lg text-slate-800">Filters</h2>
      </div>
      <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
        {}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            Categories
          </h3>
          {loading ? (
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
                onClick={() => setSelectedCategory('')}
              >
                All Products
              </div>
              {categories.map((cat) => (
                <RecursiveCategoryFilter
                  key={cat.id}
                  node={cat}
                  level={0}
                  selectedCategory={selectedCategory}
                  onSelect={(slug) => setSelectedCategory(slug)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Brands */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Brands</h3>
          <div className="space-y-3">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedBrand === brand ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                  {selectedBrand === brand && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={selectedBrand === brand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="hidden"
                />
                <span className={`text-sm ${selectedBrand === brand ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{brand}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${!selectedBrand ? 'bg-slate-200 border-slate-300' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                {!selectedBrand && <Check className="h-3.5 w-3.5 text-slate-500" />}
              </div>
              <input
                type="radio"
                name="brand"
                value=""
                checked={!selectedBrand}
                onChange={() => setSelectedBrand('')}
                className="hidden"
              />
              <span className={`text-sm ${!selectedBrand ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>All Brands</span>
            </label>
          </div>
        </div>
        {}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Price Range (KES)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
              />
            </div>
          </div>
        </div>
        <button
          onClick={onApplyFilters}
          className="w-full bg-[#F59E0B] hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm text-sm uppercase tracking-wide"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
