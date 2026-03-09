import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { tablesAPI } from '../../lib/api';
import {
    Database, KeyRound, Hash, AlignLeft, ToggleLeft,
    Calendar, Braces, Activity, Radio, RefreshCw, LayoutGrid, List as ListIcon,
    ChevronRight, Zap, Shield, HardDrive, Info, Search, Filter,
    Layers, Table as TableIcon, Lock, Globe, Server
} from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('float') || t.includes('numeric') || t.includes('decimal') || t.includes('real'))
        return <Hash size={14} style={{ color: '#3b82f6' }} />;
    if (t.includes('bool'))
        return <ToggleLeft size={14} style={{ color: '#10b981' }} />;
    if (t.includes('timestamp') || t.includes('date') || t.includes('time'))
        return <Calendar size={14} style={{ color: '#f59e0b' }} />;
    if (t.includes('json') || t.includes('xml'))
        return <Braces size={14} style={{ color: '#8b5cf6' }} />;
    if (t.includes('uuid'))
        return <KeyRound size={14} style={{ color: '#ef4444' }} />;
    return <AlignLeft size={14} style={{ color: 'var(--text-muted)' }} />;
};

const typeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('float')) return '#3b82f6';
    if (t.includes('bool')) return '#10b981';
    if (t.includes('timestamp') || t.includes('date')) return '#f59e0b';
    if (t.includes('json')) return '#8b5cf6';
    if (t.includes('uuid')) return '#ef4444';
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
    const [search, setSearch] = useState('');

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
        } catch (err) {
            console.error('Error loading tables:', err);
            toast.error('Error al cargar esquema de tablas');
        } finally { setLoading(false); }
    }, [projectId]);

    const toggleRealtime = async (tableName: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
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

    const filteredTables = tables.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Mapeando esquema relacional...</span>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header section with Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, gap: 24 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Database size={14} /> Arquitectura de Datos
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Esquema de Base de Datos</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                            <Layers size={14} /> <strong>{tables.length}</strong> tablas vinculadas
                        </div>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                            <Server size={14} /> Schema: <code style={{ color: 'var(--brand)', fontWeight: 700 }}>{project?.schema_name || 'public'}</code>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Filtrar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ height: 44, width: 280, paddingLeft: 42, background: 'var(--bg-surface)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: 8, borderRadius: 8, border: 'none', background: viewMode === 'grid' ? 'var(--bg-base)' : 'transparent', color: viewMode === 'grid' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: 8, borderRadius: 8, border: 'none', background: viewMode === 'list' ? 'var(--bg-base)' : 'transparent', color: viewMode === 'list' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {tables.length === 0 ? (
                <div style={{ padding: '100px 40px', textAlign: 'center', background: 'var(--bg-surface)', border: '2px dashed var(--border)', borderRadius: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 28, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        <TableIcon size={40} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Estructura vacía</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>No hemos detectado tablas en este esquema. Ve al editor para comenzar a modelar tus datos.</p>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                    {filteredTables.map(t => {
                        const cols = details[t.name] || [];
                        const fks = cols.filter(c => c.name.endsWith('_id') && c.name !== 'id');

                        return (
                            <div key={t.name} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                                {/* Table Card Header */}
                                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--brand), #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                                            <TableIcon size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>{t.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{cols.length} Propiedades</div>
                                        </div>
                                    </div>
                                    {realtimeMap[t.name] && (
                                        <div style={{ border: '1px solid var(--brand)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.5px' }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 1.5s infinite' }} /> LIVE
                                        </div>
                                    )}
                                </div>

                                {/* Columns Section */}
                                <div style={{ padding: '8px 0', flex: 1, background: 'var(--bg-main)' }}>
                                    {cols.slice(0, 6).map((col, i) => {
                                        const isPK = col.name === 'id';
                                        return (
                                            <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderBottom: i < 5 && i < cols.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {typeIcon(col.type)}
                                                    <span style={{ fontSize: 13, fontWeight: isPK ? 800 : 500, fontFamily: 'var(--font-mono)', color: isPK ? 'var(--brand)' : 'var(--text-primary)' }}>
                                                        {col.name}
                                                    </span>
                                                    {isPK && <Lock size={10} color="var(--brand)" style={{ opacity: 0.5 }} />}
                                                </div>
                                                <span style={{ fontSize: 11, color: typeColor(col.type), fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'lowercase' }}>
                                                    {col.type}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {cols.length > 6 && (
                                        <div style={{ padding: '12px 24px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-base)', borderTop: '1px solid var(--border-soft)' }}>
                                            + {cols.length - 6} campos adicionales
                                        </div>
                                    )}
                                </div>

                                {/* Actions / Meta */}
                                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div title="Policies Active" style={{ color: 'var(--brand)', opacity: 0.8 }}><Shield size={14} /></div>
                                        <div title="API Exposed" style={{ color: 'var(--brand)', opacity: 0.8 }}><Globe size={14} /></div>
                                    </div>

                                    <button
                                        onClick={(e) => toggleRealtime(t.name, e)}
                                        disabled={toggling === t.name}
                                        className={`btn btn-sm ${realtimeMap[t.name] ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{
                                            padding: '6px 14px',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            height: 32,
                                            gap: 8,
                                            borderRadius: 10
                                        }}
                                    >
                                        {toggling === t.name ? <RefreshCw size={12} className="spinner" /> : <Activity size={12} />}
                                        {realtimeMap[t.name] ? 'Streaming On' : 'Activar Live'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View - More compact table */
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-surface)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre de Tabla</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Esquema</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Columnas</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relaciones</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado Tiempo Real</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTables.map(t => {
                                const cols = details[t.name] || [];
                                const fks = cols.filter(c => c.name.endsWith('_id') && c.name !== 'id');
                                return (
                                    <tr key={t.name} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 32, height: 32, background: 'var(--bg-base)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', border: '1px solid var(--border)' }}>
                                                    <TableIcon size={16} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <code style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '2px 6px', borderRadius: 4 }}>{project?.schema_name || 'public'}</code>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{cols.length}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {fks.length > 0 ? (
                                                <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: 6 }}>
                                                    {fks.length} VÍNCULOS
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0 fk</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {realtimeMap[t.name] ? (
                                                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand)' }} /> ACTIVO
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Inactivo</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={(e) => toggleRealtime(t.name, e)}
                                                disabled={toggling === t.name}
                                                style={{ color: realtimeMap[t.name] ? 'var(--brand)' : 'var(--text-muted)', fontWeight: 800, gap: 8 }}
                                            >
                                                {toggling === t.name ? <RefreshCw size={14} className="spinner" /> : <Activity size={14} />}
                                                {realtimeMap[t.name] ? 'Desactivar Streaming' : 'Habilitar Streaming'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
