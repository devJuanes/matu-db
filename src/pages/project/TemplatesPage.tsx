import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { templatesAPI } from '../../lib/api';
import {
    Mail, Plus, Trash2, Edit2, Send, X, Save,
    RefreshCw, Copy, Check, Code, Zap, Hash,
    Variable, FileText, ChevronRight, CheckCircle2,
    Info, ExternalLink, Terminal, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
    id: string;
    name: string;
    slug: string;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
}

const slugifyOptions = (text: string) => {
    return text.toLowerCase()
        .replace(/[^\w-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function TemplatesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadTemplates();
    }, [projectId]);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await templatesAPI.list(projectId!);
            setTemplates(res.data.data.templates);
        } catch (err: any) {
            toast.error('Error al cargar plantillas');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingTemplate?.name || !editingTemplate?.slug || !editingTemplate?.subject || !editingTemplate?.body) {
            return toast.error('Todos los campos son obligatorios');
        }

        try {
            if (editingTemplate.id) {
                await templatesAPI.update(projectId!, editingTemplate.id, editingTemplate);
                toast.success('Plantilla actualizada con éxito');
            } else {
                await templatesAPI.create(projectId!, editingTemplate);
                toast.success('Nueva plantilla generada');
            }
            setIsModalOpen(false);
            loadTemplates();
        } catch (err: any) {
            toast.error('Error al procesar la plantilla');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar permanentemente esta plantilla? Esta acción no se puede deshacer.')) return;
        try {
            await templatesAPI.delete(projectId!, id);
            toast.success('Plantilla eliminada');
            loadTemplates();
        } catch (err: any) {
            toast.error('Error al eliminar');
        }
    };

    const handleSendTest = async (templateSlug: string) => {
        if (!testEmail) return toast.error('Ingresa un correo de destino');
        setSendLoading(true);
        try {
            await templatesAPI.send(projectId!, {
                templateSlug,
                to: testEmail,
                variables: { name: 'Usuario de Prueba' }
            });
            toast.success('Correo de prueba despachado');
        } catch (err: any) {
            toast.error('Error al enviar el correo');
        } finally {
            setSendLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Copiado al portapapeles');
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Compilando plantillas...</span>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Mail size={14} /> Gestión de Correo
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Plantillas de Email</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 640 }}>
                        Diseña y personaliza las comunicaciones automatizadas de tu negocio.
                        Usa variables dinámicas como <code>{`{{name}}`}</code> para personalizar cada envío.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingTemplate({}); setIsModalOpen(true); }} style={{ height: 44, padding: '0 24px', gap: 10 }}>
                    <Plus size={18} /> Nueva Plantilla
                </button>
            </div>

            {templates.length === 0 ? (
                <div style={{ padding: '100px 40px', textAlign: 'center', background: 'var(--bg-surface)', border: '2px dashed var(--border)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 28, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        <Mail size={40} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sin plantillas de correo</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>Comienza creando una plantilla para notificaciones de bienvenida, recuperación o reportes.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
                    {templates.map(t => (
                        <div key={t.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Card Top */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={18} color="var(--brand)" />
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '24px', flex: 1 }}>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Hash size={12} color="var(--text-muted)" />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identificador (Slug)</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--brand)', background: 'var(--bg-base)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 600 }}>
                                            {t.slug}
                                        </div>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copyToClipboard(t.slug, t.id + '-slug')}>
                                            {copiedId === t.id + '-slug' ? <CheckCircle2 size={14} color="var(--brand)" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Terminal size={12} color="var(--text-muted)" />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Código de Implementación</span>
                                    </div>
                                    <div style={{ position: 'relative', background: '#0f172a', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                        <pre style={{ margin: 0, padding: '14px', fontSize: 11, color: '#f8fafc', overflowX: 'auto', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                                            <span style={{ color: '#6366f1' }}>await</span> matu.templates.<span style={{ color: '#10b981' }}>send</span>({`
  '${t.slug}',
  'destinatario@mail.com',
  { name: 'Usuario' }
`});
                                        </pre>
                                        <button
                                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                                            onClick={() => copyToClipboard(`await matu.templates.send('${t.slug}', 'user@email.com', { name: 'John' });`, t.id + '-code')}
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <FileText size={12} color="var(--text-muted)" />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estructura del Mensaje</span>
                                    </div>
                                    <div style={{ background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border)', padding: '12px' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{t.subject}</div>
                                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, opacity: 0.7 }}>
                                            {t.body.replace(/<[^>]*>/g, '').substring(0, 80)}...
                                        </p>
                                    </div>
                                </div>

                                {/* Test Form */}
                                <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                                    <input
                                        className="input"
                                        placeholder="Correo de prueba..."
                                        style={{ height: 38, fontSize: 12, flex: 1, background: 'var(--bg-surface)' }}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-outline btn-sm"
                                        style={{ height: 38, padding: '0 16px', gap: 8, fontSize: 12, fontWeight: 700 }}
                                        disabled={sendLoading}
                                        onClick={() => handleSendTest(t.slug)}
                                    >
                                        <Send size={14} /> Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Template Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 700, padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit2 size={20} color="var(--brand)" />
                                </div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{editingTemplate?.id ? 'Editar Plantilla' : 'Generar Nueva Plantilla'}</h2>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Nombre del Evento</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ej: Registro Completo"
                                        value={editingTemplate?.name || ''}
                                        onChange={e => {
                                            const name = e.target.value;
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                name,
                                                slug: slugifyOptions(name)
                                            });
                                        }}
                                        style={{ height: 44 }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Identificador (Automático)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        disabled
                                        style={{ height: 44, background: 'var(--bg-base)', color: 'var(--brand)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                                        value={editingTemplate?.slug || ''}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Asunto del Correo</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Hola {{name}}, ¡bienvenido a bordo!"
                                    value={editingTemplate?.subject || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    style={{ height: 44 }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700 }}>Contenido HTML / Texto</label>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Variable size={10} /> {`{{var}}`} para inyección</span>
                                    </div>
                                </div>
                                <textarea
                                    className="input"
                                    rows={10}
                                    style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '16px', lineHeight: 1.6 }}
                                    placeholder="Construye tu mensaje aquí..."
                                    value={editingTemplate?.body || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 32 }}>
                                <Info size={14} color="var(--brand)" />
                                Puedes usar HTML para dar formato enriquecido a tus correos.
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost" style={{ height: 44, padding: '0 24px' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} style={{ height: 44, padding: '0 24px', gap: 10 }}>
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
