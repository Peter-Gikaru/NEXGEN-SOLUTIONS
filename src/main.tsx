if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
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

// Unregister any active PWA Service Workers to deactivate app installation triggers
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
