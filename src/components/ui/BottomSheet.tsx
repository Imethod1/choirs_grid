import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

const BottomSheet: React.FC = () => {
  const { bottomSheetOpen, bottomSheetContent, closeBottomSheet } = useUIStore();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBottomSheet();
    };
    
    if (bottomSheetOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [bottomSheetOpen, closeBottomSheet]);

  if (!bottomSheetOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeBottomSheet}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto',
          'bg-[var(--bg-surface)] rounded-t-[var(--radius-xl)]',
          'shadow-[var(--shadow-lg)] animate-slide-in-up safe-bottom'
        )}
      >
        {/* Handle bar */}
        <div className="sticky top-0 flex justify-center py-3 bg-[var(--bg-surface)]">
          <div className="h-1 w-10 rounded-full bg-[var(--border-primary)]" />
        </div>
        
        {/* Close button */}
        <button
          onClick={closeBottomSheet}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
        >
          <X className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
        
        {/* Content */}
        <div className="px-4 pb-6">
          {bottomSheetContent}
        </div>
      </div>
    </>
  );
};

// Reusable bottom sheet layouts
interface BottomSheetHeaderProps {
  title: string;
  subtitle?: string;
}

const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({ title, subtitle }) => (
  <div className="mb-6 pr-8">
    <h2 className="text-xl font-semibold text-[var(--text-main)]">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
    )}
  </div>
);

interface BottomSheetActionsProps {
  children: React.ReactNode;
}

const BottomSheetActions: React.FC<BottomSheetActionsProps> = ({ children }) => (
  <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[var(--border-light)]">
    {children}
  </div>
);

export { BottomSheet, BottomSheetHeader, BottomSheetActions };
