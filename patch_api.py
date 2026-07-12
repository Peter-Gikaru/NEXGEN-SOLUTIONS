import re

filepath = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\services\api.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'import { notify } from \'../lib/toast\';' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { notify } from '../lib/toast';")

new_interceptor = """api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      notify.error({
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        action: { label: 'Retry', onClick: () => window.location.reload() }
      });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message || 'An unexpected error occurred';

    if (status === 401 || status === 403) {
      if (
        window.location.pathname !== '/login' &&
        !error.config.url?.includes('/auth/login') &&
        !error.config.url?.includes('/auth/register') &&
        !error.config.url?.includes('/auth/profile')
      ) {
        localStorage.removeItem('nexgen_was_logged_in');
        localStorage.removeItem('nexgen_session_id');
        localStorage.removeItem('nexgen_cart');
        
        notify.error({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again to continue.',
          action: { label: 'Log In', onClick: () => window.location.href = '/login' }
        });
      }
    } else if (status === 404) {
      notify.error({
        title: 'Not Found',
        description: message !== 'An unexpected error occurred' ? message : 'The requested resource could not be found.',
      });
    } else if (status >= 500) {
      notify.error({
        title: 'Server Error',
        description: 'Our servers are currently experiencing issues. Please try again later.',
        action: { label: 'Retry', onClick: () => window.location.reload() }
      });
    } else if (status === 400 || status === 422) {
      // We don't always want to show a global toast for 400s if forms handle them,
      // but if we do, here's a generic one that components can override or prevent.
      notify.error({
        title: 'Request Failed',
        description: message,
      });
    }
    
    return Promise.reject(error);
  }
);"""

# Replace the old interceptor
content = re.sub(r'api\.interceptors\.response\.use\([\s\S]*?\n\);', new_interceptor, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched api.ts")
