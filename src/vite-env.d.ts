/** Tipos de entorno Vite sin depender de `node_modules/vite` (útil si aún no hay `npm install`). */
interface ImportMetaEnv {
    readonly VITE_MATUDB_URL?: string;
    readonly VITE_MATUDB_DOMAIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.css' {
    const src: string;
    export default src;
}

/** Ruta profunda (el patrón *.css a veces no cubre paquetes con `/` en el nombre). */
declare module '@xyflow/react/dist/style.css' {
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    const src: string;
    export default src;
}
