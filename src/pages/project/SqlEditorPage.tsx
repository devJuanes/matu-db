import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { sqlAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Play, Clock, Database, Terminal, ChevronDown,
    Layers, AlertCircle, CheckCircle2, Copy, Search,
    History, Square, Maximize2, Share2, MoreHorizontal
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SqlEditorPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [query, setQuery] = useState(`-- SQL Editor — ejecuta consultas en el esquema "${project?.schema_name}"\nSELECT * FROM information_schema.tables \nWHERE table_schema = '${project?.schema_name}';`);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historySearch, setHistorySearch] = useState('');

    useEffect(() => {
        if (projectId) loadHistory();
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
            loadHistory();
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Error al ejecutar consulta';
            toast.error(errMsg);
            setResult({ error: errMsg, execution_time_ms: 0 });
            loadHistory();
        } finally { setLoading(false); }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            run();
        }
    };

    const filteredHistory = history.filter(h =>
        h.query.toLowerCase().includes(historySearch.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Sidebar History */}
            <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', flexShrink: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={18} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>HISTORIAL SQL</span>
                </div>

                <div style={{ padding: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Filtrar consultas..."
                            value={historySearch}
                            onChange={e => setHistorySearch(e.target.value)}
                            style={{ paddingLeft: 32, height: 36, fontSize: 12, background: 'var(--bg-base)' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
                    {history.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ opacity: 0.2 }}><Terminal size={40} /></div>
                            No hay consultas previas
                        </div>
                    ) : (
                        filteredHistory.map((h: any) => (
                            <div
                                key={h.id}
                                onClick={() => setQuery(h.query)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    transition: 'all .2s',
                                    marginBottom: 4,
                                    border: '1px solid transparent'
                                }}
                                className="history-item-hover"
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {h.status === 'success' ?
                                            <CheckCircle2 size={12} style={{ color: 'var(--brand)' }} /> :
                                            <AlertCircle size={12} style={{ color: 'var(--danger)' }} />
                                        }
                                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: h.status === 'success' ? 'var(--brand)' : 'var(--danger)' }}>
                                            {h.status === 'success' ? 'Éxito' : 'Error'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {formatDistanceToNow(new Date(h.created_at), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <code style={{
                                    fontSize: 11,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    opacity: 0.9,
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '4px 6px',
                                    borderRadius: 4
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
                {/* Toolbar */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Terminal size={18} style={{ color: 'var(--brand)' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>SQL Editor</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Database size={10} /> Esquema: <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{project?.schema_name}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {result && result.execution_time_ms !== undefined && (
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-base)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                <Clock size={12} /> {result.execution_time_ms}ms
                            </div>
                        )}
                        <button className="btn btn-primary" onClick={run} disabled={loading} style={{ height: 38, padding: '0 20px', fontWeight: 700, borderRadius: 8, gap: 10 }}>
                            {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'transparent' }} /> : <Play size={16} fill="currentColor" />}
                            {loading ? 'Ejecutando...' : 'Ejecutar'}
                            <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4, fontWeight: 500, marginLeft: 4 }}>Ctrl + ↵</div>
                        </button>
                    </div>
                </div>

                {/* Editor Section */}
                <div style={{ flexShrink: 0, height: 320, borderBottom: '1px solid var(--border)', position: 'relative' }} onKeyDown={handleKey}>
                    <CodeMirror
                        value={query}
                        onChange={setQuery}
                        extensions={[sql()]}
                        theme={oneDark}
                        style={{ height: '320px', fontSize: 14 }}
                        height="320px"
                        basicSetup={{
                            lineNumbers: true,
                            highlightActiveLine: true,
                            foldGutter: true,
                        }}
                    />
                    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }} onClick={() => setQuery('')} title="Limpiar editor">
                            <Square size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }} onClick={() => navigator.clipboard.writeText(query)} title="Copiar SQL">
                            <Copy size={14} />
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div style={{ flex: 1, overflow: 'auto', padding: 0, display: 'flex', flexDirection: 'column' }}>
                    {!result ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: 0.5 }}>
                            <Terminal size={48} />
                            <p style={{ fontWeight: 600, fontSize: 14 }}>El resultado de la consulta aparecerá aquí</p>
                            <p style={{ fontSize: 12, maxWidth: 300, textAlign: 'center' }}>Escribe tu código SQL arriba y presiona ejecutar para interactuar con la base de datos.</p>
                        </div>
                    ) : result.error ? (
                        <div style={{ padding: 24 }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger)', borderRadius: 12, padding: 24, display: 'flex', gap: 16 }}>
                                <AlertCircle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                                <div>
                                    <h4 style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>ERROR EN LA CONSULTA</h4>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                        {result.error}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Execution Results Header */}
                            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px' }}>
                                        {result.command || 'RESULTS'}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {result.totalStatements > 1
                                            ? `${result.totalStatements} comandos ejecutados`
                                            : `${result.rowCount || 0} fila(s) encontradas`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-ghost btn-sm" style={{ gap: 8, fontSize: 12 }}>
                                        <Share2 size={14} /> Exportar
                                    </button>
                                    <button className="btn btn-ghost btn-sm" style={{ gap: 8, fontSize: 12 }}>
                                        <Maximize2 size={14} /> Expandir
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
                                {result.rows?.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg-surface)' }}>
                                            <tr>
                                                <th style={{ width: 40, borderRight: '1px solid var(--border)', borderBottom: '2px solid var(--border)' }}></th>
                                                {result.fields?.map((f: any) => (
                                                    <th key={f.name} style={{ textAlign: 'left', padding: '12px 16px', borderRight: '1px solid var(--border)', borderBottom: '2px solid var(--border)', minWidth: 150 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{f.name}</span>
                                                            <ChevronDown size={12} color="var(--text-muted)" />
                                                        </div>
                                                    </th>
                                                ))}
                                                <th style={{ borderBottom: '2px solid var(--border)' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.rows.map((row: any, i: number) => (
                                                <tr key={i} style={{
                                                    background: i % 2 === 1 ? 'var(--bg-base)' : 'var(--bg-surface)',
                                                    borderBottom: '1px solid var(--border)'
                                                }}>
                                                    <td style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', borderRight: '1px solid var(--border)', fontWeight: 600 }}>
                                                        {i + 1}
                                                    </td>
                                                    {result.fields?.map((f: any) => (
                                                        <td key={f.name} style={{ padding: '8px 16px', borderRight: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 350 }}>
                                                            {row[f.name] === null ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 11 }}>null</span> :
                                                                typeof row[f.name] === 'object' ? JSON.stringify(row[f.name]) :
                                                                    String(row[f.name])}
                                                        </td>
                                                    ))}
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: 0.4 }}>
                                        <CheckCircle2 size={40} style={{ color: 'var(--brand)' }} />
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>Consulta ejecutada correctamente</div>
                                        <div style={{ fontSize: 13 }}>La operación no devolvió filas de resultados.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .spinner-sm {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .cm-editor {
                    background: #1e293b !important;
                }
                .cm-scroller {
                    font-family: var(--font-mono) !important;
                }
            `}</style>
        </div>
    );
}
