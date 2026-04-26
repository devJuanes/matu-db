import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../lib/api';
import { Mail, Shield, UserPlus, XCircle } from 'lucide-react';

type ProjectContext = {
    project: any;
};

type Member = {
    id: string;
    email: string;
    full_name?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'active' | 'disabled';
};

type Invitation = {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    status: 'pending';
    created_at: string;
};

export default function ProjectTeamPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project } = useOutletContext<ProjectContext>();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
    const [sending, setSending] = useState(false);
    const [currentRole, setCurrentRole] = useState<string>('viewer');

    const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

    const loadTeam = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await projectsAPI.getTeam(projectId);
            setMembers(res.data.data.members || []);
            setInvitations(res.data.data.invitations || []);
            setCurrentRole(res.data.data.current_role || 'viewer');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo cargar el equipo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, [projectId]);

    const invite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        setSending(true);
        try {
            await projectsAPI.inviteMember(projectId, { email, role });
            toast.success('Invitacion enviada');
            setEmail('');
            setRole('viewer');
            await loadTeam();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo enviar la invitacion');
        } finally {
            setSending(false);
        }
    };

    const cancelInvitation = async (invitationId: string) => {
        if (!projectId) return;
        try {
            await projectsAPI.cancelInvitation(projectId, invitationId);
            toast.success('Invitacion cancelada');
            await loadTeam();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo cancelar la invitacion');
        }
    };

    return (
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 28px' }}>
            <div style={{ marginBottom: 18 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>Equipo</h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                    Gestiona miembros del proyecto `{project?.name}` con roles y permisos.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }} className="team-grid">
                <section className="team-panel">
                    <div className="team-head">
                        <h2><Shield size={16} /> Miembros</h2>
                        <span>{members.length}</span>
                    </div>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Cargando...</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                            {members.map((m) => (
                                <div key={m.id} className="team-row">
                                    <div>
                                        <strong>{m.full_name || m.email.split('@')[0]}</strong>
                                        <p>{m.email}</p>
                                    </div>
                                    <span className="team-role">{m.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="team-panel">
                    <div className="team-head">
                        <h2><UserPlus size={16} /> Invitar usuario</h2>
                    </div>
                    {!canManageTeam ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            Solo `owner` y `admin` pueden invitar personas.
                        </p>
                    ) : (
                        <form onSubmit={invite} style={{ display: 'grid', gap: 10 }}>
                            <input
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@empresa.com"
                                style={{ height: 38 }}
                                required
                                type="email"
                            />
                            <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)} style={{ height: 38, padding: '0 10px' }}>
                                <option value="viewer">Viewer (solo lectura)</option>
                                <option value="editor">Editor (crear/editar)</option>
                                <option value="admin">Admin (gestiona equipo)</option>
                            </select>
                            <button className="btn btn-primary" style={{ height: 38, fontSize: 12, fontWeight: 800 }} disabled={sending}>
                                <Mail size={14} /> {sending ? 'Enviando...' : 'Enviar invitacion'}
                            </button>
                        </form>
                    )}
                </section>
            </div>

            <section className="team-panel" style={{ marginTop: 14 }}>
                <div className="team-head">
                    <h2><Mail size={16} /> Invitaciones pendientes</h2>
                    <span>{invitations.length}</span>
                </div>
                {invitations.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>No hay invitaciones pendientes.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                        {invitations.map((inv) => (
                            <div key={inv.id} className="team-row">
                                <div>
                                    <strong>{inv.email}</strong>
                                    <p>Rol: {inv.role}</p>
                                </div>
                                {canManageTeam && (
                                    <button className="btn btn-ghost" style={{ height: 32, fontSize: 12, color: 'var(--danger)', border: '1px solid var(--border)' }} onClick={() => cancelInvitation(inv.id)}>
                                        <XCircle size={14} /> Cancelar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <style>{`
                .team-grid {
                    align-items: start;
                }
                .team-panel {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 14px;
                }
                .team-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .team-head h2 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 900;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .team-head span {
                    border: 1px solid var(--border);
                    background: var(--bg-base);
                    border-radius: 999px;
                    padding: 3px 8px;
                    font-size: 11px;
                    font-weight: 800;
                }
                .team-row {
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .team-row strong {
                    font-size: 13px;
                }
                .team-row p {
                    margin: 3px 0 0;
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                .team-role {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .6px;
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                    border-radius: 999px;
                    background: var(--bg-base);
                    padding: 5px 8px;
                }
                @media (max-width: 980px) {
                    .team-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
