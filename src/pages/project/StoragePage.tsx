import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HardDrive, File, Image, FileText, Film, Copy, Trash2, RefreshCw, ExternalLink } from 'lucide-react';

const formatBytes = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, sz = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + sz[i];
};

const fileIcon = (mime: string) => {
    if (mime?.startsWith('image/')) return <Image size={15} color="var(--brand)" />;
    if (mime?.startsWith('video/')) return <Film size={15} color="var(--info)" />;
    if (mime?.includes('pdf')) return <FileText size={15} color="var(--danger)" />;
    return <File size={15} color="var(--text-muted)" />;
};

export default function StoragePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [files, setFiles] = useState<any[]>([]);
    const [stats, setStats] = useState<{ count: number; total_size: number }>({ count: 0, total_size: 0 });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [filesRes, statsRes] = await Promise.all([
                api.get(`/projects/${projectId}/storage`),
                api.get(`/projects/${projectId}/storage/stats`),
            ]);
            setFiles(filesRes.data.data.files || []);
            setStats(statsRes.data.data);
        } catch { toast.error('Error al cargar Storage'); }
        finally { setLoading(false); }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('URL copiada'); };

    const deleteFile = async (filename: string, original: string) => {
        if (!confirm(`¿Eliminar "${original}"?`)) return;
        try {
            await api.delete(`/projects/${projectId}/storage/${filename}`);
            toast.success('Archivo eliminado');
            load();
        } catch { toast.error('Error al eliminar'); }
    };

    return (
        <div style={{ padding: 28, maxWidth: 900 }}>
            <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Storage</h1>
                    <p className="page-subtitle">
                        Archivos del proyecto <code style={{ fontSize: 11 }}>{project?.schema_name}</code>
                        {' '}· Sube archivos vía API desde tu código · Credenciales en <strong>Settings</strong>
                    </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} />Actualizar</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Archivos', value: stats.count ?? 0, icon: <File size={18} color="var(--brand)" />, color: 'var(--brand)' },
                    { label: 'Tamaño total', value: formatBytes(stats.total_size ?? 0), icon: <HardDrive size={18} color="var(--info)" />, color: 'var(--info)' },
                ].map(s => (
                    <div key={s.label} className="card">
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                            </div>
                            <div style={{ width: 42, height: 42, background: 'var(--bg-overlay)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* File browser */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Archivos almacenados</span>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" /></div>
                ) : files.length === 0 ? (
                    <div className="empty-state" style={{ padding: 52 }}>
                        <HardDrive size={36} className="empty-state-icon" />
                        <p className="empty-state-title">Sin archivos todavía</p>
                        <p className="empty-state-desc">Sube archivos via API desde tu código. Ver credenciales en <strong>Settings → API Credentials</strong></p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Archivo</th>
                                    <th>Tipo</th>
                                    <th>Tamaño</th>
                                    <th>Subido</th>
                                    <th>URL</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(f => (
                                    <tr key={f.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {fileIcon(f.mime_type)}
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{f.original}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        {f.filename.slice(0, 14)}…
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{f.mime_type || '—'}</span></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatBytes(f.size)}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(f.created_at).toLocaleDateString('es-DO')}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-icon btn-sm" title="Copiar URL" onClick={() => copy(f.url)}>
                                                <Copy size={12} />
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                                <a href={f.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Abrir">
                                                    <ExternalLink size={12} />
                                                </a>
                                                <button className="btn btn-ghost btn-icon btn-sm"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                                    onClick={() => deleteFile(f.filename, f.original)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
