import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Plus } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/getImageUrl';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';

export const ComparePage: React.FC = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const getSpecValue = (product: any, key: string) => {
    return product.specs?.[key] || '-';
  };

  const specKeys = ['cpu', 'ram', 'storage', 'screenSize', 'condition', 'warranty'];

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
        <SEO title="Compare Laptops | NexGen Gadgets" description="Compare laptops side by side" url="/compare" />
        <div className="text-center max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4">No Laptops to Compare</h2>
            <p className="text-gray-500 mb-6">You haven't added any laptops to your compare list yet. Add up to 4 laptops to see them side-by-side.</p>
            <Link to="/products" className="inline-block bg-[#F59E0B] text-white font-bold py-3 px-8 rounded-xl shadow hover:bg-amber-500 transition-colors">
              Browse Laptops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <SEO title="Compare Laptops | NexGen Gadgets" description="Compare laptops side by side" url="/compare" />
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Compare Laptops</h1>
            <p className="text-gray-500 mt-1">Comparing {compareItems.length} of 4 allowed items</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-gray-500 hover:text-red-500 font-semibold text-sm transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <Link to="/products" className="bg-[#1a1a2e] text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add More
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-6 border-b border-gray-200 bg-slate-50 w-48 sticky left-0 z-10 shadow-[1px_0_0_#e5e7eb]">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Product Info</span>
                </th>
                {compareItems.map(item => (
                  <th key={item.id} className="p-6 border-b border-gray-200 border-l relative min-w-[250px] align-top bg-white">
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col items-center text-center mt-2">
                      <div className="w-32 h-32 mb-4">
                        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase mb-2">
                        {item.brand}
                      </span>
                      <Link to={`/product/${item.slug || item.id}`} className="font-bold text-[#1a1a2e] hover:text-[#F59E0B] transition-colors line-clamp-2 mb-2 min-h-[48px]">
                        {item.title}
                      </Link>
                      <div className="text-xl font-bold text-[#F59E0B] mb-4">
                        {formatPrice(item.price)}
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-[#1a1a2e] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specKeys.map((key) => (
                <tr key={key} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 bg-slate-50 border-r border-gray-200 sticky left-0 z-10 shadow-[1px_0_0_#e5e7eb]">
                    <span className="font-bold text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={`${item.id}-${key}`} className="p-4 border-l border-gray-200 text-center">
                      <span className="text-sm font-medium text-gray-800">
                        {getSpecValue(item, key)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
