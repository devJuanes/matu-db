import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Handle,
    Position,
    Panel
} from '@xyflow/react';
import type { Connection, Edge, NodeChange, EdgeChange, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { automationsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Save, Zap, Mail, Database, Globe, Split,
    MessageSquare, ClipboardList, X, Play, Settings, Clock,
    ChevronRight, Activity, Sparkles, Layout, Cpu,
    Layers, Link as LinkIcon, AlertCircle, Info, Trash2,
    Code, Terminal, Bell, Bot, CheckSquare, Download, Upload, PhoneCall, Smartphone
} from 'lucide-react';

// --- Custom Nodes Definition ---

const nodeHeaderStyle = (color: string) => ({
    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: '0.5px'
});

// Trigger Node
const TriggerNode = ({ data, isConnectable }: any) => (
    <div style={{
        background: 'var(--bg-surface)', border: '1px solid #3b82f6', borderRadius: 16, width: 240, overflow: 'hidden', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)'
    }}>
        <div style={nodeHeaderStyle('#3b82f6')}>
            <Zap size={14} fill="currentColor" /> {data.label?.toUpperCase()}
        </div>
        <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {data.description || 'Punto de entrada del flujo.'}
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 12, height: 12, background: '#3b82f6', border: '3px solid var(--bg-surface)' }} />
    </div>
);

// Table Trigger Node
const TableTriggerNode = ({ data, isConnectable }: any) => (
    <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--brand)', borderRadius: 16, width: 240, overflow: 'hidden', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)'
    }}>
        <div style={nodeHeaderStyle('var(--brand)')}>
            <Database size={14} /> {data.label?.toUpperCase()}
        </div>
        <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{data.tableName || 'Seleccionar tabla...'}</div>
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={10} /> {data.event || 'Cualquier cambio'}
            </div>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 12, height: 12, background: 'var(--brand)', border: '3px solid var(--bg-surface)' }} />
    </div>
);

// Condition Node (Split)
const ConditionNode = ({ data, isConnectable }: any) => {
    const operatorLabel = (op: string) => {
        switch (op) {
            case 'eq': return '==';
            case 'neq': return '!=';
            case 'gt': return '>';
            case 'lt': return '<';
            case 'contains': return 'contiene';
            case 'changed_to': return '→';
            default: return op || '??';
        }
    };
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid #f59e0b', borderRadius: 16, width: 240, overflow: 'hidden', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)'
        }}>
            <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ width: 12, height: 12, background: '#f59e0b', border: '3px solid var(--bg-surface)' }} />
            <div style={nodeHeaderStyle('#f59e0b')}>
                <Split size={14} /> {data.label?.toUpperCase()}
            </div>
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                {data.field ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)', padding: '8px', borderRadius: 10 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{data.field}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 900 }}>{operatorLabel(data.operator)}</span>
                        <span>{data.value || '...'}</span>
                    </div>
                ) : <span style={{ opacity: 0.5 }}>Definir lógica...</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 16px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Handle type="source" position={Position.Bottom} id="true" isConnectable={isConnectable} style={{ left: '50%', background: 'var(--brand)', border: '2px solid #fff' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)' }}>TRUE</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Handle type="source" position={Position.Bottom} id="false" isConnectable={isConnectable} style={{ left: '50%', background: '#ef4444', border: '2px solid #fff' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444' }}>FALSE</span>
                </div>
            </div>
        </div>
    );
};

// Action Node
const ActionNode = ({ data, isConnectable }: any) => {
    const Icon =
        data.icon === 'mail' ? Mail :
            data.icon === 'database' ? Database :
                data.icon === 'whatsapp' ? MessageSquare :
                    data.icon === 'phone' || data.icon === 'call' ? PhoneCall :
                        data.icon === 'push' || data.icon === 'notification' ? Smartphone :
                        data.icon === 'globe' ? Globe : Zap;
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: 240, overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
        }}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ width: 12, height: 12, background: 'var(--text-muted)', border: '3px solid var(--bg-surface)' }} />
            <div style={nodeHeaderStyle('#6366f1')}>
                <Icon size={14} /> {data.label?.toUpperCase()}
            </div>
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                {data.description || 'Ejecución de tarea delegada.'}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 12, height: 12, background: '#6366f1', border: '3px solid var(--bg-surface)' }} />
        </div>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    tableTrigger: TableTriggerNode,
    action: ActionNode,
    condition: ConditionNode
};

// --- Main Page ---
export default function AutomationEditor() {
    const { projectId, automationId } = useParams<{ projectId: string, automationId: string }>();
    const navigate = useNavigate();

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [projectTables, setProjectTables] = useState<any[]>([]);
    const [currentTableColumns, setCurrentTableColumns] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const importFileRef = useRef<HTMLInputElement>(null);

    const apiBase = (import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api').replace(/\/+$/, '');
    const webhookUrl = projectId && automationId
        ? `${apiBase}/projects/${projectId}/automations/${automationId}/webhook`
        : '';

    const onNodeClick = useCallback(async (_: any, node: Node) => {
        setSelectedNode(node);
        const tableName = node.data.tableName as string;
        if (tableName) loadColumns(tableName);
    }, [projectId]);

    const loadTables = async () => {
        try {
            const res = await automationsAPI.getTables(projectId!);
            setProjectTables(res.data.data);
        } catch (err) { console.error('Error loading tables', err); }
    };

    const loadColumns = async (tableName: string) => {
        try {
            const res = await automationsAPI.getTableColumns(projectId!, tableName);
            setCurrentTableColumns(res.data.data);
        } catch (err) { console.error('Error loading columns', err); }
    };

    const loadLogs = async () => {
        try {
            const res = await automationsAPI.getLogs(projectId!, automationId!);
            setLogs(res.data.data);
            setShowLogs(true);
        } catch (err) { toast.error('Error al cargar logs'); }
    };

    const updateNodeData = (data: any) => {
        if (!selectedNode) return;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );
        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...data } });
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await automationsAPI.get(projectId!, automationId!);
                const auto = res.data.data;
                setName(auto.name);
                setStatus(auto.status || 'inactive');
                if (auto.nodes_config?.nodes) setNodes(auto.nodes_config.nodes);
                if (auto.edges_config?.edges) setEdges(auto.edges_config.edges);
                loadTables();
            } catch (err) {
                toast.error('Error al cargar la automatización');
                navigate(`/project/${projectId}/automations`);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId, automationId, navigate]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--brand)', strokeWidth: 3 } }, eds)),
        []
    );

    const handleSave = async () => {
        try {
            setSaving(true);
            await automationsAPI.update(projectId!, automationId!, {
                name,
                status,
                nodes_config: { nodes },
                edges_config: { edges }
            });
            toast.success('Cambios sincronizados');
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleExportJson = async () => {
        try {
            const res = await automationsAPI.export(projectId!, automationId!);
            const payload = res.data.data;
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `flow-${(name || 'automation').replace(/\s+/g, '-')}-${automationId!.slice(0, 8)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('JSON exportado');
        } catch {
            toast.error('No se pudo exportar');
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as { data?: Record<string, unknown> } & Record<string, unknown>;
            const payload = (parsed.data ?? parsed) as Record<string, unknown>;
            if (!payload.nodes_config || !(payload.nodes_config as { nodes?: unknown }).nodes) {
                toast.error('JSON inválido: falta nodes_config.nodes');
                return;
            }
            const res = await automationsAPI.import(projectId!, payload);
            const newId = res.data.data?.id as string;
            toast.success('Flujo importado');
            if (newId) navigate(`/project/${projectId}/automations/${newId}`);
        } catch {
            toast.error('No se pudo importar el JSON');
        }
    };

    const addNode = (type: string, label: string, icon: string, description?: string) => {
        const newNode: Node = {
            id: `node_${Date.now()}`,
            type,
            position: { x: 400 + Math.random() * 50, y: 200 + Math.random() * 50 },
            data: { label, icon, description: description || 'Configuración pendiente.' }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Cargando matriz de flujo...</span>
        </div>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Topbar Editor */}
            <div style={{
                height: 72, flexShrink: 0, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <button className="btn btn-ghost" onClick={() => navigate(`/project/${projectId}/automations`)} style={{ padding: 8, borderRadius: 12 }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, outline: 'none',
                                padding: '2px 4px', letterSpacing: '-0.5px'
                            }}
                            placeholder="Nombre del Flujo"
                        />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginLeft: 4 }}>ID: {automationId?.slice(0, 8)}...</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <input ref={importFileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
                    <button type="button" className="btn btn-ghost" onClick={() => importFileRef.current?.click()} style={{ gap: 8, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <Upload size={16} /> Importar JSON
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={handleExportJson} style={{ gap: 8, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <Download size={16} /> Exportar JSON
                    </button>
                    <button className="btn btn-ghost" onClick={loadLogs} style={{ gap: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <Clock size={16} /> Auditoría
                    </button>
                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: status === 'active' ? 'var(--brand)' : 'var(--text-muted)' }}>
                            {status === 'active' ? 'EN PRODUCCIÓN' : 'EN DESARROLLO'}
                        </span>
                        <select
                            className="input"
                            value={status}
                            onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                            style={{ height: 36, padding: '0 12px', fontSize: 12, fontWeight: 700, borderRadius: 10, background: 'var(--bg-base)' }}
                        >
                            <option value="inactive">Pausado</option>
                            <option value="active">Activo</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: 10, height: 44, padding: '0 24px', fontWeight: 800, borderRadius: 12, boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                        {saving ? <span className="spinner-sm" style={{ width: 18, height: 18 }} /> : <Save size={18} />}
                        Publicar Flujo
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

                {/* Node Library Sidebar */}
                <div style={{
                    width: 280, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', zIndex: 10, overflowY: 'auto'
                }}>
                    <div style={{ padding: '24px 20px 8px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={12} /> Disparadores (Triggers)
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45, padding: '0 6px 4px' }}>
                            Puedes agregar varios triggers de tabla en un mismo flujo (modo multi-table).
                        </div>
                        <button className="node-lib-btn" onClick={() => addNode('tableTrigger', 'Evento en Tabla', 'database', 'Escucha cambios en tus datos.')}>
                            <div className="icon-wrap" style={{ color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)' }}><Database size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Tabla SQL</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>Trigger nativo DB</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('trigger', 'API Webhook', 'globe', 'Recibe datos externos.')}>
                            <div className="icon-wrap" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}><Globe size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Punto de Entrada</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>HTTP POST Request</div>
                            </div>
                        </button>
                    </div>

                    <div style={{ padding: '32px 20px 8px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Cpu size={12} /> Lógica y Acciones
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="node-lib-btn" onClick={() => addNode('condition', 'Bifurcación', 'split', 'Reglas lógicas IF/ELSE.')}>
                            <div className="icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}><Split size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Condicional</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>Lógica booleana</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('action', 'WhatsApp Cloud', 'whatsapp')}>
                            <div className="icon-wrap" style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' }}><MessageSquare size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>WhatsApp</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>Mensajería Directa</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('action', 'Notificar Email', 'mail')}>
                            <div className="icon-wrap" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}><Mail size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>SMTP Send</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>Alerta por correo</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('action', 'Llamada de Voz', 'phone', 'Genera una llamada saliente con TTS.')}>
                            <div className="icon-wrap" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.12)' }}><PhoneCall size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Llamada</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>Gateway Android TTS</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('action', 'Push MatuCall', 'push', 'Envía notificación push a la app Android gateway.')}>
                            <div className="icon-wrap" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' }}><Smartphone size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Notificación Push</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>MatuCall Gateway</div>
                            </div>
                        </button>
                        <button className="node-lib-btn" onClick={() => addNode('action', 'Integración HTTP', 'link')}>
                            <div className="icon-wrap" style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' }}><LinkIcon size={16} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>Fetch API</div>
                                <div style={{ fontSize: 10, opacity: 0.6 }}>External Request</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div style={{ flex: 1, position: 'relative', background: 'var(--bg-base)' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        colorMode="dark"
                        fitView
                    >
                        <Background color="var(--border)" gap={20} size={1} />
                        <Controls position="bottom-right" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, display: 'flex', overflow: 'hidden' }} />

                        <Panel position="top-right" style={{ pointerEvents: 'none' }}>
                            <div style={{
                                background: 'var(--bg-surface)',
                                padding: '16px 20px',
                                borderRadius: 16,
                                border: '1px solid var(--border)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 1.5s infinite' }} />
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Webhook POST</div>
                                    <code style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700, wordBreak: 'break-all', display: 'block', maxWidth: 280 }}>{webhookUrl}</code>
                                </div>
                            </div>
                        </Panel>
                    </ReactFlow>

                    {/* Node Config Panel */}
                    {selectedNode && (
                        <div style={{
                            position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
                            background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
                            zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 50px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--brand)', marginBottom: 2 }}>CONFIGURACIÓN</div>
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>{String(selectedNode.data.label ?? '')}</div>
                                </div>
                                <button className="btn btn-ghost" onClick={() => setSelectedNode(null)} style={{ padding: 8 }}><X size={20} /></button>
                            </div>

                            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {selectedNode.type === 'tableTrigger' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Tabla de Origen</label>
                                            <select className="input" value={(selectedNode.data.tableName as string) || ''} onChange={e => {
                                                updateNodeData({ tableName: e.target.value });
                                                loadColumns(e.target.value);
                                            }} style={{ height: 44 }}>
                                                <option value="">Selecciona una tabla...</option>
                                                {projectTables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Tipo de Evento</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                {['INSERT', 'UPDATE', 'DELETE', 'ALL'].map(ev => (
                                                    <button
                                                        key={ev}
                                                        onClick={() => updateNodeData({ event: ev })}
                                                        style={{
                                                            height: 38, borderRadius: 10, fontSize: 11, fontWeight: 800,
                                                            border: '1px solid var(--border)',
                                                            background: selectedNode.data.event === ev ? 'var(--brand)' : 'var(--bg-base)',
                                                            color: selectedNode.data.event === ev ? '#fff' : 'var(--text-secondary)'
                                                        }}
                                                    >
                                                        {ev}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedNode.type === 'condition' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Parámetro a evaluar</label>
                                            <input className="input" value={(selectedNode.data.field as string) || ''} onChange={e => updateNodeData({ field: e.target.value })} placeholder="ej: status o precio" style={{ height: 44 }} />
                                            {currentTableColumns.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                                    {currentTableColumns.map(c => (
                                                        <button key={c.name} onClick={() => updateNodeData({ field: c.name })} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)' }}>{c.name}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Operador Lógico</label>
                                            <select className="input" value={(selectedNode.data.operator as string) || 'eq'} onChange={e => updateNodeData({ operator: e.target.value })} style={{ height: 44 }}>
                                                <option value="eq">Igual a (==)</option>
                                                <option value="neq">Diferente de (!=)</option>
                                                <option value="gt">Mayor que (&gt;)</option>
                                                <option value="lt">Menor que (&lt;)</option>
                                                <option value="contains">Contiene el texto</option>
                                                <option value="changed_to">Cambió a (UPDATE)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Valor de Referencia</label>
                                            <input className="input" value={(selectedNode.data.value as string) || ''} onChange={e => updateNodeData({ value: e.target.value })} placeholder="Valor esperado" style={{ height: 44 }} />
                                        </div>
                                        {selectedNode.data.operator === 'changed_to' && (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                                                Solo en <strong>UPDATE</strong>: se cumple si el campo pasó de otro valor a este. Usa <code style={{ fontSize: 11 }}>__filled__</code> para disparar solo cuando el campo cambia de vacío a lleno. Requiere fila con <code style={{ fontSize: 11 }}>_old</code> en el motor (API MatuDB).
                                            </p>
                                        )}
                                    </>
                                )}

                                {selectedNode.type === 'action' && selectedNode.data.icon === 'mail' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Para (correo)</label>
                                            <input
                                                className="input"
                                                value={(selectedNode.data.to as string) || ''}
                                                onChange={e => updateNodeData({ to: e.target.value })}
                                                placeholder="{adminNotifyEmail} o {user_email}"
                                                style={{ height: 44 }}
                                            />
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.45 }}>
                                                Placeholders: <code>{'{adminNotifyEmail}'}</code> (env API), columnas de la fila como <code>{'{user_email}'}</code>, <code>{'{userName}'}</code>, etc.
                                            </p>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Asunto</label>
                                            <input
                                                className="input"
                                                value={(selectedNode.data.subject as string) || ''}
                                                onChange={e => updateNodeData({ subject: e.target.value })}
                                                placeholder="[Soporte] Nuevo chat"
                                                style={{ height: 44 }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cuerpo (texto)</label>
                                            <textarea
                                                className="input"
                                                style={{ height: 180, padding: 16, lineHeight: 1.6 }}
                                                value={(selectedNode.data.body as string) || ''}
                                                onChange={e => updateNodeData({ body: e.target.value })}
                                                placeholder={'Hola {user_name},\n\nDetalle: {id}...'}
                                            />
                                        </div>
                                    </>
                                )}

                                {selectedNode.data.icon === 'whatsapp' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Destino (WhatsApp)</label>
                                            <input className="input" value={(selectedNode.data.phone as string) || ''} onChange={e => updateNodeData({ phone: e.target.value })} placeholder="573001234567" style={{ height: 44 }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Plantilla de Mensaje</label>
                                            <textarea className="input" style={{ height: 160, padding: 16, lineHeight: 1.6 }} value={(selectedNode.data.message as string) || ''} onChange={e => updateNodeData({ message: e.target.value })} placeholder="Hola! Hemos detectado un cambio en {campo}..." />
                                        </div>
                                    </>
                                )}

                                {(selectedNode.data.icon === 'phone' || selectedNode.data.icon === 'call') && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Número destino (llamada)</label>
                                            <input
                                                className="input"
                                                value={(selectedNode.data.phone as string) || ''}
                                                onChange={e => updateNodeData({ phone: e.target.value })}
                                                placeholder="+573023580862 o {adminPhone}"
                                                style={{ height: 44 }}
                                            />
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.45 }}>
                                                Si lo dejas vacío, usa <code>{'VOICE_GATEWAY_DEFAULT_PHONE'}</code> desde la API.
                                            </p>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Texto a reproducir (TTS)</label>
                                            <textarea
                                                className="input"
                                                style={{ height: 160, padding: 16, lineHeight: 1.6 }}
                                                value={(selectedNode.data.message as string) || ''}
                                                onChange={e => updateNodeData({ message: e.target.value })}
                                                placeholder="Hola, se abrió un nuevo soporte de {clientName}. Revisa el chat en vivo."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Duración máxima (segundos)</label>
                                            <input
                                                className="input"
                                                type="number"
                                                min={5}
                                                max={120}
                                                value={Number((selectedNode.data.maxSeconds as number) || 20)}
                                                onChange={e => updateNodeData({ maxSeconds: Number(e.target.value || 20) })}
                                                style={{ height: 44 }}
                                            />
                                        </div>
                                    </>
                                )}

                                {(selectedNode.data.icon === 'push' || selectedNode.data.icon === 'notification') && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Título de notificación</label>
                                            <input
                                                className="input"
                                                value={(selectedNode.data.title as string) || ''}
                                                onChange={e => updateNodeData({ title: e.target.value })}
                                                placeholder="Nueva alerta en Torre Control"
                                                style={{ height: 44 }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Mensaje push</label>
                                            <textarea
                                                className="input"
                                                style={{ height: 160, padding: 16, lineHeight: 1.6 }}
                                                value={(selectedNode.data.message as string) || ''}
                                                onChange={e => updateNodeData({ message: e.target.value })}
                                                placeholder="Se registró una nueva nota: {title}"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Prioridad (1-100)</label>
                                            <input
                                                className="input"
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={Number((selectedNode.data.priority as number) || 50)}
                                                onChange={e => updateNodeData({ priority: Number(e.target.value || 50) })}
                                                style={{ height: 44 }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                                <button className="btn btn-primary" style={{ flex: 1, height: 44 }} onClick={() => setSelectedNode(null)}>Aplicar Cambios</button>
                                <button className="btn btn-ghost" style={{ width: 44, height: 44, padding: 0, color: 'var(--danger)' }} onClick={() => {
                                    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                                    setSelectedNode(null);
                                }}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Logs Sidebar - Professional Overlay */}
            {showLogs && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowLogs(false)}>
                    <div style={{ width: 500, height: '100%', background: 'var(--bg-surface)', boxShadow: '-20px 0 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Historial de Ejecución</h3>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Últimos 100 eventos procesados</div>
                            </div>
                            <button className="btn btn-ghost" onClick={() => setShowLogs(false)}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {logs.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay trazas de ejecución en el buffer.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {logs.map(log => (
                                        <div key={log.id} style={{ padding: '16px', borderRadius: 16, background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: log.status === 'success' ? 'var(--brand)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {log.status === 'success' ? <CheckSquare size={14} /> : <AlertCircle size={14} />}
                                                    {log.status?.toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.executed_at).toLocaleString()}</div>
                                            </div>
                                            <pre style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
                                                {JSON.stringify(log.log_data, null, 2)}
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .node-lib-btn {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                    padding: 12px;
                    border-radius: 14px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .node-lib-btn:hover {
                    background: var(--bg-base);
                    border-color: var(--border);
                }
                .node-lib-btn .icon-wrap {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
