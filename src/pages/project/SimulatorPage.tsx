import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MatuDevice } from '../../components/Simulator/MatuDevice';

export const SimulatorPage = () => {
    const { projectId } = useParams();
    const [searchParams] = useSearchParams();
    const urlParam = searchParams.get('url');

    const initialUrl = useMemo(() => {
        if (urlParam) return urlParam;
        if (projectId) return `/project/${projectId}/apps`;
        return '/';
    }, [projectId, urlParam]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Emulador Mobile Visual</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Renderiza tu web dentro de un dispositivo (iPhone/Android) para validar UI responsive.
                    Puedes cargar rutas locales o enlaces de produccion con <code>?url=</code>.
                </p>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-card)' }}>
                <MatuDevice url={initialUrl} theme="dark" />
            </div>
        </div>
    );
};

export default SimulatorPage;
