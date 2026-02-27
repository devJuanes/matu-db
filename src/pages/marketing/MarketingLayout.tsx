import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown,
    Github,
    Globe
} from 'lucide-react';
import logo from '../../assets/logo.png';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { key: 'product', label: t('landing.nav.product'), to: '/product', hasDropdown: true },
        { key: 'developers', label: t('landing.nav.developers'), to: '/developers', hasDropdown: true },
        { key: 'solutions', label: t('landing.nav.solutions'), to: '/solutions', hasDropdown: true },
        { key: 'pricing', label: t('landing.nav.pricing'), to: '/pricing' },
        { key: 'docs', label: t('landing.nav.docs'), to: '/docs' },
        { key: 'blog', label: t('landing.nav.blog'), to: '/blog' },
    ];

    return (
        <div style={{
            backgroundColor: '#040405',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Mesh background effect */}
            <div style={{
                position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15), transparent 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Navigation */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: scrolled ? 'rgba(4, 4, 5, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                            }}>
                                <img src={logo} alt="M" style={{ width: 20, height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px', color: '#fff' }}>MatuDB</span>
                        </Link>

                        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            {navLinks.map(link => (
                                <Link key={link.key} to={link.to || '#'} className="nav-item" style={{
                                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                    fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
                                    transition: 'color 0.2s',
                                    textDecoration: 'none',
                                    position: 'relative',
                                    padding: '24px 0'
                                }}>
                                    {link.label}
                                    {link.hasDropdown && <ChevronDown size={14} className="chevron" style={{ opacity: 0.5, transition: 'transform 0.2s' }} />}

                                    {link.hasDropdown && (
                                        <div className="nav-dropdown" style={{
                                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%) translateY(10px)',
                                            width: 240, background: '#0a0a0c', border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: 16, padding: 12, opacity: 0, visibility: 'hidden',
                                            transition: 'all 0.2s', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                            pointerEvents: 'none'
                                        }}>
                                            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {link.label} Features
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                                                {['Overview', 'Capabilities', 'Success Stories'].map(item => (
                                                    <div key={item} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>{item}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            className="btn btn-ghost"
                            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}
                            onClick={() => navigate('/auth/login')}
                        >
                            {t('landing.nav.sign_in')}
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}
                            onClick={() => navigate('/dashboard')}
                        >
                            {t('landing.nav.start_project')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#070709',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '100px 32px 60px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 60, marginBottom: 80 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <img src={logo} alt="M" style={{ width: 30, height: 30 }} />
                                <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>MatuDB</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, maxWidth: 300, marginBottom: 32 }}>
                                {t('landing.hero.description')}
                            </p>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Github size={20} color="rgba(255,255,255,0.6)" />
                                </div>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Globe size={20} color="rgba(255,255,255,0.6)" />
                                </div>
                            </div>
                        </div>

                        {[
                            { title: t('landing.footer.product'), items: [t('landing.features.database.title'), t('landing.features.auth.title'), t('landing.features.storage.title')] },
                            { title: t('landing.footer.resources'), items: [t('landing.footer.support'), t('landing.footer.status'), t('landing.footer.tos')] },
                            { title: 'Company', items: ['About us', 'Careers', 'Contact'] }
                        ].map(col => (
                            <div key={col.title}>
                                <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 24 }}>{col.title}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {col.items.map(item => (
                                        <li key={item} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        paddingTop: 40,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 13
                    }}>
                        <div>{t('landing.footer.rights')}</div>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                .nav-item:hover {
                    color: #fff !important;
                }
                .nav-item:hover .chevron {
                    transform: rotate(180deg);
                    opacity: 1 !important;
                }
                .nav-item:hover .nav-dropdown {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateX(-50%) translateY(0) !important;
                    pointer-events: auto !important;
                }
                .nav-dropdown div:hover {
                    background: rgba(255,255,255,0.03);
                    color: #fff !important;
                }
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                }
            `}</style>
        </div>
    );
}
