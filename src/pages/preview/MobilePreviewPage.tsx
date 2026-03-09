import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MatuDevice } from '../../components/Simulator/MatuDevice';

const screenUrlMap: Record<string, string> = {
  home: '/',
  dashboard: '/dashboard',
  login: '/auth/login',
  register: '/auth/register',
};

function resolvePreviewUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${window.location.origin}${normalizedPath}`;
}

export default function MobilePreviewPage() {
  const { screen } = useParams();
  const [searchParams] = useSearchParams();

  const previewUrl = useMemo(() => {
    const explicitUrl = searchParams.get('url');
    if (explicitUrl) return resolvePreviewUrl(explicitUrl);

    const selectedScreen = screen ?? 'home';
    const mappedPath = screenUrlMap[selectedScreen] ?? '/';
    return resolvePreviewUrl(mappedPath);
  }, [screen, searchParams]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Preview movil</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
          Usa <code>?url=</code> para una ruta o URL personalizada.
        </p>
      </div>
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MatuDevice url={previewUrl} theme="dark" />
      </div>
    </div>
  );
}
