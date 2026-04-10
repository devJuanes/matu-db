import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type RobotRow = {
    id: string;
    name: string;
    category: string;
    status: string;
    workspace_config?: { visual?: { accent?: string } };
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
    useEffect(() => {
        if (!projectId || !anyRunning) return;
        const t = setInterval(() => loadRobots(), 1800);
        return () => clearInterval(t);
    }, [projectId, anyRunning, loadRobots]);

    useEffect(() => {
        if (!projectId || !selectedId) {
            setRuns([]);
            return;
        }
        robotsAPI
            .listRuns(projectId, selectedId, { limit: 15 })
            .then((r) => setRuns(r.data.data || []))
            .catch(() => setRuns([]));
    }, [projectId, selectedId, robots]);

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
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            toast.error(typeof msg === 'string' ? msg : 'No se pudo ejecutar');
        }
    };

    const openSuiteEditor = async (id: string) => {
        if (!projectId) return;
        try {
            const res = await robotsAPI.get(projectId, id);
            const sc = res.data.data?.suite_config ?? { cases: [] };
            setSuiteModal({ id, json: JSON.stringify(sc, null, 2) });
        } catch {
            toast.error('No se pudo cargar la suite');
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
        if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as { cases?: unknown }).cases)) {
            toast.error('Debe ser un objeto con array cases');
            return;
        }
        try {
            await robotsAPI.update(projectId, suiteModal.id, { suite_config: parsed });
            toast.success('Suite guardada');
            setSuiteModal(null);
            loadRobots();
        } catch {
            toast.error('Error al guardar');
        }
    };

    const selected = robots.find((r) => r.id === selectedId);

    return (
        <div style={{ padding: '32px 28px 48px', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                        <Bot size={14} /> Laboratorio de pruebas
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>Oficina de robots</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15, maxWidth: 520, lineHeight: 1.5 }}>
                        Cada robot ejecuta una suite de casos (flujos, soporte, rendimiento). Vista tipo oficina: los bots recorren el espacio mientras trabajan.
                    </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
                    <input ref={importInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
                    <button type="button" className="btn btn-outline" onClick={() => importInputRef.current?.click()} style={{ height: 44, padding: '0 18px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center' }}>
                        <Upload size={17} /> Importar JSON
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ height: 44, padding: '0 22px', borderRadius: 14, fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.18)' }}>
                        {creating ? <span className="spinner-sm" style={{ width: 18, height: 18 }} /> : <Plus size={19} />}
                        Nuevo robot
                    </button>
                </div>
            </div>

            <div className="robot-office-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 24, alignItems: 'stretch' }}>
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
                                        {running ? <Activity size={22} /> : <Bot size={22} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                                            {r.category} · {running ? 'ejecutando' : 'en espera'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}

                    {selected && (
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
                            <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', maxHeight: 200, overflowY: 'auto' }} className="custom-scrollbar">
                                {runs.length === 0 ? (
                                    <li style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin ejecuciones aún</li>
                                ) : (
                                    runs.map((run) => (
                                        <li key={run.id} style={{ fontSize: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 700, color: run.status === 'completed' ? 'var(--brand)' : run.status === 'failed' ? 'var(--danger)' : 'var(--text-primary)' }}>{run.status}</span>
                                            {' · '}
                                            {formatDistanceToNow(new Date(run.started_at), { addSuffix: true, locale: es })}
                                            {run.progress?.message && (
                                                <div style={{ marginTop: 4, opacity: 0.85 }}>{run.progress.message}</div>
                                            )}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </aside>

                <section
                    className="robot-office-wrap"
                    style={{
                        position: 'relative',
                        minHeight: 420,
                        borderRadius: 24,
                        border: '1px solid var(--border)',
                        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
                            return (
                                <div
                                    key={r.id}
                                    className={`robot-sprite ${running ? 'robot-sprite--running' : ''}`}
                                    style={
                                        {
                                            ['--robot-delay' as string]: `${delay}s`,
                                            ['--robot-duration' as string]: `${running ? Math.max(5, duration - 4) : duration}s`,
                                            ['--robot-accent' as string]: accent,
                                        } as React.CSSProperties
                                    }
                                    title={r.name}
                                >
                                    <div className="robot-sprite-inner">
                                        <Bot size={22} strokeWidth={2.2} />
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
                </section>
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
                        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Estructura: <code style={{ fontSize: 12 }}>{`{ "cases": [ { "id", "name", "steps": [ { "id", "action", "target" } ] } ] }`}</code>
                        </p>
                        <textarea
                            value={suiteModal.json}
                            onChange={(e) => setSuiteModal({ ...suiteModal, json: e.target.value })}
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
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setSuiteModal(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={saveSuite}>
                                Guardar
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
