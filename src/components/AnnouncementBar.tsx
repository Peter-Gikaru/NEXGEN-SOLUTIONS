import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultAnnouncements = [
  {
    id: '1',
    text: "FLASH SALE: Up to 40% Off Premium Laptops!",
    link: "/?search=gaming"
  },
  {
    id: '2',
    text: "CALL/WHATSAPP TO ORDER NOW: +254 717 043408",
    link: "tel:+254717043408"
  },
  {
    id: '3',
    text: "🚚 FREE Delivery in Nairobi for orders above KES 50,000.",
    link: "/shipping"
  },
  {
    id: '4',
    text: "1-Year Warranty on our products.",
    link: "/help"
  }
];

export const AnnouncementBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>(defaultAnnouncements);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const loadAnnouncements = () => {
    const saved = localStorage.getItem('nexgen_announcements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setAnnouncements(parsed);
          setCurrentIndex(0); // Reset index on load
          return;
        }
      } catch (e) {
        console.error('Failed to parse announcements');
      }
    }
    setAnnouncements(defaultAnnouncements);
  };

  useEffect(() => {
    loadAnnouncements();
    window.addEventListener('announcements_updated', loadAnnouncements);
    return () => window.removeEventListener('announcements_updated', loadAnnouncements);
  }, []);

  useEffect(() => {
    if (!isVisible || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

  return (
    <div className="bg-[#F59E0B] text-[#1a1a2e] px-4 py-3 md:py-4 relative text-[16px] md:text-xl font-black flex items-center justify-center transition-all h-12 md:h-16 overflow-hidden">
      {current.link.startsWith('tel:') ? (
        <a href={current.link} className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform duration-300">
          <span className="animate-fade-in tracking-wide">{current.text}</span>
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </a>
      ) : (
        <Link to={current.link} className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform duration-300">
          <span className="animate-fade-in tracking-wide">{current.text}</span>
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
      )}
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute right-4 hover:bg-black/10 p-1 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
