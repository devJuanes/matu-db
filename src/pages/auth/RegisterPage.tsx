import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
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
        if (form.password !== form.confirm) { toast.error('Las contraseñas no coincidez'); return; }
        if (form.password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
        try {
            await register(form.email, form.password, form.full_name);
            toast.success('¡Registro de infraestructura completado!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error durante el registro');
        }
    };

    return (
        <AuthLayout mode="register">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="form-group">
                    <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, display: 'block' }}>
                        {t('auth.register.name_label') || 'Nombre del Operador'}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="ej: Alexander Pierce"
                            value={form.full_name}
                            onChange={set('full_name')}
                            required
                            style={{ paddingLeft: 48, height: 52, fontSize: 15, borderRadius: 14 }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, display: 'block' }}>
                        {t('auth.register.email_label') || 'Correo Institucional'}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            type="email"
                            placeholder="admin@empresa.com"
                            value={form.email}
                            onChange={set('email')}
                            required
                            style={{ paddingLeft: 48, height: 52, fontSize: 15, borderRadius: 14 }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, display: 'block' }}>
                            {t('auth.register.password_label') || 'Contraseña'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={set('password')}
                                required
                                style={{ paddingLeft: 48, paddingRight: 40, height: 52, fontSize: 15, borderRadius: 14 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                                }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, display: 'block' }}>
                            {t('auth.register.confirm_password') || 'Confirmar'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.confirm}
                                onChange={set('confirm')}
                                required
                                style={{ paddingLeft: 48, height: 52, fontSize: 15, borderRadius: 14 }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '14px 18px', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} color="var(--brand)" style={{ marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Al registrarte, aceptas nuestros estándares de seguridad y protocolos de privacidad de datos v4.0.
                    </p>
                </div>

                <div style={{ marginTop: 8 }}>
                    <button className="btn btn-primary w-full" type="submit" disabled={isLoading} style={{ height: 56, fontSize: 16, fontWeight: 900, borderRadius: 16, gap: 12, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.25)' }}>
                        {isLoading ? <span className="spinner-sm" style={{ width: 22, height: 22, borderTopColor: 'transparent' }} /> : <>Finalizar Registro <ArrowRight size={20} /></>}
                    </button>
                </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>
                    {t('auth.register.have_account') || '¿Ya tienes acceso?'}{' '}
                    <Link to="/auth/login" style={{ color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>Iniciar Sesión</Link>
                </p>
            </div>

            <style>{`
                .input:focus {
                    border-color: var(--brand) !important;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
                }
                .spinner-sm {
                    width: 22px;
                    height: 22px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AuthLayout>
    );
}
