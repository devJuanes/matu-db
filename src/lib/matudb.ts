/**
 * MatuDB Client — re-exported from @matudb/client
 *
 * This file provides the client for the MatuDB platform's own front-end.
 * For external apps, install the package directly:
 *   npm install @matudb/client
 */

export { createClient, MatuDBClient } from '@devjuanes/matuclient';
export type {
    MatuDBConfig,
    QueryResult,
    MatuDBError,
    AuthUser,
    AuthSession,
    AuthResult,
    AuthChangeEvent,
    AuthStateChangeCallback,
    RealtimeEvent,
    RealtimePayload,
    StorageFile,
    StorageResult,
} from '@devjuanes/matuclient';
