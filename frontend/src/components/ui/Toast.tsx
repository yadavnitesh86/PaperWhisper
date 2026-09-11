import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3 shadow-md animate-slide-up max-w-sm"
            >
              {t.type === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              )}
              {t.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              {t.type === 'info' && (
                <Info className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />
              )}
              <p className="text-sm text-ink-800 leading-snug flex-1">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-ink-400 hover:text-ink-700 shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
