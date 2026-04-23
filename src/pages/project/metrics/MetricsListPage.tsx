import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Download, Plus, Settings2, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { metricsAPI } from '../../../lib/api';

type MetricRow = {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    updated_at: string;
};

export default function MetricsListPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [rows, setRows] = useState<MetricRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const importRef = useRef<HTMLInputElement>(null);

    const loadRows = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const res = await metricsAPI.list(projectId);
            setRows(res.data.data || []);
        } catch {
            toast.error('No se pudieron cargar las metricas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRows();
    }, [projectId]);

    const handleCreate = async () => {
        if (!projectId) return;
        try {
            setCreating(true);
            const baseConfig = {
                sources: [{ id: 'u', table: 'users' }],
                joins: [],
                filters: [],
                dimensions: [],
                measures: [{ id: 'total_usuarios', label: 'Total usuarios', op: 'count', ref: { source: 'u', column: 'id' } }],
                limit: 100,
                visualHint: { chartType: 'bar', title: 'Nueva metrica' },
            };
            const res = await metricsAPI.create(projectId, {
                name: 'Nueva metrica',
                description: 'Metrica creada desde constructor visual',
                status: 'inactive',
                builder_config: baseConfig,
                dashboard_config: { chartType: 'bar' },
            });
            const metricId = res.data.data.id as string;
            toast.success('Metrica creada');
            navigate(`/project/${projectId}/metrics/${metricId}/builder`);
        } catch {
            toast.error('No se pudo crear la metrica');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!projectId) return;
        if (!confirm('Eliminar esta metrica?')) return;
        try {
            await metricsAPI.delete(projectId, id);
            toast.success('Metrica eliminada');
            loadRows();
        } catch {
            toast.error('No se pudo eliminar');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !projectId) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const payload = parsed?.data ?? parsed;
            await metricsAPI.import(projectId, payload);
            toast.success('Metrica importada');
            loadRows();
        } catch {
            toast.error('JSON invalido');
        }
    };

    const handleExport = async (id: string, name: string) => {
        if (!projectId) return;
        try {
            const res = await metricsAPI.exportJson(projectId, id);
            const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${name.replace(/\s+/g, '_')}.metric.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('JSON exportado');
        } catch {
            toast.error('No se pudo exportar');
        }
    };

    return (
        <div style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <div style={{ color: 'var(--brand)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Business Intelligence
                    </div>
                    <h1 style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 800 }}>Metricas</h1>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input ref={importRef} type="file" style={{ display: 'none' }} accept="application/json,.json" onChange={handleImport} />
                    <button className="btn btn-outline" onClick={() => importRef.current?.click()} style={{ height: 44, gap: 8 }}>
                        <Upload size={16} /> Importar JSON
                    </button>
                    <button className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ height: 44, gap: 8 }}>
                        <Plus size={18} /> {creating ? 'Creando...' : 'Nueva metrica'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40 }}>Cargando...</div>
            ) : rows.length === 0 ? (
                <div className="card" style={{ padding: 26 }}>No hay metricas. Crea la primera para comenzar.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {rows.map((row) => (
                        <div key={row.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800 }}>{row.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.description || 'Sin descripcion'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost" onClick={() => navigate(`/project/${projectId}/metrics/${row.id}/builder`)}>
                                    <Settings2 size={16} />
                                </button>
                                <button className="btn btn-ghost" onClick={() => navigate(`/project/${projectId}/metrics/${row.id}/dashboard`)}>
                                    <BarChart3 size={16} />
                                </button>
                                <button className="btn btn-ghost" onClick={() => handleExport(row.id, row.name)}>
                                    <Download size={16} />
                                </button>
                                <button className="btn btn-ghost" onClick={() => handleDelete(row.id)} style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
