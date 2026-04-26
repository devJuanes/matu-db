import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectsAPI, tablesAPI } from '../../lib/api';
import { useEffect } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    Download,
    HardDrive,
    PauseCircle,
    PlayCircle,
    Table2,
    Trash2,
    Users,
    Zap,
    Plus,
    ShieldCheck,
} from 'lucide-react';

type ProjectContext = {
    project: any;
    setProject: (project: any) => void;
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
};

export default function ProjectOverviewPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { project, setProject } = useOutletContext<ProjectContext>();

    const [tablesCount, setTablesCount] = useState<number>(0);
    const [loadingTables, setLoadingTables] = useState<boolean>(true);
    const [busyAction, setBusyAction] = useState<'pause' | 'resume' | 'backup-sql' | 'backup-json' | null>(null);

    useEffect(() => {
        if (!projectId) return;
        setLoadingTables(true);
        tablesAPI
            .list(projectId)
            .then((res) => setTablesCount(res.data?.data?.tables?.length ?? 0))
            .catch(() => setTablesCount(0))
            .finally(() => setLoadingTables(false));
    }, [projectId]);

    const statusMeta = useMemo(() => {
        if (project?.status === 'paused') {
            return {
                label: 'Pausado',
                color: '#f59e0b',
                text: 'Este proyecto esta pausado y no deberia recibir nuevas operaciones.',
                icon: <PauseCircle size={16} />,
            };
        }
        return {
            label: 'Activo',
            color: 'var(--brand)',
            text: 'Proyecto operativo y listo para consultas, APIs y automatizaciones.',
            icon: <CheckCircle2 size={16} />,
        };
    }, [project?.status]);

    const downloadBackup = async (format: 'sql' | 'json') => {
        if (!projectId) return;
        setBusyAction(format === 'sql' ? 'backup-sql' : 'backup-json');
        try {
            const res = await projectsAPI.exportBackup(projectId, format);
            const extension = format === 'sql' ? 'sql' : 'json';
            const filename = `${project?.name || 'project'}_backup.${extension}`;
            triggerBlobDownload(res.data, filename);
            toast.success(`Backup ${format.toUpperCase()} descargado`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo generar el backup');
        } finally {
            setBusyAction(null);
        }
    };

    const pauseOrResume = async () => {
        if (!projectId) return;
        const shouldPause = project?.status !== 'paused';
        setBusyAction(shouldPause ? 'pause' : 'resume');
        try {
            const res = shouldPause
                ? await projectsAPI.pause(projectId)
                : await projectsAPI.resume(projectId);
            setProject(res.data.data.project);
            toast.success(shouldPause ? 'Proyecto pausado' : 'Proyecto reanudado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo actualizar el estado');
        } finally {
            setBusyAction(null);
        }
    };

    const deleteProject = async () => {
        if (!projectId || !project?.name) return;
        const answer = window.prompt(`Para eliminar este proyecto escribe exactamente: ${project.name}`);
        if (answer !== project.name) {
            toast.error('Confirmacion incorrecta, no se elimino el proyecto');
            return;
        }
        try {
            await projectsAPI.delete(projectId);
            toast.success('Proyecto eliminado');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo eliminar el proyecto');
        }
    };

    return (
        <div style={{ padding: '30px 28px 34px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>{project?.name || 'Proyecto'}</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                        Vista general de base de datos, estado y operaciones clave del proyecto.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', borderRadius: 999, padding: '8px 12px', color: statusMeta.color, fontSize: 12, fontWeight: 800 }}>
                    {statusMeta.icon}
                    {statusMeta.label}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="overview-card">
                    <div className="overview-kicker"><Table2 size={14} /> Tablas</div>
                    <strong>{loadingTables ? '...' : tablesCount}</strong>
                    <span>Tablas creadas en este esquema</span>
                </div>
                <div className="overview-card">
                    <div className="overview-kicker"><HardDrive size={14} /> Tamaño</div>
                    <strong>{project?.stats?.total_size || '0 bytes'}</strong>
                    <span>Uso estimado del schema</span>
                </div>
                <div className="overview-card">
                    <div className="overview-kicker"><Activity size={14} /> Salud</div>
                    <strong>{project?.status === 'paused' ? 'En pausa' : 'Estable'}</strong>
                    <span>{statusMeta.text}</span>
                </div>
                <div className="overview-card">
                    <div className="overview-kicker"><Users size={14} /> Equipo</div>
                    <strong>Pronto</strong>
                    <span>Invitaciones y roles granulares</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }} className="overview-main-grid">
                <section className="overview-panel">
                    <div className="overview-panel-head">
                        <h2>Resumen de datos</h2>
                        <button className="btn btn-ghost" style={{ height: 34, padding: '0 12px', fontSize: 12 }} onClick={() => navigate(`/project/${projectId}/editor`)}>
                            <Table2 size={14} /> Abrir editor
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        <div className="overview-row">
                            <div>
                                <strong>Crear tabla</strong>
                                <p>Inicia una tabla nueva desde cero con columnas base.</p>
                            </div>
                            <button className="btn btn-primary" style={{ height: 34, padding: '0 12px', fontSize: 12 }} onClick={() => navigate(`/project/${projectId}/editor`)}>
                                <Plus size={14} /> Nueva tabla
                            </button>
                        </div>
                        <div className="overview-row">
                            <div>
                                <strong>Agregar columnas</strong>
                                <p>Edita tu esquema actual y amplia campos por tabla.</p>
                            </div>
                            <button className="btn btn-ghost" style={{ height: 34, padding: '0 12px', fontSize: 12 }} onClick={() => navigate(`/project/${projectId}/editor`)}>
                                <Database size={14} /> Gestionar schema
                            </button>
                        </div>
                        <div className="overview-row">
                            <div>
                                <strong>Recomendaciones</strong>
                                <p>{tablesCount === 0 ? 'Crea al menos una tabla para comenzar a recolectar datos.' : 'Define indices y llaves primarias para acelerar lecturas.'}</p>
                            </div>
                            <span className="overview-pill">
                                <ShieldCheck size={12} />
                                Buenas practicas
                            </span>
                        </div>
                        <div className="overview-row">
                            <div>
                                <strong>Equipo y permisos</strong>
                                <p>Invita miembros por correo y controla roles del proyecto.</p>
                            </div>
                            <button className="btn btn-ghost" style={{ height: 34, padding: '0 12px', fontSize: 12 }} onClick={() => navigate(`/project/${projectId}/team`)}>
                                <Users size={14} /> Abrir equipo
                            </button>
                        </div>
                    </div>
                </section>

                <section className="overview-panel">
                    <div className="overview-panel-head">
                        <h2>Acciones del proyecto</h2>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <button className="btn btn-ghost action-btn" onClick={pauseOrResume} disabled={busyAction === 'pause' || busyAction === 'resume'}>
                            {project?.status === 'paused' ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
                            {project?.status === 'paused' ? 'Reanudar proyecto' : 'Pausar proyecto'}
                        </button>
                        <button className="btn btn-ghost action-btn" onClick={() => downloadBackup('sql')} disabled={busyAction === 'backup-sql'}>
                            <Download size={15} /> Descargar backup SQL
                        </button>
                        <button className="btn btn-ghost action-btn" onClick={() => downloadBackup('json')} disabled={busyAction === 'backup-json'}>
                            <Download size={15} /> Descargar backup JSON
                        </button>
                        <button className="btn btn-ghost action-btn danger" onClick={deleteProject}>
                            <Trash2 size={15} /> Eliminar proyecto
                        </button>
                    </div>
                </section>
            </div>

            <section className="overview-panel" style={{ marginTop: 14 }}>
                <div className="overview-panel-head">
                    <h2>Roadmap de consola</h2>
                    <span className="overview-pill"><Zap size={12} /> En progreso</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    <div className="overview-mini-card">
                        <strong>Equipo y permisos</strong>
                        <p>Invitar usuarios por email, roles propietario/editor/lector y permisos avanzados.</p>
                    </div>
                    <div className="overview-mini-card">
                        <strong>Uso y consumo</strong>
                        <p>Consultas SQL, realtime, almacenamiento y tendencias de consumo por proyecto.</p>
                    </div>
                    <div className="overview-mini-card">
                        <strong>Backups por tablas</strong>
                        <p>Exportacion selectiva por tabla y restauraciones asistidas.</p>
                    </div>
                    <div className="overview-mini-card">
                        <strong>Alertas de salud</strong>
                        <p>Recomendaciones en vivo para performance, indices y seguridad.</p>
                    </div>
                </div>
            </section>

            <style>{`
                .overview-main-grid {
                    align-items: start;
                }
                .overview-card {
                    border: 1px solid var(--border);
                    background: var(--bg-surface);
                    border-radius: 14px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .overview-card strong {
                    font-size: 24px;
                    letter-spacing: -.5px;
                }
                .overview-card span {
                    color: var(--text-secondary);
                    font-size: 12px;
                    line-height: 1.5;
                }
                .overview-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: .6px;
                    text-transform: uppercase;
                }
                .overview-panel {
                    border: 1px solid var(--border);
                    background: var(--bg-surface);
                    border-radius: 14px;
                    padding: 14px;
                }
                .overview-panel-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .overview-panel-head h2 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 900;
                }
                .overview-row {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }
                .overview-row strong {
                    font-size: 13px;
                }
                .overview-row p {
                    margin: 3px 0 0;
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                .overview-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid var(--border);
                    background: var(--bg-base);
                    border-radius: 999px;
                    padding: 5px 10px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-secondary);
                }
                .action-btn {
                    height: 36px;
                    justify-content: flex-start;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid var(--border);
                    gap: 8px;
                }
                .action-btn.danger {
                    color: var(--danger);
                }
                .overview-mini-card {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 10px;
                    background: var(--bg-base);
                }
                .overview-mini-card strong {
                    font-size: 13px;
                    display: block;
                    margin-bottom: 4px;
                }
                .overview-mini-card p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 12px;
                    line-height: 1.5;
                }
                @media (max-width: 980px) {
                    .overview-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
