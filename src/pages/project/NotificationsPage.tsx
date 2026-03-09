import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Send, History, Plus, Smartphone, Layout, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { notificationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [apps, setApps] = useState<any[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Test Form State
    const [testToken, setTestToken] = useState('');
    const [testTitle, setTestTitle] = useState('Prueba de MatuDB');
    const [testBody, setTestBody] = useState('Esta es una notificación de prueba desde el panel.');

    useEffect(() => {
        if (projectId) {
            fetchApps();
        }
    }, [projectId]);

    useEffect(() => {
        if (selectedAppId) {
            fetchLogs();
        }
    }, [selectedAppId]);

    const fetchApps = async () => {
        try {
            const res = await notificationsAPI.getApps(projectId!);
            setApps(res.data.data);
            if (res.data.data.length > 0 && !selectedAppId) {
                setSelectedAppId(res.data.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await notificationsAPI.getLogs(projectId!, selectedAppId!);
            setLogs(res.data.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleCreateApp = async () => {
        const name = prompt('Nombre de la aplicación (ej. HuacApp-Android):');
        if (!name) return;

        try {
            await notificationsAPI.createApp(projectId!, { name });
            toast.success('Aplicación creada correctamente');
            fetchApps();
        } catch (error) {
            toast.error('Error al crear la aplicación');
        }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppId || !testToken || !testTitle || !testBody) {
            toast.error('Completa los campos de prueba');
            return;
        }

        setSending(true);
        try {
            await notificationsAPI.send(projectId!, {
                appId: selectedAppId,
                recipientId: 'SELF',
                title: testTitle,
                body: testBody,
                payload: { test: true },
                type: 'push'
            });
            toast.success('Notificación enviada');
            fetchLogs();
        } catch (error) {
            toast.error('Error al enviar notificación');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Servicio de Notificaciones
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Gestiona tus tokens, apps y envía notificaciones push nativas.</p>
                </div>
                <button
                    onClick={handleCreateApp}
                    style={{ background: 'var(--brand)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Plus size={18} /> Registrar Aplicación
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32 }}>
                {/* Apps List */}
                <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Aplicaciones Registradas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {apps.map(app => (
                            <button
                                key={app.id}
                                onClick={() => setSelectedAppId(app.id)}
                                style={{
                                    padding: '16px',
                                    borderRadius: 12,
                                    border: '1px solid',
                                    borderColor: selectedAppId === app.id ? 'var(--brand)' : 'rgba(255,255,255,0.05)',
                                    background: selectedAppId === app.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                    color: selectedAppId === app.id ? '#fff' : 'rgba(255,255,255,0.6)',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{app.name}</div>
                                <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }}>{app.api_key}</div>
                            </button>
                        ))}
                        {apps.length === 0 && !loading && (
                            <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                                No hay apps registradas
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Areas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {selectedAppId ? (
                        <>
                            {/* Test Section */}
                            <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', p: 10, borderRadius: 12, color: 'var(--brand)' }}>
                                        <Send size={20} />
                                    </div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tester de Notificaciones</h2>
                                </div>

                                <form onSubmit={handleSendTest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Destinatario (FCMToken o UserID)</label>
                                        <input
                                            value={testToken}
                                            onChange={e => setTestToken(e.target.value)}
                                            placeholder="Introduce el token del dispositivo..."
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: 10, color: '#fff' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Título</label>
                                        <input
                                            value={testTitle}
                                            onChange={e => setTestTitle(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: 10, color: '#fff' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Mensaje (Body)</label>
                                        <input
                                            value={testBody}
                                            onChange={e => setTestBody(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: 10, color: '#fff' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                                        <button
                                            disabled={sending}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '14px', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                                            {sending ? 'Enviando...' : 'Enviar Notificación de Prueba'}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Logs Section */}
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <History size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                    <h2 style={{ fontSize: 16, fontWeight: 700 }}>Historial de Envíos</h2>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <th style={{ textAlign: 'left', padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Destinatario</th>
                                                <th style={{ textAlign: 'left', padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Mensaje</th>
                                                <th style={{ textAlign: 'left', padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Estado</th>
                                                <th style={{ textAlign: 'left', padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map(log => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{log.recipient_name || 'Desconocido'}</div>
                                                        <div style={{ fontSize: 10, opacity: 0.4 }}>{log.recipient_id}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{log.title}</div>
                                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{log.body}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: 20,
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            background: log.status === 'sent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: log.status === 'sent' ? '#10b981' : '#ef4444'
                                                        }}>
                                                            {log.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {logs.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>No hay logs para esta aplicación</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 32 }}>
                            <Bell size={48} style={{ color: 'rgba(255,255,255,0.05)' }} />
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>Selecciona una aplicación para ver su gestión</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
