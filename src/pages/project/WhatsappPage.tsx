import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, RefreshCw, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';
import { whatsappAPI } from '../../lib/api';
import toast from 'react-hot-toast';

type WaSnapshot = {
    enabled: boolean;
    state: string;
    ready: boolean;
    qrDataUrl: string | null;
    needsQr: boolean;
    lastError: string | null;
    updatedAt: string;
};

export default function WhatsappPage() {
    const [snap, setSnap] = useState<WaSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await whatsappAPI.status();
            setSnap(res.data.data as WaSnapshot);
        } catch {
            toast.error('No se pudo leer el estado de WhatsApp');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Actualización inmediata del QR cuando la API emite por Socket.io (misma base que VITE_MATUDB_URL sin /api)
    useEffect(() => {
        const apiBase = import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api';
        const origin = apiBase.replace(/\/api\/?$/, '');
        const socket = io(origin, { transports: ['websocket', 'polling'] });
        socket.on('whatsapp_status', (payload: unknown) => {
            if (!payload || typeof payload !== 'object') return;
            setSnap(payload as WaSnapshot);
            setLoading(false);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!snap?.enabled || snap.ready) return;
        const ms = snap.state === 'qr_pending' || snap.state === 'initializing' ? 2000 : 4000;
        const t = window.setInterval(load, ms);
        return () => window.clearInterval(t);
    }, [snap?.enabled, snap?.ready, snap?.state, load]);

    const onRestart = async () => {
        setBusy(true);
        try {
            await whatsappAPI.restart();
            toast.success('Reinicio solicitado');
            await load();
        } catch {
            toast.error('Error al reiniciar');
        } finally {
            setBusy(false);
        }
    };

    const onLogout = async () => {
        if (!window.confirm('¿Desvincular WhatsApp de este servidor? Tendrás que volver a escanear el QR.')) return;
        setBusy(true);
        try {
            await whatsappAPI.logout();
            toast.success('Sesión cerrada');
            await load();
        } catch {
            toast.error('Error al cerrar sesión');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ padding: 32, maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                }}>
                    <MessageCircle size={26} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>WhatsApp (servidor)</h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                        Vinculación de la sesión que envía mensajes desde automatizaciones (p. ej. tarea &quot;En Camino&quot;).
                    </p>
                </div>
            </div>

            <div style={{
                marginTop: 28,
                padding: 24,
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
            }}>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Cargando estado…</p>
                ) : !snap?.enabled ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <AlertTriangle size={22} color="var(--warning, #ca8a04)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 800 }}>WhatsApp desactivado en la API</div>
                            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                En el servidor de MatuDB API, pon <code style={{ fontSize: 12 }}>WHATSAPP_ENABLED=true</code> y reinicia el proceso.
                            </p>
                        </div>
                    </div>
                ) : snap.ready ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CheckCircle2 size={22} color="var(--brand)" />
                            <span style={{ fontWeight: 800, fontSize: 16 }}>Conectado y listo para enviar</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                            Estado: <strong>{snap.state}</strong>
                            {' · '}
                            Actualizado: {new Date(snap.updatedAt).toLocaleString()}
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button type="button" className="btn" disabled={busy} onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <RefreshCw size={16} /> Refrescar
                            </button>
                            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <LogOut size={16} /> Desvincular
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 6 }}>Escanea el código QR</div>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Abre WhatsApp en el teléfono → Dispositivos vinculados → Vincular dispositivo. El código se renueva; esta página se actualiza sola.
                            </p>
                        </div>
                        {snap.qrDataUrl ? (
                            <div style={{
                                padding: 16,
                                background: '#fff',
                                borderRadius: 12,
                                alignSelf: 'flex-start',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                            }}>
                                <img src={snap.qrDataUrl} alt="QR WhatsApp" width={256} height={256} style={{ display: 'block' }} />
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                Esperando código QR del servidor (estado: <strong>{snap.state}</strong>)…
                            </p>
                        )}
                        {snap.lastError ? (
                            <p style={{ fontSize: 12, color: 'var(--danger, #dc2626)' }}>Último error: {snap.lastError}</p>
                        ) : null}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button type="button" className="btn" disabled={busy} onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <RefreshCw size={16} /> Refrescar
                            </button>
                            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onRestart} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <RefreshCw size={16} /> Reiniciar cliente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
