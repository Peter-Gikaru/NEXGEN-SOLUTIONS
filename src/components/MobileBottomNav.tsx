import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, setIsCartOpen } = useCart();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      action: () => navigate('/'),
    },
    {
      label: 'Search',
      icon: Search,
      path: '/products',
      action: () => navigate('/products'),
    },
    {
      label: 'Wishlist',
      icon: Heart,
      path: '/wishlist',
      action: () => navigate('/wishlist'),
    },
    {
      label: 'Cart',
      icon: ShoppingBag,
      path: 'cart',
      action: () => setIsCartOpen(true),
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      label: 'Account',
      icon: User,
      path: '/orders',
      action: () => navigate('/orders'),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe md:hidden block">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.path === 'cart' 
            ? false 
            : location.pathname === item.path;

          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-slate-900 transition-all active:scale-90 cursor-pointer relative"
            >
              <div className={`p-1.5 rounded-full transition-colors relative ${isActive ? 'text-[#d97706]' : 'text-slate-500'}`}>
                <Icon className="w-5.5 h-5.5 transition-transform duration-250 hover:scale-105" />
                
                {}
                {item.badge !== undefined && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-sans font-black text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm animate-pulse border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-sans font-extrabold tracking-wider leading-none mt-0.5 ${isActive ? 'text-[#d97706]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
