/** Metadatos de columna devueltos por la API (information_schema + is_primary_key). */
export type TableColumnMeta = {
    name: string;
    type: string;
    character_maximum_length?: number | null;
    is_nullable?: string | boolean;
    column_default?: string | null;
    is_primary_key?: boolean;
};

export function getPkColumnNames(columns: TableColumnMeta[]): string[] {
    const pks = columns.filter((c) => c.is_primary_key).map((c) => c.name);
    if (pks.length > 0) return pks;
    const idCol = columns.find((c) => c.name === 'id');
    return idCol ? ['id'] : [];
}

export function getRowKey(row: Record<string, unknown>, pkNames: string[]): string {
    return pkNames.map((k) => String(row[k] ?? '')).join('\u0001');
}

export function rowKeyToFilters(
    row: Record<string, unknown>,
    pkNames: string[],
): Record<string, unknown> | null {
    const f: Record<string, unknown> = {};
    for (const k of pkNames) {
        if (row[k] === undefined || row[k] === null) return null;
        f[k] = row[k];
    }
    return f;
}

function sqlStringLiteral(v: unknown): string {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `'${s.replace(/'/g, "''")}'`;
}

/** Tipo SQL legible para CREATE TABLE (PostgreSQL). */
export function formatPgType(col: TableColumnMeta): string {
    const t = (col.type || '').toLowerCase();
    const len = col.character_maximum_length;
    if ((t === 'character varying' || t === 'varchar') && len) return `varchar(${len})`;
    return col.type;
}

export function buildCreateTableSql(schemaTableName: string, columns: TableColumnMeta[]): string {
    const pkCols = columns.filter((c) => c.is_primary_key).map((c) => c.name);
    const lines = columns.map((c) => {
        const parts: string[] = [`  "${c.name}" ${formatPgType(c)}`];
        const notNull = c.is_nullable === 'NO' || c.is_nullable === false;
        if (notNull) parts.push('NOT NULL');
        if (c.column_default != null && String(c.column_default).trim() !== '') {
            parts.push(`DEFAULT ${c.column_default}`);
        }
        if (pkCols.length === 1 && c.is_primary_key) parts.push('PRIMARY KEY');
        return parts.join(' ');
    });
    if (pkCols.length > 1) {
        lines.push(`  PRIMARY KEY (${pkCols.map((n) => `"${n}"`).join(', ')})`);
    }
    return `CREATE TABLE IF NOT EXISTS "${schemaTableName}" (\n${lines.join(',\n')}\n);`;
}

/** INSERT de una sola columna con los valores de las filas dadas (página actual o selección). */
export function buildColumnDataSql(
    tableName: string,
    columnName: string,
    rows: Record<string, unknown>[],
): string {
    if (!rows.length) return `-- Sin filas para exportar\n`;
    const vals = rows.map((r) => `(${sqlStringLiteral(r[columnName])})`).join(',\n');
    return `-- Columna "${columnName}" de "${tableName}"\nINSERT INTO "${tableName}" ("${columnName}") VALUES\n${vals};\n`;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
