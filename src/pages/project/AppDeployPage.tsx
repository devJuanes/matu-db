import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Plus, Rocket, ExternalLink, Clock, Terminal, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AppDeployPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newApp, setNewApp] = useState({ name: '', subdomain: '' });
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [deployments, setDeployments] = useState<any[]>([]);

    useEffect(() => {
        loadApps();
    }, [projectId]);

    const loadApps = async () => {
        try {
            const res = await api.get(`/projects/${projectId}/apps`);
            const appList = res.data.data || [];
            setApps(appList);
            if (appList.length > 0 && !selectedApp) {
                handleSelectApp(appList[0]);
            }
        } catch (err) {
            toast.error('Error al cargar aplicaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectApp = async (app: any) => {
        setSelectedApp(app);
        try {
            const res = await api.get(`/projects/${projectId}/apps/${app.id}/deployments`);
            setDeployments(res.data.data || []);
        } catch (err) {
            toast.error('Error al cargar despliegues');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/projects/${projectId}/apps`, newApp);
            toast.success('Aplicación creada');
            setShowCreate(false);
            setNewApp({ name: '', subdomain: '' });
            loadApps();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear app');
        }
    };

    if (loading) return <div style={{ padding: 40 }}><span className="spinner" /></div>;

    return (
        <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Aplicaciones y Hosting</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Despliega tus aplicaciones frontend en segundos.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> Nueva Aplicación
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32 }}>
                {/* Apps List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(apps?.length || 0) === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
                            <Monitor size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                            <div style={{ fontSize: 13 }}>No tienes aplicaciones aún</div>
                        </div>
                    ) : (
                        apps?.map((app: any) => (
                            <div
                                key={app.id}
                                onClick={() => handleSelectApp(app)}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: 16,
                                    background: selectedApp?.id === app.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)',
                                    border: `1px solid ${selectedApp?.id === app.id ? 'var(--brand)' : 'var(--border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{app.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Globe size={12} /> {app.subdomain}.localhost
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Selected App Details */}
                {selectedApp ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ padding: 32, background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div>
                                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{selectedApp.name}</h2>
                                    <a
                                        href={(() => {
                                            const base = import.meta.env.VITE_MATUDB_DOMAIN || window.location.host;
                                            const protocol = base.includes('localhost') ? 'http' : 'https';
                                            return `${protocol}://${selectedApp.subdomain}.${base}/`;
                                        })()}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: 14, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                                    >
                                        {(() => {
                                            const base = import.meta.env.VITE_MATUDB_DOMAIN || window.location.host;
                                            return `${selectedApp.subdomain}.${base}`;
                                        })()} <ExternalLink size={14} />
                                    </a>
                                </div>
                                <div className="badge badge-green" style={{ padding: '6px 12px' }}>PRODUCCIÓN</div>
                            </div>

                            <div style={{ background: '#000', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <Terminal size={14} /> Desplegar con MatuDeploy CLI
                                </div>
                                <code style={{ color: '#fff', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', display: 'block', lineHeight: 1.6 }}>
                                    <div style={{ color: '#666' }}># Instala el CLI (muy pronto en npm)</div>
                                    <div style={{ marginBottom: 12 }}>npm install -g matudeploy</div>

                                    <div style={{ color: '#666' }}># Haz el deploy</div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 8, marginTop: 8 }}>
                                        matudeploy deploy \<br />
                                        &nbsp;&nbsp;--project {projectId} \<br />
                                        &nbsp;&nbsp;--app {selectedApp.id} \<br />
                                        &nbsp;&nbsp;--dir ./dist \<br />
                                        &nbsp;&nbsp;--key {'<TU_API_KEY>'}
                                    </div>
                                </code>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Clock size={20} color="var(--brand)" /> Historial de Despliegues
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {(deployments?.length || 0) === 0 ? (
                                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                        No hay despliegues aún. Utiliza el CLI para realizar tu primer deploy.
                                    </div>
                                ) : (
                                    deployments?.map((dep: any) => (
                                        <div key={dep.id} style={{
                                            padding: 20,
                                            background: 'var(--bg-surface)',
                                            borderRadius: 16,
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Rocket size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>Despliegue exitoso (v{dep.version.slice(-4)})</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        {formatDistanceToNow(new Date(dep.created_at), { addSuffix: true, locale: es })}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
                                                Ver logs
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                        <Rocket size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                        <p>Selecciona una aplicación para ver sus detalles</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <form onSubmit={handleCreate} style={{ background: 'var(--bg-main)', padding: 40, borderRadius: 24, width: '100%', maxWidth: 450, border: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Nueva Aplicación</h2>

                        <div className="form-group">
                            <label>Nombre de la App</label>
                            <input
                                className="form-control"
                                placeholder="Mi Increíble Dashboard"
                                value={newApp.name}
                                onChange={e => setNewApp({ ...newApp, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label>Subdominio / ID único</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-control"
                                    placeholder="mi-app"
                                    value={newApp.subdomain}
                                    onChange={e => setNewApp({ ...newApp, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    required
                                    style={{ paddingRight: 110 }}
                                />
                                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                                    .{import.meta.env.VITE_MATUDB_DOMAIN || window.location.host}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Este será el nombre usado para acceder a tu aplicación.</p>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                            <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowCreate(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary flex-1">Crear Aplicación</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
