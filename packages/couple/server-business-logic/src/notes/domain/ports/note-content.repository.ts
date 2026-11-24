// The Yjs state of a note's content (decision 0040), apart from the aggregate: the real-time channel writes it often.
export abstract class NoteContentRepository {
    abstract findContent(
        coupleId: string,
        noteId: string,
    ): Promise<Uint8Array | null>;
    // A deleted note keeps no content: the write is skipped, not refused, since the channel may store after the deletion.
    abstract saveContent(
        coupleId: string,
        noteId: string,
        content: Uint8Array,
        now: Date,
    ): Promise<void>;
}
