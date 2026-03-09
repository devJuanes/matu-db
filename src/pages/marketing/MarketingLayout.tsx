import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Github,
    Globe,
    Sun,
    Moon
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import logo from '../../assets/logo.png';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { theme, toggleTheme } = useUIStore();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { key: 'product', label: t('landing.nav.product') || 'Producto', to: '/product' },
        { key: 'developers', label: t('landing.nav.developers') || 'Desarrolladores', to: '/developers' },
        { key: 'solutions', label: t('landing.nav.solutions') || 'Soluciones', to: '/solutions' },
        { key: 'pricing', label: t('landing.nav.pricing') || 'Precios', to: '/pricing' },
    ];

    return (
        <div style={{
            backgroundColor: 'var(--bg-base)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
            {/* Header / Nav */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: scrolled ? 'var(--bg-surface)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.2s ease'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'var(--brand)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <img src={logo} alt="M" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>MatuDB</span>
                        </Link>

                        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            {navLinks.map(link => (
                                <Link key={link.key} to={link.to} style={{
                                    fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
                                    transition: 'color 0.2s', textDecoration: 'none'
                                }} className="nav-item">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={toggleTheme}
                            style={{ padding: 8, borderRadius: 'var(--radius)' }}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <button
                            className="btn btn-ghost"
                            style={{ fontSize: 14, fontWeight: 600 }}
                            onClick={() => navigate('/auth/login')}
                        >
                            {t('landing.nav.sign_in') || 'Iniciar Sesión'}
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: 14, fontWeight: 700 }}
                            onClick={() => navigate('/dashboard')}
                        >
                            {t('landing.nav.start_project') || 'Empezar ahora'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                padding: '80px 24px 40px',
                marginTop: 100
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 64 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <img src={logo} alt="M" style={{ width: 24, height: 24 }} />
                                <span style={{ fontSize: 20, fontWeight: 800 }}>MatuDB</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 300, marginBottom: 24 }}>
                                La base de datos moderna para aplicaciones empresariales. Segura, escalable y hermosa.
                            </p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div className="social-icon"><Github size={18} /></div>
                                <div className="social-icon"><Globe size={18} /></div>
                            </div>
                        </div>

                        {[
                            { title: 'Producto', items: ['Base de Datos', 'Autenticación', 'Storage', 'Edge Functions'] },
                            { title: 'Recursos', items: ['Documentación', 'Soporte', 'API Reference', 'Status'] },
                            { title: 'Compañía', items: ['Blog', 'Carreras', 'Privacidad', 'Términos'] }
                        ].map(col => (
                            <div key={col.title}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20, color: 'var(--text-primary)' }}>{col.title}</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {col.items.map(item => (
                                        <li key={item} style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        paddingTop: 32,
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 13
                    }}>
                        <div>© 2024 MatuDB. Built by <a href="#" style={{ color: 'var(--brand)', fontWeight: 600 }}>DevJuanes</a></div>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <span>Privacidad</span>
                            <span>Términos</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                .nav-item:hover { color: var(--brand) !important; }
                .social-icon { 
                    width: 36, height: 36, borderRadius: 8, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                }
                .social-icon:hover { background: var(--bg-overlay); color: var(--brand); border-color: var(--brand); }
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                }
            `}</style>
        </div>
    );
}
