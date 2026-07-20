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

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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

  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
      <div className="bg-[#1a1a2e] text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-slide-up">
        <div className="bg-[#F59E0B] p-2.5 rounded-xl text-[#1a1a2e] shrink-0">
          <Download className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white mb-0.5">Install NexGen App</h3>
          <p className="text-sm text-slate-200 leading-normal">Add to home screen for a better experience</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-[#F59E0B] hover:bg-amber-500 text-[#1a1a2e] text-sm font-black px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg"
          >
            Install
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-white text-sm font-bold transition-colors cursor-pointer py-1 text-center"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
