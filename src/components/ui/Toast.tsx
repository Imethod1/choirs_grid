import React from 'react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />,
    error: <XCircle className="h-5 w-5 text-[var(--color-error)]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
    info: <Info className="h-5 w-5 text-[var(--color-info)]" />,
  };

  const backgrounds = {
    success: 'bg-[var(--color-success-bg)] border-[var(--color-success)]/20',
    error: 'bg-[var(--color-error-bg)] border-[var(--color-error)]/20',
    warning: 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]/20',
    info: 'bg-[var(--color-info-bg)] border-[var(--color-info)]/20',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border shadow-[var(--shadow-md)] animate-slide-in-up',
        backgrounds[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-[var(--text-main)]">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4 text-[var(--text-muted)]" />
      </button>
    </div>
  );
};

// Helper hook to show toasts
export const useToast = () => {
  const addToast = useUIStore((state) => state.addToast);

  return {
    success: (message: string) => addToast({ type: 'success', message }),
    error: (message: string) => addToast({ type: 'error', message }),
    warning: (message: string) => addToast({ type: 'warning', message }),
    info: (message: string) => addToast({ type: 'info', message }),
  };
};

export { ToastContainer, Toast };
