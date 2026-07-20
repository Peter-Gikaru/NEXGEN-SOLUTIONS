import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useCategories, type CategoryNode } from '../hooks/useCategories';

const RecursiveMenuItem: React.FC<{
  node: CategoryNode;
  level: number;
  onSelect: (slug: string) => void;
}> = ({ node, level, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={() => {
          if (!hasChildren) {
            onSelect(node.slug);
          }
        }}
        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
          isHovered ? 'bg-amber-50 text-[#F59E0B]' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          {level === 0 && (node.icon || <Layers className="h-5 w-5 text-slate-400" />)}
          <span className={`font-semibold ${level === 0 ? 'text-base' : 'text-sm'}`}>{node.name}</span>
        </div>
        {hasChildren && <ChevronRight className="h-4 w-4 text-slate-400" />}
      </div>
      
      {hasChildren && isHovered && (
        <ul className="absolute left-full top-0 min-w-[220px] bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 ml-1">
          {node.children.map(child => (
            <RecursiveMenuItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onSelect={onSelect} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const CategoryNav: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { categories } = useCategories();
  const navigate = useNavigate();

  const handleSelect = (slug: string) => {
    setIsDropdownOpen(false);
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm relative z-40 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 xl:gap-8 h-14">
          
          <div 
            className="relative h-full flex items-end"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className={`flex items-center gap-3 px-6 h-12 font-bold uppercase tracking-wide text-sm transition-colors rounded-t-lg ${
              isDropdownOpen 
                ? 'bg-white border-t border-l border-r border-slate-200 text-[#1a1a2e]' 
                : 'bg-[#F59E0B] text-white hover:bg-amber-500'
            }`}>
              <Menu className="h-5 w-5" />
              <span>All Categories</span>
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-[280px] bg-white border border-slate-200 border-t-0 shadow-2xl rounded-b-xl rounded-tr-xl py-3 z-50 origin-top-left -mt-[1px]">
                {}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white z-10" style={{ width: 'calc(100% - 2px)' }}></div>
                <ul className="flex flex-col relative z-20">
                  {categories.map((cat) => (
                    <RecursiveMenuItem 
                      key={cat.id} 
                      node={cat} 
                      level={0} 
                      onSelect={handleSelect} 
                    />
                  ))}
                  {categories.length === 0 && (
                    <li className="px-4 py-3 text-slate-500 text-sm">No categories found</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-4 xl:gap-6 font-sans font-bold text-[13px] text-slate-700 h-full overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-[#F59E0B] transition-colors flex items-center h-full uppercase whitespace-nowrap">HOME</Link>
            <Link to="/products" className="hover:text-[#F59E0B] transition-colors flex items-center h-full uppercase whitespace-nowrap">ALL PRODUCTS</Link>
            
            {/* Dynamic Categories (All) */}
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/products?category=${encodeURIComponent(cat.slug)}`} 
                className="hover:text-[#F59E0B] transition-colors flex items-center h-full uppercase whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}

            <Link to="/track" className="hover:text-[#F59E0B] transition-colors flex items-center h-full uppercase whitespace-nowrap">TRACK ORDER</Link>
          </nav>


        </div>
      </div>
    </div>
  );
};
