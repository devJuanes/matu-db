import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, FileText, RefreshCw, Settings } from 'lucide-react';
import { metricsAPI } from '../../../lib/api';

type MetricDataResponse = {
    metric: any;
    dataset: {
        rows: Record<string, unknown>[];
        categories: Array<string | number>;
        series: Array<{ name: string; data: number[] }>;
        measures: Array<{ id: string; label: string }>;
    };
};

const chartTypes = ['bar', 'line', 'area', 'donut', 'radar', 'scatter'] as const;
type ChartType = (typeof chartTypes)[number];

export default function MetricsDashboardPage() {
    const { projectId, metricId } = useParams<{ projectId: string; metricId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payload, setPayload] = useState<MetricDataResponse | null>(null);
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);

    const loadData = async () => {
        if (!projectId || !metricId) return;
        try {
            setLoading(true);
            const res = await metricsAPI.getData(projectId, metricId);
            const data = res.data.data as MetricDataResponse;
            setPayload(data);
            const initialType = (data?.metric?.dashboard_config?.chartType || data?.metric?.builder_config?.visualHint?.chartType || 'bar') as ChartType;
            setChartType(chartTypes.includes(initialType) ? initialType : 'bar');
        } catch {
            toast.error('No se pudo cargar el dashboard');
            navigate(`/project/${projectId}/metrics`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId, metricId]);

    const saveChartPreference = async (nextType: ChartType) => {
        if (!projectId || !metricId || !payload) return;
        try {
            await metricsAPI.update(projectId, metricId, {
                dashboard_config: {
                    ...(payload.metric.dashboard_config || {}),
                    chartType: nextType,
                },
            });
            setPayload((prev) => (prev ? { ...prev, metric: { ...prev.metric, dashboard_config: { ...(prev.metric.dashboard_config || {}), chartType: nextType } } } : prev));
        } catch {
            toast.error('No se pudo guardar el estilo de grafico');
        }
    };

    const chartOptions = useMemo(() => {
        const categories = payload?.dataset.categories || [];
        const title = payload?.metric?.builder_config?.visualHint?.title || payload?.metric?.name || 'Metrica';
        return {
            chart: {
                id: 'metric-chart',
                toolbar: { show: true },
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
            },
            title: { text: title, style: { fontWeight: 700 } },
            xaxis: { categories },
            stroke: { curve: 'smooth' },
            dataLabels: { enabled: false },
            legend: { position: 'bottom' as const },
            theme: { mode: 'dark' as const },
            tooltip: { shared: true, intersect: false },
            grid: { borderColor: 'rgba(148,163,184,0.2)' },
        };
    }, [payload]);

    const handleDownload = async (kind: 'pdf' | 'excel') => {
        if (!projectId || !metricId) return;
        try {
            setDownloading(kind);
            const res = kind === 'pdf'
                ? await metricsAPI.exportPdf(projectId, metricId)
                : await metricsAPI.exportExcel(projectId, metricId);
            const blob = res.data as Blob;
            const ext = kind === 'pdf' ? 'pdf' : 'xlsx';
            const filename = `${payload?.metric?.name || 'metric-report'}.${ext}`.replace(/\s+/g, '_');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
            toast.success(`Reporte ${kind.toUpperCase()} descargado`);
        } catch {
            toast.error(`No se pudo descargar ${kind.toUpperCase()}`);
        } finally {
            setDownloading(null);
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Cargando dashboard...</div>;
    if (!payload) return null;

    const kpis = payload.dataset.measures.map((measure) => {
        const first = payload.dataset.rows[0] || {};
        return { label: measure.label, value: first[measure.id] };
    });

    return (
        <div style={{ padding: '30px 24px', maxWidth: 1250, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>{payload.metric.name}</h1>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{payload.metric.description || 'Dashboard ejecutivo de metrica'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => navigate(`/project/${projectId}/metrics/${metricId}/builder`)}>
                        <Settings size={16} /> Constructor
                    </button>
                    <button className="btn btn-outline" onClick={loadData}>
                        <RefreshCw size={16} /> Refrescar
                    </button>
                    <button className="btn btn-outline" disabled={downloading !== null} onClick={() => handleDownload('excel')}>
                        <FileSpreadsheet size={16} /> Excel
                    </button>
                    <button className="btn btn-primary" disabled={downloading !== null} onClick={() => handleDownload('pdf')}>
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="card" style={{ padding: 14 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{kpi.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{String(kpi.value ?? 0)}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700 }}>Visualizacion</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {chartTypes.map((t) => (
                            <button
                                key={t}
                                className="btn btn-ghost"
                                onClick={() => {
                                    setChartType(t);
                                    saveChartPreference(t);
                                }}
                                style={{ height: 34, border: chartType === t ? '1px solid var(--brand)' : undefined }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <ReactApexChart
                    type={chartType as any}
                    options={chartOptions as any}
                    series={payload.dataset.series as any}
                    height={420}
                />
            </div>

            <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>Tabla detalle</div>
                    <button className="btn btn-ghost" onClick={() => handleDownload('excel')}>
                        <Download size={14} /> Exportar tabla
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {Object.keys(payload.dataset.rows[0] || {}).map((key) => (
                                    <th key={key} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payload.dataset.rows.slice(0, 100).map((row, idx) => (
                                <tr key={idx}>
                                    {Object.keys(payload.dataset.rows[0] || {}).map((key) => (
                                        <td key={`${idx}-${key}`} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                                            {String(row[key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
