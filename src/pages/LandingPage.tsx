import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Database,
    ShieldCheck,
    Zap,
    Radio,
    HardDrive,
    Code2,
    ArrowRight
} from 'lucide-react';
import MarketingLayout from './marketing/MarketingLayout';

export default function LandingPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const features = [
        {
            title: t('landing.features.database.title'),
            description: t('landing.features.database.description'),
            icon: <Database className="text-brand" size={20} />,
        },
        {
            title: t('landing.features.auth.title'),
            description: t('landing.features.auth.description'),
            icon: <ShieldCheck className="text-brand" size={20} />,
        },
        {
            title: t('landing.features.edge_functions.title'),
            description: t('landing.features.edge_functions.description'),
            icon: <Zap className="text-brand" size={20} />,
        },
        {
            title: t('landing.features.realtime.title'),
            description: t('landing.features.realtime.description'),
            icon: <Radio className="text-brand" size={20} />,
        },
        {
            title: t('landing.features.storage.title'),
            description: t('landing.features.storage.description'),
            icon: <HardDrive className="text-brand" size={20} />,
        },
        {
            title: t('landing.features.vector.title'),
            description: t('landing.features.vector.description'),
            icon: <Code2 className="text-brand" size={20} />,
        }
    ];

    return (
        <MarketingLayout>
            {/* Hero Section */}
            <section style={{
                padding: '160px 24px 100px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.2), transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1), transparent 50%)',
                    zIndex: -1
                }} />
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(40px, 8vw, 96px)',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                        marginBottom: 32,
                        backgroundImage: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {t('landing.hero.title_top')}<br />
                        <span style={{
                            backgroundImage: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>{t('landing.hero.title_bottom')}</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: '#888',
                        maxWidth: 640,
                        margin: '0 auto 48px',
                        lineHeight: 1.6
                    }}>
                        {t('landing.hero.description')}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                backgroundColor: '#6366f1',
                                color: '#fff',
                                padding: '14px 28px',
                                borderRadius: 8,
                                fontSize: 16,
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                            Empezar tu proyecto <ArrowRight size={18} />
                        </button>
                        <button style={{
                            backgroundColor: '#232323',
                            color: '#fff',
                            padding: '14px 28px',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer'
                        }}>
                            {t('landing.hero.cta_secondary')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Trusted By / Partners */}
            <section style={{ padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32 }}>
                    {t('landing.social.trusted_by')}
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '40px 60px',
                    opacity: 0.5,
                    filter: 'grayscale(1)'
                }}>
                    {['submagic', 'moz://a', 'GitHub', '1Password', 'Priceline'].map(brand => (
                        <span key={brand} style={{ fontSize: 20, fontWeight: 700, color: '#888' }}>{brand}</span>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 24
                }}>
                    {features.map((f, i) => (
                        <div key={i} className="feature-card" style={{
                            backgroundColor: '#161616',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: 12,
                            padding: 32,
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                .feature-card:hover {
                    border-color: rgba(99, 102, 241, 0.3) !important;
                    transform: translateY(-4px);
                    background-color: #1a1a1a !important;
                }
            `}</style>
        </MarketingLayout>
    );
}
