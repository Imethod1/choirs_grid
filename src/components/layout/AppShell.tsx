import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { BottomSheet } from '../ui/BottomSheet';
import { ToastContainer } from '../ui/Toast';
import { OfflineBanner } from '../ui/OfflineBanner';
import { useUIStore } from '@/store/ui.store';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { setFinanceModule } = useUIStore();

  // Check if we're in finance module for theme switching
  useEffect(() => {
    const isFinance = location.pathname.startsWith('/finance');
    setFinanceModule(isFinance);
  }, [location.pathname, setFinanceModule]);

  return (
    <div className="flex h-screen bg-[var(--bg-app)] transition-theme">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>

      {/* Global overlays */}
      <OfflineBanner />
      <BottomSheet />
      <ToastContainer />
    </div>
  );
};
