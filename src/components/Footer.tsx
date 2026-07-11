import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
export const Footer: React.FC = () => {
  const { addToast } = useCart();
  const [email, setEmail] = useState('');
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          throw new Error('VITE_API_URL must be configured');
        }
        const csrfToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
        const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': decodeURIComponent(csrfToken) } : {}),
          },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await response.json();
        if (response.ok) {
          addToast(data.message || `Subscribed successfully!`);
          setEmail('');
        } else {
          addToast(data.message || 'Failed to subscribe');
        }
      } catch (error) {
        addToast('An error occurred. Please try again.');
      } finally {

      }
    }
  };
  return (
    <footer className="w-full bg-[#1a1a2e] text-white border-t border-slate-800 mt-12 pb-20 md:pb-8 select-none">
      {/* Newsletter Banner */}
      <div className="border-b border-slate-800 bg-slate-900/50 py-8">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-semibold font-sans text-[#F59E0B] uppercase tracking-wider">New to NexGen Gadgets?</h3>
            <p className="text-[16px] text-gray-300 mt-1">Subscribe to our newsletter to get updates on our latest premium laptop deals!</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md shrink-0 gap-2 font-sans">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Enter E-mail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[16px] bg-white text-text-primary rounded border border-gray-600 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#F59E0B] text-primary font-semibold text-[16px] px-6 py-2.5 rounded hover:bg-amber-500 hover:text-white transition-colors duration-150 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
        {/* Col 1: Customer Service */}
        <div>
          <h4 className="text-[18px] font-semibold font-sans text-[#F59E0B] mb-4">Customer Service</h4>
          <ul className="space-y-2.5 text-[16px] text-gray-300">
            <li><Link to="/faq" className="hover:text-[#F59E0B] transition-colors">Help Center & FAQs</Link></li>
            <li><Link to="/shipping" className="hover:text-[#F59E0B] transition-colors">Delivery Timelines</Link></li>
            <li><Link to="/returns" className="hover:text-[#F59E0B] transition-colors">Return Policy & Refunds</Link></li>
            <li><Link to="/how-to-shop" className="hover:text-[#F59E0B] transition-colors">How to Shop on NexGen Gadgets</Link></li>
            <li><Link to="/faq" className="hover:text-[#F59E0B] transition-colors">Report a Product / Dispute</Link></li>
          </ul>
        </div>
        {/* Col 2: Information */}
        <div>
          <h4 className="text-[18px] font-semibold font-sans text-[#F59E0B] mb-4">Information</h4>
          <ul className="space-y-2.5 text-[16px] text-gray-300">
              <li><a href="mailto:support@nexgen-gadgets.com" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Contact Us</a></li>
              <li><Link to="/track" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> FAQs</Link></li>
            <li><Link to="/terms" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Privacy & Cookie Notice</Link></li>
            <li><Link to="/" className="hover:text-[#F59E0B] transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Official Laptop Stores</Link></li>
          </ul>
        </div>
        {/* Col 3: My Account */}
        <div>
          <h4 className="text-[18px] font-semibold font-sans text-[#F59E0B] mb-4">My Account</h4>
          <ul className="space-y-2.5 text-[16px] text-gray-300">
            <li><Link to="/orders" className="hover:text-[#F59E0B] transition-colors">My Profile Details</Link></li>
            <li><Link to="/track" className="hover:text-[#F59E0B] transition-colors">Track My Order</Link></li>
            <li><Link to="/orders" className="hover:text-[#F59E0B] transition-colors">Order History</Link></li>
            <li><Link to="/products" className="hover:text-[#F59E0B] transition-colors">My Saved Items / Wishlist</Link></li>
            <li><Link to="/orders" className="hover:text-[#F59E0B] transition-colors">Address Book</Link></li>
          </ul>
        </div>
        {/* Col 4: Follow Us */}
        <div>
          <h4 className="text-[18px] font-semibold font-sans text-[#F59E0B] mb-4">Follow Us</h4>
          <div className="flex items-center gap-3.5 mb-6">
            <a href="https://facebook.com/nexgengadgets" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-[#F59E0B] hover:text-primary transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://twitter.com/nexgengadgets" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-[#F59E0B] hover:text-primary transition-colors" aria-label="Twitter">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="https://instagram.com/nexgengadgets" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-[#F59E0B] hover:text-primary transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://youtube.com/nexgengadgets" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-[#F59E0B] hover:text-primary transition-colors" aria-label="Youtube">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-gray-400">
            <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />
            <span>100% Verified Genuine Products</span>
          </div>
        </div>
      </div>
      {/* Payment Badges & Copyright Row */}
      <div className="border-t border-slate-850 bg-slate-950 py-8 text-center">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Payment Badges */}
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-[14px] uppercase font-semibold text-gray-400 tracking-wider">Accepted Payments:</span>
            <div className="flex gap-2.5 items-center">
              {/* M-PESA */}
              <span className="flex items-center shadow-md shrink-0" title="M-PESA">
                <svg className="h-7 w-16 rounded" viewBox="0 0 100 36">
                  <rect width="100" height="36" rx="4" fill="#388e3c" />
                  <text x="12" y="24" fontFamily="sans-serif" fontWeight="950" fontSize="16" fill="#ffffff">M-</text>
                  <text x="32" y="24" fontFamily="sans-serif" fontWeight="950" fontSize="16" fill="#e53935">PESA</text>
                </svg>
              </span>
              {/* Visa */}
              <span className="flex items-center shadow-md shrink-0" title="Visa">
                <svg className="h-7 w-16 rounded" viewBox="0 0 100 36">
                  <rect width="100" height="36" rx="4" fill="#1a1f71" />
                  <text x="18" y="25" fontFamily="'Georgia', serif" fontWeight="bold" fontStyle="italic" fontSize="22" fill="#f7b614">V</text>
                  <text x="35" y="25" fontFamily="'Georgia', serif" fontWeight="bold" fontStyle="italic" fontSize="22" fill="#ffffff">ISA</text>
                </svg>
              </span>
              {}
              <span className="flex items-center shadow-md shrink-0" title="Mastercard">
                <svg className="h-7 w-16 rounded" viewBox="0 0 100 36">
                  <rect width="100" height="36" rx="4" fill="#111111" />
                  <circle cx="42" cy="18" r="10" fill="#eb001b" />
                  <circle cx="58" cy="18" r="10" fill="#ff5f00" opacity="0.85" />
                </svg>
              </span>
            </div>
          </div>
          {}
          <p className="text-[14px] text-gray-400">
            © 2026 NexGen Gadgets. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
