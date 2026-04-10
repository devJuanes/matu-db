import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Lock, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = useMemo(() => params.get('token') || '', [params]);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('Mínimo 8 caracteres');
            return;
        }
        if (password !== password2) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (!token) {
            toast.error('Enlace inválido o incompleto');
            return;
        }
        setLoading(true);
        try {
            await authAPI.resetPassword(token, password);
            toast.success('Contraseña actualizada');
            navigate('/auth/login', { replace: true });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Token inválido o expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout mode="login">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Nueva contraseña</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
                Elige una contraseña segura para tu cuenta de la consola MatuDB.
            </p>
            {!token ? (
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    Falta el token en la URL.{' '}
                    <Link to="/auth/forgot-password" style={{ color: 'var(--brand)', fontWeight: 700 }}>Solicitar nuevo enlace</Link>
                </div>
            ) : (
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 800, fontSize: 13 }}>Nueva contraseña</label>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ height: 52, paddingLeft: 48, borderRadius: 14 }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 800, fontSize: 13 }}>Confirmar</label>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password2}
                                onChange={e => setPassword2(e.target.value)}
                                style={{ height: 52, paddingLeft: 48, borderRadius: 14 }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 52, fontWeight: 800, borderRadius: 14, gap: 10 }}>
                        {loading ? <span className="spinner-sm" style={{ width: 22, height: 22 }} /> : <>Guardar y entrar <ArrowRight size={18} /></>}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}
