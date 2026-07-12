import { toast } from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastOptions {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = {
  success: ({ title, description, action }: ToastOptions) => {
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex flex-col ring-1 ring-black/5 overflow-hidden`}
        >
          <div className="flex p-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {action && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 flex justify-end">
              <button
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      ),
      { duration: 4000 }
    );
  },
  
  error: ({ title, description, action }: ToastOptions) => {
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex flex-col ring-1 ring-black/5 border-l-4 border-l-rose-500 overflow-hidden`}
        >
          <div className="flex p-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {action && (
            <div className="border-t border-slate-100 bg-rose-50/30 px-4 py-2 flex justify-end">
              <button
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
                className="text-sm font-medium text-rose-600 hover:text-rose-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      ),
      { duration: 6000 }
    );
  },

  info: ({ title, description, action }: ToastOptions) => {
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex flex-col ring-1 ring-black/5 overflow-hidden`}
        >
          <div className="flex p-4">
            <div className="flex-shrink-0">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {action && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 flex justify-end">
              <button
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      ),
      { duration: 4000 }
    );
  }
};
