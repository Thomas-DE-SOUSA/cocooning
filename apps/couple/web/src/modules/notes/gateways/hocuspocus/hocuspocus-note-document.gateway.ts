import { HocuspocusProvider } from '@hocuspocus/provider';
import type { Doc } from 'yjs';
import {
    type ListDocumentEvents,
    type NoteDocumentEvents,
    NoteDocumentGateway,
} from '../ports/note-document.gateway';
import { isPartnerPresent, VIEWER_FIELD } from './partner-presence';

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
        listEvents: ListDocumentEvents | null,
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
            onSynced: ({ state }) => {
                if (state) listEvents?.onSynced();
            },
            onAwarenessChange: ({ states }) => {
                if (listEvents === null) return;
                listEvents.onPartnerPresence(
                    isPartnerPresent(states, listEvents.viewerId),
                );
            },
        });
        if (listEvents !== null) {
            provider.setAwarenessField(VIEWER_FIELD, listEvents.viewerId);
        }
        return () => provider.destroy();
    }
}
