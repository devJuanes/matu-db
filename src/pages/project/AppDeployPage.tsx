import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Globe, Plus, Rocket, ExternalLink, Clock,
    Terminal, Monitor, Server, Shield, Cpu,
    ChevronRight, CheckCircle2, History, Activity,
    Box, Layout, Settings, RefreshCw, Info
} from 'lucide-react';
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
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadApps();
    }, [projectId]);

    const loadApps = async () => {
        try {
            setRefreshing(true);
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
            setRefreshing(false);
        }
    };

    const handleSelectApp = async (app: any) => {
        setSelectedApp(app);
        try {
            const res = await api.get(`/projects/${projectId}/apps/${app.id}/deployments`);
            setDeployments(res.data.data || []);
        } catch (err) {
            toast.error('Error al cargar historial de despliegues');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post(`/projects/${projectId}/apps`, newApp);
            toast.success('Aplicación aprovisionada con éxito');
            setShowCreate(false);
            setNewApp({ name: '', subdomain: '' });
            loadApps();
            if (res.data.data) handleSelectApp(res.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear la app');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Aprovisionando infraestructura...</span>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Server size={14} /> Cloud Hosting
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Despliegue y Hosting</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600 }}>
                        Lanza tus aplicaciones frontend a la red global de MatuDB.
                        Aprovisionamiento instantáneo con SSL automático y CDN integrado.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ height: 44, padding: '0 24px', gap: 10 }}>
                    <Plus size={18} /> Crear Aplicación
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 32 }}>
                {/* Sidebar - Application List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tus Aplicaciones</span>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={loadApps} disabled={refreshing}>
                            <RefreshCw size={14} className={refreshing ? 'spinner' : ''} />
                        </button>
                    </div>

                    {apps.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 20, background: 'var(--bg-surface)' }}>
                            <Box size={32} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>No hay aplicaciones vinculadas a este proyecto.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {apps.map((app: any) => (
                                <div
                                    key={app.id}
                                    onClick={() => handleSelectApp(app)}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: 16,
                                        background: selectedApp?.id === app.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                                        border: `1px solid ${selectedApp?.id === app.id ? 'var(--brand)' : 'var(--border)'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: selectedApp?.id === app.id ? 'var(--brand)' : 'var(--text-primary)' }}>{app.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Globe size={10} /> {app.subdomain}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} style={{ color: selectedApp?.id === app.id ? 'var(--brand)' : 'var(--border)', opacity: 0.5 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{ minWidth: 0 }}>
                    {selectedApp ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* App Overview Card */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '32px', background: 'var(--bg-surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div style={{ display: 'flex', gap: 20 }}>
                                            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, var(--brand), #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                                                <Layout size={32} />
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{selectedApp.name}</h2>
                                                <a
                                                    href={(() => {
                                                        const base = import.meta.env.VITE_MATUDB_DOMAIN || window.location.host;
                                                        const protocol = base.includes('localhost') ? 'http' : 'https';
                                                        return `${protocol}://${selectedApp.subdomain}.${base}/`;
                                                    })()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ fontSize: 14, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                                                >
                                                    {selectedApp.subdomain}.{import.meta.env.VITE_MATUDB_DOMAIN || window.location.host} <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                                                <Activity size={12} /> ACTIVO
                                            </div>
                                            <button className="btn btn-ghost btn-icon" title="Ajustes de la App">
                                                <Settings size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* CLI Instructions */}
                                    <div style={{ background: '#0f172a', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                            <Terminal size={16} style={{ color: 'var(--brand)' }} />
                                            <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>MatuDeploy CLI</span>
                                        </div>
                                        <div style={{ position: 'absolute', top: 20, right: 20 }}>
                                            <Shield size={20} style={{ color: 'rgba(255,255,255,0.1)' }} />
                                        </div>
                                        <code style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#f8fafc', lineHeight: 1.7, display: 'block' }}>
                                            <span style={{ color: '#6366f1' }}># Instalar herramienta de despliegue</span><br />
                                            <span style={{ color: '#10b981' }}>npm</span> install -g matudeploy<br /><br />
                                            <span style={{ color: '#6366f1' }}># Desplegar aplicación actual</span><br />
                                            matudeploy deploy \<br />
                                            &nbsp;&nbsp;--project <span style={{ color: '#fbbf24' }}>{projectId}</span> \<br />
                                            &nbsp;&nbsp;--app <span style={{ color: '#fbbf24' }}>{selectedApp.id}</span> \<br />
                                            &nbsp;&nbsp;--dir <span style={{ color: '#10b981' }}>./dist</span>
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* Deployment History */}
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <History size={20} style={{ color: 'var(--brand)' }} /> Historial de Versiones
                                </h3>

                                {deployments.length === 0 ? (
                                    <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)' }}>
                                        <Rocket size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.2 }} />
                                        <h4 style={{ fontWeight: 700, margin: '0 0 8px' }}>Listo para el primer despliegue</h4>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto' }}>Utiliza el comando matudeploy que se muestra arriba para publicar tu aplicación.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {deployments.map((dep: any, idx: number) => (
                                            <div key={dep.id} style={{
                                                padding: '20px 24px',
                                                background: 'var(--bg-surface)',
                                                borderRadius: 16,
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'transform 0.2s',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {idx === 0 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--brand)' }} />}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === 0 ? 'var(--brand)' : 'var(--text-muted)' }}>
                                                        <Rocket size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontWeight: 700, fontSize: 14 }}>v{dep.version.slice(0, 8)}</span>
                                                            {idx === 0 && <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', padding: '2px 6px', borderRadius: 4 }}>ACTUAL</span>}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <Clock size={12} /> {formatDistanceToNow(new Date(dep.created_at), { addSuffix: true, locale: es })}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <CheckCircle2 size={12} color="var(--brand)" /> Exitoso
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, fontSize: 12 }}>Detalles</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Empty State - No selection */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 500, background: 'var(--bg-surface)', borderRadius: 24, border: '2px dashed var(--border)', textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 120, height: 120, borderRadius: 40, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Monitor size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Gestión de Hosting</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 320, lineHeight: 1.6 }}>
                                Selecciona una aplicación de la izquierda para gestionar sus despliegues, dominios y configuraciones.
                            </p>
                            {!apps.length && (
                                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setShowCreate(true)}>
                                    Crear mi primera aplicación
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Application Modal */}
            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <form onSubmit={handleCreate} style={{ background: 'var(--bg-main)', padding: '40px', borderRadius: 28, width: '100%', maxWidth: 500, border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--brand)' }}>
                            <Rocket size={24} />
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Nueva Aplicación</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                            Configura el contenedor de tu nuevo proyecto frontend. MatuDB asignará una URL única inmediatamente.
                        </p>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Nombre descriptivo</label>
                            <input
                                className="input"
                                placeholder="Ej: Portal de Clientes"
                                value={newApp.name}
                                onChange={e => setNewApp({ ...newApp, name: e.target.value })}
                                required
                                style={{ height: 48, fontSize: 15 }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Identificador de subdominio</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input"
                                    placeholder="mi-app-portal"
                                    value={newApp.subdomain}
                                    onChange={e => setNewApp({ ...newApp, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    required
                                    style={{ height: 48, fontSize: 15, paddingRight: 110 }}
                                />
                                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '4px 8px', borderRadius: 6 }}>
                                    .{import.meta.env.VITE_MATUDB_DOMAIN || window.location.host}
                                </div>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Info size={14} color="var(--brand)" /> Este nombre será parte de tu URL de acceso.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                            <button type="button" className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => setShowCreate(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: 48 }}>Aprovisionar App</button>
                        </div>
                    </form>
                </div>
            )}

            <style>{`
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
