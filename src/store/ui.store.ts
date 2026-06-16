import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toast } from '@/types/app.types';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Language
  language: 'en' | 'sw';
  setLanguage: (lang: 'en' | 'sw') => void;
  
  // Sidebar (desktop)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Bottom sheet
  bottomSheetOpen: boolean;
  bottomSheetContent: React.ReactNode | null;
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Finance module active (for theme switching)
  isFinanceModule: boolean;
  setFinanceModule: (active: boolean) => void;
  
  // Low data mode
  lowDataMode: boolean;
  setLowDataMode: (enabled: boolean) => void;
  
  // Offline status
  isOffline: boolean;
  setOffline: (offline: boolean) => void;
}

// Apply theme to document
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  if (theme === 'system') {
    // Remove attribute to let system preference take over
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme - default to system
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
      },

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

      // Bottom sheet
      bottomSheetOpen: false,
      bottomSheetContent: null,
      openBottomSheet: (content) => set({ bottomSheetOpen: true, bottomSheetContent: content }),
      closeBottomSheet: () => set({ bottomSheetOpen: false, bottomSheetContent: null }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2, 11);
        set({ toasts: [...get().toasts, { ...toast, id }] });
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 4000);
      },
      removeToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      },

      // Finance module
      isFinanceModule: false,
      setFinanceModule: (isFinanceModule) => {
        set({ isFinanceModule });
        if (isFinanceModule) {
          document.documentElement.setAttribute('data-module', 'finance');
        } else {
          document.documentElement.removeAttribute('data-module');
        }
      },

      // Low data mode
      lowDataMode: false,
      setLowDataMode: (lowDataMode) => set({ lowDataMode }),

      // Offline
      isOffline: false,
      setOffline: (isOffline) => set({ isOffline }),
    }),
    {
      name: 'choir-app-ui',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        lowDataMode: state.lowDataMode,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useUIStore.getState();
    if (store.theme === 'system') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}
