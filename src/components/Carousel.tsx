import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
export const Carousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slides = [
    {
      id: 1,
      bgGradient: 'from-[#1e3c72] to-[#2a5298]', 
      title: 'NEXGEN SOLUTIONS',
      subtitle: 'Gaming Laptop | ThinkPad | Core i7 | MacBook Pro | Laptop Bag | Wireless Mouse',
      tagline: 'Brand Showcase - Top Performance Gear',
      cta: 'Explore Collection'
    },
    {
      id: 2,
      bgGradient: 'from-[#e65c00] to-[#f9d423]', 
      title: "WHAT'S NEW",
      subtitle: 'NEXGEN FLASH DEALS',
      hasTimer: true,
      tagline: 'Limited quantities left! Buy before time runs out.',
      cta: 'Shop Deals Now'
    },
    {
      id: 3,
      bgGradient: 'from-[#0f2027] to-[#203a43]', 
      title: 'SPECIAL EVENT',
      subtitle: 'NEXGEN PREMIUM GAMING LAPTOPS & EXECUTIVE NOTEBOOKS CLEARANCE!',
      tagline: 'Save up to KES 45,000 on executive business notebooks.',
      cta: 'View Clearance'
    }
  ];
  const startTimer = () => {
    stopTimer();
    autoPlayTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };
  const stopTimer = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };
  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isHovered, activeSlide]);
  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };
  return (
    <div 
      className="w-full relative h-[250px] md:h-[350px] overflow-hidden select-none bg-primary cursor-pointer shadow-sm group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {}
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-r ${slide.bgGradient} transition-opacity duration-800 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {}
            <div className="absolute inset-0 bg-black/20"></div>
            {}
            <div className="relative z-20 max-w-5xl mx-auto px-6 text-center text-white flex flex-col items-center gap-3">
              <span className="bg-secondary text-[#1a1a2e] text-[14px] font-semibold px-3 py-1 rounded shadow-sm">
                {slide.title}
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold font-sans max-w-3xl leading-snug drop-shadow-md">
                {slide.subtitle}
              </h2>
              {slide.hasTimer && (
                <div className="my-2 bg-black/35 px-4 py-2 rounded-lg">
                  <CountdownTimer variant="light" />
                </div>
              )}
              <p className="text-[14px] md:text-[16px] text-gray-200 max-w-xl line-clamp-2">
                {slide.tagline}
              </p>
              <button className="mt-2 bg-secondary text-[#1a1a2e] font-semibold text-[16px] px-6 py-2.5 rounded shadow hover:bg-amber-500 hover:text-white transition-all duration-150">
                {slide.cta}
              </button>
            </div>
          </div>
        );
      })}
      {}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      {}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-150 cursor-pointer ${
              idx === activeSlide ? 'bg-secondary w-6' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
