import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Package, RefreshCw, ShieldCheck, CreditCard, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'Orders & Delivery',
    icon: <Package className="w-6 h-6 text-blue-500" />,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery within Nairobi takes 1-2 business days. Orders outside Nairobi take 2-4 business days depending on the selected courier service.'
      },
      {
        q: 'How can I track my order?',
        a: 'You can track your order using the "Track Order" link in the footer. You will need your Order ID and email address.'
      },
      {
        q: 'Do you offer same-day delivery?',
        a: 'Yes, same-day delivery is available for orders within Nairobi placed before 12:00 PM.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    icon: <RefreshCw className="w-6 h-6 text-emerald-500" />,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for defective or unused items in their original packaging. Please initiate a return request from your dashboard.'
      },
      {
        q: 'How long do refunds take?',
        a: 'Once your returned item is received and inspected, refunds are processed within 3-5 business days to your original payment method.'
      }
    ]
  },
  {
    category: 'Warranty & Repairs',
    icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
    questions: [
      {
        q: 'Do your laptops come with a warranty?',
        a: 'Yes, brand new laptops come with a standard 1-year manufacturer warranty. Refurbished laptops come with a 6-month limited warranty. KINDLY NOTE THAT ALL USED PHONES ARE SOLD WITHOUT SCREEN AND BATTERY WARRANTY.'
      },
      {
        q: 'How do I claim a warranty?',
        a: 'Navigate to your Orders dashboard, select the delivered item, and click "Claim Warranty". You will need to provide photos/videos of the issue.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: <CreditCard className="w-6 h-6 text-purple-500" />,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Safaricom M-Pesa (STK Push) and Cash on Delivery (currently limited to Nairobi).'
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Yes, our M-Pesa integration is highly secure and we do not store your financial details. Payments are processed directly through Safaricom Daraja API.'
      }
    ]
  }
];

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-[#1a1a2e] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for answers (e.g., returns, warranty, delivery)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-full pl-14 pr-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <Link to="/track" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:border-[#F59E0B] transition-colors group">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Track Order</h3>
              <p className="text-sm text-slate-500 mt-2">Find out where your package is</p>
            </Link>
            <Link to="/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:border-[#F59E0B] transition-colors group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Returns</h3>
              <p className="text-sm text-slate-500 mt-2">Initiate a return request</p>
            </Link>
            <Link to="/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:border-[#F59E0B] transition-colors group">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Warranty Claims</h3>
              <p className="text-sm text-slate-500 mt-2">Get help with defective products</p>
            </Link>
            <Link to="/how-to-shop" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:border-[#F59E0B] transition-colors group">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Buying Guide</h3>
              <p className="text-sm text-slate-500 mt-2">Learn how to shop with us</p>
            </Link>
          </div>
        )}

        <div className="space-y-10">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-slate-700">No results found for "{searchQuery}"</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search terms or contact our support team.</p>
            </div>
          ) : (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  {category.icon}
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, qIndex) => {
                    const id = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === id;
                    return (
                      <div key={qIndex} className="border border-slate-200 rounded-xl overflow-hidden transition-colors hover:border-slate-300">
                        <button
                          onClick={() => toggleQuestion(id)}
                          className={`w-full flex justify-between items-center p-5 text-left font-semibold ${isOpen ? 'bg-slate-50 text-[#F59E0B]' : 'bg-white text-slate-800'}`}
                        >
                          <span>{item.q}</span>
                          {isOpen ? <ChevronUp className="w-5 h-5 flex-shrink-0 ml-4" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />}
                        </button>
                        {isOpen && (
                          <div className="p-5 bg-white border-t border-slate-100 text-slate-600 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
