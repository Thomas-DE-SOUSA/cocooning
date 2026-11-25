import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../models/folder.aggregate';
import type { FolderPathItem } from '../models/folder-path-item';
import type { NoteSpaceCounts } from '../models/note-space';

// Visibility is filtered by the query, never in memory (core-backend.md rule 12): another partner's private folder is not found (R14).
export abstract class FolderRepository {
    abstract save(folder: Folder): Promise<void>;
    abstract findVisibleById(
        coupleId: string,
        userId: string,
        folderId: string,
    ): Promise<Folder | null>;
    // The folders right under a folder, or at the root of a space when parentFolderId is null, by name.
    abstract findVisibleChildren(
        coupleId: string,
        userId: string,
        space: NoteSpace,
        parentFolderId: string | null,
    ): Promise<ReadonlyArray<Folder>>;
    // One query from the root of the space down to the folder itself; empty for the root (null).
    // The caller has loaded the folder as visible: its ancestors share its space and owner (R15).
    abstract findPath(
        coupleId: string,
        folderId: string | null,
    ): Promise<ReadonlyArray<FolderPathItem>>;
    // The number of folders right under each folder given, by folder id, in one grouped query.
    abstract countVisibleChildren(
        coupleId: string,
        userId: string,
        folders: ReadonlyArray<Folder>,
    ): Promise<ReadonlyMap<string, number>>;
    abstract countVisibleBySpace(
        coupleId: string,
        userId: string,
    ): Promise<NoteSpaceCounts>;
    // R16: the folders and notes of a deleted folder move up to its parent, one statement each, in the open unit of work.
    abstract moveContentUp(folder: Folder): Promise<void>;
}
