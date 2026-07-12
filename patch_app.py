import re

filepath = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\App.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

toast_config = """
const globalToastOptions = {
  className: '',
  duration: 4000,
  style: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    color: '#1e293b',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '15px',
    fontWeight: '500',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
"""

content = content.replace("const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {", toast_config)
content = content.replace("<Toaster position=\"top-center\" />", "<Toaster position=\"top-center\" toastOptions={globalToastOptions} />")

# Customer Layout should use bottom-right
customer_layout_toaster = """<Toaster position="bottom-right" toastOptions={globalToastOptions} />"""
# We've already replaced all `<Toaster position="top-center" />` globally. Let's fix CustomerLayout specifically.

# Finding CustomerLayout
import re
content = re.sub(r'(<CartDrawer />\s*)<Toaster position="top-center" toastOptions=\{globalToastOptions\} />', r'\1' + customer_layout_toaster, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched App.tsx")
