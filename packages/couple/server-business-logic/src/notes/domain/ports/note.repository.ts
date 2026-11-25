import type {
    OffsetPage,
    OffsetPaginationParams,
} from '@cocooning/shared-kernel/domain';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../models/folder.aggregate';
import type { Note } from '../models/note.aggregate';
import type { NoteSpaceCounts } from '../models/note-space';

// Visibility is filtered by the query, never in memory (core-backend.md rule 12): another partner's private note is not found (R4).
export abstract class NoteRepository {
    abstract save(note: Note): Promise<void>;
    abstract findVisibleById(
        coupleId: string,
        userId: string,
        noteId: string,
    ): Promise<Note | null>;
    // Most recently changed first, one offset page (decision 0025).
    abstract findVisible(
        coupleId: string,
        userId: string,
        pagination: OffsetPaginationParams,
    ): Promise<OffsetPage<Note>>;
    // The notes right in a folder, or at the root of a space when folderId is null, most recently changed first.
    abstract findVisibleIn(
        coupleId: string,
        userId: string,
        space: NoteSpace,
        folderId: string | null,
    ): Promise<ReadonlyArray<Note>>;
    // The number of notes right in each folder given, by folder id, in one grouped query.
    abstract countVisibleByFolder(
        coupleId: string,
        userId: string,
        folders: ReadonlyArray<Folder>,
    ): Promise<ReadonlyMap<string, number>>;
    abstract countVisibleBySpace(
        coupleId: string,
        userId: string,
    ): Promise<NoteSpaceCounts>;
}
