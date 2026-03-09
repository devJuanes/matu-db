import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';

import LoginPage from './pages/auth/LoginPage';
// ... rest of imports
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
import TemplatesPage from './pages/project/TemplatesPage';
import NotificationsPage from './pages/project/NotificationsPage';
import SimulatorPage from './pages/project/SimulatorPage';
import AutomationsList from './pages/project/automations/AutomationsList';
import AutomationEditor from './pages/project/automations/AutomationEditor';
import MatriculaPage from './modules/matricula/MatriculaPage';
import LandingPage from './pages/LandingPage';
import { ProductPage, DevelopersPage, SolutionsPage, PricingPage, BlogPage } from './pages/marketing/MarketingPages';
import MobilePreviewPage from './pages/preview/MobilePreviewPage';

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
  const { theme } = useUIStore();

  useEffect(() => {
    init();
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

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
            fontSize: 14,
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: { iconTheme: { primary: 'var(--brand)', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ... existing routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/preview/mobile" element={<MobilePreviewPage />} />
        <Route path="/preview/mobile/:screen" element={<MobilePreviewPage />} />
        <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/auth/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/project/:projectId" element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="editor" replace />} />
          <Route path="editor" element={<TableEditorPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="sql" element={<SqlEditorPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="auth" element={<ProjectAuthPage />} />
          <Route path="apps" element={<AppDeployPage />} />
          <Route path="automations" element={<AutomationsList />} />
          <Route path="automations/:automationId" element={<AutomationEditor />} />
          <Route path="keys" element={<ApiKeysPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/matricula" element={<MatriculaPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
