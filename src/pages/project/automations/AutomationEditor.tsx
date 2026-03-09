import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Handle,
    Position
} from '@xyflow/react';
import type { Connection, Edge, NodeChange, EdgeChange, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { automationsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Zap, Mail, Database, Globe, Split, MessageSquare, ClipboardList, X } from 'lucide-react';

// --- Custom Nodes Definition ---

// Trigger Node
const TriggerNode = ({ data, isConnectable }: any) => {
    return (
        <div style={{
            background: 'rgba(20,20,25,0.95)', border: '1px solid #6366f1', borderRadius: 12, width: 220, overflow: 'hidden', boxShadow: '0 4px 20px rgba(99,102,241,0.2)'
        }}>
            <div style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', padding: '10px 14px', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} fill="currentColor" /> {data.label}
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {data.description || 'Configura el evento que inicia el flujo.'}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 10, height: 10, background: '#8b5cf6', borderColor: '#fff' }} />
        </div>
    );
};

// Table Trigger Node
const TableTriggerNode = ({ data, isConnectable }: any) => {
    return (
        <div style={{
            background: 'rgba(20,20,25,0.95)', border: '1px solid #10b981', borderRadius: 12, width: 220, overflow: 'hidden', boxShadow: '0 4px 20px rgba(16,185,129,0.2)'
        }}>
            <div style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', padding: '10px 14px', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={14} /> {data.label}
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {data.tableName ? `Tabla: ${data.tableName}` : 'Selecciona una tabla...'}
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>Evento: {data.event || 'Cualquiera'}</div>
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 10, height: 10, background: '#10b981', borderColor: '#fff' }} />
        </div>
    );
};

// Condition Node (Split)
const ConditionNode = ({ data, isConnectable }: any) => {
    const operatorLabel = (op: string) => {
        switch (op) {
            case 'eq': return '==';
            case 'neq': return '!=';
            case 'gt': return '>';
            case 'lt': return '<';
            case 'contains': return 'contiene';
            default: return op || '??';
        }
    };
    return (
        <div style={{
            background: 'rgba(20,20,25,0.95)', border: '1px solid #f59e0b', borderRadius: 12, width: 220, overflow: 'hidden', boxShadow: '0 4px 20px rgba(245,158,11,0.2)'
        }}>
            <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ width: 10, height: 10, background: '#f59e0b', borderColor: '#fff' }} />
            <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px 14px', color: '#f59e0b', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Split size={14} /> {data.label}
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                {data.field ? (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ color: '#fff' }}>{data.field}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{operatorLabel(data.operator)}</span>
                        <span style={{ color: 'rgba(255,255,255,0.9)' }}>{data.value || '...'}</span>
                    </div>
                ) : 'Configura la condición'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 10px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Handle type="source" position={Position.Bottom} id="true" isConnectable={isConnectable} style={{ left: '25%', background: '#10b981' }} />
                    <span style={{ fontSize: 9, color: '#10b981' }}>SI</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Handle type="source" position={Position.Bottom} id="false" isConnectable={isConnectable} style={{ left: '75%', background: '#ef4444' }} />
                    <span style={{ fontSize: 9, color: '#ef4444' }}>NO</span>
                </div>
            </div>
        </div>
    );
};

// Action Node
const ActionNode = ({ data, isConnectable }: any) => {
    const Icon = data.icon === 'mail' ? Mail : data.icon === 'database' ? Database : data.icon === 'whatsapp' ? MessageSquare : Globe;
    return (
        <div style={{
            background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, width: 220, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ width: 10, height: 10, background: '#3b82f6', borderColor: '#fff' }} />
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} /> {data.label}
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {data.description || 'Acción a ejecutar'}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ width: 10, height: 10, background: '#3b82f6', borderColor: '#fff' }} />
        </div>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    tableTrigger: TableTriggerNode,
    action: ActionNode,
    condition: ConditionNode
};

// --- Initial Setup ---
const initialNodes: Node[] = [
    { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Webhook Recibido', description: 'Se dispara vía solicitud HTTP POST.' } }
];

export default function AutomationEditor() {
    const { projectId, automationId } = useParams<{ projectId: string, automationId: string }>();
    const navigate = useNavigate();

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
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

    const onNodeClick = useCallback(async (_: any, node: Node) => {
        setSelectedNode(node);
        // If it's a node that depends on a table, load columns
        const tableName = node.data.tableName as string;
        if (tableName) {
            loadColumns(tableName);
        }
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
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }, eds)),
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
            toast.success('Guardado correctamente');
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const addNode = (type: string, label: string, icon: string, description?: string) => {
        const initialData: any = {
            label,
            icon,
            description: description || 'Configura esta acción en detalle'
        };

        // Default properties for specific nodes
        if (type === 'tableTrigger') {
            initialData.event = 'INSERT';
        } else if (type === 'condition') {
            initialData.operator = 'eq';
            initialData.value = '';
        } else if (icon === 'mail') {
            initialData.to = '{user_email}';
            initialData.subject = 'Notificación de MatuDB';
        }

        const newNode: Node = {
            id: `node_${Date.now()}`,
            type,
            position: { x: Math.random() * 200 + 300, y: Math.random() * 200 + 100 },
            data: initialData
        };
        setNodes((nds) => nds.concat(newNode));
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}><span className="spinner" /></div>;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Topbar Editor */}
            <div style={{
                height: 60, flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0c', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/project/${projectId}/automations`)} style={{ padding: '0 8px' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{
                            background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, outline: 'none',
                            padding: '4px 8px', borderRadius: 6
                        }}
                        onFocus={e => (e.target.style.background = 'rgba(255,255,255,0.05)')}
                        onBlur={e => (e.target.style.background = 'transparent')}
                    />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={loadLogs} style={{ gap: 8, color: 'rgba(255,255,255,0.6)' }}>
                        <ClipboardList size={14} /> Historial
                    </button>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                        style={{
                            background: status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${status === 'active' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                            color: status === 'active' ? '#10b981' : 'rgba(255,255,255,0.6)',
                            fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, outline: 'none'
                        }}
                    >
                        <option value="inactive">Inactiva</option>
                        <option value="active">Activa</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} style={{ gap: 8, padding: '0 16px' }}>
                        {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
                        Guardar Flujo
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>

                {/* Tools Sidebar */}
                <div style={{
                    width: 250, background: '#070709', borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', zIndex: 5
                }}>
                    <div style={{ padding: '20px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}>
                        Disparadores (Triggers)
                    </div>
                    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="tool-btn" onClick={() => addNode('tableTrigger', 'Evento de Tabla', 'list', 'Se activa al insertar o editar datos en una tabla.')}>
                            <div className="icon-box"><ClipboardList size={14} /></div> Cambio en Tabla
                        </button>
                        <button className="tool-btn" onClick={() => addNode('trigger', 'Webhook Externo', 'globe', 'Se dispara vía URL pública.')}>
                            <div className="icon-box"><Globe size={14} /></div> Webhook (URL)
                        </button>
                    </div>

                    <div style={{ padding: '24px 16px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}>
                        Acciones y Lógica
                    </div>
                    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="tool-btn" onClick={() => addNode('condition', 'Condición (Si/No)', 'split', 'Bifurca el flujo según una regla.')}>
                            <div className="icon-box" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}><Split size={14} /></div> Si / Entonces
                        </button>
                        <button className="tool-btn" onClick={() => addNode('action', 'WhatsApp', 'whatsapp', 'Envía un mensaje vía WhatsApp.')}>
                            <div className="icon-box" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}><MessageSquare size={14} /></div> Enviar WhatsApp
                        </button>
                        <button className="tool-btn" onClick={() => addNode('action', 'Petición HTTP', 'globe')}>
                            <div className="icon-box"><Globe size={14} /></div> Llamada HTTP
                        </button>
                        <button className="tool-btn" onClick={() => addNode('action', 'Enviar Correo', 'mail')}>
                            <div className="icon-box"><Mail size={14} /></div> Enviar Email
                        </button>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                            Arrastra y conecta los nodos para definir la secuencia lógica de tu automatización.
                        </div>
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div style={{ flex: 1, background: '#040405', position: 'relative' }}>
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
                        <Background color="#1f1f2e" gap={16} size={1} />
                        <Controls style={{ display: 'flex', flexDirection: 'row', bottom: 16, right: 16, top: 'auto', left: 'auto', background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }} />
                    </ReactFlow>

                    {/* Node Config Panel */}
                    {selectedNode && (
                        <div style={{
                            position: 'absolute', top: 0, right: 0, bottom: 0, width: 350,
                            background: '#070709', borderLeft: '1px solid rgba(255,255,255,0.1)',
                            zIndex: 20, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                        }}>
                            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Configurar {(selectedNode.data.label as string) || 'Nodo'}</div>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedNode(null)}><X size={16} /></button>
                            </div>

                            <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                                {/* Dynamic Fields based on Type */}
                                {selectedNode.type === 'trigger' && (
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
                                        <p>Este nodo se activa cuando recibes una petición <strong>POST</strong> en la URL del Webhook.</p>
                                        <p style={{ marginTop: 12 }}>Puedes dispararlo desde servicios externos como Zapier, Make o tu propia aplicación.</p>
                                        <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', marginBottom: 8 }}>Tip: variables</div>
                                            Usa las variables de la petición con llaves: <code style={{ color: '#fff' }}>{`{campo}`}</code>
                                        </div>
                                    </div>
                                )}

                                {selectedNode.type === 'tableTrigger' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Tabla del Proyecto</label>
                                            <select className="input-field" value={(selectedNode.data.tableName as string) || ''} onChange={e => {
                                                updateNodeData({ tableName: e.target.value });
                                                loadColumns(e.target.value);
                                            }}>
                                                <option value="">Selecciona una tabla...</option>
                                                {projectTables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Evento</label>
                                            <select className="input-field" value={(selectedNode.data.event as string) || 'INSERT'} onChange={e => updateNodeData({ event: e.target.value })}>
                                                <option value="INSERT">Nuevo Registro (INSERT)</option>
                                                <option value="UPDATE">Actualización (UPDATE)</option>
                                                <option value="DELETE">Eliminación (DELETE)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {selectedNode.type === 'condition' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Campo a evaluar</label>
                                            <select className="input-field" value={(selectedNode.data.field as string) || ''} onChange={e => updateNodeData({ field: e.target.value })}>
                                                <option value="">Selecciona campo...</option>
                                                {currentTableColumns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                            <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.3)' }}>
                                                Puedes escribir el nombre manualmente si el disparador es un Webhook.
                                            </div>
                                            <input className="input-field" style={{ marginTop: 8 }} value={(selectedNode.data.field as string) || ''} onChange={e => updateNodeData({ field: e.target.value })} placeholder="O escribe manual..." />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Operador</label>
                                            <select className="input-field" value={(selectedNode.data.operator as string) || 'eq'} onChange={e => updateNodeData({ operator: e.target.value })}>
                                                <option value="eq">Es igual a (==)</option>
                                                <option value="neq">No es igual a (!=)</option>
                                                <option value="gt">Mayor que (&gt;)</option>
                                                <option value="lt">Menor que (&lt;)</option>
                                                <option value="contains">Contiene Texto</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Valor esperado</label>
                                            <input className="input-field" value={(selectedNode.data.value as string) || ''} onChange={e => updateNodeData({ value: e.target.value })} placeholder="ej: cancelada" />
                                        </div>
                                    </div>
                                )}

                                {selectedNode.data.icon === 'whatsapp' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Número de Teléfono</label>
                                            <input className="input-field" value={(selectedNode.data.phone as string) || ''} onChange={e => updateNodeData({ phone: e.target.value })} placeholder="ej: 57300..." />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Mensaje Personalizado</label>
                                            <textarea className="input-field" style={{ height: 100 }} value={(selectedNode.data.message as string) || ''} onChange={e => updateNodeData({ message: e.target.value })} placeholder="Usa {campo} para insertar datos de la tabla..." />
                                        </div>
                                    </div>
                                )}

                                {selectedNode.data.icon === 'mail' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Destinatario (Email)</label>
                                            <input className="input-field" value={(selectedNode.data.to as string) || ''} onChange={e => updateNodeData({ to: e.target.value })} placeholder="Email o {user_email}" />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Asunto</label>
                                            <input className="input-field" value={(selectedNode.data.subject as string) || ''} onChange={e => updateNodeData({ subject: e.target.value })} placeholder="Asunto del correo" />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Cuerpo del Mensaje</label>
                                            <textarea className="input-field" style={{ height: 120 }} value={(selectedNode.data.body as string) || ''} onChange={e => updateNodeData({ body: e.target.value })} placeholder="Contenido del correo..." />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button className="btn btn-danger btn-block btn-sm" onClick={() => {
                                    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                                    setSelectedNode(null);
                                }}>Borrar Nodo</button>
                            </div>
                        </div>
                    )}

                    {/* Quick helper badge for Webhook URL */}
                    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>URL de Webhook</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', userSelect: 'all', cursor: 'text', fontFamily: 'monospace' }}>
                                /api/projects/{projectId}/automations/{automationId}/webhook
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showLogs && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
                }}>
                    <div style={{
                        background: '#1a1a1f', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '80vh',
                        display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 18 }}>Historial de Ejecución</h3>
                            <button onClick={() => setShowLogs(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '0 24px', overflowY: 'auto', flex: 1 }}>
                            {logs.length === 0 ? (
                                <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No hay ejecuciones registradas.</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase' }}>
                                            <th style={{ padding: '16px 8px' }}>Fecha</th>
                                            <th style={{ padding: '16px 8px' }}>Estado</th>
                                            <th style={{ padding: '16px 8px' }}>Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log: any) => (
                                            <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{new Date(log.executed_at).toLocaleString()}</td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                        background: log.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: log.status === 'success' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {log.status === 'success' ? 'ÉXITO' : 'ERROR'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <pre style={{ margin: 0, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                                                        {JSON.stringify(log.log_data)}
                                                    </pre>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div style={{ padding: 24, textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button className="btn btn-ghost" onClick={() => setShowLogs(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .tool-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 10px 12px;
                    border-radius: 10px;
                    color: rgba(255,255,255,0.8);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .tool-btn:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(99,102,241,0.4);
                    color: #fff;
                    transform: translateX(2px);
                }
                .tool-btn .icon-box {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.6);
                    transition: all 0.2s;
                }
                .tool-btn:hover .icon-box {
                    background: var(--brand);
                    color: #fff;
                }
                .react-flow__panel.react-flow__controls {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 10px 12px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: var(--brand);
                    background: rgba(255,255,255,0.05);
                }
                select.input-field option {
                    background: #0a0a0c;
                    color: #fff;
                }
            `}</style>
        </div>
    );
};
