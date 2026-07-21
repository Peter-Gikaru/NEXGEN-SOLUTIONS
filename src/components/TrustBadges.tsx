import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      id: 1,
      icon: <ShieldCheck className="h-8 w-8 text-[#10B981] shrink-0" />,
      title: 'Quality Products',
      description: 'We sell high-quality New, Refurbished, and Ex-UK laptops'
    },
    {
      id: 2,
      icon: <Truck className="h-8 w-8 text-[#10B981] shrink-0" />,
      title: 'Free Delivery',
      description: 'Zero shipping costs within Nairobi region'
    },
    {
      id: 3,
      icon: <RotateCcw className="h-8 w-8 text-[#10B981] shrink-0" />,
      title: '14-Day Returns',
      description: 'Hassle-free replacement or refund policy'
    },
    {
      id: 4,
      icon: <CreditCard className="h-8 w-8 text-[#10B981] shrink-0" />,
      title: 'M-PESA Accepted',
      description: 'Secure, instant payments via Safaricom Paybill'
    }
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded p-6 shadow-sm select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className="flex items-center gap-4 text-left border-b sm:border-b-0 pb-4 sm:pb-0 border-gray-100 last:border-b-0"
          >
            <div className="bg-emerald-50 p-2.5 rounded-full border border-emerald-100 flex items-center justify-center">
              {badge.icon}
            </div>
            <div>
              <h4 className="text-[16px] font-semibold text-[#1a1a2e] font-sans">
                {badge.title}
              </h4>
              <p className="text-[14px] text-text-secondary mt-0.5 leading-snug">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
