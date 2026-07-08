import React, { useState, useEffect } from 'react';
import { Sparkles, Tag } from 'lucide-react';
export const SecondaryPromoStrip: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('04:32:18');
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay.getTime() - now.getTime();
      if (difference <= 0) return '00:00:00';
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 select-none text-left">
      {}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded p-3 flex flex-col justify-between shadow-sm min-h-[90px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
            What's New
          </span>
          <span className="text-xs font-black text-amber-100 flex items-center gap-1 uppercase">
            <Tag className="h-3.5 w-3.5 fill-current" /> Flash Sale
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-black uppercase tracking-tight">Kili Flash</span>
          <div className="flex items-center gap-1">
            {timeLeft.split(':').map((num, i) => (
              <React.Fragment key={i}>
                <span className="bg-black/40 px-1.5 py-0.5 rounded font-mono font-black text-xs min-w-[24px] text-center border border-white/10">
                  {num}
                </span>
                {i < 2 && <span className="font-extrabold text-xs text-white">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded p-3 flex flex-col justify-between shadow-sm overflow-hidden min-h-[90px] relative">
        <div className="flex items-center gap-1">
          <Sparkles className="h-5 w-5 text-[#1a1a2e] fill-current shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded">
            Special Event
          </span>
        </div>
        {}
        <div className="w-full overflow-hidden relative mt-2 py-1 bg-black/20 rounded">
          <div className="flex animate-marquee hover-pause whitespace-nowrap gap-8">
            {Array.from({ length: 3 }).map((_, idx) => (
              <span key={idx} className="text-[11px] font-extrabold tracking-wide uppercase shrink-0 text-amber-200">
                🎉 Anniversary 60% OFF Premium Gaming Laptops & Executive Notebooks Clearance Sale!
              </span>
            ))}
          </div>
        </div>
      </div>
      {}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white rounded p-2.5 flex items-center justify-between gap-3 shadow-sm min-h-[90px]">
        {}
        <div className="flex-1 flex items-center gap-2 bg-black/25 rounded p-1.5 border border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&h=100&fit=crop" 
            alt="Laptop Case" 
            className="w-10 h-10 object-cover rounded shrink-0 border border-white/10"
            loading="lazy"
          />
          <div className="text-left min-w-0">
            <h4 className="text-[10px] font-extrabold truncate uppercase leading-tight">Laptop Case</h4>
            <span className="text-[9px] text-[#1a1a2e] font-black block mt-0.5">Top Deal</span>
          </div>
        </div>
        {}
        <div className="flex-1 flex items-center gap-2 bg-black/25 rounded p-1.5 border border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=100&h=100&fit=crop" 
            alt="RGB Keyboard" 
            className="w-10 h-10 object-cover rounded shrink-0 border border-white/10"
            loading="lazy"
          />
          <div className="text-left min-w-0">
            <h4 className="text-[10px] font-extrabold truncate uppercase leading-tight">RGB Keyboard</h4>
            <span className="text-[9px] text-[#1a1a2e] font-black block mt-0.5">Trending</span>
          </div>
        </div>
      </div>
    </section>
  );
};
