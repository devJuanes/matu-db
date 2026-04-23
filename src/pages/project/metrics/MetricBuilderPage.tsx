import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ReactFlow,
    Background,
    Controls,
    Handle,
    Position,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
} from '@xyflow/react';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Database, Filter, Sigma, Group, Link2, ChartNoAxesCombined } from 'lucide-react';
import { metricsAPI } from '../../../lib/api';

type BuilderNodeData = Record<string, any>;
type TableInfo = { name: string };
type ColumnInfo = { name: string; type?: string };

const CardNode = ({ data, isConnectable }: { data: any; isConnectable: boolean }) => (
    <div style={{ width: 210, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', background: 'var(--bg-base)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            {data.kind}
        </div>
        <div style={{ padding: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{data.label}</div>
            {data.summary && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{data.summary}</div>}
        </div>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
);

const nodeTypes = { source: CardNode, join: CardNode, filter: CardNode, dimension: CardNode, measure: CardNode, output: CardNode };

const blankNode = (type: string, label: string, x: number, y: number): Node<BuilderNodeData> => ({
    id: `n_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    type,
    position: { x, y },
    data: { kind: type, label, summary: 'Config pendiente' },
});

const asArray = <T,>(value: T | T[] | undefined): T[] => (Array.isArray(value) ? value : value ? [value] : []);

export default function MetricBuilderPage() {
    const { projectId, metricId } = useParams<{ projectId: string; metricId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
    const [nodes, setNodes] = useState<Node<BuilderNodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node<BuilderNodeData> | null>(null);
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [columns, setColumns] = useState<Record<string, ColumnInfo[]>>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const sourceNodes = useMemo(() => nodes.filter((n) => n.type === 'source'), [nodes]);

    const updateNodeData = (id: string, patch: Record<string, unknown>) => {
        setNodes((prev) =>
            prev.map((n) => {
                if (n.id !== id) return n;
                const nextData = { ...n.data, ...patch };
                return { ...n, data: nextData };
            }),
        );
        setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data: { ...prev.data, ...patch } } : prev));
    };

    const ensureColumns = async (tableName: string) => {
        if (!projectId || columns[tableName]) return;
        const res = await metricsAPI.getTableColumns(projectId, tableName);
        setColumns((prev) => ({ ...prev, [tableName]: res.data.data || [] }));
    };

    const hydrateFromBuilderConfig = useCallback((builderConfig: any, dashboardConfig: any) => {
        const flowNodes: Node<BuilderNodeData>[] = dashboardConfig?.flow?.nodes || [];
        const flowEdges: Edge[] = dashboardConfig?.flow?.edges || [];
        if (flowNodes.length > 0) {
            setNodes(flowNodes);
            setEdges(flowEdges || []);
            return;
        }

        const nextNodes: Node<BuilderNodeData>[] = [];
        let rowY = 100;
        asArray(builderConfig?.sources).forEach((s: any, i: number) => {
            nextNodes.push({
                ...blankNode('source', `Fuente ${i + 1}`, 120 + i * 250, rowY),
                data: { kind: 'source', label: s.id, table: s.table, summary: `${s.id} -> ${s.table}` },
            });
        });
        rowY += 160;
        asArray(builderConfig?.joins).forEach((j: any, i: number) => {
            nextNodes.push({
                ...blankNode('join', `Join ${i + 1}`, 120 + i * 250, rowY),
                data: { kind: 'join', label: `Join ${i + 1}`, ...j, summary: `${j.left?.source}.${j.left?.column} = ${j.right?.source}.${j.right?.column}` },
            });
        });
        rowY += 160;
        asArray(builderConfig?.filters).forEach((f: any, i: number) => {
            nextNodes.push({
                ...blankNode('filter', `Filtro ${i + 1}`, 120 + i * 230, rowY),
                data: { kind: 'filter', label: `Filtro ${i + 1}`, ...f, summary: `${f.column} ${f.operator}` },
            });
        });
        rowY += 160;
        asArray(builderConfig?.dimensions).forEach((d: any, i: number) => {
            nextNodes.push({
                ...blankNode('dimension', `Dimension ${i + 1}`, 120 + i * 230, rowY),
                data: { kind: 'dimension', label: d.label || `Dimension ${i + 1}`, ...d, summary: `${d.ref?.source}.${d.ref?.column}` },
            });
        });
        rowY += 160;
        asArray(builderConfig?.measures).forEach((m: any, i: number) => {
            nextNodes.push({
                ...blankNode('measure', `Medida ${i + 1}`, 120 + i * 230, rowY),
                data: { kind: 'measure', label: m.label || `Medida ${i + 1}`, ...m, summary: `${m.op}(${m.ref?.column || '*'})` },
            });
        });
        rowY += 160;
        nextNodes.push({
            ...blankNode('output', 'Salida', 120, rowY),
            data: {
                kind: 'output',
                label: 'Salida',
                chartType: builderConfig?.visualHint?.chartType || 'bar',
                chartTitle: builderConfig?.visualHint?.title || name,
                limit: builderConfig?.limit || 200,
                summary: `chart: ${builderConfig?.visualHint?.chartType || 'bar'}`,
            },
        });

        setNodes(nextNodes);
        setEdges([]);
    }, [name]);

    useEffect(() => {
        const load = async () => {
            if (!projectId || !metricId) return;
            try {
                const [metricRes, tablesRes] = await Promise.all([metricsAPI.get(projectId, metricId), metricsAPI.getTables(projectId)]);
                const metric = metricRes.data.data;
                setName(metric.name || '');
                setDescription(metric.description || '');
                setStatus(metric.status || 'inactive');
                setTables(tablesRes.data.data || []);
                hydrateFromBuilderConfig(metric.builder_config || {}, metric.dashboard_config || {});
            } catch {
                toast.error('No se pudo cargar la metrica');
                navigate(`/project/${projectId}/metrics`);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId, metricId, navigate, hydrateFromBuilderConfig]);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)), []);

    const builderConfig = useMemo(() => {
        const sources = nodes.filter((n) => n.type === 'source').map((n) => ({ id: n.data.label || n.id, table: n.data.table }));
        const joins = nodes
            .filter((n) => n.type === 'join')
            .map((n) => ({
                type: n.data.type || 'left',
                left: { source: n.data.leftSource, column: n.data.leftColumn },
                right: { source: n.data.rightSource, column: n.data.rightColumn },
            }))
            .filter((j) => j.left.source && j.left.column && j.right.source && j.right.column);
        const filters = nodes
            .filter((n) => n.type === 'filter')
            .map((n) => ({ source: n.data.source, column: n.data.column, operator: n.data.operator || 'eq', value: n.data.value }))
            .filter((f) => f.column);
        const dimensions = nodes
            .filter((n) => n.type === 'dimension')
            .map((n) => ({ id: n.data.id || n.data.label, label: n.data.label, ref: { source: n.data.source, column: n.data.column } }))
            .filter((d) => d.ref.source && d.ref.column);
        const measures = nodes
            .filter((n) => n.type === 'measure')
            .map((n) => ({
                id: n.data.id || n.data.label,
                label: n.data.label,
                op: n.data.op || 'count',
                ref: n.data.refSource && n.data.refColumn ? { source: n.data.refSource, column: n.data.refColumn } : undefined,
            }))
            .filter((m) => m.label);
        const output = nodes.find((n) => n.type === 'output');
        return {
            sources,
            joins,
            filters,
            dimensions,
            measures: measures.length ? measures : [{ id: 'total', label: 'Total', op: 'count' }],
            limit: Number(output?.data.limit || 200),
            visualHint: {
                chartType: output?.data.chartType || 'bar',
                title: output?.data.chartTitle || name || 'Metrica',
            },
        };
    }, [nodes, name]);

    const saveMetric = async () => {
        if (!projectId || !metricId) return;
        try {
            setSaving(true);
            await metricsAPI.update(projectId, metricId, {
                name,
                description,
                status,
                builder_config: builderConfig,
                dashboard_config: { flow: { nodes, edges }, chartType: builderConfig.visualHint.chartType },
            });
            toast.success('Constructor guardado');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Cargando constructor...</div>;

    const sourceOptions = sourceNodes.map((n) => ({ id: n.data.label || n.id, table: n.data.table }));
    const sourceColumns = (sourceId?: string) => {
        const source = sourceOptions.find((s) => s.id === sourceId);
        if (!source?.table) return [];
        return columns[source.table] || [];
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 70, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={() => navigate(`/project/${projectId}/metrics`)}>
                        <ArrowLeft size={18} />
                    </button>
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 260, height: 40 }} />
                    <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: 360, height: 40 }} />
                    <select className="input" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} style={{ width: 120, height: 40 }}>
                        <option value="inactive">Inactiva</option>
                        <option value="active">Activa</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => navigate(`/project/${projectId}/metrics/${metricId}/dashboard`)}>
                        Ir dashboard
                    </button>
                    <button className="btn btn-primary" onClick={saveMetric} disabled={saving}>
                        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                <div style={{ width: 290, borderRight: '1px solid var(--border)', padding: 14, background: 'var(--bg-surface)', overflowY: 'auto' }}>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Nodos</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('source', 'Nueva fuente', 100, 100)))}><Database size={14} /> Fuente</button>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('join', 'Join', 120, 240)))}><Link2 size={14} /> Join</button>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('filter', 'Filtro', 160, 380)))}><Filter size={14} /> Filtro</button>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('dimension', 'Dimension', 180, 520)))}><Group size={14} /> Dimension</button>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('measure', 'Medida', 200, 660)))}><Sigma size={14} /> Medida</button>
                        <button className="btn btn-outline" onClick={() => setNodes((n) => n.concat(blankNode('output', 'Salida', 220, 800)))}><ChartNoAxesCombined size={14} /> Salida</button>
                    </div>

                    <div style={{ fontWeight: 800, marginTop: 18, marginBottom: 8 }}>Preview JSON</div>
                    <pre style={{ fontSize: 10, padding: 10, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-base)', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(builderConfig, null, 2)}
                    </pre>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, node) => setSelectedNode(node)}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>

                <div style={{ width: 330, borderLeft: '1px solid var(--border)', padding: 14, background: 'var(--bg-surface)', overflowY: 'auto' }}>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Propiedades</div>
                    {!selectedNode ? (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Selecciona un nodo en el canvas</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tipo: {selectedNode.type}</div>
                            <input className="input" value={String(selectedNode.data.label || '')} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} placeholder="Etiqueta" />
                            {selectedNode.type === 'source' && (
                                <>
                                    <input className="input" value={String(selectedNode.data.label || '')} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} placeholder="ID fuente (ej: u)" />
                                    <select
                                        className="input"
                                        value={String(selectedNode.data.table || '')}
                                        onChange={(e) => {
                                            updateNodeData(selectedNode.id, { table: e.target.value, summary: `${selectedNode.data.label || 'src'} -> ${e.target.value}` });
                                            ensureColumns(e.target.value);
                                        }}
                                    >
                                        <option value="">Selecciona tabla</option>
                                        {tables.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                </>
                            )}
                            {selectedNode.type === 'join' && (
                                <>
                                    <select className="input" value={String(selectedNode.data.type || 'left')} onChange={(e) => updateNodeData(selectedNode.id, { type: e.target.value })}>
                                        <option value="left">LEFT</option>
                                        <option value="inner">INNER</option>
                                    </select>
                                    <div style={{ fontSize: 12, fontWeight: 700 }}>Lado izquierdo</div>
                                    <select className="input" value={String(selectedNode.data.leftSource || '')} onChange={(e) => updateNodeData(selectedNode.id, { leftSource: e.target.value })}>
                                        <option value="">Fuente</option>
                                        {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.leftColumn || '')} onChange={(e) => updateNodeData(selectedNode.id, { leftColumn: e.target.value })}>
                                        <option value="">Columna</option>
                                        {sourceColumns(selectedNode.data.leftSource).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <div style={{ fontSize: 12, fontWeight: 700 }}>Lado derecho</div>
                                    <select className="input" value={String(selectedNode.data.rightSource || '')} onChange={(e) => updateNodeData(selectedNode.id, { rightSource: e.target.value })}>
                                        <option value="">Fuente</option>
                                        {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.rightColumn || '')} onChange={(e) => updateNodeData(selectedNode.id, { rightColumn: e.target.value })}>
                                        <option value="">Columna</option>
                                        {sourceColumns(selectedNode.data.rightSource).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </>
                            )}
                            {selectedNode.type === 'filter' && (
                                <>
                                    <select className="input" value={String(selectedNode.data.source || '')} onChange={(e) => updateNodeData(selectedNode.id, { source: e.target.value })}>
                                        <option value="">Fuente</option>
                                        {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.column || '')} onChange={(e) => updateNodeData(selectedNode.id, { column: e.target.value })}>
                                        <option value="">Columna</option>
                                        {sourceColumns(selectedNode.data.source).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.operator || 'eq')} onChange={(e) => updateNodeData(selectedNode.id, { operator: e.target.value })}>
                                        <option value="eq">=</option>
                                        <option value="neq">!=</option>
                                        <option value="gt">&gt;</option>
                                        <option value="gte">&gt;=</option>
                                        <option value="lt">&lt;</option>
                                        <option value="lte">&lt;=</option>
                                        <option value="in">IN (a,b,c)</option>
                                        <option value="between">BETWEEN (a,b)</option>
                                        <option value="is_null">IS NULL</option>
                                    </select>
                                    <input className="input" value={String(selectedNode.data.value || '')} onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })} placeholder="Valor" />
                                </>
                            )}
                            {selectedNode.type === 'dimension' && (
                                <>
                                    <input className="input" value={String(selectedNode.data.id || '')} onChange={(e) => updateNodeData(selectedNode.id, { id: e.target.value })} placeholder="id dimension" />
                                    <select className="input" value={String(selectedNode.data.source || '')} onChange={(e) => updateNodeData(selectedNode.id, { source: e.target.value })}>
                                        <option value="">Fuente</option>
                                        {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.column || '')} onChange={(e) => updateNodeData(selectedNode.id, { column: e.target.value })}>
                                        <option value="">Columna</option>
                                        {sourceColumns(selectedNode.data.source).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </>
                            )}
                            {selectedNode.type === 'measure' && (
                                <>
                                    <input className="input" value={String(selectedNode.data.id || '')} onChange={(e) => updateNodeData(selectedNode.id, { id: e.target.value })} placeholder="id medida" />
                                    <select className="input" value={String(selectedNode.data.op || 'count')} onChange={(e) => updateNodeData(selectedNode.id, { op: e.target.value })}>
                                        <option value="count">count</option>
                                        <option value="sum">sum</option>
                                        <option value="avg">avg</option>
                                        <option value="min">min</option>
                                        <option value="max">max</option>
                                        <option value="count_true">count_true</option>
                                        <option value="percent_true">percent_true</option>
                                    </select>
                                    <select className="input" value={String(selectedNode.data.refSource || '')} onChange={(e) => updateNodeData(selectedNode.id, { refSource: e.target.value })}>
                                        <option value="">Fuente referencia</option>
                                        {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                    <select className="input" value={String(selectedNode.data.refColumn || '')} onChange={(e) => updateNodeData(selectedNode.id, { refColumn: e.target.value })}>
                                        <option value="">Columna referencia</option>
                                        {sourceColumns(selectedNode.data.refSource).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </>
                            )}
                            {selectedNode.type === 'output' && (
                                <>
                                    <input className="input" value={String(selectedNode.data.chartTitle || '')} onChange={(e) => updateNodeData(selectedNode.id, { chartTitle: e.target.value })} placeholder="Titulo chart" />
                                    <select className="input" value={String(selectedNode.data.chartType || 'bar')} onChange={(e) => updateNodeData(selectedNode.id, { chartType: e.target.value })}>
                                        <option value="bar">Barra</option>
                                        <option value="line">Linea</option>
                                        <option value="area">Area</option>
                                        <option value="donut">Donut</option>
                                        <option value="radar">Radar</option>
                                        <option value="scatter">Scatter</option>
                                    </select>
                                    <input className="input" type="number" value={Number(selectedNode.data.limit || 200)} onChange={(e) => updateNodeData(selectedNode.id, { limit: Number(e.target.value || 200) })} />
                                </>
                            )}
                            <button className="btn btn-ghost" onClick={() => {
                                setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
                                setEdges((prev) => prev.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                                setSelectedNode(null);
                            }}>Eliminar nodo</button>
                        </div>
                    )}
                    <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => setNodes((n) => n.concat(blankNode('source', `Fuente ${n.length + 1}`, 120, 120)))}>
                        <Plus size={14} /> Agregar fuente rapida
                    </button>
                </div>
            </div>
        </div>
    );
}
