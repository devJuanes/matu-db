import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    HardDrive, File, Image, FileText, Film, Copy, Trash2,
    RefreshCw, ExternalLink, Shield, Info, Database,
    Search, FolderOpen, MoreVertical, Download, Clock, Zap
} from 'lucide-react';

const formatBytes = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, sz = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + sz[i];
};

const fileIcon = (mime: string) => {
    if (mime?.startsWith('image/')) return <Image size={18} style={{ color: 'var(--brand)' }} />;
    if (mime?.startsWith('video/')) return <Film size={18} style={{ color: 'var(--info)' }} />;
    if (mime?.includes('pdf')) return <FileText size={18} style={{ color: 'var(--danger)' }} />;
    return <File size={18} style={{ color: 'var(--text-muted)' }} />;
};

export default function StoragePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<any>();
    const [files, setFiles] = useState<any[]>([]);
    const [stats, setStats] = useState<{ count: number; total_size: number }>({ count: 0, total_size: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [filesRes, statsRes] = await Promise.all([
                api.get(`/projects/${projectId}/storage`),
                api.get(`/projects/${projectId}/storage/stats`),
            ]);
            setFiles(filesRes.data.data.files || []);
            setStats(statsRes.data.data);
        } catch {
            toast.error('Error al cargar Storage');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('URL copiada al portapapeles');
    };

    const deleteFile = async (filename: string, original: string) => {
        if (!confirm(`¿Eliminar definitivamente el archivo "${original}"?`)) return;
        try {
            await api.delete(`/projects/${projectId}/storage/${filename}`);
            toast.success('Archivo eliminado correctamente');
            load();
        } catch {
            toast.error('Error al eliminar el archivo');
        }
    };

    const filteredFiles = files.filter(f =>
        f.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.mime_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <HardDrive size={14} /> Gestión de Archivos
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Storage Empresarial</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 640 }}>
                        Almacena y sirve archivos de forma segura para el esquema <code style={{ color: 'var(--brand)', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4 }}>{project?.schema_name}</code>.
                        Gestiona tus credenciales de API en la sección de ajustes.
                    </p>
                </div>
                <button className="btn btn-outline" onClick={load} style={{ height: 44, padding: '0 20px', gap: 10 }}>
                    <RefreshCw size={16} className={loading ? 'spinner' : ''} /> Actualizar
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                {[
                    { label: 'Total Archivos', value: stats.count ?? 0, icon: <File size={22} style={{ color: 'var(--brand)' }} />, bg: 'rgba(16, 185, 129, 0.1)' },
                    { label: 'Espacio Utilizado', value: formatBytes(stats.total_size ?? 0), icon: <HardDrive size={22} style={{ color: 'var(--info)' }} />, bg: 'rgba(59, 130, 246, 0.1)' },
                    { label: 'Ancho de Banda', value: 'Ilimitado', icon: <Zap size={22} style={{ color: 'var(--warning)' }} />, bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Estado del Servicio', value: 'Óptimo', icon: <Shield size={22} style={{ color: 'var(--success)' }} />, bg: 'rgba(16, 185, 129, 0.1)' },
                ].map((s, idx) => (
                    <div key={idx} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FolderOpen size={20} color="var(--brand)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Explorador de Archivos</h3>
                    </div>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            className="input"
                            placeholder="Buscar por nombre o tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 38, height: 38, fontSize: 13, background: 'var(--bg-base)' }}
                        />
                    </div>
                </div>

                {loading && !files.length ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <span className="spinner" style={{ width: 48, height: 48, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                        <p style={{ marginTop: 20, color: 'var(--text-muted)', fontWeight: 500 }}>Sincronizando con el servidor...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                        <div style={{ width: 100, height: 100, borderRadius: 30, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                            <HardDrive size={48} />
                        </div>
                        <div style={{ maxWidth: 360 }}>
                            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                                {searchTerm ? 'Sin coincidencias' : 'El cubo de almacenamiento está vacío'}
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Puedes subir archivos a través de nuestra API REST o SDK. Consulta los snippets en el panel de Ajustes.'}
                            </p>
                        </div>
                        {!searchTerm && (
                            <div style={{ padding: '12px 20px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                                <Info size={16} color="var(--info)" />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Tip: Mira <strong>Settings → API Keys</strong> para empezar.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-surface)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archivo</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de Contenido</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tamaño</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Carga</th>
                                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((f, i) => (
                                    <tr key={f.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {fileIcon(f.mime_type)}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                        <Clock size={10} /> {f.filename.slice(0, 16)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', background: 'var(--bg-base)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                                {f.mime_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                                            {formatBytes(f.size)}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>
                                            {new Date(f.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button className="btn btn-ghost btn-icon" onClick={() => copyToClipboard(f.url)} title="Copiar URL">
                                                    <Copy size={16} />
                                                </button>
                                                <a href={f.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" title="Ver archivo">
                                                    <ExternalLink size={16} />
                                                </a>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    style={{ color: 'var(--danger)' }}
                                                    onClick={() => deleteFile(f.filename, f.original)}
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 size={16} />
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

            <style>{`
                .spinner {
                    border: 4px solid rgba(16, 185, 129, 0.1);
                    border-top: 4px solid var(--brand);
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
