if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}


if (typeof window !== 'undefined') {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    
    if (e.key === 'F12') {
      e.preventDefault();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
    }
  });
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { CompareProvider } from './context/CompareContext.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const isGoogleEnabled = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com';


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
        .then(() => console.log('PWA Service Worker successfully unregistered.'))
        .catch(err => console.error('Failed to unregister PWA Service Worker:', err));
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <CompareProvider>
          {isGoogleEnabled ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          ) : (
            <App />
          )}
        </CompareProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
