import type { Doc } from 'yjs';

export type NoteDocumentEvents = {
    // R4, R5: the API no longer lets this partner open the note.
    readonly onRefused: () => void;
    // The API closed the note for every editor (made private, deleted, API stopping): it must be opened again.
    readonly onClosedByServer: () => void;
};

// What the page of a list follows on top of the document: its first sync, before which no line is known, and whether
// the other partner has the same list open (R32), told apart by the viewerId each phone shares.
export type ListDocumentEvents = {
    readonly viewerId: string;
    readonly onSynced: () => void;
    readonly onPartnerPresence: (isPresent: boolean) => void;
};

// The real-time channel of a note (decision 0040): keeps the document in sync until the returned function is called.
export abstract class NoteDocumentGateway {
    abstract connect(
        noteId: string,
        document: Doc,
        events: NoteDocumentEvents,
        listEvents: ListDocumentEvents | null,
    ): () => void;
}
