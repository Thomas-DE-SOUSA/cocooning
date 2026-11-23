import { createRequire } from 'node:module';
import type * as HocuspocusServer from '@hocuspocus/server' with {
    'resolution-mode': 'import',
};
import type * as Yjs from 'yjs' with { 'resolution-mode': 'import' };

// Both packages ship a CommonJS entry (D31) but only ESM declarations: TypeScript refuses a plain import from this
// CommonJS app (TS1479). They are loaded through their `require` entry and typed by their ESM declarations, here only.
const load = createRequire(__filename);

export const hocuspocusServer = load(
    '@hocuspocus/server',
) as typeof HocuspocusServer;
export const yjs = load('yjs') as typeof Yjs;

export type Hocuspocus<Context> = HocuspocusServer.Hocuspocus<Context>;
export type HookPayloads<Context> = {
    readonly authenticate: HocuspocusServer.onAuthenticatePayload<Context>;
    readonly loadDocument: HocuspocusServer.onLoadDocumentPayload<Context>;
    readonly storeDocument: HocuspocusServer.onStoreDocumentPayload<Context>;
};
