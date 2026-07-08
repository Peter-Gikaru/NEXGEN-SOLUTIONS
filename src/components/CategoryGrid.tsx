import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Briefcase, 
  GraduationCap, 
  Apple, 
  MousePointer, 
  RefreshCw 
} from 'lucide-react';
export const CategoryGrid: React.FC = () => {
  const categories = [
    { 
      name: 'Gaming Laptops', 
      icon: Gamepad2, 
      count: '18 laptops',
      color: 'bg-red-50 text-red-600 border-red-100'
    },
    { 
      name: 'Business Laptops', 
      icon: Briefcase, 
      count: '32 laptops',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      name: 'Student Laptops', 
      icon: GraduationCap, 
      count: '29 laptops',
      color: 'bg-green-50 text-green-600 border-green-100'
    },
    { 
      name: 'MacBooks', 
      icon: Apple, 
      count: '15 MacBooks',
      color: 'bg-slate-50 text-[#1a1a2e] border-slate-200'
    },
    { 
      name: 'Accessories', 
      icon: MousePointer, 
      count: '84 items',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    { 
      name: 'Refurbished', 
      icon: RefreshCw, 
      count: '43 laptops',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];
  return (
    <section className="mb-6 text-left">
      <h2 className="text-sm font-black text-white uppercase mb-3 select-none">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-black/60 border border-white/10 text-white rounded p-4 flex items-center gap-3.5 hover:shadow hover:scale-[1.01] transition-all duration-150 select-none cursor-pointer"
            >
              {}
              <div className={`p-3 rounded border shrink-0 ${cat.color}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              {}
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-[#1a1a2e] transition-colors duration-100 leading-snug uppercase">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-300 font-medium mt-0.5 block">
                  {cat.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
