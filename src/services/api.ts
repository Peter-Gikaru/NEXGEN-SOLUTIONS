import axios from 'axios';
import toast from 'react-hot-toast';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = sessionId;
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
