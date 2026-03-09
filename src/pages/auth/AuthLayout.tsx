import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, Terminal, ShieldCheck, Sparkles, Database, Box, CheckCircle2, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

interface AuthLayoutProps {
    children: React.ReactNode;
    mode: 'login' | 'register';
}

export default function AuthLayout({ children, mode }: AuthLayoutProps) {
    const { t } = useTranslation();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: 'minmax(480px, 0.7fr) 1.3fr',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            transition: 'background-color 0.3s ease',
            overflow: 'hidden'
        }}>
            {/* Left Column: Form Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '50px 70px',
                position: 'relative',
                zIndex: 10,
                borderRight: '1px solid var(--border)',
                background: 'var(--bg-surface)'
            }}>
                {/* Header/Logo */}
                <div style={{ marginBottom: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'linear-gradient(135deg, var(--brand), #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
                        }}>
                            <img src={logo} alt="MatuDB Logo" style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <div>
                            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-1.2px', color: 'var(--text-primary)', display: 'block' }}>MatuDB</span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: -4, display: 'block' }}>Enterprise Console</span>
                        </div>
                    </div>
                </div>

                {/* Form content */}
                <div style={{
                    width: '100%',
                    maxWidth: 400,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                }}>
                    <div style={{ marginBottom: 44 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 14px',
                            borderRadius: 12,
                            background: 'rgba(16, 185, 129, 0.08)',
                            color: 'var(--brand)',
                            fontSize: 13,
                            fontWeight: 700,
                            marginBottom: 20,
                            border: '1px solid rgba(16, 185, 129, 0.15)'
                        }}>
                            <Sparkles size={14} />
                            {mode === 'login' ? 'Bienvenido de nuevo' : 'Plataforma de Datos v4'}
                        </div>
                        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16, letterSpacing: '-2px', color: 'var(--text-primary)' }}>
                            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>
                            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
                        </p>
                    </div>

                    {children}
                </div>

                {/* Footer info (Terms) */}
                <div style={{ marginTop: 60, paddingTop: 32, fontSize: 13, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Soporte</a>
                    </div>
                    <p style={{ lineHeight: 1.5, opacity: 0.6 }}>
                        © 2024 MatuDB Inc. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            {/* Right Column: Hero Section (Modern & Techy) */}
            <div style={{
                background: 'var(--bg-base)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '80px 100px',
                overflow: 'hidden'
            }}>
                {/* Visual Elements */}
                <div style={{
                    position: 'absolute', top: '15%', right: '-5%', width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                    zIndex: 0, filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', left: '0', width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                    zIndex: 0, filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: 64 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brand)', fontWeight: 800, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
                            <Database size={18} /> Engine de Datos Global
                        </div>
                        <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-2.5px', maxWidth: 640, lineHeight: 1, color: 'var(--text-primary)' }}>
                            Escalabilidad masiva. <br /> <span style={{ color: 'var(--brand)' }}>Simplicidad radical.</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 20, marginTop: 24, maxWidth: 500, lineHeight: 1.6, fontWeight: 500 }}>
                            Despliega nodos de PostgreSQL reactivos con autenticación integrada y orquestación edge.
                        </p>
                    </div>

                    {/* Pro Mock Terminal */}
                    <div className="auth-terminal" style={{
                        background: '#0a0a0c',
                        borderRadius: 24,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 40px 80px -15px rgba(0,0,0,0.4)',
                        width: '100%',
                        maxWidth: 600,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>matu-sdk-v4.ts</div>
                        </div>
                        <div style={{ padding: '32px 40px', fontFamily: 'var(--font-mono)', fontSize: 15, lineHeight: 1.8, color: '#94a3b8' }}>
                            <div style={{ display: 'flex', gap: 16 }}><span style={{ opacity: 0.3, width: 20 }}>1</span> <div><span style={{ color: '#10b981', fontWeight: 700 }}>import</span> {'{ MatuDB }'} <span style={{ color: '#10b981', fontWeight: 700 }}>from</span> <span style={{ color: '#34d399' }}>'@matudb/core'</span>;</div></div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}><span style={{ opacity: 0.3, width: 20 }}>2</span> <div><span style={{ color: '#10b981', fontWeight: 700 }}>const</span> db = <span style={{ color: '#6366f1', fontWeight: 700 }}>new</span> <span style={{ color: '#38bdf8' }}>MatuDB</span>({'{'} endpoint, key {'}'});</div></div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}><span style={{ opacity: 0.3, width: 20 }}>3</span> <div style={{ color: 'rgba(255,255,255,0.2)' }}>// Consultas ultra-rápidas con RLS</div></div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}><span style={{ opacity: 0.3, width: 20 }}>4</span> <div><span style={{ color: '#10b981', fontWeight: 700 }}>const</span> data = <span style={{ color: '#10b981', fontWeight: 700 }}>await</span> db.<span style={{ color: '#38bdf8' }}>from</span>(<span style={{ color: '#34d399' }}>'orders'</span>)</div></div>
                            <div style={{ display: 'flex', gap: 16 }}><span style={{ opacity: 0.3, width: 20 }}>5</span> <div style={{ paddingLeft: 32 }}>.<span style={{ color: '#38bdf8' }}>select</span>(<span style={{ color: '#34d399' }}>'*, items(*)'</span>)</div></div>
                            <div style={{ display: 'flex', gap: 16 }}><span style={{ opacity: 0.3, width: 20 }}>6</span> <div style={{ paddingLeft: 32 }}>.<span style={{ color: '#38bdf8' }}>eq</span>(<span style={{ color: '#34d399' }}>'status'</span>, <span style={{ color: '#34d399' }}>'paid'</span>);</div></div>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, #0a0a0c, transparent)', pointerEvents: 'none' }} />
                    </div>

                    <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                        <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <ShieldCheck size={22} />
                            </div>
                            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Ecosistema Seguro</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Basado en estándares militares de encriptación y Row Level Security.</p>
                        </div>
                        <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Box size={22} />
                            </div>
                            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Despliegue Instantáneo</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Tu infraestructura lista en menos de 10 segundos, en cualquier región.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
                    div[style*="hero-section"] { display: none !important; }
                }
                .auth-terminal {
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .auth-terminal:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
                    border-color: rgba(16, 185, 129, 0.3);
                }
            `}</style>
        </div>
    );
}
