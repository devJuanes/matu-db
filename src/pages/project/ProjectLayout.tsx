import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import {
    Database,
    Table2,
    Terminal,
    Key,
    Settings,
    LogOut,
    Home,
    HardDrive,
    Users,
    ChevronDown,
    ChevronRight,
    Activity,
    Sparkles,
    Globe,
    Zap,
    Bell,
    Layers,
    LayoutDashboard,
    Box,
    Shield,
    Mail,
    MessagesSquare,
    MessageCircle
} from 'lucide-react';
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
        { to: 'automations', label: 'Automatizaciones', icon: Zap },
        { to: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
        { to: 'apps', label: 'Aplicaciones', icon: Globe },
        { to: 'auth', label: t('sidebar.auth'), icon: Users },
        { to: 'keys', label: t('sidebar.keys'), icon: Key },
        { to: 'notifications', label: 'Notificaciones', icon: MessagesSquare },
        { to: 'templates', label: 'Plantillas', icon: Mail },
        { to: 'settings', label: t('sidebar.settings'), icon: Settings },
    ];

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: '13.5px',
        fontWeight: isActive ? 750 : 500,
        color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
        background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
        border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: 4,
        position: 'relative' as const
    });

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: 280,
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
            }}>
                {/* Brand Header */}
                <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--brand), #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                    }}>
                        <img src={logo} alt="M" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div>
                        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.8px', color: 'var(--text-primary)', display: 'block' }}>MatuDB</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--brand)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: -2, display: 'block' }}>Cloud Platform</span>
                    </div>
                    <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 8px var(--brand)' }} />
                </div>

                {/* Project Selector / Info */}
                <div style={{ padding: '0 16px 28px' }}>
                    {project ? (
                        <div style={{
                            padding: '14px 16px',
                            background: 'var(--bg-base)',
                            borderRadius: 16,
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                        }}
                            className="project-selector-card"
                        >
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'rgba(16, 185, 129, 0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--brand)',
                                flexShrink: 0
                            }}>
                                <Database size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{project.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Entorno Activo
                                </div>
                            </div>
                            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ) : (
                        <div className="loading-shimmer" style={{ height: 66, background: 'var(--bg-base)', borderRadius: 16 }} />
                    )}
                </div>

                {/* Navigation Section Label */}
                <div style={{ padding: '0 24px 12px', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={10} /> Core Infraestructura
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }} className="custom-scrollbar">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={`/project/${projectId}/${to}`} style={linkStyle} className="sidebar-link">
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="link-arrow" />
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-base)' }}>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', borderRadius: 12, height: 42, gap: 12, fontSize: 13, fontWeight: 700, width: '100%', border: '1px solid transparent' }} onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 12,
                            background: 'var(--brand)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 900, color: '#fff',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)'
                        }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{user?.full_name || user?.email?.split('@')[0]}</div>
                            <button
                                onClick={() => { logout(); navigate('/auth/login'); }}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                className="logout-btn"
                            >
                                <LogOut size={10} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{
                flex: 1,
                overflow: 'auto',
                background: 'var(--bg-base)',
                position: 'relative'
            }}>
                <div style={{ height: '100%', position: 'relative' }}>
                    {project ? <Outlet context={{ project, setProject }} /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div className="spinner-sm" style={{ width: 40, height: 40, border: '4px solid rgba(16, 185, 129, 0.1)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Conectando al Motor</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Estableciendo túnel seguro de datos...</div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Global Styles for Project Layout */}
            <style>{`
                .sidebar-link .link-arrow {
                    position: absolute;
                    right: 14px;
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .sidebar-link:hover {
                    color: var(--brand) !important;
                    background: rgba(16, 185, 129, 0.04) !important;
                }
                .sidebar-link:hover .link-arrow {
                    opacity: 0.5;
                    transform: translateX(0);
                }
                .sidebar-link.active .link-arrow {
                    opacity: 0.8;
                    transform: translateX(0);
                }
                .project-selector-card:hover {
                    border-color: var(--brand) !important;
                    background: var(--bg-surface) !important;
                }
                .logout-btn:hover {
                    color: var(--danger) !important;
                }
                .spinner-sm {
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
