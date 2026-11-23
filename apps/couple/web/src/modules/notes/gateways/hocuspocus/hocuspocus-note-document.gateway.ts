import { HocuspocusProvider } from '@hocuspocus/provider';
import type { Doc } from 'yjs';
import {
    type NoteDocumentEvents,
    NoteDocumentGateway,
} from '../ports/note-document.gateway';

// The API reads the session cookie sent with the handshake; Hocuspocus only asks for authentication when a token is set.
const COOKIE_SESSION = 'session-cookie';

// A CLOSE message of the server: the socket stays open, but the provider never reopens the document by itself.
const CLOSED_BY_SERVER = 1000;

export class HocuspocusNoteDocumentGateway extends NoteDocumentGateway {
    constructor(private readonly collaborationUrl: string) {
        super();
    }

    override connect(
        noteId: string,
        document: Doc,
        events: NoteDocumentEvents,
    ): () => void {
        const provider = new HocuspocusProvider({
            url: this.collaborationUrl,
            name: noteId,
            document,
            token: COOKIE_SESSION,
            onAuthenticationFailed: events.onRefused,
            onClose: ({ event }) => {
                if (event.code === CLOSED_BY_SERVER) events.onClosedByServer();
            },
        });
        return () => provider.destroy();
    }
}
