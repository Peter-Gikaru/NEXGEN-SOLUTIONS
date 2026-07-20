import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import Draggable from 'react-draggable';

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsApp = () => {
    const phoneNumber = "254717043408";
    const message = "Hello NexGen Gadgets Support, I need help with...";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <Draggable bounds="window" handle=".drag-handle">
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-white border border-slate-200 shadow-2xl rounded-2xl w-80 overflow-hidden transform origin-bottom-right transition-all">
          <div className="bg-[#1a1a2e] p-4 flex justify-between items-center text-white">
            <h3 className="font-bold">NexGen Support</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-600 mb-4">
              Need help? Chat with our experts directly on WhatsApp for instant support, or check our FAQ.
            </p>
            <button 
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md mb-3"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </button>
            <a 
              href="/faq"
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Visit FAQ
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#F59E0B] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 transition-all hover:scale-105 cursor-pointer z-50 drag-handle"
        aria-label="Support"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
      </div>
    </Draggable>
  );
};
