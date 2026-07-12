import axios from 'axios';
import toast from 'react-hot-toast';
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (
        window.location.pathname !== '/login' &&
        !error.config.url?.includes('/auth/login') &&
        !error.config.url?.includes('/auth/register') &&
        !error.config.url?.includes('/auth/profile')
      ) {
        localStorage.removeItem('nexgen_was_logged_in');
        localStorage.removeItem('nexgen_session_id');
        localStorage.removeItem('nexgen_cart');
        window.location.href = '/login';
      }
    } else if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);
export default api;
