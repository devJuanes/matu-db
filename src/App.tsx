import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectLayout from './pages/project/ProjectLayout';
import TableEditorPage from './pages/project/TableEditorPage';
import SqlEditorPage from './pages/project/SqlEditorPage';
import ApiKeysPage from './pages/project/ApiKeysPage';
import SettingsPage from './pages/project/SettingsPage';
import StoragePage from './pages/project/StoragePage';
import ProjectAuthPage from './pages/project/ProjectAuthPage';
import DatabasePage from './pages/project/DatabasePage';
import AppDeployPage from './pages/project/AppDeployPage';
import MatriculaPage from './modules/matricula/MatriculaPage';
import LandingPage from './pages/LandingPage';
import { ProductPage, DevelopersPage, SolutionsPage, PricingPage, BlogPage } from './pages/marketing/MarketingPages';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppInit() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
          },
          success: { iconTheme: { primary: 'var(--brand)', secondary: '#000' } },
        }}
      />
      <Routes>
        {/* Root landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />

        {/* Auth routes */}
        <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/auth/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Project sub-pages */}
        <Route path="/project/:projectId" element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="editor" replace />} />
          <Route path="editor" element={<TableEditorPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="sql" element={<SqlEditorPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="auth" element={<ProjectAuthPage />} />
          <Route path="apps" element={<AppDeployPage />} />
          <Route path="keys" element={<ApiKeysPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Demo modules — no auth required */}
        <Route path="/matricula" element={<MatriculaPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
