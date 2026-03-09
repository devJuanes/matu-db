import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
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
            toast.success('Acceso autorizado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Credenciales inválidas');
        }
    };

    return (
        <AuthLayout mode="login">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div className="form-group">
                    <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, display: 'block' }}>
                        {t('auth.login.email_label') || 'Identificador de Usuario'}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            type="email"
                            placeholder="admin@enterprise.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ height: 52, fontSize: 15, paddingLeft: 48, borderRadius: 14 }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13 }}>
                            {t('auth.login.password_label') || 'Código de Acceso'}
                        </label>
                        <a href="#" style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>¿Recuperar contraseña?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ paddingRight: 48, paddingLeft: 48, height: 52, fontSize: 15, borderRadius: 14 }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(v => !v)}
                            style={{
                                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                display: 'flex', padding: 4
                            }}
                        >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <button className="btn btn-primary w-full" type="submit" disabled={isLoading} style={{ height: 56, fontSize: 16, fontWeight: 900, borderRadius: 16, gap: 12, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.25)' }}>
                        {isLoading ? <span className="spinner-sm" style={{ width: 22, height: 22, borderTopColor: 'transparent' }} /> : <>Entrar a la Consola <ArrowRight size={20} /></>}
                    </button>
                </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>
                    {t('auth.login.no_account') || '¿Operando sin cuenta?'}{' '}
                    <Link to="/auth/register" style={{ color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>Registrar Nueva Infraestructura</Link>
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
