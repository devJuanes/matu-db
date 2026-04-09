/** Tipos de entorno Vite sin depender de `node_modules/vite` (útil si aún no hay `npm install`). */
interface ImportMetaEnv {
    readonly VITE_MATUDB_URL?: string;
    readonly VITE_MATUDB_DOMAIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
