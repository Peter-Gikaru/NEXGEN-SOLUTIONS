import axios from 'axios';
import { notify } from '../lib/toast';
const apiBaseUrl = import.meta.env.VITE_API_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_URL must be configured. Refusing to use a hardcoded API URL.');
}
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});
let sessionId = localStorage.getItem('nexgen_session_id');
if (!sessionId) {
  sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('nexgen_session_id', sessionId);
}
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = sessionId;
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

let lastErrorToastTime = 0;
let lastErrorType = '';

const shouldShowToast = (type: string) => {
  const now = Date.now();
  if (type === lastErrorType && now - lastErrorToastTime < 2000) {
    return false; // Skip if same error occurred within 2 seconds
  }
  lastErrorType = type;
  lastErrorToastTime = now;
  return true;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (shouldShowToast('network')) {
        notify.error({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          action: { label: 'Retry', onClick: () => window.location.reload() }
        });
      }
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message || 'An unexpected error occurred';

    if (status === 401) {
      if (
        window.location.pathname !== '/login' &&
        !error.config.url?.includes('/auth/login') &&
        !error.config.url?.includes('/auth/register') &&
        !error.config.url?.includes('/auth/profile')
      ) {
        localStorage.removeItem('nexgen_was_logged_in');
        
        if (shouldShowToast('401')) {
          notify.error({
            title: 'Session Expired',
            description: 'Your secure session has timed out. Please log in again to continue.',
            action: { label: 'Log In', onClick: () => window.location.href = '/login' }
          });
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    } else if (status === 403) {
        if (shouldShowToast('403')) {
          notify.error({
            title: 'Access Denied',
            description: message !== 'An unexpected error occurred' ? message : 'Your account has been locked or you do not have permission to perform this action.',
            action: { label: 'Return Home', onClick: () => window.location.href = '/' }
          });
        }
    } else if (status === 404) {
      if (shouldShowToast('404')) {
        notify.error({
          title: 'Not Found',
          description: message !== 'An unexpected error occurred' ? message : 'The requested resource could not be found.',
        });
      }
    } else if (status >= 500) {
      if (shouldShowToast('500')) {
        notify.error({
          title: 'Server Error',
          description: 'Our servers are currently experiencing issues. Please try again later.',
          action: { label: 'Retry', onClick: () => window.location.reload() }
        });
      }
    } else if (status === 400 || status === 422) {
      if (shouldShowToast(`400_${message}`)) {
        notify.error({
          title: 'Request Failed',
          description: message,
        });
      }
    }
    
    return Promise.reject(error);
  }
);
export default api;
