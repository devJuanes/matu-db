import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api, { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Users, Copy, CheckCircle, XCircle, Code, Trash2,
    ShieldOff, ShieldCheck, AlertTriangle, Mail,
    Search, UserPlus, MoreHorizontal, Filter,
    Shield, Terminal, ExternalLink, Info, CheckCircle2, RefreshCw
} from 'lucide-react';

export default function ProjectAuthPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'users' | 'docs'>('users');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/projects/${projectId}/auth/users`);
            setUsers(res.data.data.users);
            setSelected(new Set());
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al cargar usuarios');
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
        if (!confirm(`¿Eliminar definitivamente a ${selected.size} usuario(s)? Esta acción no se puede deshacer.`)) return;
        setActionLoading('delete');
        let failed = 0;
        try {
            await Promise.all([...selected].map(id =>
                api.delete(`/projects/${projectId}/auth/users/${id}`).catch(() => { failed++; })
            ));
            if (failed) toast.error(`${failed} usuario(s) no se pudieron eliminar`);
            else toast.success(`${selected.size} usuario(s) eliminados correctamente`);
            load();
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Toggle active ──────────────────────────────────────── */
    const toggleUserStatus = async (userId: string, currentStatus: boolean, email: string) => {
        setActionLoading(userId);
        try {
            await api.patch(`/projects/${projectId}/auth/users/${userId}/toggle`);
            toast.success(`Usuario ${email} ${currentStatus ? 'desactivado' : 'activado'}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al cambiar estado');
        } finally { setActionLoading(null); }
    };

    /* ── Recovery ───────────────────────────────────────────── */
    const handleRecover = async (userId: string, email: string) => {
        setActionLoading(userId);
        try {
            await authAPI.recoverUserPassword(projectId!, userId);
            toast.success(`Instrucciones enviadas a ${email}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al enviar recuperación');
        } finally { setActionLoading(null); }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado');
    };

    /* ── Snippets ─────────────────────────────────────────── */
    const BASE = `http://localhost:3001/api/projects/${projectId}`;
    const snippets: Record<string, string> = {
        'Registro de Usuario': `const res = await fetch('${BASE}/auth/register', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'apikey': 'TU_ANON_KEY' 
  },
  body: JSON.stringify({ 
    email: 'usuario@ejemplo.com', 
    password: 'password_seguro', 
    name: 'Nombre Usuario' 
  })
});

const { data } = await res.json();
// data.token contiene el JWT`,

        'Inicio de Sesión': `const res = await fetch('${BASE}/auth/login', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'apikey': 'TU_ANON_KEY' 
  },
  body: JSON.stringify({ 
    email: 'usuario@ejemplo.com', 
    password: 'password_seguro' 
  })
});

const { data } = await res.json();
// data.token y data.user`,

        'Verificación de JWT': `const res = await fetch('${BASE}/auth/verify', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'apikey': 'TU_ANON_KEY' 
  },
  body: JSON.stringify({ 
    token: localStorage.getItem('token') 
  })
});

const { data } = await res.json();
// data.valid (boolean) y data.payload`
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const allSelected = users.length > 0 && selected.size === users.length;
    const someSelected = selected.size > 0;

    return (
        <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Shield size={14} /> Seguridad y Acceso
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Gestión de Usuarios</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600 }}>
                        Administra las cuentas de tus usuarios finales de forma centralizada.
                        Configura políticas de acceso y monitorea actividad sospechosa.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" style={{ height: 44, padding: '0 20px', gap: 10 }} onClick={load}>
                        <RefreshCw size={16} className={loading ? 'spinner' : ''} /> Refrescar
                    </button>
                    <button className="btn btn-primary" style={{ height: 44, padding: '0 20px', gap: 10 }}>
                        <UserPlus size={16} /> Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 32, position: 'relative' }}>
                {(['users', 'docs'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            background: 'none', border: 'none', padding: '12px 16px', fontSize: 14, fontWeight: 700,
                            color: tab === t ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer',
                            position: 'relative', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 10
                        }}>
                        {t === 'users' ? <Users size={18} /> : <Terminal size={18} />}
                        {t === 'users' ? 'Usuarios Registrados' : 'API & Documentación'}
                        {tab === t && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--brand)' }} />}
                    </button>
                ))}
            </div>

            {tab === 'users' ? (
                <>
                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ position: 'relative', width: 340 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Buscar por email o nombre..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: 40, height: 44, fontSize: 14, background: 'var(--bg-surface)' }}
                            />
                        </div>

                        {someSelected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, animation: 'fadeIn 0.2s ease' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>{selected.size} usuarios seleccionados</span>
                                <button className="btn btn-sm" onClick={deleteSelected} disabled={!!actionLoading} style={{ background: 'var(--danger)', color: '#fff', border: 'none', height: 32 }}>
                                    {actionLoading === 'delete' ? <span className="spinner spinner-sm" /> : 'Eliminar'}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())} style={{ height: 32 }}>Cancelar</button>
                            </div>
                        )}
                    </div>

                    {/* Table View */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {loading && !users.length ? (
                            <div style={{ padding: 100, textAlign: 'center' }}>
                                <span className="spinner" style={{ width: 40, height: 40, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div style={{ padding: 100, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <Users size={40} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sin usuarios registrados</h3>
                                    <p style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>
                                        {searchTerm ? 'No se encontraron usuarios con esos criterios.' : 'Tus usuarios finales aparecerán aquí una vez que se registren a través de tu aplicación.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg-surface)' }}>
                                        <tr>
                                            <th style={{ width: 48, padding: '16px 24px', textAlign: 'center' }}>
                                                <div
                                                    onClick={toggleAll}
                                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {allSelected ? <CheckCircle style={{ color: 'var(--brand)' }} size={18} /> : <div style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid var(--border)' }} />}
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Perfil</th>
                                            <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rol Aplicación</th>
                                            <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado de Cuenta</th>
                                            <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registrado el</th>
                                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, i) => {
                                            const isSelected = selected.has(u.id);
                                            const isWorking = actionLoading === u.id;
                                            return (
                                                <tr key={u.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', background: isSelected ? 'rgba(16, 185, 129, 0.03)' : 'transparent', transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                                                        <div
                                                            onClick={() => toggleOne(u.id)}
                                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            {isSelected ? <CheckCircle style={{ color: 'var(--brand)' }} size={18} /> : <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--border)', opacity: 0.5 }} />}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{
                                                                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                                                background: u.is_active ? 'var(--brand)' : 'var(--bg-base)',
                                                                color: u.is_active ? '#fff' : 'var(--text-muted)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14
                                                            }}>
                                                                {u.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--brand)' : 'var(--text-primary)', textDecoration: u.is_active ? 'none' : 'line-through', opacity: u.is_active ? 1 : 0.6 }}>{u.name || 'Sin nombre'}</div>
                                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 4,
                                                            background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-base)',
                                                            color: u.role === 'admin' ? 'var(--warning)' : 'var(--text-secondary)',
                                                            border: u.role === 'admin' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid var(--border)'
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {u.is_active ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>
                                                                <CheckCircle2 size={14} /> Activo
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                                                                <ShieldOff size={14} /> Inactivo
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                                        {new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '12px 24px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                            <button
                                                                className="btn btn-ghost btn-icon"
                                                                title={u.is_active ? 'Inhabilitar' : 'Habilitar'}
                                                                disabled={isWorking}
                                                                onClick={() => toggleUserStatus(u.id, u.is_active, u.email)}
                                                                style={{ color: u.is_active ? 'var(--warning)' : 'var(--brand)' }}
                                                            >
                                                                {isWorking ? <span className="spinner spinner-sm" /> : (u.is_active ? <ShieldOff size={16} /> : <ShieldCheck size={16} />)}
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-icon"
                                                                title="Recuperación contraseña"
                                                                disabled={isWorking}
                                                                onClick={() => handleRecover(u.id, u.email)}
                                                                style={{ color: 'var(--info)' }}
                                                            >
                                                                <Mail size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-icon"
                                                                title="Eliminar usuario"
                                                                disabled={isWorking}
                                                                onClick={() => { setSelected(new Set([u.id])); setTimeout(deleteSelected, 0); }}
                                                                style={{ color: 'var(--danger)' }}
                                                            >
                                                                <Trash2 size={16} />
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
                        {/* Table Footer Stats */}
                        {!loading && users.length > 0 && (
                            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 24, fontSize: 12, fontWeight: 600 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Muestreo: <strong style={{ color: 'var(--text-primary)' }}>{filteredUsers.length} de {users.length}</strong></span>
                                <span style={{ color: 'var(--text-muted)' }}>Activos: <strong style={{ color: 'var(--brand)' }}>{users.filter(u => u.is_active).length}</strong></span>
                                <span style={{ color: 'var(--text-muted)' }}>Sesiones: <strong style={{ color: 'var(--info)' }}>Real-time</strong></span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* API Section */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {Object.entries(snippets).map(([title, code]) => (
                            <div key={title} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{title}</h5>
                                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(code)} style={{ fontSize: 11, gap: 6 }}>
                                        <Copy size={12} /> Copiar Código
                                    </button>
                                </div>
                                <pre style={{
                                    margin: 0, padding: '20px', fontSize: 13, fontFamily: 'var(--font-mono)',
                                    background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'auto',
                                    lineHeight: 1.5
                                }}>
                                    {code}
                                </pre>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card" style={{ background: 'var(--brand)', color: '#fff', border: 'none', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <Terminal size={24} />
                                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Guía de Implementación</h4>
                            </div>
                            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>
                                MatuDB proporciona una solución de autenticación completa. Usa la <strong>Anon Key</strong> en el lado del cliente (Frontend) y la <strong>Service Key</strong> solo en entornos seguros (Backend).
                            </p>
                            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                                    <CheckCircle size={16} /> JWT basado en estándar RS256
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                                    <CheckCircle size={16} /> Control de sesión nativo
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                                    <CheckCircle size={16} /> Recuperación vía SMTP integrado
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 16, display: 'flex', gap: 16 }}>
                            <AlertTriangle size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                            <div>
                                <h5 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>IMPORTANTE: SEGURIDAD</h5>
                                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Recuerda que los endpoints de <code>/auth</code> requieren el header <code>apikey</code>. Nunca publiques tus llaves secretas en repositorios públicos.
                                </p>
                                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--brand)', marginTop: 12, textDecoration: 'none' }}>
                                    Leer Documentación <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spinner-sm {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-top-color: var(--brand);
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
