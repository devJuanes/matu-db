import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Users, Copy, CheckCircle, XCircle, Code, Trash2,
    ShieldOff, ShieldCheck, AlertTriangle,
} from 'lucide-react';

export default function ProjectAuthPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'users' | 'docs'>('users');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/projects/${projectId}/auth/users`);
            setUsers(res.data.data.users);
            setSelected(new Set());
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load users');
        } finally { setLoading(false); }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    /* ── Selection ─────────────────────────────────────────── */
    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleAll = () => {
        setSelected(prev => prev.size === users.length ? new Set() : new Set(users.map(u => u.id)));
    };

    /* ── Delete selected ────────────────────────────────────── */
    const deleteSelected = async () => {
        if (!selected.size) return;
        if (!confirm(`¿Eliminar ${selected.size} usuario(s)? Esta acción no se puede deshacer.`)) return;
        setActionLoading('delete');
        let failed = 0;
        await Promise.all([...selected].map(id =>
            api.delete(`/projects/${projectId}/auth/users/${id}`).catch(() => { failed++; })
        ));
        if (failed) toast.error(`${failed} usuario(s) no se pudieron eliminar`);
        else toast.success(`${selected.size} usuario(s) eliminado(s)`);
        setActionLoading(null);
        load();
    };

    /* ── Toggle active ──────────────────────────────────────── */
    const toggleUser = async (userId: string, currentStatus: boolean, email: string) => {
        setActionLoading(userId);
        try {
            await api.patch(`/projects/${projectId}/auth/users/${userId}/toggle`);
            toast.success(`${email} ${currentStatus ? 'inhabilitado' : 'habilitado'}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error');
        } finally { setActionLoading(null); }
    };

    /* ── Code snippets ──────────────────────────────────────── */
    const BASE = `http://localhost:3001/api/projects/${projectId}`;
    const snippets: Record<string, string> = {
        Register: `const res = await fetch('${BASE}/auth/register', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'apikey': '<anon-key>' },\n  body: JSON.stringify({ email: 'user@example.com', password: 'secret123', name: 'Juan' })\n});\nconst { data } = await res.json(); // data.token`,

        Login: `const res = await fetch('${BASE}/auth/login', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'apikey': '<anon-key>' },\n  body: JSON.stringify({ email: 'user@example.com', password: 'secret123' })\n});\nconst { data } = await res.json(); // data.token`,

        Verify: `const res = await fetch('${BASE}/auth/verify', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'apikey': '<anon-key>' },\n  body: JSON.stringify({ token: localStorage.getItem('token') })\n});\nconst { data } = await res.json(); // data.valid, data.payload`,
    };
    const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copiado'); };

    /* ── Derived ────────────────────────────────────────────── */
    const allSelected = users.length > 0 && selected.size === users.length;
    const someSelected = selected.size > 0;

    return (
        <div style={{ padding: 28, maxWidth: 860 }}>
            {/* Page header */}
            <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Authentication</h1>
                    <p className="page-subtitle">Gestión de usuarios finales del proyecto — independiente de la plataforma MatuDB</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                {(['users', 'docs'] as const).map(t => (
                    <button key={t} className="btn btn-ghost btn-sm"
                        style={{ borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent', borderRadius: 0, color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', paddingBottom: 10, gap: 6 }}
                        onClick={() => setTab(t)}>
                        {t === 'users' ? <><Users size={13} />Usuarios</> : <><Code size={13} />Snippets de código</>}
                    </button>
                ))}
            </div>

            {tab === 'users' ? (
                <>
                    {/* Bulk action toolbar — shows only when items selected */}
                    {someSelected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius)', marginBottom: 14, animation: 'fadeIn .15s ease' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)', flex: 1 }}>
                                {selected.size} usuario{selected.size > 1 ? 's' : ''} seleccionado{selected.size > 1 ? 's' : ''}
                            </span>
                            <button
                                className="btn btn-sm"
                                style={{ background: 'var(--danger)', color: '#fff', border: 'none', gap: 6 }}
                                onClick={deleteSelected}
                                disabled={actionLoading === 'delete'}>
                                {actionLoading === 'delete'
                                    ? <><span className="spinner spinner-sm" />Eliminando…</>
                                    : <><Trash2 size={13} />Eliminar seleccionados</>}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
                                Cancelar
                            </button>
                        </div>
                    )}

                    <div className="card">
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                                <span className="spinner" style={{ width: 28, height: 28 }} />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="empty-state" style={{ padding: 56 }}>
                                <Users size={40} className="empty-state-icon" />
                                <p className="empty-state-title">Sin usuarios registrados</p>
                                <p className="empty-state-desc">Los usuarios se registran desde tu app usando los endpoints de Auth</p>
                                <button className="btn btn-outline btn-sm" onClick={() => setTab('docs')}>
                                    <Code size={13} />Ver snippets de código
                                </button>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {/* Select-all checkbox */}
                                            <th style={{ width: 36, paddingRight: 0 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={toggleAll}
                                                    style={{ cursor: 'pointer', accentColor: 'var(--brand)', width: 14, height: 14 }}
                                                />
                                            </th>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Registro</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => {
                                            const isSelected = selected.has(u.id);
                                            const isTogglingThis = actionLoading === u.id;
                                            return (
                                                <tr key={u.id}
                                                    style={{ background: isSelected ? 'rgba(62,207,142,.06)' : undefined, cursor: 'default' }}>
                                                    {/* Row checkbox */}
                                                    <td style={{ paddingRight: 0 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleOne(u.id)}
                                                            style={{ cursor: 'pointer', accentColor: 'var(--brand)', width: 14, height: 14 }}
                                                        />
                                                    </td>
                                                    {/* Avatar + email */}
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{
                                                                width: 30, height: 30, borderRadius: '50%',
                                                                background: u.is_active ? 'var(--brand-light)' : 'var(--bg-overlay)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: 13, fontWeight: 700,
                                                                color: u.is_active ? 'var(--brand)' : 'var(--text-muted)',
                                                                flexShrink: 0,
                                                            }}>
                                                                {u.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 500, fontSize: 13, color: u.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                                    {u.name || '—'}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${u.role === 'admin' ? 'yellow' : 'gray'}`}>{u.role}</span>
                                                    </td>
                                                    {/* Status */}
                                                    <td>
                                                        {u.is_active
                                                            ? <span className="badge badge-green" style={{ gap: 4 }}><CheckCircle size={10} />Activo</span>
                                                            : <span className="badge badge-gray" style={{ gap: 4 }}><XCircle size={10} />Inhabilitado</span>}
                                                    </td>
                                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        {new Date(u.created_at).toLocaleDateString('es-DO')}
                                                    </td>
                                                    {/* Actions */}
                                                    <td>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                                            {/* Toggle active */}
                                                            <button
                                                                title={u.is_active ? 'Inhabilitar usuario' : 'Habilitar usuario'}
                                                                className="btn btn-ghost btn-icon btn-sm"
                                                                disabled={isTogglingThis}
                                                                onClick={() => toggleUser(u.id, u.is_active, u.email)}
                                                                style={{ color: u.is_active ? 'var(--warning)' : 'var(--brand)' }}>
                                                                {isTogglingThis
                                                                    ? <span className="spinner" style={{ width: 12, height: 12 }} />
                                                                    : u.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                                            </button>
                                                            {/* Delete single */}
                                                            <button
                                                                title="Eliminar usuario"
                                                                className="btn btn-ghost btn-icon btn-sm"
                                                                style={{ color: 'var(--text-muted)' }}
                                                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                                                onClick={() => {
                                                                    setSelected(new Set([u.id]));
                                                                    setTimeout(deleteSelected, 0);
                                                                }}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Stats footer */}
                    {users.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{users.length}</strong></span>
                            <span>Activos: <strong style={{ color: 'var(--brand)' }}>{users.filter(u => u.is_active).length}</strong></span>
                            <span>Inhabilitados: <strong style={{ color: 'var(--text-muted)' }}>{users.filter(u => !u.is_active).length}</strong></span>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Object.entries(snippets).map(([title, code]) => (
                        <div key={title} className="card">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="card-title">{title}</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => copy(code)}><Copy size={12} />Copiar</button>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <pre style={{ margin: 0, padding: '14px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto', color: 'var(--text-primary)', background: 'var(--bg-base)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
                                    {code}
                                </pre>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: 14, background: 'var(--bg-overlay)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12 }}>
                        <AlertTriangle size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--warning)' }} />
                        Reemplaza <code>&lt;anon-key&gt;</code> con la <strong>Anon Key</strong> de tu proyecto (sección <em>API Keys</em>).
                    </div>
                </div>
            )}
        </div>
    );
}
