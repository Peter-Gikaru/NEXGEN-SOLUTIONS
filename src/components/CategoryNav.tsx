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
        <div className="flex items-center gap-8 h-14">
          
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center gap-3 bg-[#F59E0B] hover:bg-amber-500 text-white px-6 h-full font-bold uppercase tracking-wide text-sm transition-colors rounded-t-xl rounded-b-none mt-2">
              <Menu className="h-5 w-5" />
              <span>All Categories</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-[280px] bg-white border border-slate-200 shadow-2xl rounded-b-xl rounded-tr-xl py-3 z-50 animate-fade-in origin-top-left">
                <ul className="flex flex-col">
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

          <nav className="flex items-center gap-8 font-sans font-bold text-sm text-slate-700">
            <Link to="/" className="hover:text-[#F59E0B] transition-colors h-14 flex items-center uppercase">HOME</Link>
            {categories.slice(0, 4).map(cat => (
              <div key={cat.id} className="relative group cursor-pointer h-14 flex items-center">
                <span onClick={() => handleSelect(cat.slug)} className="hover:text-[#F59E0B] transition-colors uppercase">{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[200px] bg-white border border-slate-200 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <ul className="flex flex-col">
                      {cat.children.map(child => (
                        <RecursiveMenuItem 
                          key={child.id} 
                          node={child} 
                          level={1} 
                          onSelect={handleSelect} 
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <Link to="/products" className="hover:text-[#F59E0B] transition-colors h-14 flex items-center uppercase">ALL PRODUCTS</Link>
            <Link to="/track" className="hover:text-[#F59E0B] transition-colors h-14 flex items-center uppercase">TRACK ORDER</Link>
          </nav>

        </div>
      </div>
    </div>
  );
};
