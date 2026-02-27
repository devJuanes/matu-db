import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { projectsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Database, Plus, Trash2, ChevronRight, Server, LogOut, User, LayoutGrid, Search, Sparkles, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

interface Project {
    id: string; name: string; description?: string;
    region: string; status: string; created_at: string;
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
            toast.error(err.response?.data?.message || 'Failed to create project'); setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
                    <span className="modal-title" style={{ fontSize: 18, fontWeight: 700 }}>{t('dashboard.modal.title')}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={submit}>
                    <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('dashboard.modal.name_label')} *</label>
                            <input className="input matudb-input" placeholder={t('dashboard.modal.name_placeholder')} value={form.name} onChange={set('name')} required style={{ height: 44 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('dashboard.modal.desc_label')}</label>
                            <textarea className="textarea matudb-input" placeholder={t('dashboard.modal.desc_placeholder')} value={form.description} onChange={set('description')} style={{ minHeight: 100, paddingTop: 12 }} />
                        </div>
                    </div>
                    <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px' }}>
                        <button className="btn btn-ghost" type="button" onClick={onClose}>{t('dashboard.modal.btn_cancel')}</button>
                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '0 24px' }}>
                            {loading ? <><span className="spinner spinner-sm" />{t('dashboard.modal.btn_creating')}</> : t('dashboard.modal.btn_create')}
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
        <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, border: '1px solid var(--brand)' }}>
                <div className="modal-header">
                    <span className="modal-title" style={{ color: '#fff' }}>{t('dashboard.modal.success_title')}</span>
                </div>
                <div className="modal-body" style={{ padding: 24 }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                        {t('dashboard.modal.success_desc')}
                    </p>
                    <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--brand)', fontWeight: 600 }}>{t('dashboard.modal.anon_label')}</label>
                        <div className="code-block" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}>{keys.anon}</div>
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label" style={{ color: 'var(--brand)', fontWeight: 600 }}>{t('dashboard.modal.service_label')}</label>
                        <div className="code-block" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}>{keys.service}</div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary w-full" onClick={onClose} style={{ height: 44 }}>{t('dashboard.modal.btn_saved')}</button>
                </div>
            </div>
        </div>
    );
}

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

    useEffect(() => {
        projectsAPI.list().then(res => {
            setProjects(res.data.data.projects);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm(t('dashboard.project_card.delete_confirm'))) return;
        try {
            await projectsAPI.delete(id);
            setProjects(p => p.filter(x => x.id !== id));
            toast.success(t('common.success'));
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('common.error'));
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
            background: '#040405',
            color: 'var(--text-primary)',
            overflowX: 'hidden'
        }}>
            {/* Mesh Background */}
            <div style={{
                position: 'fixed', top: '0', right: '0', width: '50vw', height: '50vh',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', bottom: '0', left: '0', width: '40vw', height: '40vh',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
                filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Top bar (Glassy) */}
            <header style={{
                height: 64,
                background: 'rgba(10, 10, 11, 0.7)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        <img src={logo} alt="M" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: '#fff' }}>MatuDB</span>
                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', marginLeft: 8 }} />
                    <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                        Dashboard
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 30, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, var(--brand), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{user?.email}</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/auth/login'); }} style={{ color: 'var(--text-muted)', fontSize: 12, gap: 6 }}>
                        <LogOut size={14} /> {t('common.logout')}
                    </button>
                </div>
            </header>

            {/* Content */}
            <main style={{ flex: 1, padding: '48px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

                {/* Hero Header */}
                <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Sparkles size={14} /> Platform Overview
                        </div>
                        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', marginBottom: 8 }}>{t('dashboard.title')}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t('dashboard.subtitle')}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input matudb-input"
                                placeholder={t('dashboard.search_placeholder')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ height: 44, width: 280, paddingLeft: 42, paddingRight: search ? 36 : 14, background: 'rgba(255,255,255,0.02)' }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ height: 44, padding: '0 20px', fontWeight: 600, gap: 8, boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>
                            <Plus size={18} /> {t('dashboard.new_project')}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: 'calc(33.33% - 16px)', height: 180, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="loading-shimmer" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state glass-card" style={{ padding: '80px 40px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, margin: '0 auto' }}>
                            <Server size={32} color="var(--brand)" />
                        </div>
                        <p className="empty-state-title" style={{ fontSize: 20, color: '#fff' }}>{t('dashboard.no_projects')}</p>
                        <p className="empty-state-desc" style={{ maxWidth: 300, margin: '8px auto 24px' }}>{t('dashboard.no_projects_desc')}</p>
                        <button className="btn btn-primary btn-lg" onClick={() => setShowNew(true)} style={{ height: 48, padding: '0 32px' }}>
                            <Plus size={18} /> {t('dashboard.new_project')}
                        </button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="empty-state glass-card" style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, margin: '0 auto' }}>
                            <Search size={24} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>{t('dashboard.results.none')}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            {t('dashboard.results.none_desc', { query: search })}
                        </p>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')} style={{ color: 'var(--brand)' }}>
                            Limpiar búsqueda
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
                        {filteredProjects.map(p => (
                            <Link to={`/project/${p.id}/editor`} key={p.id} style={{ textDecoration: 'none', display: 'block' }}>
                                <div className="glass-card premium-project-card" style={{
                                    padding: 24,
                                    borderRadius: 20,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(15, 15, 18, 0.6)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Card Glow */}
                                    <div className="card-hover-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--brand), transparent)', opacity: 0, transition: 'opacity 0.3s' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', gap: 14 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12,
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--brand)'
                                            }}>
                                                <Database size={22} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>{p.name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <span style={{ fontSize: 11, color: 'rgba(16, 185, 129, 0.8)', padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                        {t('dashboard.project_card.status_active')}
                                                    </span>
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Globe size={12} /> {p.region}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="btn btn-ghost btn-icon btn-sm" title={t('dashboard.project_card.delete_tooltip')}
                                            onClick={e => handleDelete(p.id, e)} style={{ color: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {p.description && (
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 42 }}>
                                            {p.description}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>
                                            <Clock size={14} />
                                            {t('dashboard.project_card.created')} {new Date(p.created_at).toLocaleDateString()}
                                        </div>
                                        <div style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                                            Open <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Global Styles for "Mela" effects */}
            <style>{`
                .premium-project-card:hover {
                    transform: translateY(-4px) scale(1.01);
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    background: rgba(20, 20, 25, 0.8) !important;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
                }
                .premium-project-card:hover .card-hover-glow {
                    opacity: 1;
                }
                .premium-project-card:hover h3 {
                    color: var(--brand) !important;
                }
                .matudb-input {
                    background: rgba(15, 15, 18, 0.6) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    color: #fff !important;
                    transition: all 0.2s ease;
                }
                .matudb-input:focus {
                    border-color: var(--brand) !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                    background: rgba(20, 20, 25, 0.8) !important;
                }
                .loading-shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
            {newKeys && <KeysModal keys={newKeys} onClose={() => setNewKeys(null)} />}
        </div>
    );
}
