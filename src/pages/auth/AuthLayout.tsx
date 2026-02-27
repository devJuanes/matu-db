import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, Terminal, ShieldCheck, Sparkles } from 'lucide-react';
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
            gridTemplateColumns: 'minmax(450px, 0.8fr) 1.2fr',
            background: '#040405',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Left Column: Form Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 60px',
                background: 'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Header/Logo */}
                <div style={{ marginBottom: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            position: 'relative',
                            padding: 4,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <img src={logo} alt="MatuDB Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.8px', color: '#fff' }}>MatuDB</span>
                    </div>
                </div>

                {/* Form content */}
                <div style={{
                    width: '100%',
                    maxWidth: 380,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                }}>
                    <div style={{ marginBottom: 40 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--brand)',
                            fontSize: 12,
                            fontWeight: 600,
                            marginBottom: 16,
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <Sparkles size={12} />
                            {mode === 'login' ? 'Authentication' : 'Get Started'}
                        </div>
                        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-1.5px', color: '#fff' }}>
                            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
                            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
                        </p>
                    </div>

                    {children}
                </div>

                {/* Footer info (Terms) */}
                <div style={{ marginTop: 40, paddingTop: 32, fontSize: 13, color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ lineHeight: 1.5 }}>
                        {t('auth.register.terms')}
                    </p>
                </div>
            </div>

            {/* Right Column: Dynamic "Something More" Section */}
            <div style={{
                background: '#000',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 80,
                overflow: 'hidden'
            }}>
                {/* Animated Mesh Gradients */}
                <div style={{
                    position: 'absolute', top: '10%', right: '5%', width: '70%', height: '70%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)', animation: 'float 20s infinite alternate'
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', left: '10%', width: '60%', height: '60%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                    filter: 'blur(100px)', animation: 'float 25s infinite alternate-reverse'
                }} />

                {/* Floating Code Experience (The "Something More") */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: 48 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--brand)', marginBottom: 16 }}>
                            Engineered for Velocity
                        </h3>
                        <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', color: '#fff', maxWidth: 500, lineHeight: 1.1 }}>
                            PostgreSQL <br /> <span style={{ color: 'rgba(255,255,255,0.4)' }}>without the overhead.</span>
                        </h2>
                    </div>

                    {/* Interactive-looking mock terminal / code snack */}
                    <div style={{
                        background: 'rgba(15, 15, 18, 0.6)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        width: '100%',
                        maxWidth: 540,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                            <div style={{ marginLeft: 12, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>api_preview.ts — MatuDB</div>
                        </div>
                        <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.6 }}>
                            <div style={{ color: '#8b5cf6' }}>import <span style={{ color: '#fff' }}>{'{ createClient }'}</span> from <span style={{ color: '#10b981' }}>'@matudb/sdk'</span>;</div>
                            <div style={{ marginTop: 12 }}>
                                <span style={{ color: '#8b5cf6' }}>const</span> matudb = <span style={{ color: '#6366f1' }}>createClient</span>({'{'}
                                <div style={{ paddingLeft: 20 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>url:</span> <span style={{ color: '#10b981' }}>'https://api.matudb.cloud/v1'</span>,
                                </div>
                                <div style={{ paddingLeft: 20 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>apiKey:</span> <span style={{ color: '#10b981' }}>'mb_live_...'</span>
                                </div>
                                {'}'});
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <span style={{ color: '#8b5cf6' }}>await</span> matudb.<span style={{ color: '#6366f1' }}>from</span>(<span style={{ color: '#10b981' }}>'users'</span>)
                                <div style={{ paddingLeft: 20 }}>
                                    .<span style={{ color: '#6366f1' }}>select</span>(<span style={{ color: '#10b981' }}>'*'</span>)
                                </div>
                                <div style={{ paddingLeft: 20 }}>
                                    .<span style={{ color: '#6366f1' }}>order</span>(<span style={{ color: '#10b981' }}>'created_at'</span>, {'{ ascending: false }'});
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--brand) 30%, #8b5cf6 60%, #10b981 100%)', width: '40%' }} />
                    </div>

                    <div style={{ marginTop: 40, display: 'flex', gap: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                            <ShieldCheck size={16} /> Secure by Default
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                            <Terminal size={16} /> CLI-first Workflow
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                            <Code2 size={16} /> SDK for Everything
                        </div>
                    </div>
                </div>

                {/* Documentation badge */}
                <div style={{ position: 'absolute', top: 32, right: 32 }}>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        Developer Docs <Code2 size={14} />
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: #000"] {
            display: none !important;
          }
        }
        .btn-social {
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.08) !important;
          background: rgba(255,255,255,0.02) !important;
          color: #fff !important;
        }
        .btn-social:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(99, 102, 241, 0.4) !important;
          transform: translateY(-1px);
        }
        .matudb-input {
          background: rgba(15, 15, 18, 0.6) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          transition: all 0.2s ease;
        }
        .matudb-input:focus {
          border-color: var(--brand) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
          background: rgba(15, 15, 18, 0.8) !important;
        }
      `}</style>
        </div>
    );
}
