import type {
    NoteSpace,
    NoteVisibility,
} from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { FolderId } from '../value-objects/folder-id.vo';
import type { NoteId } from '../value-objects/note-id.vo';
import type { NoteList, NoteListSnapshot } from '../value-objects/note-list.vo';
import type { NoteTitle } from '../value-objects/note-title.vo';
import type { FolderPlace } from './folder.aggregate.type';

export type NoteProps = {
    readonly id: NoteId;
    readonly coupleId: string;
    readonly ownerId: string;
    title: NoteTitle;
    visibility: NoteVisibility;
    folderId: FolderId | null;
    list: NoteList | null;
    readonly openItemCount: number;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateNoteInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: NoteTitle;
    readonly space: NoteSpace;
    readonly folder: FolderPlace | null;
};

// R26, R27: a list is created at the root of its space, never in a folder.
export type CreateNoteListInput = Omit<CreateNoteInput, 'folder'> & {
    readonly list: NoteList;
};

export type NoteSnapshot = NoteListSnapshot & {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly visibility: NoteVisibility;
    readonly folderId: string | null;
    readonly openItemCount: number;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
