import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-flatEmerald text-white',
          icon: <CheckCircle className="w-5 h-5 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-red-500 text-white',
          icon: <AlertCircle className="w-5 h-5 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-flatAmber text-black',
          icon: <AlertTriangle className="w-5 h-5 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-flatBlue text-white',
          icon: <Info className="w-5 h-5 shrink-0" />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast, removeToast }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 md:px-0">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flat-border bg-white text-black p-4 flex items-center justify-between gap-3 animate-slide-in relative select-none`}
            >
              {/* Color Block Stripe (left edge indicator) */}
              <div className={`absolute left-0 top-0 bottom-0 w-3 border-r-4 border-black ${styles.bg}`} />
              
              <div className="flex items-center gap-3 pl-4 flex-1">
                <span className="text-black font-extrabold">{styles.icon}</span>
                <p className="font-bold text-sm leading-tight text-gray-900">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="flat-border-sm p-1 bg-white hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
