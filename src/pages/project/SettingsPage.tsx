import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, keysAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Save, Trash2, AlertTriangle, Key, Eye, EyeOff, Copy, Code } from 'lucide-react';

export default function SettingsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project, setProject } = useOutletContext<any>();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: project?.name || '', description: project?.description || '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [keys, setKeys] = useState<{ anon_key?: string; service_role_key?: string }>({});
    const [showKey, setShowKey] = useState<'anon' | 'service' | null>(null);
    const [codeTab, setCodeTab] = useState<'upload' | 'list' | 'delete'>('upload');

    useEffect(() => {
        keysAPI.list(projectId!).then(r => setKeys(r.data.data || {})).catch(() => { });
    }, [projectId]);

    const BASE = `http://localhost:3001/api/projects/${projectId}`;
    const copy = (text: string, label = 'Copiado') => { navigator.clipboard.writeText(text); toast.success(label); };

    const saveChanges = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const res = await projectsAPI.update(projectId!, form);
            setProject(res.data.data.project);
            toast.success('Project updated');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setSaving(false); }
    };

    const deleteProject = async () => {
        const confirm1 = prompt(`Type "${project.name}" to confirm deletion:`);
        if (confirm1 !== project.name) { toast.error('Name did not match — deletion cancelled'); return; }
        setDeleting(true);
        try {
            await projectsAPI.delete(projectId!);
            toast.success('Project deleted');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Delete failed');
            setDeleting(false);
        }
    };

    return (
        <div style={{ padding: 28, maxWidth: 640 }}>
            <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your project configuration</p>
                </div>
            </div>

            {/* General settings */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header"><span className="card-title">General</span></div>
                <div className="card-body">
                    <form onSubmit={saveChanges} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Project name</label>
                            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner spinner-sm" />Saving…</> : <><Save size={14} />Save changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Project info */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header"><span className="card-title">Project Info</span></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { label: 'Project ID', value: project?.id },
                        { label: 'Schema Name', value: project?.schema_name },
                        { label: 'Region', value: project?.region },
                        { label: 'Created', value: project?.created_at ? new Date(project.created_at).toLocaleString() : '–' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                            <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{value}</code>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── API Credentials ── */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Key size={14} color="var(--brand)" />Credenciales de API · Storage
                    </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Usa estas credenciales para subir archivos vía API desde tu código.
                        El campo del header es <code>apikey</code>.
                    </div>

                    {/* Endpoint */}
                    {[{ label: 'Endpoint de Storage', val: `${BASE}/storage/upload` },
                    { label: 'Anon Key (cliente)', val: keys.anon_key || '—' },
                    { label: 'Service Role Key (servidor)', val: keys.service_role_key || '—' },
                    ].map(({ label, val }, i) => {
                        const keyId = i === 1 ? 'anon' : i === 2 ? 'service' : null;
                        const isKey = keyId !== null;
                        const shown = showKey === keyId;
                        const display = isKey && !shown && val !== '—'
                            ? val.slice(0, 14) + '•'.repeat(18)
                            : val;
                        return (
                            <div key={label}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <code style={{ flex: 1, fontSize: 12, padding: '7px 10px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {display}
                                    </code>
                                    {isKey && (
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowKey(shown ? null : keyId as any)}>
                                            {shown ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copy(val, 'Copiado!')}>
                                        <Copy size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Code snippet */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}><Code size={12} />Snippet</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {(['upload', 'list', 'delete'] as const).map(t => (
                                    <button key={t} className={`btn btn-sm ${codeTab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCodeTab(t)}>
                                        {t === 'upload' ? 'Subir' : t === 'list' ? 'Listar' : 'Eliminar'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                onClick={() => copy(codeTab === 'upload'
                                    ? `const form = new FormData();\nform.append('file', yourFile);\n\nconst res = await fetch('${BASE}/storage/upload', {\n  method: 'POST',\n  headers: { apikey: '${keys.anon_key || '<anon-key>'}' },\n  body: form,\n});\nconst { data } = await res.json();\nconsole.log(data.file.url);`
                                    : codeTab === 'list'
                                        ? `const res = await fetch('${BASE}/storage', {\n  headers: { apikey: '${keys.anon_key || '<anon-key>'}' },\n});\nconst { data } = await res.json();\nconsole.log(data.files);`
                                        : `await fetch('${BASE}/storage/<filename>', {\n  method: 'DELETE',\n  headers: { apikey: '${keys.service_role_key || '<service-key>'}' },\n});`, 'Código copiado')}>
                                <Copy size={11} />Copiar
                            </button>
                            <pre style={{ margin: 0, padding: '12px 14px', paddingRight: 70, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflowX: 'auto', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                                {codeTab === 'upload'
                                    ? `const form = new FormData();
form.append('file', yourFile);

const res = await fetch('${BASE}/storage/upload', {
  method: 'POST',
  headers: { apikey: '${keys.anon_key || '<anon-key>'}' },
  body: form,
});
const { data } = await res.json();
console.log(data.file.url);`
                                    : codeTab === 'list'
                                        ? `const res = await fetch('${BASE}/storage', {
  headers: { apikey: '${keys.anon_key || '<anon-key>'}' },
});
const { data } = await res.json();
console.log(data.files);`
                                        : `await fetch('${BASE}/storage/<filename>', {
  method: 'DELETE',
  headers: { apikey: '${keys.service_role_key || '<service-key>'}' },
});`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ borderColor: 'var(--danger)' }}>
                <div className="card-header" style={{ borderColor: 'var(--danger)' }}>
                    <span className="card-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={16} /> Danger Zone
                    </span>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Delete this project</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Permanently deletes the project, all tables, and all data. Cannot be undone.
                            </div>
                        </div>
                        <button className="btn btn-danger" style={{ flexShrink: 0 }} onClick={deleteProject} disabled={deleting}>
                            {deleting ? <><span className="spinner spinner-sm" />Deleting…</> : <><Trash2 size={14} />Delete project</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
