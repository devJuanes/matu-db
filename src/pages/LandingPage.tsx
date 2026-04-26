import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Database,
    ShieldCheck,
    Zap,
    Radio,
    HardDrive,
    Code2,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Rocket,
    CircleDollarSign
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

    const logos = ['NovaRetail', 'CloudAxis', 'Finvero', 'BetaBank', 'QuickLogix', 'EduNexa'];

    const testimonials = [
        {
            quote: 'Reducimos tiempos de entrega de 3 semanas a 5 dias con la consola de MatuDB.',
            name: 'Laura Rojas',
            role: 'CTO, NovaRetail'
        },
        {
            quote: 'Pasamos de scripts manuales a una operacion estable con automatizaciones visuales.',
            name: 'Daniel Gomez',
            role: 'Head of Engineering, CloudAxis'
        },
        {
            quote: 'Nos dio velocidad para probar ideas y lanzar funcionalidades de negocio en horas.',
            name: 'Sofia Martinez',
            role: 'Product Lead, Finvero'
        }
    ];

    return (
        <MarketingLayout>
            <section style={{
                padding: '28px 24px 0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'center' }} className="landing-hero-grid">
                        <div style={{ textAlign: 'left' }}>
                            <h1 style={{
                                fontSize: 'clamp(38px, 6.2vw, 72px)',
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.05,
                                marginBottom: 20,
                                color: 'var(--text-primary)'
                            }}>
                                Convierte tu idea en producto
                                <br />
                                <span style={{ color: 'var(--brand)' }}>sin pelear con infraestructura</span>
                            </h1>

                            <p style={{
                                fontSize: 'clamp(16px, 2vw, 19px)',
                                color: 'var(--text-secondary)',
                                maxWidth: 640,
                                margin: '0 0 30px',
                                lineHeight: 1.7
                            }}>
                                MatuDB centraliza base de datos, autenticacion, storage y automatizaciones para que tu equipo construya features que venden.
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="btn btn-primary"
                                    style={{ padding: '14px 28px', fontSize: 16, fontWeight: 800 }}
                                >
                                    Crear proyecto gratis <ArrowRight size={18} />
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '14px 28px', fontSize: 16 }}
                                    onClick={() => navigate('/product')}
                                >
                                    Ver como funciona
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                {['Sin tarjeta de credito', 'Setup en minutos', 'Escala para produccion'].map((text) => (
                                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
                                        <CheckCircle2 size={14} color="var(--brand)" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hero-preview-card" style={{
                            background: 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(16,185,129,0.01))',
                            border: '1px solid var(--border)',
                            borderRadius: 24,
                            padding: 22,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                                    <Sparkles size={16} color="var(--brand)" /> Panel en vivo
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>Online</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div className="live-stat-card">
                                    <span>Requests/min</span>
                                    <strong>128,440</strong>
                                </div>
                                <div className="live-stat-card">
                                    <span>Latencia</span>
                                    <strong>42ms</strong>
                                </div>
                                <div className="live-stat-card">
                                    <span>Eventos realtime</span>
                                    <strong>12,9k</strong>
                                </div>
                                <div className="live-stat-card">
                                    <span>Errores 5xx</span>
                                    <strong>0.03%</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>Regla activa: Notificar pedidos premium</span>
                                <CircleDollarSign size={14} color="var(--brand)" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-orb hero-orb-a" />
                <div className="hero-orb hero-orb-b" />
            </section>

            <section style={{ padding: '26px 24px 14px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
                        Equipos que ya prueban MatuDB
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                        {logos.map((logo) => (
                            <div key={logo} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', background: 'var(--bg-surface)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {logo}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
                    {[
                        { label: 'Proyectos desplegados', val: '50k+' },
                        { label: 'Tiempo de actividad', val: '99.99%' },
                        { label: 'Tiempo medio de respuesta', val: '< 50ms' },
                        { label: 'Automatizaciones ejecutadas', val: '4.2M+' },
                    ].map(stat => (
                        <div key={stat.label}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand)' }}>{stat.val}</div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Todo lo que necesitas para vender y escalar</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>Una plataforma integrada que elimina friccion entre producto, desarrollo y operaciones.</p>
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

            <section style={{ padding: '0 24px 80px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>Historias de equipos</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {testimonials.map((item) => (
                            <div key={item.name} className="card" style={{ padding: 24 }}>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15, marginBottom: 18 }}>
                                    "{item.quote}"
                                </p>
                                <div style={{ fontWeight: 800, fontSize: 14 }}>{item.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '0 24px 40px' }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    border: '1px solid var(--border)',
                    borderRadius: 24,
                    padding: '36px 28px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.03))',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 18
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Convierte visitas en clientes</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 16 }}>
                            Lanza tu backend en minutos y enfoca a tu equipo en construir experiencia de producto.
                        </p>
                    </div>
                    <button className="btn btn-primary" style={{ height: 50, padding: '0 24px', fontWeight: 800 }} onClick={() => navigate('/auth/register')}>
                        Probar MatuDB ahora <ArrowRight size={17} />
                    </button>
                </div>
            </section>

            <style>{`
                .feature-card:hover {
                    border-color: var(--brand) !important;
                    transform: translateY(-6px);
                    box-shadow: 0 18px 32px rgba(0,0,0,0.12);
                }
                .hero-preview-card {
                    animation: floatY 4.6s ease-in-out infinite;
                }
                .live-stat-card {
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 12px;
                    background: var(--bg-surface);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .live-stat-card span {
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                }
                .live-stat-card strong {
                    font-size: 18px;
                    color: var(--text-primary);
                    font-weight: 900;
                    letter-spacing: -.4px;
                }
                .hero-orb {
                    position: absolute;
                    border-radius: 999px;
                    filter: blur(48px);
                    opacity: .38;
                    z-index: 0;
                    pointer-events: none;
                    animation: pulseOrb 5s ease-in-out infinite;
                }
                .hero-orb-a {
                    width: 260px;
                    height: 260px;
                    background: rgba(16,185,129,.24);
                    top: 100px;
                    left: -100px;
                }
                .hero-orb-b {
                    width: 220px;
                    height: 220px;
                    background: rgba(59,130,246,.18);
                    right: -80px;
                    top: 210px;
                }
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulseOrb {
                    0%, 100% { transform: scale(1); opacity: .24; }
                    50% { transform: scale(1.1); opacity: .38; }
                }
                @media (max-width: 980px) {
                    .landing-hero-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </MarketingLayout>
    );
}
