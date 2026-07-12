import React, { useState, useEffect } from 'react';
import { X, Check, Cookie, Settings } from 'lucide-react';

interface CookieSettings {
  essential: boolean; 
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('nexgen_cookie_consent');
    if (!savedConsent) {
      
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setSettings(parsed);
        applyCookieSettings(parsed);
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, functional: true, analytics: true, marketing: true };
    setSettings(allAccepted);
    localStorage.setItem('nexgen_cookie_consent', JSON.stringify(allAccepted));
    applyCookieSettings(allAccepted);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('nexgen_cookie_consent', JSON.stringify(settings));
    applyCookieSettings(settings);
    setIsVisible(false);
    setShowSettings(false);
  };

  const applyCookieSettings = (prefs: CookieSettings) => {
    
    
    
    
    if (!prefs.analytics) {
      console.log('Analytics cookies disabled by user.');
    }
    if (!prefs.marketing) {
      console.log('Marketing cookies disabled by user.');
    }
    
    
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: prefs }));
  };

  if (!isVisible) return null;

  return (
    <>
      {}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300" />
      )}

      {}
      {showSettings ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#F59E0B]" />
                <h2 className="text-xl font-bold text-[#1a1a2e]">Cookie Preferences</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-gray-600 text-[15px]">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                You can customize your preferences below.
              </p>

              {}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Strictly Necessary (Essential)
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Always Active</span>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are required for the website to function properly. They include maintaining your secure session, 
                  saving your cart items, and remembering your privacy preferences.
                </p>
              </div>

              {}
              <div className="border border-gray-200 rounded-lg p-4 transition-colors hover:border-[#F59E0B]/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Functional Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.functional}
                      onChange={(e) => setSettings({...settings, functional: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These allow the website to provide enhanced functionality and personalization, such as remembering your 
                  Recently Viewed laptops and comparing preferences.
                </p>
              </div>

              {}
              <div className="border border-gray-200 rounded-lg p-4 transition-colors hover:border-[#F59E0B]/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Analytics Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.analytics}
                      onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These help us understand how visitors interact with our website by collecting and reporting information 
                  anonymously. This helps us improve our platform.
                </p>
              </div>

              {}
              <div className="border border-gray-200 rounded-lg p-4 transition-colors hover:border-[#F59E0B]/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Marketing & Advertising Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.marketing}
                      onChange={(e) => setSettings({...settings, marketing: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These are used to track visitors across websites (like Facebook or Google Ads). The intention is to display 
                  ads that are relevant and engaging for the individual user.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleAcceptAll}
                className="px-6 py-2.5 text-[#1a1a2e] font-semibold hover:bg-gray-100 rounded transition-colors border border-transparent cursor-pointer"
              >
                Accept All
              </button>
              <button 
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-500 text-[#1a1a2e] font-bold rounded shadow-md transition-colors cursor-pointer"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      ) : (
        
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[450px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] animate-slide-up overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-2.5 rounded-full shrink-0 mt-1">
                <Cookie className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Your Privacy Matters</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  We use cookies to ensure your cart works, remember your preferences, and provide targeted offers. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <button 
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto flex-1 bg-[#1a1a2e] text-white hover:bg-slate-800 font-bold py-2.5 px-4 rounded text-center transition-colors shadow-md cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full sm:w-auto flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-[#F59E0B] hover:text-[#F59E0B] font-bold py-2 px-4 rounded text-center transition-colors cursor-pointer"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
