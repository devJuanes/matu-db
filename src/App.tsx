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
import WhatsappPage from './pages/project/WhatsappPage';
import SimulatorPage from './pages/project/SimulatorPage';
import AutomationsList from './pages/project/automations/AutomationsList';
import AutomationEditor from './pages/project/automations/AutomationEditor';
import MatriculaPage from './modules/matricula/MatriculaPage';
import LandingPage from './pages/LandingPage';
import { ProductPage, DevelopersPage, SolutionsPage, PricingPage, BlogPage } from './pages/marketing/MarketingPages';
import MobilePreviewPage from './pages/preview/MobilePreviewPage';

function upsertMeta(selector: string, attribute: 'name' | 'property', value: string, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'MatuDB | Backend para apps modernas';
    let description = 'MatuDB te ayuda a lanzar bases de datos, auth, storage y APIs para aplicaciones web y mobile.';

    if (path === '/') {
      title = 'MatuDB | Plataforma de datos para construir y escalar';
      description = 'Crea productos más rápido con base de datos, autenticación, storage y automatizaciones en una sola plataforma.';
    } else if (path === '/product') {
      title = 'Producto | MatuDB';
      description = 'Conoce las capacidades de MatuDB: SQL, auth, storage, realtime y automatizaciones.';
    } else if (path === '/developers') {
      title = 'Desarrolladores | MatuDB';
      description = 'APIs, ejemplos y herramientas para acelerar tu flujo de desarrollo con MatuDB.';
    } else if (path === '/solutions') {
      title = 'Soluciones | MatuDB';
      description = 'Soluciones de datos para SaaS, e-commerce, portales internos y apps mobile.';
    } else if (path === '/pricing') {
      title = 'Precios | MatuDB';
      description = 'Planes claros para empezar gratis y escalar cuando tu producto crezca.';
    } else if (path === '/blog') {
      title = 'Blog | MatuDB';
      description = 'Guías, novedades y buenas prácticas sobre arquitectura de datos y producto.';
    } else if (path.startsWith('/auth/login')) {
      title = 'Iniciar sesión | MatuDB';
      description = 'Accede a tu consola de MatuDB.';
    } else if (path.startsWith('/auth/register')) {
      title = 'Registro | MatuDB';
      description = 'Crea tu cuenta y comienza a construir con MatuDB.';
    } else if (path.startsWith('/dashboard')) {
      title = 'Dashboard | MatuDB';
      description = 'Administra tus proyectos y recursos desde la consola.';
    } else if (path.startsWith('/project/')) {
      title = 'Proyecto | Consola MatuDB';
      description = 'Gestiona tablas, SQL, auth, storage, deploy y automatizaciones de tu proyecto.';
    } else if (path.startsWith('/preview/mobile')) {
      title = 'Preview mobile | MatuDB';
      description = 'Visualiza tu app en un dispositivo simulado para validar experiencia mobile.';
    } else if (path.startsWith('/matricula')) {
      title = 'Matrícula | MatuDB';
      description = 'Módulo de matrícula sobre la plataforma MatuDB.';
    }

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  }, [location.pathname]);

  return null;
}

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
      <RouteSeo />
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
          <Route path="whatsapp" element={<WhatsappPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/matricula" element={<MatriculaPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
