import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { sqlAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Play, Clock, Database } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SqlEditorPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [query, setQuery] = useState(`-- SQL Editor — queries run in the "${project?.schema_name}" schema\nSELECT * FROM information_schema.tables WHERE table_schema = '${project?.schema_name}';`);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadHistory();
    }, [projectId]);

    const loadHistory = async () => {
        try {
            const res = await sqlAPI.getHistory(projectId!);
            setHistory(res.data.data);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const run = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await sqlAPI.execute(projectId!, query);
            setResult(res.data.data);
            loadHistory(); // Refresh history
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Query failed');
            setResult({ error: err.response?.data?.message || 'Query failed' });
            loadHistory(); // Refresh history even if error
        } finally { setLoading(false); }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-main)' }}>
            {/* Sidebar History */}
            <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Historial de SQL</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {history.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No hay consultas previas
                        </div>
                    ) : (
                        history.map((h: any) => (
                            <div
                                key={h.id}
                                onClick={() => setQuery(h.query)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--border-soft)',
                                    cursor: 'pointer',
                                    transition: 'all .2s'
                                }}
                                className="history-item-hover"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: h.status === 'success' ? 'var(--green)' : 'var(--danger)'
                                    }}>
                                        {h.status === 'success' ? 'Éxito' : 'Error'}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(new Date(h.created_at), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <code style={{
                                    fontSize: 11,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    color: 'var(--text-main)',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    opacity: .8
                                }}>
                                    {h.query.split('\n')
                                        .map((l: string) => l.trim())
                                        .find((l: string) => l.length > 0 && !l.startsWith('--'))
                                        || h.query.trim().split('\n')[0]}
                                </code>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Database size={16} color="var(--brand)" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>SQL Editor</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{project?.schema_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {result && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{result.execution_time_ms}ms</span>}
                        <button className="btn btn-primary btn-sm" onClick={run} disabled={loading}>
                            {loading ? <span className="spinner spinner-sm" /> : <Play size={13} />}
                            {loading ? 'Running…' : 'Ejecutar'} <span style={{ fontSize: 10, opacity: .7 }}>Ctrl+↵</span>
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div style={{ flexShrink: 0, height: 280, borderBottom: '1px solid var(--border)' }} onKeyDown={handleKey}>
                    <CodeMirror
                        value={query}
                        onChange={setQuery}
                        extensions={[sql()]}
                        theme={oneDark}
                        style={{ height: '100%', fontSize: 13 }}
                        height="280px"
                    />
                </div>

                {/* Results */}
                <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
                    {!result ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <p className="empty-state-title" style={{ fontSize: 13 }}>Presiona Ejecutar o Ctrl+Enter para ejecutar una consulta</p>
                        </div>
                    ) : result.error ? (
                        <div style={{ padding: 20 }}>
                            <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                                {result.error}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
                                <span className="badge badge-green">{result.command}</span>
                                <span>{result.rowCount} fila(s) afectadas</span>
                                <span>{result.fields?.length} columna(s)</span>
                            </div>
                            {result.rows?.length > 0 && (
                                <div className="table-wrap">
                                    <table className="table">
                                        <thead>
                                            <tr>{result.fields?.map((f: any) => <th key={f.name}>{f.name}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {result.rows.map((row: any, i: number) => (
                                                <tr key={i}>
                                                    {result.fields?.map((f: any) => (
                                                        <td key={f.name} className="mono" style={{ fontSize: 12 }}>
                                                            {row[f.name] === null ? <span className="text-muted">null</span> :
                                                                typeof row[f.name] === 'object' ? JSON.stringify(row[f.name]) :
                                                                    String(row[f.name])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
