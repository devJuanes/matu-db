import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';

export default function RegisterPage() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirm) { toast.error(t('common.error') + ': Passwords do not match'); return; }
        if (form.password.length < 8) { toast.error(t('common.error') + ': Password must be at least 8 characters'); return; }
        try {
            await register(form.email, form.password, form.full_name);
            toast.success('Account created! Welcome to MatuDB.');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <AuthLayout mode="register">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('auth.register.name_label')}</label>
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                        <input className="input matudb-input" placeholder="Matu Developer" value={form.full_name} onChange={set('full_name')} required style={{ paddingLeft: 42, height: 48, fontSize: 15 }} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('auth.register.email_label')}</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                        <input className="input matudb-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required style={{ paddingLeft: 42, height: 48, fontSize: 15 }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('auth.register.password_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                            <input className="input matudb-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required style={{ paddingLeft: 42, paddingRight: 40, height: 48, fontSize: 15 }} />
                            <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', display: 'flex', padding: 4 }}>
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('auth.register.confirm_password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                            <input className="input matudb-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required style={{ paddingLeft: 42, height: 48, fontSize: 15 }} />
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary w-full btn-lg" type="submit" disabled={isLoading} style={{ height: 52, fontSize: 15, fontWeight: 700, gap: 10, marginTop: 12 }}>
                    {isLoading ? <><span className="spinner spinner-sm" />{t('auth.register.submitting')}</> : <>{t('auth.register.submit')} <ArrowRight size={18} /></>}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    {t('auth.register.have_account')}{' '}
                    <Link to="/auth/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand)' }}>{t('auth.register.sign_in')}</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
