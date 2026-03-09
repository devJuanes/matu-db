import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { projectsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Database,
    Plus,
    Trash2,
    ChevronRight,
    Server,
    LogOut,
    Search,
    Sparkles,
    Clock,
    Globe,
    LayoutGrid,
    List,
    Filter,
    Zap,
    Shield,
    HardDrive,
    MoreVertical,
    ExternalLink,
    Grid,
    Activity,
    Layers,
    User,
    Settings,
    Bell,
    Box
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

interface Project {
    id: string;
    name: string;
    description?: string;
    region: string;
    status: string;
    created_at: string;
}

/* ── New Project Modal ────────────────────────────────────────── */
function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Project, keys: any) => void }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await projectsAPI.create(form);
            onCreated(res.data.data.project, res.data.data.keys);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create project');
            setLoading(false);
        }
    };

    return (
        <div style={{ backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.4)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 28, maxWidth: 520, width: '100%', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ borderBottom: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)' }}>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{t('dashboard.modal.title') || 'Crear Nueva Instancia'}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Define la identidad de tu nueva infraestructura.</p>
                    </div>
                </div>
                <form onSubmit={submit}>
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="form-group">
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'block' }}>{t('dashboard.modal.name_label') || 'Nombre de la Instancia'}</label>
                            <input className="input" placeholder="ej: Producción E-commerce" value={form.name} onChange={set('name')} required style={{ width: '100%', height: 48, borderRadius: 12 }} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'block' }}>{t('dashboard.modal.desc_label') || 'Propósito / Notas'}</label>
                            <textarea className="input" placeholder="Opcional: Describe el rol de este servidor..." value={form.description} onChange={set('description')} style={{ width: '100%', minHeight: 120, paddingTop: 14, resize: 'none', borderRadius: 12, lineHeight: 1.6 }} />
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'flex-end', gap: 16, background: 'var(--bg-base)' }}>
                        <button className="btn btn-ghost" type="button" onClick={onClose} style={{ fontWeight: 700 }}>{t('dashboard.modal.btn_cancel') || 'Cancelar'}</button>
                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 48, padding: '0 32px', fontWeight: 800, borderRadius: 14 }}>
                            {loading ? <span className="spinner-sm" style={{ width: 20, height: 20, borderTopColor: 'transparent' }} /> : t('dashboard.modal.btn_create') || 'Desplegar Ahora'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Keys Modal ──────────────────────────────────────────────── */
function KeysModal({ keys, onClose }: { keys: any; onClose: () => void }) {
    const { t } = useTranslation();
    return (
        <div style={{ backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.7)', position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--brand)', borderRadius: 32, maxWidth: 580, width: '100%', padding: 0, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '32px 40px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Sparkles size={32} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--brand)', letterSpacing: '-1px' }}>{t('dashboard.modal.success_title') || '¡Despliegue Exitoso!'}</h2>
                </div>
                <div style={{ padding: '40px' }}>
                    <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 16, display: 'flex', gap: 16, marginBottom: 32 }}>
                        <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                            {t('dashboard.modal.success_desc') || 'Estas son las llaves maestras de acceso. Cópialas ahora mismo; por razones de seguridad, no volverán a mostrarse.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'block' }}>ANON PUBLIC KEY</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ wordBreak: 'break-all', background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '16px 48px 16px 16px', borderRadius: 12, fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.4, color: 'var(--text-primary)' }}>{keys.anon}</div>
                                <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(keys.anon); toast.success('Anon Key copiada'); }} style={{ position: 'absolute', right: 8, top: 8, padding: 8, height: 32, width: 32 }}><Copy size={16} /></button>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'block' }}>SERVICE ROLE KEY (SECRET)</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ wordBreak: 'break-all', background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '16px 48px 16px 16px', borderRadius: 12, fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.4, color: 'var(--text-primary)' }}>{keys.service}</div>
                                <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(keys.service); toast.success('Service Key copiada'); }} style={{ position: 'absolute', right: 8, top: 8, padding: 8, height: 32, width: 32 }}><Copy size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '32px 40px', borderTop: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                    <button className="btn btn-primary w-full" onClick={onClose} style={{ height: 52, fontWeight: 800, borderRadius: 16 }}>{t('dashboard.modal.btn_saved') || 'He guardado las credenciales de forma segura'}</button>
                </div>
            </div>
        </div>
    );
}

const AlertCircle = ({ size, color, style }: any) => <Shield size={size} color={color} style={style} />;

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [newKeys, setNewKeys] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        setLoading(true);
        projectsAPI.list().then(res => {
            setProjects(res.data.data.projects);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm(t('dashboard.project_card.delete_confirm') || '¿Estás seguro de eliminar este proyecto?')) return;
        try {
            await projectsAPI.delete(id);
            setProjects(p => p.filter(x => x.id !== id));
            toast.success('Servidor purgado correctamente');
        } catch (err: any) {
            toast.error('Error al intentar purgar el servidor');
        }
    };

    const handleCreated = (project: Project, keys: any) => {
        setProjects(p => [project, ...p]);
        setShowNew(false);
        setNewKeys(keys);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
        }}>
            {/* Global Elevation Header */}
            <header style={{
                height: 72,
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--brand), #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                    }}>
                        <img src={logo} alt="M" style={{ width: 20, height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div>
                        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-1px', color: 'var(--text-primary)' }}>MatuDB</span>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand)', opacity: 0.8, letterSpacing: '1px', marginTop: -4 }}>MATRIX ENGINE</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: 'var(--border)', margin: '0 12px' }} />
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ padding: '6px 16px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.08)', fontSize: 13, fontWeight: 700, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <LayoutGrid size={14} /> Consola
                        </div>
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>User Session</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                        <div style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: 'var(--bg-base)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative'
                        }} className="user-profile-trigger">
                            <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--brand)' }}>{user?.email?.[0].toUpperCase()}</span>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: 'var(--brand)', border: '2px solid var(--bg-surface)' }} />
                        </div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => { logout(); navigate('/auth/login'); }} style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, gap: 10 }}>
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main style={{ flex: 1, padding: '60px 40px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

                {/* Orchestrator Header */}
                <div style={{ marginBottom: 56, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brand)', fontSize: 11, fontWeight: 900, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <Box size={14} /> Control de Infraestructura
                        </div>
                        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', margin: 0, color: 'var(--text-primary)' }}>Mis Sistemas</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 12, maxWidth: 600 }}>Tus instancias de base de datos, microservicios y flujos de automatización centralizados.</p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-end', paddingTop: 8 }}>
                        <div style={{ position: 'relative', width: 320 }}>
                            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Filtrar por nombre o ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ height: 52, paddingLeft: 48, borderRadius: 16, background: 'var(--bg-surface)', fontSize: 15 }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ height: 52, padding: '0 28px', fontWeight: 800, gap: 12, borderRadius: 16, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.25)' }}>
                            <Plus size={22} /> Nueva Instancia
                        </button>
                    </div>
                </div>

                {/* Dashboard Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-base)', padding: 4, borderRadius: 14, border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '8px 14px', borderRadius: 10, border: 'none', background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                                    color: viewMode === 'grid' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 14px', borderRadius: 10, border: 'none', background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                                    color: viewMode === 'list' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                            {projects.length} INSTANCIAS DISPONIBLES
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 13, fontWeight: 700, gap: 8, height: 40, border: '1px solid var(--border)' }}>
                            <Filter size={16} /> Relevancia
                        </button>
                        <button className="btn btn-ghost" onClick={loadProjects} style={{ height: 40, width: 40, padding: 0 }} title="Sincronizar">
                            <Activity size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: 260, background: 'var(--bg-surface)', borderRadius: 28, border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <div className="loading-shimmer" style={{ height: '70%', background: 'var(--bg-base)' }} />
                                <div style={{ padding: 20 }}>
                                    <div className="loading-shimmer" style={{ height: 20, width: '60%', borderRadius: 6, marginBottom: 10 }} />
                                    <div className="loading-shimmer" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{ padding: '120px 40px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 40, border: '2px dashed var(--border)' }}>
                        <div style={{ width: 96, height: 96, borderRadius: 32, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, margin: '0 auto', color: 'var(--text-muted)' }}>
                            <Box size={44} style={{ opacity: 0.3 }} />
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>Consola de Operaciones Vacía</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 32px', fontSize: 17, lineHeight: 1.6 }}>Despliega tu infraestructura de datos ahora para comenzar a construir flujos reales de producción.</p>
                        <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ height: 56, padding: '0 40px', fontWeight: 800, borderRadius: 16, fontSize: 16 }}>
                            <Plus size={22} /> Iniciar Primer Proyecto
                        </button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, margin: '0 auto', border: '1px solid var(--border)' }}>
                            <Search size={28} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Sin coincidencias</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
                            No encontramos registros que coincidan con "<strong style={{ color: 'var(--text-primary)' }}>{search}</strong>"
                        </p>
                        <button className="btn btn-ghost" onClick={() => setSearch('')} style={{ fontWeight: 800, gap: 10, color: 'var(--brand)' }}>
                            Ver todos los proyectos <ChevronRight size={18} />
                        </button>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                            {filteredProjects.map(p => (
                                <Link to={`/project/${p.id}/editor`} key={p.id} style={{ textDecoration: 'none', display: 'block' }}>
                                    <div className="project-grid-card" style={{
                                        padding: '32px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 28,
                                        transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                                            <div style={{
                                                width: 56, height: 56, borderRadius: 18, background: 'var(--bg-base)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)',
                                                border: '1px solid var(--border)',
                                                boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                                            }}>
                                                <Database size={28} />
                                            </div>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={(e) => handleDelete(p.id, e)}
                                                style={{ height: 36, width: 36, padding: 0, justifyContent: 'center', borderRadius: 10, color: 'var(--text-muted)', background: 'transparent' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: 32 }}>
                                            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.8px' }}>{p.name}</h3>
                                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, height: 42, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {p.description || 'Instancia activa de MatuDB Engine. Lista para operaciones SQL y flujos reactivos.'}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 14px', borderRadius: 10 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 8px var(--brand)' }} />
                                                ONLINE
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Globe size={14} /> {p.region || 'US-EAST-1'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', opacity: 0.6 }} title="DB Ready" />
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', opacity: 0.6 }} title="Auth Ready" />
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', opacity: 0.6 }} title="Storage Ready" />
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                fontSize: 14, fontWeight: 800, color: 'var(--text-primary)',
                                                background: 'var(--bg-base)', padding: '8px 16px', borderRadius: 12,
                                                border: '1px solid var(--border)',
                                                transition: 'all 0.2s'
                                            }} className="open-project-badge">
                                                Acceder Control <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 28, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Arquitectura</th>
                                        <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Localización</th>
                                        <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Último Sync</th>
                                        <th style={{ textAlign: 'right', padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map(p => (
                                        <tr
                                            key={p.id}
                                            onClick={() => navigate(`/project/${p.id}/editor`)}
                                            style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                                            className="dashboard-table-row"
                                        >
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                        <Database size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{p.name}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>UID: {p.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <Globe size={14} color="var(--brand)" />
                                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.region || 'US-EAST-1 (Mat)'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
                                                    <Clock size={14} opacity={0.6} />
                                                    {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                                <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0 }}>
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </main>

            <style>{`
                .project-grid-card:hover {
                    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
                    border-color: var(--brand) !important;
                    transform: translateY(-8px);
                }
                .project-grid-card:hover .open-project-badge {
                    background: var(--brand) !important;
                    color: #fff !important;
                    border-color: var(--brand) !important;
                }
                .dashboard-table-row:hover {
                    background: rgba(16, 185, 129, 0.02) !important;
                }
                .loading-shimmer {
                    background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-base) 50%, var(--bg-surface) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
            `}</style>

            {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
            {newKeys && <KeysModal keys={newKeys} onClose={() => setNewKeys(null)} />}
        </div>
    );
}
