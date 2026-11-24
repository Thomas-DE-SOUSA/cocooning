import { createRequire } from 'node:module';
import type * as Provider from '@hocuspocus/provider' with {
    'resolution-mode': 'import',
};
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { WebSocket } from 'ws';
import type * as Yjs from 'yjs' with { 'resolution-mode': 'import' };

// Same reason as src/modules/notes/esm-packages.ts: CommonJS entries, ESM declarations only.
const load = createRequire(__filename);
const { HocuspocusProvider, HocuspocusProviderWebsocket } = load(
    '@hocuspocus/provider',
) as typeof Provider;
const yjs = load('yjs') as typeof Yjs;

const TEXT = 'probe';

export type Editor = {
    readonly text: () => string;
    readonly write: (text: string) => void;
    readonly closedByServer: Promise<void>;
    readonly close: () => void;
};

// A browser sends the cookie of the PWA's origin with the handshake; in Node, the WebSocket adds it itself.
const withCookie = (sessionToken: string | null) =>
    class extends WebSocket {
        constructor(url: string, protocols?: string | string[]) {
            super(url, protocols, {
                headers:
                    sessionToken === null
                        ? {}
                        : { cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
            });
        }
    };

// Resolves once synced, or rejects when the server refuses the connection (R4).
export function openEditor(
    url: string,
    noteId: string,
    sessionToken: string | null,
): Promise<Editor> {
    const document = new yjs.Doc();
    return new Promise((resolve, reject) => {
        let markClosed: () => void = () => undefined;
        const closedByServer = new Promise<void>((settle) => {
            markClosed = settle;
        });
        const provider = new HocuspocusProvider({
            websocketProvider: new HocuspocusProviderWebsocket({
                url,
                WebSocketPolyfill: withCookie(sessionToken),
            }),
            name: noteId,
            document,
            token: 'session-cookie',
            onSynced: () =>
                resolve({
                    text: () => document.getText(TEXT).toJSON(),
                    write: (text) => document.getText(TEXT).insert(0, text),
                    closedByServer,
                    close: () => {
                        provider.destroy();
                        provider.configuration.websocketProvider.destroy();
                    },
                }),
            onClose: () => markClosed(),
            onAuthenticationFailed: () => {
                provider.destroy();
                provider.configuration.websocketProvider.destroy();
                reject(new Error('Connection refused'));
            },
        });
        // A provider given its own websocket does not attach to it by itself.
        provider.attach();
    });
}
