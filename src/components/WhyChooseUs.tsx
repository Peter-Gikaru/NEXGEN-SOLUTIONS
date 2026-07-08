import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Smartphone } from 'lucide-react';
export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      title: 'Genuine Products',
      desc: '100% authentic laptops directly from official brands',
      icon: ShieldCheck,
      color: 'text-amber-400 bg-amber-950/40 border-amber-900/50'
    },
    {
      title: 'Free Delivery',
      desc: 'Free express shipping on all orders over KES 50,000',
      icon: Truck,
      color: 'text-blue-400 bg-blue-950/40 border-blue-900/50'
    },
    {
      title: '14-Day Returns',
      desc: 'Easy return policy for peace of mind shopping',
      icon: RotateCcw,
      color: 'text-green-400 bg-green-950/40 border-green-900/50'
    },
    {
      title: 'M-Pesa Accepted',
      desc: 'Secure checkout with standard Safaricom Lipa Na M-Pesa',
      icon: Smartphone,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
    }
  ];
  return (
    <section className="bg-black/60 border border-white/10 text-white rounded p-4 mb-6 select-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feat) => {
          const IconComp = feat.icon;
          return (
            <div 
              key={feat.title} 
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-2"
            >
              {}
              <div className={`p-2.5 rounded-full border shrink-0 ${feat.color}`}>
                <IconComp className="h-5 w-5" />
              </div>
              {}
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-black text-white uppercase tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-[10px] text-gray-300 leading-tight font-medium">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
