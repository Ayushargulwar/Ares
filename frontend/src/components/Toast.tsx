import React, { useEffect } from 'react';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 6000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-white border border-sky-300 rounded-xl shadow-2xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-4 duration-300">
      <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0 mt-0.5">
        <CheckCircle2 className="w-5 h-5 text-sky-600" />
      </div>

      <div className="flex-1">
        <div className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
          EVENT INJECTED & REPLAN COMPLETE
        </div>
        <p className="text-sm font-sans font-semibold text-slate-800 mt-1 leading-snug">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
