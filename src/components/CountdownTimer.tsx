import React, { useState, useEffect } from 'react';
interface CountdownTimerProps {
  initialSeconds?: number;
  className?: string;
  variant?: 'light' | 'dark' | 'simple';
}
export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  initialSeconds = 8 * 3600 + 35 * 60 + 12, 
  className = '',
  variant = 'dark'
}) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const saved = localStorage.getItem('nexgen_flash_timer');
    if (saved) {
      const { expiry } = JSON.parse(saved);
      const now = Date.now();
      if (now < expiry) {
        return Math.max(0, Math.floor((expiry - now) / 1000));
      }
    }
    return initialSeconds;
  });
  useEffect(() => {
    const now = Date.now();
    const expiry = now + secondsLeft * 1000;
    localStorage.setItem('nexgen_flash_timer', JSON.stringify({ time: secondsLeft, expiry }));
  }, []);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const nextSec = prev - 1;
        if (nextSec <= 0) {
          clearInterval(timer);
          return 0;
        }
        return nextSec;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const pad = (num: number) => String(num).padStart(2, '0');
  if (variant === 'simple') {
    return (
      <span className={`font-mono tracking-wider ${className}`}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }
  const blockBg = variant === 'dark' ? 'bg-[#1a1a2e] text-white border border-[#30304a]' : 'bg-white text-[#1a1a2e] border border-gray-200';
  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <div className={`flex flex-col items-center px-2.5 py-1 rounded shadow-sm ${blockBg}`}>
        <span className="text-base md:text-[18px] font-semibold font-mono leading-none">{pad(hours)}</span>
      </div>
      <span className="font-bold text-gray-500 text-base leading-none">:</span>
      <div className={`flex flex-col items-center px-2.5 py-1 rounded shadow-sm ${blockBg}`}>
        <span className="text-base md:text-[18px] font-semibold font-mono leading-none">{pad(minutes)}</span>
      </div>
      <span className="font-bold text-gray-500 text-base leading-none">:</span>
      <div className={`flex flex-col items-center px-2.5 py-1 rounded shadow-sm ${blockBg}`}>
        <span className="text-base md:text-[18px] font-semibold font-mono leading-none">{pad(seconds)}</span>
      </div>
    </div>
  );
};
