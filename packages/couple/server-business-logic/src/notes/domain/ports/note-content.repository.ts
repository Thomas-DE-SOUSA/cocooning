import type { NoteDocument } from '../models/note-document';

// The Yjs state of a note's content (decision 0040), apart from the aggregate: the real-time channel writes it often.
export abstract class NoteContentRepository {
    abstract findContent(
        coupleId: string,
        noteId: string,
    ): Promise<Uint8Array | null>;
    // A deleted note keeps no content: the write is skipped, not refused, since the channel may store after the deletion.
    // R28: the count of unchecked items is written with the state, never by the save of the aggregate.
    abstract saveContent(
        coupleId: string,
        noteId: string,
        document: NoteDocument,
        now: Date,
    ): Promise<void>;
}
