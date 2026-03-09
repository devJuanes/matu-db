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
    useTranslation();

    const features = [
        {
            title: 'Base de datos SQL',
            description: 'Potente base de datos Postgres con todas las funcionalidades que esperas de un entorno empresarial.',
            icon: <Database size={20} />,
        },
        {
            title: 'Autenticación Segura',
            description: 'Gestiona usuarios y roles de forma sencilla con nuestro sistema de autenticación integrado.',
            icon: <ShieldCheck size={20} />,
        },
        {
            title: 'Edge Functions',
            description: 'Ejecuta lógica personalizada cerca de tus usuarios para una latencia mínima y escalabilidad infinita.',
            icon: <Zap size={20} />,
        },
        {
            title: 'Realtime Sync',
            description: 'Sincroniza datos en tiempo real entre todos tus clientes sin configurar servidores complejos.',
            icon: <Radio size={20} />,
        },
        {
            title: 'Almacenamiento',
            description: 'Sube y gestiona archivos grandes con nuestra infraestructura de almacenamiento redundante.',
            icon: <HardDrive size={20} />,
        },
        {
            title: 'API de Vectores',
            description: 'Integración nativa para búsqueda semántica y aplicaciones de IA de última generación.',
            icon: <Code2 size={20} />,
        }
    ];

    return (
        <MarketingLayout>
            {/* Hero Section */}
            <section style={{
                padding: '120px 24px 80px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px', borderRadius: 20, background: 'var(--bg-overlay)',
                        fontSize: 13, fontWeight: 600, color: 'var(--brand)', marginBottom: 24,
                        border: '1px solid var(--border)'
                    }}>
                        <span style={{ fontSize: 16 }}>🚀</span> MatuDB Beta ya disponible
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 8vw, 72px)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        marginBottom: 24,
                        color: 'var(--text-primary)'
                    }}>
                        La infraestructura de datos <br />
                        para <span style={{ color: 'var(--brand)' }}>empresas modernas</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 19px)',
                        color: 'var(--text-secondary)',
                        maxWidth: 640,
                        margin: '0 auto 40px',
                        lineHeight: 1.6
                    }}>
                        Crea, escala y gestiona tus aplicaciones con la base de datos empresarial más rápida e intuitiva del mercado. Sin configuraciones complejas.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-primary"
                            style={{ padding: '14px 32px', fontSize: 16 }}
                        >
                            Empezar ahora — Es gratis <ArrowRight size={18} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '14px 32px', fontSize: 16 }}>
                            Ver documentación
                        </button>
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
                    {[
                        { label: 'Proyectos creados', val: '50k+' },
                        { label: 'Tiempo de actividad', val: '99.99%' },
                        { label: 'Tiempo de respuesta', val: '< 50ms' },
                    ].map(stat => (
                        <div key={stat.label}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand)' }}>{stat.val}</div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Todo lo que necesitas para escalar</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>Una plataforma integrada que elimina la fricción del desarrollo.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 32
                }}>
                    {features.map((f, i) => (
                        <div key={i} className="card feature-card" style={{
                            padding: 32,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--brand)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700 }}>{f.title}</h3>
                            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                .feature-card:hover {
                    border-color: var(--brand) !important;
                    transform: translateY(-4px);
                }
            `}</style>
        </MarketingLayout>
    );
}
