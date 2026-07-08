import React from 'react';
import { useCart } from '../context/CartContext';
import { X, CheckCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 md:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center justify-between bg-secondary text-white px-4 py-3 rounded shadow-lg border-l-4 border-primary transition-all duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="h-5 w-5 text-[#1a1a2e] shrink-0" />
            <span className="text-[14px] font-medium truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted hover:text-white ml-3 transition-colors duration-100 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
