import type { Doc } from 'yjs';

export type NoteDocumentEvents = {
    // R4, R5: the API no longer lets this partner open the note.
    readonly onRefused: () => void;
    // The API closed the note for every editor (made private, deleted, API stopping): it must be opened again.
    readonly onClosedByServer: () => void;
};

// What the page of a list follows on top of the document: its first sync, before which no line is known.
export type ListDocumentEvents = {
    readonly onSynced: () => void;
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
