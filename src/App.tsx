import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { SkeletonCard } from './components/ui/Skeleton';
import { useUIStore } from './store/ui.store';
import { useAuthStore } from './store/auth.store';
import { useOfflineSync } from './hooks/useOfflineSync';
import { queryClient } from './lib/queryClient';
import './lib/i18n';

// Lazy-load pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const AttendanceSheetPage = lazy(() => import('./pages/AttendanceSheetPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const MusicPage = lazy(() => import('./pages/MusicPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Communication Pages
const AnnouncementsPage = lazy(() => import('./pages/communication/AnnouncementsPage'));
const ComposeMessagePage = lazy(() => import('./pages/communication/ComposeMessagePage'));

// Governance Pages
const DocumentsPage = lazy(() => import('./pages/governance/DocumentsPage'));

// Reports Pages
const AnalyticsDashboardPage = lazy(() => import('./pages/reports/AnalyticsDashboardPage'));

// Additional Pages
const MyAttendancePage = lazy(() => import('./pages/MyAttendancePage'));
const PollsPage = lazy(() => import('./pages/PollsPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/auth/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Page loader
function PageLoader() {
  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

// App initialization - handle theme + session check on mount
function AppInitializer({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  const checkSession = useAuthStore((state) => state.checkSession);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for existing session on app boot
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Listen for online/offline and sync queued actions
  useOfflineSync();

  return <>{children}</>;
}

// Protected Route — shows loading skeleton while session is being checked
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--action-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OtpVerificationPage />
                </Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ForgotPasswordPage />
                </Suspense>
              }
            />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="members"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MembersPage />
                  </Suspense>
                }
              />
              <Route
                path="events"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventsPage />
                  </Suspense>
                }
              />
              <Route
                path="events/:eventId/attendance"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AttendanceSheetPage />
                  </Suspense>
                }
              />
              <Route
                path="finance"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <FinancePage />
                  </Suspense>
                }
              />
              <Route
                path="music"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MusicPage />
                  </Suspense>
                }
              />
              <Route
                path="messages"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AnnouncementsPage />
                  </Suspense>
                }
              />
              <Route
                path="messages/compose"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ComposeMessagePage />
                  </Suspense>
                }
              />
              <Route
                path="documents"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DocumentsPage />
                  </Suspense>
                }
              />
              <Route
                path="attendance/me"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MyAttendancePage />
                  </Suspense>
                }
              />
              <Route
                path="polls"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PollsPage />
                  </Suspense>
                }
              />
              <Route
                path="reports"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsDashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </QueryClientProvider>
  );
}
