import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, keysAPI, paymentsWompiAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Save, Trash2, AlertTriangle, Key, Eye, EyeOff,
    Copy, Code, Info, Globe, Shield, Zap, Lock,
    Settings as SettingsIcon, Database, Terminal,
    Server, Activity, ShieldCheck, Mail, ExternalLink,
    ChevronRight, CreditCard, Clock, MapPin
} from 'lucide-react';

export default function SettingsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project, setProject } = useOutletContext<any>();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: project?.name || '', description: project?.description || '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [keys, setKeys] = useState<{ anon_key?: string; service_role_key?: string }>({});
    const [showKey, setShowKey] = useState<'anon' | 'service' | null>(null);
    const [codeTab, setCodeTab] = useState<'upload' | 'list' | 'delete'>('upload');
    const [payForm, setPayForm] = useState({
        environment: 'sandbox' as 'sandbox' | 'production',
        publicKey: '',
        privateKey: '',
        integritySecret: '',
        merchantName: '',
        defaultCurrency: 'COP',
    });
    const [payMeta, setPayMeta] = useState<{ configured: boolean; server_encryption_ready?: boolean; has_private_key?: boolean; has_integrity_secret?: boolean } | null>(null);
    const [paySaving, setPaySaving] = useState(false);
    const [payDocLoading, setPayDocLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            keysAPI.list(projectId).then(r => setKeys(r.data.data || {})).catch(() => { });
            paymentsWompiAPI.getConfig(projectId).then((r) => {
                const d = r.data?.data;
                if (!d) return;
                setPayMeta({
                    configured: d.configured,
                    server_encryption_ready: d.server_encryption_ready,
                    has_private_key: d.has_private_key,
                    has_integrity_secret: d.has_integrity_secret,
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
            }).catch(() => { });
        }
    }, [projectId]);

    const apiBase = import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api';
    const BASE = `${apiBase.replace(/\/+$/, '')}/projects/${projectId}`;
    const copyToClipboard = (text: string, label = 'Copiado al portapapeles') => {
        navigator.clipboard.writeText(text);
        toast.success(label);
    };

    const saveWompi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        setPaySaving(true);
        try {
            const res = await paymentsWompiAPI.putConfig(projectId, payForm);
            const d = res.data?.data;
            toast.success('Pasarela Wompi guardada');
            if (d) {
                setPayMeta({
                    configured: d.configured,
                    server_encryption_ready: d.server_encryption_ready,
                    has_private_key: d.has_private_key,
                    has_integrity_secret: d.has_integrity_secret,
                });
                setPayForm((f) => ({ ...f, privateKey: '', integritySecret: '' }));
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al guardar Wompi');
        } finally {
            setPaySaving(false);
        }
    };

    const loadIntegrationDoc = async () => {
        if (!projectId) return;
        setPayDocLoading(true);
        try {
            const res = await paymentsWompiAPI.getIntegrationDoc(projectId);
            const text = typeof res.data === 'string' ? res.data : String(res.data);
            copyToClipboard(text, 'Documentación copiada al portapapeles');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo cargar la documentación');
        } finally {
            setPayDocLoading(false);
        }
    };

    const saveChanges = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const res = await projectsAPI.update(projectId!, form);
            setProject(res.data.data.project);
            toast.success('Configuración actualizada correctamente');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al actualizar proyecto');
        } finally { setSaving(false); }
    };

    const deleteProject = async () => {
        const confirmName = prompt(`Por favor, escribe "${project.name}" para confirmar la eliminación definitiva:`);
        if (confirmName !== project.name) {
            toast.error('El nombre no coincide. Eliminación cancelada.');
            return;
        }
        setDeleting(true);
        try {
            await projectsAPI.delete(projectId!);
            toast.success('Proyecto eliminado permanentemente');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al eliminar proyecto');
            setDeleting(false);
        }
    };

    return (
        <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    <SettingsIcon size={14} /> Gestión de Infraestructura
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>Ajustes del Proyecto</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 8 }}>Configura la identidad, seguridad y orquestación de tu instancia MatuDB.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 40, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

                    {/* General Form */}
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Identidad Core</h3>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <form onSubmit={saveChanges} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, marginBottom: 10, display: 'block', color: 'var(--text-primary)' }}>Nombre del Ecosistema</label>
                                    <input
                                        className="input"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        style={{ height: 48, borderRadius: 12, fontSize: 15 }}
                                        placeholder="Nombre del proyecto..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, marginBottom: 10, display: 'block', color: 'var(--text-primary)' }}>Meta-descripción</label>
                                    <textarea
                                        className="input"
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        style={{ minHeight: 140, paddingTop: 16, resize: 'vertical', borderRadius: 12, fontSize: 15, lineHeight: 1.6 }}
                                        placeholder="Describe el propósito de esta arquitectura..."
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ height: 48, padding: '0 32px', fontWeight: 800, borderRadius: 14, gap: 12, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                                        {saving ? <><span className="spinner-sm" style={{ width: 18, height: 18, borderTopColor: 'transparent' }} /> Sincronizando...</> : <><Save size={18} /> Aplicar Configuración</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* API Credentials */}
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <ShieldCheck size={20} color="var(--brand)" /> Credenciales de Protocolo
                            </h3>
                            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                AES-256 SECURE
                            </div>
                        </div>
                        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

                            <div style={{ padding: '16px 20px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: 14, display: 'flex', gap: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Info size={18} color="var(--info)" />
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                    Utiliza estos tokens para establecer túneles seguros con los servicios de MatuDB. La <strong>Service Role Key</strong> tiene privilegios de superusuario; mantenla fuera del repositorio.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {[
                                    { label: 'API GATEWAY ENDPOINT', val: BASE, icon: <Globe size={16} />, help: 'Punto de acceso base para todas las llamadas REST.' },
                                    { label: 'ANON JWT KEY', val: keys.anon_key || '—', icon: <Lock size={16} />, isKey: 'anon', help: 'Token público para acceso restringido via cliente.' },
                                    { label: 'SERVICE ROLE ROOT KEY', val: keys.service_role_key || '—', icon: <Shield size={16} />, isKey: 'service', help: 'Token raíz con bypass total de RLS.' },
                                ].map((item, i) => {
                                    const isKey = item.isKey !== undefined;
                                    const shown = showKey === item.isKey;
                                    const displayVal = isKey && !shown && item.val !== '—'
                                        ? '••••••••••••••••••••••••••••••••' + item.val.slice(-8)
                                        : item.val;

                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                                <div style={{ color: 'var(--text-muted)' }}>{item.icon}</div>
                                                <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                    {item.label}
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{
                                                    flex: 1, height: 48, border: '1px solid var(--border)', background: 'var(--bg-base)',
                                                    borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px',
                                                    fontFamily: 'var(--font-mono)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    color: shown || !isKey ? 'var(--text-primary)' : 'var(--text-muted)'
                                                }}>
                                                    {displayVal}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {isKey && (
                                                        <button
                                                            className="btn btn-ghost"
                                                            onClick={() => setShowKey(shown ? null : item.isKey as any)}
                                                            style={{ height: 48, width: 48, padding: 0, justifyContent: 'center', borderRadius: 12 }}
                                                            title={shown ? "Ocultar" : "Mostrar"}
                                                        >
                                                            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => copyToClipboard(item.val)}
                                                        style={{ height: 48, width: 48, padding: 0, justifyContent: 'center', borderRadius: 12, background: 'var(--bg-base)' }}
                                                        title="Copiar"
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginLeft: 4 }}>{item.help}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* SDK Snippets */}
                            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Code size={18} color="var(--brand)" /> SDK Integration
                                    </h4>
                                    <div style={{ display: 'flex', background: 'var(--bg-base)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
                                        {(['upload', 'list', 'delete'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setCodeTab(t)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                                    background: codeTab === t ? 'var(--bg-surface)' : 'transparent',
                                                    color: codeTab === t ? 'var(--brand)' : 'var(--text-muted)',
                                                    transition: 'all 0.2s',
                                                    boxShadow: codeTab === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                                }}
                                            >
                                                {t === 'upload' ? 'Upload' : t === 'list' ? 'Fetch' : 'Remove'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
                                    <div style={{
                                        position: 'absolute', top: 12, right: 12,
                                        display: 'flex', gap: 8
                                    }}>
                                        <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>JS / TS</div>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => copyToClipboard(
                                                codeTab === 'upload' ? `const form = new FormData();\nform.append('file', file);\nconst res = await fetch('${BASE}/storage/upload', {\n  method: 'POST',\n  headers: { apikey: '${keys.anon_key || 'ANON_KEY'}' },\n  body: form\n});` :
                                                    codeTab === 'list' ? `const res = await fetch('${BASE}/storage', {\n  headers: { apikey: '${keys.anon_key || 'ANON_KEY'}' }\n});` :
                                                        `await fetch('${BASE}/storage/\${filename}', {\n  method: 'DELETE',\n  headers: { apikey: '${keys.service_role_key || 'SERVICE_KEY'}' }\n});`
                                            )}
                                            style={{ height: 32, padding: '0 12px', fontSize: 11, background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <Copy size={12} style={{ marginRight: 6 }} /> Copiar Snippet
                                        </button>
                                    </div>
                                    <pre style={{
                                        margin: 0, padding: '48px 24px 24px', background: '#0a0a0c', border: '1px solid var(--border)',
                                        borderRadius: 16, overflowX: 'auto', fontSize: 13, fontFamily: 'var(--font-mono)', color: '#d1d5db',
                                        lineHeight: 1.7
                                    }}>
                                        {codeTab === 'upload' ?
                                            <span style={{ color: '#10b981' }}>// Initialize and upload asset</span> :
                                            codeTab === 'list' ?
                                                <span style={{ color: '#10b981' }}>// Query project object metadata</span> :
                                                <span style={{ color: '#10b981' }}>// Purge resource from storage</span>
                                        }
                                        {'\n'}
                                        {codeTab === 'upload' ?
                                            `const form = new FormData();
form.append('file', file);

const res = await fetch('${BASE}/storage/upload', {
  method: 'POST',
  headers: { apikey: '${keys.anon_key?.slice(0, 16) || 'ANON_KEY'}...' },
  body: form
});` :
                                            codeTab === 'list' ?
                                                `const res = await fetch('${BASE}/storage', {
  headers: { apikey: '${keys.anon_key?.slice(0, 16) || 'ANON_KEY'}...' }
});

const { data } = await res.json();` :
                                                `await fetch('${BASE}/storage/\${filename}', {
  method: 'DELETE',
  headers: { 
    apikey: '${keys.service_role_key?.slice(0, 16) || 'SERVICE_KEY'}...' 
  }
});`
                                        }
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <CreditCard size={20} color="var(--brand)" /> Pasarela de pago (Wompi)
                            </h3>
                            {payMeta?.configured ? (
                                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(16, 185, 129, 0.2)' }}>CONFIGURADA</span>
                            ) : (
                                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>SIN CONFIGURAR</span>
                            )}
                        </div>
                        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {payMeta && payMeta.server_encryption_ready === false && (
                                <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 14 }}>
                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        El servidor no tiene <code style={{ fontSize: 12 }}>MATUDB_PAYMENT_ENCRYPTION_KEY</code>. Define esa variable en el API antes de guardar llaves Wompi.
                                    </p>
                                </div>
                            )}
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Las llaves privadas y el secreto de integridad se guardan <strong>cifrados</strong> en la base de datos. Desde tu backend usa la <strong>service key</strong> contra los endpoints de pagos (nunca expongas la llave privada de Wompi en el navegador).
                            </p>
                            <form onSubmit={saveWompi} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Ambiente</label>
                                    <select
                                        className="input"
                                        value={payForm.environment}
                                        onChange={(e) => setPayForm((f) => ({ ...f, environment: e.target.value as 'sandbox' | 'production' }))}
                                        style={{ height: 48, borderRadius: 12 }}
                                    >
                                        <option value="sandbox">Sandbox (pruebas)</option>
                                        <option value="production">Producción</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Llave pública Wompi</label>
                                    <input className="input" value={payForm.publicKey} onChange={(e) => setPayForm((f) => ({ ...f, publicKey: e.target.value }))} placeholder="pub_test_..." style={{ height: 48, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>
                                        Llave privada {payMeta?.has_private_key ? <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(vacío = no cambiar)</span> : null}
                                    </label>
                                    <input type="password" className="input" value={payForm.privateKey} onChange={(e) => setPayForm((f) => ({ ...f, privateKey: e.target.value }))} placeholder={payMeta?.has_private_key ? '••••••••' : 'prv_test_...'} autoComplete="off" style={{ height: 48, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>
                                        Secreto de integridad {payMeta?.has_integrity_secret ? <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(vacío = no cambiar)</span> : null}
                                    </label>
                                    <input type="password" className="input" value={payForm.integritySecret} onChange={(e) => setPayForm((f) => ({ ...f, integritySecret: e.target.value }))} placeholder={payMeta?.has_integrity_secret ? '••••••••' : 'test_integrity_...'} autoComplete="off" style={{ height: 48, borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Nombre comercio (opcional)</label>
                                    <input className="input" value={payForm.merchantName} onChange={(e) => setPayForm((f) => ({ ...f, merchantName: e.target.value }))} style={{ height: 48, borderRadius: 12 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Moneda por defecto</label>
                                    <input className="input" value={payForm.defaultCurrency} onChange={(e) => setPayForm((f) => ({ ...f, defaultCurrency: e.target.value.toUpperCase() }))} style={{ height: 48, borderRadius: 12, maxWidth: 120 }} />
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" disabled={payDocLoading} onClick={loadIntegrationDoc} style={{ height: 48, padding: '0 20px', borderRadius: 14, fontWeight: 700 }}>
                                        {payDocLoading ? '…' : <><Terminal size={16} style={{ marginRight: 8 }} />Copiar doc. integración</>}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={paySaving || payMeta?.server_encryption_ready === false} style={{ height: 48, padding: '0 28px', borderRadius: 14, fontWeight: 800 }}>
                                        {paySaving ? 'Guardando…' : <><Save size={18} /> Guardar Wompi</>}
                                    </button>
                                </div>
                            </form>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                                    Endpoints: <code style={{ fontSize: 11 }}>{BASE}/payments/wompi/signature</code> y <code style={{ fontSize: 11 }}>{BASE}/payments/wompi/transactions</code> (header <code style={{ fontSize: 11 }}>apikey</code>: service). Paquete npm: <code style={{ fontSize: 11 }}>@devjuanes/matupay</code>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {/* Project Metadata Card */}
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '28px'
                    }}>
                        <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Server size={18} color="var(--brand)" /> Infraestructura
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[
                                { label: 'INTERNAL PROJECT ID', value: project?.id, icon: <Fingerprint size={12} /> },
                                { label: 'DB SCHEMA ENGINE', value: project?.schema_name, icon: <Database size={12} /> },
                                { label: 'DEPLOYMENT REGION', value: project?.region || 'Maturin-US-1', icon: <MapPin size={12} /> },
                                { label: 'UPTIME SINCE', value: project?.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-', icon: <Clock size={12} /> },
                            ].map((row, i) => (
                                <div key={i} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none', paddingBottom: i < 3 ? 16 : 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {row.label}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                                        {row.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--brand), #059669)',
                        color: '#fff',
                        borderRadius: 24,
                        padding: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)'
                    }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                            <Zap size={140} fill="#fff" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
                            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.2)' }}>
                                <CreditCard size={20} />
                            </div>
                            <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '0.5px' }}>INSTANCIA PRO</span>
                        </div>
                        <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 24, position: 'relative' }}>
                            Tu arquitectura está optimizada con recursos dedicados y escalado automático.
                        </p>
                        <button className="btn" style={{
                            width: '100%',
                            background: '#fff',
                            color: 'var(--brand)',
                            border: 'none',
                            height: 44,
                            fontWeight: 800,
                            borderRadius: 12,
                            position: 'relative'
                        }}>
                            Configurar Facturación
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div style={{
                        borderRadius: 24, padding: '28px', border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.02)'
                    }}>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <AlertTriangle size={18} /> Zona de Purga
                        </h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                            Esta operación destruirá todos los volúmenes de datos, esquemas de tablas y activos de forma irreversible.
                        </p>
                        <button className="btn" onClick={deleteProject} disabled={deleting} style={{
                            width: '100%', background: 'var(--danger)', color: '#fff', border: 'none',
                            height: 44, fontWeight: 800, display: 'flex', gap: 10, justifyContent: 'center',
                            borderRadius: 12, boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)'
                        }}>
                            {deleting ? <span className="spinner-sm" style={{ borderTopColor: 'transparent' }} /> : <><Trash2 size={18} /> Terminar Instancia</>}
                        </button>
                    </div>

                </div>
            </div>

            <style>{`
                .spinner-sm {
                    width: 18px;
                    height: 18px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .input:hover {
                    border-color: var(--brand) !important;
                }
                .btn-icon:hover {
                    background: var(--bg-base) !important;
                    color: var(--brand) !important;
                }
            `}</style>
        </div>
    );
}

// Dummy component for the loop because Fingerprint was missing from imports
function Fingerprint({ size }: { size: number }) {
    return <Activity size={size} />
}
