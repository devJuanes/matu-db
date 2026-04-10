import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { projectPublicAuthAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Lock, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';

/** Restablece contraseña de usuario final del proyecto (JWT en URL desde correo). */
export default function ProjectUserResetPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const projectId = useMemo(() => params.get('projectId') || '', [params]);
    const token = useMemo(() => params.get('token') || '', [params]);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !token) {
            toast.error('Enlace incompleto');
            return;
        }
        if (password.length < 8) {
            toast.error('Mínimo 8 caracteres');
            return;
        }
        if (password !== password2) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            await projectPublicAuthAPI.completePasswordReset(projectId, token, password);
            toast.success('Contraseña actualizada. Ya puedes iniciar sesión en tu app.');
            navigate('/auth/login', { replace: true });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Token inválido o expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout mode="login">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Nueva contraseña (app)</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
                Esta pantalla es para usuarios finales de tu producto (auth del proyecto), no para la consola MatuDB.
            </p>
            {!projectId || !token ? (
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    Enlace inválido. Solicita un nuevo correo desde tu aplicación o desde el panel de usuarios del proyecto.
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
                        {loading ? <span className="spinner-sm" style={{ width: 22, height: 22 }} /> : <>Actualizar contraseña <ArrowRight size={18} /></>}
                    </button>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                        <Link to="/auth/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>Ir a consola MatuDB</Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}
