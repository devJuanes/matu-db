import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { automationsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import {
    Plus, Zap, Trash2, Edit3, Settings,
    Clock, Activity, ChevronRight,
    Sparkles, Layout, ToggleLeft, ToggleRight, Upload, Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AutomationsList() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const loadAutomations = async () => {
        try {
            setLoading(true);
            const res = await automationsAPI.list(projectId!);
            setAutomations(res.data.data);
        } catch (err) {
            toast.error('Error al cargar automatizaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAutomations();
    }, [projectId]);

    const handleCreate = async () => {
        try {
            setCreating(true);
            const res = await automationsAPI.create(projectId!, {
                name: 'Nueva Automatización',
                trigger_type: 'webhook',
                status: 'inactive'
            });
            toast.success('Automatización creada');
            navigate(`/project/${projectId}/automations/${res.data.data.id}`);
        } catch (err) {
            toast.error('No se pudo crear la automatización');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta automatización?')) return;
        try {
            await automationsAPI.delete(projectId!, id);
            toast.success('Eliminada correctamente');
            loadAutomations();
        } catch {
            toast.error('Error al eliminar');
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
            loadAutomations();
            if (newId) navigate(`/project/${projectId}/automations/${newId}`);
        } catch {
            toast.error('No se pudo importar el JSON');
        }
    };

    const handleExport = async (id: string, flowName: string) => {
        try {
            const res = await automationsAPI.export(projectId!, id);
            const payload = res.data.data;
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `flow-${(flowName || 'automation').replace(/\s+/g, '-')}-${id.slice(0, 8)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('JSON descargado');
        } catch {
            toast.error('No se pudo exportar');
        }
    };

    const toggleStatus = async (automation: any) => {
        const newStatus = automation.status === 'active' ? 'inactive' : 'active';
        try {
            await automationsAPI.update(projectId!, automation.id, { status: newStatus });
            setAutomations(prev => prev.map(a => a.id === automation.id ? { ...a, status: newStatus } : a));
            toast.success(`Workflow ${newStatus === 'active' ? 'desplegado' : 'en pausa'}`);
        } catch {
            toast.error('Error al cambiar de estado');
        }
    };

    return (
        <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                        <Zap size={14} /> Motor de Flujos
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>Automatizaciones</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 16 }}>Construye arquitecturas reactivas y flujos lógicos potentes.</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
                    <input ref={importInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => importInputRef.current?.click()}
                        style={{ height: 48, padding: '0 20px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center' }}
                    >
                        <Upload size={18} /> Importar JSON
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                        disabled={creating}
                        style={{
                            gap: 10,
                            height: 48,
                            padding: '0 24px',
                            borderRadius: 14,
                            fontWeight: 700,
                            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        {creating ? <span className="spinner-sm" style={{ width: 18, height: 18 }} /> : <Plus size={20} />}
                        Crear Algoritmo
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 20 }}>
                    <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                    <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Sincronizando procesos...</span>
                </div>
            ) : automations.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    background: 'var(--bg-surface)',
                    borderRadius: 32,
                    border: '2px dashed var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 24
                }}>
                    <div style={{ width: 80, height: 80, borderRadius: 28, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Zap size={40} style={{ opacity: 0.3 }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>El motor está inactivo</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 320, lineHeight: 1.6 }}>Crea tu primer flujo para automatizar tareas repetitivas y conectar con servicios externos.</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        <button type="button" className="btn btn-outline" onClick={() => importInputRef.current?.click()} style={{ height: 40, padding: '0 24px', gap: 8, display: 'inline-flex', alignItems: 'center' }}>
                            <Upload size={16} /> Importar JSON
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleCreate} style={{ height: 40, padding: '0 24px' }}>
                            Crear primer flujo
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {automations.map(auto => {
                        const isActive = auto.status === 'active';
                        return (
                            <div key={auto.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '24px 32px', background: 'var(--bg-surface)',
                                border: '1px solid var(--border)', borderRadius: 24,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }} className="automation-card">
                                {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--brand)' }} />}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: isActive ? 'linear-gradient(135deg, var(--brand), #059669)' : 'var(--bg-base)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isActive ? '#fff' : 'var(--text-muted)',
                                        boxShadow: isActive ? '0 8px 16px rgba(16, 185, 129, 0.2)' : 'none'
                                    }}>
                                        {isActive ? <Activity size={24} /> : <Settings size={22} />}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{auto.name}</h4>
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 900,
                                                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-base)',
                                                color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                letterSpacing: '0.5px'
                                            }}>
                                                {auto.trigger_type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={14} />
                                                <span>{formatDistanceToNow(new Date(auto.updated_at || Date.now()), { addSuffix: true, locale: es })}</span>
                                            </div>
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                                            <span>v1.0.4</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div onClick={() => toggleStatus(auto)} style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '6px 14px',
                                        borderRadius: 12,
                                        background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-base)',
                                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
                                        color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                                        fontSize: 12,
                                        fontWeight: 800,
                                        transition: 'all 0.2s'
                                    }}>
                                        {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        {isActive ? 'EJECUTANDO' : 'DETENIDO'}
                                    </div>

                                    <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />

                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        title="Exportar JSON"
                                        onClick={() => handleExport(auto.id, auto.name)}
                                        style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', borderRadius: 12 }}
                                    >
                                        <Download size={18} />
                                    </button>

                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => navigate(`/project/${projectId}/automations/${auto.id}`)}
                                        style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', borderRadius: 12 }}
                                    >
                                        <Edit3 size={18} />
                                    </button>

                                    <button
                                        className="btn btn-ghost hover-danger"
                                        onClick={() => handleDelete(auto.id)}
                                        style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', borderRadius: 12, color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .automation-card:hover {
                    box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1);
                    border-color: var(--brand) !important;
                    transform: translateY(-2px);
                }
                .hover-danger:hover {
                    color: var(--danger) !important;
                    background: rgba(239, 68, 68, 0.05) !important;
                }
                .spinner-sm {
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
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
