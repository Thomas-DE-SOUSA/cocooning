import type { Doc } from 'yjs';
import {
    type ListDocumentEvents,
    type NoteDocumentEvents,
    NoteDocumentGateway,
} from '../ports/note-document.gateway';

type Connection = {
    readonly noteId: string;
    readonly document: Doc;
    readonly events: NoteDocumentEvents;
    readonly listEvents: ListDocumentEvents | null;
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
        listEvents: ListDocumentEvents | null,
    ): () => void {
        const connection: Connection = { noteId, document, events, listEvents };
        this.connections.push(connection);
        return () => {
            this.closed.add(connection);
        };
    }
}
