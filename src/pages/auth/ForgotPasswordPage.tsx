import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.forgotPassword(email.trim());
            setSent(true);
            toast.success('Si el correo existe, recibirás instrucciones en breve');
        } catch {
            toast.error('No se pudo procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout mode="login">
            <Link
                to="/auth/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none', marginBottom: 24 }}
            >
                <ArrowLeft size={16} /> Volver al acceso
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Recuperar acceso</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
                Te enviaremos un enlace seguro a tu correo para crear una nueva contraseña en la consola MatuDB.
            </p>
            {sent ? (
                <div
                    style={{
                        padding: 20,
                        borderRadius: 16,
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        fontSize: 14,
                        color: 'var(--text-primary)',
                    }}
                >
                    Revisa tu bandeja (y spam). El enlace caduca en aproximadamente 1 hora.
                </div>
            ) : (
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, display: 'block' }}>Correo registrado</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@empresa.com"
                                style={{ height: 52, paddingLeft: 48, borderRadius: 14 }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 52, fontWeight: 800, borderRadius: 14 }}>
                        {loading ? <span className="spinner-sm" style={{ width: 22, height: 22 }} /> : 'Enviar enlace'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}
