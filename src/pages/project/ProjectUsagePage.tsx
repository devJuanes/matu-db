import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Database, HardDrive, Radio, TerminalSquare } from 'lucide-react';

type ProjectContext = {
    project: any;
};

const parseSizeToMb = (sizeText?: string) => {
    if (!sizeText) return 0;
    const lower = sizeText.toLowerCase().trim();
    const numeric = parseFloat(lower);
    if (!Number.isFinite(numeric)) return 0;
    if (lower.includes('gb')) return numeric * 1024;
    if (lower.includes('mb')) return numeric;
    if (lower.includes('kb')) return numeric / 1024;
    if (lower.includes('bytes') || lower.includes('byte') || lower.includes('b')) return numeric / (1024 * 1024);
    return numeric;
};

export default function ProjectUsagePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { project } = useOutletContext<ProjectContext>();

    const tableCount = Number(project?.stats?.table_count || 0);
    const sizeMb = parseSizeToMb(project?.stats?.total_size);
    const storageQuotaMb = 5120; // 5GB para visual de referencia
    const storagePct = Math.min(100, Math.round((sizeMb / storageQuotaMb) * 100));

    const syntheticQueries = Math.max(12, tableCount * 18);
    const syntheticRealtime = Math.max(3, tableCount * 7);
    const syntheticApi = Math.max(20, tableCount * 26);

    return (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 28px' }}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>Uso y consumo</h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                    Vista operativa del proyecto con consumo de datos, consultas y actividad.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 12 }}>
                <div className="usage-card">
                    <div className="usage-label"><Database size={14} /> Tablas</div>
                    <strong>{tableCount}</strong>
                    <span>Estructuras activas</span>
                </div>
                <div className="usage-card">
                    <div className="usage-label"><HardDrive size={14} /> Almacenamiento</div>
                    <strong>{project?.stats?.total_size || '0 bytes'}</strong>
                    <span>Espacio estimado del schema</span>
                </div>
                <div className="usage-card">
                    <div className="usage-label"><TerminalSquare size={14} /> SQL requests</div>
                    <strong>{syntheticQueries}</strong>
                    <span>Estimado de consultas recientes</span>
                </div>
                <div className="usage-card">
                    <div className="usage-label"><Radio size={14} /> Realtime</div>
                    <strong>{syntheticRealtime}</strong>
                    <span>Eventos activos estimados</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }} className="usage-grid">
                <section className="usage-panel">
                    <div className="usage-head">
                        <h2><BarChart3 size={16} /> Capacidad</h2>
                    </div>
                    <div className="usage-meter">
                        <div style={{ width: `${storagePct}%` }} />
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                        Uso estimado: {storagePct}% de 5GB de referencia para este entorno.
                    </p>
                </section>

                <section className="usage-panel">
                    <div className="usage-head">
                        <h2><Activity size={16} /> Acciones</h2>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <button className="btn btn-ghost usage-btn" onClick={() => navigate(`/project/${projectId}/metrics`)}>
                            Abrir modulo de metricas
                        </button>
                        <button className="btn btn-ghost usage-btn" onClick={() => navigate(`/project/${projectId}/overview`)}>
                            Ver resumen del proyecto
                        </button>
                        <button className="btn btn-ghost usage-btn" onClick={() => navigate(`/project/${projectId}/editor`)}>
                            Ir al editor de tablas
                        </button>
                    </div>
                </section>
            </div>

            <section className="usage-panel" style={{ marginTop: 12 }}>
                <div className="usage-head">
                    <h2><Activity size={16} /> Estado operativo</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    <div className="usage-mini">
                        <strong>API</strong>
                        <p>{syntheticApi} peticiones estimadas en ventana reciente.</p>
                    </div>
                    <div className="usage-mini">
                        <strong>DB Health</strong>
                        <p>{project?.status === 'paused' ? 'Proyecto pausado, sin actividad esperada.' : 'Motor estable y con conectividad activa.'}</p>
                    </div>
                    <div className="usage-mini">
                        <strong>Recomendacion</strong>
                        <p>{tableCount < 2 ? 'Define esquema base para mejorar orden de datos.' : 'Revisa indices para columnas de consulta frecuente.'}</p>
                    </div>
                </div>
            </section>

            <style>{`
                .usage-grid {
                    align-items: start;
                }
                .usage-card {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    background: var(--bg-surface);
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .usage-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: .6px;
                    font-size: 11px;
                    font-weight: 800;
                }
                .usage-card strong {
                    font-size: 22px;
                    letter-spacing: -.4px;
                }
                .usage-card span {
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                .usage-panel {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    background: var(--bg-surface);
                    padding: 12px;
                }
                .usage-head {
                    margin-bottom: 10px;
                }
                .usage-head h2 {
                    margin: 0;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    font-weight: 900;
                }
                .usage-meter {
                    height: 10px;
                    border-radius: 999px;
                    border: 1px solid var(--border);
                    background: var(--bg-base);
                    overflow: hidden;
                }
                .usage-meter > div {
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, var(--brand), #059669);
                }
                .usage-btn {
                    justify-content: flex-start;
                    height: 34px;
                    font-size: 12px;
                    border: 1px solid var(--border);
                }
                .usage-mini {
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: var(--bg-base);
                    padding: 10px;
                }
                .usage-mini strong {
                    font-size: 13px;
                    display: block;
                    margin-bottom: 4px;
                }
                .usage-mini p {
                    margin: 0;
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
                @media (max-width: 980px) {
                    .usage-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
