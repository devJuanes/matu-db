import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { tablesAPI, dataAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Plus, RefreshCw, Trash2, ChevronDown, X,
    Download, CheckSquare, Square, Search,
    Table as TableIcon, Filter, Settings2,
    Database, Layers, FileJson, ChevronLeft, ChevronRight,
    Columns, Copy, Code2, GripVertical,
} from 'lucide-react';
import {
    getPkColumnNames,
    getRowKey,
    rowKeyToFilters,
    buildCreateTableSql,
    buildColumnDataSql,
    downloadTextFile,
    type TableColumnMeta,
} from './tableEditorHelpers';

const PG_TYPES = ['text', 'integer', 'bigint', 'float', 'boolean', 'uuid', 'timestamp', 'date', 'json', 'varchar'];

// ── Helpers ────────────────────────────────────────────────

const exportData = (rows: any[], format: 'csv' | 'json', tableName: string) => {
    let content: string;
    let mime: string;
    let ext: string;
    if (format === 'json') {
        content = JSON.stringify(rows, null, 2);
        mime = 'application/json';
        ext = 'json';
    } else {
        const keys = Object.keys(rows[0] || {});
        const escape = (v: any) => {
            if (v === null || v === undefined) return '';
            const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"` : s;
        };
        content = [keys.join(','), ...rows.map(r => keys.map(k => escape(r[k])).join(','))].join('\n');
        mime = 'text/csv';
        ext = 'csv';
    }
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tableName}_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
};

// ── Create Table Modal ─────────────────────────────────────
function CreateTableModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState('');
    const [addId, setAddId] = useState(true);
    const [addTs, setAddTs] = useState(true);
    const [cols, setCols] = useState([{ name: '', type: 'text', nullable: true }]);
    const [loading, setLoading] = useState(false);

    const addCol = () => setCols(c => [...c, { name: '', type: 'text', nullable: true }]);
    const removeCol = (i: number) => setCols(c => c.filter((_, idx) => idx !== i));
    const updateCol = (i: number, k: string, v: any) => setCols(c => c.map((col, idx) => idx === i ? { ...col, [k]: v } : col));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            await tablesAPI.create(projectId, { name, columns: cols, add_id: addId, add_timestamps: addTs });
            toast.success(`Tabla "${name}" aprovisionada`);
            onCreated();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear tabla');
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div className="card" style={{ maxWidth: 640, width: '90%', padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                            <Plus size={24} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Crear nueva tabla</h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={submit}>
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Nombre de la Identidad</label>
                            <input className="input" placeholder="ej. clientes o facturas" value={name} onChange={e => setName(e.target.value)} required style={{ height: 48, fontSize: 15 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                <input type="checkbox" checked={addId} onChange={e => setAddId(e.target.checked)} style={{ accentColor: 'var(--brand)', width: 18, height: 18, borderRadius: 4 }} />
                                Primary Key (UUID)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                <input type="checkbox" checked={addTs} onChange={e => setAddTs(e.target.checked)} style={{ accentColor: 'var(--brand)', width: 18, height: 18, borderRadius: 4 }} />
                                Timestamps (Auditoría)
                            </label>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Columnas Personalizadas</label>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addCol} style={{ color: 'var(--brand)', fontWeight: 800, gap: 6 }}>
                                    <Plus size={14} /> Añadir Atributo
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {cols.map((col, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <input className="input" placeholder="nombre" value={col.name} onChange={e => updateCol(i, 'name', e.target.value)} style={{ flex: 2, height: 44, fontSize: 14 }} />
                                        <select className="input" value={col.type} onChange={e => updateCol(i, 'type', e.target.value)} style={{ flex: 1.2, height: 44, padding: '0 12px', fontSize: 14 }}>
                                            {PG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'var(--bg-base)', padding: '0 12px', height: 44, borderRadius: 10, border: '1px solid var(--border)' }}>
                                            <input type="checkbox" checked={col.nullable} onChange={e => updateCol(i, 'nullable', e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
                                            NULL
                                        </label>
                                        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeCol(i)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 16, background: 'var(--bg-surface)' }}>
                        <button type="button" className="btn btn-ghost" style={{ padding: '0 24px', height: 44 }} onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 32px', height: 44, fontWeight: 700 }}>
                            {loading ? <span className="spinner-sm" style={{ marginRight: 12 }} /> : <Database size={18} style={{ marginRight: 8 }} />}
                            {loading ? 'Aprovisionando...' : 'Crear Tabla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Editable Cell ──────────────────────────────────────────
function EditableCell({ value, col, rowFilters, projectId, table, onSaved }: {
    value: unknown;
    col: TableColumnMeta & { name: string };
    rowFilters: Record<string, unknown> | null;
    projectId: string;
    table: string;
    onSaved: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isUUID = typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value);
    const canMutate = rowFilters != null && Object.keys(rowFilters).length > 0;
    const isReadOnly =
        !canMutate ||
        col.name === 'created_at' ||
        col.name === 'updated_at' ||
        col.is_primary_key === true;

    const fullStr = value === null || value === undefined
        ? ''
        : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

    const copyFullId = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(fullStr);
            toast.success('Copiado al portapapeles');
        } catch {
            toast.error('No se pudo copiar');
        }
    };

    const display = () => {
        if (value === null || value === undefined) return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 11, opacity: 0.5 }}>NULL</span>;
        if (value === true) return <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.5px' }}>TRUE</span>;
        if (value === false) return <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.5px' }}>FALSE</span>;
        const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (isUUID || (col.is_primary_key && str.length > 14)) {
            return (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.85, letterSpacing: '-0.5px' }} title={str}>
                    {str.slice(0, 8)}…
                </span>
            );
        }
        return <span style={{ fontSize: 13, fontWeight: 500 }}>{str}</span>;
    };

    const startEdit = () => {
        if (isReadOnly) return;
        setDraft(value === null || value === undefined ? '' : String(value));
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 30);
    };

    const save = async () => {
        if (draft === String(value)) { setEditing(false); return; }
        setSaving(true);
        try {
            if (!rowFilters) return;
            await dataAPI.update(projectId, table, { [col.name]: draft || null }, rowFilters);
            onSaved();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al guardar');
        } finally { setSaving(false); setEditing(false); }
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
    };

    if (editing) {
        return (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', minWidth: 120, height: 38, padding: '4px' }}>
                <input
                    ref={inputRef}
                    className="input"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={onKey}
                    onBlur={save}
                    style={{ padding: '0 10px', height: '100%', fontSize: 13, flex: 1, border: '2px solid var(--brand)', outline: 'none', background: 'var(--bg-main)', borderRadius: 6 }}
                />
            </div>
        );
    }

    return (
        <div
            onClick={startEdit}
            title={isReadOnly ? fullStr : undefined}
            style={{
                cursor: isReadOnly ? 'default' : 'text',
                padding: '0 10px 0 16px',
                height: 48,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                borderRight: '1px solid var(--border-soft)',
                minWidth: 0,
            }}
            onMouseEnter={e => { if (!isReadOnly) (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{display()}</span>
            {isReadOnly && col.is_primary_key && fullStr ? (
                <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Copiar valor completo"
                    onClick={copyFullId}
                    style={{ flexShrink: 0, width: 28, height: 28, padding: 0, opacity: 0.7 }}
                >
                    <Copy size={14} />
                </button>
            ) : null}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function TableEditorPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [columns, setColumns] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [fetchingTables, setFetchingTables] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCol, setFilterCol] = useState('');
    const [filterVal, setFilterVal] = useState('');
    const [openTables, setOpenTables] = useState<string[]>([]);
    const [openTabsHydrated, setOpenTabsHydrated] = useState(false);
    const [limit, setLimit] = useState(50);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const dataRequestId = useRef(0);
    const colWidthsRef = useRef<Record<string, number>>({});
    const [, bumpColWidths] = useState(0);

    const widthsStorageKey = (t: string | null) =>
        t && projectId ? `matudb_colw_${projectId}_${t}` : '';

    const loadTables = useCallback(() => {
        if (!projectId) return;
        setFetchingTables(true);
        tablesAPI.list(projectId)
            .then(res => setTables(res.data.data.tables))
            .finally(() => setFetchingTables(false));
    }, [projectId]);

    useEffect(() => { loadTables(); }, [loadTables]);

    useEffect(() => {
        if (!projectId) return;
        try {
            const raw = localStorage.getItem(`openTables_${projectId}`);
            const tabs = raw ? JSON.parse(raw) : [];
            setOpenTables(Array.isArray(tabs) ? tabs : []);
        } catch {
            setOpenTables([]);
        }
        setOpenTabsHydrated(true);
    }, [projectId]);

    useEffect(() => {
        if (!projectId || !openTabsHydrated) return;
        localStorage.setItem(`openTables_${projectId}`, JSON.stringify(openTables));
    }, [openTables, projectId, openTabsHydrated]);

    const selectTable = useCallback(async (t: string) => {
        if (!projectId) return;
        const reqId = ++dataRequestId.current;
        setSelectedTable(t);
        setPage(0);
        setSelected(new Set());
        setFilterCol('');
        setFilterVal('');
        setSelectedColumn(null);
        setLoading(true);
        setOpenTables(prev => (prev.includes(t) ? prev : [...prev, t]));
        try {
            const colsRes = await tablesAPI.get(projectId, t);
            if (reqId !== dataRequestId.current) return;
            const columnsData = colsRes.data.data.columns as TableColumnMeta[];

            const orderCol = columnsData.find(c => c.name === 'id')?.name
                ?? columnsData.find(c => c.is_primary_key)?.name;
            const params: Record<string, unknown> = { limit, offset: 0, count: 'true' };
            if (orderCol) params.order = `${orderCol}.asc`;

            const rowsRes = await dataAPI.select(projectId, t, params);
            if (reqId !== dataRequestId.current) return;
            setColumns(columnsData);
            setRows(rowsRes.data.data.rows);
            setTotal(rowsRes.data.data.total);
        } catch {
            if (reqId === dataRequestId.current) {
                toast.error('Error al cargar datos');
            }
        } finally {
            if (reqId === dataRequestId.current) setLoading(false);
        }
    }, [projectId, limit]);

    useEffect(() => {
        if (!projectId || !openTabsHydrated || openTables.length === 0 || selectedTable) return;
        void selectTable(openTables[0]);
    }, [projectId, openTables, selectedTable, selectTable, openTabsHydrated]);

    useEffect(() => {
        if (!selectedTable) return;
        const k = widthsStorageKey(selectedTable);
        try {
            const raw = k ? localStorage.getItem(k) : null;
            colWidthsRef.current = raw ? JSON.parse(raw) : {};
        } catch {
            colWidthsRef.current = {};
        }
        bumpColWidths(v => v + 1);
    }, [selectedTable, projectId]);

    const getColWidth = (name: string) => colWidthsRef.current[name] ?? 160;

    const startColResize = (colName: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startW = getColWidth(colName);
        const onMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            const nw = Math.max(72, startW + dx);
            colWidthsRef.current = { ...colWidthsRef.current, [colName]: nw };
            bumpColWidths(v => v + 1);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            const k = widthsStorageKey(selectedTable);
            if (k) localStorage.setItem(k, JSON.stringify(colWidthsRef.current));
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const closeTab = (e: React.MouseEvent, t: string) => {
        e.stopPropagation();
        const nextOpen = openTables.filter(tab => tab !== t);
        setOpenTables(nextOpen);
        if (selectedTable === t) {
            const lastTab = nextOpen[nextOpen.length - 1];
            if (lastTab) void selectTable(lastTab);
            else {
                dataRequestId.current += 1;
                setSelectedTable(null);
                setRows([]);
                setColumns([]);
                setTotal(0);
            }
        }
    };

    const loadPage = useCallback(async (p: number, customLimit?: number) => {
        if (!selectedTable || !projectId) return;
        const reqId = ++dataRequestId.current;
        const l = customLimit ?? limit;
        setPage(p);
        setSelected(new Set());
        setLoading(true);
        try {
            const orderCol = columns.find(c => c.name === 'id')?.name
                ?? columns.find(c => c.is_primary_key)?.name;
            const params: Record<string, unknown> = { limit: l, offset: p * l, count: 'true' };
            if (orderCol) params.order = `${orderCol}.asc`;
            if (filterCol && filterVal) {
                params[filterCol] = `ilike.%${filterVal}%`;
            }
            const res = await dataAPI.select(projectId, selectedTable, params);
            if (reqId !== dataRequestId.current) return;
            setRows(res.data.data.rows);
            setTotal(res.data.data.total);
        } finally {
            if (reqId === dataRequestId.current) setLoading(false);
        }
    }, [selectedTable, projectId, limit, columns, filterCol, filterVal]);

    const dropTable = async (t: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm(`¿Eliminar tabla "${t}" permanentemente?`)) return;
        try {
            await tablesAPI.drop(projectId!, t);
            toast.success(`Tabla eliminada`);
            const nextOpen = openTables.filter(tab => tab !== t);
            setOpenTables(nextOpen);
            if (selectedTable === t) setSelectedTable(nextOpen[0] || null);
            loadTables();
        } catch (err: any) { toast.error('Error al eliminar'); }
    };

    const pkNames = useMemo(() => getPkColumnNames(columns as TableColumnMeta[]), [columns]);

    const rowKeys = useMemo(
        () => rows
            .filter(r => rowKeyToFilters(r, pkNames) != null)
            .map(r => getRowKey(r, pkNames)),
        [rows, pkNames],
    );

    const allSelected = rowKeys.length > 0 && rowKeys.every(k => selected.has(k));
    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(rowKeys));
    };
    const toggleRow = (rowKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelected(prev => {
            const next = new Set(prev);
            next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
            return next;
        });
    };

    const deleteSelected = async () => {
        if (!confirm(`¿Eliminar ${selected.size} registro(s)?`)) return;
        setDeleting(true);
        try {
            for (const key of selected) {
                const row = rows.find(r => getRowKey(r, pkNames) === key);
                if (!row) continue;
                const filters = rowKeyToFilters(row, pkNames);
                if (!filters) continue;
                await dataAPI.delete(projectId!, selectedTable!, filters);
            }
            toast.success(`Registros eliminados`);
            setSelected(new Set());
            await selectTable(selectedTable!);
        } catch {
            toast.error('Error en eliminación masiva');
        } finally { setDeleting(false); }
    };

    const handleExport = (format: 'csv' | 'json') => {
        const toExport = selected.size > 0
            ? rows.filter(r => selected.has(getRowKey(r, pkNames)))
            : rows;
        if (toExport.length === 0) { toast.error('Sin datos para procesar'); return; }
        exportData(toExport, format, selectedTable!);
        toast.success(`Despachado en formato ${format.toUpperCase()}`);
    };

    const handleExportDdl = () => {
        if (!selectedTable || !columns.length) return;
        const sql = buildCreateTableSql(selectedTable, columns as TableColumnMeta[]);
        downloadTextFile(`${selectedTable}_schema_${Date.now()}.sql`, sql, 'application/sql');
        toast.success('DDL descargado');
    };

    const handleExportColumnSql = () => {
        if (!selectedTable || !selectedColumn) {
            toast.error('Selecciona una columna en el encabezado');
            return;
        }
        const subset = selected.size > 0
            ? rows.filter(r => selected.has(getRowKey(r, pkNames)))
            : rows;
        const sql = buildColumnDataSql(selectedTable, selectedColumn, subset);
        downloadTextFile(`${selectedTable}_${selectedColumn}_${Date.now()}.sql`, sql, 'application/sql');
        toast.success('SQL de columna descargado');
    };

    const filteredTables = tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const showRowCheckbox = pkNames.length > 0 && rows.some(r => rowKeyToFilters(r, pkNames) != null);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg-main)' }}>
            {/* Nav Sidebar - Table Map */}
            <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontWeight: 800, fontSize: 13, letterSpacing: '0.5px' }}>
                        <Database size={18} color="var(--brand)" /> ESQUEMA
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCreate(true)} style={{ color: 'var(--brand)' }}>
                        <Plus size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px 12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Buscar tabla..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 36, height: 40, fontSize: 13, background: 'var(--bg-main)' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 24px' }}>
                    {fetchingTables ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                            <span className="spinner" style={{ width: 24, height: 24, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                        </div>
                    ) : filteredTables.length === 0 ? (
                        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            Sin resultados.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {filteredTables.map(t => (
                                <div
                                    key={t.name}
                                    onClick={() => selectTable(t.name)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                                        background: selectedTable === t.name ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        color: selectedTable === t.name ? 'var(--brand)' : 'var(--text-secondary)',
                                        transition: 'all 0.15s',
                                        position: 'relative'
                                    }}
                                    className="table-item"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: selectedTable === t.name ? 'var(--brand)' : 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedTable === t.name ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                                            <TableIcon size={12} />
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: selectedTable === t.name ? 800 : 500 }} className="truncate">{t.name}</span>
                                    </div>
                                    <div className="table-actions" style={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={e => dropTable(t.name, e)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Explorer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!selectedTable ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: 'var(--bg-base)' }}>
                        <div style={{ width: 120, height: 120, borderRadius: 40, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <Layers size={56} style={{ opacity: 0.2 }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Explorador de Datos</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: 360, fontSize: 15, lineHeight: 1.6 }}>
                                Selecciona una tabla del esquema o aprovisiona una nueva para comenzar a gestionar tus registros.
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ height: 48, padding: '0 32px', fontWeight: 700 }}>
                            <Plus size={20} /> Nueva Identidad
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Tab Navigation Systems */}
                        <div style={{ display: 'flex', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
                            {openTables.map(t => (
                                <div
                                    key={t}
                                    onClick={() => { if (selectedTable !== t) selectTable(t); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 48, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        borderRight: '1px solid var(--border)',
                                        background: selectedTable === t ? 'var(--bg-main)' : 'var(--bg-surface)',
                                        color: selectedTable === t ? 'var(--brand)' : 'var(--text-muted)',
                                        position: 'relative', minWidth: 160, maxWidth: 280, transition: 'all 0.2s'
                                    }}>
                                    <TableIcon size={14} style={{ flexShrink: 0, opacity: selectedTable === t ? 1 : 0.4 }} />
                                    <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                                    <button
                                        onClick={(e) => closeTab(e, t)}
                                        style={{ border: 'none', background: 'transparent', width: 24, height: 24, borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: selectedTable === t ? 1 : 0 }}
                                        className="tab-close-btn"
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                                    >
                                        <X size={12} />
                                    </button>
                                    {selectedTable === t && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--brand)' }} />}
                                </div>
                            ))}
                        </div>

                        {/* Editor Intelligence Toolbar */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{selectedTable}</h3>
                                    <div style={{ fontSize: 11, fontWeight: 900, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        {total} FILAS
                                    </div>
                                </div>
                                {selected.size > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px', background: 'linear-gradient(to right, var(--brand), #059669)', color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 800, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
                                        <CheckSquare size={14} /> {selected.size} Seleccionados
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {selected.size > 0 ? (
                                    <button className="btn btn-primary" onClick={deleteSelected} disabled={deleting} style={{ background: 'var(--danger)', height: 40, padding: '0 20px', fontWeight: 700 }}>
                                        {deleting ? <RefreshCw size={16} className="spinner" /> : <Trash2 size={16} />}
                                        Eliminar registros
                                    </button>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-base)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleExport('csv')} style={{ height: 32, padding: '0 12px', fontSize: 12, fontWeight: 700, gap: 6 }}>
                                                <Download size={12} /> CSV
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleExport('json')} style={{ height: 32, padding: '0 12px', fontSize: 12, fontWeight: 700, gap: 6 }}>
                                                <FileJson size={12} /> JSON
                                            </button>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={handleExportDdl} style={{ height: 32, padding: '0 12px', fontSize: 12, fontWeight: 700, gap: 6 }} title="CREATE TABLE sin datos">
                                                <Code2 size={12} /> DDL
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={handleExportColumnSql}
                                                disabled={!selectedColumn}
                                                style={{ height: 32, padding: '0 12px', fontSize: 12, fontWeight: 700, gap: 6 }}
                                                title={selectedColumn ? `Exportar columna "${selectedColumn}"` : 'Elige una columna'}
                                            >
                                                <Code2 size={12} /> SQL columna
                                            </button>
                                        </div>
                                        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <select
                                                className="input"
                                                style={{ height: 36, fontSize: 13, background: 'var(--bg-base)' }}
                                                value={filterCol}
                                                onChange={e => setFilterCol(e.target.value)}
                                            >
                                                <option value="">Filtro Avanzado</option>
                                                {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                            {filterCol && (
                                                <div style={{ position: 'relative' }}>
                                                    <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        className="input"
                                                        placeholder="Valor..."
                                                        value={filterVal}
                                                        onChange={e => setFilterVal(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') loadPage(0); }}
                                                        style={{ height: 36, paddingLeft: 32, fontSize: 13, minWidth: 160 }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
                                <button type="button" className="btn btn-ghost" onClick={() => void loadPage(page)} style={{ height: 40, width: 40, padding: 0, justifyContent: 'center' }} title="Refrescar página actual">
                                    <RefreshCw size={18} className={loading ? 'spinner' : ''} color="var(--text-secondary)" />
                                </button>
                                <button className="btn btn-ghost" style={{ height: 40, width: 40, padding: 0, justifyContent: 'center' }}>
                                    <Settings2 size={18} color="var(--text-secondary)" />
                                </button>
                            </div>
                        </div>

                        {/* High-Performance Spreadsheet Grid */}
                        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'var(--bg-base)' }}>
                            {loading && !rows.length && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.02)', zIndex: 10 }}>
                                    <div className="spinner" style={{ width: 48, height: 48, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                                </div>
                            )}

                            <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <tr style={{ background: 'var(--bg-surface)' }}>
                                        {showRowCheckbox && (
                                            <th style={{ width: 60, padding: 0, borderRight: '1px solid var(--border)', borderBottom: '2px solid var(--border)', position: 'sticky', left: 0, zIndex: 10, background: 'var(--bg-surface)' }}>
                                                <div
                                                    onClick={toggleAll}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, cursor: 'pointer' }}
                                                >
                                                    {allSelected ? <CheckSquare size={18} color="var(--brand)" /> : <Square size={18} color="var(--border)" />}
                                                </div>
                                            </th>
                                        )}
                                        {columns.map(c => (
                                            <th
                                                key={c.name}
                                                onClick={() => setSelectedColumn(c.name === selectedColumn ? null : c.name)}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '0 12px 0 16px',
                                                    borderRight: '1px solid var(--border)',
                                                    borderBottom: '2px solid var(--border)',
                                                    height: 48,
                                                    width: getColWidth(c.name),
                                                    minWidth: 72,
                                                    maxWidth: 640,
                                                    verticalAlign: 'middle',
                                                    background: selectedColumn === c.name ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                                                        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                                        <span style={{ fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: 4, fontWeight: 900, border: '1px solid var(--border-soft)', flexShrink: 0 }}>{String(c.type).toUpperCase()}</span>
                                                        {c.is_primary_key ? <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--brand)', flexShrink: 0 }}>PK</span> : null}
                                                    </div>
                                                    <GripVertical size={14} color="var(--text-muted)" style={{ opacity: 0.35, flexShrink: 0 }} />
                                                </div>
                                                <div
                                                    role="separator"
                                                    aria-label="Redimensionar columna"
                                                    onMouseDown={e => startColResize(c.name, e)}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: 6,
                                                        cursor: 'col-resize',
                                                        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06))',
                                                    }}
                                                />
                                            </th>
                                        ))}
                                        <th style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-surface)', minWidth: 24 }} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 2} style={{ padding: '120px 40px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                                                    <div style={{ opacity: 0.1 }}><Layers size={64} /></div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>No hay registros disponibles en esta vista.</div>
                                                    <button className="btn btn-primary" style={{ height: 40, padding: '0 24px' }}>Añadir Primera Fila</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : rows.map((row, i) => {
                                        const rowKey = getRowKey(row, pkNames);
                                        const filters = rowKeyToFilters(row, pkNames);
                                        const isSelected = filters != null && selected.has(rowKey);
                                        return (
                                            <tr key={rowKey || `row-${i}`} style={{
                                                background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                                transition: 'background 0.1s'
                                            }}>
                                                {showRowCheckbox && (
                                                    <td style={{ borderRight: '1px solid var(--border)', padding: 0, position: 'sticky', left: 0, zIndex: 8, background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)' }}>
                                                        <div
                                                            onClick={(e) => filters && toggleRow(rowKey, e)}
                                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, cursor: filters ? 'pointer' : 'not-allowed', opacity: filters ? 1 : 0.35 }}
                                                        >
                                                            {isSelected ? <CheckSquare size={18} color="var(--brand)" /> : <Square size={18} color="var(--border)" style={{ opacity: 0.4 }} />}
                                                        </div>
                                                    </td>
                                                )}
                                                {columns.map(c => (
                                                    <td key={c.name} style={{ borderBottom: '1px solid var(--border)', padding: 0, width: getColWidth(c.name), maxWidth: 640 }}>
                                                        <EditableCell
                                                            value={row[c.name]}
                                                            col={c as TableColumnMeta & { name: string }}
                                                            rowFilters={filters}
                                                            projectId={projectId!}
                                                            table={selectedTable}
                                                            onSaved={() => loadPage(page)}
                                                        />
                                                    </td>
                                                ))}
                                                <td style={{ borderBottom: '1px solid var(--border)' }} />
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Enterprise Pagination Engine */}
                        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Muestra:</span>
                                    <select
                                        className="input"
                                        value={limit}
                                        onChange={e => {
                                            const newLimit = parseInt(e.target.value);
                                            setLimit(newLimit);
                                            loadPage(0, newLimit);
                                        }}
                                        style={{ height: 32, fontSize: 12, padding: '0 10px', width: 80, background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                                    >
                                        {[25, 50, 100, 250, 500].map(v => <option key={v} value={v}>{v} filas</option>)}
                                    </select>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Columns size={14} color="var(--brand)" />
                                    {total === 0 ? 'Sin datos' : `${page * limit + 1} – ${Math.min((page + 1) * limit, total)} de ${total} registros`}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => loadPage(page - 1)} style={{ height: 36, padding: '0 16px', gap: 8, fontWeight: 700 }}>
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <button className="btn btn-outline btn-sm" disabled={(page + 1) * limit >= total} onClick={() => loadPage(page + 1)} style={{ height: 36, padding: '0 16px', gap: 8, fontWeight: 700 }}>
                                    Siguiente <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showCreate && <CreateTableModal projectId={projectId!} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadTables(); }} />}

            <style>{`
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                .spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-item:hover .table-actions {
                    opacity: 1 !important;
                }
                .table-item:hover {
                    background: var(--bg-main) !important;
                }
                .tab-close-btn:hover {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}
