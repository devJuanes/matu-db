import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { tablesAPI } from '../../lib/api';
import {
    Database, KeyRound, Hash, AlignLeft, ToggleLeft,
    Calendar, Braces, Activity, Radio, RefreshCw, LayoutGrid, List as ListIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcon = (type: string) => {
    if (type.includes('int') || type.includes('float') || type.includes('numeric')) return <Hash size={11} color="var(--info)" />;
    if (type.includes('bool')) return <ToggleLeft size={11} color="var(--brand)" />;
    if (type.includes('timestamp') || type.includes('date')) return <Calendar size={11} color="var(--warning)" />;
    if (type.includes('json')) return <Braces size={11} color="#a78bfa" />;
    if (type.includes('uuid')) return <KeyRound size={11} color="var(--danger)" />;
    return <AlignLeft size={11} color="var(--text-muted)" />;
};

const typeColor = (type: string) => {
    if (type.includes('int') || type.includes('float')) return 'var(--info)';
    if (type.includes('bool')) return 'var(--brand)';
    if (type.includes('timestamp') || type.includes('date')) return 'var(--warning)';
    if (type.includes('json')) return '#a78bfa';
    if (type.includes('uuid')) return 'var(--danger)';
    return 'var(--text-muted)';
};

export default function DatabasePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [tables, setTables] = useState<any[]>([]);
    const [details, setDetails] = useState<Record<string, any[]>>({});
    const [realtimeMap, setRealtimeMap] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await tablesAPI.list(projectId!);
            const tableList = res.data.data.tables;
            setTables(tableList);

            // Load column details and real-time status for all tables in parallel
            const results = await Promise.all(
                tableList.map((t: any) => Promise.all([
                    tablesAPI.get(projectId!, t.name),
                    tablesAPI.getRealtime(projectId!, t.name)
                ]).then(([res, rt]) => ({
                    name: t.name,
                    cols: res.data.data.columns,
                    realtime: rt.data.data.enabled
                })))
            );

            const dMap: Record<string, any[]> = {};
            const rMap: Record<string, boolean> = {};
            results.forEach((item: any) => {
                const { name, cols, realtime } = item;
                dMap[name] = cols;
                rMap[name] = realtime;
            });
            setDetails(dMap);
            setRealtimeMap(rMap);
        } finally { setLoading(false); }
    }, [projectId]);

    const toggleRealtime = async (tableName: string) => {
        const current = !!realtimeMap[tableName];
        setToggling(tableName);
        try {
            await tablesAPI.setRealtime(projectId!, tableName, !current);
            setRealtimeMap(prev => ({ ...prev, [tableName]: !current }));
            toast.success(`Real-time ${!current ? 'activado' : 'desactivado'} para ${tableName}`);
        } catch {
            toast.error('Error al cambiar estado Real-time');
        } finally { setToggling(null); }
    };

    useEffect(() => { load(); }, [load]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>;

    return (
        <div style={{ padding: 28 }}>
            <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Database</h1>
                    <p className="page-subtitle">
                        Schema: <code style={{ fontSize: 11 }}>{project?.schema_name}</code> · {tables.length} table{tables.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, background: 'var(--bg-surface)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <button
                        className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '6px 12px' }}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={14} />
                        Grid
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '6px 12px' }}
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon size={14} />
                        List
                    </button>
                </div>
            </div>

            {tables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontSize: 40 }}>🗄️</div>
                    <p className="empty-state-title">No tables yet</p>
                    <p className="empty-state-desc">Go to Table Editor to create your first table</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 20,
                    alignItems: 'start',
                }}>
                    {tables.map(t => {
                        const cols = details[t.name] || [];
                        const pks = cols.filter(c => c.name === 'id');
                        const fks = cols.filter(c => c.name.endsWith('_id') && c.name !== 'id');
                        return (
                            <div key={t.name} className="card" style={{ overflow: 'hidden' }}>
                                {/* Table header */}
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-surface) 100%)',
                                    borderBottom: '2px solid var(--brand)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 28, height: 28, background: 'var(--brand-light)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Database size={14} color="var(--brand)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cols.length} columns</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {realtimeMap[t.name] && (
                                            <span title="Real-time enabled" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--brand)', background: 'var(--brand-light)', padding: '2px 6px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                <Radio size={8} /> Real-time
                                            </span>
                                        )}
                                        {fks.length > 0 && (
                                            <span style={{ fontSize: 10, color: 'var(--warning)', background: '#f6a62322', padding: '2px 6px', borderRadius: 4 }}>
                                                {fks.length} FK
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Columns */}
                                <div style={{ padding: '4px 0' }}>
                                    {cols.map((col, i) => {
                                        const isPK = col.name === 'id' || col.column_default?.includes('gen_random_uuid');
                                        const isFK = col.name.endsWith('_id') && col.name !== 'id';
                                        return (
                                            <div key={col.name} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '6px 16px',
                                                borderBottom: i < cols.length - 1 ? '1px solid var(--border-soft)' : 'none',
                                                background: isPK ? 'var(--brand-light)' : 'transparent',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center' }}>{typeIcon(col.type)}</span>
                                                    <span style={{ fontSize: 13, fontWeight: isPK ? 600 : 400, fontFamily: 'JetBrains Mono, monospace', color: isPK ? 'var(--brand)' : isFK ? 'var(--warning)' : 'var(--text-primary)' }}>
                                                        {col.name}
                                                    </span>
                                                    {isPK && <span style={{ fontSize: 9, color: 'var(--brand)', fontWeight: 700, letterSpacing: .5 }}>PK</span>}
                                                    {isFK && <span style={{ fontSize: 9, color: 'var(--warning)', fontWeight: 700, letterSpacing: .5 }}>FK</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 11, color: typeColor(col.type), fontFamily: 'monospace' }}>{col.type}</span>
                                                    {col.is_nullable === 'NO' && col.name !== 'id' && (
                                                        <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 600 }}>NN</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <span>{pks.length > 0 ? '🔑 PK: id' : 'No PK'}</span>
                                        {fks.length > 0 && <span>🔗 {fks.length} FKs</span>}
                                    </div>
                                    <button
                                        onClick={() => toggleRealtime(t.name)}
                                        disabled={toggling === t.name}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            border: '1px solid',
                                            borderColor: realtimeMap[t.name] ? 'var(--brand)' : 'var(--border)',
                                            background: realtimeMap[t.name] ? 'var(--brand-light)' : 'transparent',
                                            color: realtimeMap[t.name] ? 'var(--brand)' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                        {toggling === t.name ? <RefreshCw size={10} className="spinner" /> : <Activity size={10} />}
                                        {realtimeMap[t.name] ? 'On Real-time' : 'Off Real-time'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Table Name</th>
                                <th>Columns</th>
                                <th>PK</th>
                                <th>FKs</th>
                                <th>Real-time</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(t => {
                                const cols = details[t.name] || [];
                                const pks = cols.filter(c => c.name === 'id');
                                const fks = cols.filter(c => c.name.endsWith('_id') && c.name !== 'id');
                                return (
                                    <tr key={t.name}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, background: 'var(--brand-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Database size={12} color="var(--brand)" />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{t.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-gray">{cols.length} cols</span></td>
                                        <td>
                                            {pks.length > 0 ? (
                                                <span className="badge badge-green">id (UUID)</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>No PK</span>
                                            )}
                                        </td>
                                        <td>
                                            {fks.length > 0 ? (
                                                <span className="badge badge-yellow">{fks.length} relations</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>No FKs</span>
                                            )}
                                        </td>
                                        <td>
                                            {realtimeMap[t.name] ? (
                                                <span className="badge badge-green" style={{ gap: 4 }}>
                                                    <Radio size={10} /> Enabled
                                                </span>
                                            ) : (
                                                <span className="badge badge-gray">Disabled</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => toggleRealtime(t.name)}
                                                disabled={toggling === t.name}
                                                style={{ color: realtimeMap[t.name] ? 'var(--brand)' : 'var(--text-muted)' }}
                                            >
                                                {toggling === t.name ? <RefreshCw size={12} className="spinner" /> : <Activity size={12} />}
                                                {realtimeMap[t.name] ? 'Deactivate' : 'Activate'} Real-time
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
