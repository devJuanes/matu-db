/**
 * MatuDB Matrícula Module — Configuration
 *
 * 1. Open your MatuDB dashboard
 * 2. Click on your project
 * 3. Copy the Project ID from the URL:  /project/THIS-IS-THE-ID/editor
 * 4. Paste it below as PROJECT_ID
 */

export const MATUDB_CONFIG = {
    /** Your MatuDB API base URL */
    API_URL: 'http://localhost:3001',

    /** Paste your Project ID from the dashboard URL */
    PROJECT_ID: '5c6889ac-7d0a-40ea-b577-8e7eedfa31ff',

    /** Anon key (safe for client-side) */
    ANON_KEY: 'mb_51ecbfc725a41bddf80f11ff6f1f71822c61b038c22f6366af6f3c05b5594ff2',

    /** Table name used in this module */
    TABLE: 'estudiantes',
};

/** Build the base URL for a table operation */
export const tableUrl = (table = MATUDB_CONFIG.TABLE) =>
    `${MATUDB_CONFIG.API_URL}/api/projects/${MATUDB_CONFIG.PROJECT_ID}/data/${table}`;

/** Build a URL for project-level auth endpoints */
export const authUrl = (endpoint: string) =>
    `${MATUDB_CONFIG.API_URL}/api/projects/${MATUDB_CONFIG.PROJECT_ID}/auth/${endpoint}`;

/** Default headers using anon key */
export const defaultHeaders = () => ({
    'Content-Type': 'application/json',
    apikey: MATUDB_CONFIG.ANON_KEY,
});
