import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { templatesAPI } from '../../lib/api';
import { Mail, Plus, Trash2, Edit2, Send, X, Save, RefreshCw, Copy, Check } from 'lucide-react';
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

const slugify = (text: string) => {
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
            toast.error('Error al cargar plantillas: ' + (err.response?.data?.error || err.message));
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
                toast.success('Plantilla actualizada');
            } else {
                await templatesAPI.create(projectId!, editingTemplate);
                toast.success('Plantilla creada');
            }
            setIsModalOpen(false);
            loadTemplates();
        } catch (err: any) {
            toast.error('Error al guardar: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
        try {
            await templatesAPI.delete(projectId!, id);
            toast.success('Plantilla eliminada');
            loadTemplates();
        } catch (err: any) {
            toast.error('Error al eliminar: ' + (err.response?.data?.error || err.message));
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
            toast.success('Correo de prueba enviado');
        } catch (err: any) {
            toast.error('Error al enviar: ' + (err.response?.data?.error || err.message));
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

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><RefreshCw className="spinner" size={32} /></div>;

    return (
        <div style={{ padding: 28 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Email Templates</h1>
                    <p className="page-subtitle">Crea y gestiona plantillas para automatizar tus correos electrónicos.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingTemplate({}); setIsModalOpen(true); }}>
                    <Plus size={16} /> Nueva Plantilla
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                {templates.map(t => (
                    <div key={t.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-overlay)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={16} color="var(--brand)" />
                                </div>
                                <div style={{ fontWeight: 700 }}>{t.name}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }}>
                                    <Edit2 size={14} />
                                </button>
                                <button className="btn btn-ghost btn-sm" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Slug / ID</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', background: 'rgba(99, 102, 241, 0.05)', color: 'var(--brand)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        {t.slug}
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: 4, width: 28, height: 28 }}
                                        onClick={() => copyToClipboard(t.slug, t.id + '-slug')}
                                    >
                                        {copiedId === t.slug ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>SDK Usage</label>
                                <div style={{ position: 'relative', background: '#0d0d12', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                                    <pre style={{ margin: 0, padding: '12px 14px', fontSize: 11, color: '#a5b4fc', overflowX: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
                                        {`await matu.templates.send(\n  '${t.slug}',\n  'user@email.com',\n  { name: 'John' }\n);`}
                                    </pre>
                                    <button
                                        style={{ position: 'absolute', top: 8, right: 8, padding: 4, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer' }}
                                        onClick={() => copyToClipboard(`await matu.templates.send('${t.slug}', 'user@email.com', { name: 'John' });`, t.id + '-code')}
                                    >
                                        {copiedId === t.id + '-code' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Subject</label>
                                <div style={{ fontSize: 13, background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                    {t.subject}
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Body Snippet</label>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {t.body.substring(0, 100)}...
                                </div>
                            </div>

                            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8 }}>
                                <input
                                    type="email"
                                    placeholder="Test email address"
                                    style={{ flex: 1, height: 32, fontSize: 12 }}
                                    className="input"
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                                <button
                                    className="btn btn-sm"
                                    style={{ height: 32, gap: 6 }}
                                    disabled={sendLoading}
                                    onClick={() => handleSendTest(t.slug)}
                                >
                                    <Send size={12} /> Test
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content card" style={{ width: 600, padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editingTemplate?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <div className="form-group">
                                <label>Nombre de la Plantilla</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="ej: Pedido Confirmado"
                                    value={editingTemplate?.name || ''}
                                    onChange={e => {
                                        const name = e.target.value;
                                        const updates: any = { name };
                                        // Siempre autogeneramos el slug a partir del nombre
                                        updates.slug = slugify(name);
                                        setEditingTemplate({ ...editingTemplate, ...updates });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Asunto</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Bienvenido a {{name}}"
                                    value={editingTemplate?.subject || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cuerpo (HTML soportado)</label>
                                <textarea
                                    className="input"
                                    rows={10}
                                    style={{ fontFamily: 'monospace', fontSize: 13 }}
                                    placeholder="Hola {{name}}, ¡bienvenido! <br> Tu correo es: {{email}}"
                                    value={editingTemplate?.body || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                />
                            </div>
                            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} style={{ gap: 8 }}>
                                    <Save size={16} /> Guardar Plantilla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
