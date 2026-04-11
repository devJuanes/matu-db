import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { authAPI, keysAPI, paymentsWompiAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    CreditCard, Lock, Save, Copy, ExternalLink, Shield, Code, Link2,
    AlertTriangle, Clock, RefreshCw
} from 'lucide-react';

function reauthStorageKey(projectId: string) {
    return `matudb_payments_reauth_${projectId}`;
}

function jwtExpMs(token: string): number | null {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

type Tab = 'config' | 'link' | 'examples';

export default function PaymentGatewayPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<{ project: { name: string } }>();

    const [tab, setTab] = useState<Tab>('config');
    const [pwd, setPwd] = useState('');
    const [reauthToken, setReauthToken] = useState<string | null>(null);
    const [secsLeft, setSecsLeft] = useState(0);
    const [unlocking, setUnlocking] = useState(false);

    const [payMeta, setPayMeta] = useState<{
        configured: boolean;
        server_encryption_ready?: boolean;
        has_private_key?: boolean;
        has_integrity_secret?: boolean;
        environment?: string;
        public_key?: string | null;
        merchant_name?: string | null;
        default_currency?: string;
    } | null>(null);
    const [payForm, setPayForm] = useState({
        environment: 'sandbox' as 'sandbox' | 'production',
        publicKey: '',
        privateKey: '',
        integritySecret: '',
        merchantName: '',
        defaultCurrency: 'COP',
    });
    const [paySaving, setPaySaving] = useState(false);
    const [docLoading, setDocLoading] = useState(false);

    const [keys, setKeys] = useState<{ anon_key?: string; service_role_key?: string }>({});

    const [linkForm, setLinkForm] = useState({
        name: 'Pago de prueba MatuDB',
        description: 'Generado desde el panel MatuDB',
        single_use: true,
        collect_shipping: false,
        amount_in_cents: '' as string | number,
        redirect_url: '',
        expires_at: '',
    });
    const [linkResult, setLinkResult] = useState<string | null>(null);
    const [linkLoading, setLinkLoading] = useState(false);

    const apiBase = import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api';
    const payBase = `${apiBase.replace(/\/+$/, '')}/projects/${projectId}/payments/wompi`;

    const clearReauth = useCallback(() => {
        if (projectId) sessionStorage.removeItem(reauthStorageKey(projectId));
        setReauthToken(null);
        setSecsLeft(0);
    }, [projectId]);

    const syncReauthFromStorage = useCallback(() => {
        if (!projectId) return;
        const raw = sessionStorage.getItem(reauthStorageKey(projectId));
        if (!raw) return;
        const exp = jwtExpMs(raw);
        if (!exp || exp <= Date.now()) {
            sessionStorage.removeItem(reauthStorageKey(projectId));
            return;
        }
        setReauthToken(raw);
    }, [projectId]);

    const loadConfig = useCallback(() => {
        if (!projectId) return;
        paymentsWompiAPI.getConfig(projectId).then((r) => {
            const d = r.data?.data;
            if (!d) return;
            setPayMeta({
                configured: d.configured,
                server_encryption_ready: d.server_encryption_ready,
                has_private_key: d.has_private_key,
                has_integrity_secret: d.has_integrity_secret,
                environment: d.environment,
                public_key: d.public_key,
                merchant_name: d.merchant_name,
                default_currency: d.default_currency,
            });
            setPayForm((f) => ({
                ...f,
                environment: d.environment === 'production' ? 'production' : 'sandbox',
                publicKey: d.public_key || '',
                merchantName: d.merchant_name || '',
                defaultCurrency: d.default_currency || 'COP',
                privateKey: '',
                integritySecret: '',
            }));
        }).catch(() => toast.error('No se pudo cargar la configuración de pagos'));
    }, [projectId]);

    useEffect(() => {
        syncReauthFromStorage();
        loadConfig();
        if (projectId) keysAPI.list(projectId).then((r) => setKeys(r.data.data || {})).catch(() => { });
    }, [projectId, syncReauthFromStorage, loadConfig]);

    useEffect(() => {
        if (!reauthToken) {
            setSecsLeft(0);
            return;
        }
        const tick = () => {
            const exp = jwtExpMs(reauthToken);
            if (!exp) {
                clearReauth();
                return;
            }
            const s = Math.max(0, Math.floor((exp - Date.now()) / 1000));
            setSecsLeft(s);
            if (s <= 0) {
                clearReauth();
                toast('Sesión de pagos expirada; vuelve a confirmar tu contraseña.');
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [reauthToken, clearReauth]);

    const unlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pwd.trim()) {
            toast.error('Ingresa tu contraseña');
            return;
        }
        setUnlocking(true);
        try {
            const res = await authAPI.verifyPassword(pwd);
            const token = res.data?.data?.reauth_token;
            if (!token || !projectId) throw new Error('Respuesta inválida');
            sessionStorage.setItem(reauthStorageKey(projectId), token);
            setReauthToken(token);
            setPwd('');
            toast.success('Acceso al módulo de pagos concedido (5 min)');
        } catch (err: unknown) {
            const ax = err as { response?: { data?: { message?: string } } };
            toast.error(ax.response?.data?.message || 'Contraseña incorrecta');
        } finally {
            setUnlocking(false);
        }
    };

    const handlePayError = (err: unknown) => {
        const ax = err as { response?: { status?: number } };
        if (ax.response?.status === 403) {
            clearReauth();
            toast.error('Debes confirmar de nuevo tu contraseña (sesión o permiso de pagos).');
        }
    };

    const saveWompi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !reauthToken) return;
        setPaySaving(true);
        try {
            const res = await paymentsWompiAPI.putConfig(projectId, payForm, reauthToken);
            const d = res.data?.data;
            toast.success('Configuración Wompi guardada');
            if (d) {
                setPayMeta({
                    configured: d.configured,
                    server_encryption_ready: d.server_encryption_ready,
                    has_private_key: d.has_private_key,
                    has_integrity_secret: d.has_integrity_secret,
                    environment: d.environment,
                    public_key: d.public_key,
                    merchant_name: d.merchant_name,
                    default_currency: d.default_currency,
                });
                setPayForm((f) => ({ ...f, privateKey: '', integritySecret: '' }));
            }
        } catch (err: unknown) {
            handlePayError(err);
            const ax = err as { response?: { data?: { message?: string } } };
            toast.error(ax.response?.data?.message || 'Error al guardar');
        } finally {
            setPaySaving(false);
        }
    };

    const copyDoc = async () => {
        if (!projectId || !reauthToken) return;
        setDocLoading(true);
        try {
            const res = await paymentsWompiAPI.getIntegrationDoc(projectId, reauthToken);
            const text = typeof res.data === 'string' ? res.data : String(res.data);
            await navigator.clipboard.writeText(text);
            toast.success('Documentación copiada al portapapeles');
        } catch (err: unknown) {
            handlePayError(err);
            toast.error('No se pudo obtener la documentación');
        } finally {
            setDocLoading(false);
        }
    };

    const createLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !reauthToken) return;
        setLinkLoading(true);
        setLinkResult(null);
        const body: Record<string, unknown> = {
            name: linkForm.name.trim(),
            description: linkForm.description.trim(),
            single_use: linkForm.single_use,
            collect_shipping: linkForm.collect_shipping,
            currency: 'COP',
        };
        const amt = String(linkForm.amount_in_cents).trim();
        if (amt !== '') body.amount_in_cents = parseInt(amt, 10);
        if (linkForm.redirect_url.trim()) body.redirect_url = linkForm.redirect_url.trim();
        if (linkForm.expires_at.trim()) body.expires_at = new Date(linkForm.expires_at).toISOString();

        try {
            const res = await paymentsWompiAPI.createPaymentLink(projectId, body, reauthToken);
            const data = res.data as { data?: { id?: string }; error?: { reason?: string } };
            const id = data?.data?.id;
            if (id) {
                const url = `https://checkout.wompi.co/l/${id}`;
                setLinkResult(url);
                toast.success('Link de pago creado');
            } else {
                toast.error(JSON.stringify(data) || 'Respuesta inesperada de Wompi');
            }
        } catch (err: unknown) {
            handlePayError(err);
            const ax = err as { response?: { data?: unknown } };
            toast.error(typeof ax.response?.data === 'string' ? ax.response.data : 'Error al crear el link');
        } finally {
            setLinkLoading(false);
        }
    };

    const mmss = (s: number) => {
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${r.toString().padStart(2, '0')}`;
    };

    const tabBtn = (id: Tab, label: string) => (
        <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
                padding: '10px 18px',
                borderRadius: 12,
                border: tab === id ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--border)',
                background: tab === id ? 'rgba(16,185,129,0.08)' : 'var(--bg-base)',
                color: tab === id ? 'var(--brand)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
            }}
        >
            {label}
        </button>
    );

    if (!reauthToken) {
        return (
            <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <div style={{
                    maxWidth: 440,
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 24,
                    padding: 36,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={22} color="var(--brand)" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Pasarela de pago</h1>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{project?.name}</p>
                        </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                        Por seguridad, confirma tu <strong>contraseña de MatuDB</strong> para trabajar con Wompi. La sesión reforzada dura <strong>5 minutos</strong> (luego deberás volver a ingresarla).
                    </p>
                    <form onSubmit={unlock}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Contraseña</label>
                        <input
                            type="password"
                            className="input"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            autoComplete="current-password"
                            style={{ width: '100%', height: 48, borderRadius: 12, marginBottom: 20 }}
                            placeholder="••••••••"
                        />
                        <button type="submit" className="btn btn-primary" disabled={unlocking} style={{ width: '100%', height: 48, borderRadius: 14, fontWeight: 800 }}>
                            {unlocking ? 'Verificando…' : 'Continuar'}
                        </button>
                    </form>
                    {payMeta && !payMeta.configured && (
                        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                            Aún no hay llaves Wompi guardadas. Tras desbloquear podrás configurarlas en la pestaña correspondiente.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 28px 48px', maxWidth: 980, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                        <CreditCard size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Pagos
                    </div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Wompi · {project?.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
                        Configuración cifrada, links de pago y ejemplos de integración.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', borderRadius: 14, border: '1px solid var(--border)',
                        background: 'var(--bg-surface)', fontSize: 13, fontWeight: 700,
                    }}>
                        <Clock size={16} color="var(--brand)" />
                        Sesión reforzada: {mmss(secsLeft)}
                    </div>
                    <button type="button" className="btn btn-ghost" onClick={clearReauth} style={{ fontSize: 12, fontWeight: 700 }}>
                        <RefreshCw size={14} style={{ marginRight: 6 }} /> Cerrar sesión de pagos
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                {tabBtn('config', 'Configuración')}
                {tabBtn('link', 'Link de pago')}
                {tabBtn('examples', 'Ejemplos')}
            </div>

            {tab === 'config' && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
                    {payMeta?.server_encryption_ready === false && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 20, fontSize: 14 }}>
                            El servidor debe definir <code>MATUDB_PAYMENT_ENCRYPTION_KEY</code> antes de guardar secretos.
                        </div>
                    )}
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                        Llave privada y secreto de integridad se guardan <strong>cifrados</strong>. Cambiar de <strong>sandbox a producción</strong> requiere guardar de nuevo (con esta sesión activa).
                    </p>
                    <form onSubmit={saveWompi} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>Ambiente</label>
                            <select className="input" value={payForm.environment} onChange={(e) => setPayForm((f) => ({ ...f, environment: e.target.value as 'sandbox' | 'production' }))} style={{ height: 46, borderRadius: 12, maxWidth: 280 }}>
                                <option value="sandbox">Sandbox (pruebas)</option>
                                <option value="production">Producción</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>Llave pública</label>
                            <input className="input" value={payForm.publicKey} onChange={(e) => setPayForm((f) => ({ ...f, publicKey: e.target.value }))} placeholder="pub_test_..." style={{ height: 46, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>
                                Llave privada {payMeta?.has_private_key ? <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>(vacío = no cambiar)</span> : null}
                            </label>
                            <input type="password" className="input" value={payForm.privateKey} onChange={(e) => setPayForm((f) => ({ ...f, privateKey: e.target.value }))} autoComplete="off" style={{ height: 46, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>
                                Secreto de integridad {payMeta?.has_integrity_secret ? <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>(vacío = no cambiar)</span> : null}
                            </label>
                            <input type="password" className="input" value={payForm.integritySecret} onChange={(e) => setPayForm((f) => ({ ...f, integritySecret: e.target.value }))} autoComplete="off" style={{ height: 46, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>Nombre comercio (opcional)</label>
                            <input className="input" value={payForm.merchantName} onChange={(e) => setPayForm((f) => ({ ...f, merchantName: e.target.value }))} style={{ height: 46, borderRadius: 12 }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>Moneda por defecto (API)</label>
                            <input className="input" value={payForm.defaultCurrency} onChange={(e) => setPayForm((f) => ({ ...f, defaultCurrency: e.target.value.toUpperCase() }))} style={{ height: 46, borderRadius: 12, maxWidth: 120 }} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                            <button type="button" className="btn btn-secondary" disabled={docLoading} onClick={copyDoc} style={{ height: 46, borderRadius: 12, fontWeight: 700 }}>
                                <Code size={16} style={{ marginRight: 8 }} />{docLoading ? '…' : 'Copiar documentación'}
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={paySaving || payMeta?.server_encryption_ready === false} style={{ height: 46, borderRadius: 12, fontWeight: 800 }}>
                                <Save size={18} style={{ marginRight: 8 }} />{paySaving ? 'Guardando…' : 'Guardar configuración'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {tab === 'link' && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                        Crea un <strong>link de pago oficial</strong> vía API de Wompi (<code>/payment_links</code>). El enlace usa el mismo ambiente (sandbox/producción) que tengas guardado.
                    </p>
                    <form onSubmit={createLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ fontWeight: 700, fontSize: 13 }}>Nombre del link</label>
                                <input className="input" value={linkForm.name} onChange={(e) => setLinkForm((f) => ({ ...f, name: e.target.value }))} required style={{ width: '100%', marginTop: 6, height: 44, borderRadius: 12 }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, fontSize: 13 }}>Descripción</label>
                                <input className="input" value={linkForm.description} onChange={(e) => setLinkForm((f) => ({ ...f, description: e.target.value }))} required style={{ width: '100%', marginTop: 6, height: 44, borderRadius: 12 }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13 }}>Monto en centavos (opcional · COP)</label>
                            <input className="input" type="number" min={0} value={linkForm.amount_in_cents} onChange={(e) => setLinkForm((f) => ({ ...f, amount_in_cents: e.target.value }))} placeholder="Ej. 50000 = $500 COP" style={{ maxWidth: 280, marginTop: 6, height: 44, borderRadius: 12 }} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                                <input type="checkbox" checked={linkForm.single_use} onChange={(e) => setLinkForm((f) => ({ ...f, single_use: e.target.checked }))} />
                                Un solo uso (cierra tras un pago aprobado)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                                <input type="checkbox" checked={linkForm.collect_shipping} onChange={(e) => setLinkForm((f) => ({ ...f, collect_shipping: e.target.checked }))} />
                                Pedir datos de envío
                            </label>
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13 }}>URL de redirección (opcional)</label>
                            <input className="input" value={linkForm.redirect_url} onChange={(e) => setLinkForm((f) => ({ ...f, redirect_url: e.target.value }))} placeholder="https://..." style={{ width: '100%', marginTop: 6, height: 44, borderRadius: 12 }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 700, fontSize: 13 }}>Expira (opcional, hora local)</label>
                            <input type="datetime-local" className="input" value={linkForm.expires_at} onChange={(e) => setLinkForm((f) => ({ ...f, expires_at: e.target.value }))} style={{ maxWidth: 280, marginTop: 6, height: 44, borderRadius: 12 }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={linkLoading} style={{ alignSelf: 'flex-start', height: 46, borderRadius: 12, fontWeight: 800 }}>
                            <Link2 size={18} style={{ marginRight: 8 }} />{linkLoading ? 'Creando…' : 'Generar link de pago'}
                        </button>
                    </form>
                    {linkResult && (
                        <div style={{ marginTop: 24, padding: 18, borderRadius: 14, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>LINK GENERADO</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, wordBreak: 'break-all', marginBottom: 12 }}>{linkResult}</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(linkResult); toast.success('Copiado'); }}>
                                    <Copy size={16} style={{ marginRight: 6 }} /> Copiar
                                </button>
                                <a href={linkResult} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <ExternalLink size={16} /> Abrir checkout
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'examples' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Shield size={18} color="var(--brand)" /> Endpoints (service key)
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Moneda por defecto en tu config: <strong>{payForm.defaultCurrency}</strong>. Montos siempre en <strong>centavos</strong> (ej. 100000 = $1.000 COP).</p>
                        <pre style={{ margin: 0, padding: 16, background: '#0a0a0c', color: '#d1d5db', borderRadius: 12, fontSize: 12, overflow: 'auto', lineHeight: 1.55 }}>
                            {`// Firma de integridad (backend)
POST ${payBase}/signature
Headers: { apikey: '${keys.service_role_key?.slice(0, 12) || 'TU_SERVICE_KEY'}...' }
Body: { "reference": "PED-001", "amount_in_cents": 50000, "currency": "COP" }

// Crear transacción (mismo cuerpo que Wompi; si omites signature, MatuDB la calcula)
POST ${payBase}/transactions
Headers: { apikey: '...service...', 'Content-Type': 'application/json' }

// Consultar transacción (anon o service)
GET ${payBase}/transactions/{id}
Headers: { apikey: '...' }`}
                        </pre>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}><Code size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />npm @devjuanes/matupay</h3>
                        <pre style={{ margin: 0, padding: 16, background: '#0a0a0c', color: '#d1d5db', borderRadius: 12, fontSize: 12, overflow: 'auto', lineHeight: 1.55 }}>
                            {`import { MatuPayWompi } from '@devjuanes/matupay';

const pay = new MatuPayWompi({
  baseUrl: '${apiBase.replace(/\/+$/, '')}',
  projectId: '${projectId}',
  apiKey: process.env.MATU_SERVICE_KEY!,
});

const { signature } = await pay.createSignature({
  reference: 'PED-001',
  amount_in_cents: 50_000,
  currency: 'COP',
});`}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
