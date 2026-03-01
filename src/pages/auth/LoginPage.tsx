import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Github, Globe, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <AuthLayout mode="login">
            {/* Social Logins */}
            {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button type="button" className="btn btn-social btn-sm" style={{ justifyContent: 'center', gap: 8 }}>
                    <Github size={16} /> GitHub
                </button>
                <button type="button" className="btn btn-social btn-sm" style={{ justifyContent: 'center', gap: 8 }}>
                    <Globe size={16} /> Google
                </button>
            </div> */}

            {/* Divider */}
            {/* <div style={{ position: 'relative', textAlign: 'center', margin: '12px 0' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ position: 'relative', background: '#040405', padding: '0 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {t('auth.login.or')}
                </span>
            </div> */}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                        {t('auth.login.email_label')}
                    </label>
                    <input className="input matudb-input" type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ height: 48, fontSize: 15 }} />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                        {t('auth.login.password_label')}
                        <a href="#" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>{t('auth.login.forgot_password')}</a>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input className="input matudb-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44, height: 48, fontSize: 15 }} required />
                        <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', display: 'flex', padding: 4 }}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button className="btn btn-primary w-full btn-lg" type="submit" disabled={isLoading} style={{ height: 52, fontSize: 15, fontWeight: 700, gap: 10 }}>
                    {isLoading ? <><span className="spinner spinner-sm" />{t('auth.login.submitting')}</> : <>{t('auth.login.submit')} <ArrowRight size={18} /></>}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    {t('auth.login.no_account')}{' '}
                    <Link to="/auth/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand)' }}>{t('auth.login.create_account')}</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
