import React, { useEffect } from 'react';
import { ArrowLeft, ShoppingCart, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
export const HowToShopPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="How to Shop | NexGen Gadgets"
        description="A step-by-step guide on how to place an order, make a payment, and receive your delivery on NexGen Gadgets."
        url="/how-to-shop"
      />
      <div className="max-w-4xl mx-auto w-full flex-1">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#F59E0B] mb-8 font-semibold transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm mb-12">
          <div className="text-center mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-bold text-slate-900">How to Shop on NexGen</h1>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Your step-by-step guide to finding the perfect laptop, placing your order securely, and getting it delivered fast.</p>
          </div>
          <div className="space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#F59E0B] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-1">1. Find Your Product</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Browse our catalog using categories, filters (by brand, price), or the search bar. Once you find the laptop or accessory you want, click "Add to Cart". You can review your items in the slide-out cart drawer.
                </p>
              </div>
            </div>
            {}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-1">2. Secure Checkout</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Proceed to Checkout. You will be prompted to enter your shipping details and select a payment method. We support secure M-PESA payments as well as Visa/Mastercard. All transactions are securely encrypted.
                </p>
              </div>
            </div>
            {}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Truck className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-1">3. Fast Delivery</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Once payment is confirmed, your order is dispatched. We offer Same-Day delivery for Nairobi CBD and 2-3 business days for countrywide shipping. You will receive a tracking number to monitor your package.
                </p>
              </div>
            </div>
            {}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-1">4. Enjoy Your Purchase</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Receive your item securely. Every purchase is backed by our 7-Day Easy Return policy and standard manufacturer warranties. If you need help, our customer support is available 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
