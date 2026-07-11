import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="bg-[#1a1a2e] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-slide-up">
        <div className="bg-[#F59E0B] p-2 rounded-xl text-[#1a1a2e]">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Install NexGen App</h3>
          <p className="text-xs text-slate-300">Add to home screen for a better experience</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleInstallClick}
            className="bg-[#F59E0B] hover:bg-amber-500 text-[#1a1a2e] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Install
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-white text-xs transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
