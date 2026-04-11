import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_MATUDB_URL || 'http://localhost:3001/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('matudb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('matudb_token');
            localStorage.removeItem('matudb_user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(err);
    }
);

export default api;

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
    recoverUserPassword: (pid: string, uid: string) => api.post(`/projects/${pid}/auth/users/${uid}/recover`),
};

/** Recuperación de usuarios finales del proyecto (sin apikey en el navegador) */
export const projectPublicAuthAPI = {
    forgotPassword: (projectId: string, email: string) =>
        api.post(`/projects/${projectId}/auth/public/forgot-password`, { email }),
    completePasswordReset: (projectId: string, token: string, password: string) =>
        api.post(`/projects/${projectId}/auth/password-reset/complete`, { token, password }),
};

// ── Projects ──────────────────────────────────────────────
export const projectsAPI = {
    list: () => api.get('/projects'),
    create: (data: any) => api.post('/projects', data),
    get: (id: string) => api.get(`/projects/${id}`),
    update: (id: string, data: any) => api.put(`/projects/${id}`, data),
    delete: (id: string) => api.delete(`/projects/${id}`),
};

// ── Tables ────────────────────────────────────────────────
export const tablesAPI = {
    list: (pid: string) => api.get(`/projects/${pid}/tables`),
    create: (pid: string, data: any) => api.post(`/projects/${pid}/tables`, data),
    get: (pid: string, table: string) => api.get(`/projects/${pid}/tables/${table}`),
    drop: (pid: string, table: string) => api.delete(`/projects/${pid}/tables/${table}`),
    addColumn: (pid: string, table: string, data: any) => api.post(`/projects/${pid}/tables/${table}/columns`, data),
    dropColumn: (pid: string, table: string, col: string) => api.delete(`/projects/${pid}/tables/${table}/columns/${col}`),
    getRealtime: (pid: string, table: string) => api.get(`/projects/${pid}/tables/${table}/realtime`),
    setRealtime: (pid: string, table: string, enabled: boolean) => api.post(`/projects/${pid}/tables/${table}/realtime`, { enabled }),
};

// ── Data ──────────────────────────────────────────────────
export const dataAPI = {
    select: (pid: string, table: string, params?: any) => api.get(`/projects/${pid}/data/${table}`, { params }),
    insert: (pid: string, table: string, data: any) => api.post(`/projects/${pid}/data/${table}`, data),
    update: (pid: string, table: string, data: any, filters?: any) => api.put(`/projects/${pid}/data/${table}`, { data, filters }),
    delete: (pid: string, table: string, filters?: any) => api.delete(`/projects/${pid}/data/${table}`, { data: { filters } }),
};

// ── SQL ───────────────────────────────────────────────────
export const sqlAPI = {
    execute: (pid: string, query: string) => api.post(`/projects/${pid}/sql`, { query }),
    getHistory: (pid: string) => api.get(`/projects/${pid}/sql/history`),
};

// ── API Keys ──────────────────────────────────────────────
export const keysAPI = {
    list: (pid: string) => api.get(`/projects/${pid}/keys`),
    regenerate: (pid: string, type: string) => api.post(`/projects/${pid}/keys/regenerate/${type}`),
};

// ── Deploy ──────────────────────────────────────────────
export const deployAPI = {
    listApps: (pid: string) => api.get(`/projects/${pid}/apps`),
    createApp: (pid: string, data: any) => api.post(`/projects/${pid}/apps`, data),
    listDeployments: (appId: string) => api.get(`/apps/${appId}/deployments`),
};

// ── Email Templates ──────────────────────────────────────
export const templatesAPI = {
    list: (pid: string) => api.get(`/projects/${pid}/templates`),
    create: (pid: string, data: any) => api.post(`/projects/${pid}/templates`, data),
    get: (pid: string, id: string) => api.get(`/projects/${pid}/templates/${id}`),
    update: (pid: string, id: string, data: any) => api.put(`/projects/${pid}/templates/${id}`, data),
    delete: (pid: string, id: string) => api.delete(`/projects/${pid}/templates/${id}`),
    send: (pid: string, data: { templateSlug: string, to: string, variables?: any }) => api.post(`/projects/${pid}/templates/send`, data),
};

// ── Automations ───────────────────────────────────────────
export const automationsAPI = {
    list: (pid: string) => api.get(`/projects/${pid}/automations`),
    create: (pid: string, data: any) => api.post(`/projects/${pid}/automations`, data),
    /** Importar flujo desde JSON (exportVersion + nodes_config + edges_config) */
    import: (pid: string, payload: Record<string, unknown>) =>
        api.post(`/projects/${pid}/automations/import`, payload),
    get: (pid: string, id: string) => api.get(`/projects/${pid}/automations/${id}`),
    /** Exportar definición portable (sin id de BD) */
    export: (pid: string, id: string) => api.get(`/projects/${pid}/automations/${id}/export`),
    update: (pid: string, id: string, data: any) => api.put(`/projects/${pid}/automations/${id}`, data),
    delete: (pid: string, id: string) => api.delete(`/projects/${pid}/automations/${id}`),
    triggerWebhook: (pid: string, id: string, data: any) => api.post(`/projects/${pid}/automations/${id}/webhook`, data),
    getTables: (pid: string) => api.get(`/projects/${pid}/automations/helper/tables`),
    getTableColumns: (pid: string, table: string) => api.get(`/projects/${pid}/automations/helper/tables/${table}/columns`),
    getLogs: (pid: string, id: string, params?: { limit?: number }) =>
        api.get(`/projects/${pid}/automations/${id}/logs`, { params }),
};

// ── Robots (testing / suites, import-export JSON) ─────────
export const robotsAPI = {
    list: (pid: string) => api.get(`/projects/${pid}/robots`),
    create: (pid: string, data: Record<string, unknown>) => api.post(`/projects/${pid}/robots`, data),
    validateSuite: (pid: string, body: Record<string, unknown>) => api.post(`/projects/${pid}/robots/validate-suite`, body),
    validateImport: (pid: string, body: Record<string, unknown>) => api.post(`/projects/${pid}/robots/validate-import`, body),
    import: (pid: string, payload: Record<string, unknown>) => api.post(`/projects/${pid}/robots/import`, payload),
    get: (pid: string, id: string) => api.get(`/projects/${pid}/robots/${id}`),
    export: (pid: string, id: string) => api.get(`/projects/${pid}/robots/${id}/export`),
    update: (pid: string, id: string, data: Record<string, unknown>) => api.put(`/projects/${pid}/robots/${id}`, data),
    delete: (pid: string, id: string) => api.delete(`/projects/${pid}/robots/${id}`),
    run: (pid: string, id: string) => api.post(`/projects/${pid}/robots/${id}/run`),
    listRuns: (pid: string, id: string, params?: { limit?: number }) =>
        api.get(`/projects/${pid}/robots/${id}/runs`, { params }),
    getRun: (pid: string, robotId: string, runId: string) =>
        api.get(`/projects/${pid}/robots/${robotId}/runs/${runId}`),
    messages: (pid: string, params?: { limit?: number; channel?: string }) =>
        api.get(`/projects/${pid}/robots/messages`, { params }),
    seedFleet: (pid: string) => api.post(`/projects/${pid}/robots/seed-fleet`),
    runAll: (pid: string) => api.post(`/projects/${pid}/robots/run-all`),
    bulkWorker: (pid: string, body: Record<string, unknown>) => api.post(`/projects/${pid}/robots/bulk-worker`, body),
};

// ── WhatsApp (sesión global del servidor API, JWT) ─────────
export const whatsappAPI = {
    status: () => api.get('/whatsapp/status'),
    logout: () => api.post('/whatsapp/logout'),
    restart: () => api.post('/whatsapp/restart'),
};

// ── Notifications ──────────────────────────────────────────
export const notificationsAPI = {
    getApps: (pid: string) => api.get(`/projects/${pid}/notifications/apps`),
    createApp: (pid: string, data: any) => api.post(`/projects/${pid}/notifications/apps`, data),
    registerToken: (pid: string, data: any) => api.post(`/projects/${pid}/notifications/register`, data),
    send: (pid: string, data: any) => api.post(`/projects/${pid}/notifications/send`, data),
    getLogs: (pid: string, appId: string) => api.get(`/projects/${pid}/notifications/apps/${appId}/logs`),
};
