import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { keysAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    RefreshCw, Copy, EyeOff, Shield, Lock,
    Terminal, Zap, AlertTriangle, ExternalLink,
    CheckCircle2, Eye, Key, Database, Code, Info
} from 'lucide-react';

function KeyCard({ type, meta, onRegenerate }: { type: string; meta: any; onRegenerate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState<string | null>(null);
    const { projectId } = useParams<{ projectId: string }>();

    const regen = async () => {
        const confirmMsg = type === 'service'
            ? '¿ESTÁS SEGURO? Regenerar la Service Key invalidará la llave actual inmediatamente en todos tus servidores. Esta acción es crítica.'
            : '¿Regenerar la Anon Key? Deberás actualizar el cliente de tu aplicación para mantener el acceso.';

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const res = await keysAPI.regenerate(projectId!, type);
            setRevealed(res.data.data.key);
            toast.success(`${type.toUpperCase()} Key regenerada correctamente.`);
            onRegenerate();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al regenerar');
        } finally { setLoading(false); }
    };

    const copyKey = () => {
        if (revealed) {
            navigator.clipboard.writeText(revealed);
            toast.success('¡Copiado al portapapeles!');
        }
    };

    const isService = type === 'service';

    return (
        <div className="card" style={{ borderLeft: `4px solid ${isService ? 'var(--warning)' : 'var(--brand)'}`, overflow: 'hidden' }}>
            <div className="card-body" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: isService ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            {isService ? <Shield size={24} style={{ color: 'var(--warning)' }} /> : <Lock size={24} style={{ color: 'var(--brand)' }} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{type} Key</h4>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                                    background: isService ? 'var(--warning)' : 'var(--brand)', color: '#fff'
                                }}>
                                    {isService ? 'RESTRINGIDO' : 'PÚBLICO'}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {isService
                                    ? 'Llave de acceso total. Úsala únicamente en entornos de servidor seguros.'
                                    : 'Segura para usar en el lado del cliente y aplicaciones móviles.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12,
                    padding: '16px', marginBottom: 20, position: 'relative', overflow: 'hidden'
                }}>
                    {revealed ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <code style={{
                                fontFamily: 'var(--font-mono)', fontSize: 13, wordBreak: 'break-all',
                                color: isService ? 'var(--warning)' : 'var(--brand)', fontWeight: 600, flex: 1
                            }}>{revealed}</code>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={copyKey} title="Copiar"><Copy size={16} /></button>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setRevealed(null)}><EyeOff size={16} /></button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)', letterSpacing: '2px' }}>
                                    ••••••••••••••••••••••••••••••••
                                </code>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '2px 6px', borderRadius: 4 }}>
                                    {meta?.key_preview}
                                </span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Lock size={10} /> Encriptada
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-primary" onClick={regen} disabled={loading} style={{ height: 36, padding: '0 16px', fontSize: 13, fontWeight: 700 }}>
                            {loading ? <span className="spinner spinner-sm" /> : <RefreshCw size={14} />}
                            Regenerar Llave
                        </button>
                    </div>
                </div>

                {revealed && (
                    <div style={{
                        marginTop: 16, padding: '14px', background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid var(--warning)', borderRadius: 12, display: 'flex', gap: 12
                    }}>
                        <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            <strong style={{ display: 'block', marginBottom: 2 }}>ATENCIÓN: GUARDA ESTA LLAVE</strong>
                            Por seguridad, no volveremos a mostrar esta llave completa una vez que cierres esta pestaña.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ApiKeysPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadKeys = () => {
        keysAPI.list(projectId!).then(res => {
            setKeys(res.data.data.keys);
            setLoading(false);
        });
    };

    useEffect(() => { loadKeys(); }, [projectId]);

    const getKey = (type: string) => keys.find(k => k.type === type);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('URL de API copiada');
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Cifrando conexiones...</span>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Key size={14} /> Protocolo de Acceso
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>API Keys del Proyecto</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                    Usa estas llaves para autenticar las peticiones desde tus aplicaciones hacia MatuDB.
                    Asegúrate de configurar los permisos de tabla (RLS) correctamente.
                </p>
            </div>

            {/* API URL Card */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Terminal size={18} style={{ color: 'var(--info)' }} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Endpoint de tu Proyecto</h4>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-base)',
                    padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)'
                }}>
                    <code style={{
                        fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--brand)',
                        fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        http://localhost:3001/api/projects/{project?.id}/data
                    </code>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copyToClipboard(`http://localhost:3001/api/projects/${project?.id}/data`)} title="Copiar URL">
                        <Copy size={16} />
                    </button>
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={12} style={{ color: 'var(--brand)' }} /> Soporta RESTful JSON API
                </div>
            </div>

            {/* Keys Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
                <KeyCard type="anon" meta={getKey('anon')} onRegenerate={loadKeys} />
                <KeyCard type="service" meta={getKey('service')} onRegenerate={loadKeys} />
            </div>

            {/* Footer usage example */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Code size={18} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Ejemplo de consulta básica</span>
                </div>
                <div style={{
                    background: '#0f172a', padding: '20px', borderRadius: 12,
                    overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <pre style={{ margin: 0, color: '#f8fafc', fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                        <span style={{ color: '#94a3b8' }}>// Obtener datos de la tabla 'usuarios'</span>{`
fetch('http://localhost:3001/api/projects/${project?.id}/data/usuarios', {
  headers: {
    'apikey': 'TU_ANON_KEY',
    'Content-Type': 'application/json'
  }
}).then(res => res.json()).then(console.log);`}
                    </pre>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Info size={14} color="var(--brand)" />
                    <span>Para insertar o actualizar, recuerda enviar el header <code>Content-Type: application/json</code>.</span>
                </div>
            </div>

            <style>{`
                .spinner-sm {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
