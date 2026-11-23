import type { Note } from '../models/note.aggregate';

// Visibility is filtered by the query, never in memory (core-backend.md rule 12): another partner's private note is not found (R4).
export abstract class NoteRepository {
    abstract save(note: Note): Promise<void>;
    abstract findVisibleById(
        coupleId: string,
        userId: string,
        noteId: string,
    ): Promise<Note | null>;
    // Most recently changed first.
    abstract findVisible(coupleId: string, userId: string): Promise<Note[]>;
}
