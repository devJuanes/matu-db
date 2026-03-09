import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Bell, Send, History, Plus, Smartphone, Layout,
    CheckCircle, AlertCircle, Search, Mail, MessageSquare,
    Settings, MoreVertical, RefreshCw, Box, Shield,
    User, Terminal, Clock, CheckCircle2
} from 'lucide-react';
import { notificationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [apps, setApps] = useState<any[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Test Form State
    const [testToken, setTestToken] = useState('');
    const [testTitle, setTestTitle] = useState('Notificación de MatuDB');
    const [testBody, setTestBody] = useState('Este es un mensaje de prueba enviado desde tu consola empresarial.');

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
            setRefreshing(true);
            const res = await notificationsAPI.getApps(projectId!);
            setApps(res.data.data);
            if (res.data.data.length > 0 && !selectedAppId) {
                setSelectedAppId(res.data.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        const name = prompt('Nombre de la aplicación para notificaciones (ej. App Móvil Producción):');
        if (!name) return;

        try {
            await notificationsAPI.createApp(projectId!, { name });
            toast.success('Servicio registrado correctamente');
            fetchApps();
        } catch (error) {
            toast.error('Error al registrar servicio');
        }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppId || !testToken || !testTitle || !testBody) {
            toast.error('Por favor, completa los campos de prueba');
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
                type: 'in_app'
            });
            toast.success('Notificación enviada a la cola');
            fetchLogs();
        } catch (error) {
            toast.error('Error al despachar notificación');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
            <span className="spinner" style={{ width: 44, height: 44, borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sincronizando canal de mensajería...</span>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Bell size={14} /> Centro de Comunicaciones
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Notificaciones Push</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 640 }}>
                        Gestiona el envío de alertas en tiempo real y gestiona múltiples aplicaciones.
                        Compatible con Firebase (FCM) y Apple Push Notifications (APNs).
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleCreateApp} style={{ height: 44, padding: '0 24px', gap: 10 }}>
                    <Plus size={18} /> Registrar App
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 32 }}>
                {/* Apps Selection Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Canales Configurados</span>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={fetchApps} disabled={refreshing}>
                            <RefreshCw size={14} className={refreshing ? 'spinner' : ''} />
                        </button>
                    </div>

                    {apps.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 20, background: 'var(--bg-surface)' }}>
                            <Smartphone size={32} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Sin aplicaciones registradas para notificaciones.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {apps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => setSelectedAppId(app.id)}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: 16,
                                        background: selectedAppId === app.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                                        border: `1px solid ${selectedAppId === app.id ? 'var(--brand)' : 'var(--border)'}`,
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: selectedAppId === app.id ? 'var(--brand)' : 'var(--text-primary)', textBreak: 'break-all' }}>{app.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {app.api_key.slice(0, 16)}...
                                        </div>
                                    </div>
                                    {selectedAppId === app.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Dashboard Content */}
                <div style={{ minWidth: 0 }}>
                    {selectedAppId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* Tester Form */}
                            <div className="card" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                                        <Send size={20} />
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Consola de Pruebas</h3>
                                </div>

                                <form onSubmit={handleSendTest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Token del Dispositivo (FCM / Expo Token)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="input"
                                                value={testToken}
                                                onChange={e => setTestToken(e.target.value)}
                                                placeholder="Ej: ExPo-t0k3n-..."
                                                style={{ paddingLeft: 44, height: 48, fontSize: 14 }}
                                            />
                                            <Smartphone size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Título del Mensaje</label>
                                        <input
                                            className="input"
                                            value={testTitle}
                                            onChange={e => setTestTitle(e.target.value)}
                                            style={{ height: 48, fontSize: 14 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Cuerpo (Body)</label>
                                        <input
                                            className="input"
                                            value={testBody}
                                            onChange={e => setTestBody(e.target.value)}
                                            style={{ height: 48, fontSize: 14 }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="btn btn-primary"
                                            style={{ width: '100%', height: 48, fontWeight: 700, gap: 12 }}
                                        >
                                            {sending ? <span className="spinner-sm" /> : <Send size={18} />}
                                            {sending ? 'Despachando...' : 'Enviar Notificación de Prueba'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Logs History */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <History size={18} color="var(--brand)" />
                                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Historial de Notificaciones</h3>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={fetchLogs}><RefreshCw size={14} /></button>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--bg-surface)' }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destinatario</th>
                                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contenido</th>
                                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado</th>
                                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enviado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: 0.5 }}>
                                                            <MessageSquare size={32} />
                                                            Sin actividad reciente en este canal.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map((log, i) => (
                                                    <tr key={log.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <User size={16} color="var(--text-muted)" />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{log.recipient_name || 'Anónimo'}</div>
                                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{log.recipient_id.slice(0, 12)}...</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{log.title}</div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.body}</div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            {log.status === 'sent' ? (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: 'var(--brand)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 6, width: 'fit-content' }}>
                                                                    <CheckCircle2 size={12} /> ENVIADO
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    title={log.error_message || 'Error desconocido'}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 6, width: 'fit-content', cursor: 'help' }}
                                                                >
                                                                    <AlertCircle size={12} /> ERROR
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                                <Clock size={12} /> {new Date(log.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State - Selection Required */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 500, background: 'var(--bg-surface)', borderRadius: 24, border: '2px dashed var(--border)', textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 100, height: 100, borderRadius: 32, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Bell size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Consola de Notificaciones</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 360, lineHeight: 1.6 }}>
                                Selecciona un canal de aplicación en el panel izquierdo para enviar pruebas de mensajería y ver el registro de actividad.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .spinner-sm {
                   width: 16px;
                   height: 16px;
                   border: 2px solid rgba(255,255,255,0.3);
                   border-radius: 50%;
                   border-top-color: #fff;
                   animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
