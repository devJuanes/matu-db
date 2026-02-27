import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { keysAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { RefreshCw, Copy, EyeOff, Shield, Lock } from 'lucide-react';

function KeyCard({ type, meta, onRegenerate }: { type: string; meta: any; onRegenerate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState<string | null>(null);
    const { projectId } = useParams<{ projectId: string }>();

    const regen = async () => {
        if (!confirm(`Regenerate the ${type} key? The old key will stop working immediately.`)) return;
        setLoading(true);
        try {
            const res = await keysAPI.regenerate(projectId!, type);
            setRevealed(res.data.data.key);
            toast.success(`${type} key regenerated — save it now!`);
            onRegenerate();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to regenerate');
        } finally { setLoading(false); }
    };

    const copyKey = () => {
        if (revealed) { navigator.clipboard.writeText(revealed); toast.success('Copied!'); }
    };

    return (
        <div className="card">
            <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: type === 'service' ? '#f6a62322' : 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {type === 'service' ? <Shield size={18} color="var(--warning)" /> : <Lock size={18} color="var(--brand)" />}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{type} Key</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {type === 'anon' ? 'Safe to use in client-side code' : 'Keep secret — server-side only'}
                            </div>
                        </div>
                    </div>
                    <span className={`badge badge-${type === 'service' ? 'yellow' : 'green'}`}>{type}</span>
                </div>

                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
                    {revealed ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, wordBreak: 'break-all', color: 'var(--brand)' }}>{revealed}</code>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={copyKey} title="Copy"><Copy size={13} /></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{meta?.key_preview}</code>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Key hidden for security</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={regen} disabled={loading}>
                        {loading ? <span className="spinner spinner-sm" /> : <RefreshCw size={13} />}
                        Regenerate
                    </button>
                    {revealed && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setRevealed(null)}>
                            <EyeOff size={13} /> Hide
                        </button>
                    )}
                </div>

                {revealed && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--warning)22', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--warning)' }}>
                        ⚠️ Save this key now — it won't be shown again after you leave this page.
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
        keysAPI.list(projectId!).then(res => { setKeys(res.data.data.keys); setLoading(false); });
    };
    useEffect(() => { loadKeys(); }, [projectId]);

    const getKey = (type: string) => keys.find(k => k.type === type);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>;

    return (
        <div style={{ padding: 28, maxWidth: 720 }}>
            <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">API Keys</h1>
                    <p className="page-subtitle">Use these keys to authenticate requests to your project's data API</p>
                </div>
            </div>

            <div style={{ marginBottom: 24, padding: '14px 16px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--brand)' }}>
                <strong>API URL:</strong>&nbsp;
                <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: 'rgba(0,0,0,.2)', padding: '2px 6px', borderRadius: 3 }}>
                    http://localhost:3001/api/projects/{project?.id}/data
                </code>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <KeyCard type="anon" meta={getKey('anon')} onRegenerate={loadKeys} />
                <KeyCard type="service" meta={getKey('service')} onRegenerate={loadKeys} />
            </div>

            <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Usage example</div>
                <div className="code-block">{`fetch('http://localhost:3001/api/projects/${project?.id ?? '<project-id>'}/data/my_table', {
  headers: {
    'apikey': '<your-anon-key>'
  }
})`}</div>
            </div>
        </div>
    );
}
