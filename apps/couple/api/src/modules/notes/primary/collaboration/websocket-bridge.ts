import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { type RawData, WebSocketServer } from 'ws';
import type { Hocuspocus } from '../../esm-packages';

const LOCAL_ORIGIN = 'http://localhost';

const toFetchRequest = (request: IncomingMessage): Request => {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
        if (typeof value === 'string') headers.set(name, value);
    }
    return new Request(new URL(request.url ?? '/', LOCAL_ORIGIN), { headers });
};

const toBytes = (data: RawData): Uint8Array =>
    Array.isArray(data)
        ? new Uint8Array(Buffer.concat(data))
        : new Uint8Array(data as ArrayBuffer);

// What Hocuspocus's own Server does with crossws, written with ws: crossws is ESM only (D31).
export function bridgeWebSockets<Context>(
    httpServer: Server,
    path: string,
    hocuspocus: Hocuspocus<Context>,
): WebSocketServer {
    const sockets = new WebSocketServer({ noServer: true });
    httpServer.on(
        'upgrade',
        (request: IncomingMessage, socket: Duplex, head: Buffer) => {
            if (new URL(request.url ?? '/', LOCAL_ORIGIN).pathname !== path)
                return;
            sockets.handleUpgrade(request, socket, head, (websocket) => {
                const connection = hocuspocus.handleConnection(
                    websocket,
                    toFetchRequest(request),
                );
                websocket.on('message', (data) =>
                    connection.handleMessage(toBytes(data)),
                );
                websocket.on('close', (code, reason) =>
                    connection.handleClose({ code, reason: reason.toString() }),
                );
                websocket.on('pong', () => connection.touch());
            });
        },
    );
    return sockets;
}
