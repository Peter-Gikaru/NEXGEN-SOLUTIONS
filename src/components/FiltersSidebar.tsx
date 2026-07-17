import React, { useState } from 'react';
import { useCategories, type CategoryNode } from '../hooks/useCategories';
import { Filter, ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { FilterState } from '../types';

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
  const brands = ['HP', 'Dell', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Samsung', 'MSI', 'Generic'];
  const cpus = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'];
  const rams = ['4GB', '8GB', '16GB', '32GB', '64GB'];
  const storages = ['128GB', '256GB', '512GB', '1TB', '2TB'];
  const conditions = ['New', 'Refurbished', 'Ex-UK'];

  
  const handleStringArrayToggle = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const isSelected = current.includes(value);
    onChange({
      ...filters,
      [key]: isSelected ? current.filter(x => x !== value) : [...current, value]
    });
  };

  const handleBrandSelect = (brand: string) => {
    onChange({ ...filters, brand: brand ? [brand] : [] });
  };
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true,
    cpu: false,
    ram: false,
    storage: false,
    condition: false
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedCategory = filters.category;
  const selectedBrand = filters.brand[0] || '';
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-700" />
        <h2 className="font-sans font-bold text-lg text-slate-800">Filters</h2>
      </div>
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin divide-y divide-slate-100">
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
                    onChange={() => handleBrandSelect(brand)}
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
                  onChange={() => handleBrandSelect('')}
                  className="hidden"
                />
                <span className={`text-sm ${!selectedBrand ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>All Brands</span>
              </label>
            </div>
          )}
        </div>

        {/* Price Range */}
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
        
        {/* CPU */}
        <div className="pt-6">
          <button 
            type="button"
            onClick={() => toggleSection('cpu')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Processor (CPU)</span>
            {expanded.cpu ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.cpu && (
            <div className="space-y-3">
              {cpus.map((cpu) => {
                const isSelected = filters.cpu.includes(cpu);
                return (
                  <label key={cpu} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStringArrayToggle('cpu', cpu)}
                      className="hidden"
                    />
                    <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cpu}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* RAM */}
        <div className="pt-6">
          <button 
            type="button"
            onClick={() => toggleSection('ram')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Memory (RAM)</span>
            {expanded.ram ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.ram && (
            <div className="space-y-3">
              {rams.map((ram) => {
                const isSelected = filters.ram.includes(ram);
                return (
                  <label key={ram} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStringArrayToggle('ram', ram)}
                      className="hidden"
                    />
                    <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{ram}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Storage */}
        <div className="pt-6">
          <button 
            type="button"
            onClick={() => toggleSection('storage')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Storage Capacity</span>
            {expanded.storage ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.storage && (
            <div className="space-y-3">
              {storages.map((storage) => {
                const isSelected = filters.storage.includes(storage);
                return (
                  <label key={storage} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStringArrayToggle('storage', storage)}
                      className="hidden"
                    />
                    <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{storage}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="pt-6 pb-2">
          <button 
            type="button"
            onClick={() => toggleSection('condition')}
            className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 select-none cursor-pointer focus:outline-none"
          >
            <span>Condition</span>
            {expanded.condition ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
          {expanded.condition && (
            <div className="space-y-3">
              {conditions.map((cond) => {
                const isSelected = filters.condition.includes(cond);
                return (
                  <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white group-hover:border-[#F59E0B]'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStringArrayToggle('condition', cond)}
                      className="hidden"
                    />
                    <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cond}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
