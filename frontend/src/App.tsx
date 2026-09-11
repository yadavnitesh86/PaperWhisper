import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { AppShell } from '@/components/layout/AppShell';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { ChatPage } from '@/pages/ChatPage';
import { Documents } from '@/pages/Documents';
import { Settings } from '@/pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerSidebarRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!loading && !user && location.pathname.startsWith('/app')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/app" replace /> : <Register />}
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell refreshKey={refreshKey}>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/chat/:threadId"
        element={
          <ProtectedRoute>
            <AppShell refreshKey={refreshKey}>
              <ChatPage onRefreshSidebar={triggerSidebarRefresh} />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/documents"
        element={
          <ProtectedRoute>
            <AppShell refreshKey={refreshKey}>
              <Documents />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <AppShell refreshKey={refreshKey}>
              <Settings />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
