import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { automationsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Zap, Trash2, Edit3, Settings, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AutomationsList() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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

    const toggleStatus = async (automation: any) => {
        const newStatus = automation.status === 'active' ? 'inactive' : 'active';
        try {
            await automationsAPI.update(projectId!, automation.id, { status: newStatus });
            setAutomations(prev => prev.map(a => a.id === automation.id ? { ...a, status: newStatus } : a));
            toast.success(`Automatización ${newStatus === 'active' ? 'activada' : 'desactivada'}`);
        } catch {
            toast.error('Error al cambiar de estado');
        }
    };

    return (
        <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                            <Zap size={20} />
                        </div>
                        Automatizaciones
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>Construye flujos de trabajo visuales basados en eventos.</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ gap: 8, height: 40, padding: '0 16px', borderRadius: 10 }}>
                    {creating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Plus size={16} />}
                    Crear Flujo
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <span className="spinner" style={{ width: 32, height: 32 }} />
                </div>
            ) : automations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Zap size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                    <h3 style={{ fontSize: 18, margin: '0 0 8px' }}>Sin Automatizaciones</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Comienza creando tu primer flujo de trabajo interactivo.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {automations.map(auto => (
                        <div key={auto.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16,
                            transition: 'all 0.2s',
                        }} className="hover-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: auto.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: auto.status === 'active' ? '#10b981' : 'rgba(255,255,255,0.4)'
                                }}>
                                    {auto.status === 'active' ? <Play size={20} fill="currentColor" /> : <Settings size={20} />}
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{auto.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: auto.status === 'active' ? '#10b981' : '#f59e0b' }} />
                                            {auto.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <span>•</span>
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 10 }}>{auto.trigger_type}</span>
                                        <span>•</span>
                                        <span>Modificado hace {formatDistanceToNow(new Date(auto.updated_at), { addSuffix: true, locale: es })}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button className="btn btn-ghost" onClick={() => toggleStatus(auto)} style={{ padding: '8px 12px', fontSize: 13, color: auto.status === 'active' ? '#f59e0b' : '#10b981' }}>
                                    {auto.status === 'active' ? 'Pausar' : 'Activar'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate(`/project/${projectId}/automations/${auto.id}`)} style={{ width: 36, height: 36, padding: 0 }}>
                                    <Edit3 size={16} />
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDelete(auto.id)} style={{ width: 36, height: 36, padding: 0, background: 'transparent', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .hover-card:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
