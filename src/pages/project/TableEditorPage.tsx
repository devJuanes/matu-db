import { useEffect, useState, useCallback, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { tablesAPI, dataAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Plus, RefreshCw, Trash2, ChevronDown, X,
    Download, CheckSquare, Square, Check,
} from 'lucide-react';

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
            toast.success(`Table "${name}" created`);
            onCreated();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create table');
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Create new table</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={submit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Table name *</label>
                            <input className="input" placeholder="products" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                <input type="checkbox" checked={addId} onChange={e => setAddId(e.target.checked)} />Auto UUID id
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                <input type="checkbox" checked={addTs} onChange={e => setAddTs(e.target.checked)} />created_at / updated_at
                            </label>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label className="form-label" style={{ margin: 0 }}>Columns</label>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addCol}><Plus size={12} />Add column</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {cols.map((col, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input className="input" placeholder="column_name" value={col.name} onChange={e => updateCol(i, 'name', e.target.value)} style={{ flex: 2 }} />
                                        <select className="select" value={col.type} onChange={e => updateCol(i, 'type', e.target.value)} style={{ flex: 1 }}>
                                            {PG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={col.nullable} onChange={e => updateCol(i, 'nullable', e.target.checked)} />Nullable
                                        </label>
                                        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeCol(i)} style={{ color: 'var(--danger)', flexShrink: 0 }}><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner spinner-sm" />Creating…</> : 'Create table'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Editable Cell ──────────────────────────────────────────
function EditableCell({ value, col, rowId, projectId, table, onSaved }: {
    value: any; col: any; rowId: string; projectId: string; table: string; onSaved: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isUUID = typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value);
    const isReadOnly = col.name === 'id' || col.name === 'created_at' || col.name === 'updated_at';

    const display = () => {
        if (value === null || value === undefined) return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 11 }}>null</span>;
        if (value === true) return <span className="badge badge-green">true</span>;
        if (value === false) return <span className="badge badge-gray">false</span>;
        const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (isUUID) return <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{str.slice(0, 8)}…</span>;
        return str;
    };

    const startEdit = () => {
        if (isReadOnly) return;
        setDraft(value === null ? '' : String(value));
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 30);
    };

    const save = async () => {
        setSaving(true);
        try {
            await dataAPI.update(projectId, table, { [col.name]: draft || null }, { id: rowId });
            toast.success('Saved');
            onSaved();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); setEditing(false); }
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
    };

    if (editing) {
        return (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                    ref={inputRef}
                    className="input"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={onKey}
                    style={{ padding: '2px 6px', height: 26, fontSize: 12, minWidth: 80 }}
                />
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--brand)' }} onClick={save} disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <Check size={12} />}
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(false)}><X size={11} /></button>
            </div>
        );
    }

    return (
        <div
            onClick={startEdit}
            title={isReadOnly ? undefined : 'Click to edit'}
            style={{
                cursor: isReadOnly ? 'default' : 'pointer',
                padding: '2px 4px',
                borderRadius: 3,
                minHeight: 20,
                transition: 'background .15s',
            }}
            onMouseEnter={e => { if (!isReadOnly) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
            {display()}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function TableEditorPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project: _p } = useOutletContext<any>();
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
    const limit = 50;

    const loadTables = useCallback(() => {
        if (!projectId) return;
        setFetchingTables(true);
        tablesAPI.list(projectId)
            .then(res => setTables(res.data.data.tables))
            .finally(() => setFetchingTables(false));
    }, [projectId]);


    useEffect(() => { loadTables(); }, [loadTables]);

    const selectTable = async (t: string) => {
        setSelectedTable(t); setPage(0); setSelected(new Set()); setLoading(true);
        try {
            const [colsRes, rowsRes] = await Promise.all([
                tablesAPI.get(projectId!, t),
                dataAPI.select(projectId!, t, { limit, offset: 0 }),
            ]);
            setColumns(colsRes.data.data.columns);
            setRows(rowsRes.data.data.rows);
            setTotal(rowsRes.data.data.total);
        } finally { setLoading(false); }
    };

    const loadPage = async (p: number) => {
        if (!selectedTable) return;
        setPage(p); setSelected(new Set()); setLoading(true);
        try {
            const res = await dataAPI.select(projectId!, selectedTable, { limit, offset: p * limit });
            setRows(res.data.data.rows); setTotal(res.data.data.total);
        } finally { setLoading(false); }
    };

    const dropTable = async (t: string) => {
        if (!confirm(`Drop table "${t}"? All data will be lost.`)) return;
        try {
            await tablesAPI.drop(projectId!, t);
            toast.success(`Table "${t}" dropped`);
            if (selectedTable === t) { setSelectedTable(null); setRows([]); setColumns([]); }
            loadTables();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    // Selection
    const allIds = rows.map(r => r.id).filter(Boolean);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(allIds));
    };
    const toggleRow = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const deleteSelected = async () => {
        if (!confirm(`Delete ${selected.size} row(s)?`)) return;
        setDeleting(true);
        try {
            for (const id of selected) {
                await dataAPI.delete(projectId!, selectedTable!, { id });
            }
            toast.success(`${selected.size} row(s) deleted`);
            setSelected(new Set());
            await selectTable(selectedTable!);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally { setDeleting(false); }
    };

    const handleExport = (format: 'csv' | 'json') => {
        const toExport = selected.size > 0
            ? rows.filter(r => selected.has(r.id))
            : rows;
        if (toExport.length === 0) { toast.error('No rows to export'); return; }
        exportData(toExport, format, selectedTable!);
        toast.success(`Exported ${toExport.length} rows as ${format.toUpperCase()}`);
    };

    const hasIds = rows.some(r => r.id);

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {/* Table sidebar */}
            <div style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>TABLES</span>
                    <button className="btn btn-ghost btn-icon btn-sm" title="New table" onClick={() => setShowCreate(true)}><Plus size={14} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {fetchingTables ? (
                        <div className="loading-spinner-wrap">
                            <span className="spinner" />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cargando tablas…</span>
                        </div>
                    ) : tables.length === 0 ? (
                        <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No tables yet.<br /><br />
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(true)}><Plus size={12} />Create table</button>
                        </div>
                    ) : tables.map(t => (
                        <div key={t.name} onClick={() => selectTable(t.name)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 2, background: selectedTable === t.name ? 'var(--brand-light)' : 'transparent', color: selectedTable === t.name ? 'var(--brand)' : 'var(--text-secondary)' }}
                            onMouseEnter={e => { if (selectedTable !== t.name) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
                            onMouseLeave={e => { if (selectedTable !== t.name) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{t.name}</span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.column_count} cols</span>
                                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-muted)', padding: 2 }} onClick={e => { e.stopPropagation(); dropTable(t.name); }}><Trash2 size={11} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!selectedTable ? (
                    <div className="empty-state" style={{ height: '100%' }}>
                        <div className="empty-state-icon"><ChevronDown size={40} /></div>
                        <p className="empty-state-title">Select a table</p>
                        <p className="empty-state-desc">Or create a new one to get started</p>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0, gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontWeight: 600 }}>{selectedTable}</span>
                                <span className="badge badge-gray">{total} rows</span>
                                {selected.size > 0 && <span className="badge badge-blue">{selected.size} selected</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {selected.size > 0 && (
                                    <button className="btn btn-danger btn-sm" onClick={deleteSelected} disabled={deleting}>
                                        {deleting ? <span className="spinner spinner-sm" /> : <Trash2 size={13} />}
                                        Delete {selected.size}
                                    </button>
                                )}
                                {/* Export dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button className="btn btn-outline btn-sm" onClick={() => handleExport('csv')}><Download size={13} />CSV</button>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => handleExport('json')}><Download size={13} />JSON</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => selectTable(selectedTable)}><RefreshCw size={13} />Refresh</button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
                        ) : (
                            <>
                                <div className="table-wrap" style={{ flex: 1, overflow: 'auto' }}>
                                    <table className="table" style={{ minWidth: '100%' }}>
                                        <thead>
                                            <tr>
                                                {/* Select-all checkbox */}
                                                {hasIds && (
                                                    <th style={{ width: 36, padding: '0 10px' }}>
                                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={toggleAll} style={{ color: 'var(--text-secondary)' }}>
                                                            {allSelected ? <CheckSquare size={14} color="var(--brand)" /> : <Square size={14} />}
                                                        </button>
                                                    </th>
                                                )}
                                                {columns.map(c => (
                                                    <th key={c.name}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {c.name}
                                                            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{c.type}</span>
                                                            {c.is_nullable === 'NO' && <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 600 }}>NOT NULL</span>}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.length === 0 ? (
                                                <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>No rows yet</td></tr>
                                            ) : rows.map((row, i) => {
                                                const rowId = row.id;
                                                const isSelected = rowId && selected.has(rowId);
                                                return (
                                                    <tr key={i} style={{ background: isSelected ? 'var(--brand-light)' : undefined }}>
                                                        {hasIds && (
                                                            <td style={{ width: 36, padding: '0 10px' }}>
                                                                {rowId && (
                                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleRow(rowId)} style={{ color: isSelected ? 'var(--brand)' : 'var(--text-muted)' }}>
                                                                        {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                        {columns.map(c => (
                                                            <td key={c.name}>
                                                                <EditableCell
                                                                    value={row[c.name]}
                                                                    col={c}
                                                                    rowId={rowId}
                                                                    projectId={projectId!}
                                                                    table={selectedTable}
                                                                    onSaved={() => selectTable(selectedTable)}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, background: 'var(--bg-surface)' }}>
                                    <span>{total === 0 ? '0 rows' : `Showing ${page * limit + 1}–${Math.min((page + 1) * limit, total)} of ${total}`}</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => loadPage(page - 1)}>← Prev</button>
                                        <button className="btn btn-outline btn-sm" disabled={(page + 1) * limit >= total} onClick={() => loadPage(page + 1)}>Next →</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {showCreate && <CreateTableModal projectId={projectId!} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadTables(); }} />}
        </div>
    );
}
