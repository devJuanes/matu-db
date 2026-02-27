import { useState, useEffect, useCallback, useRef } from 'react';
import { MATUDB_CONFIG } from './config';
import MatriculaAuthModal, { getSession, clearSession } from './MatriculaAuth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '../../lib/matudb';
import logo from '../../assets/logo.png';

import {
    GraduationCap, Plus, RefreshCw, Trash2, X, Search,
    User, Phone, Mail, BookOpen, Hash, CheckCircle, XCircle,
    AlertTriangle, LogIn, LogOut, Camera, ImageOff,
} from 'lucide-react';

const db = createClient({
    url: MATUDB_CONFIG.API_URL,
    projectId: MATUDB_CONFIG.PROJECT_ID,
    apiKey: MATUDB_CONFIG.ANON_KEY
});

/* ── Types ─────────────────────────────────────────────── */
interface Estudiante {
    id: string;
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
    edad: number;
    carrera: string;
    semestre: number;
    activo: boolean;
    foto_url?: string | null;
    created_at: string;
}

const CARRERAS = [
    'Ingeniería en Sistemas',
    'Ingeniería Industrial',
    'Administración de Empresas',
    'Contabilidad y Auditoría',
    'Derecho',
    'Medicina',
    'Psicología',
    'Arquitectura',
    'Diseño Gráfico',
    'Marketing Digital',
];

const EMPTY_FORM = {
    nombre: '', cedula: '', correo: '', telefono: '',
    edad: '', carrera: '', semestre: '1',
};

// Upload a file to MatuDB Storage and return its public URL
const uploadPhoto = async (file: File): Promise<string> => {
    const storageUrl = new URL(
        `${MATUDB_CONFIG.API_URL}/api/projects/${MATUDB_CONFIG.PROJECT_ID}/storage/upload`
    );
    storageUrl.searchParams.set('apikey', MATUDB_CONFIG.ANON_KEY);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(storageUrl.toString(), { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al subir foto');
    return json.data.file.url as string;
};

/* ── API helpers ────────────────────────────────────────── */
const loadStudents = async () => {
    try {
        const rows = await db.from('estudiantes')
            .select('*')
            .order('created_at', false)
            .get();
        return rows || [];
    } catch (err: any) {
        toast.error('Error al cargar estudiantes');
        return [];
    }
};

const createStudent = async (form: typeof EMPTY_FORM, foto_url?: string | null) => {
    return db.from('estudiantes').insert({
        nombre: form.nombre.trim(),
        cedula: form.cedula.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        edad: parseInt(form.edad),
        carrera: form.carrera,
        semestre: parseInt(form.semestre),
        activo: true,
        ...(foto_url ? { foto_url } : {}),
    });
};

const updateStudent = async (id: string, data: any) => {
    return db.from('estudiantes').eq('id', id).update(data);
};

const deleteStudent = async (id: string) => {
    return db.from('estudiantes').eq('id', id).delete();
};

/* ── Form Modal ─────────────────────────────────────────── */
function FormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Máx 5 MB por foto'); return; }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.nombre.trim()) errs.nombre = 'Nombre es requerido';
        if (!form.cedula.trim()) errs.cedula = 'Cédula es requerida';
        if (!form.correo.includes('@')) errs.correo = 'Correo inválido';
        if (!form.edad || parseInt(form.edad) < 16) errs.edad = 'Edad mínima 16 años';
        if (!form.carrera) errs.carrera = 'Selecciona una carrera';
        return errs;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            let foto_url: string | null = null;
            if (photoFile) {
                toast.loading('Subiendo foto...', { id: 'upload' });
                foto_url = await uploadPhoto(photoFile);
                toast.dismiss('upload');
            }
            await createStudent(form, foto_url);
            toast.success(`✅ Estudiante ${form.nombre} matriculado correctamente`);
            onSaved();
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        } finally { setLoading(false); }
    };

    const fields = [
        { key: 'nombre', label: t('matricula.form.fields.name'), placeholder: 'Ej: María García López', icon: User, type: 'text' },
        { key: 'cedula', label: t('matricula.form.fields.id'), placeholder: 'Ej: 001-0000001-0', icon: Hash, type: 'text' },
        { key: 'correo', label: t('matricula.form.fields.email'), placeholder: 'maria@universidad.edu', icon: Mail, type: 'email' },
        { key: 'telefono', label: t('matricula.form.fields.phone'), placeholder: 'Ej: 809-000-0000', icon: Phone, type: 'tel' },
        { key: 'edad', label: t('matricula.form.fields.age'), placeholder: 'Ej: 20', icon: User, type: 'number' },
    ];

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={20} color="var(--brand)" />
                        <span className="modal-title">{t('matricula.form.title')}</span>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>

                <form onSubmit={submit}>
                    <div className="modal-body">
                        {/* Name & ID row */}
                        {fields.slice(0, 2).map(f => (
                            <div className="form-group" key={f.key}>
                                <label className="form-label">{f.label}</label>
                                <div style={{ position: 'relative' }}>
                                    <f.icon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input className="input" type={f.type} placeholder={f.placeholder}
                                        value={(form as any)[f.key]} onChange={set(f.key)}
                                        style={{ paddingLeft: 30 }} />
                                </div>
                                {errors[f.key] && <span className="form-error">{errors[f.key]}</span>}
                            </div>
                        ))}

                        {/* Email & Phone row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {fields.slice(2, 4).map(f => (
                                <div className="form-group" key={f.key}>
                                    <label className="form-label">{f.label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <f.icon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                        <input className="input" type={f.type} placeholder={f.placeholder}
                                            value={(form as any)[f.key]} onChange={set(f.key)}
                                            style={{ paddingLeft: 30 }} />
                                    </div>
                                    {errors[f.key] && <span className="form-error">{errors[f.key]}</span>}
                                </div>
                            ))}
                        </div>

                        {/* Edad & Semestre */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">{t('matricula.form.fields.age')}</label>
                                <input className="input" type="number" min={16} max={80} placeholder="20"
                                    value={form.edad} onChange={set('edad')} />
                                {errors.edad && <span className="form-error">{errors.edad}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('matricula.form.fields.semester')}</label>
                                <select className="select" value={form.semestre} onChange={set('semestre')}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{t('matricula.form.fields.semester_n', { n: i + 1 })}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Carrera */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BookOpen size={12} /> {t('matricula.form.fields.career')}
                            </label>
                            <select className="select" value={form.carrera} onChange={set('carrera')}>
                                <option value="">{t('matricula.form.fields.career_select')}</option>
                                {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.carrera && <span className="form-error">{errors.carrera}</span>}
                        </div>

                        {/* ── Foto del estudiante ── */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Camera size={12} /> {t('matricula.form.fields.photo')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t('matricula.form.fields.photo_optional')}</span>
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                {/* Preview circle */}
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    style={{
                                        width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                                        border: '2px dashed var(--border)', cursor: 'pointer',
                                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: photoPreview ? 'transparent' : 'var(--bg-base)',
                                        transition: 'border-color .2s',
                                    }}
                                    title={t('matricula.form.photo.btn_select')}>
                                    {photoPreview
                                        ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <Camera size={24} color="var(--text-muted)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                    <button type="button" className="btn btn-outline btn-sm" onClick={() => photoInputRef.current?.click()}>
                                        <Camera size={12} />{photoFile ? t('matricula.form.photo.btn_change') : t('matricula.form.photo.btn_select')}
                                    </button>
                                    {photoFile && (
                                        <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 6, color: 'var(--danger)' }} onClick={removePhoto}>
                                            <ImageOff size={12} />{t('matricula.form.photo.remove')}
                                        </button>
                                    )}
                                    {photoFile && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                            {photoFile.name} · {(photoFile.size / 1024).toFixed(0)} KB
                                        </div>
                                    )}
                                    {!photoFile && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t('matricula.form.photo.tip')}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info strip */}
                        <div style={{ padding: '10px 14px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--brand)' }}>
                            {t('matricula.form.info_strip')}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>{t('common.cancel')}</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner spinner-sm" />{t('matricula.form.btn_saving')}</> : <><GraduationCap size={14} />{t('matricula.form.btn_save')}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function MatriculaPage() {
    const { t } = useTranslation();
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [configError] = useState(false);
    const [session, setSession] = useState(getSession);

    const isConfigured = !MATUDB_CONFIG.PROJECT_ID.includes('PASTE');

    const load = useCallback(async () => {
        setLoading(true);
        const data = await loadStudents();
        setEstudiantes(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();

        // Subscribe to real-time updates!
        db.from('estudiantes')
            .on('*', (payload: any) => {
                console.log('🔄 Real-time update received:', payload);
                load(); // Refresh list on any change
            })
            .subscribe();

        // return () => subscription.unsubscribe(); // To be implemented
    }, [load]);

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar a "${nombre}" del sistema?`)) return;
        try {
            await deleteStudent(id);
            toast.success('Estudiante eliminado');
            load();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleToggle = async (id: string, activo: boolean, nombre: string) => {
        try {
            await updateStudent(id, { activo: !activo });
            toast.success(`${nombre} ${activo ? 'desactivado' : 'activado'}`);
        } catch (err: any) { toast.error(err.message); }
    };

    const activos = estudiantes.filter(e => e.activo).length;
    const inactivos = estudiantes.length - activos;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 28px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img src={logo} alt="MatuDB Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{t('matricula.title')}</h1>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('matricula.subtitle')}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {session ? (
                            /* Session active — show user badge + logout */
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>
                                        {(session.name || session.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>{session.name || 'Estudiante'}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{session.email}</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { clearSession(); setSession(null); toast.success('Sesión cerrada'); }}>
                                    <LogOut size={13} />{t('matricula.actions.sign_out')}
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => setShowAuth(true)}>
                                <LogIn size={14} />{t('matricula.actions.sign_in')}
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} />{t('matricula.actions.refresh')}</button>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={!isConfigured}>
                            <Plus size={16} />{t('matricula.actions.new')}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '28px auto', padding: '0 28px' }}>

                {/* Config warning */}
                {!isConfigured && (
                    <div style={{ marginBottom: 24, padding: '16px 20px', background: '#f6a62322', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>{t('matricula.config.warning')}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {t('matricula.config.edit_msg', { file: 'src/modules/matricula/config.ts', placeholder: 'PASTE_YOUR_PROJECT_ID_HERE' })}<br />
                                {t('matricula.config.sql_msg', { file: 'setup.sql' })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                        { label: t('matricula.stats.total'), value: estudiantes.length, color: 'var(--brand)', bg: 'var(--brand-light)' },
                        { label: t('matricula.stats.active'), value: activos, color: 'var(--info)', bg: '#3b82f622' },
                        { label: t('matricula.stats.inactive'), value: inactivos, color: 'var(--text-muted)', bg: 'var(--bg-overlay)' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ borderColor: s.bg !== 'var(--bg-overlay)' ? s.color + '44' : 'var(--border)' }}>
                            <div className="card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
                                </div>
                                <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <GraduationCap size={24} color={s.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: 16, position: 'relative', maxWidth: 380 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" placeholder={t('matricula.search_placeholder')}
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 32 }} />
                </div>

                {/* Table */}
                <div className="card">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                            <span className="spinner" style={{ width: 32, height: 32 }} />
                        </div>
                    ) : configError ? (
                        <div className="empty-state">
                            <AlertTriangle size={40} color="var(--danger)" />
                            <p className="empty-state-title" style={{ color: 'var(--danger)' }}>Error de conexión</p>
                            <p className="empty-state-desc">Verifica que MatuDB esté corriendo y que el PROJECT_ID sea correcto en config.ts</p>
                        </div>
                    ) : estudiantes.length === 0 ? (
                        <div className="empty-state">
                            <GraduationCap size={48} className="empty-state-icon" />
                            <p className="empty-state-title">{search ? t('matricula.results.none') : t('matricula.empty.title')}</p>
                            <p className="empty-state-desc">{search ? t('matricula.results.none_desc') : t('matricula.empty.desc')}</p>
                            {!search && <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14} />{t('matricula.empty.btn_first')}</button>}
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('matricula.table.header.student')}</th>
                                        <th>{t('matricula.table.header.id')}</th>
                                        <th>{t('matricula.table.header.email')}</th>
                                        <th>{t('matricula.table.header.phone')}</th>
                                        <th>{t('matricula.table.header.age')}</th>
                                        <th>{t('matricula.table.header.career')}</th>
                                        <th>{t('matricula.table.header.semester')}</th>
                                        <th>{t('matricula.table.header.status')}</th>
                                        <th>{t('matricula.table.header.registered')}</th>
                                        <th style={{ textAlign: 'right' }}>{t('matricula.table.header.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantes.map(e => (
                                        <tr key={e.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: 'var(--brand-light)', border: '1px solid var(--brand)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'var(--brand)',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {e.foto_url ? (
                                                            <img src={e.foto_url} alt={e.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            e.nombre.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{e.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="mono">{e.cedula}</td>
                                            <td style={{ fontSize: 12 }}>{e.correo}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{e.telefono || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>{e.edad}</td>
                                            <td><span style={{ fontSize: 12 }}>{e.carrera}</span></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge-blue">{e.semestre}°</span>
                                            </td>
                                            <td>
                                                {e.activo
                                                    ? <span className="badge badge-green"><CheckCircle size={10} />{t('matricula.table.status.active')}</span>
                                                    : <span className="badge badge-gray"><XCircle size={10} />{t('matricula.table.status.inactive')}</span>}
                                            </td>
                                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {new Date(e.created_at).toLocaleDateString('es-DO')}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        title={e.activo ? t('matricula.table.status.deactivate') : t('matricula.table.status.activate')}
                                                        style={{ color: e.activo ? 'var(--warning)' : 'var(--brand)' }}
                                                        onClick={() => handleToggle(e.id, e.activo, e.nombre)}>
                                                        {e.activo ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        title={t('matricula.table.actions.delete')}
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--danger)')}
                                                        onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--text-muted)')}
                                                        onClick={() => handleDelete(e.id, e.nombre)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Tabla: <code style={{ background: 'var(--bg-overlay)', padding: '1px 5px', borderRadius: 3 }}>{MATUDB_CONFIG.TABLE}</code> · Proyecto: <code style={{ background: 'var(--bg-overlay)', padding: '1px 5px', borderRadius: 3 }}>{MATUDB_CONFIG.PROJECT_ID.slice(0, 8)}…</code></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Powered by</span>
                        <img src={logo} alt="MatuDB" style={{ width: 14, height: 14 }} />
                        <strong>MatuDB</strong>
                    </div>
                </div>
            </div>

            {showForm && <FormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
            {showAuth && (
                <MatriculaAuthModal
                    onClose={() => setShowAuth(false)}
                    onAuthenticated={s => { setSession(s); setShowAuth(false); }}
                />
            )}
        </div>
    );
}
