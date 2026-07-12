import React, { useState, useEffect } from 'react';

const MESSAGES = {
  shop: [
    "Setting up your experience...",
    "Finding the best laptops for you...",
    "Loading premium tech experiences...",
    "Gathering the latest deals...",
    "Just a moment..."
  ],
  admin: [
    "Preparing your dashboard...",
    "Fetching analytics and insights...",
    "Loading inventory data...",
    "Syncing latest orders...",
    "Just a moment..."
  ],
  auth: [
    "Authenticating securely...",
    "Verifying your credentials...",
    "Securing your session...",
    "Just a moment..."
  ],
  default: [
    "Loading...",
    "Just a moment...",
    "Fetching details..."
  ]
};

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
  context?: 'shop' | 'admin' | 'auth' | 'default';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text, context = 'default', className = '' }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = MESSAGES[context] || MESSAGES.default;

  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [text, messages.length]);

  const displayMessage = text || messages[messageIndex];

  const content = (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-fade-in ${className}`}>
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 border-4 border-rose-100 rounded-full"></div>
        <div className="absolute inset-2 border-4 border-rose-500 rounded-full border-b-transparent animate-[spin_1.5s_reverse_infinite]"></div>
      </div>
      
      <div className="text-lg font-medium max-w-sm transition-all duration-500 ease-in-out">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500 animate-pulse">
          {displayMessage}
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50 fixed inset-0">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center h-full min-h-[200px]">
      {content}
    </div>
  );
};
