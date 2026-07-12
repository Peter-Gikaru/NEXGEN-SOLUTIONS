import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/getImageUrl';

export const CartDrawer: React.FC = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeDeliveryThreshold = 50000;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountNeededForFree = freeDeliveryThreshold - subtotal;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl">
          <div className="px-4 py-4 bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-semibold uppercase tracking-wider font-sans">
                Shopping Cart ({cartItems.length})
              </h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-300 hover:text-white p-1.5 rounded-full cursor-pointer hover:bg-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5.5 w-5.5" />
            </button>
          </div>

          {cartItems.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3.5 text-sm text-dark-primary text-left">
              {isFreeDelivery ? (
                <div className="flex items-center gap-1.5 font-semibold text-accent">
                  <span>🎉 Your order qualifies for <strong className="text-accent">FREE EXPRESS DELIVERY</strong>!</span>
                </div>
              ) : (
                <div>
                  Add <strong className="text-danger">{formatPrice(amountNeededForFree)}</strong> more to get <strong className="text-accent">FREE DELIVERY</strong>!
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white">
                <div className="bg-bg-gray p-6 rounded-full border border-gray-200 mb-4">
                  <ShoppingBag className="h-12 w-12 text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-primary font-sans mb-1">Your cart is empty</h3>
                <p className="text-base text-text-secondary max-w-xs mb-6">You have not added any premium laptops or accessories yet.</p>
                <button onClick={() => setIsCartOpen(false)} className="bg-secondary text-primary font-semibold text-base px-6 py-2.5 rounded hover:bg-amber-700 hover:text-white transition-colors cursor-pointer">Start Shopping</button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.product.id}-${item.variant || 'base'}`} className="flex gap-3.5 pb-4 border-b border-gray-150 items-start bg-white">
                  <div className="w-20 h-20 bg-white border border-gray-200 rounded shrink-0 p-1 flex items-center justify-center">
                    <img src={getImageUrl(item.product.imageUrls?.[0] || item.product.image)} alt={item.product.title} className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-base font-semibold text-text-primary line-clamp-2 leading-snug">{item.product.title}</h4>
                    {item.variant && <p className="text-sm font-semibold text-[#F59E0B] mt-0.5">{item.variant}</p>}
                    <p className="text-sm text-text-secondary uppercase mt-0.5">{item.product.brand} | {item.product.category}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-base font-semibold text-dark-primary">{formatPrice(item.product.price)}</span>
                      <div className="flex items-center border border-gray-300 rounded bg-bg-gray">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} className="px-2.5 py-1 hover:bg-gray-200 text-text-primary transition-colors cursor-pointer" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="px-2.5 text-sm font-semibold text-text-primary select-none min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} className="px-2.5 py-1 hover:bg-gray-200 text-text-primary transition-colors cursor-pointer" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id, item.variant)} className="text-text-secondary hover:text-danger p-1 cursor-pointer transition-colors shrink-0" aria-label="Remove item"><Trash2 className="h-5 w-5" /></button>
                </div>
              ))
            )}

            {cartItems.length > 0 && (
              <div className="mt-6 border border-amber-200 bg-amber-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-[#F59E0B]">🔥</span> People are also buying...
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center bg-white p-2 border border-amber-100 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 rounded shrink-0 flex items-center justify-center p-1">
                      <img src="https://images.unsplash.com/photo-1615563821034-722c262ba94a?q=60" alt="Sleeve" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">Waterproof Laptop Sleeve (14-16")</p>
                      <p className="text-xs text-[#F59E0B] font-bold mt-0.5">KES 1,500</p>
                    </div>
                    <button onClick={(e) => {
                       e.preventDefault();
                       navigate('/products');
                       setIsCartOpen(false);
                    }} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-md font-bold hover:bg-slate-700 transition-colors shadow-sm cursor-pointer">Shop</button>
                  </div>
                  
                  <div className="flex gap-3 items-center bg-white p-2 border border-amber-100 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 rounded shrink-0 flex items-center justify-center p-1">
                      <img src="https://images.unsplash.com/photo-1527814050087-379381547384?q=60" alt="Mouse" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">Wireless Ergonomic Mouse</p>
                      <p className="text-xs text-[#F59E0B] font-bold mt-0.5">KES 2,200</p>
                    </div>
                    <button onClick={(e) => {
                       e.preventDefault();
                       navigate('/products');
                       setIsCartOpen(false);
                    }} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-md font-bold hover:bg-slate-700 transition-colors shadow-sm cursor-pointer">Shop</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-bg-gray space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-base text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-base text-text-secondary">
                  <span>Delivery</span>
                  {isFreeDelivery ? <span className="font-semibold text-accent uppercase">Free</span> : <span className="font-semibold text-text-primary">KES 500</span>}
                </div>
                <div className="border-t border-gray-300 pt-2 flex items-center justify-between text-lg font-semibold">
                  <span className="text-primary font-sans">Estimated Total</span>
                  <span className="text-primary">{formatPrice(subtotal + (isFreeDelivery ? 0 : 500))}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="w-full bg-secondary text-primary py-3 rounded font-semibold text-base uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
