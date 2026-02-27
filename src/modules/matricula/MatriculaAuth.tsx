import { useState } from 'react';
import { MATUDB_CONFIG, authUrl } from './config';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import logo from '../../assets/logo.png';


interface StudentSession {
    id: string;
    email: string;
    name: string | null;
    role: string;
    token: string;
}

const KEY = 'matricula_student_session';

export const getSession = (): StudentSession | null => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
};
export const saveSession = (s: StudentSession) => localStorage.setItem(KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(KEY);

/* ── Auth API ────────────────────────────────────────────── */
const authPost = async (endpoint: string, body: object) => {
    const url = new URL(authUrl(endpoint));
    url.searchParams.set('apikey', MATUDB_CONFIG.ANON_KEY);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error');
    return json.data;
};

/* ── Login Form ──────────────────────────────────────────── */
function LoginForm({ onSuccess, onSwitch }: { onSuccess: (s: any) => void; onSwitch: () => void }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authPost('login', { email, password });
            // data = { user: {...}, token: '...' }
            toast.success(`¡Bienvenido, ${data.user?.name || data.user?.email || email}!`);
            onSuccess(data);
        } catch (err: any) {
            toast.error(err.message || 'Credenciales incorrectas');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
                <label className="form-label">{t('matricula.auth.email_label')}</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" type="email" placeholder="estudiante@universidad.edu"
                        value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 32 }} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">{t('matricula.auth.password_label')}</label>
                <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 32, paddingRight: 36 }} />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" />{t('matricula.auth.logging_in')}</> : <><LogIn size={15} />{t('matricula.auth.login_btn')}</>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {t('matricula.auth.no_account')}{' '}
                <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    {t('matricula.auth.register_here')}
                </button>
            </p>
        </form>
    );
}

/* ── Register Form ───────────────────────────────────────── */
function RegisterForm({ onSuccess, onSwitch }: { onSuccess: (s: any) => void; onSwitch: () => void }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
        if (password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
        setLoading(true);
        try {
            const data = await authPost('register', { email, password, name });
            // data = { user: {...}, token: '...' }
            toast.success('¡Cuenta creada exitosamente!');
            onSuccess(data);
        } catch (err: any) {
            toast.error(err.message || 'Error al registrar');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
                <label className="form-label">{t('matricula.auth.full_name_label')}</label>
                <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" type="text" placeholder="María García"
                        value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: 32 }} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">{t('matricula.auth.email_label')}</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" type="email" placeholder="estudiante@universidad.edu"
                        value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 32 }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                    <label className="form-label">{t('matricula.auth.password_label')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••"
                            value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 32, paddingRight: 32 }} />
                        <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('matricula.auth.confirm_password_label')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••"
                            value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ paddingLeft: 32 }} />
                    </div>
                </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" />{t('matricula.auth.registering')}</> : <><UserPlus size={15} />{t('matricula.auth.register_btn')}</>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {t('matricula.auth.have_account')}{' '}
                <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    {t('matricula.auth.login_here')}
                </button>
            </p>
        </form>
    );
}

/* ── Auth Modal ──────────────────────────────────────────── */
export default function MatriculaAuthModal({
    onClose,
    onAuthenticated,
}: {
    onClose: () => void;
    onAuthenticated: (s: StudentSession) => void;
}) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={logo} alt="MatuDB Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <div>
                            <div className="modal-title" style={{ lineHeight: 1.2 }}>
                                {mode === 'login' ? t('matricula.auth.student_access') : t('matricula.auth.new_account')}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('matricula.auth.portal_subtitle')}</div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body">
                    {/* Toggle tabs */}
                    <div style={{ display: 'flex', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 20 }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)}
                                style={{
                                    flex: 1, padding: '7px 0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
                                    background: mode === m ? 'var(--bg-surface)' : 'transparent',
                                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.2)' : 'none',
                                }}>
                                {m === 'login' ? t('matricula.auth.login_tab') : t('matricula.auth.register_tab')}
                            </button>
                        ))}
                    </div>

                    {mode === 'login'
                        ? <LoginForm onSuccess={d => { const s = { ...d.user, token: d.token }; saveSession(s); onAuthenticated(s); }} onSwitch={() => setMode('register')} />
                        : <RegisterForm onSuccess={d => { const s = { ...d.user, token: d.token }; saveSession(s); onAuthenticated(s); }} onSwitch={() => setMode('login')} />
                    }
                </div>

                {/* Powered by footer */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {t('matricula.auth.secure_footer')} <img src={logo} alt="MatuDB" style={{ width: 12, height: 12 }} /> <strong style={{ color: 'var(--brand)' }}>MatuDB Auth</strong>
                </div>
            </div>
        </div>
    );
}
