import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { robotsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import {
    Bot,
    Plus,
    Trash2,
    Upload,
    Download,
    Play,
    Pencil,
    Activity,
    Armchair,
    Coffee,
    ChevronDown,
    ChevronRight,
    ClipboardPaste,
    CheckCircle2,
    XCircle,
    Sparkles,
    ZoomIn,
    ZoomOut,
    MessageCircle,
    GitBranch,
    Pause,
    PlayCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type RobotRow = {
    id: string;
    name: string;
    category: string;
    status: string;
    preset_key?: string | null;
    worker_enabled?: boolean;
    worker_interval_sec?: number;
    worker_paused?: boolean;
    worker_started_at?: string | null;
    worker_last_tick_at?: string | null;
    schedule_until?: string | null;
    last_bubble?: string | null;
    workspace_config?: {
        visual?: { accent?: string };
        flow?: { nodes?: { id: string; label?: string; x: number; y: number }[]; edges?: { source: string; target: string }[] };
    };
    created_at: string;
    updated_at: string;
};

function stableHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
}

export default function RobotsOfficePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [robots, setRobots] = useState<RobotRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [runs, setRuns] = useState<any[]>([]);
    const [suiteModal, setSuiteModal] = useState<{ id: string; json: string } | null>(null);
    const [suiteCheck, setSuiteCheck] = useState<{ valid: boolean; errors: string[] } | null>(null);
    const [importPasteOpen, setImportPasteOpen] = useState(false);
    const [importPasteText, setImportPasteText] = useState('');
    const [importCheck, setImportCheck] = useState<{ valid: boolean; errors: string[] } | null>(null);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
    const [fleetMessages, setFleetMessages] = useState<any[]>([]);
    const [sideTab, setSideTab] = useState<'runs' | 'chat' | 'worker' | 'flow'>('runs');
    const [officeZoom, setOfficeZoom] = useState(1);
    const [schedDraft, setSchedDraft] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    const loadRobots = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await robotsAPI.list(projectId);
            const list = (res.data.data || []) as RobotRow[];
            setRobots(list);
            setSelectedId((prev) => (prev && !list.some((r) => r.id === prev) ? null : prev));
        } catch {
            toast.error('No se pudieron cargar los robots');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadRobots();
    }, [projectId]);

    const anyRunning = robots.some((r) => r.status === 'running');
    const anyWorker = robots.some((r) => r.worker_enabled && !r.worker_paused);
    useEffect(() => {
        if (!projectId || !anyRunning) return;
        const t = setInterval(() => loadRobots(), 1800);
        return () => clearInterval(t);
    }, [projectId, anyRunning, loadRobots]);

    const loadMessages = useCallback(async () => {
        if (!projectId) return;
        try {
            const r = await robotsAPI.messages(projectId, { limit: 120 });
            setFleetMessages(r.data.data || []);
        } catch {
            /* ignore */
        }
    }, [projectId]);

    useEffect(() => {
        loadMessages();
        const t = setInterval(loadMessages, 6000);
        return () => clearInterval(t);
    }, [loadMessages]);

    useEffect(() => {
        if (!projectId || !anyWorker) return;
        const t = setInterval(() => {
            loadRobots();
            loadMessages();
        }, 4500);
        return () => clearInterval(t);
    }, [projectId, anyWorker, loadRobots, loadMessages]);

    useEffect(() => {
        if (!projectId) return;
        const base = (import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api').replace(/\/api\/?$/i, '');
        const socket = io(base, { transports: ['websocket', 'polling'], withCredentials: true });
        socket.emit('subscribe_robots', { project_id: projectId });
        const onEvt = () => {
            loadRobots();
            loadMessages();
        };
        socket.on('robots_event', onEvt);
        return () => {
            socket.disconnect();
        };
    }, [projectId, loadRobots, loadMessages]);

    const loadRuns = useCallback(async () => {
        if (!projectId || !selectedId) return;
        try {
            const r = await robotsAPI.listRuns(projectId, selectedId, { limit: 15 });
            setRuns(r.data.data || []);
        } catch {
            setRuns([]);
        }
    }, [projectId, selectedId]);

    useEffect(() => {
        if (!projectId || !selectedId) {
            setRuns([]);
            return;
        }
        loadRuns();
    }, [projectId, selectedId, robots, loadRuns]);

    const selected = robots.find((r) => r.id === selectedId);

    useEffect(() => {
        if (!projectId || !selectedId || selected?.status !== 'running') return;
        const t = setInterval(() => {
            loadRuns();
            loadRobots();
        }, 1200);
        return () => clearInterval(t);
    }, [projectId, selectedId, selected?.status, loadRuns, loadRobots]);

    const handleCreate = async () => {
        if (!projectId) return;
        try {
            setCreating(true);
            const res = await robotsAPI.create(projectId, {
                name: `Robot ${robots.length + 1}`,
                category: 'flow',
            });
            toast.success('Robot creado');
            await loadRobots();
            setSelectedId(res.data.data.id);
        } catch {
            toast.error('No se pudo crear el robot');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!projectId || !confirm('¿Eliminar este robot?')) return;
        try {
            await robotsAPI.delete(projectId, id);
            toast.success('Eliminado');
            if (selectedId === id) setSelectedId(null);
            loadRobots();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !projectId) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as { data?: Record<string, unknown> } & Record<string, unknown>;
            const payload = (parsed.data ?? parsed) as Record<string, unknown>;
            if (!payload.suite_config || !Array.isArray((payload.suite_config as { cases?: unknown }).cases)) {
                toast.error('JSON inválido: falta suite_config.cases');
                return;
            }
            const res = await robotsAPI.import(projectId, payload);
            toast.success('Robot importado');
            loadRobots();
            setSelectedId(res.data.data?.id as string);
        } catch {
            toast.error('No se pudo importar el JSON');
        }
    };

    const handleExport = async (id: string, name: string) => {
        if (!projectId) return;
        try {
            const res = await robotsAPI.export(projectId, id);
            const payload = res.data.data;
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `robot-${(name || 'bot').replace(/\s+/g, '-')}-${id.slice(0, 8)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('JSON descargado');
        } catch {
            toast.error('No se pudo exportar');
        }
    };

    const handleRun = async (id: string) => {
        if (!projectId) return;
        try {
            await robotsAPI.run(projectId, id);
            toast.success('Ejecución iniciada');
            loadRobots();
            loadRuns();
        } catch (err: any) {
            const d = err?.response?.data;
            const msg = d?.message;
            const errs = Array.isArray(d?.errors) ? d.errors.join(' · ') : '';
            toast.error(typeof msg === 'string' ? (errs ? `${msg}: ${errs}` : msg) : 'No se pudo ejecutar');
        }
    };

    const openSuiteEditor = async (id: string) => {
        if (!projectId) return;
        try {
            const res = await robotsAPI.get(projectId, id);
            const sc = res.data.data?.suite_config ?? { cases: [] };
            setSuiteCheck(null);
            setSuiteModal({ id, json: JSON.stringify(sc, null, 2) });
        } catch {
            toast.error('No se pudo cargar la suite');
        }
    };

    const checkSuiteInModal = async () => {
        if (!projectId || !suiteModal) return;
        let parsed: unknown;
        try {
            parsed = JSON.parse(suiteModal.json);
        } catch {
            setSuiteCheck({ valid: false, errors: ['JSON inválido (no se puede parsear)'] });
            return;
        }
        try {
            const res = await robotsAPI.validateSuite(projectId, { suite_config: parsed });
            const d = res.data.data as { valid: boolean; errors: string[] };
            setSuiteCheck({ valid: d.valid, errors: d.errors || [] });
            if (d.valid) toast.success('Suite válida');
            else toast.error('La suite tiene errores');
        } catch {
            toast.error('No se pudo validar');
        }
    };

    const saveSuite = async () => {
        if (!projectId || !suiteModal) return;
        let parsed: unknown;
        try {
            parsed = JSON.parse(suiteModal.json);
        } catch {
            toast.error('JSON inválido');
            return;
        }
        try {
            const v = await robotsAPI.validateSuite(projectId, { suite_config: parsed });
            const d = v.data.data as { valid: boolean; errors: string[] };
            setSuiteCheck({ valid: d.valid, errors: d.errors || [] });
            if (!d.valid) {
                toast.error('Corrige los errores antes de guardar');
                return;
            }
            await robotsAPI.update(projectId, suiteModal.id, { suite_config: parsed });
            toast.success('Suite guardada');
            setSuiteModal(null);
            loadRobots();
        } catch (err: any) {
            const d = err?.response?.data;
            if (Array.isArray(d?.errors)) {
                setSuiteCheck({ valid: false, errors: d.errors });
            }
            toast.error(d?.message || 'Error al guardar');
        }
    };

    const checkImportPaste = async () => {
        if (!projectId) return;
        let raw: unknown;
        try {
            raw = JSON.parse(importPasteText);
        } catch {
            setImportCheck({ valid: false, errors: ['JSON inválido'] });
            return;
        }
        try {
            const res = await robotsAPI.validateImport(projectId, raw as Record<string, unknown>);
            const d = res.data.data as { valid: boolean; errors: string[] };
            setImportCheck({ valid: d.valid, errors: d.errors || [] });
            if (d.valid) toast.success('Import válido');
            else toast.error('El JSON tiene errores');
        } catch {
            toast.error('No se pudo validar');
        }
    };

    const confirmImportPaste = async () => {
        if (!projectId || !importCheck?.valid) return;
        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(importPasteText) as Record<string, unknown>;
            const inner = (payload as { data?: Record<string, unknown> }).data ?? payload;
            const res = await robotsAPI.import(projectId, inner);
            toast.success('Robot importado');
            setImportPasteOpen(false);
            loadRobots();
            setSelectedId(res.data.data?.id as string);
        } catch (err: any) {
            const d = err?.response?.data;
            toast.error(d?.message || 'Import falló');
            if (Array.isArray(d?.errors)) setImportCheck({ valid: false, errors: d.errors });
        }
    };

    const handleSeedFleet = async () => {
        if (!projectId) return;
        try {
            await robotsAPI.seedFleet(projectId);
            toast.success('Equipo MatuDB instalado (12 robots). Activa workers en cada uno.');
            loadRobots();
        } catch {
            toast.error('No se pudo instalar el equipo');
        }
    };

    const patchRobot = async (id: string, patch: Record<string, unknown>) => {
        if (!projectId) return;
        try {
            await robotsAPI.update(projectId, id, patch);
            toast.success('Guardado');
            loadRobots();
        } catch {
            toast.error('No se pudo guardar');
        }
    };

    useEffect(() => {
        if (!selected?.schedule_until) {
            setSchedDraft('');
            return;
        }
        const d = new Date(selected.schedule_until);
        const p = (n: number) => String(n).padStart(2, '0');
        setSchedDraft(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`);
    }, [selected?.schedule_until, selectedId]);

    const flowRobot = selected || robots[0];
    const flowNodes = flowRobot?.workspace_config?.flow?.nodes || [];

    return (
        <div style={{ padding: '32px 28px 48px', maxWidth: 1520, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                        <Bot size={14} /> Laboratorio de pruebas
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>Oficina de robots</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15, maxWidth: 620, lineHeight: 1.55 }}>
                        Workers ligeros 24/7 en el <strong style={{ fontWeight: 700 }}>API MatuDB</strong>: seguridad SQL (<code style={{ fontSize: 12 }}>sql_history</code>), salud API, latencia DB, almacenamiento, coordinación y alertas por correo si algo es crítico.
                        Siguen corriendo con <code style={{ fontSize: 12 }}>worker</code> activo hasta que pauses, detengas o llegue la hora límite. Suites manuales siguen disponibles.
                    </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
                    <input ref={importInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                            setImportPasteOpen(true);
                            setImportPasteText('');
                            setImportCheck(null);
                        }}
                        style={{ height: 44, padding: '0 18px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center' }}
                    >
                        <ClipboardPaste size={17} /> Pegar JSON
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => importInputRef.current?.click()} style={{ height: 44, padding: '0 18px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center' }}>
                        <Upload size={17} /> Importar JSON
                    </button>
                    <button type="button" className="btn btn-outline" onClick={handleSeedFleet} style={{ height: 44, padding: '0 18px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center' }} title="12 roles: SQL, API, storage, correo…">
                        <Sparkles size={17} /> Instalar equipo MatuDB
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ height: 44, padding: '0 22px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.18)' }}>
                        {creating ? <span className="spinner-sm" style={{ width: 18, height: 18 }} /> : <Plus size={19} />}
                        Nuevo robot
                    </button>
                </div>
            </div>

            <div className="robot-office-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 24, alignItems: 'stretch' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: 4 }}>Equipo</div>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
                    ) : robots.length === 0 ? (
                        <div style={{ padding: 28, background: 'var(--bg-surface)', borderRadius: 20, border: '2px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                            No hay robots. Crea uno o importa un JSON (mismo estilo que automatizaciones: <code style={{ fontSize: 12 }}>exportVersion</code> + <code style={{ fontSize: 12 }}>suite_config.cases</code>).
                        </div>
                    ) : (
                        robots.map((r) => {
                            const active = selectedId === r.id;
                            const running = r.status === 'running';
                            const working = !!(r.worker_enabled && !r.worker_paused);
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setSelectedId(r.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        padding: '14px 16px',
                                        borderRadius: 16,
                                        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                                        background: active ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'inherit',
                                        font: 'inherit',
                                        transition: 'all 0.2s',
                                        boxShadow: active ? '0 8px 24px rgba(16, 185, 129, 0.08)' : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            background: running ? 'linear-gradient(135deg, var(--brand), #059669)' : 'var(--bg-base)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: running ? '#fff' : 'var(--text-muted)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {running ? <Activity size={22} /> : working ? <Activity size={22} style={{ opacity: 0.85 }} /> : <Bot size={22} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                                            {r.preset_key ? r.preset_key.replace('matudb:', '') : r.category} · {running ? 'suite' : working ? 'worker' : 'idle'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}

                    {robots.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {(
                                [
                                    { id: 'runs' as const, label: 'Corridas', icon: Activity },
                                    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
                                    { id: 'worker' as const, label: 'Worker', icon: PlayCircle },
                                    { id: 'flow' as const, label: 'Flujo', icon: GitBranch },
                                ]
                            ).map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSideTab(id)}
                                    style={{
                                        flex: '1 1 80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        padding: '8px 10px',
                                        borderRadius: 12,
                                        border: `1px solid ${sideTab === id ? 'var(--brand)' : 'var(--border)'}`,
                                        background: sideTab === id ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                                        color: sideTab === id ? 'var(--brand)' : 'var(--text-secondary)',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {!selected && sideTab === 'runs' && robots.length > 0 && (
                        <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-surface)', borderRadius: 16, border: '1px dashed var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                            Selecciona un robot en la lista para ver corridas y ejecutar suites.
                        </div>
                    )}
                    {!selected && sideTab === 'worker' && robots.length > 0 && (
                        <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-surface)', borderRadius: 16, border: '1px dashed var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                            Selecciona un robot para activar el worker en segundo plano, pausar o programar hora de parada.
                        </div>
                    )}

                    {selected && sideTab === 'runs' && (
                        <div style={{ marginTop: 8, padding: 18, background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>{selected.name}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <button type="button" className="btn btn-primary" style={{ flex: '1 1 120px', height: 40, borderRadius: 12, fontWeight: 700, gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRun(selected.id)} disabled={selected.status === 'running'}>
                                    <Play size={16} /> Ejecutar suite
                                </button>
                                <button type="button" className="btn btn-outline" style={{ height: 40, borderRadius: 12, fontWeight: 700, gap: 6, display: 'flex', alignItems: 'center', padding: '0 14px' }} onClick={() => openSuiteEditor(selected.id)}>
                                    <Pencil size={16} /> Casos JSON
                                </button>
                                <button type="button" className="btn btn-outline" style={{ height: 40, borderRadius: 12, padding: '0 14px' }} onClick={() => handleExport(selected.id, selected.name)} title="Exportar">
                                    <Download size={17} />
                                </button>
                                <button type="button" className="btn btn-ghost hover-danger" style={{ height: 40, borderRadius: 12, padding: '0 14px', color: 'var(--text-muted)' }} onClick={() => handleDelete(selected.id)}>
                                    <Trash2 size={17} />
                                </button>
                            </div>
                            <div style={{ marginTop: 16, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Últimas corridas</div>
                            <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', maxHeight: 280, overflowY: 'auto' }} className="custom-scrollbar">
                                {runs.length === 0 ? (
                                    <li style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin ejecuciones aún</li>
                                ) : (
                                    runs.map((run) => {
                                        const open = expandedRunId === run.id;
                                        const steps = Array.isArray(run.progress?.steps) ? run.progress.steps : [];
                                        return (
                                            <li key={run.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedRunId(open ? null : run.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        width: '100%',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: '4px 0',
                                                        cursor: 'pointer',
                                                        color: 'inherit',
                                                        font: 'inherit',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    <span style={{ fontWeight: 700, color: run.status === 'completed' ? 'var(--brand)' : run.status === 'failed' ? 'var(--danger)' : 'var(--text-primary)' }}>{run.status}</span>
                                                    <span style={{ opacity: 0.8 }}>{formatDistanceToNow(new Date(run.started_at), { addSuffix: true, locale: es })}</span>
                                                </button>
                                                {run.progress?.message && (
                                                    <div style={{ marginTop: 2, marginLeft: 20, opacity: 0.9, fontSize: 11 }}>{run.progress.message}</div>
                                                )}
                                                {open && (
                                                    <div style={{ marginTop: 8, marginLeft: 4, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                                                        {steps.length === 0 ? (
                                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sin pasos registrados aún…</div>
                                                        ) : (
                                                            steps.map((st: any, i: number) => (
                                                                <div
                                                                    key={`${run.id}-s-${i}`}
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: 8,
                                                                        alignItems: 'flex-start',
                                                                        marginBottom: 8,
                                                                        fontSize: 11,
                                                                    }}
                                                                >
                                                                    {st.ok === false ? <XCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} /> : <CheckCircle2 size={14} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />}
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontWeight: 700 }}>
                                                                            {st.caseName || st.caseId} / {st.stepId} {st.kind ? `· ${st.kind}` : ''}
                                                                        </div>
                                                                        {st.error && (
                                                                            <div style={{ color: 'var(--danger)', marginTop: 2, wordBreak: 'break-word' }}>{st.error}</div>
                                                                        )}
                                                                        {typeof st.duration_ms === 'number' && (
                                                                            <div style={{ opacity: 0.75, marginTop: 2 }}>{st.duration_ms} ms</div>
                                                                        )}
                                                                        {st.detail?.rowCount !== undefined && (
                                                                            <div style={{ opacity: 0.8, marginTop: 2 }}>SQL: {st.detail.rowCount} filas</div>
                                                                        )}
                                                                        {st.detail?.status !== undefined && (
                                                                            <div style={{ opacity: 0.8, marginTop: 2 }}>HTTP {st.detail.status} → {st.detail.url}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    )}

                    {sideTab === 'chat' && robots.length > 0 && (
                        <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--border)', maxHeight: 420, overflowY: 'auto' }} className="custom-scrollbar">
                            <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 13 }}>Conversación del equipo</div>
                            {fleetMessages.length === 0 ? (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin mensajes aún. Activa workers o ejecuta suites.</div>
                            ) : (
                                [...fleetMessages].reverse().map((m) => (
                                    <div key={m.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand)' }}>{m.robot_name || 'Robot'}</div>
                                        <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{m.body}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                            {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: es })} · {m.kind}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {selected && sideTab === 'worker' && (
                        <div style={{ marginTop: 8, padding: 18, background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Worker 24/7 — {selected.name}</div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginBottom: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={!!selected.worker_enabled}
                                    onChange={(e) => patchRobot(selected.id, { worker_enabled: e.target.checked })}
                                />
                                Trabajar en segundo plano (API MatuDB)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ height: 36, borderRadius: 10, fontSize: 12, fontWeight: 700, gap: 6, display: 'flex', alignItems: 'center' }}
                                    onClick={() => patchRobot(selected.id, { worker_paused: !selected.worker_paused })}
                                >
                                    {selected.worker_paused ? <PlayCircle size={16} /> : <Pause size={16} />}
                                    {selected.worker_paused ? 'Reanudar' : 'Pausar'}
                                </button>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Intervalo (seg) — guarda al salir del campo</div>
                                <input
                                    type="number"
                                    min={60}
                                    max={86400}
                                    key={`int-${selected.id}-${selected.worker_interval_sec}`}
                                    defaultValue={selected.worker_interval_sec ?? 180}
                                    onBlur={(e) => patchRobot(selected.id, { worker_interval_sec: Math.max(60, parseInt(e.target.value, 10) || 180) })}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Parar automático (local)</div>
                                <input
                                    type="datetime-local"
                                    value={schedDraft}
                                    onChange={(e) => setSchedDraft(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                                />
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button type="button" className="btn btn-outline" style={{ height: 34, fontSize: 12 }} onClick={() => patchRobot(selected.id, { schedule_until: schedDraft ? new Date(schedDraft).toISOString() : null })}>
                                        Guardar horario
                                    </button>
                                    <button type="button" className="btn btn-ghost" style={{ height: 34, fontSize: 12 }} onClick={() => patchRobot(selected.id, { schedule_until: null })}>
                                        Quitar
                                    </button>
                                </div>
                            </div>
                            {selected.worker_started_at && selected.worker_enabled && !selected.worker_paused && (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    Activo desde hace {formatDistanceToNow(new Date(selected.worker_started_at), { locale: es })} · último tick{' '}
                                    {selected.worker_last_tick_at ? formatDistanceToNow(new Date(selected.worker_last_tick_at), { addSuffix: true, locale: es }) : '—'}
                                </div>
                            )}
                            {selected.preset_key && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>Preset: {selected.preset_key}</div>}
                        </div>
                    )}

                    {sideTab === 'flow' && flowRobot && (
                        <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--border)', minHeight: 200 }}>
                            <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 13 }}>Diagrama — {flowRobot.name}</div>
                            <div style={{ position: 'relative', height: 200, background: 'var(--bg-base)', borderRadius: 14, border: '1px dashed var(--border)', overflow: 'auto' }}>
                                {flowNodes.length === 0 ? (
                                    <div style={{ padding: 20, fontSize: 13, color: 'var(--text-muted)' }}>Sin nodos. Edita workspace_config.flow en la API o exporta/importa.</div>
                                ) : (
                                    flowNodes.map((n, i) => (
                                        <div
                                            key={n.id}
                                            style={{
                                                position: 'absolute',
                                                left: 24 + (n.x || 0) + i * 12,
                                                top: 24 + (n.y || 0) + i * 8,
                                                padding: '10px 14px',
                                                borderRadius: 12,
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--brand)',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            {n.label || n.id}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Zoom oficina</span>
                        <button type="button" className="btn btn-outline" style={{ width: 40, height: 36, padding: 0, borderRadius: 10 }} onClick={() => setOfficeZoom((z) => Math.max(0.65, Math.round((z - 0.1) * 100) / 100))}>
                            <ZoomOut size={18} />
                        </button>
                        <button type="button" className="btn btn-outline" style={{ width: 40, height: 36, padding: 0, borderRadius: 10 }} onClick={() => setOfficeZoom((z) => Math.min(1.35, Math.round((z + 0.1) * 100) / 100))}>
                            <ZoomIn size={18} />
                        </button>
                    </div>
                    <section
                    className="robot-office-wrap"
                    style={{
                        position: 'relative',
                        flex: 1,
                        minHeight: 480,
                        maxHeight: 'min(78vh, 820px)',
                        borderRadius: 24,
                        border: '1px solid var(--border)',
                        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
                        overflow: 'auto',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${officeZoom})`,
                            transformOrigin: 'top center',
                            minHeight: 520,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                    <div className="robot-office-sky" />
                    <div className="robot-office-floor">
                        <div className="robot-office-grid" aria-hidden />

                        <div className="robot-desk robot-desk--a">
                            <Armchair size={22} style={{ opacity: 0.35 }} />
                        </div>
                        <div className="robot-desk robot-desk--b">
                            <Coffee size={20} style={{ opacity: 0.4 }} />
                        </div>
                        <div className="robot-desk robot-desk--c">
                            <span style={{ fontSize: 18, opacity: 0.5 }}>🖥️</span>
                        </div>

                        <div className="robot-office-sign">
                            MatuDB · área de pruebas
                        </div>

                        {robots.map((r) => {
                            const h = stableHash(r.id);
                            const delay = (h % 9000) / 1000;
                            const duration = 11 + (h % 7000) / 1000;
                            const accent = r.workspace_config?.visual?.accent || ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][h % 5];
                            const running = r.status === 'running';
                            const working = !!(r.worker_enabled && !r.worker_paused);
                            return (
                                <div
                                    key={r.id}
                                    className={`robot-sprite ${running ? 'robot-sprite--running' : ''} ${working ? 'robot-sprite--working' : ''}`}
                                    style={
                                        {
                                            ['--robot-delay' as string]: `${delay}s`,
                                            ['--robot-duration' as string]: `${running || working ? Math.max(5, duration - 4) : duration}s`,
                                            ['--robot-accent' as string]: accent,
                                        } as React.CSSProperties
                                    }
                                    title={r.name}
                                >
                                    {r.last_bubble && (
                                        <div className="robot-bubble" role="status">
                                            <span>{r.last_bubble}</span>
                                        </div>
                                    )}
                                    <div className="robot-sprite-inner">
                                        <Bot size={22} strokeWidth={2.2} />
                                        {working && <span className="robot-typing" aria-hidden />}
                                    </div>
                                    <span className="robot-sprite-label">{r.name}</span>
                                </div>
                            );
                        })}

                        {robots.length === 0 && !loading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, padding: 24 }}>
                                    La oficina está vacía. Añade robots al panel izquierdo.
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </section>
                </div>
            </div>

            {suiteModal && (
                <div
                    role="dialog"
                    aria-modal
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: 20,
                    }}
                    onClick={() => setSuiteModal(null)}
                >
                    <div
                        style={{
                            width: 'min(640px, 100%)',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            background: 'var(--bg-surface)',
                            borderRadius: 20,
                            border: '1px solid var(--border)',
                            padding: 22,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}>Suite de casos (JSON)</h3>
                        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            Pasos <code style={{ fontSize: 11 }}>kind: &quot;sql&quot;</code> ejecutan <strong>SELECT/WITH</strong> en el esquema de este proyecto. Pasos{' '}
                            <code style={{ fontSize: 11 }}>kind: &quot;http&quot;</code> llaman a tu app: define <code style={{ fontSize: 11 }}>baseUrl</code> (ej. Vite torre-control) y <code style={{ fontSize: 11 }}>path</code>, o <code style={{ fontSize: 11 }}>url</code> absoluta.{' '}
                            <code style={{ fontSize: 11 }}>noop</code> = solo documentación.
                        </p>
                        <textarea
                            value={suiteModal.json}
                            onChange={(e) => {
                                setSuiteModal({ ...suiteModal, json: e.target.value });
                                setSuiteCheck(null);
                            }}
                            spellCheck={false}
                            style={{
                                width: '100%',
                                minHeight: 280,
                                fontFamily: 'ui-monospace, monospace',
                                fontSize: 12,
                                padding: 14,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-base)',
                                color: 'var(--text-primary)',
                                resize: 'vertical',
                            }}
                        />
                        {suiteCheck && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    borderRadius: 12,
                                    fontSize: 12,
                                    border: `1px solid ${suiteCheck.valid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                    background: suiteCheck.valid ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <div style={{ fontWeight: 800, marginBottom: suiteCheck.errors.length ? 8 : 0 }}>{suiteCheck.valid ? 'Validación OK' : 'Errores de validación'}</div>
                                {suiteCheck.errors.length > 0 && (
                                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {suiteCheck.errors.map((e) => (
                                            <li key={e} style={{ marginBottom: 4 }}>
                                                {e}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setSuiteModal(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-outline" onClick={checkSuiteInModal}>
                                Validar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={saveSuite}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {importPasteOpen && (
                <div
                    role="dialog"
                    aria-modal
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: 20,
                    }}
                    onClick={() => setImportPasteOpen(false)}
                >
                    <div
                        style={{
                            width: 'min(560px, 100%)',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            background: 'var(--bg-surface)',
                            borderRadius: 20,
                            border: '1px solid var(--border)',
                            padding: 22,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800 }}>Pegar JSON de robot</h3>
                        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Mismo formato que exportar: <code style={{ fontSize: 11 }}>exportVersion</code>, <code style={{ fontSize: 11 }}>suite_config.cases</code>, etc. Pulsa <strong>Validar</strong> antes de importar.
                        </p>
                        <textarea
                            value={importPasteText}
                            onChange={(e) => {
                                setImportPasteText(e.target.value);
                                setImportCheck(null);
                            }}
                            placeholder='{ "exportVersion": 1, "name": "...", "suite_config": { "cases": [...] } }'
                            spellCheck={false}
                            style={{
                                width: '100%',
                                minHeight: 220,
                                fontFamily: 'ui-monospace, monospace',
                                fontSize: 12,
                                padding: 14,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-base)',
                                color: 'var(--text-primary)',
                                resize: 'vertical',
                            }}
                        />
                        {importCheck && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    borderRadius: 12,
                                    fontSize: 12,
                                    border: `1px solid ${importCheck.valid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                    background: importCheck.valid ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                }}
                            >
                                <div style={{ fontWeight: 800, marginBottom: importCheck.errors.length ? 8 : 0 }}>{importCheck.valid ? 'Listo para importar' : 'Errores'}</div>
                                {importCheck.errors.length > 0 && (
                                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {importCheck.errors.map((e) => (
                                            <li key={e} style={{ marginBottom: 4 }}>
                                                {e}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setImportPasteOpen(false)}>
                                Cerrar
                            </button>
                            <button type="button" className="btn btn-outline" onClick={checkImportPaste}>
                                Validar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={confirmImportPaste} disabled={!importCheck?.valid}>
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .robot-office-wrap {
                    --office-pad: 8%;
                }
                .robot-office-sky {
                    position: absolute;
                    left: 0; right: 0; top: 0;
                    height: 28%;
                    background: linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, transparent 100%);
                    pointer-events: none;
                }
                .robot-office-floor {
                    position: absolute;
                    left: 0; right: 0;
                    top: 22%;
                    bottom: 0;
                    background: linear-gradient(90deg, rgba(16, 185, 129, 0.04), rgba(99, 102, 241, 0.05));
                }
                .robot-office-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
                    background-size: 28px 28px;
                    opacity: 0.7;
                }
                .robot-desk {
                    position: absolute;
                    width: 72px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }
                .robot-desk--a { left: 10%; top: 18%; }
                .robot-desk--b { right: 14%; top: 22%; }
                .robot-desk--c { left: 42%; bottom: 16%; width: 88px; height: 52px; }
                .robot-office-sign {
                    position: absolute;
                    top: 6%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    opacity: 0.7;
                    pointer-events: none;
                }
                @keyframes robot-patrol {
                    0% { left: var(--office-pad); top: 72%; }
                    25% { left: calc(100% - var(--office-pad)); top: 72%; }
                    50% { left: calc(100% - var(--office-pad)); top: 18%; }
                    75% { left: var(--office-pad); top: 18%; }
                    100% { left: var(--office-pad); top: 72%; }
                }
                .robot-sprite {
                    position: absolute;
                    left: var(--office-pad);
                    top: 72%;
                    transform: translate(-50%, -50%);
                    animation-name: robot-patrol;
                    animation-duration: var(--robot-duration, 12s);
                    animation-delay: var(--robot-delay, 0s);
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    z-index: 5;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .robot-sprite-inner {
                    width: 46px;
                    height: 46px;
                    border-radius: 14px;
                    background: linear-gradient(145deg, var(--robot-accent, #10b981), #047857);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                    border: 2px solid rgba(255,255,255,0.25);
                }
                .robot-sprite--running .robot-sprite-inner {
                    animation: robot-bob 0.45s ease-in-out infinite alternate;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35), 0 8px 20px rgba(0,0,0,0.18);
                }
                .robot-sprite--working .robot-sprite-inner {
                    animation: robot-work-pulse 1.2s ease-in-out infinite;
                }
                @keyframes robot-work-pulse {
                    0%, 100% { filter: brightness(1); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
                    50% { filter: brightness(1.08); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25), 0 8px 20px rgba(0,0,0,0.12); }
                }
                .robot-bubble {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    max-width: 200px;
                    z-index: 8;
                    animation: robot-bubble-in 0.35s ease-out;
                }
                .robot-bubble span {
                    display: block;
                    padding: 8px 10px;
                    border-radius: 14px 14px 14px 4px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 1.35;
                    color: var(--text-primary);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                }
                @keyframes robot-bubble-in {
                    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .robot-sprite-inner { position: relative; }
                .robot-typing {
                    position: absolute;
                    right: -4px;
                    bottom: -2px;
                    width: 22px;
                    height: 8px;
                    background: radial-gradient(circle, #fff 2px, transparent 2px) 0 50% / 7px 8px repeat-x;
                    animation: robot-dots 0.9s steps(3) infinite;
                    opacity: 0.9;
                }
                @keyframes robot-dots {
                    to { background-position: 21px 50%; }
                }
                @keyframes robot-bob {
                    from { transform: translateY(0); }
                    to { transform: translateY(-4px); }
                }
                .robot-sprite-label {
                    font-size: 10px;
                    font-weight: 800;
                    max-width: 96px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: var(--text-secondary);
                    text-shadow: 0 1px 0 var(--bg-base);
                }
                @media (max-width: 900px) {
                    .robot-office-page-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
