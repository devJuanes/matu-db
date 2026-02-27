import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Database, Table2, Terminal, Key, Settings, LogOut, Home, HardDrive, Users, ChevronDown, ChevronRight, Activity, Sparkles, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const { user, logout } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        if (!projectId) return;
        projectsAPI.get(projectId).then(res => setProject(res.data.data.project)).catch(() => navigate('/dashboard'));
    }, [projectId, navigate]);

    const navItems = [
        { to: 'editor', label: t('sidebar.editor'), icon: Table2 },
        { to: 'sql', label: t('sidebar.sql'), icon: Terminal },
        { to: 'database', label: t('sidebar.database'), icon: Database },
        { to: 'storage', label: t('sidebar.storage'), icon: HardDrive },
        { to: 'apps', label: 'Aplicaciones', icon: Globe },
        { to: 'auth', label: t('sidebar.auth'), icon: Users },
        { to: 'keys', label: t('sidebar.keys'), icon: Key },
        { to: 'settings', label: t('sidebar.settings'), icon: Settings },
    ];

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: 2
    });

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: '#040405',
            color: 'var(--text-primary)'
        }}>
            {/* Mesh Background for Project (More subtle) */}
            <div style={{
                position: 'fixed', top: '0', left: '260px', width: '30vw', height: '30vh',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)',
                filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Sidebar */}
            <aside style={{
                width: 260,
                background: '#070709',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflow: 'hidden',
                zIndex: 20
            }}>
                {/* Brand Header */}
                <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)'
                    }}>
                        <img src={logo} alt="M" style={{ width: 16, height: 16, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: '#fff' }}>MatuDB</span>
                    <Sparkles size={14} style={{ color: 'var(--brand)', marginLeft: 'auto', opacity: 0.6 }} />
                </div>

                {/* Project Selector / Info */}
                <div style={{ padding: '0 16px 20px' }}>
                    {project ? (
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--brand)',
                                flexShrink: 0
                            }}>
                                <Database size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(16, 185, 129, 0.8)', fontWeight: 600 }}>
                                    <Activity size={10} /> Active
                                </div>
                            </div>
                            <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                        </div>
                    ) : (
                        <div style={{ height: 58, background: 'rgba(255,255,255,0.02)', borderRadius: 12, className: 'loading-shimmer' }} />
                    )}
                </div>

                {/* Navigation Section Label */}
                <div style={{ padding: '4px 24px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                    Project Resources
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={`/project/${projectId}/${to}`} style={linkStyle} className="sidebar-link">
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="link-arrow" style={{ marginLeft: 'auto', opacity: 0, transition: 'opacity 0.2s, transform 0.2s' }} />
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'rgba(255,255,255,0.4)', borderRadius: 8, height: 36, gap: 10 }} onClick={() => navigate('/dashboard')}>
                        <Home size={16} /> {t('sidebar.all_projects')}
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 12,
                        marginTop: 4,
                        border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(45deg, var(--brand), #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#fff'
                        }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email?.split('@')[0]}</div>
                            <button
                                onClick={() => { logout(); navigate('/auth/login'); }}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                            >
                                <LogOut size={10} /> {t('sidebar.sign_out')}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{
                flex: 1,
                overflow: 'auto',
                background: '#040405',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ height: '100%', position: 'relative' }}>
                    {project ? <Outlet context={{ project, setProject }} /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--brand)' }} />
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Initializing environment...</span>
                        </div>
                    )}
                </div>
            </main>

            {/* Global Styles for Project Layout */}
            <style>{`
                .sidebar-link:hover {
                    color: #fff !important;
                    background: rgba(255,255,255,0.03) !important;
                }
                .sidebar-link.active .link-arrow {
                    opacity: 0.5 !important;
                    transform: translateX(2px);
                }
                .sidebar-link:hover .link-arrow {
                    opacity: 0.3;
                    transform: translateX(4px);
                }
                .loading-shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.01) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
