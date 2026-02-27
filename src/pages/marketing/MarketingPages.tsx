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

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <button className="btn btn-primary" style={{ height: 52, padding: '0 32px', fontSize: 16, fontWeight: 700, borderRadius: 12 }}>
                            Get Started
                        </button>
                        <button className="btn btn-ghost" style={{ height: 52, padding: '0 32px', color: '#fff', fontSize: 16, fontWeight: 600 }}>
                            Documentation <ArrowRight size={18} style={{ marginLeft: 8 }} />
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
        title="The total developer platform."
        subtitle="MatuDB Product"
        description="Everything you need to build and scale your next application. From Postgres to Edge Functions."
        icon={<Zap size={14} />}
    />
);

export const DevelopersPage = () => (
    <MarketingPage
        title="Built by devs, for devs."
        subtitle="Developer Hub"
        description="Powerful APIs, comprehensive documentation, and a community of builders ready to help."
        icon={<Database size={14} />}
    />
);

export const SolutionsPage = () => (
    <MarketingPage
        title="Ready for any challenge."
        subtitle="Enterprise Solutions"
        description="Secure, scalable, and reliable infrastructure for companies of all sizes."
        icon={<Shield size={14} />}
    />
);

export const PricingPage = () => (
    <MarketingPage
        title="Transparent pricing."
        subtitle="MatuDB Pricing"
        description="Predictable pricing that scales with your growth. Start for free, pay as you grow."
    />
);

export const DocsPage = () => (
    <MarketingPage
        title="Learn everything."
        subtitle="Documentation"
        description="Guides, references, and tutorials for every MatuDB feature."
    />
);

export const BlogPage = () => (
    <MarketingPage
        title="Latest from MatuDB."
        subtitle="MatuDB Blog"
        description="The latest product updates, engineering insights, and community stories."
    />
);
