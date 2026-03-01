import { Sparkles, ArrowRight, Zap, Shield, Database } from 'lucide-react';
import MarketingLayout from './MarketingLayout';

interface MarketingPageProps {
    title: string;
    subtitle: string;
    description: string;
    icon?: React.ReactNode;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ title, subtitle, description, icon }) => {
    return (
        <MarketingLayout>
            <div style={{ padding: '160px 32px 100px', textAlign: 'center', position: 'relative' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        color: 'var(--brand)', fontSize: 13, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 24,
                        padding: '6px 16px', borderRadius: 30, background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        {icon || <Sparkles size={14} />} {subtitle}
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(40px, 6vw, 72px)',
                        fontWeight: 800,
                        letterSpacing: '-2px',
                        color: '#fff',
                        lineHeight: 1,
                        marginBottom: 32
                    }}>
                        {title}
                    </h1>

                    <p style={{
                        fontSize: 20,
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.6,
                        marginBottom: 48,
                        maxWidth: 600,
                        margin: '0 auto 48px'
                    }}>
                        {description}
                    </p>

                    {/* We no longer show these generic buttons on all pages. They will be specific per page if needed, or we just keep a default Start Project button */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <button className="btn btn-primary" style={{ height: 52, padding: '0 32px', fontSize: 16, fontWeight: 700, borderRadius: 12 }}>
                            Empezar ahora
                        </button>
                    </div>
                </div>

                {/* Decorative section */}
                <div style={{
                    marginTop: 100, maxWidth: 1000, margin: '100px auto 0',
                    height: 400, borderRadius: 24, background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center', opacity: 0.3 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Interactive Preview Coming Soon</div>
                        <div style={{ fontSize: 14, color: '#888' }}>We're building something amazing here.</div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
};

export const ProductPage = () => (
    <MarketingPage
        title="La plataforma total para desarrolladores."
        subtitle="PRODUCTO MATUDB"
        description="Todo lo que necesitas para construir y escalar tu próxima aplicación. Una base de datos SQL impulsada por PostgreSQL robusta, rápida e ideal para desarrolladores, con un editor moderno."
        icon={<Zap size={14} />}
    />
);

export const DevelopersPage = () => (
    <MarketingPage
        title="Construido por devs, para devs."
        subtitle="CENTRO DE DESARROLLADORES"
        description="Potentes APIs y datos de ejemplo listos para empezar a construir. *(Nota: Estos son datos y documentación de ejemplo para ilustrar el funcionamiento real de PostgreSQL y la base de datos local)*"
        icon={<Database size={14} />}
    />
);

export const SolutionsPage = () => (
    <MarketingPage
        title="Listos para cualquier desafío."
        subtitle="SOLUCIONES"
        description="Infraestructura segura, escalable y confiable. Solucionamos la gestión de tus bases de datos SQL y PostgreSQL con un editor visual hermoso y capacidades locales de alto rendimiento."
        icon={<Shield size={14} />}
    />
);

export const PricingPage = () => {
    return (
        <MarketingLayout>
            <div style={{ padding: '160px 32px 100px', textAlign: 'center', position: 'relative' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: 32 }}>
                        Precios transparentes.
                    </h1>
                    <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 48, maxWidth: 600, margin: '0 auto 64px' }}>
                        Empieza gratis, escala cuando lo necesites.
                    </p>
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap',
                    maxWidth: 1000, margin: '0 auto'
                }}>
                    {/* Hobby Tier */}
                    <div style={{
                        flex: '1 1 300px', background: '#111', padding: 40, borderRadius: 24,
                        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left'
                    }}>
                        <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Hobby</h3>
                        <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 24 }}>$0<span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>/mes</span></div>
                        <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Para proyectos personales y pruebas.</p>

                        <a href="https://wa.me/573023580862" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-ghost" style={{ width: '100%', height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }}>
                                Empezar gratis
                            </button>
                        </a>
                    </div>

                    {/* Pro Tier */}
                    <div style={{
                        flex: '1 1 300px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 100%)',
                        padding: 40, borderRadius: 24, border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'left',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20, letterSpacing: '1px', textTransform: 'uppercase' }}>Más Popular</div>
                        <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Pro</h3>
                        <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 24 }}>$29<span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>/mes</span></div>
                        <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Para equipos y aplicaciones en producción.</p>

                        <a href="https://wa.me/573023580862" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-primary" style={{ width: '100%', height: 48, borderRadius: 12, fontWeight: 600 }}>
                                Adquirir Pro
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
};

export const BlogPage = () => {
    const posts = [
        { id: 1, title: '¿Qué solucionamos con bases de datos modernas?', excerpt: 'Cómo MatuDB optimiza la gestión SQL y la conexión con herramientas actuales.', date: 'Mar 1, 2026' },
        { id: 2, title: 'Introducción a PostgreSQL local vs. nube', excerpt: 'Las diferencias clave, y cómo aprovechar una configuración robusta de Postgres para tu proyecto.', date: 'Feb 26, 2026' },
        { id: 3, title: 'Diseñando un modelo de datos eficiente en SQL', excerpt: 'Mejores prácticas para organizar esquemas y tablas antes de escribir código.', date: 'Feb 22, 2026' },
        { id: 4, title: 'Cómo funciona nuestra interfaz gráfica de DB', excerpt: 'Un recorrido por el editor SQL integrado y la gestión de tablas simplificada.', date: 'Feb 15, 2026' },
        { id: 5, title: 'Ejemplos de consultas SQL complejas simplificadas', excerpt: 'Aprende a realizar JOINs y agrupaciones de manera efectiva con nuestros datos de ejemplo.', date: 'Feb 10, 2026' },
        { id: 6, title: 'Seguridad y encriptación de datos PostgreSQL', excerpt: 'Por qué priorizamos la seguridad de extremo a extremo en cada transacción de la plataforma.', date: 'Ene 29, 2026' },
        { id: 7, title: 'Migración rápida de datos de prueba', excerpt: 'Estrategias para poblar tu base de datos rápidamente durante la etapa de desarrollo.', date: 'Ene 18, 2026' },
        { id: 8, title: 'Manejo de Edge Functions junto con PostgreSQL', excerpt: 'Integrando lógica del lado del servidor directamente con disparadores (triggers) en la DB.', date: 'Ene 5, 2026' },
        { id: 9, title: '¿Por qué elegir un editor SQL visual?', excerpt: 'Acelera tu productividad evitando la terminal de comandos para tareas repetitivas de mantenimiento.', date: 'Dic 20, 2025' },
        { id: 10, title: 'Prácticas recomendadas para respaldos (Backups)', excerpt: 'Cómo asegurar que tus datos estructurados siempre tengan una copia de seguridad confiable.', date: 'Dic 12, 2025' }
    ];

    return (
        <MarketingLayout>
            <div style={{ padding: '160px 32px 100px', position: 'relative' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        color: 'var(--brand)', fontSize: 13, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 24,
                        padding: '6px 16px', borderRadius: 30, background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <Sparkles size={14} /> Blog de MatuDB
                    </div>
                    <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: 32 }}>
                        Novedades y artículos.
                    </h1>
                    <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
                        Descubre cómo solucionamos problemas con bases de datos, guías de código SQL y detalles del ecosistema PostgreSQL.
                    </p>
                </div>

                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {posts.map(post => (
                        <div key={post.id} style={{
                            background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32,
                            display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s', cursor: 'pointer'
                        }} className="blog-card" onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }} onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                            <div style={{ color: '#6366f1', fontSize: 13, fontWeight: 700 }}>{post.date}</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{post.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6 }}>{post.excerpt}</p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 14, fontWeight: 600 }}>
                                Leer más <ArrowRight size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MarketingLayout>
    );
};
