import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { buildBreadcrumbs } from '../lib/structured-data';

const faqs = [
  {
    question: "What is the condition of the products you sell?",
    answer: "We sell a variety of products to suit all budgets. We offer Ex-UK, refurbished, and brand new items. The condition of each specific product is clearly labeled on its product page."
  },
  {
    question: "Do your products come with a warranty?",
    answer: "Absolutely. All our laptops come with a minimum 1-year manufacturer's warranty. This covers any hardware defects that may arise under normal use. KINDLY NOTE THAT ALL USED PHONES ARE SOLD WITHOUT SCREEN AND BATTERY WARRANTY. Please note that physical damage, liquid damage, or unauthorized modifications void the warranty."
  },
  {
    question: "Do you offer financing or installments?",
    answer: "Currently, we operate on a strictly cash-on-delivery, M-PESA, or upfront bank transfer basis. We do not offer direct in-house financing or lipa-mdogo-mdogo installments at this time."
  },
  {
    question: "Can I upgrade the RAM or SSD before delivery?",
    answer: "Yes! We have an in-house team of certified technicians who can perform RAM and SSD upgrades on supported models before shipping. Please contact our support team via WhatsApp to request an upgrade quote."
  },
  {
    question: "What if my laptop arrives damaged?",
    answer: "If your item arrives damaged or suffers from a defect right out of the box, you must report it to us within 48 hours. We will arrange a free return and issue a full replacement or refund immediately. Check our Return Policy page for more details."
  },
  {
    question: "Can I visit your physical store?",
    answer: "Yes, you can! We are located in the heart of Nairobi CBD. You are welcome to visit us to view our products in person or to pick up an order you placed online."
  }
];

export const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'FAQ' }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="Frequently Asked Questions (FAQ) | NexGen Gadgets"
        description="Find answers to the most common questions about our products, shipping, warranties, and store policies in Kenya."
        url="/faq"
        schema={[faqSchema, breadcrumbSchema]}
      />
      <div className="max-w-3xl mx-auto w-full flex-1">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#F59E0B] mb-8 font-semibold transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 rounded-full mb-6">
            <HelpCircle className="h-10 w-10 text-[#F59E0B]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Find answers to the most common questions about our products, shipping, warranties, and store policies.
          </p>
        </div>

        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${openIndex === index ? 'border-[#F59E0B] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-bold text-slate-900 text-left pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#F59E0B] shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600 leading-relaxed pt-2 border-t border-gray-100">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
