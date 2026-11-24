import type { Doc } from 'yjs';
import {
    type NoteDocumentEvents,
    NoteDocumentGateway,
} from '../ports/note-document.gateway';

type Connection = {
    readonly noteId: string;
    readonly document: Doc;
    readonly events: NoteDocumentEvents;
};

// Records each connection; the spec plays the server through the events of the last one.
export class FakeNoteDocumentGateway extends NoteDocumentGateway {
    private readonly connections: Connection[] = [];
    private readonly closed = new Set<Connection>();

    get openConnections(): number {
        return this.connections.length - this.closed.size;
    }

    get connectionCount(): number {
        return this.connections.length;
    }

    lastConnection(): Connection {
        const connection = this.connections.at(-1);
        if (connection === undefined) throw new Error('No connection yet');
        return connection;
    }

    override connect(
        noteId: string,
        document: Doc,
        events: NoteDocumentEvents,
    ): () => void {
        const connection: Connection = { noteId, document, events };
        this.connections.push(connection);
        return () => {
            this.closed.add(connection);
        };
    }
}
